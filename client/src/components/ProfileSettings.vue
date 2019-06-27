<template>
<v-container>
	<h1 class="heading display-2 font-weight-thin py-3 mb-4">Parameters</h1>
	<v-layout justify-center>
		<v-tooltip bottom>
			<template v-slot:activator="{ on }">
				<div
					v-for="(color, i) in colors"
					:key="i"
					:style="`background:${color};`"
					class="color_picker"
					@click="changeTheme(color)"
					v-on="on"
				></div>
			</template>
			<span>Use theme</span>
		</v-tooltip>
	</v-layout>
	<v-layout wrap justify-center align-start class="my-4">
		<v-flex v-if="!isGoogleUser" xs12 sm6 class="px-3 my-3">
			<v-layout align-center class="px-3">
				<v-text-field
					disabled
					label="Email"
					color="primary"
					v-model="user.email"
				></v-text-field>
				<v-icon color="primary" class="ml-3" @click="emailDialog = true">edit</v-icon>
			</v-layout>
		</v-flex>
		<v-flex v-if="!isGoogleUser" xs12 sm6 class="px-3 my-3">
			<v-layout align-center class="px-3">
				<v-text-field 
					disabled
					color="primary"
					value="**********"
					label="Password"
					type="password"
				></v-text-field>
				<v-icon color="primary" class="ml-3" @click="passDialog = true">edit</v-icon>
			</v-layout>
		</v-flex>
		<v-flex xs12>
			<v-btn outline block large color="primary" @click="openLoc">
				<span>Change location</span>
				<v-icon right>location_on</v-icon>
			</v-btn>
		</v-flex>
	</v-layout>
	<v-expansion-panel v-model="blacklistPanel" :disabled="closePanel" class="blacklist">
		<v-expansion-panel-content  :ripple="{ class: 'primary--text' }" expand-icon="keyboard_arrow_down">
			<template v-slot:header>
				<div class="subheading expansion_list">Blacklist</div>
			</template>
			<v-list class="blacklist_list">
				<v-list-tile
					v-for="banned in blacklist"
					:key="banned.id"
					class="blacklist_item mx-2">
					<v-list-tile-content>
						<v-list-tile-title>{{ banned.username }}</v-list-tile-title>
					</v-list-tile-content>
					<v-list-tile-action>
						<v-icon @click="unBlock(banned)">close</v-icon>
					</v-list-tile-action>
				</v-list-tile>
			</v-list>
		</v-expansion-panel-content>
	</v-expansion-panel>
	<v-dialog v-model="emailDialog" max-width="500" persistent v-if="!isGoogleUser && reRender">
		<v-card class="grey lighten-3">
			<v-container>
				<h5 class="display-1 display-2 text-xs-center text-md-left font-weight-thin pt-3 pb-3 mb-4 hidden-sm-and-down">Change email</h5>
				<v-form v-model="valid" class="my-4">
					<v-text-field 
						color="primary"
						v-model="password"
						validate-on-blur
						:rules="passRules"
						label="Current password"
						required
						:append-icon="showPass ? 'visibility' : 'visibility_off'"
						:type="showPass ? 'text' : 'password'"
						@click:append="showPass = !showPass"
					></v-text-field>
					<v-text-field
						color="primary"
						class="my-3"
						validate-on-blur
						v-model="email"
						:rules="emailRules"
						label="Email"
						required
					></v-text-field>
				</v-form>
				<v-card-actions>
					<v-spacer></v-spacer>
					<v-btn flat color="primary" @click="saveEmail" :disabled="!valid">Save</v-btn>
					<v-btn flat color="primary" @click="closeEmail">Cancel</v-btn>
				</v-card-actions>
			</v-container>
		</v-card>
	</v-dialog>
	<v-dialog v-model="passDialog" max-width="500" persistent v-if="!isGoogleUser && reRender">
		<v-card class="grey lighten-3">
			<v-container>
				<h5 class="display-1 display-2 text-xs-center text-md-left font-weight-thin pt-3 pb-3 mb-4 hidden-sm-and-down">Change password</h5>
				<v-form v-model="valid" class="my-4">
					<v-text-field 
						color="primary"
						class="mb-4"
						v-model="password"
						validate-on-blur
						:rules="passRules"
						label="Current password"
						required
						:append-icon="showPass ? 'visibility' : 'visibility_off'"
						:type="showPass ? 'text' : 'password'"
						@click:append="showPass = !showPass"
					></v-text-field>
					<v-text-field 
						color="primary"
						class="mb-4"
						v-model="newPassword"
						validate-on-blur
						:rules="passRules"
						label="New password"
						required
						:append-icon="showNewPass ? 'visibility' : 'visibility_off'"
						:type="showNewPass ? 'text' : 'password'"
						@click:append="showNewPass = !showNewPass"
					></v-text-field>
					<v-text-field 
						color="primary"
						class="mb-4"
						v-model="confNewPassword"
						validate-on-blur
						label="Confirm new password"
						required
						:append-icon="showConfNewPass ? 'visibility' : 'visibility_off'"
						:type="showConfNewPass ? 'text' : 'password'"
						@click:append="showConfNewPass = !showConfNewPass"
						:error-messages="passwordMatch()"
					></v-text-field>
				</v-form>
				<v-card-actions>
					<v-spacer></v-spacer>
					<v-btn flat color="primary" @click="savePass" :disabled="!valid">Save</v-btn>
					<v-btn flat color="primary" @click="closePass">Cancel</v-btn>
				</v-card-actions>
			</v-container>
		</v-card>
	</v-dialog>
	<v-dialog v-if="flag" v-model="locDialog" fullscreen hide-overlay transition="dialog-bottom-transition">
		<v-card>
			<v-toolbar dark color="primary" class="map_toolbar">
				<v-btn icon dark @click="locDialog = false">
					<v-icon>close</v-icon>
				</v-btn>
				<v-toolbar-title>Location</v-toolbar-title>
				<v-spacer></v-spacer>
				<v-toolbar-items>
					<v-btn dark flat @click="changeLoc">Save</v-btn>
				</v-toolbar-items>
			</v-toolbar>
			<map-location-selector :latitude="latitude" :longitude="longitude" @locationUpdated="locationUpdated"></map-location-selector>
		</v-card>
	</v-dialog>
	<alert :data="alert"></alert>
