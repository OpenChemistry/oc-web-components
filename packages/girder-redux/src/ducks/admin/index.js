import { createAction, handleActions } from 'redux-actions';

//Default State
const initialState = {
  byUserId : {},
  byGroupId : {},
  byMemberId : {},
  currentGroup : {},
  ui : {usersVisible : false, userSearch : ''}
};

//Selectors
let getRoot = (state) => state;
export const initRoot = (getRootFn) => {getRoot = getRootFn;};
export const getGroupsByIds = (state) => getRoot(state).admin.byGroupId;
export const getMembersByIds = (state) => getRoot(state).admin.byMemberId;
export const getUsersByIds = (state) => getRoot(state).admin.byUserId;
export const getCurrentGroup = (state) => getRoot(state).admin.currentGroup;
export const getUsersVisibility = (state) => getRoot(state).admin.ui.usersVisible;
export const getUserSearch = (state) => getRoot(state).admin.ui.userSearch;

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
  [FETCH_USERS_SUCCEEDED] : (state, action) => {
    const { user, usersFound } = action.payload;
    const ui = {...state.ui}
    ui.userSearch = user;
    const value = usersFound.reduce((results, users) => {
      results[users._id] = users;
      return results;
    }, {});
    return {...state, byUserId : value, ui};
  },
  [FETCH_GROUPS_SUCCEEDED] : (state, action) => {
    const groups = action.payload;
    const value = groups.reduce((results, group) => {
      results[group._id] = group;
      return results;
    }, {});
    return {...state, byGroupId : value};
  },
  [FETCH_MEMBERS_SUCCEEDED] : (state, action) => {
    const members = action.payload;
    const value = members.reduce((results, member) => {
      results[member._id] = member;
      return results;
    }, {});
    return {...state, byMemberId : value};
  },
  [SET_CURRENT_GROUP] : (state, action) => {
    const group = action.payload;
    return { ...state, currentGroup: group }
  },
  [SHOW_MEMBERS] : (state, action) => {
    const visibility = action.payload;
    const ui = {...state.ui};
    ui.membersVisible = visibility;
    return { ...state, ui }
  },
  [SHOW_USERS] : (state, action) => {
    const visibility = action.payload;
    const ui = {...state.ui};
    ui.usersVisible = visibility;
    return { ...state, ui }
  },
}, initialState);

export default reducer;
