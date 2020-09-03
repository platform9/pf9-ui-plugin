import React from 'react'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import { Accordion, AccordionDetails, AccordionSummary, Typography } from '@material-ui/core'
import { withStyles } from '@material-ui/styles'

const styles = (theme) => ({
  root: {
    width: '100%',
    marginBottom: theme.spacing(2),
  },
  heading: {
    fontSize: theme.typography.pxToRem(15),
    fontWeight: theme.typography.fontWeightRegular,
  },
  summary: {
    display: 'flex',
    flex: 1,
    justifyContent: 'space-between',
  },
})

const Panel = withStyles(styles)(
  ({ classes, title, children, link = null, titleVariant = 'subtitle1', ...rest }) => (
    <div className={classes.root}>
      <Accordion defaultExpanded {...rest}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <div className={classes.summary}>
            <Typography variant={titleVariant}>{title}</Typography>
            {link !== null && link}
          </div>
        </AccordionSummary>
        <AccordionDetails>
          <div style={{ width: '100%' }}>{children}</div>
        </AccordionDetails>
      </Accordion>
    </div>
  ),
)

export default withStyles(styles)(Panel)
