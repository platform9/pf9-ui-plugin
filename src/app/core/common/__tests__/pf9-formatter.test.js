import {
  formattedValue,
  formattedDate
} from '../formatters'

describe('Value Formatters Test', () => {
  it('Value without unit', () => {
    expect(formattedValue(0)).toEqual('0.00')
    expect(formattedValue(158)).toEqual('158.00')
    expect(formattedValue(246.21)).toEqual('246.21')
    expect(formattedValue(12453)).toEqual('12,453.00')
    expect(formattedValue(10578143.356)).toEqual('10,578,143.36')
  })

  it('Value with unit', () => {
    expect(formattedValue(0, 'Bytes')).toEqual('0.00 Bytes')
    expect(formattedValue(850, 'MB')).toEqual('850.00 MB')
    expect(formattedValue(1024, 'GB')).toEqual('1.00 TB')
    expect(formattedValue(2458, 'MB')).toEqual('2.40 GB')
    expect(formattedValue(11578, 'GB')).toEqual('11.31 TB')
    expect(formattedValue(2048, 'TB')).toEqual('2,048.00 TB')
  })

  it('Value with wrong unit', () => {
    expect(formattedValue(1, 'BYTEs')).toEqual('1.00')
    expect(formattedValue(1024, 'mb')).toEqual('1,024.00')
  })

  it('Input error handling', () => {
    expect(formattedValue(undefined)).toEqual('Wrong value input.')
    expect(formattedValue(NaN)).toEqual('Wrong value input.')
  })
})

describe('Date Formatters Test', () => {
  it('Date reformatting', () => {
    expect(formattedDate(new Date('1995-12-17T03:24:00'))).toEqual('Dec 17, 1995 03:24:00')
    expect(formattedDate(new Date('December 17, 1995 03:24:00'))).toEqual('Dec 17, 1995 03:24:00')
  })

  it('Input error handling', () => {
    expect(formattedDate(new Date('1995,12-17T03:24:00'))).toEqual('Wrong date input.')
    expect(formattedDate(undefined)).toEqual('Wrong date input.')
    expect(formattedDate(NaN)).toEqual('Wrong date input.')
  })
})
