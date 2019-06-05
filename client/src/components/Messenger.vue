<template>
	<v-container fluid grid-list-md class="messenger pa-3">
		<v-layout row wrap class="parent">
			<v-flex xs3 class="left">
				<MessengerList :convos="convos"/>
			</v-flex>
			<v-flex xs9 class="right">
				<v-layout column class="chat_layout">
					<v-flex xs9 class="top">
						<MessengerChat ref="chat"/>
					</v-flex>
					<v-flex xs3 class="bottom">
						<MessengerForm @msgSent="messageSent" :toId="getToId()"/>
					</v-flex>
				</v-layout>
			</v-flex>
		</v-layout>
	</v-container>
</template>

<script>
import MessengerList from './MessengerList'
import MessengerChat from './MessengerChat'
import MessengerForm from './MessengerForm'
import { mapGetters } from 'vuex'

export default {
	name: 'Messenger',
	components: {
		MessengerList,
		MessengerChat,
		MessengerForm
	},
	data: () => ({
		convos: []
	}),
	computed: {
		...mapGetters(['user', 'selectedConvo']),
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
				const result = await this.$http.post('http://134.209.195.36/api/chat/all', { id: this.user.id })
				console.log(result.body)
				this.convos = result.body.sort((a, b) => {
					return new Date(b.last_update) - new Date(a.last_update)
				})
				console.log(this.convos)
				if (this.convos.length)
					this.$store.dispatch('syncConvo', this.convos[0])
				console.log('this is what i got --> ', result)
			}
		}
	},
	methods: {
		messageSent (msg) {
			this.$refs.chat.msgSent(msg)
		},
		getToId () {
			for (const cur of this.convos) {
				console.log('i am testing this --> ', cur)
				if (cur.id_conversation == this.selectedConvo) {
					return cur.user_id
				}
			}
		}
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

.top {
	flex: 1 0 90% !important;
	overflow-y: scroll;
}

.bottom {
	flex: 0 0 10% !important;
}

/* .chat_layout {
	height: 70vh;
} */
</style>
