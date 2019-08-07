import React from 'react'
import { FormControl, MenuItem, Select, Tooltip } from '@material-ui/core'
import { withStyles } from '@material-ui/styles'

const styles = theme => ({
  margin: {
    margin: theme.spacing(1),
  },
})

const PerPageControl = ({ classes, value, onChangeRowsPerPage, rowsPerPageOptions }) => {
  const [open, setOpen] = React.useState(false)
  const options = rowsPerPageOptions.map(x => ({ label: x, value: x }))
  return (
    <FormControl className={classes.margin}>
      <Tooltip title={'Rows per page'} open={open}>
        <Select
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={() => setOpen(false)}
          onClick={() => setOpen(false)}
          value={value}
          options={options}
          onChange={onChangeRowsPerPage}
          disableUnderline
        >
          {rowsPerPageOptions.map(pp => <MenuItem value={pp} key={pp}>{pp}</MenuItem>)}
        </Select>
      </Tooltip>
    </FormControl>
  )
}

export default withStyles(styles)(PerPageControl)
