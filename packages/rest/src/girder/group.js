import { girderClient } from '@openchemistry/girder-redux';

export function get(name) {

  return girderClient().get('group', {
    params: {
      text: name,
      exact: false,
      limit: 50,
      sort: 'name',
      sortdir: 1
    }
  })
  .then(response => response.data )
}
