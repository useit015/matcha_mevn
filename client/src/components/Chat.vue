<template>
	<v-container>
		<v-layout row>
			<v-text-field class="ma-4"  label="message" v-model="msg"></v-text-field>
			<v-btn color="primary" class="ma-4" outline large @click="sendMsg">Send</v-btn>
		</v-layout>
	</v-container>
</template>

<script>
export default {
	name: 'Chat',
	data: () => ({
		msg: null
	}),
	methods: {
		sendMsg () {
			const data = {
				from: this.$store.getters.user.id,
				to: Number(this.$route.params.id),
				msg: this.msg,
				time: new Date()
			}
			this.$socket.emit('chat', data)
			console.log('data sent --> ', data)
		}
	}
}
</script>

<style>

</style>
