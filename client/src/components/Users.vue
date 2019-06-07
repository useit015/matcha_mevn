<template>
<v-container>
	<div class="users">
		<v-layout row wrap>
			<v-flex xs12 md6 class="py-2" v-for="user in users" :key="user.id">
				{{ user }}
			</v-flex>
		</v-layout>
	</div>
</v-container>
</template>

<script>
export default {
	name: 'Users',
	data: () => ({ users: [] }),
	async created () {
		const url = 'http://134.209.195.36/api/users/'
		const res = await this.$http.get(url, {
			headers: { 'x-auth-token': localStorage.getItem('token') }
		})
		this.users = res.body
	}
}
</script>
