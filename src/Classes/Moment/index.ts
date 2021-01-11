import moment from 'moment-timezone'

interface MomentOptions {
  timezone?: string
  [p: string]: any  
}

type MomentIncomingValue = MomentType | moment.Moment | string | number | null

type PeriodType = 'days' | 'hours' | 'minutes' | 'seconds'
type PeriodTypeSingular = 'day' | 'hour' | 'minute' | 'second' | 'month' | 'year'

export class MomentType {
  options: MomentOptions
  timezone: string

  _isMorningDate = false

  isInstanceOfMoment = true
  momentInstance: moment.Moment

  constructor (value: MomentIncomingValue, options: MomentOptions) {
    this.options = options || {}
    
    const tz = this.timezone = this.options.timezone || Moment.timezone

    if (value instanceof MomentType) {
      this.momentInstance = value.momentInstance.clone()  
    } else if (typeof value === 'number') {
      this.momentInstance = moment(value).tz(tz)
    } else if (typeof value === 'string') {
      this.momentInstance = moment.tz(value, tz)
    } else if (value instanceof moment) {
      this.momentInstance = value
    } else {
      this.momentInstance = moment.tz(tz)
    }
  }

  startOfDay () {
    const skipMorningDateCheck = true
    return this.clone(
      this.momentInstance.startOf('day'), 
      skipMorningDateCheck
    )
  }

  get isStartOfTheDay () {
    return this.isEqual(this.startOfDay())
  }

  set isMorningDate (value) {
    this._isMorningDate = value
  }
  get isMorningDate () {
    return this._isMorningDate && this.isStartOfTheDay
  }

  get timestamp () {
    return this.momentInstance.valueOf()
  }

  get view () {
    return this.toString()
  }

  get newMoment () { return this.momentInstance.clone() }

  get morningDate () {
    if (this.isMorningDate) return this 

    // 3 hours after midnight still considered as previous date
    const momentInstance = this.newMoment.subtract(3, 'hours').startOf('day')
    const date = this.clone(momentInstance)
    date.isMorningDate = true 

    return date
  }

  get morningDateHours () {
    const morningDate = this.morningDate
    const res = this.momentInstance.diff(morningDate.momentInstance, "minutes") / 60
    return res
  }

  asMorningDate (value = true) {
    this.isMorningDate = value 
    return this
  }

  diff (that: MomentType, period: PeriodType = 'days') {
    return this.momentInstance.diff(that.momentInstance, period)
  }

  moreThan (that: MomentType) {
    return this.timestamp > that.timestamp
  }


  moreOrEqual (that: MomentType) {
    return this.timestamp >= that.timestamp
  }

  lessThan (that: MomentType) {
    return this.timestamp < that.timestamp
  }

  lessOrEqual (that: MomentType) {
    return this.timestamp <= that.timestamp
  }

  isBetween (that1: MomentType, that2: MomentType, includesLast = false) {
    return includesLast
      ? this.moreThan(that1) && this.lessOrEqual(that2)
      : this.moreThan(that1) && this.lessThan(that2)
  }

  max (that: MomentType, ifEmpty: MomentType = this) {
    if (!that) return ifEmpty || this
    return this.moreThan(that) ? this : that
  }

  min (that: MomentType, ifEmpty: MomentType = this) {
    if (!that) return ifEmpty || this
    return this.moreThan(that) ? that : this  
  }

  isEqual (that: MomentType | undefined) {
    if (!that) return false
    return this.momentInstance.valueOf() === that.momentInstance.valueOf()
  }

  isEqualDate (that: MomentType | undefined) {
    if (!that) return false
    return this.morningDate.timestamp === that.morningDate.timestamp
  }

  add (value: number, period: PeriodTypeSingular) {
    return this.change(value, period, 'add')
  }

  subtract (value: number, period: PeriodTypeSingular) {
    return this.change(value, period, 'subtract')
  }

  change (value: number, period: PeriodTypeSingular, action: 'add' | 'subtract') {
    const obj = this.newMoment[action](value, period)
    return this.clone(obj).asMorningDate(this.isMorningDate && (
      period === 'day' || period === 'month' || period === 'year'
    ))  
  }

  format (string: string) { return this.momentInstance.format(string) }

  clone (v: MomentIncomingValue = null, skipMorningDateCheck = false) {
    const newInstance = Moment(v || this, this.options)
    if (!skipMorningDateCheck && this.isMorningDate && v) {
      newInstance.isMorningDate = false
    }

    return newInstance
  }

  toString () {
    return this.momentInstance.format('YYYY-MM-DD H:mm:ss')
  }
}

interface MomentFabric {
  (value: any, options: MomentOptions): MomentType  
  timezone: string 
  mockCurrentTime: MomentIncomingValue
}

const Moment: MomentFabric = function (value: any, options: MomentOptions) {
  return new MomentType(value, options)
}
Moment.timezone = ''
Moment.mockCurrentTime = null
export default Moment

export const setMockCurrentTime = (moment: MomentIncomingValue) => {
  Moment.mockCurrentTime = moment
}

export const getCurrentTime = (timezone: string) => {
  const { mockCurrentTime } = Moment
  const currentMoment = mockCurrentTime 
    ? Moment(mockCurrentTime, { timezone }) 
    : Moment(null, { timezone })

  return currentMoment
}