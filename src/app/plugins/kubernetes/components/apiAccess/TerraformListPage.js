import React from 'react'
import ExternalLink from 'core/components/ExternalLink'
import FontAwesomeIcon from 'core/components/FontAwesomeIcon'
import { makeStyles } from '@material-ui/core/styles'
import { FormFieldCard } from 'core/components/validatedForm/FormFieldCard'
import { konformGithubLink, terraformHelpLink } from 'k8s/links'
import Text from 'core/elements/text'
import BulletList from 'core/components/BulletList'
import SubmitButton from 'core/components/buttons/SubmitButton'
import { Button } from '@material-ui/core'

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
}))

const requirements = ['Go v1.13+ and', 'Terraform']

const iconSizes = { small: '', medium: '@2x', large: '@3x' }
const iconSize = iconSizes.small
const rootPath = '/ui/images/icon-cloudproviders'
const icons = {
  aws: `${rootPath}/cloudaws-default${iconSize}.png`,
  azure: `${rootPath}/cloudazure-default${iconSize}.png`,
}

const TerraformListPage = () => {
  const classes = useStyles()
  return (
    <FormFieldCard
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
      <ExternalLink className={classes.link} url={konformGithubLink} underline="always">
        https://github.com/platform9/konform
      </ExternalLink>
      <div className={classes.cloudContainer}>
        <Text className={classes.text}>
          <b>Supported Clouds</b>
        </Text>
        <div className={classes.cloudTypes}>
          <img alt={'AWS'} src={icons['aws']} />
          <img alt={'Azure'} src={icons['azure']} />
        </div>
      </div>
      <div className={classes.buttonContainer}>
        <ExternalLink url={konformGithubLink}>
          <SubmitButton href={konformGithubLink}>
            <Text>+ Get Konform on GitHub</Text>
          </SubmitButton>
        </ExternalLink>
      </div>
    </FormFieldCard>
  )
}

export default TerraformListPage
