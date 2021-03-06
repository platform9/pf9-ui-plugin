import React, { forwardRef } from 'react'
import PropTypes from 'prop-types'
import Picklist from 'core/components/Picklist'
import useDataLoader from 'core/hooks/useDataLoader'
import { ValidatedFormInputPropTypes } from 'core/components/validatedForm/withFormContext'
import { loadNodes } from 'k8s/components/infrastructure/nodes/actions'
import { pathStrOr } from 'utils/fp'
import { uniq } from 'ramda'

const VipInterfaceChooser = forwardRef(({ masterNodes, ...rest }, ref) => {
  const [nodes, loading] = useDataLoader(loadNodes)
  const masters = nodes.filter((node) => masterNodes && masterNodes.includes(node.uuid))

  const options = uniq(
    masters
      .map((node) => {
        const interfacesObj = pathStrOr([], 'combined.networkInterfaces', node)
        return Object.keys(interfacesObj).map((iface) => ({ value: iface, label: iface }))
      })
      .flat(),
  )

  return <Picklist {...rest} ref={ref} loading={loading} options={options} />
})

VipInterfaceChooser.propTypes = {
  id: PropTypes.string.isRequired,
  masterNodes: PropTypes.arrayOf(PropTypes.string),
  onChange: PropTypes.func,
  ...ValidatedFormInputPropTypes,
}

export default VipInterfaceChooser
