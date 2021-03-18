import React from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/styles'
import { DetailRow } from 'k8s/components/infrastructure/nodes/NodeDetailsPage'
import Text from 'core/elements/text'
import clsx from 'clsx'

const styles = (theme) => ({
  root: {},
  row: {
    width: '100%',
  },
  half: {
    display: 'inline-block',
    width: '50%',
  },
  cardContent: {
    margin: theme.spacing(0, 2, 1),
  },
  card: {
    maxWidth: 607,
    width: 'max-content',
    border: `solid 1px ${theme.palette.grey[300]}`,
    borderRadius: 4,

    '& h3.MuiTypography-subtitle2': {
      color: theme.palette.grey[700],
      padding: theme.spacing(1, 2),
      borderBottom: `solid 1px ${theme.palette.grey[300]}`,
    },
  },
})

const DetailRowDiv = withStyles(styles)(({ classes, items }) =>
  Object.entries(items).map(([name, { value, helpMessage }]) => (
    <DetailRow label={name} value={value} helpMessage={helpMessage} />
  )),
)

const renderDetailRow = (items) => <DetailRowDiv items={items} />

const InfoPanel = withStyles(styles)(
  ({ classes, items = [], customBody = undefined, className = undefined, title }) => (
    <div className={clsx(classes.card, className)}>
      <Text variant="subtitle2" component="h3">
        {title}
      </Text>
      {customBody && <div className={classes.cardContent}>{customBody}</div>}
      {!customBody && (
        <table className={classes.cardContent}>
          <tbody>
            {Array.isArray(items) ? items.map(renderDetailRow) : renderDetailRow(items)}
          </tbody>
        </table>
      )}
    </div>
  ),
)

InfoPanel.propTypes = {
  title: PropTypes.string,
  items: PropTypes.object,
}

export default InfoPanel
