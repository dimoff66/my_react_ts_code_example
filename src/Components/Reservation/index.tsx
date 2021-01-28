// react
import React, { useCallback, useEffect, useMemo, useReducer } from 'react'
import { connect } from 'react-redux'

// component helpers
import createContextObject, { mapDispatchToProps, mapStateToProps, Props } from './context'
import stateReducer from './stateReducer'
import { fetchReservations, getTableTabLabel } from './utils'

// helpers
import _ from 'lodash'

// components
import TabGuests from './TabGuests'
import TabTables from './TabTables'
import { FlexColumn, FlexRow } from '../FlexContainer'
import Button from '../Buttons/Button'
import ButtonClose from '../Buttons/ButtonClose'

// server connection
import agent from '../../Utils/agent'

// types
import { MomentType } from '../../Classes/Moment'
import { GuestType } from '../../Classes/Guest'
import { SessionsType } from '../../Classes/Sessions'
import { SessionType } from '../../Classes/Session'
import { VenueType } from '../../Classes/Venue'
import { LayoutType } from '../../Classes/Layout'
import { ReservationType, WritableReservationProps } from '../../Classes/Reservation'


// constants
import { ACTION_SET_ATTRIBUTE, ACTIVE_TAB_PROP, RESERVATIONS_LIST_PROP,
  IS_INITIALIZED_PROP, ShowAvailabilityMode, ComponentTab, GuestsListTab, 
  } from './constants'

// styles
import componentStyles from './styles.module.css'
import { joinStyles } from '../StyledElement'
const styles = joinStyles(componentStyles, { TabActive: 'Tab' })

// local constants
const initialState = (reservation: ReservationType): ReservationComponentState => ({
  activeTab: ComponentTab.Guests,
  currentDateTime: reservation.sailing.getCurrentTime(),
  currentVenue: reservation.venue || reservation.sailing.venues[0],
  
  activeGuestsSearchTab: GuestsListTab.Nearby,
  guestsSearchText: '',
  currentTimeslot: reservation.timestamp || null,

  availabilityMode: ShowAvailabilityMode.byVenue
})

// local types
export interface ReservationComponentState {
  isInitialized?: boolean

  currentDateTime: MomentType
  currentDate?: MomentType
  availabilityMode: ShowAvailabilityMode
  activeTab: ComponentTab
  activeGuestsSearchTab: GuestsListTab
  guestsList?: GuestType[]
  guestsSearchText: string
  date?: MomentType
  sessions?: SessionsType
  currentSession?: SessionType
  currentVenue?: VenueType
  currentLayout?: LayoutType
  timeslotsList?: {
    venue: VenueType
    timeslots: Array<[v: VenueType, m: MomentType]>
  }[]
  currentTimeslot?: MomentType | null
  reservationsList?: ReservationType[] | null
}

export type ChangableValues = 
  ReservationComponentState & Pick<ReservationType, WritableReservationProps>

export type ChangeStateCallback = <K1 extends CKey, K2 extends CKey, K3 extends CKey> 
  (key1: K1, key2?: K2, key3?: K3) => 
  (value1: ChangableValues[K1], value2?: ChangableValues[K2], value3?: ChangableValues[K3]) => 
  void

type CKey = keyof ChangableValues

///////////////////////////////////////////////////////////
// Component
const Reservation: React.FC<Props> = (props: Props) => {
  ////////////////////////////////////////////////////
  // INITIAL STATE PREPARATION
  const initialStateValue = useMemo(() => initialState(props.reservation as ReservationType), [])
  const [state, dispatch] = useReducer(stateReducer, initialStateValue)
  console.log('props: ', props)

  ////////////////////////////////////////////////////////////
  // context values initialization
  const context = useMemo(() => createContextObject(props, state), [props, state])
  const reservation = context.reservation!

  ///////////////////////////////////////////////////////
  // handlers
  const changeState = useCallback(
    <K1 extends keyof ChangableValues, K2 extends keyof ChangableValues, K3 extends keyof ChangableValues> 
    (key1: K1, key2?: K2, key3?: K3) => 
    (value1: ChangableValues[K1], value2?: ChangableValues[K2], value3?: ChangableValues[K3]) => {
      
      const pairs = [
        [key1, value1], 
        [key2, value2], 
        [key3, value3]
      ].filter(([key]) => Boolean(key))

      const payload = _.fromPairs(pairs)
      dispatch({ context, payload, type: ACTION_SET_ATTRIBUTE })

      setTimeout(() => {
        if (reservation.currentlyModified) {
          props.changeReservation(reservation.update())
        }
      }, 0)  
    }, 
    [context, dispatch])

  const changeActiveTab = (tab: ComponentTab) => changeState(ACTIVE_TAB_PROP)(tab)

  const onCloseHandler = () => { props.changeReservation(null) }

  const saveReservationHandler = () => {
    if (!reservation.validate()) return 

    agent.saveReservation(reservation.getData()).then(id => {
      const updatedReservation = reservation.update({ id }, false)
      props.changeReservation(updatedReservation)
    }) 
  }

  /////////////////////////////////////////
  // effects

  // --- state props initialization ------
  useEffect(
    () => {
      if (!context.isInitialized) {
        changeState(IS_INITIALIZED_PROP)(true)
      }
    }, 

    [context.isInitialized]
  )

  // --- load reservations ------------------
  useEffect(() => {
    if (!context.reservationsList && context.date) {
      fetchReservations(context).then(changeState(RESERVATIONS_LIST_PROP))
    }
  })
  ///////////////////////////////////////////////

  /////////////////////////////////////////////////
  // render helpers
  const getTabClass = (tabName: ComponentTab) => context.activeTab === tabName ? styles.TabActive : styles.Tab
  const tabGuestsClass = getTabClass(ComponentTab.Guests)
  const tabTablesClass = getTabClass(ComponentTab.Tables)

  ///////////////////////////////////////////////////
  // title variables
  const title = !reservation.id ? 'Add new reservation' : 'Edit reservation'
  const tableTabLabel = getTableTabLabel(context)

  //////////////////////////////////////////////////
  // rendering
  return (
    <FlexColumn FullHeight className={styles.Reservation}>
      <FlexRow className={styles.Header}>
        <FlexRow className={styles.HeaderLeftPart} >
          <ButtonClose className={styles.ButtonClose} onClick={onCloseHandler} />
          <span className={styles.HeaderTitle}>{title}</span>
        </FlexRow>
        <FlexRow Grow JustifyCenter className={styles.HeaderMiddlePart} >
          <span className={tabGuestsClass} 
            onClick={() => { changeActiveTab(ComponentTab.Guests) }}
          >
            {reservation.partySizeString}
          </span>
          <span className={tabTablesClass} 
            onClick={() => { changeActiveTab(ComponentTab.Tables) }}
          >
            {tableTabLabel}
          </span>
        </FlexRow>
        <FlexRow className={styles.HeaderRightPart} >
          <Button 
            disabled={!reservation.modified} 
            className={styles.ButtonDone}
            onClick={saveReservationHandler}>DONE</Button>
        </FlexRow>
      </FlexRow>
      <FlexRow Grow OverflowVHidden>
        { context.activeTab === ComponentTab.Guests && <TabGuests context={context} changeState={changeState} />}
        { context.activeTab === ComponentTab.Tables && <TabTables context={context} changeState={changeState} />}
      </FlexRow>  
    </FlexColumn>
  )
}

export default connect(mapStateToProps, mapDispatchToProps)(Reservation)