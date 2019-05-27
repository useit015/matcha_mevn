<template>
	<v-container>
		<v-layout>
			<v-text-field v-model="users"></v-text-field>
			<v-btn color="primary" outline large @click="install">Install</v-btn>
		</v-layout>
	</v-container>
</template>

<script>
import countries from '../nats.json'

export default {
	data () {
		return {
			users: 1,
			nats: countries
		}
	},
	methods: {
		install () {
			this.$http.get(`https://randomuser.me/api/?results=${this.users}`)
			.then(res => {
				console.log(res.body.results)
				res.body.results.forEach(cur => {
					this.$http.post('http://134.209.195.36/api/users/install', {
						first_name: cur.name.first,
						last_name: cur.name.last,
						username: cur.login.username,
						email: cur.email,
						password: '123456abc',
						gender: cur.gender,
						looking: cur.gender == 'female' ? 'male' : 'female',
						birthdate: cur.dob.date.slice(0, 10),
						biography: '',
						tags: '',
						address: cur.location.street,
						city: cur.location.city,
						country: this.nats[cur.nat].toLowerCase(),
						postal_code: cur.location.postcode,
						phone: cur.cell,
						image: cur.picture.large,
						rating: Math.random() * 5,
						lat: cur.location.coordinates.latitude,
						lng: cur.location.coordinates.longitude
					}).then(res => console.log(res))
					.catch(err => console.error(err))
				})
			}).catch(err => console.error(err))
		}
	}
}
</script>
