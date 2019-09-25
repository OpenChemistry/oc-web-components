import girderClient from '@openchemistry/girder-client';

export function fetchUserData() {
  return girderClient().get(`user/me`)
  .then(response => response.data)
}

export function updateUserInformation(id, values) {
  const data = new FormData();
    data.set('id', id);
    data.set('firstName', values.firstName);
    data.set('lastName', values.lastName);
    data.set('email', values.email);

  return girderClient().put(`user/${id}`, data)
	.then(response => response.data);
}

export function twitterLogin(userId, mediaId) {
  const data = new FormData();
  data.set('twitter', mediaId);

  return girderClient()
  .post(`user/${userId}/twitter`, data)
  .then(response => response.data)
}

export function orcidLogin(userId, mediaId) {
  const data = new FormData();
  data.set('orcid', mediaId);

  return girderClient()
  .post(`user/${userId}/orcid`, data)
  .then(response => response.data)
}

export function twitterId(id) {
  return girderClient().get(`user/${id}/twitter`)
  .then(response => response.data);
}

export function orcidId(id) {
  return girderClient().get(`user/${id}/orcid`)
  .then(response => response.data)
}

export function getApiKeys(apiKey) {
  return girderClient().get(`api_key`)
  .then(response => response.data)
}

export function deleteApiKey(id) {
  return girderClient().delete(`api_key/${id}`)
  .then(response => response.data)
}

export function editApiKey(key) {
  const { active, scope, tokenDuration, name } = key;
  const data = new FormData();
  data.set('active', active);
  data.set('scope', JSON.stringify(scope));
  data.set('tokenDuration', tokenDuration ? tokenDuration : '');
  data.set('name', name);

  return girderClient().put(`api_key/${key._id}`, data)
  .then(response => response.data)
}

export function createApiKey(key) {
  const { active, scope, tokenDuration, name } = key;
  const data = new FormData();
  data.set('active', active);
  data.set('scope', JSON.stringify(scope));
  data.set('tokenDuration', tokenDuration ? tokenDuration : '');
  data.set('name', name);

  return girderClient().post(`api_key`, data)
  .then(response => response.data)
}