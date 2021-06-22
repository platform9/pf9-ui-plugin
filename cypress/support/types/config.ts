import { ClusterDetails, UserDetails } from "."

// Move to types 
export interface Config{
    loginCredentials: UserDetails
    singleMasterClusterData: ClusterDetails
    multiMasterClusterData: ClusterDetails
    oneClickClusterData: ClusterDetails
}