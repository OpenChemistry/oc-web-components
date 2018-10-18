import { girderClient } from '@openchemistry/girder-redux';

export function list(folderId) {

  return girderClient().get('item', {
    params: {
      folderId
    }
  })
  .then(response => response.data )
}

export function files(itemId) {

  return girderClient().get(`item/${itemId}/files`)
  .then(response => response.data )
}
