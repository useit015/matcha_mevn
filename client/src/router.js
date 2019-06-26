import Vue from 'vue'
import vueRouter from 'vue-router'
import Users from '@/components/Users'
import Login from '@/components/Login'
import Search from '@/components/Search'
import Forgot from '@/components/Forgot'
import install from '@/components/install'
import Recover from '@/components/Recover'
import Register from '@/components/Register'
import Settings from '@/components/Settings'
import Discover from '@/components/Discover'
import NotFound from '@/components/NotFound'
import Messenger from '@/components/Messenger'
import UserProfile from '@/components/UserProfile'
import Notifications from '@/components/Notifications'

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
			path: '/search',
			component: Search,
			props: route => ({
				data: {
					gender: route.query.gender,
					location: route.query.location,
					min: route.query.min,
					max: route.query.max
				}
			})
		},
		{
			path: '/notifications',
			component: Notifications
		},
		{
			path: '/chat',
			component: Messenger
		},
		{
			path: '/user/:id',
			component: UserProfile
		},
		{
			path: '/forgot',
			component: Forgot
		},
		{
			path: '/recover',
			component: Recover
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
