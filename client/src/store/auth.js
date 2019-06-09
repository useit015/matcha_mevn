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
		}
	},
	actions: {
		login: ({ commit, dispatch }, user) => {
			if (user.id) {
				const { lat, lng } = user
				commit('locate', { lat, lng })
				dispatch('syncMatches')
				dispatch('syncBlocked', user.id)
				dispatch('syncHistory')
				localStorage.setItem('token', user.token)
				commit('login', user)
			}
		},
		logout: ({ commit }, id) => {
			localStorage.removeItem('token')
			commit('logout');
			(new Vue()).$socket.emit('logout', id)
		}
	}
}
