import girderClient from '@openchemistry/girder-client';

export function create(parentId, parentType, name, size, mimeType='application/octet-stream') {
  return girderClient().post('file', null, {
    params: {
      parentId,
      parentType,
      name,
      size,
      mimeType,
    }
  })
  .then(response => response.data );
}

export function update(id, size) {
  return girderClient().put(`file/${id}/content`, {},  {
    params: {
      size,
    }
  })
  .then(response => response.data )
}

export function content(id, size) {

  return girderClient().put(`file/${id}/content`, null,  {
    params: {
      size,
    }
  })
  .then(response => response.data );
}

export function chunk(uploadId, offset, data, config) {
  return girderClient().post('file/chunk', data,  {
    ...config,
    headers: {
      'Content-Type': 'application/octet-stream'
    },
    params: {
      uploadId,
      offset,
    }
  })
  .then(response => response.data )
}

export function get(id) {
  return girderClient().put(`file/${id}`)
  .then(response => response.data )
}
