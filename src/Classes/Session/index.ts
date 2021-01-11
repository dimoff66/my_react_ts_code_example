import BasicClass, { ClassData, DataSourcesCollection, TimeTrio } from '../Basic'
import { MomentType } from '../Moment'
import { VenueType } from '../Venue'

export interface SessionDataType extends ClassData {
  name?: string
  timeStart: string 
  timeEnd: string 
  date?: MomentType
}

export class SessionType extends BasicClass<SessionDataType, {}, {}> {
  constructor (data: SessionDataType) {
    super(Session, data)
  }

  get timeStartString ()      { return this.getValue('timeStart') }
  get timeEndString ()        { return this.getValue('timeEnd') }

  get timeStart (): TimeTrio  { return this.getTimeValue('timeStart') }
  get timeEnd (): TimeTrio    { return this.getTimeValue('timeEnd') }

  get date ()           { return this.getValue('date') }
  set date (value)      { this.setValue('date', value) }

  get dateTimeStart ()  { return this.getDateTimeStart(this.date!) }
  get dateTimeEnd ()    { return this.getDateTimeEnd(this.date!) }
  get dateTimes ()      { return this.getDateTimes(this.date!) }

  get name ()           { return this.getStringValue('name') }
  get intervalView ()   { return this.timeStartString + ' - ' + this.timeEndString }
  get view ()           { return this.name || this.intervalView }

  get id () {
    return (this.intervalView + ' ' + (this.date?.view || '')).trimRight()
  }

  public getDateTimeStart (date: MomentType) { return this.withDate('timeStart', date) }
  public getDateTimeEnd (date: MomentType)   { return this.withDate('timeEnd', date) }
  public getDateTimes (date: MomentType)     { return [this.getDateTimeStart(date), this.getDateTimeEnd(date)] }

  public useDate (date: MomentType) {
    this.date = date.morningDate 
    return this.update() as SessionType
  }

  public getTimeslots(venue: VenueType, interval = this) {
    const timeslots: MomentType[] = []
    if (!this.intersects(interval)) return timeslots

    const { timeslotsStep } = venue

    const [intervalStartMoment, intervalEndMoment] = interval.dateTimes

    const dateTimeEnd = this.dateTimeEnd.min(intervalEndMoment)

    let timestamp = this.dateTimeStart
    let isStarted = false

    while(dateTimeEnd.moreThan(timestamp)) {
      isStarted = isStarted || timestamp.moreOrEqual(intervalStartMoment)
      if (isStarted) {
        timeslots.push(timestamp)
      }

      timestamp = timestamp.add(timeslotsStep, 'minute')
    }

    return timeslots
  }

  public findCurrentTimeslot (date: MomentType, venue: VenueType) {
    const timeslots = this.useDate(date).getTimeslots(venue)
    const currentTimeslot = timeslots.find(item => item.moreOrEqual(date)) || timeslots.pop()

    return currentTimeslot || null
  }

  private intersects (that: SessionType) {
    const absSeconds = (v: TimeTrio) => (v.hour * 24 + v.minute) * 60

    return absSeconds(this.timeStart) < absSeconds(that.timeEnd) && 
      absSeconds(that.timeStart) < absSeconds(this.timeEnd)     
  }

  private withDate (attrName: 'timeStart' | 'timeEnd', date: MomentType) {
    const dateCopy = date.clone()
    dateCopy.momentInstance.set(this[attrName])
    return dateCopy
  }
}

const Session = (data: SessionDataType, dataSources: DataSourcesCollection) => new SessionType(data)
export default Session