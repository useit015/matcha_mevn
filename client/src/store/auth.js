import Vue from 'vue'

export const auth = {
	mutations: {
		login: (state, user) => {
			state.status = true
			state.user = user
			if (!state.isConnected) {
				(new Vue()).$socket.emit('auth', state.user.id)
				state.isConnected = true
			}
		},
		logout: state => {
			state.status = false
			state.user = {}
			state.isConnected = false
			state.typing = false
			state.blocked = []
			state.location = {}
			state.seenConvo = false
			state.convos = []
			state.notif = []
			state.blockedBy = []
			state.followers = []
			state.following = []
			state.newMessage = null
			state.selectedConvo = null
			state.visited = []
			state.visitor = []
			state.imageConvo = null
		}
	},
	actions: {
		login: ({ commit, dispatch }, user) => {
			if (user.id) {
				localStorage.setItem('token', user.token)
				const { lat, lng } = user
				commit('locate', { lat, lng })
				dispatch('locate')
				dispatch('getTags')
				dispatch('getNotif')
				dispatch('syncHistory')
				dispatch('syncMatches')
				dispatch('syncConvoAll')
				dispatch('syncBlocked', user.id)
				commit('login', user)
			}
		},
		logout: ({ commit }, id) => {
			localStorage.clear()
			commit('logout');
			(new Vue()).$socket.emit('logout', id)
		}
	}
}
