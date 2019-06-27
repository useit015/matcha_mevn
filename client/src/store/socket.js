import Vue from 'vue'
import utility from '../utility'

export const socket = {
	mutations: {
		SOCKET_connect: state => {
			if (!state.isConnected && state.user.id) {
				(new Vue()).$socket.emit('auth', state.user.id)
				state.isConnected = true
			}
		},
		SOCKET_disconnect: state => {
			state.isConnected = false
		},
		SOCKET_chat: async (state, data) => {
			try {
				const token = localStorage.getItem('token')
				const headers = { 'x-auth-token': token }
				if (data.id_conversation == state.selectedConvo) {
					if (!state.newMessage) {
						state.newMessage = data
						state.convos.forEach((convo, i) => {
							if (convo.id_conversation == state.selectedConvo) {
								(new Vue()).$socket.emit('seenConvo', {
									user: convo.user_id,
									convo: convo.id_conversation,
								})
								state.convos[i].message = data.message
								state.convos[i].message_from = data.id_from
							}
						})
						const url = `${process.env.URL}/api/chat/update`
						const body = { id: state.selectedConvo }
						await Vue.http.post(url, body, { headers })
					}
				} else {
					state.notif.push({ ...data, type: 'chat' })
					state.convos.forEach(cur => {
						if (cur.id_conversation == data.id_conversation) {
							cur.last_update = new Date()
							cur.message = data.message
							cur.message_from = data.id_from
						}
					})
					const { id_from, id_to, id_conversation } = data
					const body = { 
						id_to,
						id_from,
						type: 'chat',
						id_conversation
					}
					const url = `${process.env.URL}/api/notif/add`
					await Vue.http.post(url, body, { headers })
				}
			} catch (err) {
				console.log('error here -->', err)
			}
		},
		SOCKET_typing: (state, data) => {
			if (!state.typingSec.convos.some(cur => cur.id_conversation == data.id_conversation)) {
				state.typingSec.convos.push(data)
				state.typingSec.status = !!state.typingSec.convos.length
			}
		},
		SOCKET_seenConvo: (state, convo) => {
			if (state.selectedConvo == convo) {
				state.seenConvo = true
			}
		},
		SOCKET_match: async (state, data) => {
			state.notif.push({
				is_read: 0,
				type: data.type,
				date: data.date,
				id_from: data.id_from,
				username: data.username,
				profile_image: data.profile_image,
			})
			if (data.type == 'like' || data.type == 'like_back') {
				state.followers.push({
					id: data.id_from,
					profile_image: data.profile_image,
					username: data.username,
					match_date: data.date
				})
				if (data.type == 'like_back') {
					const url = `${process.env.URL}/api/chat/all`
					const headers = { 'x-auth-token': state.user.token }
					const result = await Vue.http.get(url, { headers })
					state.convos = result.body
				}
			} else if (data.type == 'unlike') {
				state.followers = state.followers.filter(cur => cur.id != data.id_from)
				state.convos.forEach((cur, i) => {
					if (cur.user_id == data.id_from) {
						if (state.selectedConvo == cur.id_conversation) {
							state.selectedConvo = null
						}
						state.convos.splice(i, 1)
					}
				})
			}
		},
		SOCKET_visit: (state, data) => {
			state.notif.push({
				is_read: 0,
				type: data.type,
				date: data.date,
				id_from: data.id_from,
				username: data.username,
				profile_image: data.profile_image,
			})
			state.visitor.push({
				id: data.id_from,
				profile_image: data.profile_image,
				username: data.username,
				visit_date: data.date
			})
		},
		SOCKET_block: (state, id) => {
			state.blockedBy.push(id)
			const convo = state.convos.find(cur => cur.user_id == id)
			const arr = ['visitor', 'visited', 'notif', 'convos', 'followers', 'following']
			arr.forEach(cur => state[cur] = utility.filterBlocked(state, cur))
			if (convo && state.selectedConvo == convo.id_conversation) state.selectedConvo = null
		},
		SOCKET_online: (state, online) => {
			state.online = online.filter(cur => cur != state.user.id).map(cur => Number(cur))
		},
		SOCKET_out: (state, online) => {
			if (!online.find(cur => cur == state.user.id)) {
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
			} else {
				state.online = online.filter(cur => cur != state.user.id).map(cur => Number(cur))
			}
		}
	}
}
