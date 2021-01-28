import React, { FunctionComponent, useCallback, useEffect, useMemo, useRef } from 'react'

// components
import Table from '../Table'
import StyledElement, { joinStyles } from '../../StyledElement'
import { FlexColumn, FlexRow } from '../../FlexContainer'
import InfoBlock from '../../InfoBlock'
import Tabs from '../../Tabs'
import Button from '../../Buttons/Button'
import RadioButtons from '../../RadioButtons'
import Select from '../../Select/index'

// types
import { ReservationComponentContext } from '../context'
import { MomentType } from '../../../Classes/Moment'
import { VenueType } from '../../../Classes/Venue'
import { ValueViewInfo } from '../../../CommonTypes'
import { ChangableValues, ChangeStateCallback } from '..'

// utils
import _ from 'lodash'
import { getLayoutTablesProps, getReservationsMap, getSailingDates } from '../utils'

// constants
import { CURRENT_LAYOUT_PROP, CURRENT_SESSION_PROP, CURRENT_TIMESLOT_PROP, CURRENT_VENUE_PROP, DATE_PROP, ShowAvailabilityMode, SHOW_AVAILABILITY_MODE_PROP, TABLE_PROP } from '../constants'

// css
import componentStyles from './styles.module.css'
const styles = joinStyles(componentStyles, { 
  DateButtonActive: 'DateButton', 
  TimeslotButtonActive: 'TimeslotButton', 
})

// local types
type Props = {
  context: ReservationComponentContext,
  changeState: ChangeStateCallback
}

type ChangableKey = keyof ChangableValues 

type VenueTimeslotPair = [v: VenueType, t: MomentType]

type ChangableValue<K extends keyof ChangableValues> = 
  ChangableValues[K] & { isEqual: (that: ChangableValues[K]) => boolean }

type ValuesCollector = [ChangableKey[], any[]]


// styles
const venueSelectStyle = { 
  backgroundColor: 'rgb(116, 26, 134)', 
  paddingLeft: 9,
  borderRadiusTopLeft: 5,
  color: 'white'
}
const layoutSelectStyle = { width: 120, margin: 20 }
const venueLineStyles = {  Label: { width: 80 } }
const infoLabelStyles = {  Label: { width: 150 } }

////////////////////////////////
// constants
const availabilityModeButtons = [
  [ShowAvailabilityMode.byVenue, 'by Venue'] as ValueViewInfo, 
  [ShowAvailabilityMode.byDate, 'by Date'] as ValueViewInfo
]

