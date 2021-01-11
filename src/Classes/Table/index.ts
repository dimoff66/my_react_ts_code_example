import BasicClass, { ClassData, DataSourcesCollection, ExtraDataCommon, ExtraField } from '../Basic'
import Layout, { LayoutType } from '../Layout'
import _ from 'lodash'
import { ReservationType } from '../Reservation'
import { Dict } from '../../CommonTypes'
import { TableAvailabilityStatus, TableOrientation } from './constants'

export interface TableDataType extends ClassData {
  name: string
  maxSize: number 
  x: number 
  y: number
  orientation: 'H' | 'V'
} 

interface TableExtraData extends ExtraDataCommon {
  layout?: LayoutType
}

export class TableType extends BasicClass<TableDataType, TableExtraData, {}> {
  constructor (data: TableDataType, dataSources: DataSourcesCollection) {
    super(Table, data, dataSources) 
    this.addExtraField('layoutId', 'layout', Layout, 'layouts')
  }

  get size (): number { return this.getValue('maxSize') }
  get name (): string { return this.getValue('name') }
  get left (): number { return this.getValue('x') }
  get top (): number { return this.getValue('y') }
  get orientation (): 'H' | 'V' { return this.getValue('orientation') }
  get isMultiparty (): boolean { return this.getValue('multiparty') }
  
  get layout () { return this.getExtraDataValue('layout')! }
  get venue () { return this.layout.venue }

  getAvailabilityInfo (reservation: ReservationType, reservationsMap: Dict<ReservationType[]> | null)
    : [status: TableAvailabilityStatus, seatsOccupied: number] {
    
    const { Misfit, Available, Occupied } = TableAvailabilityStatus
    
    if (!reservationsMap) return [Misfit, 0]

    const { partySize } = reservation 
    const { size, isMultiparty } = this

    const occupiedBy: ReservationType[] = reservationsMap[this.id!] || []
    const occupiedSeats = _.sumBy(occupiedBy, 'partySize')
    const freeSeats = size - occupiedSeats

    let status: TableAvailabilityStatus = 
      (partySize > size && Misfit) ||
      (occupiedSeats === 0 && Available) || 
      ((!isMultiparty || partySize > freeSeats) && Occupied) ||
      Available

    return [status, occupiedSeats]
  }
}

const Table = (data: TableDataType, dataSources: DataSourcesCollection) => new TableType(data, dataSources)
export default Table