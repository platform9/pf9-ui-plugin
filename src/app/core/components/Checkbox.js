import React from 'react'
import FontAwesomeIcon from 'core/components/FontAwesomeIcon'
import IndeterminateCheckBoxIcon from '@material-ui/icons/IndeterminateCheckBox'
import { Checkbox as BaseCheckbox } from '@material-ui/core'
import { withStyles } from '@material-ui/styles'

const styles = theme => ({
  checked: {
    color: theme.palette.primary.main,
  }
})

const Checked = ({ classes }) => <FontAwesomeIcon className={classes.checked} size="xs" solid>check-square</FontAwesomeIcon>
const StyledChecked = withStyles(styles)(Checked)
const UnChecked = () => <FontAwesomeIcon size="xs">square</FontAwesomeIcon>
const Indeterminate = () => <IndeterminateCheckBoxIcon />

const Checkbox = props => (
  <BaseCheckbox
    icon={<UnChecked />}
    checkedIcon={<StyledChecked />}
    indeterminateIcon={<Indeterminate />}
    {...props}
  />
)

export default Checkbox
