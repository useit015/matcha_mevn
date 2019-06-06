import Vue from 'vue'

export const mutations = {
	updateTags: (state, tags) => state.user.tags = tags.map(cur => cur.text.toLowerCase()).join(','),
	updateUser: (state, user) => state.user = user,
	updateProfileImage: (state, image) => {
		state.user.images.filter(cur => cur.profile == true).forEach(cur => cur.profile = 0)
		state.user.images.push({ name: image, profile: 1 })
	},
	logout: state => {
		state.status = false
		state.user = {}
		state.isConnected = false
	},
	messageClr: state => {
		state.newMessage = null
	}
	,
	login: (state, user) => {
		state.status = true
		state.user = user
		if (!state.isConnected) {
			(new Vue()).$socket.emit('auth', state.user.id)
			state.isConnected = true
		}
	},
	locate: (state, location) => {
		state.location = location
	},
	syncHistory: (state, history) => {
		state.visitor = history.visitor
		state.visited = history.visited
	},
	syncMatches: (state, matches) => {
		state.followers = matches.followers
		state.following = matches.following
	},
	syncBlocked: (state, blacklist) => {
		state.blocked = blacklist.blocked
		state.blockedBy = blacklist.blockedBy
	},
	syncConvo: (state, convo) => {
		state.selectedConvo = convo.id_conversation
		state.usernameConvo = convo.username
		state.imageConvo = convo.profile_image
	},
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
