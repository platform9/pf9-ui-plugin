import { makeStyles } from '@material-ui/core/styles'
import { FormFieldCard } from 'core/components/validatedForm/FormFieldCard'
import Theme from 'core/themes/model'
import React, { useState } from 'react'
import Text from 'core/elements/text'
import ClustersMultiSelect from './clusters-multi-select'
import { CustomerTiers } from 'app/constants'
import FreeTierUpgradeModal from './free-tier-upgrade-modal'

interface StyleProps {
  disable: boolean
}

const useStyles = makeStyles<Theme, StyleProps>((theme) => ({
  card: {
    position: 'relative',
    zIndex: 1,
    pointerEvents: ({ disable }) => (disable ? 'none' : 'auto'),
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
  clustersList: {
    opacity: ({ disable }) => (disable ? '0.5' : 1),
    zIndex: 1,
  },
}))

interface Props {
  title: string
  wizardContext: any
  setWizardContext: any
  username?: string
  customerTier?: CustomerTiers
  customerTierBlacklist?: CustomerTiers[]
}

const ClustersListCard = ({
  title,
  wizardContext,
  setWizardContext,
  username,
  customerTier,
  customerTierBlacklist,
}: Props) => {
  const disable =
    customerTier && customerTierBlacklist && customerTierBlacklist.includes(customerTier)
  const classes = useStyles({ disable })
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
      {disable && <FreeTierUpgradeModal username={username} customerTier={customerTier} />}
      <div className={classes.clustersList}>
        <ClustersMultiSelect
          id="clusters"
          onChange={(value) => setWizardContext({ clusters: value })}
          wizardContext={wizardContext}
          setNumClusterOptions={setNumClusters}
        />
      </div>
    </FormFieldCard>
  )
}

export default ClustersListCard