</v-container>
</template>

<script>
import Alert from './Alert'
import utility from '../utility.js'
import mapLocationSelector from 'vue-google-maps-location-selector/src/GoogleMapsLocationSelector'
import { mapGetters, mapActions } from 'vuex'

export default {
	name: 'ProfileSettings',
	components: {
		Alert,
		mapLocationSelector
	},
	data: () => ({
		f: false,
		flag: false,
		valid: false,
		reRender: true,
		showPass: false,
		locDialog: false,
		passDialog: false,
		showNewPass: false,
		blacklistOn: false,
		emailDialog: false,
		blacklistPanel: null,
		showConfNewPass: false,
		password: '',
		newPassword: '',
		confNewPassword: '',
		email: '',
		loc: {
			lat: null,
			lng: null
		},
		alert: {
			state: false,
			color: '',
			text: ''
		},
		passRules: [
			v => !!v || 'This field is required',
			v => /^(?=.*\d)(?=.*[A-Za-z])[0-9A-Za-z!@#$%]+$/.test(v) || 'Password must contain at least one letter, one number and one special char',
			v => v.length >= 8 || 'Password must be at least 8 characters long'
		],
		emailRules: [
			v => !!v || 'This field is required',
			v => /.+@.+/.test(v) || 'E-mail must be valid'
		],
		colors: [
			'#03A9F4',
			'#43A047',
			'#E64A19',
			'#D81B60',
			'#263238'
		]
	}),
	computed: {
		...mapGetters([
			'user',
			'blocked',
			'location',
			'blockedBy',
			'blacklist'
		]),
		latitude () {
			return Number(this.location.lat)
		},
		longitude () {
			return Number(this.location.lng)
		},
		closePanel () {
			if (!this.blacklist.length) {
				this.blacklistPanel = null
				return true
			}
			return false
		},
		isGoogleUser () {
			return this.user.google_id != null
		}
	},
	watch: {
		location: {
			immediate: true,
			handler () {
				this.loc.lat = Number(this.location.lat)
				this.loc.lng = Number(this.location.lng)
			}
		}
	}
	,
	methods: {
		...utility,
		...mapActions([
			'syncBlacklist',
			'updateUserEmail'
		]),
		googleLoaded () {
			return (typeof google === 'object' && typeof google.maps === 'object')
		},
		openLoc () {
			this.locDialog = true
			this.flag = this.googleLoaded()
		},
		async saveEmail () {
			try {
				const url = `${process.env.URL}/api/users/email`
				const headers = { 'x-auth-token': this.user.token }
				const data = {
					email: this.email,
					password: this.password
				}
				const res = await this.$http.post(url, data, { headers })
				this.password = ''
				this.valid = false
				if (res.body.ok) {
					this.showAlert('green', 'Your email has been updated', this)
					this.emailDialog = false
					this.updateUserEmail(this.email)
					this.email = ''
					this.reRenderComp()
				} else {
					this.showAlert('red', res.body.msg, this)
				}
			} catch (err) {
				console.log('Got error with -> ', err)
			}
		},
		async savePass () {
			try {
				const url = `${process.env.URL}/api/users/password`
				const headers = { 'x-auth-token': this.user.token }
				const data = {
					password: this.password,
					newPassword: this.newPassword,
					confNewPassword: this.confNewPassword
				}
				const res = await this.$http.post(url, data, { headers })
				this.password = ''
				this.newPassword = ''
				this.confNewPassword = ''
				this.valid = false
				this.reRenderComp()
				if (res.body.ok) {
					this.showAlert('green', 'Your password has been updated', this)
					this.passDialog = false
				} else {
					this.showAlert('red', res.body.msg, this)
				}
			} catch (err) {
				console.log('Got error with -> ', err)
			}
		},
		closeEmail () {
			this.emailDialog = false
			this.password = ''
			this.email = ''
			this.reRenderComp()
		},
		closePass () {
			this.passDialog = false
			this.password = ''
			this.newPassword = ''
			this.confNewPassword = ''
			this.reRenderComp()
		},
		reRenderComp () {
			this.reRender = false
			this.$nextTick(() => this.reRender = true)
		},
		passwordMatch () {
			return this.passMatch(this.confNewPassword, this.newPassword)
		},
		locationUpdated (loc) {
			this.loc = loc
		},
		async changeLoc () {
			this.locDialog = false
			const url = `${process.env.URL}/api/action/position`
			const headers = { 'x-auth-token': this.user.token }
			const result =  await this.$http.post(url, this.loc, { headers })
			if (result.body.ok) {
				this.$store.commit('locate', this.loc)
				this.showAlert('green', 'Your location has been updated', this)
			} else {
				this.showAlert('red', result.body.msg, this)
			}
		},
		async unBlock (banned) {
			const { id, username } = banned
			const url = `${process.env.URL}/api/action/unblock`
			const headers = { 'x-auth-token': this.user.token }
			const result =  await this.$http.post(url, { id }, { headers })
			if (result.body.ok) {
				const blacklist = {
					blocked: this.blocked.filter(cur => cur != id) || [],
					blockedBy: this.blockedBy
				}
				this.$store.commit('syncBlocked', blacklist)
				this.syncBlacklist(blacklist.blocked)
				this.showAlert('green', `${username} has been ublocked`, this)
			} else {
				this.showAlert('red', result.body.msg, this)
			}
		},
		changeTheme (color) {
			let root = document.documentElement
			this.$vuetify.theme.primary = color
			root.style.setProperty('--color-primary', color)
		}
	}
}
</script>

<style>
.map_toolbar {
	z-index: 5;
}

.map-container {
	position: initial !important;
}

.blacklist {
	box-shadow: none;
	border: 1px solid var(--color-primary);
	border-radius: 3px;
}

.blacklist > li,
.blacklist_list,
.blacklist_item {
	background-color: #fafafa !important;
}

.expansion_list {
	color: #666;
}

.v-expansion-panel__header {
	padding: 8px 24px;
}

.color_picker {
	width: 4rem;
	height: 4rem;
	margin: 1vw 2vw;
	border-radius: 5px;
	cursor: pointer;
}
</style>
