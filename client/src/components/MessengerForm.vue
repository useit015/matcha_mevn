<template>
	<v-layout v-if="selectedConvo" align-center justify center row class="messenger_form px-3 chat_layout">
		<v-textarea rows="2" solo flat outline class="ma-4" append-icon="send" @click:append="sendMsg" label="Type a message..." v-model="msg" @keyup.13="sendMsg"></v-textarea>
	</v-layout>
	<p v-else>Get matches to start chating with sexy girls or boys or both</p>
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
			if (this.msg && this.msg.trim() && !e.shiftKey) {
				try {
					const url = `http://134.209.195.36/api/chat/send`
					const data = {
						id_conversation: this.selectedConvo,
						id_from: this.user.id,
						id_to: this.toId,
						message: this.msg
							.trim()
							.escapeHtml()
							.slice(0, 2048)
					}
					this.msg = ''
					this.$emit('msgSent', data)
					this.$socket.emit('chat', data)
					const result = await this.$http.post(url, data)
					console.log('i sent the msg and got this --> ', result)
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
