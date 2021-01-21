import React, { FunctionComponent } from 'react'
import _ from 'lodash'
import styles from './styles.module.css';
import { FlexColumn } from '../../FlexContainer';
import { ReservationType } from '../../../Classes/Reservation';
import { TableType } from '../../../Classes/Table';
import { TableAvailabilityStatus } from '../../../Classes/Table/constants';

type Props = {
  table: TableType
  reservations: ReservationType[]
  isSelected: boolean
  status: TableAvailabilityStatus
  onClick: (t: TableType) => any
}

const Table: FunctionComponent<Props> = props => {
  const { table, reservations, isSelected, status, onClick } = props

  const onClickHandler = () => {
    if (status === TableAvailabilityStatus.Available) onClick(table)
  }

  const partySize = _.sumBy(reservations, 'partySize')
  const tableSize = Math.max(table.size, partySize)

  const length = Math.ceil(tableSize / 2)

  const pairs = Array.from({ length }, (v, i) => {
    const ind = (i + 1) * 2
    const nonExists = [false, ind > tableSize]
    const occupied = [ind - 1 <= partySize, ind <= partySize]

    return { nonExists, occupied }
  })

  const coords = { left: table.left, top: table.top }

  return (
    <div className={styles.TableRoot} 
      data-orientation={table.orientation} 
      data-status={status} 
      data-selected={isSelected} 
      style={coords} 
      onClick={onClickHandler}
    >
      {pairs.map(p => <div className={styles.ChairRow}>
        <span className={styles.Chair} data-occupied={p.occupied[0]} data-nonexist={p.nonExists[0]}></span>
        <span className={styles.Chair} data-occupied={p.occupied[1]} data-nonexist={p.nonExists[1]}></span>
      </div>)}

      <FlexColumn PosAbsolute ContentCenter FullWindow className={styles.TableWrapper}>
        <FlexColumn ContentCenter className={styles.Table}>
          <div className={styles.TableNameLabel}>{table.name}</div>
        </FlexColumn>
      </FlexColumn>
    </div>
  )
}

export default Table