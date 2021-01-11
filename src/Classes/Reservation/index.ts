import { DEFAULT_TIMESTAMP_FORMAT } from '../../Components/Reservation/constants'
import BasicClass, { ClassData, DataSourcesCollection, ExtraDataCommon, ExtraField } from '../Basic/index'
import Guest, { GuestType } from '../Guest'
import { MomentType } from '../Moment'
import Sailing, { SailingType } from '../Sailing'
import Table, { TableType } from '../Table'
import Venue, { VenueType } from '../Venue'

export interface ReservationDataType extends ClassData {
  publicId?: string
  sailingId?: string 
  venueId?: string 
  mainGuestId?: string

  timestamp?: number 
  seatedTimestamp?: number

  guestsIds?: string[]
  anonimousGuestsCount?: number
  tableId?: string  
}

interface ReservationExtraData extends ExtraDataCommon {
  sailing?: SailingType
  venue?: VenueType
  table?: TableType
  mainGuest?: GuestType
  guests?: GuestType[]
}

type DateAttrubuteParam = 'timestamp' | 'seatedTimestamp' | 'any'
export type WritableReservationProps = 
  | 'timestamp' | 'seatedTimestamp' | 'anonimousGuestsCount' 
  | 'mainGuest' | 'guests' | 'sailing' | 'table'

export class ReservationType extends BasicClass<ReservationDataType, ReservationExtraData, {}> {
  constructor (data: ReservationDataType, dataSources: DataSourcesCollection) {
    const initialValues = {
      guestsIds: []
    }

    super(Reservation, data, dataSources, initialValues)
      
    this
      .addExtraField('sailingId', 'sailing', Sailing, 'sailings') 
      .addExtraField('venueId', 'venue', Venue, 'venues') 
      .addExtraField('tableId', 'table', Table, 'tables') 
      .addExtraField('mainGuestId', 'mainGuest', Guest, 'guests') 
      .addExtraField('guestsIds', 'guests', Guest, 'guests') 
  }

  get timestamp (): MomentType | null { return this.getDateValue('timestamp', this.sailing.timezone) }
  set timestamp (value) { this.setDateValue('timestamp', value) }

  get seatedTimestamp (): MomentType | null { return this.getDateValue('seatedTimestamp', this.sailing.timezone) }
  set seatedTimestamp (value) { this.setDateValue('seatedTimestamp', value) }

  get actualTimestamp (): MomentType | null { return this.seatedTimestamp || this.timestamp }
  get proposedEndTime (): MomentType | null { return this.actualTimestamp?.add(
    this.venue.getProposedDurationForPartySize(this.partySize),
    'minute'
  ) || null}

  get anonimousGuestsCount (): number { return this.getNumberValue('anonimousGuests') }
  set anonimousGuestsCount (value) { this.setValue('anonimousGuests', value) }
  anonimousGuestsOnChange (newValue: number) {
    if (this.anonimousGuestsCount < newValue && this.table) this.table = null
  }

  get mainGuest (): GuestType | null { return this.getExtraDataValue('mainGuest') || null }
  set mainGuest (value) { this.setExtraDataValue('mainGuest', value!) }

  get guests (): GuestType[] { return this.getExtraDataItems('guests') }
  set guests (value) { this.setExtraDataValue('guests', value) }

  get sailing (): SailingType { return this.getExtraDataValue('sailing')! }
  set sailing (value) { this.setExtraDataValue('sailing', value) }

  get venue (): VenueType { return this.getExtraDataValue('venue')! }
  set venue (value) { this.setExtraDataValue('venue', value) }

  get tableId (): string | null { return this.getValue('tableId') || null }
  get table (): TableType | null { return this.getExtraDataValue('table')! }
  set table (value) { this.setExtraDataValue('table', value!) }

  get party (): GuestType[] { return [this.mainGuest!, ...this.guests].filter(Boolean) }

  get partySize (): number {
    return this.party.length + this.anonimousGuestsCount
  }

  get partySizeString () {
    const { partySize } = this
    const suffix = partySize > 1 ? 's' : ''

    return partySize + ' guest' + suffix
  }

  get view (): string {
    const dateTime = this.actualTimestamp?.format(DEFAULT_TIMESTAMP_FORMAT) || 'time is not set'
    return `${dateTime}, ${this.venue.name}, ${this.mainGuest?.fullName || 'no guest' }`
  }

  getTimestamp (dateAttribute: DateAttrubuteParam = 'timestamp'): MomentType | null {
    if (dateAttribute === 'any') 
      return this.seatedTimestamp || this.timestamp

    return this[dateAttribute]
  }

  setCurrentTimestamp () {
    const currentTime = this.sailing.getCurrentTime()
    const session = this.venue.getClosestSession(currentTime)
    if (session) 
      this.timestamp = session.findCurrentTimeslot(currentTime, this.venue)

    // TODO: check next day

    return this
  }

  addToParty (...guests: any[]) {
    const newGuests = guests.filter(guest => !this.party.some(v => v.isEqual(guest)))
    if (newGuests.length) {
      if (this.table) this.table = null 
      return this.setExtraDataValue('guests', this.guests.concat(newGuests))
    }
    
    return this
  }

  removeFromParty (guest: any) {
    return this.removeExtraDataObjectItem('guests', guest)
  }

  replaceMainGuest (guest: any) {
    if (!this.mainGuest) return this 
    
    return this
      .replaceExtraDataObjectItem('guests', guest, this.mainGuest)
      .setExtraDataValue('mainGuest', guest)
  }

  validate () {
    return true
  }
}

const Reservation = (data: ReservationDataType, dataSources: DataSourcesCollection) => new ReservationType(data, dataSources)
export const reservationProto = ReservationType.prototype
export default Reservation