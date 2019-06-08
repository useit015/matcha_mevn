<template>
<div>
	<v-layout column class="settings" v-if="loaded">
		<div class="parallax"></div>
		<v-layout class="py-0 strap grey lighten-3">
			<v-container py-0>
				<v-layout>
					<v-flex xs12 sm8 md4 class="avatar">
						<v-avatar slot="offset" class="mx-auto d-block" size="200">
							<img :src="profileImage" class="avatar__img">
							<div class="avatar__btn">
								<v-fab-transition>
									<v-btn color="grey lighten-5" fab small @click.stop="openEditor">
										<v-icon>add_a_photo</v-icon>
									</v-btn>
								</v-fab-transition>
							</div>
						</v-avatar>
					</v-flex>
					<profile-tabs settings :active="activeTab" @change-tab="changeTab"></profile-tabs>
				</v-layout>
			</v-container>
		</v-layout>
		<v-container fill-height grid-list-xl class="profile">
			<v-layout justify-center wrap>
				<v-flex xs12 sm8 md4>
					<profile-badge :user="user" settings></profile-badge>
				</v-flex>
				<v-flex xs12 sm10 md8 class="main pa-0 grey--text">
					<profile-tabs settings :active="activeTab" @change-tab="changeTab" mobile></profile-tabs>
					<v-tabs-items v-model="activeTab">
						<v-tab-item value="tab-profile">
							<profile-form :user="user" @sync-user="syncUser" @update-user="updateUser"></profile-form>
						</v-tab-item>
						<v-tab-item value="tab-photo">
							<profile-gallery :images="user.images"></profile-gallery>
						</v-tab-item>
						<v-tab-item value="tab-history">
							<profile-history></profile-history>
						</v-tab-item>
						<v-tab-item value="tab-setting">
							<profile-settings></profile-settings>
						</v-tab-item>
					</v-tabs-items>
				</v-flex>
			</v-layout>
		</v-container>
		<alert :data="alert"></alert>
		<profile-editor @update-image="updateImage" ref="profile_editor"></profile-editor>
	</v-layout>
	<loader v-else/>
</div>
</template>

<script>
import Alert from './Alert'
import moment from 'moment'
import loader from './loader'
import utility from '../utility.js'
import ProfileForm from './ProfileForm'
import ProfileTabs from './ProfileTabs'
import ProfileBadge from './ProfileBadge'
import ProfileEditor from './ProfileEditor'
import ProfileGallery from './ProfileGallery'
import ProfileHistory from './ProfileHistory'
import { mapGetters, mapActions } from 'vuex'
import ProfileSettings from './ProfileSettings'

export default {
	name: 'Settings',
	components: {
		Alert,
		loader,
		ProfileTabs,
		ProfileForm,
		ProfileBadge,
		ProfileHistory,
		ProfileEditor,
		ProfileGallery,
		ProfileSettings
	},
	data: () => ({
		loaded: true,
		activeTab: 'tab-profile',
		alert: {
			state: false,
			color: '',
			text: ''
		}
	}),
	created () {
		if (this.user.id) {
			this.syncHistory(this.loggedIn.id)
			this.syncMatches(this.loggedIn.id)
		}
	},
	computed: {
		...mapGetters({
			loggedIn: 'user',
			avatar: 'profileImage',
			status: 'status'
		}),
		user: {
			get () {
				return { ...this.loggedIn }
			},
			set (user) {}
		},
		profileImage () {
			return this.getFullPath(this.avatar)
		}
	},
	watch: {
		loggedIn: {
			immediate: true,
			async handler () {
				if (!this.loaded) {
					if (!this.user.id) {
						try {
							const token = localStorage.getItem('token')
							const url = 'http://134.209.195.36/auth/isloggedin'
							const res = await this.$http.get(url, {
								headers: {
									'x-auth-token': token
								}
							})
							if (res.body.msg) {
								this.$router.push('/login')
							} else {
								this.loaded = true
							}
						} catch (err) {
							console.log('problem with -->', err)
						}
					} else {
						this.loaded = true
					}
				}
			}
		}
	},
	methods: {
		...utility,
		...mapActions({
			update: 'updateUser',
			syncMatches: 'syncMatches',
			syncHistory: 'syncHistory'
		}),
		async updateUser () {
			try {
				let msg
				const url = `http://134.209.195.36/api/users/update`
				const res = await this.$http.post(url, this.user, {
					headers: {
						'x-auth-token': this.user.token
					}
				})
				if (res && res.body && !res.body.msg) {
					msg = 'Your account has been updated successfuly'
					this.showAlert('success', msg)
					this.update(this.user)
					console.log(res)
				} else {
					msg = 'Ouups something went wrong!'
					this.showAlert('red', msg)
					console.log(res)
				}
			} catch (err) {
				console.log('got error here --> ', err)
			}
		},
		async updateImage (data) {
			try {
				let msg
				const fd = new FormData()
				fd.append('image', data)
				const url = `http://134.209.195.36/api/users/image`
				const res = await this.$http.post(url, fd, {
					headers: {
						'x-auth-token': this.user.token
					}
				})
				if (res && res.body && !res.body.msg) {
					msg = 'You profile image has been updated successfuly'
					this.showAlert('success', msg)
					this.$store.commit('updateProfileImage', res.body.name)
				} else {
					msg = 'Ouups something went wrong!'
					this.showAlert('red', msg)
					console.log(res)
				}
			} catch (err) {
				console.log('got error here --> ', err)
			}
		},
		showAlert (color, text) {
			this.alert = {
				state: true,
				color,
				text
			}
		},
		syncUser (user) {
			this.user = user
		},
		changeTab (tab) {
			this.activeTab = tab
		},
		openEditor () {
			this.$refs.profile_editor.pickFile()
		}
	}
}
</script>
