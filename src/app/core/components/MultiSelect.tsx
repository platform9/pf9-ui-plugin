import React, { useState, useMemo, ComponentType, useEffect } from 'react'
import { makeStyles, createStyles } from '@material-ui/styles'
import Box from '@material-ui/core/Box'
import FormControl from '@material-ui/core/FormControl'
import InputAdornment from '@material-ui/core/InputAdornment'
import OutlinedInput from '@material-ui/core/OutlinedInput'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Checkbox from '@material-ui/core/Checkbox'
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank'
import CheckBoxIcon from '@material-ui/icons/CheckBox'
import SearchIcon from '@material-ui/icons/Search'
import Fuse from 'fuse.js'
import { FormHelperText } from '@material-ui/core'
import { emptyArr } from 'utils/fp'
import clsx from 'clsx'
import Text from 'core/elements/text'
import Theme from 'core/themes/model'
import { IndeterminateCheckBox } from '@material-ui/icons'
import { allKey } from 'app/constants'

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
    formControlLabelRoot: {
      marginLeft: -6,
      margin: '2px 0',
    },
    checkbox: {
      padding: 4,
    },
    checkboxSize: {
      fontSize: 16,
    },
    selectDeselectCheckbox: {
      padding: theme.spacing(0, 2, 0, 0),
      justifySelf: 'flex-start',
    },
    options: {
      overflowY: 'auto',
      display: 'flex',
      flexDirection: 'column',
    },
    optionLabel: {
      fontSize: 13,
    },
    controls: {
      display: 'grid',
      gridTemplateColumns: 'auto 1fr',
      gridTemplateRows: '40px',
    },
  }),
)

interface Props {
  id: string
  label?: string
  options: any
  hasError?: boolean
  required?: boolean
  errorMessage?: string
  values?: any
  onChange?: (any) => any
  maxOptions?: number
  sortSelectedFirst?: boolean
  className?: string
  showSelectDeselectAllOption?: boolean
  maxHeight?: number
}

const MultiSelect: ComponentType<Props> = React.forwardRef<HTMLElement, Props>(
  (
    {
      id,
      label,
      hasError,
      required,
      errorMessage,
      options,
      values = emptyArr,
      onChange,
      maxOptions,
      maxHeight,
      sortSelectedFirst,
      className,
      showSelectDeselectAllOption,
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
      const sortBySelected = (a, b) => values.includes(b.value) - values.includes(a.value)
      return sortSelectedFirst ? visibleOptions.sort(sortBySelected) : visibleOptions
    }, [term, fuse, values, sortSelectedFirst])

    useEffect(() => {
      if (values === allKey) {
        // Select All
        onChange(sortedOptions.map((option) => option.value))
      }
    }, [values])

    const toggleOption = (value) => {
      const updatedValues = values.includes(value)
        ? values.filter((currentValue) => currentValue !== value)
        : [...values, value]
      onChange(updatedValues)
    }

    const onHitEnter = () => {
      if (sortedOptions.length === 1) {
        toggleOption(sortedOptions[0].value)
      }
    }

    const handleSelectDeselectChange = () => {
      if (values.length > 0) {
        // Deselect All
        onChange([])
      } else {
        // Select All
        onChange(sortedOptions.map((option) => option.value))
      }
    }

    const controls = showSelectDeselectAllOption ? (
      <div className={classes.controls}>
        {showSelectDeselectAllOption && (
          <Checkbox
            color="primary"
            className={classes.selectDeselectCheckbox}
            icon={<CheckBoxOutlineBlankIcon className={classes.checkboxSize} />}
            checked={values.length > 0}
            checkedIcon={<IndeterminateCheckBox className={classes.checkboxSize} />}
            onChange={handleSelectDeselectChange}
          />
        )}
        <SearchField
          classes={classes}
          term={term}
          onSearchChange={setTerm}
          onHitEnter={onHitEnter}
        />
      </div>
    ) : (
      <SearchField classes={classes} term={term} onSearchChange={setTerm} onHitEnter={onHitEnter} />
    )

    return (
      <div className={clsx('MuiFormControl-root', className)}>
        <FormControl
          className={classes.container}
          id={id}
          error={hasError}
          ref={ref}
          style={{ maxHeight: maxHeight ? maxHeight : 350 }}
        >
          {label && (
            <Text className={classes.label} variant="caption">
              {required ? `${label} *` : label}
            </Text>
          )}
          {controls}
          <Box
            className={classes.options}
            style={{ height: maxOptions ? getOptionsHeight(maxOptions) : 'initial' }}
          >
            {sortedOptions.map((option) => (
              <Option
                classes={classes}
                key={option.value}
                label={option.label}
                value={option.value}
                checked={values.includes(option.value)}
                onChange={() => toggleOption(option.value)}
              />
            ))}
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

const Option = ({ classes, label, ...checkboxProps }) => (
  <FormControlLabel
    label={label}
    control={
      <Checkbox
        color="primary"
        className={classes.checkbox}
        icon={<CheckBoxOutlineBlankIcon className={classes.checkboxSize} />}
        checkedIcon={<CheckBoxIcon className={classes.checkboxSize} />}
        {...checkboxProps}
      />
    }
    classes={{ root: classes.formControlLabelRoot, label: classes.optionLabel }}
  />
)

const getOptionsHeight = (maxOptions) => maxOptions * 28

export default MultiSelect
