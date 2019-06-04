<template>
	<v-layout align-center justify center row class="messenger_form px-3">
		<v-text-field class="ma-4"  label="message" v-model="msg"></v-text-field>
		<v-btn color="primary" class="ma-4" outline large @click="sendMsg">Send</v-btn>
	</v-layout>
</template>

<script>
export default {
	name: 'MessengerForm',
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
		}
	}
}
</script>

<style>

</style>
