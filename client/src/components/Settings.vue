<template>
<v-layout column class="settings">
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
</template>

<script>
import Alert from './Alert'
import moment from 'moment'
import utility from '../utility.js'
import ProfileForm from './ProfileForm'
import ProfileTabs from './ProfileTabs'
import ProfileBadge from './ProfileBadge'
import ProfileHistory from './ProfileHistory'
import ProfileEditor from './ProfileEditor'
import ProfileGallery from './ProfileGallery'
import ProfileSettings from './ProfileSettings'

export default {
	name: 'Settings',
	components: {
		Alert,
		ProfileTabs,
		ProfileForm,
		ProfileBadge,
		ProfileHistory,
		ProfileEditor,
		ProfileGallery,
		ProfileSettings
	},
	data: () => ({
		activeTab: 'tab-profile',
		alert: {
			state: false,
			color: '',
			text: ''
		}
	}),
	created () {
		if (this.user.id) {
			this.$store.dispatch('syncHistory', this.$store.getters.user.id)
			this.$store.dispatch('syncMatches', this.$store.getters.user.id)
		}
	},
	computed: {
		user: {
			get () {
				return { ...this.$store.getters.user }
			},
			set (user) {
				
			},
		},
		profileImage () {
			return this.getFullPath(this.$store.getters.profileImage)
		}
	},
	watch: {
		user: {
			immediate: true,
			handler () {
				if (this.user.id && (!this.user.token || this.user.token != localStorage.getItem('token'))) {
					this.$router.push('/')
				}
			}
		}
	},
	methods: {
		...utility,
		updateUser () {
			this.$http.post(`http://134.209.195.36/api/users/update/${this.user.id}`, { ...this.user })
				.then(res => {
					if (res && res.body && res.body.ok) {
						this.showAlert('success', 'Your account has been updated successfuly')
						this.$store.dispatch('updateUser', this.user)
					} else {
						this.showAlert('red', 'Ouups something went wrong!')
						console.log(res)
					}
				}).catch(err => console.error(err))
		},
		updateImage (data) {
			const fd = new FormData()
			fd.append('image', data)
			this.$http.post(`http://134.209.195.36/api/users/image/${this.user.id}`, fd)
				.then(res => {
					if (res && res.body && res.body.ok) {
						this.showAlert('success', 'You profile image has been updated successfuly')
						this.$store.commit('updateProfileImage', res.body.name)
					} else {
						this.showAlert('red', 'Ouups something went wrong!')
						console.log(res)
					}
				}).catch(err => console.error(err))
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
