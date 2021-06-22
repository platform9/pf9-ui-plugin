import {Config} from './../types'
export const developmentConfig:Config={
    loginCredentials: {
        username: 'kingshuk.nandy@afourtech.com',
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
        clusterName: 'OneClickCluster-1',
        totalNodes: 1,   
    }
}

