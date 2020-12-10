import React from 'react'
import Text from 'core/elements/text'
import { makeStyles } from '@material-ui/styles'
import Theme from 'core/themes/model'
import FontAwesomeIcon from 'core/components/FontAwesomeIcon'
import TextField from 'core/components/validatedForm/TextField'
import CriteriaPicklist from './CriteriaPicklist'
import CheckboxField from 'core/components/validatedForm/CheckboxField'
import { append } from 'ramda'
import uuid from 'uuid'

const useStyles = makeStyles((theme: Theme) => ({
  groupMappingIcon: {
    fontSize: 18,
    color: theme.palette.blue[500],
    marginRight: theme.spacing(2),
  },
  groupMappingButton: {
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(2),
    cursor: 'pointer',
    display: 'inline-block',
  },
}))

interface Props {
  wizardContext: any
  setWizardContext: any
}

const updateCustomMappingField = ({
  value,
  property,
  mappingId,
  wizardContext,
  setWizardContext,
}) => {
  const existingMapping = wizardContext.customMappings.find((mapping) => mapping.id === mappingId)
  const newMapping = { ...existingMapping, [property]: value }
  const newMappings = wizardContext.customMappings.map((mapping) =>
    mapping.id === mappingId ? newMapping : mapping,
  )
  setWizardContext({ customMappings: newMappings })
}

const renderCustomMappings = ({ wizardContext, setWizardContext, classes }) => (
  <>
    {wizardContext.customMappings.map((mapping, index) => (
      <div key={mapping.id}>
        <div>
          <Text
            onClick={() =>
              removeCustomMapping({ mappingId: mapping.id, wizardContext, setWizardContext })
            }
            className={classes.groupMappingButton}
            variant="caption1"
          >
            <FontAwesomeIcon solid className={classes.groupMappingIcon}>
              minus-circle
            </FontAwesomeIcon>
            Group Mapping {index + 1}
          </Text>
        </div>
        <TextField
          id={`${mapping.id}-attribute`}
          label="SAML Group Attribute"
          value={mapping.attribute}
          onChange={(value) =>
            updateCustomMappingField({
              value,
              property: 'attribute',
              mappingId: mapping.id,
              wizardContext,
              setWizardContext,
            })
          }
          required
        />
        <CriteriaPicklist
          value={mapping.criteria}
          onChange={(value) =>
            updateCustomMappingField({
              value,
              property: 'criteria',
              mappingId: mapping.id,
              wizardContext,
              setWizardContext,
            })
          }
          formField
          required
        />
        <TextField
          id={`${mapping.id}-values`}
          label="SAML Group Values"
          value={mapping.values}
          onChange={(value) =>
            updateCustomMappingField({
              value,
              property: 'values',
              mappingId: mapping.id,
              wizardContext,
              setWizardContext,
            })
          }
          info={
            <>
              <div>
                This is a comma separated list of values for the SAML attribute key defined above
                that is used to identify one or more collections of users that you'd like to map to
                this OpenStack Group. Example values when the key is 'Department' could be "dev, QA,
                devops, sales".
              </div>
              <br></br>
              <div>
                NOTE: Requires that the 'Custom SAML Attribute Key' field is filled in order to take
                effect.
              </div>
            </>
          }
          multiline
          rows={3}
          required
        />
        <CheckboxField
          id={`${mapping.id}-regexMatching`}
          label="Enable Regex Matching"
          value={mapping.regexMatching}
          onChange={(value) =>
            updateCustomMappingField({
              value,
              property: 'regexMatching',
              mappingId: mapping.id,
              wizardContext,
              setWizardContext,
            })
          }
          info="If checked, SAML attribute values will be matched as a regular expression."
        />
      </div>
    ))}
  </>
)

const newCustomMapping = ({ wizardContext, setWizardContext }) => {
  setWizardContext({ customMappings: append({ id: uuid.v4() }, wizardContext.customMappings) })
}

const removeCustomMapping = ({ mappingId, wizardContext, setWizardContext }) => {
  setWizardContext({
    customMappings: wizardContext.customMappings.filter((mapping) => mapping.id !== mappingId),
  })
}

const GroupCustomMappingsFields = ({ wizardContext, setWizardContext }: Props) => {
  const classes = useStyles({})
  return (
    <>
      {renderCustomMappings({ wizardContext, setWizardContext, classes })}
      <div>
        <Text
          onClick={() => newCustomMapping({ wizardContext, setWizardContext })}
          className={classes.groupMappingButton}
          variant="caption1"
        >
          <FontAwesomeIcon solid className={classes.groupMappingIcon}>
            plus-circle
          </FontAwesomeIcon>
          Add Group Mapping
        </Text>
      </div>
    </>
  )
}

export default GroupCustomMappingsFields
