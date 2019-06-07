import utility from '../utility'

export const user = {
	mutations: {
		updateTags: (state, tags) => state.user.tags = tags.map(cur => cur.text.toLowerCase()).join(','),
		updateUser: (state, user) => state.user = user,
		updateProfileImage: (state, image) => {
			state.user.images.filter(cur => cur.profile == true).forEach(cur => cur.profile = 0)
			state.user.images.push({ name: image, profile: 1 })
		},
		locate: (state, location) => {
			state.location = location
		},
		syncHistory: (state, history) => {
			state.visitor = history.visitor
			state.visited = history.visited
		},
		syncMatches: (state, matches) => {
			state.followers = matches.followers
			state.following = matches.following
		},
		syncBlocked: (state, blacklist) => {
			state.blocked = blacklist.blocked
			state.blockedBy = blacklist.blockedBy
		},
	},
	actions: {
		updateUser: ({ commit }, user) => {
			commit('locate', {
				lat: user.lat,
				lng: user.lng
			})
			commit('updateUser', user)
		},
		locate: ({ commit }) => {
			let loc = {}
			if  (navigator.geolocation) {
				navigator.geolocation.getCurrentPosition(pos => {
					loc = {
						lat: pos.coords.latitude,
						lng: pos.coords.longitude
					}
					commit('locate', loc)
					utility.syncLocation(loc)
				}, () => utility.getLocationFromIp(loc => {
					commit('locate', loc)
					utility.syncLocation(loc)
				}))
			} else {
				utility.getLocationFromIp(loc => {
					commit('locate', loc)
					utility.syncLocation(loc)
				})
			}
		},
		syncMatches: ({ commit }) => {
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
			}, 'matches')
		},
		syncBlocked: ({ commit }) => {
			utility.sync(res => commit('syncBlocked', {
				blocked: res.body.filter(cur => cur.blocker == id).map(cur => cur.blocked),
				blockedBy: res.body.filter(cur => cur.blocked == id).map(cur => cur.blocker)
			}), 'blocked')
		},
		syncHistory: ({ commit }) => {
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
			}), 'history')
		}
	}
}
