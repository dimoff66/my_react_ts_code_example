import _ from 'lodash'
import {  ActionType } from "./actions"
import { ID_FIELD } from '../Constants/attributeNames'
import { GuestDataType } from '../Classes/Guest'
import { SailingDataType } from '../Classes/Sailing'
import { ReservationType } from '../Classes/Reservation'

export type RootState = {
  guests?: GuestDataType[]
  nearbyGuestsIds?: string[]
  sailings?: SailingDataType[]
  currentSailing?: SailingDataType
  reservation?: ReservationType
}

type StateKey = keyof RootState

type OnGuestsLoadedPayload = GuestDataType[]
type UnloadDataPayload = StateKey[]
type OnSailingsLoadedPayload = SailingDataType[] 
type OnReservationChangedPayload = ReservationType | null

export type RootAction = {
  type: ActionType
  payload: 
    | OnGuestsLoadedPayload
    | UnloadDataPayload
    | OnSailingsLoadedPayload
    | OnReservationChangedPayload
}

function reducer (state: RootState = {}, action: RootAction) {
  switch (action.type) {
    case ActionType.ON_GUESTS_LOADED:
      const guests: GuestDataType[] = action.payload as OnGuestsLoadedPayload

      // just random guests
      const nearbyCount = Math.min(50, Math.floor(guests.length * 0.6))
      const nearbyGuestsIds = _.shuffle(guests).slice(0, nearbyCount).map(v => v[ID_FIELD])

      return { ...state, guests, nearbyGuestsIds }

    case ActionType.UNLOAD_DATA: 
      const keys: StateKey[] = action.payload as UnloadDataPayload
      const nullValuesObject = _.fromPairs(keys.map(key => [key, null]))

      return { ...state, ...nullValuesObject }

    case ActionType.ON_SAILINGS_LOADED:
      const sailings: SailingDataType[] = action.payload as OnSailingsLoadedPayload
      const currentSailing = _.last(sailings)
      return { ...state, sailings, currentSailing }

    case ActionType.CHANGE_RESERVATION:
      const reservation: ReservationType | null = action.payload as OnReservationChangedPayload
      return { ...state, reservation }

    default:
      return state
  }
}

export default reducer