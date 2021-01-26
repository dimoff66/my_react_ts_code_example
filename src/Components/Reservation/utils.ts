import Guest, { GuestDataType, GuestType } from "../../Classes/Guest"
import Reservation, { ReservationDataType, ReservationType } from "../../Classes/Reservation"
import Sessions from "../../Classes/Sessions"
import agent from "../../Utils/agent"
import { DEFAULT_TIMESTAMP_FORMAT, GuestsListTab } from "./constants"
import { DataSourcesCollection } from "../../Classes/Basic"
import { Dict, ValueViewInfo } from "../../CommonTypes"
import { MomentType } from "../../Classes/Moment"
import { ReservationComponentContext } from "./context"
import { ReservationComponentState } from '.'

import _ from 'lodash'
import { VenueType } from "../../Classes/Venue"

//////////////////////////////////////////
export const getGuestsList = (context: ReservationComponentContext) => {
  const reservation     = context.reservation!
  const dataSources     = context.dataSources!
  const guestsMap       = context.guestsMap as Dict<GuestDataType>
  const nearbyGuestsIds = context.nearbyGuestsIds as string[]

  const createGuest = (data: GuestDataType) => Guest(data, dataSources)

  switch (context.activeGuestsSearchTab) {
    case GuestsListTab.Nearby:
      return nearbyGuestsIds.map(id => createGuest(guestsMap[id]))
    case GuestsListTab.Party:
      return reservation.mainGuest?.party || []
    case GuestsListTab.Search:
      const { guestsSearchText } = context
      const guests = context.guests as GuestDataType[] 
      if (!guestsSearchText || guestsSearchText.length < 2) return [] 

      const guestsSearchTextUpper = guestsSearchText.toUpperCase().trim()

      const result = guests
        .map(item => 
          (
            item.firstName.toUpperCase().includes(guestsSearchTextUpper) || 
            item.secondName.toUpperCase().includes(guestsSearchTextUpper) || 
            item.cabinNumber.toString().includes(guestsSearchTextUpper) 
          ) && createGuest(item) 
        )
        .filter(Boolean) as GuestType[]

      return result
  }
}

///////////////////////////////////////////////////
export const getSailingDates = (context: ReservationComponentContext) => {
  const [sailingDateStart, sailingDateEnd] = context.sailing!.dates 
  const { currentDate } = context

  const dates = []
  let date = sailingDateStart.max(currentDate.subtract(1, 'day'))
  
  while (sailingDateEnd.moreThan(date)) {
    dates.push(date)
    date = date.add(1, 'day')
  }
  
  const allDates: ValueViewInfo[] = dates
    .concat(sailingDateEnd)
    .map(date => 
      [
        date, 
        date.format('DD \n MMM'), 
        { disabled: currentDate.moreThan(date) }
      ]
    )

  return allDates
}

////////////////////////////////////////////////////
export const getInitialDate = (context: ReservationComponentContext) => {
  const currentPoint = context.timestamp || context.currentDate
  const date = currentPoint.morningDate

  if (
    context.showByVenue && 
    context.currentVenue &&
    currentPoint.moreThan(context.currentVenue.getLastTimestamp(date))
  ) 
    return date.add(1, 'day')

  return date
}

/////////////////////////////////////////////////////
export const getSessions = (context: ReservationComponentContext) => {
  const sessions = context.showByDate
    ?
      Sessions([
        { timeStart: '06:00', timeEnd: '12:00' },
        { timeStart: '12:00', timeEnd: '18:00' },
        { timeStart: '18:00', timeEnd: '02:00' },
      ])
   : context.currentVenue!.sessions  

  return sessions.useDate(context.date as MomentType)
}

/////////////////////////////////////////////////
export const getDefaultLayout = (context: ReservationComponentContext) => {
  const { table } = context.reservation! 
  if (table) return table.layout 

  return context.currentVenue!.defaultLayout
}

//////////////////////////////////////////////////////
export const getDefaultSession = (context: ReservationComponentContext) => {
  const { sessions, date, timestamp, currentDateTime } = context 
  const currentPoint = timestamp || currentDateTime
  const session = sessions!.getClosestSession(
    (currentPoint.isEqualDate(date) && currentPoint) || null
  )

  return session
}

