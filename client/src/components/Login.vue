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
		<div class="login mt-5">
			<h1 class="page-header display-3 font-weight-light grey--text">Login</h1>
			<v-form v-model="valid" class="my-4">
				<v-text-field color="primary" class="my-5" v-model="username" validate-on-blur :rules="usernameRules" label="Username" required ></v-text-field>
				<v-text-field color="primary" class="my-5" v-model="password" validate-on-blur :rules="passRules" label="Password" required :append-icon="showPass ? 'visibility' : 'visibility_off'" :type="showPass ? 'text' : 'password'" @click:append="showPass = !showPass"></v-text-field>
				<v-btn block large depressed color="primary" dark @click.prevent="login" class="mt-5">Login</v-btn>
				<v-layout row justify-end>
					<v-btn flat color="primary" dark to="/register">Don't have an account? Sign up</v-btn>
				</v-layout>
			</v-form>
		</div>
	</v-container>
</template>

<script>
export default {
	name: 'Login',
	data: () => ({
		valid: false,
		showPass: false,
		username: '',
		password: '',
		userAdded: false,
		userFailed: false,
		nameRules: [
			v => !!v || 'This field is required'
		],
		usernameRules: [
			v => !!v || 'This field is required',
			v => v.length >= 8 || 'Username must be at least 8 characters long'
		],
		emailRules: [
			v => !!v || 'This field is required',
			v => /.+@.+/.test(v) || 'E-mail must be valid'
		],
		passRules: [
			v => !!v || 'This field is required',
			v => /^(?=.*\d)(?=.*[A-Za-z])[0-9A-Za-z!@#$%]+$/.test(v) || 'Password must contain at least one letter, one number and one special char',
			v => v.length >= 8 || 'Password must be at least 8 characters long'
		]
	}),
	methods: {
		login() {
			this.$http.post('http://134.209.195.36/api/users/login', {
				username: this.username,
				password: this.password
			}).then(res => {
				const user = res.body
				if (user.tokenExpiration && Date.parse(user.tokenExpiration) >= Date.now()) {
					user.birthdate = new Date(user.birthdate).toISOString().substr(0, 10)
					this.$store.dispatch('login', user)
					this.$router.push('/')
				}
			}).catch(err => console.error(err))
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
</style>
