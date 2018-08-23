// Selector for the auth portion of the state
// We should make it so that the parent app can specify
// which part of the state is auth, rather than hardcoding it

export const getAuthState = (state) => state.auth;
