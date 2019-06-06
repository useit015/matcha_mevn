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

const SocketInstance = io('http://134.209.195.36');

Vue.use(new vueIo({
	debug: true,
	connection: SocketInstance,
	vuex: {
		store,
		actionPrefix: 'SOCKET_',
		mutationPrefix: 'SOCKET_'
	}
}))

String.prototype.has = function(needle) {
	return this.toLowerCase().includes(needle.toLowerCase())
}

new Vue({
	store,
	router,
	render: h => h(App)
}).$mount('#app')
