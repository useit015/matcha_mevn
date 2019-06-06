import utility from '../utility'

export const actions = {
	updateUser: ({ commit }, user) => {
		commit('locate', {
			lat: user.lat,
			lng: user.lng
		})
		commit('updateUser', user)
	},
	login: ({ commit, dispatch }, user) => {
		if (user.id) {
			commit('locate', { lat: user.lat, lng: user.lng })
			dispatch('syncMatches', user.id)
			dispatch('syncBlocked', user.id)
			dispatch('syncHistory', user.id)
			localStorage.setItem('token', user.token)
			commit('login', user)
		}
	},
	logout: ({ commit }, id) => {
		localStorage.removeItem('token')
		commit('logout');
		(new Vue()).$socket.emit('logout', id)
	},
	messageClr: ({ commit }) => {
		commit('messageClr')
	},
	locate: ({ commit }, id) => {
		let loc = {}
		if  (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(pos => {
				loc = {
					lat: pos.coords.latitude,
					lng: pos.coords.longitude
				}
				commit('locate', loc)
				utility.syncLocation(id, loc)
			}, () => utility.getLocationFromIp(loc => {
				commit('locate', loc)
				utility.syncLocation(id, loc)
			}))
		} else {
			utility.getLocationFromIp(loc => {
				commit('locate', loc)
				utility.syncLocation(id, loc)
			})
		}
	},
	syncMatches: ({ commit }, id) => {
		utility.sync(res => {
			commit('syncMatches', {
				following: res.body.filter(cur => cur.matched_id)
									.map(cur => ({
										id: cur.matched_id,
										match_date: cur.match_date,
										username: cur.username,
										profile_image: cur.profile_image
									})),
				followers: res.body.filter(cur => cur.matcher_id)
									.map(cur => ({
										id: cur.matcher_id,
										match_date: cur.match_date,
										username: cur.username,
										profile_image: cur.profile_image
									}))
			})
		}, id, 'matches')
	},
	syncBlocked: ({ commit }, id) => {
		utility.sync(res => commit('syncBlocked', {
			blocked: res.body.filter(cur => cur.blocker == id).map(cur => cur.blocked),
			blockedBy: res.body.filter(cur => cur.blocked == id).map(cur => cur.blocker)
		}), id, 'blocked')
	},
	syncHistory: ({ commit }, id) => {
		utility.sync(res => commit('syncHistory', {
			visitor: res.body.filter(cur => cur.visitor_id)
								.map(cur => ({
									id: cur.visitor_id,
									visit_date: cur.visit_date,
									username: cur.username,
									profile_image: cur.profile_image
								})),
			visited: res.body.filter(cur => cur.visited_id)
								.map(cur => ({
									id: cur.visited_id,
									visit_date: cur.visit_date,
									username: cur.username,
									profile_image: cur.profile_image
								}))
		}), id, 'history')
	},
	syncConvo: ({ commit }, convo) => {
		commit('syncConvo', convo)
	}
}
