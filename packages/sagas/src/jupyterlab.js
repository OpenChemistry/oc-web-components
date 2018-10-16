import { put, call, select, takeEvery } from 'redux-saga/effects'
import { authenticate, logout, stopServer } from '@openchemistry/rest'
import { selectors } from '@openchemistry/redux'
import { jupyterlab } from '@openchemistry/redux'
import parseUrl from 'url-parse'

export function* redirect(action) {
  const {notebookPath} = action.payload;

  try {
    const redirecting = yield select(selectors.jupyterlab.redirecting)

    // If we are already redirecting, just return
    if (redirecting) {
      return;
    }

    yield put(jupyterlab.redirectingToJupyterHub());

    const token = yield select(selectors.girder.getToken)
    const baseUrl = yield call(authenticate, token)

    var redirectUrl = parseUrl(baseUrl);
    const currentPathName = redirectUrl.pathname;
    // Update the pathname to point to the notebook we are redirecting to.
    redirectUrl.set('pathname', `${currentPathName}/tree/${notebookPath}`)

    // Now do the redirect
    window.location = redirectUrl.toString();
  }
  catch(error) {
    yield put(jupyterlab.redirectingToJupyterHub(error));
  }
}

export function* watchRedirectToJupyterHub() {
  yield takeEvery(jupyterlab.REDIRECT_TO_JUPYTERHUB, redirect);
}

export function* invalidateSession(action) {
  try {
    const me = yield select(selectors.girder.getMe)
    yield put( jupyterlab.requestSessionInvalidation() )
    yield call(stopServer, me.login)
    yield call(logout)
  }
  catch(error) {
    yield put( jupyterlab.requestSessionInvalidation(error) )
    console.log(error)
  }
}

export function* watchInvalidateSession() {
  yield takeEvery(jupyterlab.INVALIDATE_SESSION, invalidateSession)
}
