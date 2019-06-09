import Vue from 'vue'
import Vuex from 'vuex'
import { auth } from './auth'
import { user } from './user'
import { chat } from './chat'
import { socket } from './socket'
import { getters } from './getter'

Vue.use(Vuex)

export const store = new Vuex.Store({
	strict: true,
	state: {
		status: false,
		user: {},
		location: { lat: 0, lng: 0 },
		following: [],
		followers: [],
		blockedBy: [],
		blocked: [],
		visitor: [],
		visited: [],
		convos: [],
		notif: [],
		isConnected: false,
		selectedConvo: null,
		usernameConvo: null,
		imageConvo: null,
		newMessage: null,
		typing: false
	},
	getters,
	mutations: {
		...auth.mutations,
		...user.mutations,
		...chat.mutations,
		...socket.mutations
	},
	actions: {
		...auth.actions,
		...user.actions,
		...chat.actions
	}
})
