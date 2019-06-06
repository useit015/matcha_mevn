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
		SOCKET_chat: (state, data) => {
			if (data.id_conversation == state.selectedConvo) {
				if (!state.newMessage) {
					state.newMessage = data
				}
			} else {
				console.log('You\'ve got a message --> ', data)
			}
		}
	}
}
