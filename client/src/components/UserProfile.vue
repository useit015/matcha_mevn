<template>
<div>
	<loader v-if="f"/>
	<v-layout column class="user_profile" v-else>
		<div class="parallax" :style="`background-image: url(${coverPhoto});`"></div>
		<v-layout class="py-0 strap grey lighten-3">
			<v-container py-0>
				<v-layout>
					<v-flex xs12 sm8 md4 class="avatar">
						<v-avatar slot="offset" class="mx-auto d-block" size="200">
							<img :src="profileImage" class="avatar__img">
						</v-avatar>
					</v-flex>
					<profile-tabs :active="activeTab" @change-tab="changeTab"></profile-tabs>
					<v-tooltip bottom>
						<template v-slot:activator="{ on }">
							<v-icon :color="`${isOnline ? 'green' : 'grey'} lighten-2`" class="profile-status_icon mx-3 hidden-xs-only" small v-on="on">fiber_manual_record</v-icon>
						</template>
						<span>{{ lastSeen }}</span>
					</v-tooltip>
					<v-chip disabled outline small color="grey lighten-1" class="mt-3 ml-2 hidden-xs-only">{{ distance }}</v-chip>
					<v-btn icon flat large color="primary" :disabled="userCantLike" @click="match"  class="hidden-xs-only">
						<v-icon>{{ liked ? 'favorite' : 'favorite_border' }}</v-icon>
					</v-btn>
					<v-btn icon flat large color="primary" :disabled="!userCanChat" class="hidden-xs-only mx-0" @click="goToChat">
						<v-icon>{{ userCanChat ? 'chat_bubble' : 'chat_bubble_outline' }}</v-icon>
					</v-btn>
					<v-speed-dial v-model="fab" direction="bottom" transition="slide-y-reverse-transition" class="speed_list">
						<template v-slot:activator>
							<v-btn icon flat small large v-model="fab" color="primary">
								<v-icon>more_vert</v-icon>
							</v-btn>
						</template>
						<v-tooltip left>
							<template v-slot:activator="{ on }">
								<v-btn fab dark small color="primary darken-2" @click="reportDialog = true" v-on="on">
									<v-icon>warning</v-icon>
								</v-btn>
							</template>
							<span>Report</span>
						</v-tooltip>
						<v-tooltip left>
							<template v-slot:activator="{ on }">
								<v-btn fab dark small color="primary darken-2" @click="blockDialog = true" v-on="on">
									<v-icon>delete_forever</v-icon>
								</v-btn>
							</template>
							<span>Block</span>
						</v-tooltip>
					</v-speed-dial>
				</v-layout>
			</v-container>
		</v-layout>
		<v-container fill-height grid-list-xl class="profile">
			<v-layout justify-center wrap>
				<v-flex xs12 sm8 md4>
					<profile-badge :user="user" :like="likedBy" :match="userCanChat"></profile-badge>
				</v-flex>
				<v-flex xs12 sm10 md8 class="pa-0 grey--text main">
					<v-tabs-items v-model="activeTab">
						<v-tab-item value="tab-profile">
							<v-container>
								<div v-if="user.biography">
									<h1 class="heading display-2 font-weight-thin py-3 mb-4">About</h1>
									<v-container class="infos subheading py-2">
										{{ user.biography }}
									</v-container>
								</div>
								<h1 class="heading display-2 font-weight-thin py-3 mb-4">Informations</h1>
								<v-layout column class="title text-capitalize infos">
									<div v-for="item in informations" :key="item.label">
										<v-container py-3 v-if="item.content">
											<v-layout>
												<v-flex xs6>{{ `${item.label}:` }}</v-flex>
												<v-flex xs6 class="infos">{{ item.content }}</v-flex>
											</v-layout>
										</v-container>
									</div>
									<v-container py-3 px-2 v-if="!!userTags.length">
										<h1 class="heading display-2 font-weight-thin py-3 mb-4">Interests</h1>
										<v-chip color="primary" class="user_tags" dark label v-for="(tag, i) in userTags" :key="i">{{ tag }}</v-chip>
									</v-container>
								</v-layout>
							</v-container>
						</v-tab-item>
						<v-tab-item value="tab-photo">
							<profile-gallery :images="filteredImages"></profile-gallery>
						</v-tab-item>
					</v-tabs-items>
				</v-flex>
			</v-layout>
		</v-container>
	</v-layout>
	<v-dialog v-model="reportDialog" max-width="600px">
		<v-card class="pa-2">
			<v-card-title>
				<span class="headline">Report as fake</span>
			</v-card-title>
			<v-card-text>
				<v-container>
					<p class="subheading d-inline">Are you sure you want to report</p>
					<router-link :to="`/user/${user.id}`" class="px-1 user_link">{{ user.username }}</router-link>
					<p class="subheading d-inline">as fake ?</p>
				</v-container>
			</v-card-text>
			<v-card-actions>
				<v-spacer></v-spacer>
				<v-btn color="primary" flat @click="reportDialog = false">Close</v-btn>
				<v-btn color="primary" flat @click="reportUser">Report</v-btn>
			</v-card-actions>
		</v-card>
	</v-dialog>
	<v-dialog v-model="blockDialog" max-width="600px">
		<v-card class="pa-2">
			<v-card-title>
				<span class="headline">To the blacklist</span>
			</v-card-title>
			<v-card-text>
				<v-container>
					<p class="subheading d-inline">Are you sure you want to block</p>
					<router-link :to="`/user/${user.id}`" class="px-1 user_link">{{ user.username }}</router-link>
					<p class="subheading d-inline">?</p>
				</v-container>
			</v-card-text>
			<v-card-actions>
				<v-spacer></v-spacer>
				<v-btn color="primary" flat @click="blockDialog = false">Close</v-btn>
				<v-btn color="primary" flat @click="block">Block</v-btn>
			</v-card-actions>
		</v-card>
	</v-dialog>
	<alert :data="alert"></alert>
