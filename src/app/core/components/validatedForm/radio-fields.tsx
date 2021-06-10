import React, { FC, PureComponent } from 'react'
import {
  FormControl,
  FormControlLabel,
  FormHelperText,
  makeStyles,
  Radio,
  WithStyles,
} from '@material-ui/core'
import { withStyles } from '@material-ui/styles'
import InfoTooltip, { withInfoTooltip } from 'app/core/components/InfoTooltip'
import { compose } from 'app/utils/fp'
import withFormContext from 'core/components/validatedForm/withFormContext'
import { ValidatedFormProps } from './model'
const stylesBase = {
  root: {
    minWidth: '50%',
    width: 'fit-content',
    display: 'flex',
    flexDirection: 'column' as const,
  },
  formControl: {
    marginTop: 8,
  },
}
const styles = (theme) => stylesBase
const useStyles = makeStyles((theme) => stylesBase)
export interface OptionType {
  value: string | number
  label: string | number
  info?: string
  infoPlacement?: string
  disabled?: boolean
}
interface FormProps {
  id: string
  value: string
  options: OptionType[]
  info?: string
  hasError?: boolean
  errorMessage?: string
  onChange: (isChecked: boolean) => void
  formControlLabelClasses?: any
}
interface Props extends FormProps, ValidatedFormProps, WithStyles<typeof styles> {}

const RadioFields = compose(
  withInfoTooltip, // This HoC causes unnecessary re-renders if declared after withFormContext
  withStyles(styles),
  withFormContext,
)(
  class extends PureComponent<Props> {
    handleChange = (radioValue) => {
      const { onChange } = this.props
      if (onChange) {
        onChange(radioValue)
      }
    }

    render() {
      const {
        classes,
        value,
        hasError,
        errorMessage,
        options,
        formControlLabelClasses,
      } = this.props

      return (
        <div className={classes.root}>
          {options.map(({ label, value: optionValue, info, infoPlacement, disabled = false }) => (
            <RadioButton
              key={optionValue}
              disabled={disabled}
              checked={optionValue === value}
              value={value}
              onChange={this.handleChange}
              label={label}
              errorMessage={errorMessage}
              formControlLabelClasses={formControlLabelClasses}
              hasError={hasError}
              info={info}
              infoPlacement={infoPlacement}
            />
          ))}
        </div>
      )
    }
  },
)

export function RadioButton({
  hasError = undefined,
  info,
  infoPlacement = undefined,
  label,
  checked,
  onChange,
  value,
  disabled = undefined,
  errorMessage = undefined,
  formControlLabelClasses = undefined,
  ...rest
}) {
  const classes = useStyles({})
  return (
    <FormControl className={classes.formControl} error={hasError}>
      <InfoTooltip info={info} placement={infoPlacement}>
        <FormControlLabel
          classes={formControlLabelClasses}
          label={label}
          control={
            <Radio
              color="primary"
              checked={checked}
              value={value}
              onChange={(value) => onChange(value)}
              disabled={disabled}
              {...rest}
            />
          }
        />
      </InfoTooltip>
      {errorMessage && <FormHelperText>{errorMessage}</FormHelperText>}
    </FormControl>
  )
}

export default RadioFields as FC<FormProps>
