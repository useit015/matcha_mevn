<template>
<div>
	<v-container fluid grid-list-md class="messenger pa-3" v-if="loaded">
		<v-layout row wrap class="parent">
			<v-flex xs3 class="left">
				<MessengerList :convos="convos"/>
			</v-flex>
			<v-flex xs9 class="right">
				<v-layout column class="chat_layout">
					<v-flex xs9 class="top_chat">
						<MessengerChat ref="chat"/>
					</v-flex>
					<v-flex xs3 class="bottom">
						<MessengerForm @msgSent="messageSent" :toId="getToId()"/>
					</v-flex>
				</v-layout>
			</v-flex>
		</v-layout>
	</v-container>
	<loader v-else/>
</div>
</template>

<script>
import loader from './loader'
import MessengerList from './MessengerList'
import MessengerChat from './MessengerChat'
import MessengerForm from './MessengerForm'
import { mapGetters, mapActions } from 'vuex'

export default {
	name: 'Messenger',
	components: {
		loader,
		MessengerList,
		MessengerChat,
		MessengerForm
	},
	data: () => ({
		loaded: false
	}),
	computed: {
		...mapGetters([
			'user',
			'convos',
			'selectedConvo'
		]),
		username () {
			return this.convos.length ? this.convos[0].username : null
		},
		profile_image () {
			return this.convos.length ? this.convos[0].profile_image : null
		}
	},
	watch: {
		user: {
			immediate: true,
			async handler () {
				const token = this.user.token || localStorage.getItem('token')
				if (token) {
					try {
						const url = 'http://134.209.195.36/auth/isloggedin'
						const headers = { 'x-auth-token': token }
						const res = await this.$http.get(url, { headers })
						if (!res.body.msg) {
							this.loaded = true
							return
						}
					} catch (err) {
						console.log('Got error here --> ', err)
					}
				}
				this.logout(this.user.id)
				this.$router.push('/login')
			}
		},
		convos: {
			immediate: true,
			handler () {
				if (this.convos.length && !this.selectedConvo) {
					this.syncConvo(this.convos[0])
				}
			}
		}
	},
	methods: {
		...mapActions([
			'logout',
			'syncConvo',
			'syncConvoAll',
			'updateConvosOrder'
		]),
		messageSent (msg) {
			this.$refs.chat.msgSent(msg)
			this.updateConvosOrder(msg.id_conversation)
		},
		getToId () {
			for (const cur of this.convos) {
				if (cur.id_conversation == this.selectedConvo) {
					return cur.user_id
				}
			}
		}
	},
	beforeDestroy () {
		this.syncConvo(null)
	}
}
</script>

<style>
.messenger {
	overflow: hidden;
	height: calc(100vh - 4.75rem);
}

.parent, .chat_layout {
	height: 100%;
}

.top_chat {
	flex: 1 0 90% !important;
	overflow-y: scroll;
}

.bottom {
	flex: 0 0 10% !important;
}
</style>
