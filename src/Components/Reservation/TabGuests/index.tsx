import React, { ChangeEvent, FunctionComponent, SyntheticEvent, useCallback, useEffect, useMemo, useRef } from 'react'

// components
import GuestCard from '../GuestCard'
import { FlexColumn, FlexRow } from '../../FlexContainer'
import Button from '../../Buttons/Button'
import InfoBlock from '../../InfoBlock'
import Menu from '../../Menu'
import Tabs from '../../Tabs'
import NumericInput from '../../NumericInput'

// imported types
import { Dict } from '../../../CommonTypes'
import Reservation, { ChangeStateCallback } from '..'
import { ReservationComponentContext } from '../context'
import { ReservationType } from '../../../Classes/Reservation'
import { GuestType } from '../../../Classes/Guest'

// constants
import { ACTIVE_GUESTS_SEARCH_TAB_PROP, ANONIMOUS_GUESTS_COUNT_PROP, GuestsListTab, GUESTS_SEARCH_TEXT_PROP, MAIN_GUEST_PROP } from '../constants'

// styles
import styles from './styles.module.css'
const searchListElementStyle = { marginRight: 10, marginBottom: 5 }

// local types
type Props = {
  context: ReservationComponentContext,
  changeState: ChangeStateCallback
}

type ValuesHolder = Props & 
  Pick<ReservationComponentContext, 'reservation' | 'nearbyGuestsIdsSet'>

// local constants
const tabs = [
  [GuestsListTab.Nearby, 'Nearby'],
  [GuestsListTab.Party, 'Party'],
  [GuestsListTab.Search, 'Search'],
]

