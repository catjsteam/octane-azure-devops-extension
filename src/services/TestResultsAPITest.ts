import {TestResultsBuilder} from './TestResultsBuilder';
import {ConnectionUtils} from '../ConnectionUtils';
import {WebApi} from 'azure-devops-node-api';
import {LogUtils} from "../LogUtils";

let projectName = 'demo-app';

// let token: string = process.env.AZURE_PERSONAL_ACCESS_TOKEN;
const token = 'fzhzniawld2wh524y2h2sft2ksm23nanspwk6blg4lxhegirixcq';
const orgUrl = 'https://dev.azure.com/evgenelokshin';
let buildId: number = 34;

let api: WebApi = ConnectionUtils.getWebApiWithProxy(orgUrl, token);

TestResultsBuilder.getTestsResultsByBuildId(api, projectName, buildId, 'serverId', 'jobId', new LogUtils('debug')).then(res => {
    console.log('######################### finished ###############################');
    console.log(res);
});


