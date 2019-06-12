<template>
	<nav>
		<v-toolbar flat app>
			<v-toolbar-side-icon class="grey--text" @click="drawer = !drawer"></v-toolbar-side-icon>
			<v-toolbar-title class="text-uppercase grey--text">
				<span>M</span><span class="font-weight-light">atcha</span>
			</v-toolbar-title>
			<v-spacer></v-spacer>
			<v-layout v-if="status" justify-end>
				<v-menu bottom left offset-y v-model="notifMenu">
					<template v-slot:activator="{ on }">
						<v-btn flat icon large color="grey" v-on="on">
							<v-badge overlap :value="!!notifNum" color="primary" class="mx-2" right>
								<template v-slot:badge>
									<span>{{ notifNum }}</span>
								</template>
								<v-icon color="grey">notifications</v-icon>
							</v-badge>
						</v-btn>
					</template>
					<v-list class="grey lighten-5">
						<template v-for="(item, i) in notifs">
							<v-list-tile :key="i" avatar @click="toUserProfile(item.id_from)">
								<v-list-tile-avatar>
									<img :src="getFullPath(item.profile_image)">
								</v-list-tile-avatar>
								<v-list-tile-content>
									<v-list-tile-title>
										{{ item.type }}
									</v-list-tile-title>
									<v-list-tile-sub-title>
										{{ item.username }}
									</v-list-tile-sub-title>
								</v-list-tile-content>
							</v-list-tile>
						</template>
					</v-list>
				</v-menu>
				<v-btn flat icon large color="grey">
					<v-badge overlap :value="!!newMsgNum" color="primary" class="mx-2" right>
						<template v-slot:badge>
							<span>{{ newMsgNum }}</span>
						</template>
						<v-icon color="grey">chat</v-icon>
					</v-badge>
				</v-btn>
			</v-layout>
			<div v-if="!status">
				<v-btn flat color="grey" router to="/login">Login</v-btn>
				<v-btn flat color="grey" router to="/register">Sign Up</v-btn>
			</div>
		</v-toolbar>
		<v-navigation-drawer v-model="drawer" app fixed class="primary">
			<v-list>
				<v-list-tile avatar>
					<v-layout align-center justify-center v-if="status">
						<v-list-tile-avatar>
							<img :src="image">
						</v-list-tile-avatar>
						<v-list-tile-content>
							<v-list-tile-title class="white--text text-capitalize font-weight-light subheading">
								{{ user.username }}
							</v-list-tile-title>
						</v-list-tile-content>
					</v-layout>
					<v-list-tile-action class="ml-auto">
						<v-btn icon @click.stop="drawer = !drawer" class="ml-auto">
							<v-icon class="white--text">chevron_left</v-icon>
						</v-btn>
					</v-list-tile-action>
				</v-list-tile>
				<v-divider></v-divider>
				<div v-for="link in links" :key="link.text">
					<v-list-tile v-if="link.public || status" router :to="link.route">
						<v-list-tile-action>
							<v-icon class="white--text">
								{{ link.icon }}
							</v-icon>
						</v-list-tile-action>
						<v-list-tile-content>
							<v-list-tile-title class="white--text">
								{{ link.text }}
							</v-list-tile-title>
						</v-list-tile-content>
					</v-list-tile>
				</div>
				<v-list-tile v-if="status" @click="logout">
					<v-list-tile-action>
						<v-icon class="white--text">exit_to_app</v-icon>
					</v-list-tile-action>
					<v-list-tile-content>
						<v-list-tile-title class="white--text">
							Logout
						</v-list-tile-title>
					</v-list-tile-content>
				</v-list-tile>
			</v-list>
		</v-navigation-drawer>
	</nav>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import utility from '../utility.js'

export default {
	name: 'Navbar',
	data: () => ({
		notifMenu: 0,
		notifNum: 0,
		newMsgNum: 0,
		drawer: false,
		links: [
			{
				icon: 'dashboard',
				text: 'Home',
				route: '/', public:
				true
			}, {
				icon: 'people',
				text: 'Discover',
				route: '/discover',
				public: false
			}, {
				icon: 'chat',
				text: 'Chat',
				route: '/chat',
				public: false
			}, {
				icon: 'notification_important',
				text: 'Notifications',
				route: '/notifications',
				public: false
			}, {
				icon: 'settings',
				text: 'Settings',
				route: '/settings',
				public: false
			}
		]
	}),
	async created () {
		try {
			const token = localStorage.getItem('token')
			const url = 'http://134.209.195.36/auth/isloggedin'
			const headers = { 'x-auth-token': token }
			const res = await this.$http.get(url, { headers })
			if (!res.body.msg) {
				const user = res.body
				user.birthdate = new Date(user.birthdate)
					.toISOString()
					.substr(0, 10)
				this.in(user)
			} else {
				console.log(res.body.msg)
			}
		} catch (err) {
			console.log('problem with -->', err)
		}
	},
	computed: {
		...mapGetters([
			'user',
			'notif',
			'status',
			'profileImage'
		]),
		image () {
			return this.getFullPath(this.profileImage)
		},
		notifs () {
			return this.notif
				.filter(cur => cur.type != 'chat')
				.sort((a, b) => new Date(b.date) - new Date(a.date))
				.slice(0, 10)
		}
	},
	watch: {
		notif: {
			immediate: true,
			handler () {
				this.newMsgNum = this.notif
					.filter(cur => cur.type == 'chat' && !cur.is_read).length
				this.notifNum = this.notif
					.filter(cur => cur.type != 'chat' && !cur.is_read).length
			}
		},
		async notifMenu () {
			if (this.notifMenu) {
				const url = 'http://134.209.195.36/api/notif/update'
				const headers = { 'x-auth-token': this.user.token }
				const res = await this.$http.get(url, { headers })
				this.seenNotif()
				console.log('i updated the notifs', res)
			}
		}
	},
	methods: {
		...utility,
		...mapActions({
			in: 'login',
			out: 'logout',
			seenNotif: 'seenNotif'
		}),
		toUserProfile (id) {
			this.$router.push(`/user/${id}`)
		},
		async logout () {
			try {
				const url = 'http://134.209.195.36/auth/logout'
				const headers = { 'x-auth-token': this.user.token }
				const res = await this.$http.get(url, { headers })
				if (res.body.ok) this.out(this.user.id)
				this.$router.push('/')
			} catch (err) {
				console.log('problem with -->', err)
			}
		}
	}
}
</script>
