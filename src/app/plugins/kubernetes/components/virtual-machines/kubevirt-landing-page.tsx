import DocumentMeta from 'core/components/DocumentMeta'
import SimpleLink from 'core/components/SimpleLink'
import Text from 'core/elements/text'
import { routes } from 'core/utils/routes'
import React from 'react'
import { makeStyles } from '@material-ui/styles'
import Theme from 'core/themes/model'

export default function KubevirtLandingPage() {
  const classes = useStyles({})
  return (
    <article className={classes.container}>
      <DocumentMeta title="Virtual Machines" bodyClasses={['form-view']} />
      <div className={classes.card}>
        <Text variant="caption1" className={classes.badge}>
          Early Access
        </Text>
        <Text variant="subtitle1">
          Get started with <br /> KubeVirt for VM Management
        </Text>
        <Text variant="body1" className={classes.middleText}>
          KubeVirt makes it possible for virtual machines to be managed by Kubernetes.
        </Text>
        <Text>
          Install KubeVirt from the{' '}
          <SimpleLink src={routes.cluster.add.path()}>Cluster Creation Page.</SimpleLink>
          and start deploying and managing VMs in your Kubernetes clusters now.
        </Text>
      </div>
    </article>
  )
}

const useStyles = makeStyles<Theme>((theme) => ({
  container: {
    display: 'flex',
    justifyContent: 'center',
    paddingTop: 72,
  },
  card: {
    position: 'relative',
    backgroundColor: theme.palette.grey['000'],
    padding: 40,
  },
  middleText: {
    padding: '40px 0',
  },
  badge: {
    borderRadius: 2,
    color: theme.palette.grey['000'],
    position: 'absolute',
    top: 12,
    right: 16,
    padding: '3px 12px',
    backgroundColor: theme.palette.pink[500],
  },
}))
