import moment from 'moment'

export const isLeapYear = (year: number) => (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0

export const getStakingPeriodInDays = (stakingPeriod: number) => {
  const today = moment().startOf('day')
  const endDay = moment()
    .startOf('day')
    .add(
      (() => {
        switch (stakingPeriod) {
          case 0:
            return 1
          case 1:
            return 90 // ~3 months
          case 2:
            return 180 // ~6 months
          case 3:
            return 270 // ~9 months
          case 4:
          default:
            return 365 // ~12 months
        }
      })(),
      'days',
    )
    .endOf('day')

  return endDay.diff(today, 'days')
}
