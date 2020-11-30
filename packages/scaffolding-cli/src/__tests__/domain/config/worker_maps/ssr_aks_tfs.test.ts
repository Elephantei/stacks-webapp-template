/* eslint-disable no-unused-expressions */
import { BuildReplaceInput } from "../../../../domain/config/file_mapper"
import { BusinessSection, CloudSection, NetworkingSection, SourceControlSection, TerraformSection } from "../../../../domain/model/prompt_answer"
import { ssr } from '../../../../domain/config/worker_maps'
import conf from  '../../../../domain/config/static.config.json'
import { Static, FolderMap } from '../../../../domain/model/config';

const staticConf: Static = conf as Static;

const projName = "test-app-1"

const biz = {
    company: "test",
    project: "test2",
    component: "test3",
    domain: "domain"
} as BusinessSection

const network = {
    baseDomain: "test.me.com"
} as NetworkingSection

const cloud = {
    region: "uksouth",
    resourceGroup: "my-rg"
} as CloudSection

const sourceControl = {
    repoName: "foo-git"
} as SourceControlSection

const terraform = {
    backendStorage: "azureBlob"
} as TerraformSection

const files: Array<BuildReplaceInput> = [
     {
        files: ["**/*.md"],
        values: {
            "project_type": "Server side rendered web application",
            "project_docs_url": "https://stacks.amido.com/docs/workloads/azure/frontend/SSR/getting_started_ssr"
        }
    },
    {
        files: ["**/package.json"],
        values: {
            "project_name": projName
        }
    },
    {
        files: ["**/app-pipeline.yml"],
        values: {
            "domain: node": `domain: ${biz?.domain}`,
            "component: \\$\\(pipeline_variable_component\\)": `component: webapp`,
            "src/ssr": "src",
            "self_generic_name: stacks-api": "self_generic_name: $(project)-$(domain)",
            "docker_image_name: \\$\\(component\\)": "docker_image_name: $(self_generic_name)",
            "amido-stacks-webapp": "%REPLACE_ME_FOR_APP_SPECIFIC_LIBRARY_VARIABLES%",
            "tf_state_key: stacks-webapp": `tf_state_key: "${biz.project}-${biz.domain}"`,
            "deploy/azure/app/kube": "deploy/azure/app",
            "terraform_state_workspace: dev-\\$\\(component\\)": "terraform_state_workspace: dev",
            "docker_container_registry_name: amidostacksnonprodeuncore": "docker_container_registry_name: %REPLACE_ME_FOR_CONTAINER_REGISTRY%",
            "amido-stacks-nonprod-eun-core": "%REPLACE_ME_FOR_CLOUD_RESOURCE_NAME%",
            "dev-\\$\\(component\\)": "dev-webapp",
            "https://dev-\\$\\(pipeline_variable_api\\).nonprod.amidostacks.com/api/menu": "$(MENU_API_URL)",
            "nonprod.amidostacks.com": `${network.baseDomain}`,
            "region: northeurope": `region: ${cloud.region}`,
        }
    }
]

describe("ssr mapper tests", () => {
    it("to_folders return an array of objects", () => {
        const test: Array<FolderMap> = staticConf.ssr.folderMap
        expect(test.length).toBe(9)
    })
    it("in_files return an array of objects and cloud should be default", () => {
        const test: Array<BuildReplaceInput> = ssr.inFiles({ projectName: projName, businessObj: biz, networkObj: network, cloudObj: cloud, scmObj: sourceControl, terraformObj: terraform})
        expect(test).toStrictEqual(files)
    })
})
