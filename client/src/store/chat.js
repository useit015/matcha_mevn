export const chat = {
	mutations: {
		typingClr: state => {
			state.typing = false
		},
		messageClr: state => {
			state.newMessage = null
		},
		syncConvo: (state, convo) => {
			if (!convo) {
				state.selectedConvo = null
				state.usernameConvo = null
				state.imageConvo = null
			} else {
				state.selectedConvo = convo.id_conversation
				state.usernameConvo = convo.username
				state.imageConvo = convo.profile_image
			}
		},
		syncConvoAll: (state, convos) => {
			state.convos = convos
		},
		updateConvosOrder: (state, id) => {
			state.convos.forEach(cur => {
				if (cur.id_conversation == id) {
					cur.last_update = new Date()
				}
			})
		},
	},
	actions: {
		typingClr: ({ commit }) => {
			commit('typingClr')
		},
		messageClr: ({ commit }) => {
			commit('messageClr')
		},
		syncConvo: ({ commit }, convo) => {
			commit('syncConvo', convo)
		},
		syncConvoAll: ({ commit }, convos) => {
			commit('syncConvoAll', convos)
		},
		updateConvosOrder: ({ commit }, id) => {
			commit('updateConvosOrder', id)
		},
	}
}
