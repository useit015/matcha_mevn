<template>
<nav>
	<v-toolbar flat app>
		<v-toolbar-side-icon v-if="status" class="grey--text" @click="drawer = !drawer"></v-toolbar-side-icon>
		<div v-else style="width:2.5rem;"></div>
		<v-toolbar-title class="text-uppercase grey--text">
			<span>M</span><span class="font-weight-light">atcha</span>
		</v-toolbar-title>
		<v-spacer></v-spacer>
		<v-layout v-if="status" justify-end>
			<v-menu bottom offset-y v-model="notifMenu" :nudge-width="250">
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
				<v-list class="grey lighten-5 pa-0">
					<template v-for="(item, i) in notifs">
						<v-list-tile :key="i" avatar @click="toUserProfile(item.id_from)">
							<v-list-tile-avatar>
								<img :src="getFullPath(item.profile_image)">
							</v-list-tile-avatar>
							<v-list-tile-content>
								<v-list-tile-title class="notif_msg">
									<strong class="notif_username">{{ item.username }}</strong>
									<span>{{ getNotifMsg(item) }}</span>
								</v-list-tile-title>
								<v-list-tile-sub-title>
									<v-icon small color="blue lighten-2" class="mr-2">{{ getNotifIcon(item.type) }}</v-icon>
									<span class="notif_date">{{ formatNotifDate(item) }}</span>
								</v-list-tile-sub-title>
							</v-list-tile-content>
						</v-list-tile>
					</template>
					<v-list-tile router to="/notifications" class="see_all">
						<v-list-tile-title>See all notifications</v-list-tile-title>
					</v-list-tile>
				</v-list>
			</v-menu>
			<v-menu bottom offset-y v-model="msgMenu" :nudge-width="250">
				<template v-slot:activator="{ on }">
					<v-btn flat icon large color="grey" v-on="on">
						<v-badge overlap :value="!!newMsgNum" color="primary" class="mx-2" right>
							<template v-slot:badge>
								<span>{{ newMsgNum }}</span>
							</template>
							<v-icon color="grey">chat</v-icon>
						</v-badge>
					</v-btn>
				</template>
				<v-list class="grey lighten-5 pa-0 message_list">
					<template v-for="(item, i) in menuConvos">
						<v-list-tile :key="i" avatar @click="toUserChat(item)">
							<v-list-tile-avatar>
								<img :src="getFullPath(item.profile_image)">
							</v-list-tile-avatar>
							<v-list-tile-content>
								<v-list-tile-title class="notif_msg">
									<v-layout justify-between>
										<strong class="notif_username">{{ item.username }}</strong>
										<span class="ml-auto chat_time">{{ formatNotifDate(item) }}</span>
									</v-layout>
								</v-list-tile-title>
								<v-list-tile-sub-title>
									<span v-if="item.message_from == user.id" class="notif_date">You: </span>
									<span class="notif_date text-truncate">{{ item.message }}</span>
								</v-list-tile-sub-title>
							</v-list-tile-content>
						</v-list-tile>
					</template>
					<v-list-tile router to="/chat" class="see_all">
						<v-list-tile-title>See all chats</v-list-tile-title>
					</v-list-tile>
				</v-list>
			</v-menu>
		</v-layout>
		<div v-if="!status">
			<v-btn flat color="grey" router to="/login">Login</v-btn>
			<v-btn flat color="grey" router to="/register">Sign Up</v-btn>
		</div>
	</v-toolbar>
	<v-navigation-drawer v-if="status" v-model="drawer" app fixed class="primary">
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
import moment from 'moment'

export default {
	name: 'Navbar',
	data: () => ({
		timer: {},
		notifMenu: 0,
		msgMenu: 0,
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
				icon: 'search',
				text: 'Search',
				route: '/search',
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
			const url = `${process.env.URL}/auth/isloggedin`
			const headers = { 'x-auth-token': token }
			const res = await this.$http.get(url, { headers })
			if (!res.body.msg) {
				const user = res.body
				if (user.birthdate)
					user.birthdate = new Date(user.birthdate)
						.toISOString()
						.substr(0, 10)
				this.in(user)
			}
		} catch (err) {
			console.log('Got error here -->', err)
		}
	},
	computed: {
		...mapGetters([
			'user',
			'notif',
			'status',
			'convos',
			'typingSec',
			'profileImage'
		]),
		typingConvos () {
			return this.typingSec.convos ? this.typingSec.convos.length : false
		},
		image () {
			return this.getFullPath(this.profileImage)
		},
		notifs () {
			return this.notif
				.filter(cur => cur.type != 'chat')
				.sort((a, b) => new Date(b.date) - new Date(a.date))
				.slice(0, 7)
		},
		menuConvos () {
			return this.convos.slice(0, 7)
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
				const url = `${process.env.URL}/api/notif/update`
				const headers = { 'x-auth-token': this.user.token }
				const res = await this.$http.get(url, { headers })
				this.seenNotif()
			}
		},
		typingConvos () {
			if (this.typingSec.status) {
				const len = this.typingSec.convos.length
				const convId = this.typingSec.convos[len - 1].id_conversation
				if (this.timer[convId]) clearTimeout(this.timer[convId])
				this.timer[convId] = setTimeout(() => this.typingSecClr(convId), 1200)
			}
		}
	},
	methods: {
		...utility,
		...mapActions({
			in: 'login',
			out: 'logout',
			syncConvo: 'syncConvo',
			seenNotif: 'seenNotif',
			typingSecClr: 'typingSecClr'
		}),
		toUserProfile (id) {
			this.$router.push(`/user/${id}`)
		},
		toUserChat (convo) {
			this.syncConvo(convo)
			this.$router.push('/chat')
		},
		async logout () {
			try {
				const url = `${process.env.URL}/auth/logout`
				const headers = { 'x-auth-token': this.user.token }
				const res = await this.$http.get(url, { headers })
				if (res.body.ok) this.out(this.user.id)
				this.$router.push('/')
			} catch (err) {
				console.log('problem with -->', err)
			}
		},
		formatNotifDate (item) {
			return moment.utc(item.date ? item.date : item.last_update).fromNow()
		}
	}
}
</script>

<style>
.see_all > a {
	height: 2rem;
	font-size: .9em;
	color: #003656 !important;
}

.see_all > a > .v-list__tile__title {
	text-align: center;
}

.message_list {
	max-width: 300px;
}

.notif_username {
	color: #003656;
}

.notif_date {
	font-size: .9em;
}
.notif_msg {
	font-size: .8em;
}
.v-list__tile__sub-title {
	margin-top: -2px;
}
.v-menu__content {
	box-shadow: none !important;
	border: 1px solid rgba(0, 0, 0, .1);
}
.v-list__tile.v-list__tile--link.v-list__tile--avatar.theme--light {
	border-bottom: 1px solid rgba(0, 0, 0, .1);
}
</style>
