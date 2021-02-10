import { makeStyles } from '@material-ui/core/styles'
import { FormFieldCard } from 'core/components/validatedForm/FormFieldCard'
import Theme from 'core/themes/model'
import React, { useState } from 'react'
import Text from 'core/elements/text'
import ClustersMultiSelect from './clusters-multi-select'

const useStyles = makeStyles((theme: Theme) => ({
  card: {
    border: `1px solid ${theme.palette.grey[300]}`,
    borderRadius: 4,
    boxShadow: 'none',
    justifyContent: 'flex-start',
    height: '580px',
    '& header': {
      marginBottom: '0px',
    },
    '& .MuiFormControl-root.validatedFormInput': {
      width: '100%',
      marginTop: theme.spacing(0),
    },
    '& .MuiFormControl-root': {
      border: '0px',
    },
  },
  title: {
    color: theme.palette.grey[700],
  },
  count: {
    color: theme.palette.blue[500],
  },
}))

interface Props {
  title: string
  wizardContext: any
  setWizardContext: any
}

const ClustersListCard = ({ title, wizardContext, setWizardContext }: Props) => {
  const classes = useStyles()
  const [numClusters, setNumClusters] = useState(0)

  return (
    <FormFieldCard
      className={classes.card}
      title={
        <Text variant="caption1" className={classes.title} component="span">
          {title}
        </Text>
      }
      link={
        <Text variant="caption1" component="span">
          <span className={classes.count}>{wizardContext.clusters.length}</span> of {numClusters}
        </Text>
      }
    >
      <ClustersMultiSelect
        id="clusters"
        onChange={(value) => setWizardContext({ clusters: value })}
        wizardContext={wizardContext}
        setNumClusterOptions={setNumClusters}
      />
    </FormFieldCard>
  )
}

export default ClustersListCard
