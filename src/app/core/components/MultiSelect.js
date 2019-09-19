import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { makeStyles, createStyles } from '@material-ui/styles';
import Box from '@material-ui/core/Box'
import FormControl from '@material-ui/core/FormControl'
import InputLabel from '@material-ui/core/InputLabel';
import InputAdornment from '@material-ui/core/InputAdornment';
import OutlinedInput from '@material-ui/core/OutlinedInput';
import MenuItem from '@material-ui/core/MenuItem'
import Select from '@material-ui/core/Select'
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import SearchIcon from '@material-ui/icons/Search';

const useStyles = makeStyles(theme => createStyles({
    container: {
        display: "inline-flex",
        flexDirection: "column",
        padding: 10,
        border: "1px solid #000",
    },
    option: {

    },
}));

const MultiSelect = ({label, options, values, onChange}) => {
    const classes = useStyles();
    const optionsWithStatus = options.map(option => ({
        ...option,
        checked: values.includes(option.value),
    }));

    const toggleOption = (value) => {
        const updatedValues = values.includes(value)
            ? values.filter(currentValue => currentValue !== value)
            : [...values, value];

        onChange(updatedValues);
    };

    return (
        <Box className={classes.container}>
            <SearchField />
            {optionsWithStatus.map((option) => (
                <Option
                    classes={classes}
                    key={option.value}
                    label={option.label}
                    value={option.value}
                    checked={option.checked}
                    onChange={() => toggleOption(option.value)}
                />
            ))}
        </Box>
    );
};

const SearchField = () => {
    const [term, setTerm] = useState("");

    return (
        <FormControl>
            <OutlinedInput
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                startAdornment={<InputAdornment position="start"><SearchIcon /></InputAdornment>}
            />
        </FormControl>
    );
};

const Option = ({classes, label, ...checkboxProps}) =>
    <FormControlLabel
        className={classes.options}
        label={label}
        control={<Checkbox {...checkboxProps} />}
    />;

const optionPropType = PropTypes.shape({
  value: PropTypes.string,
  label: PropTypes.string,
})

MultiSelect.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  options: PropTypes.arrayOf(optionPropType).isRequired,
  values: PropTypes.arrayOf(PropTypes.string),
  onChange: PropTypes.func,
}

export default MultiSelect;
