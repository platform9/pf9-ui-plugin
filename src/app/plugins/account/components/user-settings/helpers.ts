import base32 from 'hi-base32'
import totp from 'totp-generator'

export const generateRandomKey = () => {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  const keyLength = 16
  const str = [...Array(keyLength)]
    .map((i) => {
      return alphabet[Math.floor(alphabet.length * Math.random())]
    })
    .join('')
  return base32
    .encode(str)
    .toUpperCase()
    .split('=')[0]
}

export const totpUrl = ({ features, username, mfaSecret }) => {
  const issuer =
    features.branding_name === 'Platform9'
      ? `${features.branding_name} (${features.shortname})`
      : features.branding_name
  return encodeURI(`otpauth://totp/${issuer}:${username}?secret=${mfaSecret}&issuer=${issuer}`)
}

export const verifyAuthCode = (code, secret) => {
  const correctCode = totp(secret)
  return correctCode === code
}
