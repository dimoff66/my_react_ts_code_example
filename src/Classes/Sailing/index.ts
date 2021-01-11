import { ValueViewInfo } from '../../CommonTypes'
import BasicClass, { DataSourcesCollection, ClassData, ExtraDataCommon, MemoizedValuesCommon } from '../Basic'
import { getCurrentTime, MomentType } from '../Moment/index'
import Venue, { VenueDataType, VenueType } from '../Venue'

export interface SailingDataType extends ClassData {
  publicId?: string 
  timezone: string 
  dateStart: string 
  dateEnd: string
  venues: VenueDataType[]
}

interface SailingExtraData extends ExtraDataCommon {
  venues?: VenueType[]
}

interface SailingMemoizedData extends MemoizedValuesCommon {
  venuesSelectOptions?: ValueViewInfo[]
}

export class SailingType extends BasicClass<SailingDataType, SailingExtraData, SailingMemoizedData> {
  constructor (data: SailingDataType, dataSources: DataSourcesCollection) {
    super(Sailing, data, dataSources)
    this.addExtraField('venues', 'venues', Venue, '', true, () => ({ sailing: this })) 
  }

  get timezone (): string                 { return this.getValue('timezone') }
  get dateStart (): MomentType            { return this.getDateValue('dateStart')!.asMorningDate() }
  get dateEnd (): MomentType              { return this.getDateValue('dateEnd') as MomentType }
  get dates ()                            { return [this.dateStart, this.dateEnd] as [m1: MomentType, m2: MomentType] }
  get venues (): VenueType[]              { return this.getExtraDataValue('venues')! }

  get maxSittingDuration () { 
    return Math.max(...this.venues.map(v => v.maxSittingDuration))
  }

  get venuesSelectOptions (): ValueViewInfo[] {
    return this.getMemoizedValue(
      'venuesSelectOptions', 
      () => this.venues.map(item => [item, item.name] as ValueViewInfo)
    )
  }

  getCurrentTime () {
    return getCurrentTime(this.timezone)
  } 
}

const Sailing = (data: SailingDataType, dataSources: DataSourcesCollection) => new SailingType(data, dataSources)
export default Sailing