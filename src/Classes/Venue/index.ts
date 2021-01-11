import BasicClass, { ClassData, DataSourcesCollection, ExtraDataCommon, ExtraField, MemoizedValuesCommon } from '../Basic'
import Layout, { LayoutDataType, LayoutType } from '../Layout'

import _ from 'lodash'
import Sailing, { SailingType } from '../Sailing'
import Sessions, { SessionsType, SessionsFabric } from '../Sessions'
import { first, last } from '../../Utils/index'
import { MomentType } from '../Moment'
import { SessionDataType, SessionType } from '../Session'
import { ValueViewInfo } from '../../CommonTypes'

export interface VenueDataType extends ClassData {
  publicId: string
  name: string 
  timeslotsStep: number 
  sittingDurations: DurationSetting[]
  sessions: SessionDataType[]
  layouts: LayoutDataType[]
}

interface VenueExtraData extends ExtraDataCommon {
  layouts?: LayoutType[]
  sessions?: SessionsType
  sailing?: SailingType
}

interface VenueMemoizedData extends MemoizedValuesCommon {
  layoutsSelectOptions?: ValueViewInfo[]  
  sittingDurations?: number[]
}

type DurationSetting = {
  guestsNumber: number 
  duration: number
}

export class VenueType extends BasicClass<VenueDataType, VenueExtraData, VenueMemoizedData> {

  constructor (data: VenueDataType, dataSources: DataSourcesCollection = {}) {
    super(Venue, data, dataSources) 
    
    this
      .addExtraField('layouts', 'layouts', Layout, '', true, () => ({ venue: this }))
      .addExtraField('sessions', 'sessions', Sessions, '', false)
      .addExtraField('sailingId', 'sailing', Sailing, 'sailings')
  }
  
  get name (): string { return  this.getValue('name') }
  get defaultLayout () { 
    return this.layouts.find(v => v.isDefault) || this.layouts[0] 
  } 
  get timeslotsStep (): number      { return this.getValue('timeslotsStep') }
  get layouts (): LayoutType[]      { return this.getExtraDataItems('layouts') }
  get sailing (): SailingType       { return this.getExtraDataValue('sailing')! }
  get sessions (): SessionsType     { return this.getExtraDataValue('sessions')! }

  get sessionsList (): SessionType[]          { return this.sessions.sessions }
  get sittingDurations (): DurationSetting[]  { return this.getValue('sittingDurations') as DurationSetting[] }

  get layoutsSelectOptions (): ValueViewInfo[] {
    return this.getMemoizedValue(
      'layoutsSelectOptions', 
      () => this.layouts.map(item => [item, item.name] as ValueViewInfo)
    )
  }

  get maxSittingDuration () { return last(this.sittingDurations).duration }

  getProposedDurationForPartySize (partySize: number) {
    const callback = (pSittingDurations: DurationSetting[]) => {
      const sittingDurations = pSittingDurations.slice(0)
      let value = sittingDurations.pop()?.duration || 60
      const durations = Array.from({ length: 51 }, (v, i) => {
        value = last(sittingDurations)?.guestsNumber === 50 - i
          ? sittingDurations.pop()!.duration
          : value
        return value
      })

      return durations.reverse()
    }
    
    const sittingDurations = this.getMemoizedValue(
      'sittingDurations',
      () => callback(this.sittingDurations)
    )

    const result: number = sittingDurations[partySize] as number

    return result
  }

  getFirstTimestamp (date: MomentType) { return first(this.sessionsList).getDateTimeStart(date) }
  getLastTimestamp (date: MomentType) { return last(this.sessionsList).getDateTimeEnd(date) }

  getSessionsList (date: MomentType) {
    return this.sessions.useDate(date).sessions
  }
  
  getTimeslots (date: MomentType, interval: SessionType) {
    const timeslots = this.getSessionsList(date).flatMap(item => 
      item.getTimeslots(this, interval)
    )

    return timeslots
  }

  getClosestSession (dateTime = this.sailing.getCurrentTime()) {
    return this.sessions.getClosestSession(dateTime)
  }  
}

const Venue = (data: VenueDataType, dataSources?: DataSourcesCollection) => new VenueType(data, dataSources)
export default Venue