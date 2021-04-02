import { makeStyles } from '@material-ui/styles'
import Theme from 'core/themes/model'
import React from 'react'
import { mediumPlaceholderIcon } from '../helpers'
import Text from 'core/elements/text'
import SimpleLink from 'core/components/SimpleLink'
import { routes } from 'core/utils/routes'

const useStyles = makeStyles((theme: Theme) => ({
  main: {
    display: 'grid',
    gridTemplateColumns: '125px auto',
    margin: theme.spacing(8, 0, 0, 10),
  },
  header: {
    marginBottom: theme.spacing(2),
  },
}))

const defaultHeaderMessage = 'To use the App Catalog, please attach a repository.'
const defaultSecondaryMessage =
  "You can do so from the '+ Add New Repository' button on the Repositories Page."

const NoRepositoriesMessage = ({
  headerMessage = defaultHeaderMessage,
  secondaryMessage = defaultSecondaryMessage,
  showAddRepositoryLink = true,
}) => {
  const classes = useStyles()
  return (
    <div className={classes.main}>
      <img src={mediumPlaceholderIcon} />
      <div>
        <Text className={classes.header} variant="subtitle2">
          {headerMessage}
        </Text>
        <Text variant="body1">{secondaryMessage}</Text>
        {showAddRepositoryLink && (
          <SimpleLink src={routes.repositories.add.path()}>
            <Text variant="body1">Add Repository</Text>
          </SimpleLink>
        )}
      </div>
    </div>
  )
}

export default NoRepositoriesMessage
