import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
	state: () => ({
		allUsers: []
	}),
	actions: {
		addUser(data, socket, voted) {
			this.allUsers.push({ data, socket, voted });
		},
		removeUser(socket) {
			const index = this.allUsers.findIndex((user => user.socket === socket));
			if (index != -1) {
				this.allUsers.splice(index, 1);
			}
		}
	}
})
