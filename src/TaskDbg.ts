import tl = require('azure-pipelines-task-lib/task');
import tlr = require('azure-pipelines-task-lib/toolrunner');
import {StartTask} from './StartTask';
import {EndTask} from "./EndTask";
import {BaseTask} from "./BaseTask";
import {LogUtils} from "./LogUtils";

let testTask = {};
let input = new Map();
let sysVar = new Map();

input.set('OctaneServiceConnection', 'Octane');
input.set('RepositoryConnection', 'gitHub');
input.set('GithubRepositoryConnection', 'gitHub');
input.set('WorkspaceList', '1002');



sysVar.set('System.TeamFoundationCollectionUri', 'http://ILlokshin02.microfocus.com:8585/DefaultCollection/');
// sysVar.set('System.TeamFoundationCollectionUri', 'http://myd-hvm05777.swinfra.net/MyTest/');
sysVar.set('System.TeamProjectId', 'f2300d18-3a9d-4c64-b03a-18a00082a737');
sysVar.set("agent.proxyurl", "http://web-proxy.il.softwaregrp.net:8080");
sysVar.set("Agent.ProxyUrl", "http://web-proxy.il.softwaregrp.net:8080");
sysVar.set('ALMOctaneLogLevel', 'debug');
sysVar.set('ENDPOINT_DATA_Octane_INSTANCE_ID', 'octane123');
sysVar.set('Build.SourceBranchName', 'master');
// sysVar.set('ENDPOINT_DATA_Octane_AZURE_PERSONAL_ACCESS_TOKEN', 'fzhzniawld2wh524y2h2sft2ksm23nanspwk6blg4lxhegirixcq'); //evgenelokshin
// sysVar.set('ENDPOINT_DATA_Octane_AZURE_PERSONAL_ACCESS_TOKEN', '4xgexy6mionli6455wvyeutmeaicgqrpvepxqgnapirt2mj7jxsa'); //el0206
// sysVar.set('ENDPOINT_DATA_Octane_AZURE_PERSONAL_ACCESS_TOKEN', 'vmy5g6t52kfvwhigzpeshsau6mzqxsq2gegtptradx4uxzslkqmq'); //DefaultCollection local
sysVar.set('ENDPOINT_DATA_Octane_AZURE_PERSONAL_ACCESS_TOKEN', 'praowgkcfjpflpo7lkyq4fo44oxgjptpw4fj5dtmwkz3felaew3q'); //DefaultCollection local


function initRepository(type: string) {
    if (type == 'int') {
        sysVar.set('System.TeamProject', 'AzureRepoProj');
        sysVar.set('Build.DefinitionName', 'pipeline test3');
        sysVar.set('Build.BuildId', '344');
    } else {
        // sysVar.set('System.TeamProject', 'GitTFS');
        sysVar.set('System.TeamProject', 'AzureGitRepo');
        sysVar.set('Build.DefinitionName', 'pipeline1');
        sysVar.set('Build.BuildId', '46');
    }
}

let auth = {
    parameters: {'username': 'sa@nga', 'password': 'Welcome1'},
    // parameters: {'username': 'evgeny_74x5qege65044axgppok7ny1l', 'password': '=97224719542467276H'},
    scheme: 'username'
};

let gitHubAuth = {
    // parameters: {'accessToken': '50b6cc336829d163c6c34b41137bf66ee58952ed'},
    parameters: {'accessToken': '309fc1a0e6afd401fc0ed6b1895f3b4e961b173e'},
    scheme: 'PersonalAccessToken'
};

function initTl(testTask: any) {
    let logger = new LogUtils('debug');
    logger.debug("blablalbla");
    logger.debug("****blablalbla", logger.getCaller());
    logger.debug("****blablalbla");
    initRepository('int');
    // initRepository('int');
    testTask.execSync = (tool: string, args: string | string[], options?: tlr.IExecSyncOptions) => {
        return tl.execSync(tool, args, options);
    };
    testTask.getEndpointUrl = (id: string, optional: boolean) => {
        //return 'https://almoctane-eur.saas.microfocus.com/ui/?p=173006';
        return 'http://localhost:8080/dev/ui/?p=1001/1002';
        // return 'https://qa8.almoctane.com/ui/?p=1001/1002';
    };
    testTask.getInput = (name: string, required?: boolean) => {
        return input.get(name);
    };

    testTask.getEndpointAuthorization = (name: string, required?: boolean) => {
        switch (name) {
            case 'Octane':
                return auth;
            case 'gitHub':
                return gitHubAuth;
        }
    };

    testTask.getEndpointDataParameter = (id: string, key: string, optional: boolean) => {
        let name = 'ENDPOINT_DATA_' + id + '_' + key.toUpperCase();
        if (sysVar.has(name)) {
            return sysVar.get(name);
        }
        return undefined;
    };

    testTask.getVariable = (name: string) => {
        return sysVar.get(name);
    };

    testTask.TaskResult = tl.TaskResult;

    testTask.setResult = (result: any, message: string, done?: boolean) => {
        tl.setResult(result, message, done);
    };

    testTask.setVariable = (name: string, val: string, secret?: boolean) => {
        sysVar.set(name, val);
    };

    return testTask;
}

let task = initTl(testTask);
let result = task.execSync(`node`, `--version`);
console.log('node version = ' + result.stdout);

console.log(task.getInput('OctaneServiceConnection'));
let endpointAuth = task.getEndpointAuthorization(task.getInput('OctaneServiceConnection'), false);
let clientId = endpointAuth.parameters['username'];
let clientSecret = endpointAuth.parameters['password'];
console.log('clientId=' + clientId + " clientSecret=" + clientSecret);

//process.env.no_proxy = "ILstekel02.microfocus.com";
// process.env.HTTPS_PROXY = "http://web-proxy.il.softwaregrp.net:8080";
// process.env.https_proxy = "http://web-proxy.il.softwaregrp.net:8080";
// process.env.HTTP_PROXY = "http://web-proxy.il.softwaregrp.net:8080";
// process.env.http_proxy = "http://web-proxy.il.softwaregrp.net:8080";
process.env.HTTPS_PROXY = "";
process.env.https_proxy = "";
process.env.HTTP_PROXY = "";
process.env.http_proxy = "";

let endpointGitAuth = task.getEndpointAuthorization(task.getInput('RepositoryConnection'), false);
let token = endpointGitAuth.parameters['accessToken'];
console.log('token=' + token);

async function runTasks() {
    sysVar.set('Agent.JobName', BaseTask.ALM_OCTANE_PIPELINE_START);
    let startTask: StartTask = await StartTask.instance(task);
    await startTask.run();

    sysVar.set('Agent.JobName', 'C');
    let startInnerTask: StartTask = await StartTask.instance(task);
    await startInnerTask.run();

    sysVar.set('Agent.JobName', 'C');
    sysVar.set('AGENT_JOBSTATUS', 'Failed');
    let endInnerTask: EndTask = await EndTask.instance(task);
    await endInnerTask.run();

    sysVar.set('Agent.JobName', BaseTask.ALM_OCTANE_PIPELINE_END);
    sysVar.set('AGENT_JOBSTATUS', 'Succeeded');
    let endTask: EndTask = await EndTask.instance(task);
    await endTask.run();
}

runTasks().catch(err => console.error(err));

