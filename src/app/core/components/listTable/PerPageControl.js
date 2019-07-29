import React from 'react'
import Picklist from 'core/components/Picklist'
import { FormControl } from '@material-ui/core'
import { withStyles } from '@material-ui/styles'

const styles = theme => ({
  margin: {
    margin: theme.spacing(1),
  },
})

const PerPageControl = ({ classes, value, onChangeRowsPerPage, rowsPerPageOptions }) => {
  const options = rowsPerPageOptions.map(x => ({ label: x, value: x }))
  return (
    <FormControl className={classes.margin}>
      <Picklist
        name="perPage"
        label="Per Page"
        options={options}
        value={value}
        onChange={onChangeRowsPerPage}
      />
    </FormControl>
  )
}

export default withStyles(styles)(PerPageControl)
