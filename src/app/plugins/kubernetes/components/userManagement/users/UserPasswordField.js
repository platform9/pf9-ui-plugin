import TextField from 'core/components/validatedForm/TextField'
import { Typography, List } from '@material-ui/core'
import {
  hasMinLength,
  hasOneLowerChar,
  hasOneUpperChar,
  hasOneNumber,
  hasOneSpecialChar,
  requiredValidator,
  passwordValidator,
  specialChars,
} from 'core/utils/fieldValidators'
import React from 'react'
import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'
import CheckIcon from '@material-ui/icons/Check'
import ClearIcon from '@material-ui/icons/Clear'

const passwordValidators = [requiredValidator, passwordValidator]

const CheckListItem = ({ children, checked }) => (
  <ListItem>
    <ListItemIcon>
      {checked ? (
        <CheckIcon />
      ) : (
        <ClearIcon data-testid="user-password-field-error" color="error" />
      )}
    </ListItemIcon>
    <ListItemText primary={children} />
  </ListItem>
)

const UserPasswordField = ({ value }) => (
  <>
    <TextField
      data-testid="user-password-field"
      id="password"
      label="Password"
      value={value}
      type="password"
      validations={passwordValidators}
    />
    <Typography variant="body1" component="div">
      Password must contain the following:
      <List dense>
        <CheckListItem
          data-testid="user-password-field-char-length"
          checked={hasMinLength(8)(value)}
        >
          At least 8 characters long
        </CheckListItem>
        <CheckListItem
          data-testid="user-password-field-lower-case-char"
          checked={hasOneLowerChar(value)}
        >
          1 Lowercase letter
        </CheckListItem>
        <CheckListItem
          data-testid="user-password-field-upper-case-char"
          checked={hasOneUpperChar(value)}
        >
          1 Uppercase letter
        </CheckListItem>
        <CheckListItem data-testid="user-password-field-number" checked={hasOneNumber(value)}>
          1 Number
        </CheckListItem>
        <CheckListItem
          data-testid="user-password-field-special-char"
          checked={hasOneSpecialChar(value)}
        >
          1 Special character - {specialChars}
        </CheckListItem>
      </List>
    </Typography>
  </>
)

export default UserPasswordField
