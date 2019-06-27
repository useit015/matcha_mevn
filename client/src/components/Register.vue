<template>
<v-container class="mt-4">
	<div class="register mt-5">
		<h1 class="page-header display-3 mb-4 font-weight-light grey--text">Register</h1>
		<v-form v-model="valid" class="my-4">
			<v-text-field color="primary" class="my-3" validate-on-blur v-model="firstname" :rules="rules.name" label="First name" required ></v-text-field>
			<v-text-field color="primary" class="my-3" validate-on-blur v-model="lastname" :rules="rules.name" label="Last name" required ></v-text-field>
			<v-text-field color="primary" class="my-3" validate-on-blur v-model="username" :rules="rules.username" :counter="25" label="Username" required ></v-text-field>
			<v-text-field color="primary" class="my-3" validate-on-blur v-model="email" :rules="rules.email" label="E-mail" required ></v-text-field>
			<v-text-field color="primary" class="my-3" validate-on-blur v-model="password" :rules="rules.password" label="Password" required :append-icon="showPass ? 'visibility' : 'visibility_off'" :type="showPass ? 'text' : 'password'" @click:append="showPass = !showPass"></v-text-field>
			<v-text-field @keyup.13="registerUser" color="primary" class="my-3" validate-on-blur v-model="passwordConfirm" label="Confirm Password" required :append-icon="showConfPass ? 'visibility' : 'visibility_off'" :type="showConfPass ? 'text' : 'password'" @click:append="showConfPass = !showConfPass" :error-messages="passwordMatch()"></v-text-field>
			<v-btn block large depressed color="primary" @click="registerUser" :disabled="!valid" class="mt-5 white--text">Submit</v-btn>
			<v-layout row justify-end>
				<v-btn flat color="primary" dark to="/login">Have an account? Login</v-btn>
			</v-layout>
		</v-form>
	</div>
	<alert :data="alert"></alert>
</v-container>
</template>

<script>
import Alert from './Alert'
import utility from '../utility.js'

export default {
	name: 'Register',
	components: {
		Alert
	},
	data: () => ({
		firstname: '',
		lastname: '',
		username: '',
		password: '',
		passwordConfirm: '',
		email: '',
		valid: false,
		showPass: false,
		showConfPass: false,
		alert: {
			state: false,
			color: '',
			text: ''
		},
		rules: {
			name: [
				v => !!v || 'This field is required',
				v => !(/[^a-zA-Z \-]+/.test(v)) || 'Name can contain only letters',
				v => (v.length >= 3 && v.length <= 255 ) || 'Name must be at least 3 characters long',
			],
			username: [
				v => !!v || 'This field is required',
				v => (v.length >= 8 && v.length <= 25 ) || 'Username must be between 8 and 25 characters long',
				v => !(/[^a-zA-Z0-9]+/.test(v)) || 'Username can contain only letters and numbers'
			],
			email: [
				v => !!v || 'This field is required',
				v => /.+@.+/.test(v) || 'E-mail must be valid'
			],
			password: [
				v => !!v || 'This field is required',
				v => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(v) || 'Password must contain at least one uppercase, one lowercase, one number and one special char',
				v => v.length >= 8 || 'Password must be at least 8 characters long'
			]
		}
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
		async registerUser (e) {
			e.preventDefault()
			try {
				const url = `${process.env.URL}/api/users/add`
				const data = {
					first_name: this.firstname,
					last_name: this.lastname,
					username: this.username,
					email: this.email,
					password: this.password
				}
				const res = await this.$http.post(url, data)
				if (res.body.ok) {
					this.showAlert('green', res.body.status, this)
				} else {
					this.showAlert('red', res.body.msg, this)
				}
			} catch (err) {
				console.error(err)
			}
		},
		passwordMatch () {
			return this.passMatch(this.passwordConfirm, this.password)
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
.register, .alert {
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
</style>
