import React from 'react'
import ExternalLink from 'core/components/ExternalLink'
import { makeStyles } from '@material-ui/core/styles'
import { FormFieldCard } from 'core/components/validatedForm/FormFieldCard'
import { konformGithubLink,terraformGitubLink } from 'k8s/links'
import Text from 'core/elements/text'
import BulletList from 'core/components/BulletList'
import SubmitButton from 'core/components/buttons/SubmitButton'
import CloudProviderCard from '../common/CloudProviderCard'
import { CloudProviders } from '../infrastructure/cloudProviders/model'
import { noop } from 'utils/fp'
 
const useStyles = makeStyles((theme) => ({
  blueIcon: {
    color: theme.palette.primary.main,
  },
  text: {
    marginTop: theme.spacing(1),
    marginLeft: theme.spacing(1),
  },
  bulletListTitle: {
    marginLeft: theme.spacing(1),
  },
  bulletList: {
    marginLeft: theme.spacing(2),
  },
  link: {
    marginLeft: theme.spacing(1),
  },
  cloudContainer: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  cloudTypes: {
    marginTop: theme.spacing(4),
    display: 'flex',
    flexFlow: 'row nowrap',
  },
  button: {
    margin: 0,
    borderRadius: 2,
    textTransform: 'none',
    height: 40,
    minWidth: 150,
    marginTop: theme.spacing(6),
  },
  buttonContainer: {
    marginTop: theme.spacing(4),
  },
  card: {
    marginTop: 24,
  },
}))

const requirements = ['Go v1.13+ and', 'Terraform']

const TerraformListPage = () => {
  const classes = useStyles()
  return (
    <FormFieldCard
      className={classes.card}
      title="Build Clusters Using Terraform"
      link={
        <div>
          <ExternalLink url={konformGithubLink}>Terraform Help?</ExternalLink>
        </div>
      }
    >
      <Text variant="body1" className={classes.text}>
        Konform allows you to create and manage your PMK clusters using terraform.
      </Text>
      <Text variant="body1" className={classes.bulletListTitle}>
        Requirements:
      </Text>
      <BulletList className={classes.bulletList} items={requirements} />
      <Text variant="body1" className={classes.text}>
        Access Konform and the commands for building a cluster on the Github repository
      </Text>
      <ExternalLink className={classes.link} url={terraformGitubLink} underline="always">
         https://github.com/platform9/terraform-provider-pf9
      </ExternalLink>
      <div className={classes.cloudContainer}>
        <Text className={classes.text}>
          <b>Supported Clouds</b>
        </Text>
        <div className={classes.cloudTypes}>
          <CloudProviderCard type={CloudProviders.Aws} active={false} onClick={noop} />
          <CloudProviderCard type={CloudProviders.Azure} active={false} onClick={noop} />
        </div>
      </div>
      <div className={classes.buttonContainer}>
        <ExternalLink url={terraformGitubLink}>
          <SubmitButton href={terraformGitubLink}>
            <Text>+ Get Konform on GitHub</Text>
          </SubmitButton>
        </ExternalLink>
      </div>
    </FormFieldCard>
  )
}

export default TerraformListPage
