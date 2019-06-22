<template>
<v-container class="mt-4">
	<transition name="alert">
		<v-alert v-if="userFailed" :value="true" dismissible type="error" color="error" icon="warning" transition="scale-transition" class="alert">
			Oups .. something went wrong !
		</v-alert>
		<v-alert v-if="userAdded" :value="true" dismissible type="success" color="success" icon="check_circle" transition="scale-transition" class="alert">
			You have been successfully registered, please verify your email
		</v-alert>
	</transition>
	<div class="register mt-5">
		<h1 class="page-header display-3 mb-4 font-weight-light grey--text">Register</h1>
		<v-form v-model="valid" class="my-4">
			<v-text-field color="primary" class="my-3" validate-on-blur v-model="firstname" :rules="rules.name" label="First name" required ></v-text-field>
			<v-text-field color="primary" class="my-3" validate-on-blur v-model="lastname" :rules="rules.name" label="Last name" required ></v-text-field>
			<v-text-field color="primary" class="my-3" validate-on-blur v-model="username" :rules="rules.username" :counter="10" label="Username" required ></v-text-field>
			<v-text-field color="primary" class="my-3" validate-on-blur v-model="email" :rules="rules.email" label="E-mail" required ></v-text-field>
			<v-text-field color="primary" class="my-3" validate-on-blur v-model="password" :counter="12" :rules="rules.password" label="Password" required :append-icon="showPass ? 'visibility' : 'visibility_off'" :type="showPass ? 'text' : 'password'" @click:append="showPass = !showPass"></v-text-field>
			<v-text-field @keyup.13="registerUser" color="primary" class="my-3" validate-on-blur v-model="passwordConfirm" :counter="12" label="Confirm Password" required :append-icon="showConfPass ? 'visibility' : 'visibility_off'" :type="showConfPass ? 'text' : 'password'" @click:append="showConfPass = !showConfPass" :error-messages="passwordMatch()"></v-text-field>
			<v-btn block large depressed color="primary" @click="registerUser" :disabled="!valid" class="mt-5 white--text">Submit</v-btn>
			<v-layout row justify-end>
				<v-btn flat color="primary" dark to="/login">Have an account? Login</v-btn>
			</v-layout>
		</v-form>
	</div>
</v-container>
</template>

<script>
import utility from '../utility.js'

export default {
	name: 'Register',
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
		userAdded: false,
		userFailed: false,
		rules: {
			name: [
				v => !!v || 'This field is required'
			],
			username: [
				v => !!v || 'This field is required',
				v => v.length >= 8 || 'Username must be at least 8 characters long'
			],
			email: [
				v => !!v || 'This field is required',
				v => /.+@.+/.test(v) || 'E-mail must be valid'
			],
			password: [
				v => !!v || 'This field is required',
				v => /^(?=.*\d)(?=.*[A-Za-z])[0-9A-Za-z!@#$%]+$/.test(v) || 'Password must contain at least one letter, one number and one special char',
				v => v.length >= 8 || 'Password must be at least 8 characters long'
			]
		}
	}),
	methods: {
		...utility,
		async registerUser (e) {
			e.preventDefault()
			try {
				const url = 'http://134.209.195.36/api/users/add'
				const data = {
					first_name: this.firstname,
					last_name: this.lastname,
					username: this.username,
					email: this.email,
					password: this.password
				}
				const res = await this.$http.post(url, data)
				if (res.body) {
					this.userAdded = true
					setTimeout(() => this.userAdded = false, 5000)
				} else {
					this.userAdded = false
					this.userFailed = true
					setTimeout(() => this.userFailed = false, 5000)
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
