import { App, AppsAvailableToCluster, Chart, DeployedApp } from 'api-client/helm.model'

export interface IAppsAction extends App {
  id: string
  repository: string
}

export interface IAppsAvailableToClusterAction extends AppsAvailableToCluster {
  repository: string
}

export interface IAppsSelector extends App, Chart {}

export interface IDeployedAppsSelector extends DeployedApp {
  repository: string
  icon: string
  home: string
}
