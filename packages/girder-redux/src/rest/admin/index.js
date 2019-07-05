import girderClient from '@openchemistry/girder-client';
import axios from 'axios';

export function requestUsersList(text) {
    return girderClient().get('user', { params: {text} })
	.then(response => response.data);
}

export function requestAllUsers() {
    return girderClient().get('user')
	.then(response => response.data);
}

export function requestGroupsList() {
    return girderClient().get('group', {})
	.then(response => response.data);
}

export function requestMembersList(group) {
    return girderClient().get(`group/${group._id}/member`)
	.then(response => response.data);
}

export function requestMemberRemoval(userId, groupId) {
    return girderClient()
	.delete(`group/${groupId}/member`, { params: {userId} })
	.then(response => response.data);
}

export function requestNewMember(userId, id) {
    const data = new FormData();
    data.set('userId', userId);
    data.set('force', 'true');

    return girderClient()
	.post(`group/${id}/invitation`, data)
	.then(response => response.data);
}

export function requestGroupRemoval(id) {
    return girderClient().delete(`group/${id}`)
	.then(response => response.data);
}
