import React, { ChangeEvent, FunctionComponent, SyntheticEvent } from 'react'
import Button from '../../Buttons/Button'
import { FlexColumn, FlexRow } from '../../FlexContainer'
import InfoBlock from '../../InfoBlock'
import Menu from '../../Menu'
import Tabs from '../../Tabs'

import { ReservationComponentContext } from '../context'

import { ACTIVE_GUESTS_SEARCH_TAB_PROP, ANONIMOUS_GUESTS_COUNT_PROP, GuestsListTab, GUESTS_SEARCH_TAB_ALL, GUESTS_SEARCH_TAB_NEARBY, GUESTS_SEARCH_TAB_PARTY, GUESTS_SEARCH_TEXT_PROP } from '../constants'
import GuestCard from '../GuestCard'
import styles from './styles.module.css'
import { ReservationType } from '../../../Classes/Reservation'
import { GuestType } from '../../../Classes/Guest'
import { Dict } from '../../../CommonTypes'
import { ChangeStateCallback } from '..'
import NumericInput from '../../NumericInput'

type Props = {
  context: ReservationComponentContext,
  changeState: ChangeStateCallback
}

const searchListElementStyle = { marginRight: 5, marginBottom: 5 }

const TabGuests: FunctionComponent<Props> = ({ context, changeState }) => {
  const { reservation, mainGuest, reservationGuests, guestsList, 
    activeGuestsSearchTab, nearbyGuestsIdsSet, guestsSearchText } = context
  
  const changeSearchTab = (tab: GuestsListTab) => {
    changeState(ACTIVE_GUESTS_SEARCH_TAB_PROP)(tab)
  }

  const guestsSearchTextChangeHandler = (e: ChangeEvent<HTMLInputElement>) => {
    changeState(GUESTS_SEARCH_TEXT_PROP)(e.target.value)
  }

  const changeAnonimousGuestsCount = (newValue: number) => {
    changeState(ANONIMOUS_GUESTS_COUNT_PROP)(newValue)
  }
    
  const changeReservation = (item: ReservationType) => {
    context.props.changeReservation(item.update())
  }

  const addPartyHandler = () => {
    changeReservation(reservation!.addToParty(...guestsList))
  }

  const addGuestFn = (guest: GuestType) => () => 
    changeReservation(reservation!.addToParty(guest))

  const deleteGuestFn = (guest: GuestType) => () => 
    changeReservation(reservation!.removeFromParty(guest))

  const changeMainGuestFn = (guest: GuestType) => () => 
    changeReservation(reservation!.replaceMainGuest(guest))

  const tabs = [
    [GuestsListTab.Nearby, 'Nearby'],
    [GuestsListTab.Party, 'Party'],
    [GuestsListTab.Search, 'Search'],
  ]

  const GuestCardEl = (elProps: { 
    guest: GuestType, 
    onClick?: () => void, 
    vertical?: boolean, 
    addButton?: boolean, 
    menu?: boolean, 
    style?: Dict<any> 
  }) => {
    const { guest, onClick, vertical = false, addButton = false, menu = false, style = {} } = elProps
    const className = vertical ? styles.GuestCardVertical : styles.GuestCard

    let optionsControls 
    if (addButton) optionsControls = <Button onClick={addGuestFn(guest)}>Add</Button>
    if (menu) optionsControls = <Menu 
      items={[
        { label: 'Remove', onClick: deleteGuestFn(guest) },
        { label: 'Set as main', onClick: changeMainGuestFn(guest) },
      ]} 
    />
  
    return (<GuestCard key={guest.id} 
      vertical={vertical}
      className={className} 
      guest={guest} 
      nearbyGuestsIdsSet={nearbyGuestsIdsSet} 
      optionsControls={optionsControls}
      onClick={onClick}
      style={style}
    />)
  }

  return (
    <FlexRow FullWindow OverflowVHidden className={styles.GuestsBlock}>
      <FlexColumn OverflowVHidden FullHeight NoShrink className={styles.GuestsSidebar}> 
        <InfoBlock labelTop={'Reserved for'}  NoShrink>
          <GuestCardEl guest={mainGuest!} />
        </InfoBlock>
        
        <InfoBlock labelTop={'Party'} Grow hideOverflow>
          <FlexColumn FullHeight ScrollableV className={styles.PartyCards}> 
            {reservationGuests.map(item => (<GuestCardEl menu guest={item} />))}
          </FlexColumn>
        </InfoBlock>
        
        <InfoBlock labelLeft={'Anonimous guests'} NoShrink>
          <FlexRow ContentCenter>
            <NumericInput
              min={0}
              value={reservation!.anonimousGuestsCount}
              onChange={changeAnonimousGuestsCount}
            />
          </FlexRow>
        </InfoBlock> 
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
            <Button type='link' onClick={addPartyHandler}>{'ADD ALL'}</Button>
          }
          {activeGuestsSearchTab === GuestsListTab.Search && 
            <input 
              placeholder={'type name or cabin number'}
              className={styles.SearchInput} 
              value={guestsSearchText} 
              onChange={guestsSearchTextChangeHandler} />
          }
        </div>
        <FlexRow Grow ScrollableV FullWidth className={styles.GuestsSearchList}>
          {guestsList.map(item => (<GuestCardEl 
            vertical addButton guest={item} onClick={addGuestFn(item)} 
            style={searchListElementStyle}
          />))}
        </FlexRow>
      </FlexColumn>
    </FlexRow>
  )
}

export default TabGuests
