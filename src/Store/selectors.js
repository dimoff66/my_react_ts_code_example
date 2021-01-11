import { createSelector } from 'reselect'
import _ from 'lodash'
import { ID_FIELD } from '../Constants/attributeNames'
import Reservation from '../Classes/Reservation'
import Sailing from '../Classes/Sailing'

const objectsToMap = items => items ? _.keyBy(items, ID_FIELD) : null

const createMapSelector = dataName => createSelector(
  state => state[dataName],
  objectsToMap
)

export const sailingSelector = createSelector(
  state => state.currentSailing,
  data => Sailing(data)
)
 
export const nearbyIdsSetSelector = createSelector(
  state => state.nearbyGuestsIds,
  items => new Set(items)
)

export const guestsMapSelector = createMapSelector('guests')
export const sailingsMapSelector = createMapSelector('sailings')

export const dataSourcesSelector = createSelector(
  state => state.sailings, 
  state => guestsMapSelector(state),
  (sailingsList, guests) => {
    if (!sailingsList || !guests) return null 

    const withParentId = (parent, children, prop) => {
      return children.map(item => ({...item, [prop]: parent[ID_FIELD]}))
    }

    const venuesList  = sailingsList.flatMap(v => withParentId(v, v.venues, 'sailingId'))
    const layoutsList = venuesList.flatMap(v => withParentId(v, v.layouts, 'venueId'))
    const tablesList  = layoutsList.flatMap(v => withParentId(v, v.tables, 'layoutId'))
    
    const [sailings, venues, layouts, tables] = 
      [sailingsList, venuesList, layoutsList, tablesList].map(objectsToMap)

    return { sailings, venues, layouts, tables, guests }
  }
)

export const reservationSelector = createSelector(
  state => state.reservation,
  state => dataSourcesSelector(state),
  (data, dataSources) => data && dataSources
    ? Reservation(data, dataSources)
    : null
)

