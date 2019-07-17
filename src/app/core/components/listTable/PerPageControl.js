import React from 'react'
import { FormControl, InputBase, MenuItem, Select, Tooltip } from '@material-ui/core'
import { withStyles } from '@material-ui/styles'

// This code was derived from the "Customized Selects" example from
// https://material-ui.com/components/selects/

const BootstrapInput = withStyles(theme => ({
  root: {
    'label + &': {
      marginTop: theme.spacing.unit * 3,
    },
  },
  input: {
    borderRadius: 4,
    position: 'relative',
    backgroundColor: theme.palette.background.paper,
    border: '1px solid #ced4da',
    fontSize: 16,
    padding: '10px 26px 10px 12px',
    transition: theme.transitions.create(['border-color', 'box-shadow']),
    // Use the system font instead of the default Roboto font.
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
    ].join(','),
    '&:focus': {
      borderRadius: 4,
      borderColor: '#80bdff',
      boxShadow: '0 0 0 0.2rem rgba(0,123,255,.25)',
    },
  },
}))(InputBase)

const styles = theme => ({
  margin: {
    margin: theme.spacing.unit * 1,
  },
})

const PerPageControl = ({ classes, value, onChangeRowsPerPage, rowsPerPageOptions }) => {
  return (
    <FormControl className={classes.margin}>
      <Tooltip title="Per Page" placement="top">
        <Select
          value={value}
          onChange={onChangeRowsPerPage}
          input={<BootstrapInput />}
        >
          {rowsPerPageOptions.map(pp => <MenuItem value={pp} key={pp}>{pp}</MenuItem>)}
        </Select>
      </Tooltip>
    </FormControl>
  )
}

export default withStyles(styles)(PerPageControl)
