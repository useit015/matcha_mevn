export const chat = {
	mutations: {
		messageClr: state => {
			state.newMessage = null
		},
		syncConvo: (state, convo) => {
			state.selectedConvo = convo.id_conversation
			state.usernameConvo = convo.username
			state.imageConvo = convo.profile_image
		}
	},
	actions: {
		messageClr: ({ commit }) => {
			commit('messageClr')
		},
		syncConvo: ({ commit }, convo) => {
			commit('syncConvo', convo)
		}
	}
}
