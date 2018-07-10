import React from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import { Button, InputAdornment, Menu, MenuItem, TextField, Typography } from '@material-ui/core'
import SearchIcon from '@material-ui/icons/Search'

const styles = theme => ({
  selector: {
    position: 'relative',
    float: 'right'
  },
  menuSearch: {
    outline: 'none',
    padding: theme.spacing.unit * 2
  }
})

@withStyles(styles)
class Selector extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      anchor: null
    }
  }

  handleClick = anchor => event => {
    this.setState({ [anchor]: event.currentTarget })
  }

  handleClose = anchor => () => {
    this.setState({ [anchor]: null })
  }

  render () {
    const { classes, name, list } = this.props
    const { anchor } = this.state
    const selectorName = `${name}-selector`
    return (
      <div className={classes.selector}>
        <Button
          aria-owns={anchor ? selectorName : null}
          aria-haspopup="true"
          onClick={this.handleClick('anchor')}
          color="inherit"
          disableRipple
        >
          <Typography color="inherit" variant="body1">
            Current {name}  &#9662;
          </Typography>
        </Button>
        <Menu
          id={selectorName}
          anchorEl={anchor}
          open={Boolean(anchor)}
          onClose={this.handleClose('anchor')}
          getContentAnchorEl={null}
          anchorOrigin={{vertical: 'bottom', horizontal: 'left'}}
        >
          <TextField
            placeholder={'Search '+name}
            className={classes.menuSearch}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          {list.map(item => (<MenuItem onClick={this.handleClose('anchor')} key={item}>{item}</MenuItem>))}
        </Menu>
      </div>
    )
  }
}

Selector.propTypes = {
  name: PropTypes.string.isRequired,
  list: PropTypes.array.isRequired,
  classes: PropTypes.object,
}

export default Selector
