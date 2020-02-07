import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { makeStyles } from '@material-ui/styles'
import clsx from 'clsx'

const extraHeaderRef = React.createRef()

export const PageContext = React.createContext({
  extraHeaderContainer: null,
})

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexFlow: 'column nowrap',
  },
  header: {
    display: 'flex',
    flexFlow: 'column nowrap',
    flexGrow: 1,
    zIndex: 1,
    position: 'relative',
    color: theme.palette.text.primary,
  },
  headerContents: {
    display: 'flex',
    flexFlow: 'row nowrap',
    justifyContent: 'space-between',
    paddingBottom: theme.spacing(1),
    marginBottom: theme.spacing(2),
  },
  extraHeader: {
    position: ({ floatingHeader }) => (floatingHeader ? 'absolute' : 'static'),
    top: ({ floatingHeader }) => (floatingHeader ? '100%' : 'none'),
    right: 0,
    display: 'flex',
    flexFlow: 'row nowrap',
    justifyContent: 'flex-end',
  },
  content: {
    zIndex: 0,
    minHeight: 400,
  },
}))

/**
 * Component to be used as a container for the sections contents which allows to use
 * PageContainerHeader to render extra header contents dynamically within any children and also
 * exposes a "header" prop to render any arbitrary fixed header content
 */
const PageContainer = ({ children, header = undefined, className = '', ...rest }) => {
  const classes = useStyles(rest)
  const [extraHeaderContainer, setExtraHeaderContainer] = useState(null)

  useEffect(() => {
    // We must set the extraHeader element ref in the state when the component is mounted
    // so that it is correctly updated and reflected in the PageContext consumers
    setExtraHeaderContainer(extraHeaderRef.current)
  }, [])

  return (
    <div className={clsx(classes.root, className)}>
      <div className={classes.header}>
        {header && <div className={classes.headerContents}>{header}</div>}
        <div className={classes.extraHeader} ref={extraHeaderRef} />
      </div>
      <div className={classes.content}>
        <PageContext.Provider value={{ extraHeaderContainer }}>{children}</PageContext.Provider>
      </div>
    </div>
  )
}

PageContainer.propTypes = {
  header: PropTypes.node,
  // eslint-disable-next-line react/no-unused-prop-types
  floatingHeader: PropTypes.bool,
}

PageContainer.defaultProps = {
  floatingHeader: true,
}

export default PageContainer
