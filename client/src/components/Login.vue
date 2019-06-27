<template>
<v-container class="mt-4">
	<div class="login mt-5">
		<h1 class="page-header display-3 font-weight-light grey--text">Login</h1>
		<v-form v-model="valid" class="my-4">
			<v-text-field
				color="primary"
				class="my-5"
				v-model="username"
				validate-on-blur
				:rules="usernameRules"
				label="Username"
				required
			></v-text-field>
			<v-text-field 
				@keyup.13="log" 
				color="primary" 
				class="my-5" 
				v-model="password" 
				validate-on-blur 
				:rules="passRules" 
				label="Password" 
				required 
				:append-icon="showPass ? 'visibility' : 'visibility_off'" 
				:type="showPass ? 'text' : 'password'" 
				@click:append="showPass = !showPass"
			></v-text-field>
			<v-btn block large depressed color="primary" dark @click.prevent="log" class="mt-5">Login</v-btn>
			<v-layout row wrap justify-end>
				<v-btn flat color="primary" dark to="/forgot">Forgot password</v-btn>
				<v-btn flat color="primary" dark to="/register">Don't have an account? Sign up</v-btn>
			</v-layout>
		</v-form>
		<v-layout justify-center align-center>
			<a :href="`${url}/auth/google`" class="google">
				<v-btn large depressed color="red" dark class="mt-3">Login with google</v-btn>
			</a>
		</v-layout>
	</div>
	<alert :data="alert"></alert>
</v-container>
</template>

<script>
import { mapActions } from 'vuex'
import Alert from './Alert'
import utility from '../utility.js'

export default {
	name: 'Login',
	components: {
		Alert
	},
	data: () => ({
		username: '',
		password: '',
		url: process.env.URL,
		valid: false,
		showPass: false,
		alert: {
			state: false,
			color: '',
			text: ''
		},
		nameRules: [
			v => !!v || 'This field is required',
			v => !(/[^a-zA-Z \-]+/.test(v)) || 'Name can contain only letters',
			v => (v.length >= 3 && v.length <= 255 ) || 'Name must be at least 3 characters long',
		],
		usernameRules: [
			v => !!v || 'This field is required',
			v => (v.length >= 8 && v.length <= 25 ) || 'Username must be between 8 and 25 characters long',
			v => !(/[^a-zA-Z0-9]+/.test(v)) || 'Username can contain only letters and numbers'
		],
		emailRules: [
			v => !!v || 'This field is required',
			v => /.+@.+/.test(v) || 'E-mail must be valid'
		],
		passRules: [
			v => !!v || 'This field is required',
			v => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(v) || 'Password must contain at least one uppercase, one lowercase, one number and one special char',
			v => v.length >= 8 || 'Password must be at least 8 characters long'
		]
	}),
	async created () {
		try {
			const token = localStorage.getItem('token')
			const url = `${process.env.URL}/auth/isloggedin`
			const headers = { 'x-auth-token': token }
			const res = await this.$http.get(url, { headers })
			if (!res.body.msg) this.$router.push('/')
		} catch (err) {
			console.log('Got error here -->', err)
		}
	},
	methods: {
		...utility,
		...mapActions(['login']),
		async log () {
			try {
				const url = `${process.env.URL}/auth/login`
				const auth = {
					username: this.username,
					password: this.password
				}
				const res = await this.$http.post(url, auth)
				if (res.body.msg) {
					this.showAlert('red', res.body.msg, this)
				}
				else 
				{
					const user = res.body
					if (user.id) {
						if (user.birthdate)
							user.birthdate = new Date(user.birthdate)
								.toISOString()
								.substr(0, 10)
						this.login(user)
						this.updateLocation()
						this.$router.push('/')
					}
				}
			} catch (err) {
				console.error(err)
			}
		}
	}
}
</script>

<style>
.alert-enter-active, .alert-leave-active, .register {
	transition: all .5s;
}

.alert-enter, .alert-leave-to {
	opacity: 0;
}

.login, .alert {
	width: 100%;
	max-width: 40rem;
	margin: auto;
}

.alert {
	position: absolute;
	left: 50%;
	top: 1rem;
	transform: translateX(-50%);
}

.google {
	text-decoration: none;
}
</style>
