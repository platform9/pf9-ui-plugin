import React from 'react'
import { FormControl, MenuItem, Select } from '@material-ui/core'
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
      <Select
        value={value}
        options={options}
        onChange={onChangeRowsPerPage}
        disableUnderline
      >
        {rowsPerPageOptions.map(pp => <MenuItem value={pp} key={pp}>{pp}</MenuItem>)}
      </Select>
    </FormControl>
  )
}

export default withStyles(styles)(PerPageControl)
