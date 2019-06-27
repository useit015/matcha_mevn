import utility from '../utility'
import { isArray } from 'util'
import Vue from 'vue'

export const user = {
	mutations: {
		updateUserEmail: (state, email) => state.user.email = email,
		updateTags: (state, tags) => state.user.tags = tags.map(cur => cur.text.toLowerCase()).join(','),
		updateUser: (state, user) => state.user = user,
		updateProfileImage: (state, data) => {
			state.user.images.forEach(cur => cur.profile = 0)
			state.user.images.push({ name: data.name, cover: 0, profile: 1, user_id: data.user_id, id:data.id })
		},
		updateCoverImage: (state, data) => {
			state.user.images = state.user.images.filter(cur => !cur.cover)
			state.user.images.push({ name: data.name, cover: 1, profile: 0, user_id: data.user_id, id: data.id })
		},
		locate: (state, location) => {
			state.location = location
		},
		syncHistory: (state, history) => {
			state.visitor = history.visitor.filter(cur => !utility.isBlocked(state, cur.id))
			state.visited = history.visited.filter(cur => !utility.isBlocked(state, cur.id))
		},
		syncMatches: (state, matches) => {
			state.followers = matches.followers.filter(cur => !utility.isBlocked(state, cur.id))
			state.following = matches.following.filter(cur => !utility.isBlocked(state, cur.id))
		},
		syncBlocked: (state, blacklist) => {
			state.blocked = blacklist.blocked
			state.blockedBy = blacklist.blockedBy
			const arr = ['visitor', 'visited', 'notif', 'convos', 'followers', 'following']
			arr.forEach(cur => state[cur] = utility.filterBlocked(state, cur))
		},
		getNotif: (state, notif) => {
			state.notif = notif
		},
		getTags: (state, tags) => {
			state.tags = tags
		},
		seenNotif: state => {
			state.notif = state.notif.map(cur => {
				if (cur.type != 'chat') cur.is_read = 1
				return cur
			})
		},
		delImg: (state, id) => {
			state.user.images = state.user.images.filter(cur => cur.id != id)
			if (state.user.images.length && !state.user.images.find(cur => cur.profile)) {
				let len = state.user.images.length
				while (--len >= 0) {
					if (!state.user.images[len].cover) {
						state.user.images[len].profile = true
						break
					}
				}
			}
		},
		syncBlacklist: (state, list) => {
			state.blacklist = list
		}
	},
	actions: {
		updateUserEmail: ({ commit }, email) => {
			commit('updateUserEmail', email)
		},
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
		syncMatches: async ({ commit }) => {
			try {
				let following = []
				let followers = []
				const merge = cur => ({
					id: cur[cur.matched_id ? 'matched_id' : 'matcher_id'],
					match_date: cur.match_date,
					username: cur.username,
					profile_image: cur.profile_image
				})
				const res = await utility.sync('matches')
				if (isArray(res.body)) {
					following = res.body.filter(cur => cur.matched_id).map(merge),
					followers = res.body.filter(cur => cur.matcher_id).map(merge)
				}
				commit('syncMatches', { following, followers })
			} catch (err) {
				console.log('Got error here --> ', err)
			}
		},
		syncBlocked: async ({ commit, dispatch }, id) => {
			try {
				let blocked = []
				let blockedBy = []
				let res = await utility.sync('blocked')
				if (isArray(res.body)) {
					blocked = res.body
						.filter(cur => cur.blocker == id)
						.map(cur => cur.blocked),
					blockedBy = res.body
						.filter(cur => cur.blocked == id)
						.map(cur => cur.blocker)
				}
				commit('syncBlocked', { blocked, blockedBy })
				if (blocked.length) dispatch('syncBlacklist', blocked)
			} catch (err) {
				console.log('Got error here --> ', err)
			}
		},
		syncHistory: async ({ commit }) => {
			try {
				let visitor = []
				let visited = []
				const merge = cur => ({
					id: cur[cur.visitor_id ? 'visitor_id' : 'visited_id'],
					visit_date: cur.visit_date,
					username: cur.username,
					profile_image: cur.profile_image
				})
				const res = await utility.sync('history')
				if (isArray(res.body)) {
					visitor = res.body.filter(cur => cur.visitor_id).map(merge),
					visited = res.body.filter(cur => cur.visited_id).map(merge)
				}
				commit('syncHistory', { visitor, visited })
			} catch (err) {
				console.log('Got error here --> ', err)
			}
		},
		getTags: async ({ commit }) => {
			try {
				const tags =  await utility.sync('tags')
				commit('getTags', tags.body)
			} catch (err) {
				console.log('Got error here --> ', err)
			}
		},
		getNotif: async ({ commit }) => {
			try {
				const notif =  await utility.syncNotif()
				commit('getNotif', notif)
			} catch (err) {
				console.log('Got error here --> ', err)
			}
		},
		seenNotif: ({ commit }) => {
			commit('seenNotif')
		},
		delImg: ({ commit }, id) => {
			commit('delImg', id)
		},
		syncBlacklist: async ({ commit }, blocked) => {
			if (!blocked.length) return commit('syncBlacklist', [])
			const token = localStorage.getItem('token')
			const url = `${process.env.URL}/api/users/blacklisted`
			const headers = { 'x-auth-token': token }
			const data = { ids: JSON.stringify(blocked) }
			const res = await Vue.http.post(url, data, { headers })
			if (res.body.ok) commit('syncBlacklist', res.body.list)
		}
	}
}
