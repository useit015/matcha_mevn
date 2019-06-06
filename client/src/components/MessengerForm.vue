<template>
	<v-layout align-center justify center row class="messenger_form px-3 chat_layout">
		<v-text-field class="ma-4"  label="message" v-model="msg"></v-text-field>
		<v-btn color="primary" class="ma-4" outline large @click="sendMsg">Send</v-btn>
	</v-layout>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
	name: 'MessengerForm',
	props: {
		toId: {
			type: Number,
			default: -1
		}
	},
	data: () => ({
		msg: null
	}),
	methods: {
		async sendMsg () {
			try {
				const url = `http://134.209.195.36/api/chat/send`
				const data = {
					id_conversation: this.selectedConvo,
					id_from: this.user.id,
					id_to: this.toId,
					message: this.msg
				}
				this.$socket.emit('chat', data)
				const result = await this.$http.post(url, data)
				this.$emit('msgSent', data)
				this.msg = ''
				console.log('i sent the message', result)
			} catch (err) {
				console.error(err)
			}
		}
	},
	computed: {
		...mapGetters(['user', 'selectedConvo'])
	},
}
</script>
