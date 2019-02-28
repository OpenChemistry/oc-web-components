import girderClient from '@openchemistry/girder-client';

export function get() {
  return girderClient().get('configuration')
          .then(response => response.data )
}