</div>
</template>

<script>
import Alert from './Alert'
import moment from 'moment'
import loader from './loader'
import { mapGetters, mapActions } from 'vuex'
import utility from '../utility.js'
import ProfileForm from './ProfileForm'
import ProfileTabs from './ProfileTabs'
import ProfileBadge from './ProfileBadge'
import ProfileGallery from './ProfileGallery'
import ProfileSettings from './ProfileSettings'

export default {
	name: 'UserProfile',
	components: {
		Alert,
		loader,
		ProfileTabs,
		ProfileForm,
		ProfileBadge,
		ProfileGallery,
		ProfileSettings
	},
	data () {
		return {
			user: {},
			f: true,
			fab: false,
			blockDialog: false,
			reportDialog: false,
			activeTab: 'tab-profile',
			alert: {
				state: false,
				color: '',
				text: ''
			}
		}
	},
	computed: {
		...mapGetters({
			loggedIn: 'user',
			online: 'online',
			convos: 'convos',
			matches: 'matches',
			blocked: 'blocked',
			location: 'location',
			following: 'following',
			followers: 'followers',
			blockedBy: 'blockedBy',
			profileImage: 'profileImage'
		}),
		liked: {
			get () {
				for (let match of this.following)
					if (match.id == this.user.id)
						return true 
				return false
			},
			set () {
				this.syncMatches(this.loggedIn.id)
			}
		},
		likedBy () {
			for (let match of this.followers)
				if (match.id == this.user.id)
					return true 
			return false
		},
		profileImage () {
			return this.getFullPath(this.getProfileImage())
		},
		userCantLike () {
			const imgs = this.loggedIn.images
			return imgs ? !imgs.length : true
		},
		userCanChat () {
			for (const match of this.matches)
				if (match.id == this.user.id)
					return true
			return false
		},
		age () {
			return this.user.birthdate ? new Date().getFullYear() - new Date(this.user.birthdate).getFullYear() : ''
		},
		lastSeen () {
			if (this.isOnline) return 'online'
			if (this.user.status)
				return moment(this.user.status).utc().fromNow()
			return moment(this.user.created_at).utc().fromNow()
		},
		informations () {
			return [
				{ label: 'Username', content: this.user.username },
				{ label: 'Fisrt Name', content: this.user.first_name },
				{ label: 'Last Name', content: this.user.last_name },
				{ label: 'Age', content: this.age },
				{ label: 'Gender', content: this.user.gender },
				{ label: 'Looking For', content: this.user.looking },
				{ label: 'Phone Number', content: this.user.phone },
				{ label: 'City', content: this.user.city },
				{ label: 'Country', content: this.user.country },
				{ label: 'Postal Code', content: this.user.postal_code },
				{ label: 'Address', content: this.user.address }
			]
		},
		distance () {
			const from = this.location
			const to = {
				lat: this.user.lat,
				lng: this.user.lng
			}
			const distance = this.calculateDistance(from, to)
			return `${Math.round(distance)} kms away`
		},
		isOnline () {
			return  this.online.includes(this.user.id)
		},
		coverPhoto () {
			const cover = 'https://images.pexels.com/photos/96422/pexels-photo-96422.jpeg'
			if (!this.user || !this.user.images) return this.getFullPath(cover)
			const image = this.user.images.find(cur => cur.cover)
			return this.getFullPath(image ? image.name : cover)
		},
		filteredImages () {
			return this.user.images.filter(cur => !cur.cover)
		},
		userTags () {
			const tags = this.user.tags
			if (!tags) return []
			return tags.split(',')
		}
	},
	watch: {
		blocked: {
			immediate: true,
			handler () {
				const id = Number(this.$route.params.id)
				if (Array.isArray(this.blocked) && this.blocked.includes(id)) {
					this.$router.push('/')
				}
			}
		},
		blockedBy: {
			immediate: true,
			handler () {
				const id = Number(this.$route.params.id)
				if (Array.isArray(this.blockedBy) && this.blockedBy.includes(id)) {
					this.$router.push('/')
				}
			}
		},
		loggedIn: {
			immediate: true,
			handler () {
				if (isNaN(this.$route.params.id) || !this.$route.params.id) this.$router.push('/404')
				this.fetchUser(this.$route.params.id)
			}
		},
		isOnline () {
			if (!this.isOnline) this.user.status = new Date()
		}
	},
	methods: {
		...utility,
		...mapActions([
			'syncBlocked',
			'syncMatches',
			'syncConvo',
			'syncConvoAll'
		]),
		changeTab (tab) {
			this.activeTab = tab
		},
		getProfileImage () {
			if (!this.user || !this.user.images) return 'default.png'
			const image = this.user.images.find(cur => cur.profile == true)
			return image ? image.name : 'default.png'
		},
		async match () {
			const url = `${process.env.URL}/api/action/match`
			const data = {
				id: this.$route.params.id,
				liked: this.liked
			}
			const headers = { 'x-auth-token': this.loggedIn.token }
			const res = await this.$http.post(url, data, { headers })
			if (res.body.ok) {
				this.liked = !this.liked
				const profileImg = this.loggedIn.images.find(cur => cur.profile == true)
				const data = {
					date: new Date(),
					id_from: this.loggedIn.id,
					username: this.loggedIn.username,
					profile_image: profileImg ? profileImg.name : 'default.png',
					id_to: this.$route.params.id
				}
				if (!this.liked) {
					if (this.followers.some(cur => cur.id == this.$route.params.id)) {
						data.type = 'like_back'
					} else {
						data.type = 'like'
					}
				} else {
					data.type = 'unlike'
				}
				this.syncConvoAll()
				this.$socket.emit('match', data)
			}
		},
		async block () {
			const url = `${process.env.URL}/api/action/block`
			let data = { id: this.$route.params.id }
			const headers =  { 'x-auth-token': this.loggedIn.token }
			const res = await this.$http.post(url, data, { headers })
			if (!res.body.msg) {
				this.syncBlocked(this.loggedIn.id)
				data = {
					id_from: this.loggedIn.id,
					id_to: this.$route.params.id
				}
				this.$socket.emit('block', data)
				this.blockDialog = false
				this.$router.push('/')
			}
		},
		goToChat () {
			const convo = this.convos.find(cur => cur.user_id == this.user.id)
			if (convo) {
				this.syncConvo({
					username: convo.username,
					id_conversation: convo.id_conversation,
					profile_image: convo.profile_image
				})
				this.$router.push('/chat')
			}
		},
		async fetchUser (id) {
			if (this.loggedIn.id && this.f) {
				if (this.loggedIn.id == this.$route.params.id) {
					this.$router.push('/settings')
				} else {
					try {
						const headers = { 'x-auth-token': this.loggedIn.token }
						const url = `${process.env.URL}/api/users/show/${id}`
						const res = await this.$http.get(url, { headers })
						if (res.body.msg) {
							this.$router.push('/404')
						}
						this.user = { ...res.body, rating: Number(res.body.rating) }
						const profileImg = this.loggedIn.images.find(cur => cur.profile == true)
						if (this.online.includes(this.user.id)) {
							this.user.status = true
						}
						const data = {
							date: new Date(),
							id_from: this.loggedIn.id,
							username: this.loggedIn.username,
							profile_image: profileImg ? profileImg.name : 'default.png',
							id_to: id,
							type: 'visit'
						}
						this.$socket.emit('visit', data)
						this.f = false
					} catch (err) {
						console.error(err)
					}
				}
			}
		},
		async reportUser() {
			const url = `${process.env.URL}/api/action/report`
			let data = { id: this.$route.params.id }
			const headers =  { 'x-auth-token': this.loggedIn.token }
			const res = await this.$http.post(url, data, {
				headers })
			if (!res.body.msg) {
				this.reportDialog = false
				this.showAlert('green', 'User reported successfuly', this)
			} else {
				this.showAlert('red', res.body.msg, this)
			}
		}
	},
	beforeRouteUpdate (to, from, next) {
		this.f = true
		this.fetchUser(to.params.id)
		next()
	}
}
</script>

<style>
.profile-status_icon {
	align-self: flex-start;
	margin-top: 1.5rem;
}

.user_profile {
	height: 100%;
}

.infos {
	color:#666;
}

.actions {
	box-shadow: none !important;
}

.more_icon {
	transform: scale(1.25);
}

.speed_list > .v-speed-dial__list {
	top: 4.25rem;
	z-index: 5;
}

.user_link {
	text-decoration: none;
	font-size: 1.1em;
}

.user_tags {
	border-radius: 5px;
}
</style>
