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
			nats: countries,
		}
	},
	methods: {
		async install () {
			try {
				const url = `https://randomuser.me/api/?results=${this.users}`
				const res = await this.$http.get(url)
				res.body.results.forEach(async cur => {
					const url = 'http://134.209.195.36/api/users/install'
					const data = {
						first_name: cur.name.first,
						last_name: cur.name.last,
						username: cur.login.username,
						email: cur.email,
						password: '123456abc',
						gender: cur.gender,
						looking: ['both', 'female', 'male'][Math.floor(Math.random() * 3)],
						birthdate: cur.dob.date.slice(0, 10),
						biography: '',
						tags: '',
						address: cur.location.street,
						city: cur.location.city,
						country: this.nats[cur.nat].toLowerCase(),
						postal_code: cur.location.postcode,
						phone: cur.cell,
						image: cur.picture.large,
						lat: cur.location.coordinates.latitude,
						lng: cur.location.coordinates.longitude
					}
					const res = await this.$http.post(url, data)
				})
			} catch (err) {
				console.error(err)
			}
		}
	}
}
</script>
