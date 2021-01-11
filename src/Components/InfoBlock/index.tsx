import React, { FunctionComponent } from 'react';
import { Dict } from '../../CommonTypes';
import { FLEX_COLUMN_STYLE, FLEX_ROW_STYLE } from '../../Constants/flexContainerStyles';
import { mixStyles } from '../../Utils';
import { FlexColumn } from '../FlexContainer';
import StyledElement, { joinClassNames } from '../StyledElement';

import defaultStyles from './styles.module.css'

type InfoBlockProps = {
  labelTop?: string 
  labelLeft?: string
  hideOverflow?: boolean
  styles?: Dict<string | Dict<any>>
  [p: string]: any
}

const InfoBlock: FunctionComponent<InfoBlockProps> = 
  ({ labelTop, labelLeft, children, hideOverflow = false, styles = {}, ...restProps }) => {

  const labelIsOnTheLeft = Boolean(labelLeft)

  const elementLabel = labelTop || (labelLeft + ':')

  const directionDependedStyles = {
    Wrapper: labelIsOnTheLeft
      ? { FlexRow: true, AlignCenter: true, OverflowHHidden: hideOverflow } 
      : { FlexColumn: true, OverflowVHidden: hideOverflow },

    ContentWrapper: labelIsOnTheLeft 
      ? { OverflowHHidden: hideOverflow }
      : { OverflowVHidden: hideOverflow } 
  }

  const componentStyles = mixStyles(defaultStyles, styles)
  componentStyles.Wrapper = 
    Object.assign(componentStyles.Wrapper, directionDependedStyles.Wrapper)
  componentStyles.ContentWrapper = 
    Object.assign(componentStyles.ContentWrapper || {}, directionDependedStyles.ContentWrapper)

  return (
    <StyledElement  {...componentStyles.Wrapper} {...restProps}>
      <span {...componentStyles.Label}>
        {elementLabel}
      </span>
      <FlexColumn Grow {...componentStyles.ContentWrapper}>
        {children}
      </FlexColumn>
    </StyledElement>
  )
}

export default InfoBlock