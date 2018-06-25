import {
  formattedValue,
  formattedDate
} from '../formatters'
import moment from 'moment'

describe('Value Formatters Test', () => {
  it('Value without output unit', () => {
    expect(formattedValue(0, '', 0)).toEqual('0 Bytes')
    expect(formattedValue(158, '', 1)).toEqual('158.0 Bytes')
    expect(formattedValue(12453.356, '', 2)).toEqual('12,453.36 Bytes')
  })

  it('Value with output unit', () => {
    expect(formattedValue(1248.4, 'Bytes', 1)).toEqual('1,248.4 Bytes')
    expect(formattedValue(8481150, 'MB', 2)).toEqual('8.09 MB')
    expect(formattedValue(448115464604563263.36, 'GB', 8)).toEqual('417,340,048.22053319 GB')
    expect(formattedValue(448115464604563263.36, 'TB', 1)).toEqual('407,558.6 TB')
    expect(formattedValue(2136746229.76, 'GB', 1)).toEqual('2.0 GB')
  })

  it('Value with wrong unit', () => {
    expect(formattedValue(1, 'BYTEs')).toEqual('Output unit not found.')
    expect(formattedValue(1024, 'mb')).toEqual('Output unit not found.')
  })

  it('Input error handling', () => {
    expect(formattedValue(undefined)).toEqual('Invalid value input.')
    expect(formattedValue(NaN)).toEqual('Invalid value input.')
    expect(formattedValue(1024, 'KB', -1)).toEqual('Invalid decimal digits input.')
  })
})

describe('Date Formatters Test', () => {
  it('Date reformatting', () => {
    expect(formattedDate('1998-12-17T03:24:00Z')).toEqual(moment('1998-12-17T03:24:00Z', 'YYYY-MM-DDTHH:mm:ssZ').format('lll'))
  })

  it('Input error handling', () => {
    // There's a deprecation warning that we don't need to see in the test output so we're muting console.warn temporarily.
    const originalWarn = console.warn
    console.warn = jest.fn()
    expect(formattedDate('88-17T03:24:00Z')).toEqual('Invalid date input.')
    expect(formattedDate(undefined)).toEqual('Invalid date input.')
    expect(formattedDate('')).toEqual('Invalid date input.')
    console.warn = originalWarn
  })
})
