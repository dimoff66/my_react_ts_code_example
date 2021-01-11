import React, { Dispatch, useEffect } from 'react';
import styles from './App.module.css';
import agent from './Utils/agent';
import { ActionType } from './Store/actions';
import { connect } from 'react-redux'
import { getLoaderOrErrorElement } from './Utils/elements';
import ReservationComponent from './Components/Reservation'
import { ID_FIELD } from './Constants/attributeNames';
import _ from 'lodash'
import { FlexColumn } from './Components/FlexContainer';
import Button from './Components/Buttons/Button';
import { reservationSelector } from './Store/selectors';
import Sailing, { SailingDataType } from './Classes/Sailing';

import { reservations } from './Data/data'

import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import { RootAction, RootState } from './Store/reducer';
import { GuestDataType } from './Classes/Guest';
import { ReservationType } from './Classes/Reservation';
import { withStyles } from '@material-ui/core/styles';
import { DEFAULT_TIMESTAMP_FORMAT } from './Components/Reservation/constants';

const HeadCell = withStyles((theme) => ({
  head: {
    backgroundColor: 'black',
    color: 'white',
  },
  body: {
    fontSize: 14,
  },
}))(TableCell)

const Row = withStyles((theme) => ({
  root: { cursor: 'pointer', fontSize: 20 },
}))(TableRow);

const mapStateToProps = (state: RootState) => ({
  sailings: state.sailings,
  guests: state.guests,
  currentSailing: state.currentSailing,
  reservation: state.reservation
})

const mapDispatchToProps = (dispatch: Dispatch<RootAction>) => ({
  onGuestsLoaded: (guests: GuestDataType[]) => 
    dispatch({ type: ActionType.ON_GUESTS_LOADED, payload: guests }),

  onSailingsLoaded: (sailings: SailingDataType[]) =>
    dispatch({ type: ActionType.ON_SAILINGS_LOADED, payload: sailings }),

  unloadData: (...keys: (keyof RootState)[]) => 
    dispatch({ type: ActionType.UNLOAD_DATA, payload: keys }),  

  changeReservation: (reservation: ReservationType) => 
    dispatch({ type: ActionType.CHANGE_RESERVATION, payload: reservation }),
})

type Props = ReturnType<typeof mapStateToProps> & ReturnType<typeof mapDispatchToProps>

const App: React.FC<Props> = (props: Props) => {
  const { sailings, guests, reservation, currentSailing,
    onSailingsLoaded, onGuestsLoaded, unloadData, changeReservation } = props

  useEffect(() => {
    if (!sailings) {
      agent.fetchSailings().then(onSailingsLoaded)
    }

    if (!guests) {
      agent.fetchGuests().then(onGuestsLoaded)
    }

    return () => unloadData('currentSailing')
  }, [])

  const createNewReservation = () => {
    const mainGuestId = getRandomGuestId(guests!)
    const sailing = Sailing(currentSailing!, {})
    const sailingId = sailing.id
    const venueId = sailing.venues[0]?.id

    const reservation = reservationSelector({
      ...props, 
      reservation: { mainGuestId, sailingId, venueId }
    })!.setCurrentTimestamp()

    changeReservation(reservation)
  }

  const reservationsList = reservations
    .map(
      reservation => reservationSelector({...props, reservation })!
    )

  const rowClickHandler = (reservation: ReservationType) => () => {
    changeReservation(reservation)
  }
  
  const loaderOrError = getLoaderOrErrorElement([ sailings, guests ])
  const renderObject = loaderOrError || (
    reservation 
      ? <ReservationComponent />
      : <>
          <Button onClick={createNewReservation} 
            title="New reservation" 
            className={styles.NewReservationButton}
          />

          <Table className={styles.table}>
            <TableHead>
              <TableRow>
                <HeadCell style={{ width: 260 }}>Name</HeadCell>
                <HeadCell style={{ width: 120 }}>Date & time</HeadCell>
                <HeadCell style={{ width: 200  }}>Venue</HeadCell>
                <HeadCell>Table</HeadCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reservationsList.map((row) => (
                <Row key={row.id} hover onClick={rowClickHandler(row)}>
                  <TableCell>{row.mainGuest!.fullName}</TableCell>
                  <TableCell>{row.timestamp!.format(DEFAULT_TIMESTAMP_FORMAT)}</TableCell>
                  <TableCell>{row.venue!.name}</TableCell>
                  <TableCell>{row.table!.name}</TableCell>
                </Row>
              ))}
            </TableBody>
          </Table>

        </>
  )

  return (
    <FlexColumn FullWindow className={styles.App}>
      {renderObject}
    </FlexColumn>
  )
}

const getRandomGuestId = (guests: GuestDataType[]) => {
  const ind = _.random(0, guests.length - 1)

  let guestId = guests[ind][ID_FIELD]

  // TODO: remove test 
  guestId = '12146'
  ////////////////////////

  return guestId
}


export default connect(mapStateToProps, mapDispatchToProps)(App)