/////////////////////////////////////////////////////////////////////
// COMPONENT
const TabGuests: FunctionComponent<Props> = ({ context, changeState }) => {
  const { reservation, mainGuest, reservationGuests, guestsList, 
    activeGuestsSearchTab, nearbyGuestsIdsSet, guestsSearchText } = context

  // values holder is created to use values without changing handlers
  // since we can call its properties
  const valuesHolder: ValuesHolder = useMemo(
    () => ({ reservation, context, changeState, nearbyGuestsIdsSet }), []
  )
  Object.assign(valuesHolder, { reservation, context, changeState })

  /////////////////////////////////////////////////////////
  // hooks
  const searchInput = useRef<HTMLInputElement>(null)
  useEffect(() => {
    if (activeGuestsSearchTab === GuestsListTab.Search && searchInput.current) {
      (searchInput.current! as HTMLInputElement).focus()
    }
  }, [activeGuestsSearchTab])
  
  //////////////////////////////////////////////////////////
  // handlers
  const changeSearchTab = useCallback((tab: GuestsListTab) => {
    valuesHolder.changeState(ACTIVE_GUESTS_SEARCH_TAB_PROP)(tab)
  }, [])

  const guestsSearchTextChangeHandler = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    valuesHolder.changeState(GUESTS_SEARCH_TEXT_PROP)(e.target.value)
  }, [])

  const changeAnonimousGuestsCount = useCallback((newValue: number) => {
    valuesHolder.changeState(ANONIMOUS_GUESTS_COUNT_PROP)(newValue)
  }, [])

  /////////////////////////////////////////////////////////////
  // change reservation handlers  
  const changeReservation = useCallback((item: ReservationType) => {
    valuesHolder.context.props.changeReservation(item.update())
  }, [])

  const addPartyHandler = useCallback(() => {
    changeReservation(valuesHolder.reservation!.addToParty(...guestsList))
  }, [changeReservation])

  const addGuestFn = useCallback((guest: GuestType) => () => {
    changeReservation(valuesHolder.reservation!.addToParty(guest))
  }, [changeReservation])

  const deleteGuestFn = useCallback((guest: GuestType) => () => {
    changeReservation(valuesHolder.reservation!.removeFromParty(guest))
  }, [changeReservation])

  const changeMainGuestFn = useCallback((guest: GuestType) => () => {
    changeReservation(valuesHolder.reservation!.replaceMainGuest(guest))
    valuesHolder.changeState(MAIN_GUEST_PROP)(guest)
  }, [changeReservation]) 

  /////////////////////////////////////////////////
  // functions
  const GuestCardEl = useCallback((elProps: { 
    guest: GuestType, 
    onClick?: () => void, 
    vertical?: boolean, 
    addButton?: 0 | 1 | 2, 
    menu?: boolean, 
    style?: Dict<any> 
  }) => {
    const { guest, onClick, vertical = false, addButton = 0, menu = false, style = {} } = elProps
    const className = vertical ? styles.GuestCardVertical : styles.GuestCard

    let optionsControls 
    if (addButton) 
      optionsControls = 
        <Button 
          disabled={addButton === 2} 
          onClick={addGuestFn(guest)}>
            Add
        </Button>

    else if (menu) 
      optionsControls = 
        <Menu 
          items={[
            { label: 'Remove', onClick: deleteGuestFn(guest) },
            { label: 'Set as main', onClick: changeMainGuestFn(guest) },
          ]} 
        />
  
    return (
      <GuestCard 
        key={guest.id} 
        vertical={vertical}
        className={className} 
        guest={guest} 
        nearbyGuestsIdsSet={valuesHolder.nearbyGuestsIdsSet} 
        optionsControls={optionsControls}
        onClick={onClick}
        style={style}
      />)
  }, [addGuestFn, changeMainGuestFn, deleteGuestFn])

  //////////////////////////////////////////////////
  // Components
  const reservedForElement = useMemo(() => 
    <InfoBlock labelTop={'Reserved for'}  NoShrink>
      <GuestCardEl guest={mainGuest!} />
    </InfoBlock>
    
    , [mainGuest])

  const partyElement = useMemo(() => 
    <InfoBlock labelTop={'Party'} Grow hideOverflow>
      <FlexColumn FullHeight ScrollableV className={styles.PartyCards}> 
        {reservationGuests.map(item => (<GuestCardEl menu guest={item} />))}
      </FlexColumn>
    </InfoBlock>
  
  , [reservationGuests])

  const anonimousGuestsElement = useMemo(() => 
    <InfoBlock labelLeft={'Anonimous guests'} NoShrink>
      <FlexRow ContentCenter>
        <NumericInput
          min={0}
          value={reservation!.anonimousGuestsCount}
          onChange={changeAnonimousGuestsCount}
        />
      </FlexRow>
    </InfoBlock> 
  
  , [reservation?.anonimousGuestsCount, changeAnonimousGuestsCount])

  const guestsSearchList = useMemo(() => {
    const partyIds = new Set(reservation!.party.map(v => v.id))

    return <FlexRow Grow ScrollableV FullWidth className={styles.GuestsSearchList}>
      {guestsList.map(item => (<GuestCardEl key={item.id}
        addButton={partyIds.has(item.id) ? 2 : 1}
        vertical guest={item} onClick={addGuestFn(item)} 
        style={searchListElementStyle}
      />))}
    </FlexRow>
  }
  , [guestsList, mainGuest, reservationGuests])

  ///////////////////////////////////////////////////////
  // Component
  return (
    <FlexRow FullWindow OverflowVHidden className={styles.GuestsBlock}>
      <FlexColumn OverflowVHidden FullHeight NoShrink className={styles.GuestsSidebar}> 
        { reservedForElement }
        { partyElement }
        { anonimousGuestsElement }
      </FlexColumn>
      
      <FlexColumn FullHeight Grow className={styles.GuestsSearchListBlock}>
        <Tabs
          className={styles.GuestsSearchTabs} 
          tabs={tabs}
          value={activeGuestsSearchTab} 
          onChange={changeSearchTab}  
        />
        <div className={styles.GuestsSearchActionArea}>  
          {activeGuestsSearchTab === GuestsListTab.Party && 
            <Button type='link' 
              disabled={!guestsList.length} 
              onClick={addPartyHandler}>
                {'ADD ALL'}
            </Button>
          }
          {activeGuestsSearchTab === GuestsListTab.Search && 
            <input 
              ref={searchInput}
              placeholder={'type name or cabin number'}
              className={styles.SearchInput} 
              value={guestsSearchText} 
              onChange={guestsSearchTextChangeHandler} />
          }
        </div>
        { guestsSearchList }
      </FlexColumn>
    </FlexRow>
  )
}

export default TabGuests
