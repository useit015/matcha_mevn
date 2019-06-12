import Vue from 'vue'

export const chat = {
	mutations: {
		seenConvoClr: state => {
			state.seenConvo = false
		},
		typingClr: state => {
			state.typing = false
		},
		messageClr: state => {
			state.newMessage = null
		},
		syncNotif: state => {
			state.notif = state.notif.filter(cur => !cur.id_conversation || cur.id_conversation != state.selectedConvo)
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
		typingClr: ({ commit }) => commit('typingClr'),
		seenConvoClr: ({ commit }) => commit('seenConvoClr'),
		messageClr: ({ commit }) => commit('messageClr'),
		syncConvo: ({ commit }, convo) => commit('syncConvo', convo),
		syncConvoAll: async ({ commit }) => {
			const token = localStorage.getItem('token')
			const url = 'http://134.209.195.36/api/chat/all'
			const headers = { 'x-auth-token': token }
			const result = await Vue.http.get(url, { headers })
			if (!result.body.msg) commit('syncConvoAll', result.body)
		},
		updateConvosOrder: ({ commit }, id) => commit('updateConvosOrder', id),
		syncNotif: ({ commit }) => commit('syncNotif')
	}
}
