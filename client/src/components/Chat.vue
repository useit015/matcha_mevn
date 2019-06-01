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
			this.$socket.emit('chat', {
				from: this.$store.getters.user.id,
				to: Number(this.$route.params.id),
				msg: this.msg
			})
			console.log('data sent -->', {
				to: this.$route.params.id,
				msg: this.msg
			})
		}
	}
}
</script>

<style>

</style>
