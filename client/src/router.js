import Vue from 'vue'
import vueRouter from 'vue-router'
import Chat from '@/components/Chat'
import Users from '@/components/Users'
import About from '@/components/About'
import Login from '@/components/Login'
import install from '@/components/install'
import Register from '@/components/Register'
import Settings from '@/components/Settings'
import Discover from '@/components/Discover'
import UserProfile from '@/components/UserProfile'

Vue.use(vueRouter)

export const router = new vueRouter({
	mode: 'history',
	base: process.env.BASE_URL,
	routes: [
		{
			path: '/',
			component: Users
		},
		{
			path: '/install',
			component: install
		},
		{
			path: '/about',
			component: About
		},
		{
			path: '/register',
			component: Register
		},
		{
			path: '/login',
			component: Login
		},
		{
			path: '/settings',
			component: Settings
		},
		{
			path: '/discover',
			component: Discover
		},
		{
			path: '/chat/:id',
			component: Chat
		},
		{
			path: '/user/:id',
			component: UserProfile
		}
	]
})
