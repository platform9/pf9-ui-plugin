import { AxiosResponse, AxiosRequestConfig } from 'axios'

type AxiosGetRequest = <T>(
  clsName: string,
  mthdName: string,
  url: string,
  config?: AxiosRequestConfig,
) => Promise<AxiosResponse<T[]>>
type AxiosPostRequest = <T>(
  clsName: string,
  mthdName: string,
  url: string,
  data?: any,
  config?: AxiosRequestConfig,
) => Promise<AxiosResponse<T>>
type AxiosPutRequest = AxiosPostRequest
type AxiosPatchRequest = AxiosPostRequest
type AxiosDeleteRequest = AxiosGetRequest

type NormalizedGetRequest = <T>(
  clsName: string,
  mthdName: string,
  url: string,
  params?: AxiosRequestConfig['params'],
) => Promise<T[]>
type NormalizedPostRequest = <T>(
  clsName: string,
  mthdName: string,
  url: string,
  data?: any,
) => Promise<T>
type NormalizedPutRequest = NormalizedPostRequest
type NormalizedPatchRequest = NormalizedPostRequest
type NormalizedDeleteRequest = <T>(clsName: string, mthdName: string, url: string) => Promise<T>

export interface IApiClient {
  rawGet: AxiosGetRequest
  rawPost: AxiosPostRequest
  rawPut: AxiosPutRequest
  rawPatch: AxiosPatchRequest
  rawDelete: AxiosDeleteRequest

  basicGet: NormalizedGetRequest
  basicPost: NormalizedPostRequest
  basicPatch: NormalizedPatchRequest
  basicPut: NormalizedPutRequest
  basicDelete: NormalizedDeleteRequest
}
