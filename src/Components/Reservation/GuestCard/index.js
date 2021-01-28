import React from 'react'
import styles from './styles.module.css'
import { FlexRow, FlexColumn } from '../../FlexContainer'

import defaultUserpic from '../../../Images/user-icon.svg.js'
import nearbyIcon from '../../../Images/nearby-icon.svg.js'
import StyledElement, { convertPropsToClassName } from '../../StyledElement'
import { FLEX_COLUMN_STYLE, FLEX_ROW_STYLE } from '../../../Constants/flexContainerStyles'

const GuestCard = props => { 
  const { className, ...restProps } = convertPropsToClassName(props, styles.GuestCard)

  const { guest, nearbyGuestsIdsSet, onClick, 
    userpic = defaultUserpic, optionsControls, ...restElementProps } = restProps
  Object.assign(
    restElementProps, 
    props.vertical 
      ? {...FLEX_COLUMN_STYLE, 'data-vertical': 'true' } 
      : {...FLEX_ROW_STYLE, 'data-vertical': 'false' } 
  )

  const isNearby = guest.isNearby(nearbyGuestsIdsSet)

  const onClickHandler = () => {
    if (onClick) onClick()
  }

  const GuestPhoto = () => <FlexRow 
    JustifyCenter
    className={styles.GuestPhoto} 
    dangerouslySetInnerHTML={{__html: userpic }} 
  />

  const FirstLine = () => 
    <FlexRow className={[styles.GuestInfoFirstLine, styles.GuestInfoLine]}>
      <span guestName={styles.Name}>{ guest.fullName }</span>
      {isNearby && <span className={styles.NearbyIcon} dangerouslySetInnerHTML={{ __html: nearbyIcon }} /> }
    </FlexRow>

  const SecondLine = () =>
    <FlexRow className={[styles.GuestInfoSecondLine, styles.GuestInfoLine]}>
      <span>cabin number:</span><span>{guest.cabinNumber}</span>
    </FlexRow>

  const Requests = () => <FlexRow className={styles.GuestRequests}>{ '' }</FlexRow>

  const GuestInfo = () =>
    <FlexColumn className={styles.GuestInfo} Grow>
      <FirstLine /><SecondLine /><Requests />  
    </FlexColumn> 

  const optionsAreaClass = !props.vertical ? styles.OptionsArea : styles.OptionsAreaVertical

  const OptionsArea = () => optionsControls 
    ? <FlexColumn className={optionsAreaClass}>
        {optionsControls}
      </FlexColumn>
    : null
  
  return <StyledElement className={className} onClick={onClickHandler} {...restElementProps}>
    <GuestPhoto />
    <GuestInfo />
    <OptionsArea />
  </StyledElement>
}

export default GuestCard