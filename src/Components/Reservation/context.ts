import { Dispatch } from "react"
import { ReservationComponentState } from "."
import { ReservationType } from "../../Classes/Reservation"
import { ActionType } from "../../Store/actions"
import { RootAction, RootState } from "../../Store/reducer"
import { nearbyIdsSetSelector } from "../../Store/selectors"
import { ShowAvailabilityMode } from "./constants"

export const mapStateToProps = (state: RootState) => ({
  nearbyGuestsIdsSet: nearbyIdsSetSelector(state),
  guests: state.guests,
  reservation: state.reservation
})

export const mapDispatchToProps = (dispatch: Dispatch<RootAction>) => ({
  changeReservation: (payload: ReservationType | null) => 
    dispatch({ type: ActionType.CHANGE_RESERVATION, payload })
})

export type Props = ReturnType<typeof mapStateToProps> & ReturnType<typeof mapDispatchToProps>

const createContextObject = (props: Props, state: ReservationComponentState) => ({
  props,
  state,

  get isInitialized ()      { return this.state.isInitialized || false },

  get currentDateTime ()    { return this.state.currentDateTime },
  get currentDate ()        { return this.currentDateTime.morningDate },
  get availabilityMode ()   { return this.state.availabilityMode },
  get activeTab ()          { return this.state.activeTab },
  get activeGuestsSearchTab () { return this.state.activeGuestsSearchTab },
  get guestsList ()         { return this.state.guestsList || [] },
  get guestsSearchText ()   { return this.state.guestsSearchText },

  get date ()               { return this.state.date },
  get sessions ()           { return this.state.sessions },
  get sessionsList ()       { return this.sessions?.sessions },
  get currentSession ()     { return this.state.currentSession },
  get currentVenue ()       { return this.state.currentVenue },
  get currentLayout ()      { return this.state.currentLayout },
  get timeslotsList ()      { return this.state.timeslotsList },
  get currentTimeslot ()    { return this.state.currentTimeslot },
  get reservationsList ()   { return this.state.reservationsList },

  get reservation ()        { return this.props.reservation },
  get timestamp ()          { return this.reservation?.timestamp },
  get table ()              { return this.reservation?.table },
  get sailing ()            { return this.reservation?.sailing },
  get venue ()              { return this.reservation?.venue },
  get mainGuest ()          { return this.reservation?.mainGuest },
  get reservationGuests ()  { return this.reservation?.guests || [] },
  
  get guests ()             { return this.props.guests },
  get guestsMap ()          { return this.dataSources?.guests },
  get dataSources ()        { return this.props.reservation?.getDataSources() },

  get venues ()             { return this.sailing?.venues },

  get nearbyGuestsIdsSet () { return this.props.nearbyGuestsIdsSet },
  get nearbyGuestsIds ()    { return Array.from(this.nearbyGuestsIdsSet) },

  get showByVenue ()  { return this.availabilityMode === ShowAvailabilityMode.byVenue },
  get showByDate ()   { return this.availabilityMode === ShowAvailabilityMode.byDate },
})

export type ReservationComponentContext = ReturnType<typeof createContextObject> 

export default createContextObject