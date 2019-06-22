import Vue from 'vue'
import Vuex from 'vuex'
import { auth } from './auth'
import { user } from './user'
import { chat } from './chat'
import { socket } from './socket'
import { getters } from './getter'

Vue.use(Vuex)

export const store = new Vuex.Store({
	state: {
		user: {},
		tags: [],
		notif: [],
		convos: [],
		online: [],
		blocked: [],
		visitor: [],
		visited: [],
		following: [],
		followers: [],
		blockedBy: [],
		blacklist: [],
		status: false,
		typingSec: {
			status: false,
			convos: []
		},
		seenConvo: false,
		newMessage: null,
		isConnected: false,
		selectedConvo: null,
		location: { lat: 0, lng: 0 }
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
