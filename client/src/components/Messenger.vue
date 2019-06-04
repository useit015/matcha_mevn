<template>
	<v-container fluid class="Messenger pa-0">
		<v-layout class="chat_layout">
			<v-flex xs3 class="list">
				<MessengerList :convos="convos"/>
			</v-flex>
			<v-flex>
				<v-layout column class="chat_layout">
					<v-flex xs10>
						<MessengerChat :username="username" :profile_image="profile_image"/>
					</v-flex>
					<v-flex xs2>
						<MessengerForm/>
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
				this.convos = result.body
				if (this.convos.length)
					this.$store.dispatch('syncConvo', this.convos[0])
			}
		}
	}
}
</script>

<style>
	.Messenger, .list, .chat_layout {
		width: 100%;
		height: 100%;
	}
</style>
