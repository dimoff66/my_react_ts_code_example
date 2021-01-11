import BasicClass, { ExtraField, ClassData, DataSourcesCollection, ExtraDataCommon } from "../Basic"

import Table, { TableDataType, TableType } from "../Table"
import Venue, { VenueType } from "../Venue"

export interface LayoutDataType extends ClassData {
  publicId: string
  name: string  
  tables: TableDataType[]
  isDefault?: boolean
}

export interface LayoutExtraData extends ExtraDataCommon {
  tables?: TableType[]
  venue?: VenueType
}

export class LayoutType extends BasicClass<LayoutDataType, LayoutExtraData, {}> {
  isDefault: unknown
  constructor (data: LayoutDataType, dataSources: DataSourcesCollection) {
    super(Layout, data, dataSources)

    this
      .addExtraField('tables', 'tables', Table, '', true, () => ({ layout: this }))
      .addExtraField('venueId', 'venue', Venue, 'venues')  
  }
  
  get name (): string { return this.getValue('name') }
  get tables () { return this.getExtraDataItems('tables') }
  get venue () { return this.getExtraDataValue('venue')! }
}

const Layout =  (data: LayoutDataType, dataSources: DataSourcesCollection) => new LayoutType(data, dataSources)
export default Layout