import React from 'react'
import FormWrapper from 'core/components/FormWrapper'
import requiresAuthentication from '../../util/requiresAuthentication'
import DataUpdater from 'core/DataUpdater'
import UpdateImageForm from './UpdateImageForm'
import { compose } from 'core/../../../../utils/fp'
import { loadImages, updateImage } from './actions'

const UpdateImagePage = props => (
  <DataUpdater
    dataKey="images"
    loaderFn={loadImages}
    updateFn={updateImage}
    objId={props.match.params.imageId}
    backUrl="/ui/openstack/images"
  >
    {({ data, onSubmit }) =>
      <FormWrapper title="Update Image" backUrl="/ui/openstack/images">
        <UpdateImageForm image={data} onSubmit={onSubmit} />
      </FormWrapper>
    }
  </DataUpdater>
)

export default compose(
  requiresAuthentication,
)(UpdateImagePage)
