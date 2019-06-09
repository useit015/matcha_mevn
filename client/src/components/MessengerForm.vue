<template>
	<v-layout align-center justify center row class="messenger_form px-3 chat_layout">
		<v-text-field solo flat outline class="ma-4" append-icon="send" @click:append="sendMsg" label="Type a message..." v-model="msg" @keyup.13="sendMsg"></v-text-field>
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
	data: () => ({ msg: null }),
	computed: mapGetters(['user', 'selectedConvo']),
	watch: {
		msg () {
			if (this.msg.length) {
				const data = {
					id_conversation: this.selectedConvo,
					id_from: this.user.id,
					id_to: this.toId
				}
				this.$socket.emit('typing', data)
			}
		}
	},
	methods: {
		async sendMsg (e) {
			if (this.msg && !e.shiftKey) {
				try {
					const url = `http://134.209.195.36/api/chat/send`
					const data = {
						id_conversation: this.selectedConvo,
						id_from: this.user.id,
						id_to: this.toId,
						message: this.msg
					}
					this.msg = ''
					this.$emit('msgSent', data)
					this.$socket.emit('chat', data)
					const result = await this.$http.post(url, data)
				} catch (err) {
					console.error(err)
				}
			}
		}
	}
}
</script>

<style>
.v-text-field--outline.v-text-field--single-line input {
	margin-top: 0 !important;
}
</style>
