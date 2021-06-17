import Button from 'core/elements/button'
import React from 'react'
import { makeStyles } from '@material-ui/styles'
import Theme from 'core/themes/model'
import FontAwesomeIcon from './FontAwesomeIcon'
import Text from 'core/elements/text'
import SimpleLink from './SimpleLink'

const useStyles = makeStyles((theme: Theme) => ({
  dropdownContainer: {
    display: 'inline-block',
    position: 'relative',
    '&:hover': {
      '& $dropdown': {
        visibility: 'visible',
        zIndex: 100000000,
      },
    },
  },
  dropdown: {
    position: 'absolute',
    visibility: 'hidden',
    background: theme.palette.grey['000'],
    paddingInlineStart: 0,
    listStyle: 'none',
    marginBlockStart: 0,
    marginBlockEnd: 0,
    width: 'calc(100% - 2px)',
    textAlign: 'center',
    borderColor: theme.palette.blue[500],
    borderStyle: 'solid',
    borderWidth: '0px 1px 1px 1px',
    borderRadius: '0px 0px 4px 4px',
    padding: theme.spacing(1, 0),
  },
  dropdownLink: {
    padding: theme.spacing(1, 0),
  },
  button: {
    paddingLeft: theme.spacing(3),
    paddingRight: theme.spacing(1.5),
    '&:focus': {
      outline: 0,
    },
  },
  linkText: {
    color: theme.palette.grey[700],
    '&:hover': {
      textDecoration: 'none',
      color: theme.palette.blue[500],
    },
  },
}))

interface Link {
  link: string
  label: string
}

interface Props {
  links: Link[]
  addText?: string
}

const DropdownButton = ({ links, addText }: Props) => {
  const classes = useStyles({})

  return (
    <div className={classes.dropdownContainer}>
      <Button className={classes.button}>
        <>
          <Text variant="caption1">{addText}</Text>
          <FontAwesomeIcon>angle-down</FontAwesomeIcon>
        </>
      </Button>
      <ul className={classes.dropdown}>
        {links.map((link) => (
          <li key={link.label}>
            <Text variant="caption1" className={classes.dropdownLink}>
              <SimpleLink src={link.link} className={classes.linkText}>
                {link.label}
              </SimpleLink>
            </Text>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default DropdownButton
