import Vue from 'vue'
import Vuetify from 'vuetify'
import io from 'socket.io-client'
import vueIo from 'vue-socket.io'
import vueResource from 'vue-resource'
import 'vuetify/dist/vuetify.min.css'
import App from './App'
import { router } from './router'
import { store } from './store/store'

Vue.use(Vuetify, {
	theme: {
		primary: "#03a9f4"
	}
})

Vue.use(vueResource)

const SocketInstance = io(location.origin.replace(/^http/, 'ws'));

Vue.use(new vueIo({
	debug: false,
	connection: SocketInstance,
	vuex: {
		store,
		actionPrefix: 'SOCKET_',
		mutationPrefix: 'SOCKET_'
	}
}))

String.prototype.has = function (needle) {
	return this
		.toLowerCase()
		.includes(needle.toLowerCase())
}

String.prototype.escapeHtml = function () {
	return this
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#039;")
}

new Vue({
	store,
	router,
	render: h => h(App)
}).$mount('#app')
