<template>
<v-layout v-if="selectedConvo" align-center justify center row class="messenger_form px-3 chat_layout">
	<v-textarea
		rows="1"
		solo 
		flat
		outline
		class="ma-4
		send_msg"
		append-icon="send"
		@click:append="sendMsg"
		label="Type a message..."
		v-model="msg"
		@keyup.13="sendMsg"
	></v-textarea>
</v-layout>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
	name: 'MessengerForm',
	props: {
		toId: {
			type: Number,
			default: -1
		}
	},
	data: () => ({ msg: null }),
	computed: mapGetters([
		'user',
		'selectedConvo'
	]),
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
		...mapActions(['updateConvos']),
		async sendMsg (e) {
			if (this.msg && this.msg.trim()) {
				if (!e.shiftKey) {
					try {
						const url = `${process.env.URL}/api/chat/send`
						const headers = { 'x-auth-token': this.user.token }
						const data = {
							id_conversation: this.selectedConvo,
							id_from: this.user.id,
							id_to: this.toId,
							message: this.msg
								.trim()
								.escapeHtml()
								.slice(0, 2048)
						}
						const result = await this.$http.post(url, data, { headers })
						if (result.body.ok){
							this.msg = ''
							this.updateConvos(data)
							this.$emit('msgSent', data)
							this.$socket.emit('chat', data)
						}
					} catch (err) {
						console.error(err)
					}
				}
			}
			else {
				this.msg = ''
			}
		}
	}
}
</script>

<style>
.v-text-field--outline.v-text-field--single-line input {
	margin-top: 0 !important;
}

.send_msg > .v-input__control > .v-input__slot > .v-text-field__slot > textarea {
	resize: none !important;
	overflow-y: hidden;
	margin-top: 5px;
}
</style>
