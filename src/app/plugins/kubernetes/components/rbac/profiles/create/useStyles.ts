import { makeStyles } from '@material-ui/styles'
import Theme from 'core/themes/model'

export default makeStyles<Theme>((theme) => ({
  label: {
    backgroundColor: 'white',
    padding: '0 5px',
    margin: '0 -5px',
  },
  splitWizardStep: {
    flexGrow: 1,
    display: 'flex',
    flexFlow: 'row nowrap',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    margin: theme.spacing(0, -2),
  },
  profileContents: {
    display: 'flex',
    flexFlow: 'column nowrap',
    justifyContent: 'space-between',
    margin: theme.spacing(0, 2),
  },
  listBox: {
    flexGrow: 1,
    borderRadius: 4,
    background: theme.palette.grey['000'],
    padding: theme.spacing(2, 3),
    display: 'flex',
    flexFlow: 'column nowrap',
  },
}))
