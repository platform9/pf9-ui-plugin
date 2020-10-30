import React, { useState, useMemo, ComponentType } from 'react'
import { makeStyles, createStyles } from '@material-ui/styles'
import Box from '@material-ui/core/Box'
import FormControl from '@material-ui/core/FormControl'
import InputAdornment from '@material-ui/core/InputAdornment'
import OutlinedInput from '@material-ui/core/OutlinedInput'
import SearchIcon from '@material-ui/icons/Search'
import Fuse from 'fuse.js'
import { FormHelperText } from '@material-ui/core'
import clsx from 'clsx'
import Text from 'core/elements/text'
import Theme from 'core/themes/model'
import RadioFields from './validatedForm/radio-fields'

const FUSE_OPTIONS = {
  keys: ['value', 'label'],
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    container: {
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      padding: theme.spacing(2, 1, 1, 1),
      borderRadius: 4,
      border: `1px solid ${theme.palette.grey[400]}`,
      maxHeight: '350px',
    },
    label: {
      position: 'absolute',
      top: -12,
      backgroundColor: 'white',
      padding: 4,
    },
    searchInputWrapper: {
      marginBottom: 4,
    },
    notchedOutline: {
      borderRadius: 0,
    },
    input: {
      boxSizing: 'border-box',
      height: 28,
      padding: 6,
      fontSize: 13,
    },
    adornedStart: {
      paddingLeft: 8,
    },
    searchIcon: {
      color: '#BABABA',
    },
    positionStart: {
      marginRight: 0,
    },
    options: {
      overflowY: 'auto',
      display: 'flex',
      flexDirection: 'column',
    },
  }),
)

interface Props {
  id: string
  label: string
  options: any
  hasError?: boolean
  required?: boolean
  errorMessage?: string
  value?: any
  onChange?: (any) => any
  maxOptions?: number
  sortSelectedFirst?: boolean
  className?: string
}

const SingleSelect: ComponentType<Props> = React.forwardRef<HTMLElement, Props>(
  (
    {
      id,
      label,
      hasError,
      required,
      errorMessage,
      options,
      value,
      onChange,
      maxOptions,
      sortSelectedFirst,
      className,
    },
    ref: React.Ref<HTMLDivElement>,
  ) => {
    const classes = useStyles()

    const [term, setTerm] = useState('')
    const fuse = useMemo(() => new Fuse(options, FUSE_OPTIONS), [options])

    // Change visibleOptions when we receive async changes to options.
    // `options` is originally `[]` during most async data loading.
    const sortedOptions = useMemo(() => {
      const visibleOptions = term ? fuse.search(term) : options
      const sortBySelected = (a, b) => (value === b.value - value) === a.value
      return sortSelectedFirst ? visibleOptions.sort(sortBySelected) : visibleOptions
    }, [term, fuse, value, sortSelectedFirst])

    const toggleOption = (value) => {
      onChange(value)
    }

    const onHitEnter = () => {
      if (sortedOptions.length === 1) {
        toggleOption(sortedOptions[0].value)
      }
    }

    return (
      <div className={clsx('MuiFormControl-root', className)}>
        <FormControl className={classes.container} id={id} error={hasError} ref={ref}>
          <Text className={classes.label} variant="caption">
            {required ? `${label} *` : label}
          </Text>
          <SearchField
            classes={classes}
            term={term}
            onSearchChange={setTerm}
            onHitEnter={onHitEnter}
          />
          <Box
            className={classes.options}
            style={{ height: maxOptions ? getOptionsHeight(maxOptions) : 'initial' }}
          >
            <RadioFields
              id={id}
              key={id}
              options={sortedOptions}
              value={value}
              onChange={onChange}
            />
          </Box>
          {errorMessage && <FormHelperText>{errorMessage}</FormHelperText>}
        </FormControl>
      </div>
    )
  },
)

const SearchField = ({ classes, term, onSearchChange, onHitEnter }) => {
  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      onHitEnter()
    } else if (event.key === 'Escape') {
      onSearchChange('')
    }
  }

  return (
    <FormControl className={classes.searchInputWrapper}>
      <OutlinedInput
        value={term}
        onChange={(e) => onSearchChange(e.target.value)}
        onKeyDown={handleKeyDown}
        startAdornment={
          <InputAdornment position="start" classes={{ positionStart: classes.positionStart }}>
            <SearchIcon className={classes.searchIcon} />
          </InputAdornment>
        }
        classes={{
          notchedOutline: classes.notchedOutline,
          input: classes.input,
          adornedStart: classes.adornedStart,
        }}
      />
    </FormControl>
  )
}

const getOptionsHeight = (maxOptions) => maxOptions * 28

export default SingleSelect
