export const IS_INITIALIZED_PROP = 'isInitialized'

export const TAB_GUESTS = 'TAB_GUESTS'
export const TAB_TABLES = 'TAB_TABLES'

export const GUESTS_SEARCH_TAB_NEARBY = 'SEARCH_TAB_NEARBY'
export const GUESTS_SEARCH_TAB_PARTY = 'SEARCH_TAB_PARTY'
export const GUESTS_SEARCH_TAB_ALL = 'SEARCH_TAB_ALL'
export const GUESTS_SEARCH_TABS = [
  GUESTS_SEARCH_TAB_ALL, 
  GUESTS_SEARCH_TAB_NEARBY, 
  GUESTS_SEARCH_TAB_PARTY
]

export const GUESTS_SEARCH_TEXT_PROP = 'guestsSearchText'

export const ACTION_SET_RESERVATION = 0
export const ACTION_SET_ATTRIBUTE = 1

export const ACTIVE_TAB_PROP = 'activeTab'
export const ACTIVE_GUESTS_SEARCH_TAB_PROP = 'activeGuestsSearchTab'
export const CURRENT_VENUE_PROP = 'currentVenue'
export const CURRENT_LAYOUT_PROP = 'currentLayout'
export const DATE_PROP = 'date'
export const SESSIONS_LIST_PROP = 'sessions'
export const TIMESLOTS_LIST_PROP = 'timeslotsList'
export const CURRENT_DATE_TIME_PROP = 'currentDate'
export const CURRENT_SESSION_PROP = 'currentSession'
export const CURRENT_INTERVAL_PROP = 'currentInterval'
export const GUESTS_LIST_PROP = 'guestsList'

export const SHOW_AVAILABILITY_MODE_PROP = 'availabilityMode'
export const CURRENT_TIMESLOT_PROP = 'currentTimeslot'

export enum ShowAvailabilityMode {
  byDate = 'BY_DATE',
  byVenue = 'BY_VENUE'
}

export enum ComponentTab {
  Guests = 'GUESTS',
  Tables = 'TABLES'
}

export enum GuestsListTab {
  Search = 'SEARCH',
  Nearby = 'NEARBY',
  Party = 'PARTY'
}

export const TABLE_PROP = 'table'
export const TIMESTAMP_PROP = 'timestamp'
export const ANONIMOUS_GUESTS_COUNT_PROP = 'anonimousGuestsCount'
export const MAIN_GUEST_PROP = 'mainGuest'

export const FETCH_RESERVATIONS_PROP = 'fetchReservations'
export const RESERVATIONS_LIST_PROP = 'reservationsList'

export const DEFAULT_TIMESTAMP_FORMAT = 'MMM, DD H:mm'