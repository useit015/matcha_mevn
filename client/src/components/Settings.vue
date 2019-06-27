<template>
<v-layout column class="settings" v-if="loaded">
	<div class="parallax" :style="`background-image: url(${coverPhoto});`"></div>
	<v-tooltip left>
		<template v-slot:activator="{ on }">
			<div class="cover__btn">
				<v-fab-transition>
					<v-btn fab small outline color="grey" v-on="on" @click.stop="pickFile">
						<v-icon>add_a_photo</v-icon>
					</v-btn>
				</v-fab-transition>
			</div>
		</template>
		<span>Change cover photo</span>
	</v-tooltip>
	<input
		type="file"
		style="display: none"
		ref="image"
		accept="image/*"
		@change="onFilePicked">
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
						<profile-form ref="form" :user="user" @sync-user="syncUser" @update-user="updateUser"></profile-form>
					</v-tab-item>
					<v-tab-item value="tab-photo">
						<profile-gallery :images="filteredImages"></profile-gallery>
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
	<profile-editor @file_error="error = true" @file_succes="error = false" @update-image="updateImage" ref="profile_editor"></profile-editor>
</v-layout>
<loader v-else/>
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
		error: null,
		loaded: false,
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
			status: 'status',
			coverPhoto: 'coverPhoto',
			profileImage: 'profileImage'
		}),
		user: {
			get () {
				return { ...this.loggedIn }
			},
			set (user) {}
		},
		filteredImages () {
			if (!this.user.images) return []
			return this.user.images.filter(cur => !cur.cover)
		}
	},
	watch: {
		loggedIn: {
			immediate: true,
			async handler () {
				const token = this.user.token || localStorage.getItem('token')
				if (token) {
					try {
						const url = `${process.env.URL}/auth/isloggedin`
						const headers = { 'x-auth-token': token }
						const res = await this.$http.get(url, { headers })
						if (!res.body.msg) {
							this.loaded = true
							return
						}
					} catch (err) {
						console.log('Got error here --> ', err)
					}
				}
				this.logout(this.user.id)
				this.$router.push('/login')
			}
		}
	},
	methods: {
		...utility,
		...mapActions({
			logout: 'logout',
			update: 'updateUser',
			syncMatches: 'syncMatches',
			syncHistory: 'syncHistory'
		}),
		async updateUser () {
			try {
				let msg
				const url = `${process.env.URL}/api/users/update`
				const headers = { 'x-auth-token': this.user.token }
				const res = await this.$http.post(url, this.user, { headers })
				if (res && res.body && !res.body.msg) {
					msg = 'Your account has been updated successfuly'
					this.showAlert('green', msg, this)
					this.update(this.user)
					this.$refs.form.toggleEdit()
				} else {
					msg = res.body.msg ? res.body.msg : 'Ouups something went wrong!'
					this.showAlert('red', msg, this)
				}
			} catch (err) {
				console.log('got error here --> ', err)
			}
		},
		async updateImage (data) {
			if (!this.error) {
				try {
					let msg
					const fd = new FormData()
					fd.append('image', data)
					const url = `${process.env.URL}/api/users/image`
					const headers = { 'x-auth-token': this.user.token }
					const res = await this.$http.post(url, fd, { headers })
					if (res && res.body && !res.body.msg) {
						msg = 'You profile image has been updated successfuly'
						this.showAlert('success', msg, this)
						this.$store.commit('updateProfileImage', res.body)
					} else {
						msg = 'Ouups something went wrong!'
						this.showAlert('red', msg, this)
					}
				} catch (err) {
					console.log('got error here --> ', err)
				}
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
		},
		pickFile () {
			this.$refs.image.click()
		},
		async onFilePicked (e) {
			const files = e.target.files
			if (files[0]) {
				const imageFile = files[0]
				const imageName = imageFile.name
				if (imageName.lastIndexOf('.') <= 0) return
				if (imageFile.size > 1024 * 1024) {
					this.showAlert('red', 'Image is too large..', this)
				} else {
					try {
						let msg
						const fd = new FormData()
						fd.append('image', imageFile)
						const url = `${process.env.URL}/api/users/image/cover`
						const headers = { 'x-auth-token': this.user.token }
						const res = await this.$http.post(url, fd, { headers })
						if (res && res.body && !res.body.msg) {
							msg = 'You cover image has been updated successfuly'
							this.showAlert('success', msg, this)
							this.$store.commit('updateCoverImage', res.body)
						} else {
							msg = res.body.msg ? res.body.msg : 'Ouups something went wrong!'
							this.showAlert('red', msg, this)
						}
					} catch (err) {
						console.log('Got error here --> ', err)
					}
				}
			}
		}
	}
}
</script>
