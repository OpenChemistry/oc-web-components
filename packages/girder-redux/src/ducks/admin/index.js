import { createAction, handleActions } from 'redux-actions';

//Default State
const initialState = {
    byUserId: {
	visible: false,
	users: {}
    },
    byGroupId: {},
    byMemberId: {
	visible: false,
	members: {}
    },
    currentGroup: {}
};

//Selectors
let getRoot = (state) => state;
export const initRoot = (getRootFn) => {getRoot = getRootFn;};
export const getGroupsByIds = (state) => getRoot(state).admin.byGroupId;
export const getMembersByIds = (state) => getRoot(state).admin.byMemberId.members;
export const getUsersByIds = (state) => getRoot(state).admin.byUserId.users;
export const getCurrentGroup = (state) => getRoot(state).admin.currentGroup;
export const getMembersVisibility = (state) => getRoot(state).admin.byMemberId.visible;
export const getUsersVisibility = (state) => getRoot(state).admin.byUserId.visible;

//Actions
const FETCH_GROUPS_REQUESTED = 'FETCH_GROUPS_REQUESTED';
const FETCH_GROUPS_SUCCEEDED = 'FETCH_GROUPS_SUCCEEDED';
const FETCH_GROUPS_FAILED = 'FETCH_GROUPS_FAILED';
const REMOVE_GROUP = 'REMOVE_GROUP';
const REMOVE_GROUP_FAILED = 'REMOVE_GROUP_FAILED';
const SET_CURRENT_GROUP = 'SET_CURRENT_GROUP';

const ADD_MEMBER = 'ADD_MEMBER';
const ADD_MEMBER_FAILED = 'ADD_MEMBER_FAILED';
const FETCH_MEMBERS_REQUESTED = 'FETCH_MEMBERS_REQUESTED';
const FETCH_MEMBERS_SUCCEEDED = 'FETCH_MEMBERS_SUCCEEDED';
const FETCH_MEMBERS_FAILED = 'FETCH_MEMBERS_FAILED';
const REMOVE_MEMBER = 'REMOVE_MEMBER';
const REMOVE_MEMBER_FAILED = 'REMOVE_MEMBER_FAILED';
const SHOW_MEMBERS = 'SHOW_MEMBERS';

const FETCH_USERS_REQUESTED = 'FETCH_USERS_REQUESTED';
const FETCH_USERS_SUCCEEDED = 'FETCH_USERS_SUCCEEDED';
const FETCH_USERS_FAILED = 'FETCH_USERS_FAILED';
const SHOW_USERS = 'SHOW_USERS';

//Action Creators
export const fetchGroupsList = createAction(FETCH_GROUPS_REQUESTED);
export const fetchGroupsListFailed = createAction(FETCH_GROUPS_FAILED);
export const receiveGroupsList = createAction(FETCH_GROUPS_SUCCEEDED);
export const removeGroup = createAction(REMOVE_GROUP);
export const removeGroupFailed = createAction(REMOVE_GROUP_FAILED);
export const setCurrentGroup = createAction(SET_CURRENT_GROUP);

export const addMember = createAction(ADD_MEMBER);
export const addMemberFailed = createAction(ADD_MEMBER_FAILED);
export const fetchMembersList = createAction(FETCH_MEMBERS_REQUESTED);
export const fetchMembersListFailed = createAction(FETCH_MEMBERS_FAILED);
export const receiveMembersList = createAction(FETCH_MEMBERS_SUCCEEDED);
export const removeMember = createAction(REMOVE_MEMBER);
export const removeMemberFailed = createAction(REMOVE_MEMBER_FAILED);
export const showMembers = createAction(SHOW_MEMBERS);

export const fetchUsersList = createAction(FETCH_USERS_REQUESTED);
export const fetchUsersListFailed = createAction(FETCH_USERS_FAILED);
export const receiveUsersList = createAction(FETCH_USERS_SUCCEEDED);
export const showUsers = createAction(SHOW_USERS);

//Reducer
const reducer = handleActions({
    [FETCH_USERS_SUCCEEDED]: (state, action) => {
	const payload = action.payload;
	const byUserId = {...state.byUserId};
	const value = payload.reduce((results, user) => {
	    results[user._id] = user;
	    return results;
	}, {});
	byUserId.users = value;
      return {...state, byUserId };
    },
    [FETCH_GROUPS_SUCCEEDED]: (state, action) => {
	const payload = action.payload;
	const value = payload.reduce((results, group) => {
	    results[group._id] = group;
	    return results;
	}, {});
      return {...state, byGroupId: value };
    },
    [FETCH_MEMBERS_SUCCEEDED]: (state, action) => {
	const byMemberId = {...state.byMemberId};
	const value = action.payload.reduce((results, member) => {
	    results[member._id] = member;
	    return results;
	}, {});
	byMemberId.members = value;
	return {...state, byMemberId};
    },
    [SET_CURRENT_GROUP]: (state, action) => {
	const group = action.payload;
	return {...state, currentGroup: group}
    },
    [SHOW_MEMBERS]: (state, action) => {
	const visibility = action.payload;
	const byMemberId = {...state.byMemberId};
	byMemberId.visible = visibility;
	return {...state, byMemberId}
    },
    [SHOW_USERS]: (state, action) => {
	const visibility = action.payload;
	const byUserId = {...state.byUserId};
	byUserId.visible = visibility;
	return {...state, byUserId}
    },
}, initialState);

export default reducer;
