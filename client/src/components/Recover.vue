<template>
<v-container class="recover mt-5">
	<v-form v-model="valid" class="my-4" v-if="notSub && !loading">
		<v-layout wrap justify-center>
			<v-flex xs12>
				<h1 class="page-header pass_reset_title display-3 mb-5 font-weight-light grey--text">Reset password</h1>
			</v-flex>
			<v-flex md8 sm10 xs12>
				<v-text-field color="primary" v-model="password" validate-on-blur :rules="passRules" label="New password" required :append-icon="showPass ? 'visibility' : 'visibility_off'" :type="showPass ? 'text' : 'password'" @click:append="showPass = !showPass"></v-text-field>
			</v-flex>
			<v-flex md8 sm10 xs12>
				<v-text-field color="primary" class="my-3" validate-on-blur :rules="confPassRules" v-model="passwordConfirm" :counter="12" label="Confirm new password" required :append-icon="showConfPass ? 'visibility' : 'visibility_off'" :type="showConfPass ? 'text' : 'password'" @click:append="showConfPass = !showConfPass" :error-messages="passwordMatch()"></v-text-field>
			</v-flex>
			<v-flex md8 sm10 xs12>
				<v-btn block large depressed color="primary" :disabled="!valid" class="mt-5 white--text" @click="submit">Submit</v-btn>
			</v-flex>
		</v-layout>
	</v-form>
	<v-btn v-if="!notSub && !loading" large round outline router to="/" color="primary" class="mt-5 py-3 white--text back_btn">
		<v-icon left dark>arrow_back</v-icon>
		<span>Go back</span>
	</v-btn>
	<loader v-if="loading"/>
	<alert :data="alert"></alert>
</v-container>
</template>

<script>
import loader from './loader'
import Alert from './Alert'
import { mapGetters } from 'vuex'

export default {
	name: 'Recover',
	components: {
		Alert,
		loader
	},
	data: () => ({
		password: '',
		passwordConfirm: '',
		notSub: true,
		valid: false,
		loading: false,
		showPass: false,
		showConfPass: false,
		passRules: [
			v => !!v || 'This field is required',
			v => /^(?=.*\d)(?=.*[A-Za-z])[0-9A-Za-z!@#$%]+$/.test(v) || 'Password must contain at least one letter, one number and one special char',
			v => v.length >= 8 || 'Password must be at least 8 characters long'
		],
		confPassRules: [
			v => !!v || 'This field is required'
		],
		alert: {
			state: false,
			color: '',
			text: ''
		}
	 }),
	computed: mapGetters(['user']),
	methods: {
		passwordMatch () { 
			return !this.passwordConfirm.length || this.password === this.passwordConfirm ? '' : 'Passwords must match';
		},
		async submit () {
			this.loading = true
			try {
				const token = localStorage.getItem('token')
				const headers = { 'x-auth-token': token }
				const url = 'http://134.209.195.36/auth/rcheck'
				const data= {
					key: this.$route.params.key,
					password: this.password
				}
				// const res = await this.$http.post(url, data, { headers })
				setTimeout(() => {
					this.loading = false
					if (true) {
						this.notSub = false
						this.showAlert('green', 'Your password has been reseted!')
					} else {
						this.showAlert('red', 'Oups, something went wrong, please try later')
					}
				}, 1000);
				// if (!res.body.ok) this.$router.push('/')
				// this.user = res.body.user
				console.log('i got this from the derver --> ', res)
			} catch (err) {
				console.log('Got error with --> ', err)
			}
		},
		showAlert (color, text) {
			this.alert = {
				state: true,
				color,
				text
			}
		},
	}
}
</script>

<style>
.pass_reset_title {
	text-align: center;
}

.back_btn:hover,
.back_btn {
	position: absolute;
	top: 30%;
	left: 50%;
	transform: translate(-50%, -50%);
}
</style>