import React from 'react'
import { compose } from 'app/utils/fp'
import FormWrapper from 'core/components/FormWrapper'
import DataUpdater from 'core/DataUpdater'
import requiresAuthentication from '../../util/requiresAuthentication'
import { loadImages, updateImage } from './actions'
import UpdateImageForm from './UpdateImageForm'

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
