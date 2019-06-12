import Vue from 'vue'
import vueRouter from 'vue-router'
import Users from '@/components/Users'
import About from '@/components/About'
import Login from '@/components/Login'
import install from '@/components/install'
import Register from '@/components/Register'
import Settings from '@/components/Settings'
import Discover from '@/components/Discover'
import Messenger from '@/components/Messenger'
import UserProfile from '@/components/UserProfile'
import NotFound from '@/components/NotFound'

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
			component: Messenger
		},
		{
			path: '/chat',
			component: Messenger
		},
		{
			name: 'user',
			path: '/user/:id',
			component: UserProfile
		},
		{
			path: '/404',
			component: NotFound
		},
		{
			path: '*',
			redirect: '/404'
		}
	]
})
