import React from 'react'
import ReactMarkdown from 'markdown-to-jsx'
import { withStyles } from '@material-ui/core/styles'
import Link from '@material-ui/core/Link'
import Text from 'core/elements/text'

const styles = (theme) => ({
  listItem: {
    marginTop: theme.spacing(1),
  },
})

const options = {
  linkTarget: '_blank',
  overrides: {
    h1: {
      component: Text,
      props: {
        gutterBottom: true,
        variant: 'h4',
      },
    },
    h2: { component: Text, props: { gutterBottom: true, variant: 'h6' } },
    h3: { component: Text, props: { gutterBottom: true, variant: 'subtitle1' } },
    h4: {
      component: Text,
      props: { gutterBottom: true, variant: 'caption', paragraph: true },
    },
    p: { component: Text, props: { paragraph: true } },
    a: { component: Link, props: { target: '_blank' } },
    li: {
      component: withStyles(styles)(({ classes, ...props }) => (
        <li className={classes.listItem}>
          <Text component="span" {...props} />
        </li>
      )),
    },
  },
}

export default function Markdown(props) {
  return <ReactMarkdown options={options} {...props} />
}
