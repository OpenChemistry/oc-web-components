import { call, put, takeEvery } from 'redux-saga/effects'

import {
  fetchUsersList,
  receiveUsersList,
  fetchUsersListFailed,
  fetchGroupsList,
  receiveGroupsList,
  fetchGroupsListFailed,
  fetchMembersList,
  receiveMembersList,
  fetchMembersListFailed,
  setCurrentGroup,
  removeMember,
  removeMemberFailed,
  addMember,
  addMemberFailed,
  removeGroup,
  removeGroupFailed,
  showUsers
} from '../../ducks/admin';

import {
  requestAllUsers,
  requestUsersList,
  requestGroupsList,
  requestMembersList,
  requestMemberRemoval,
  requestNewMember,
  requestGroupRemoval
} from '../../rest/admin';

import girderClient from '@openchemistry/girder-client';

function* onFetchUsersList(action) {
  try {
    const user = action.payload;
    const usersFound =
      user
      ? yield call(requestUsersList, user)
      : yield call(requestAllUsers);
    yield put( receiveUsersList(usersFound) );
  } catch(error) {
    yield put( fetchUsersListFailed(error) );
  }
}

export function* watchFetchUsersList() {
  yield takeEvery(fetchUsersList.toString(), onFetchUsersList);
}

function* onFetchGroupsList(action) {
  try {
    const groupsFound = yield call(requestGroupsList);
    yield put( receiveGroupsList(groupsFound) );
  } catch(error) {
    yield put( fetchGroupsListFailed(error) );
  }
}

export function* watchFetchGroupsList() {
  yield takeEvery(fetchGroupsList.toString(), onFetchGroupsList);
}

function* onFetchMembersList(action) {
  try {
    const group = action.payload;
    const membersFound = yield call(requestMembersList, group);
    yield put( receiveMembersList(membersFound) );
    yield put( setCurrentGroup(group) );
  } catch(error) {
    yield put( fetchMembersListFailed(error) );
  }
}

export function* watchFetchMembersList() {
  yield takeEvery(fetchMembersList.toString(), onFetchMembersList);
}

function* onRemoveMember(action) {
  try {
    const { userId, group } = action.payload;
    yield call(requestMemberRemoval, userId, group._id);
    const membersRemaining = yield call(requestMembersList, group);
    yield put( receiveMembersList(membersRemaining) );
    yield put( setCurrentGroup(group) );
  } catch(error) {
    yield put( removeMemberFailed(error) );
  }
}

export function* watchRemoveMember() {
  yield takeEvery(removeMember.toString(), onRemoveMember);
}

function* onAddMember(action) {
    try {
    const { userId, group } = action.payload;
    yield call(requestNewMember, userId, group._id);
    const updatedMembers = yield call(requestMembersList, group);
    yield put( receiveMembersList(updatedMembers) );
    yield put( setCurrentGroup(group) );
  } catch(error) {
    yield put( addMemberFailed(error) );
  }
}

export function* watchAddMember() {
  yield takeEvery(addMember.toString(), onAddMember);
}

function* onRemoveGroup(action) {
  try {
    const groupid = action.payload;
    yield call(requestGroupRemoval, groupid);
    const groupsRemaining = yield call(requestGroupsList);
    yield put( showUsers(false) );
    yield put( receiveGroupsList(groupsRemaining) );
  } catch(error) {
    yield put( removeGroupFailed(error) );
  }
}

export function* watchRemoveGroup() {
  yield takeEvery(removeGroup.toString(), onRemoveGroup);
}
