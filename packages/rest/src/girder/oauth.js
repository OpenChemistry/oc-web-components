import { girderClient } from '@openchemistry/girder-redux';

export function fetchProviders(redirect) {
  return girderClient().get('oauth/provider', {
    params: {
      redirect
    }
  })
  .then(response => response.data )
}
