import React from 'react'
import PropTypes from 'prop-types'
import ApiHelper from 'developer/components/ApiHelper'
import StoreViewer from 'developer/components/StoreViewer'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import SimpleLink from 'core/components/SimpleLink'
import { compose } from 'app/utils/fp'
import { withStyles } from '@material-ui/styles'
import { Button, Accordion, AccordionDetails, AccordionSummary } from '@material-ui/core'
import Text from 'core/elements/text'

import { version } from '../../../../../package.json'

const styles = (theme) => ({
  root: {
    marginTop: theme.spacing(4),
    width: '100%',
  },
  title: {
    marginBottom: theme.spacing(1),
  },
  button: {
    display: 'block',
    marginTop: theme.spacing(2),
  },
  panel: {
    width: '100%',
  },
  details: {
    width: '100%',
  },
  heading: {
    fontSize: theme.typography.pxToRem(15),
    fontWeight: theme.typography.fontWeightRegular,
  },
})

class DeveloperToolsEmbed extends React.PureComponent {
  state = { expanded: true }

  expand = () => this.setState({ expanded: true })
  collapse = () => this.setState({ expanded: false })

  Panel = ({ title, children }) => (
    <Accordion className={this.props.classes.panel}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Text className={this.props.classes.heading}>{title}</Text>
      </AccordionSummary>
      <AccordionDetails className={this.props.classes.details}>{children}</AccordionDetails>
    </Accordion>
  )

  render() {
    const {
      props: { enabled, classes },
      state: { expanded },
      Panel,
    } = this

    if (!enabled) {
      return null
    }
    if (!expanded) {
      return (
        <div className={classes.root}>
          <Button onClick={this.expand}>expand devtools</Button>
        </div>
      )
    }
    //
    // This is currently UI developers only so leaving always expanded
    return (
      <div className={classes.root}>
        {/* {<Button onClick={this.collapse}>collapse devtools</Button>} */}
        <Text className={classes.title} variant="subtitle1">
          Developer Tools. V{version}
        </Text>
        <Panel title="Context Viewer">
          <StoreViewer />
        </Panel>
        <Panel title="API helper">
          <ApiHelper />
        </Panel>
        <SimpleLink className={classes.button} src="/ui/themes/configure">
          Theme Manager
        </SimpleLink>
      </div>
    )
  }
}

DeveloperToolsEmbed.propTypes = {
  enabled: PropTypes.bool,
}

DeveloperToolsEmbed.defaultProps = {
  enabled: true,
}

export default compose(withStyles(styles))(DeveloperToolsEmbed)
