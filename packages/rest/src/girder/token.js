import { girderClient } from '@openchemistry/girder-redux';

export function invalidate() {
  return girderClient().delete(`token/session`)
         .then(response => response.data )
}