////////////////////////////////////////////////////////
export const getDefaultTimestamp = (context: ReservationComponentContext) => {
  const { currentVenue, currentSession, reservation } = context
  const timestamp = currentSession!.findCurrentTimeslot(
    reservation!.actualTimestamp as MomentType, 
    currentVenue!
  )
  return timestamp
}

////////////////////////////////////////////////////////
export const getTimeslotsList = (context: ReservationComponentContext) => {
  const { currentSession, date } = context

  const venues = context.showByDate
    ? context.venues!
    : [context.currentVenue!]  

  const timeslots: ReservationComponentState['timeslotsList'] = 
    venues.map(venue => ({
      venue,
      timeslots: venue
        .getTimeslots(date!, currentSession!)
        .map(v => [venue, v] as [v: VenueType, m: MomentType])
    }))

  return timeslots
}

///////////////////////////////////////////////////////
export const fetchReservations = async (context: ReservationComponentContext) => {
  const currentVenue = (context.showByVenue && context.currentVenue) || null

  const date = context.date!
  const venues = currentVenue ? [currentVenue] : context.venues!
  const timeFrom  = Math.min(...venues.map(v => v.getFirstTimestamp(date).timestamp))
  const timeTo    = Math.max(...venues.map(v => v.getLastTimestamp(date).timestamp))

  const dataSources = context.dataSources!
  
  const items: ReservationDataType[] = await agent.fetchReservations(timeFrom, timeTo, currentVenue?.id)
  return items.map(item => Reservation(item, dataSources))
}

////////////////////////////////////////////////////////
export const getReservationsMap = (context: ReservationComponentContext) => {
  const { currentTimeslot, date, reservationsList } = context
  if (!currentTimeslot || !reservationsList || !currentTimeslot.isEqualDate(date)) return null

  const { reservation, currentVenue, sailing } = context

  const timeslotStartTime = currentTimeslot
  const timeslotEndTime = currentTimeslot.add(currentVenue!.timeslotsStep, 'minute')
  const proposedEndTime = reservation!.proposedEndTime!

  const { maxSittingDuration } = currentVenue || sailing!
  const timeFrom = currentTimeslot.subtract(maxSittingDuration, 'minute')
  const timeTo = currentTimeslot.add(maxSittingDuration, 'minute')

  const timeslotReservations: ReservationType[] = reservationsList
    .filter(item => item.actualTimestamp?.isBetween(timeFrom, timeTo))  
    .filter(item => {
      const actualTimestamp = item.actualTimestamp!
      const itemProposedEndTime = item.proposedEndTime!

      if (actualTimestamp.lessThan(timeslotStartTime)) {
        return itemProposedEndTime.moreThan(timeslotStartTime) 
      } else if (actualTimestamp.lessThan(timeslotEndTime)) {
        return true
      } else if (proposedEndTime.moreThan(actualTimestamp)) {
        return true
      }
      return false
    })

  return _.groupBy(timeslotReservations, 'tableId')
}

//////////////////////////////////////////////////////
export const getTableTabLabel = (context: ReservationComponentContext) => {
  const { currentTimeslot, table } = context

  const label = table
    ? `${table.name} at ${currentTimeslot!.format(DEFAULT_TIMESTAMP_FORMAT)}`
    : 'TABLES'
  
  return label
}

///////////////////////////////////
export const getLayoutTablesProps = 
  (
    context: ReservationComponentContext, 
    reservationsMap: Dict<ReservationType[]> | null
  ) => {
  
  const { currentLayout, table: reservationTable, reservation } = context
  const tables = currentLayout?.tables || []

  return tables.map(table => {
    const isReservationTable = table.isEqual(reservationTable)
    const reservations = reservationsMap?.[table.id!] || []

    const currentReservationIndex = reservations.findIndex(item => item.isEqual(reservation))
    if (isReservationTable && currentReservationIndex < 0) {
      reservations.push(reservation!)
    } else if (!isReservationTable && currentReservationIndex > -1) {
      reservations.splice(currentReservationIndex, 1)
    }

    const isSelected = isReservationTable
    const status = table.getAvailabilityInfo(reservation!, reservationsMap)[0]

    return ({ table, reservations, isSelected, status })
  })
}
