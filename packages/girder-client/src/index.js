import axios, { CancelToken } from 'axios';
import { CANCEL } from 'redux-saga';

let _girderClient = axios.create({
  baseURL: `${window.location.origin}/api/v1`
});

function get(url, config) {
  const source = CancelToken.source()
  const request = _girderClient.get(url, { cancelToken: source.token, ...config })
  request[CANCEL] = () => source.cancel()
  return request
}

function post(url, data, config) {
  const source = CancelToken.source()
  const request = _girderClient.post(url, data, { ...config, cancelToken: source.token })
  request[CANCEL] = () => source.cancel()
  return request
}

function put(url, data, config) {
  const source = CancelToken.source()
  const request = _girderClient.put(url, data, { ...config, cancelToken: source.token })
  request[CANCEL] = () => source.cancel()
  return request
}

function patch(url, data, config) {
  const source = CancelToken.source()
  const request = _girderClient.patch(url, data, { ...config, cancelToken: source.token })
  request[CANCEL] = () => source.cancel()
  return request
}

function delete_(url, config) {
  const source = CancelToken.source()
  const request = _girderClient.delete(url, { ...config, cancelToken: source.token })
  request[CANCEL] = () => source.cancel()
  return request
}

function updateToken(token) {
  _girderClient.defaults.headers = {
     'Girder-Token': token
  }
}

function setPrefix(prefix) {
  prefix = prefix.trim();
  // Ensure leading slash
  if (prefix.length != 0 && prefix[0] !== '/') {
    prefix = `/${prefix}`;
  }

  // Remove any trailing slash
  prefix = prefix.replace(/\/+$/, "");
  _girderClient.defaults.baseURL = `${window.location.origin}${prefix}/api/v1`
}

function getBaseUrl() {
  return _girderClient.defaults.baseURL;
}

function girderClient() {
  return {
  get,
  post,
  put,
  patch,
  delete: delete_,
  updateToken,
  setPrefix
  };
}

export default girderClient;
