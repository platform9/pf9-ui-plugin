import React, { FunctionComponent, useCallback, useState } from 'react'
import InfoTooltip from 'app/core/components/InfoTooltip'

interface Props {
  info: string
  placement?: string
  className?: string
  children: any
}

const InfoTooltipWrapper: FunctionComponent<Props> = ({
  info = '',
  placement,
  className,
  children,
}) => {
  const [open, setOpen] = useState(false)
  const openTooltip = useCallback(() => setOpen(true), [])
  const closeTooltip = useCallback(() => setOpen(false), [])

  return (
    <InfoTooltip open={open} info={info} placement={placement}>
      <div
        onMouseEnter={openTooltip}
        onMouseLeave={closeTooltip}
        onMouseOut={closeTooltip}
        onFocus={openTooltip}
        onBlur={closeTooltip}
        onClick={closeTooltip}
        className={className}
      >
        {children}
      </div>
    </InfoTooltip>
  )
}

export default InfoTooltipWrapper
