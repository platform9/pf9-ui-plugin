import { sanitizeUrl, castFuzzyBool } from '../misc'

describe('castFuzzyBool', () => {
  it('cast values correctly', () => {
    expect(castFuzzyBool('0')).toEqual(false)
    expect(castFuzzyBool(0)).toEqual(false)
    expect(castFuzzyBool(false)).toEqual(false)
    expect(castFuzzyBool('false')).toEqual(false)
    expect(castFuzzyBool('False')).toEqual(false)
    expect(castFuzzyBool('1')).toEqual(true)
    expect(castFuzzyBool(1)).toEqual(true)
    expect(castFuzzyBool(true)).toEqual(true)
    expect(castFuzzyBool('true')).toEqual(true)
    expect(castFuzzyBool('True')).toEqual(true)
  })
})

describe('sanitizeUrl', () => {
  const fn = sanitizeUrl
  it('replaces special sybols with hypens', () => {
    expect(fn('www.foo-$@%^.bar.com')).toEqual('www.foo-----.bar.com')
  })
  it('eliminates leading hyphens', () => {
    expect(fn('--bad.domain.com')).toEqual('bad.domain.com')
  })
})
