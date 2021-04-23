import { VMVolumeTypes } from './model'

/*
  Api parameter is a volume type, pluralized and all lowercase
  i.e. dataVolume needs to be datavolumes for the API param.
*/
export const convertVolumeTypeToApiParam = (volumeType: VMVolumeTypes) => {
  return `${volumeType.toLowerCase()}s`
}
