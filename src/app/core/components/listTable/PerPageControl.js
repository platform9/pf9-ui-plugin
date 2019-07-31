import React from 'react'
import { withStyles } from '@material-ui/styles'
import Picklist from 'core/components/Picklist'

const CustomPicklist = withStyles(theme => ({
  root: {
    '& .MuiOutlinedInput-root': {
      marginBottom: 0,
    },
  },
}))(Picklist)

const styles = theme => ({
  root: {
    margin: theme.spacing(1),
    minWidth: 90,
  },
})

const PerPageControl = ({ classes, value, onChangeRowsPerPage, rowsPerPageOptions }) => {
  const options = rowsPerPageOptions.map(x => ({ label: x, value: x }))
  return (
    <CustomPicklist
      name="perPage"
      label="Per Page"
      options={options}
      value={value}
      onChange={onChangeRowsPerPage}
      classes={classes}
      disableUnderline
    />
  )
}

export default withStyles(styles)(PerPageControl)
