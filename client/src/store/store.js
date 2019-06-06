import Vue from 'vue'
import Vuex from 'vuex'
import { actions } from './action'
import { getters } from './getter'
import { mutations } from './mutation'

Vue.use(Vuex)

export const store = new Vuex.Store({
	strict: true,
	state: {
		status: false,
		user: {},
		location: { lat: 0, lng: 0 },
		following: [],
		followers: [],
		blocked: [],
		blockedBy: [],
		visitor: [],
		visited: [],
		isConnected: false,
		selectedConvo: null,
		usernameConvo: null,
		imageConvo: null,
		newMessage: null
	},
	getters,
	mutations,
	actions
})
