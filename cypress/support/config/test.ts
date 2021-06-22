import {Config} from './../types'


export const testConfig:Config={
    loginCredentials: {
        username: 'test.user@afourtech.com',
        password: 'Test@1234',
        completeName: 'Kingshuk Nandy'
    },
    singleMasterClusterData: {
        clusterName: 'SingleMasterCluster-1',
        totalNodes: 2,
        masterNodes: 1,
        workerNodes: 1  
    },
    multiMasterClusterData: {
        clusterName: 'MultiMasterCluster-1',
        totalNodes: 3,
        masterNodes: 2,
        workerNodes: 1,
        virtualIP: '10.128.146.121'  
    },
    oneClickClusterData: {
        clusterName: 'MultiMasterCluster-1',
        totalNodes: 1,   
    }
}