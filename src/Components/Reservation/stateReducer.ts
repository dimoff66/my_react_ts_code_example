import { ACTION_SET_ATTRIBUTE, ACTIVE_GUESTS_SEARCH_TAB_PROP, 
  CURRENT_LAYOUT_PROP, RESERVATIONS_LIST_PROP, CURRENT_SESSION_PROP, 
  CURRENT_TIMESLOT_PROP, CURRENT_VENUE_PROP, DATE_PROP, 
  GUESTS_LIST_PROP, SESSIONS_LIST_PROP, SHOW_AVAILABILITY_MODE_PROP, 
  TIMESLOTS_LIST_PROP, TIMESTAMP_PROP, GUESTS_SEARCH_TEXT_PROP,
  TABLE_PROP} from './constants'

import { 
  getDefaultLayout, getDefaultSession, getDefaultTimestamp, 
  getGuestsList, getInitialDate, getSessions, getTimeslotsList } from './utils'

import { reservationProto, ReservationType, WritableReservationProps } from '../../Classes/Reservation'

import _ from 'lodash'
import { ChangableValues, ReservationComponentState } from '.'
import { Reducer } from 'react'
import { ReservationComponentContext } from './context'
import { valuesAreEqual } from '../../Utils'

type Action = {
  context: ReservationComponentContext
  payload: Partial<ChangableValues>
  type: number
}

type StateKey = keyof ReservationComponentState

const isReservationPropGuarder = (prop: keyof ChangableValues): prop is WritableReservationProps => {
  return prop in reservationProto
}

const reducer: Reducer<ReservationComponentState, Action> = (state, action): ReservationComponentState => {
  const { context, payload } = action
  const reservation = context.reservation!

  const payloadKeys = Object.keys(payload) as (keyof ChangableValues)[]
  const reservationPropsKeys: (keyof ReservationType & WritableReservationProps)[] = payloadKeys.filter(isReservationPropGuarder)
     
  const reservationValues = _.pick(payload, reservationPropsKeys) as ReservationType
  const changedReservationProps = reservationPropsKeys.filter(prop => 
    !valuesAreEqual(reservation[prop], reservationValues[prop])
  )

  const stateValues       = _.omit(payload, reservationPropsKeys)

  context.state = { ...state, ...stateValues }  
  const isChanged = (...propNames: (keyof ChangableValues)[]) => 
    propNames.some(n => 
      isReservationPropGuarder(n) 
        ? changedReservationProps.includes(n)
        : valuesAreEqual(state[n], context.state[n])
    )

  const isEmpty = (...propNames: (keyof ChangableValues)[]) => 
    propNames.some(n => 
      isReservationPropGuarder(n) 
        ? !reservation[n]
        : !context.state[n]
    )

  const setProp = <K extends StateKey>(key: K) => 
    (value: ReservationComponentState[K]) => { 
      if (context.state[key] !== value) 
        context.state[key] = value 
    }

  const setReservationProp = <K extends keyof ReservationType & WritableReservationProps>(key: K, value: ReservationType[K]) => {
    if (value || !isEmpty(key)) {
      reservation[key] = value
    }  
  }

  const setEmpty = <K extends StateKey>(key: K) => {
    context.state[key] = undefined as never
  }

  switch (action.type) {
    case ACTION_SET_ATTRIBUTE:
      
      for (let propName of reservationPropsKeys) {
        setReservationProp(propName, reservationValues[propName])
      }
        
      if (isChanged(ACTIVE_GUESTS_SEARCH_TAB_PROP, GUESTS_SEARCH_TEXT_PROP) || 
        isEmpty(GUESTS_LIST_PROP)) {
          setProp(GUESTS_LIST_PROP)(getGuestsList(context))
      }

      if (isChanged(CURRENT_VENUE_PROP)) {
        setEmpty(CURRENT_LAYOUT_PROP)
        setEmpty(CURRENT_TIMESLOT_PROP)
        setReservationProp(TABLE_PROP, null)
      }

      if (isEmpty(CURRENT_LAYOUT_PROP)) {
        setProp(CURRENT_LAYOUT_PROP)(getDefaultLayout(context))
      }

      if (isEmpty(DATE_PROP)) {
        setProp(DATE_PROP)(getInitialDate(context))
      }

      if (isEmpty(SESSIONS_LIST_PROP) || isChanged(SHOW_AVAILABILITY_MODE_PROP, DATE_PROP) || 
        (context.showByVenue && isChanged(CURRENT_VENUE_PROP))) {
          setProp(SESSIONS_LIST_PROP)(getSessions(context))
          setEmpty(CURRENT_SESSION_PROP)
      }

      if (isChanged(DATE_PROP) || isEmpty(CURRENT_SESSION_PROP)) {
        const session = getDefaultSession(context)
        setProp(CURRENT_SESSION_PROP)(session)
      }

      if (isChanged(CURRENT_SESSION_PROP)) {
        setProp(TIMESLOTS_LIST_PROP)(getTimeslotsList(context))
      }

      if (isEmpty(CURRENT_TIMESLOT_PROP)) {
        setProp(CURRENT_TIMESLOT_PROP)(getDefaultTimestamp(context))
      } else if (isChanged(CURRENT_TIMESLOT_PROP)) {
        setReservationProp(TIMESTAMP_PROP, context.currentTimeslot || null)
        setReservationProp(TABLE_PROP, null)
      }

      if (isChanged(DATE_PROP, CURRENT_VENUE_PROP)) {
        setProp(RESERVATIONS_LIST_PROP)(null)
      }

      console.log('state: ', context.state)
      return context.state
    default:
      return state
  }
}

export default reducer


