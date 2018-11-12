import { createAction, handleActions } from 'redux-actions';

export const RECEIVE_NOTIFICATION = 'RECEIVE_NOTIFICATION'
export const EVENT_SOURCE_ERROR = 'EVENT_SOURCE_ERROR'
export const CONNECT_TO_NOTIFICATIONS = 'CONNECT_TO_NOTIFICATIONS'

const initialState = {};

// Reducer
const reducer = handleActions({
}, initialState);

// Action Creators
export const receiveNotification = createAction(RECEIVE_NOTIFICATION);
export const eventSourceError = createAction(EVENT_SOURCE_ERROR);
export const connectToNotifications = createAction(CONNECT_TO_NOTIFICATIONS);

export default reducer;

