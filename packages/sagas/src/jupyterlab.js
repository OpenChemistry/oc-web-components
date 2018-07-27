import { put, call, select, takeEvery } from 'redux-saga/effects'
import { authenticate, logout, stopServer } from '@openchemistry/rest'
import { selectors } from '@openchemistry/redux'
import { jupyterlab } from '@openchemistry/redux'

export function* redirect(action) {
  try {
    const redirecting = yield select(selectors.jupyterlab.redirecting)

    // If we are already redirecting, just return
    if (redirecting) {
      return;
    }

    yield put(jupyterlab.redirectingToJupyterHub());

    const token = yield select(selectors.girder.getToken)
    const redirectUrl = yield call(authenticate, token)
    // Now do the redirect
    window.location = redirectUrl;
  }
  catch(error) {
    yield put(jupyterlab.redirectingToJupyterHub(error));
    console.log(error)
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
