import React from 'react'
import { Typography, TypographyProps } from '@material-ui/core'
import Theme from 'core/themes/model'
import clsx from 'clsx'
import { makeStyles } from '@material-ui/styles'
const AnyTypography: any = Typography

const muiValidVariants = [
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'subtitle1',
  'subtitle2',
  'body1',
  'body2',
  'caption',
  'button',
  'overline',
]
type TypographyMetaKeysToOmit =
  | 'fontFamily'
  | 'fontSize'
  | 'fontWeightLight'
  | 'fontWeightRegular'
  | 'fontWeightMedium'
  | 'fontWeightBold'
  | 'pxToRem'
type TextVariant = keyof Omit<Theme['typography'], TypographyMetaKeysToOmit> | 'inherit'

interface TextProps extends Omit<TypographyProps, 'variant'> {
  variant?: TextVariant
  component?: React.ElementType
}

const useStyles = makeStyles<Theme, { variant: TextVariant }>((theme) => ({
  text: {
    // these need to use optional chaining as the theme isn't loaded on first render.
    // this would throw an exception
    fontFamily: ({ variant }) => theme?.typography?.[variant]?.fontFamily,
    fontSize: ({ variant }) => theme?.typography?.[variant]?.fontSize,
    fontWeight: ({ variant }) => theme?.typography?.[variant]?.fontWeight as any,
    fontStretch: ({ variant }) => theme?.typography?.[variant]?.fontStretch,
    fontStyle: ({ variant }) => theme?.typography?.[variant]?.fontStyle,
    lineHeight: ({ variant }) => theme?.typography?.[variant]?.lineHeight,
    letterSpacing: ({ variant }) => theme?.typography?.[variant]?.letterSpacing,
    textAlign: ({ variant }) => theme?.typography?.[variant]?.textAlign as any,
  },
}))

function Text({ className, variant, ...props }: TextProps) {
  const { text } = useStyles({ variant })

  // TODO: figure out how to supress mui invalid variant console message
  const muiVariant = muiValidVariants.includes(variant) ? variant : undefined
  return <AnyTypography {...props} variant={muiVariant} className={clsx(text, className)} />
}

export default Text
