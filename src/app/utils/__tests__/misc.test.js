import { sanitizeUrl, castFuzzyBool, durationBetweenDates } from '../misc'
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

describe('durationBetweenDates', () => {
  const fn = durationBetweenDates
  it('get the duration between start date and end date for day hour and minute', () => {
    expect(fn('2020-01-28T00:44:35.000Z', '2020-01-29T01:45:36.000Z')).toEqual(
      '1 day, 1 hour, 1 minute',
    )
  })
  it('get the duration between start date and end date for days hours and minutes', () => {
    expect(fn('2020-01-27T00:40:30.000Z', '2020-01-29T01:45:36.000Z')).toEqual(
      '2 days, 1 hour, 5 minutes',
    )
  })
  it('get the duration between start date and end date for n day, 0 hour and 0 minute', () => {
    expect(fn('2020-01-26T00:40:30.000Z', '2020-01-27T00:40:30.000Z')).toEqual(
      '1 day, 0 hour, 0 minute',
    )
  })
  it('get the duration between start date and end date for n hour and 0 minute', () => {
    expect(fn('2020-01-27T00:40:30.000Z', '2020-01-27T01:40:30.000Z')).toEqual('1 hour, 0 minute')
  })
  it('get the duration between start date and end date for minutes', () => {
    expect(fn('2020-01-27T00:28:30.000Z', '2020-01-27T00:40:30.000Z')).toEqual('12 minutes')
  })
})
