<template>
<v-container class="forgot mt-5">
	<h1 class="page-header display-3 font-weight-light grey--text">Recover password</h1>
	<p class="subheading grey--text mt-3">Please provide your email adresse in order to change your password</p>
	<v-layout row align-baseline>
		<v-text-field @keyup.13="recover" color="primary" outline solo class="my-5" v-model="email" label="Email" required ></v-text-field>
		<v-btn large outline color="primary" dark @click.prevent="recover" class="ml-0 py-3 send_btn">Send</v-btn>
	</v-layout>
	<alert :data="alert"></alert>
</v-container>
</template>

<script>
import Alert from './Alert'

export default {
	name: 'Forgot',
	components: { Alert },
	data: () => ({
		email: null,
		valid: false,
		alert: {
			state: false,
			color: '',
			text: ''
		}
	}),
	methods: {
		async recover (e) {
			e.preventDefault()
			const email = this.email
			if (email && email.length && /.+@.+/.test(email)) {
				const url = `${process.env.URL}/auth/forgot`
				const res = await this.$http.post(url, { email })
				this.email = ''
				if (res.body.ok) {
					this.showAlert('green', 'Please check your email ..', this)
				} else {
					this.showAlert('red', 'Ouups something went wrong!', this)
				}
			} else {
				this.showAlert('red', 'Please provide a valid email', this)
			}
		}
	}
}
</script>

<style>
.v-text-field--outline.v-text-field--single-line input {
	 margin-top: 0 !important;
}
.v-text-field.v-text-field--solo:not(.v-text-field--solo-flat)>.v-input__control>.v-input__slot,
.theme--light.v-text-field--outline:not(.v-input--is-focused):not(.v-input--has-state)>.v-input__control>.v-input__slot:hover {
	box-shadow: none;
	border: 1px solid var(--color-primary);
}
.send_btn {
	height: 56px;
	margin-left: -1px !important;
}
</style>
