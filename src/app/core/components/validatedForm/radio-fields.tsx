import React, { FC, PureComponent } from 'react'
import { FormControl, FormControlLabel, FormHelperText, Radio, WithStyles } from '@material-ui/core'
import { withStyles } from '@material-ui/styles'
import { withInfoTooltip } from 'app/core/components/InfoTooltip'
import { compose } from 'app/utils/fp'
import withFormContext from 'core/components/validatedForm/withFormContext'
import { ValidatedFormProps } from './model'

const styles = (theme) => ({
  root: {
    minWidth: '50%',
    width: 'fit-content',
    display: 'flex',
    flexDirection: 'column' as const,
  },
  formControl: {
    marginTop: theme.spacing(1),
  },
})
interface OptionType {
  value: string | number
  label: string | number
}
interface FormProps {
  id: string
  value: string
  options: OptionType[]
  info?: string
  hasError?: boolean
  errorMessage?: string
  onChange: (isChecked: boolean) => void
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
      const { classes, value, hasError, errorMessage, onChange, options, ...restProps } = this.props

      return (
        <div {...restProps} className={classes.root}>
          {options.map((option) => (
            <FormControl key={option.value} className={classes.formControl} error={hasError}>
              <FormControlLabel
                label={option.label}
                control={
                  <Radio
                    {...restProps}
                    color="primary"
                    checked={option.value === value}
                    onChange={() => this.handleChange(option.value)}
                  />
                }
              />
              {errorMessage && <FormHelperText>{errorMessage}</FormHelperText>}
            </FormControl>
          ))}
        </div>
      )
    }
  },
)

export default RadioFields as FC<FormProps>
