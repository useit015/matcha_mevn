import Vue from 'vue'

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
			console.log('disconnected -->')
		},
		SOCKET_chat: async (state, data) => {
			try {
				const token = localStorage.getItem('token')
				const headers = { 'x-auth-token': token }
				if (data.id_conversation == state.selectedConvo) {
					if (!state.newMessage) {
						state.newMessage = data
						state.convos.forEach(convo => {
							if (convo.id_conversation == state.selectedConvo) {
								(new Vue()).$socket.emit('seenConvo', {
									user: convo.user_id,
									convo: convo.id_conversation,
								})
							}
						})
						const url = 'http://134.209.195.36/api/chat/update'
						const body = { id: state.selectedConvo }
						await Vue.http.post(url, body, { headers })
					}
				} else {
					console.log(`You've got a message --> `, data)
					state.notif.push({ ...data, type: 'chat' })
					const { id_from, id_to } = data
					const body = { 
						id_to,
						id_from,
						type: 'chat'
					}
					const url = 'http://134.209.195.36/api/notif/add'
					const res = await Vue.http.post(url, body, { headers })
					console.log('notif addded => ', res)
				}
			} catch (err) {
				console.log('error here -->', err)
			}
		},
		SOCKET_typing: (state, data) => {
			if (data.id_conversation == state.selectedConvo) {
				state.typing = true
			}
		},
		SOCKET_seenConvo: (state, convo) => {
			console.log(`goonna update this shit -->`, convo)
		}
	}
}