///////////////////////////////////////////////////////////////
const TabTables: React.FC<Props> = ({ context, changeState }) => {
  const { availabilityMode, sailing, currentVenue, currentLayout, table, date,
    currentSession, sessionsList, timeslotsList, currentTimeslot, currentDate, 
    currentDateTime, reservationsList, reservation, showByVenue, showByDate
  } = context
  
  /////////////////////////////////////////////////////
  // handlers
  const useOnChangeHandler = 
    <K extends ChangableKey>(
      prop: K, 
      currentValue: ChangableValues[K], 
      isModelInstance = false
    ) => {

    const handler = (v: ChangableValue<K>, e?: any, collector?: ValuesCollector, release = false) => {
      
      const valueIsChanged = isModelInstance 
        ? Boolean(v) !== Boolean(currentValue) || (v && !v.isEqual(currentValue)) 
        : v !== currentValue

      if (valueIsChanged) {
        if (collector) {
          collector[0].push(prop)
          collector[1].push(v)
        } else {
          changeState(prop)(v)
        }
      }

      if (release && collector?.[0].length) {
        const [[key1, key2, key3], [value1, value2, value3]] = collector
        changeState(key1, key2, key3)(value1, value2, value3)
      }
    }

    return useCallback(handler, [changeState, currentValue])
  }

  const onModeChange            = useOnChangeHandler(SHOW_AVAILABILITY_MODE_PROP, availabilityMode)
  const onVenueChange           = useOnChangeHandler(CURRENT_VENUE_PROP, currentVenue, true) 
  const onLayoutChange          = useOnChangeHandler(CURRENT_LAYOUT_PROP, currentLayout, true) 
  const onTableChange           = useOnChangeHandler(TABLE_PROP, table || null, true) 
  const onDateChange            = useOnChangeHandler(DATE_PROP, date) 
  const onCurrentTimeslotChange = useOnChangeHandler(CURRENT_TIMESLOT_PROP, currentTimeslot) 
  const onCurrentSessionChange  = useOnChangeHandler(CURRENT_SESSION_PROP, currentSession) 

  const onCurrentTimeslotAndVenueChange = useCallback(([venue, timeslot]) => {
    const keysValues: ValuesCollector = [[], []]
    onVenueChange(venue, null, keysValues)
    onCurrentTimeslotChange(timeslot, null, keysValues, true)
  }, [onVenueChange, onCurrentTimeslotChange])

  //////////////////////////////////////////////////////////
  // calculatable values
  const sessionsListItems = useMemo(
    () => sessionsList!.map(session => 
        [session, session.view, { disabled: session.dateTimeEnd.lessThan(currentDateTime) }] as ValueViewInfo
      )
    ,
    [sessionsList, date, currentDateTime]
  )

  const sailingDatesTabs  = useMemo(() => getSailingDates(context), [currentDate.timestamp])
  const reservationsMap   = useMemo(() => getReservationsMap(context), [currentTimeslot, reservationsList])

  const tablesProps = useMemo(
    () => getLayoutTablesProps(context, reservationsMap),
    [currentLayout, table, currentTimeslot, reservationsList, reservation!.partySize]
  )

  ////////////////////////////////////////////////////
  // refs
  const currTimeslotButton = useRef()

  useEffect(() => {
    if (currTimeslotButton.current) {
      (currTimeslotButton.current! as HTMLElement).scrollIntoView()
    }
  }, [currentSession])

  ////////////////////////////////////////////////////
  // helpers

  const getDateButtonStyle = (value: MomentType) => 
    value?.timestamp === date?.timestamp ? styles.DateButtonActive : styles.DateButton

  const buttonIsActive = ([venue, value]: VenueTimeslotPair) =>
    (venue.isEqual(currentVenue)) && 
    value?.timestamp === currentTimeslot?.timestamp 

  const getTimeslotButtonStyle = (isActive: boolean) => 
    isActive ? styles.TimeslotButtonActive : styles.TimeslotButton

  const getTimeslotButton = useCallback(
    (pair: VenueTimeslotPair, i: number) => {
      const [, timestamp] = pair
      const isActive = buttonIsActive(pair)
      const ref = isActive ? currTimeslotButton : null

      return (
        <Button key={i} reference={ref}
          className={getTimeslotButtonStyle(isActive)}
          value={pair} 
          disabled={currentDateTime.moreThan(timestamp)}
          onClick={onCurrentTimeslotAndVenueChange}>
          {timestamp.format('H:mm')}
        </Button>
      )
    }, [currentVenue, currentTimeslot, currentDateTime]) 
  

  ///////////////////////////////////////////////
  // elements 

  const venueSelectElement = useMemo(
    () => showByVenue && (
      <InfoBlock labelLeft={'Venue'} styles={infoLabelStyles}>
        <Select 
          iconClassName={styles.VenueSelectIcon}
          value={currentVenue} 
          options={sailing!.venuesSelectOptions} 
          style={venueSelectStyle}
          onChange={onVenueChange}
          emptyValueTip={ false } />       
      </InfoBlock>
  ), [currentVenue, onVenueChange])

  const sailingDatesButtonsElement = useMemo(
    () => sailingDatesTabs.map(
      ([item, title, opts]: ValueViewInfo) => {
        const [dateString, monthString] = title.split(' ')

        return <Button 
          className={getDateButtonStyle(item)}
          value={item}
          disabled={opts?.disabled} 
          onClick={onDateChange}>
            <FlexColumn className={styles.SailingDateBlock}>
              <FlexRow ContentCenter className={styles.SailingDateText}>{dateString}</FlexRow>
              <FlexRow ContentCenter className={styles.SailingMonthText}>{monthString}</FlexRow>
            </FlexColumn>
          </Button>
      }), [sailingDatesTabs, onDateChange, date])

  const timeslotsElement = useMemo(() => 
    showByVenue 
      ? <FlexColumn Grow ScrollableV FullWidth>
          { timeslotsList![0].timeslots.map(getTimeslotButton) }
        </FlexColumn>

      : <FlexColumn Grow ScrollableV FullWidth style={{ paddingTop: 10 }}>
          { timeslotsList!.map(({ venue, timeslots }, i) => 
            <InfoBlock key={i} labelLeft={venue.name} styles={venueLineStyles} hideOverflow>
              <FlexRow ScrollableH>
                {timeslots.map(getTimeslotButton)}
              </FlexRow>
            </InfoBlock>  
          )}
        </FlexColumn>, [timeslotsList, getTimeslotButton])

  const layoutSelectElement =  useMemo(() => 

    <Select 
      value={currentLayout} 
      options={currentVenue!.layoutsSelectOptions} 
      onChange={onLayoutChange} 
      style={layoutSelectStyle}
      emptyValueTip={ false }
    />
    
    , [onLayoutChange])
   
  ////////////////////////////////////////////////
  // rendering
  return (
    <FlexRow Grow ScrollableV FullWidth className={styles.TablesTab}>
      <FlexColumn className={styles.TablesTabSidebar}> 
        <InfoBlock labelLeft={'Availability mode'} styles={infoLabelStyles}>
          <RadioButtons value={availabilityMode} buttons = {availabilityModeButtons} onChange={onModeChange}/>
        </InfoBlock>

        {venueSelectElement}

        <InfoBlock labelTop={'Dates'}>
          <FlexRow ScrollableH>
            {sailingDatesButtonsElement}
          </FlexRow>
        </InfoBlock>

        <Tabs 
          tabs={sessionsListItems} 
          value={currentSession} 
          onChange={onCurrentSessionChange} 
        />
        
        {timeslotsElement}
      </FlexColumn>

      <FlexColumn Grow className={styles.TablesTabMain}> 
        <StyledElement PosRelative Scrollable FullHeight 
          className={styles.TablesMapContainer}>

            {tablesProps.map(p => <Table onClick={onTableChange} {...p} />)}

        </StyledElement>
        
        {layoutSelectElement}
        
      </FlexColumn>
    </FlexRow>
  )
}

export default TabTables