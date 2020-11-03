import React, { useContext, useEffect } from 'react'
import { makeStyles } from '@material-ui/styles'
import Theme from 'core/themes/model'
import { RenderLabels } from 'k8s/components/pods/renderLabels'
import { pick, pickBy } from 'ramda'
import clsx from 'clsx'
import { WizardContext } from './Wizard'
import CodeBlock from '../CodeBlock'

interface Props<T extends {}> {
  fields: T
  calloutFields?: Array<keyof T>
  children?: JSX.Element | JSX.Element[]
  icon?: JSX.Element
  className?: any
  showContextPreview?: boolean
  keyOverrides?: { [key: string]: string }
  renderLabels?: (labels) => JSX.Element
}

/*
  An opinionated meta component that will call out specific important fields as they are filled
*/

const isNotUndefined = (val) => val !== undefined

export default function WizardMeta<T>({
  children,
  keyOverrides = undefined,
  calloutFields = [],
  fields,
  icon,
  className,
  showContextPreview = false,
  renderLabels = (labels) => (
    <RenderLabels keyOverrides={keyOverrides} labels={labels} inverse split />
  ),
}: Props<T>) {
  const { setWizardCalloutFields } = useContext(WizardContext as any)
  useEffect(() => {
    setWizardCalloutFields(calloutFields)
  }, [])
  const classes = useStyles({ icon: !!icon })
  const labels = pickBy(isNotUndefined, pick(calloutFields, fields))
  return (
    <div className={clsx(classes.wizardMeta, className)}>
      <aside>
        {icon && (
          <>
            {icon}
            <div />
          </>
        )}
        {labels && renderLabels(labels)}
      </aside>
      {children}
      {showContextPreview && <CodeBlock>{JSON.stringify(fields, null, 2)}</CodeBlock>}
    </div>
  )
}

const useStyles = makeStyles<Theme, { icon: boolean }>((theme) => ({
  wizardMeta: {
    display: 'grid',
    gridTemplateColumns: '240px max-content max-content',
    gridGap: 24,

    '& aside': {
      display: 'grid',
      gridTemplateRows: ({ icon }) => `${icon ? '140px 20px ' : ''}repeat(auto-fill, 20px)`,
      gridGap: 4,
    },
  },
}))
