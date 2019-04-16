import { createAction, handleActions } from 'redux-actions';

const PREFIX = '@@girder-redux/notifications/';

export const RECEIVE_NOTIFICATION = PREFIX + 'RECEIVE_NOTIFICATION'
export const EVENT_SOURCE_ERROR = PREFIX + 'EVENT_SOURCE_ERROR'
export const CONNECT_TO_NOTIFICATIONS = PREFIX + 'CONNECT_TO_NOTIFICATIONS'

const initialState = {};

// Reducer
const reducer = handleActions({
}, initialState);

// Action Creators
export const receiveNotification = createAction(RECEIVE_NOTIFICATION);
export const eventSourceError = createAction(EVENT_SOURCE_ERROR);
export const connectToNotifications = createAction(CONNECT_TO_NOTIFICATIONS);

export default reducer;
