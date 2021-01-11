import BasicClass,{ ClassData, DataSourcesCollection, ExtraDataCommon, ExtraField, MemoizedValuesCommon } from '../Basic'

export interface GuestDataType extends ClassData {
  publicId: string 
  firstName: string 
  secondName: string
  party?: string[]
  cabinNumber: number
  requests: Array<[type: string, request?: string]>
}

interface GuestExtraData extends ExtraDataCommon {
  party?: GuestType[]
}

export class GuestType extends BasicClass<GuestDataType, GuestExtraData, {}> {
  constructor (data: GuestDataType, dataSources: DataSourcesCollection) {
    super(Guest, data, dataSources)
    this.addExtraField('party', 'party', Guest, 'guests', true)
  }

  get firstName (): string { return this.getValue('firstName') }
  get secondName (): string { return this.getValue('secondName') }
  get cabinNumber (): number { return this.getValue('cabinNumber') }

  get fullName (): string { return `${this.firstName} ${this.secondName}`}

  get party () { return this.getExtraDataItems('party') }

  isNearby (nearbyIdsSet: Set<string>) {
    return nearbyIdsSet.has(this.id)
  }
  
}

const Guest = (data: GuestDataType, dataSources: DataSourcesCollection) => new GuestType(data, dataSources)
export default Guest