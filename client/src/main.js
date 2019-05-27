import Vue from 'vue'
import Vuetify from 'vuetify'
import vueResource from 'vue-resource'
import 'vuetify/dist/vuetify.min.css'
import { router } from './router'
import { store } from './store'
import App from './App'

Vue.use(Vuetify, {
	theme: {
		primary: "#03a9f4"
	}
})

Vue.use(vueResource)

String.prototype.has = function(needle) {
	return this.toLowerCase().includes(needle.toLowerCase())
}

new Vue({
	store,
	router,
	render: h => h(App)
}).$mount('#app')
