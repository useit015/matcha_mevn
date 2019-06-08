import utility from '../utility'
import { isArray } from 'util';

export const user = {
	mutations: {
		updateTags: (state, tags) => state.user.tags = tags.map(cur => cur.text.toLowerCase()).join(','),
		updateUser: (state, user) => state.user = user,
		updateProfileImage: (state, image) => {
			state.user.images.filter(cur => cur.profile).forEach(cur => cur.profile = 0)
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
			const { lat, lng } = user
			commit('locate', { lat, lng })
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
				let following = []
				let followers = []
				const merge = cur => ({
					id: cur[cur.matched_id ? 'matched_id' : 'matcher_id'],
					match_date: cur.match_date,
					username: cur.username,
					profile_image: cur.profile_image
				})
				if (isArray(res.body)) {
					following = res.body.filter(cur => cur.matched_id).map(merge),
					followers = res.body.filter(cur => cur.matcher_id).map(merge)
				}
				commit('syncMatches', { following, followers })
			}, 'matches')
		},
		syncBlocked: ({ commit }) => {
			utility.sync(res => {
				let blocked = []
				let blockedBy = []
				if (isArray(res.body)) {
					blocked =  res.body.filter(cur => cur.blocker == id)
										.map(cur => cur.blocked),
					blockedBy =  res.body.filter(cur => cur.blocked == id)
										.map(cur => cur.blocker)
				}
				commit('syncBlocked', { blocked, blockedBy })
			}, 'blocked')
		},
		syncHistory: ({ commit }) => {
			utility.sync(res => {
				let visitor = []
				let visited = []
				const merge = cur => ({
					id: cur[cur.visitor_id ? 'visitor_id' : 'visited_id'],
					visit_date: cur.visit_date,
					username: cur.username,
					profile_image: cur.profile_image
				})
				if (isArray(res.body)) {
					visitor = res.body.filter(cur => cur.visitor_id).map(merge),
					visited = res.body.filter(cur => cur.visited_id).map(merge)
				}
				commit('syncHistory', { visitor, visited })
			}, 'history')
		}
	}
}
