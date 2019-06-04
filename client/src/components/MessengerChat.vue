<template>
	<v-layout column class="pa-3">
		<v-flex v-for="msg in messages" :key="msg.id">
			<v-layout :class="msg.id_from == user.id ? 'from' : 'to'" align-start>
				<router-link :to="`/user/${msg.id_from}`">
					<v-avatar>
						<img :src="getFullPath(msg.id_from == user.id ? profileImage : imageConvo)" :alt="usernameConvo">
					</v-avatar>
				</router-link>
				<div class="bubble mx-3 green white--text">
					{{ msg.message }}
				</div>
			</v-layout>
		</v-flex>
	</v-layout>
</template>

<script>
import { mapGetters } from 'vuex'
import utility from '../utility.js'

export default {
	name: 'MessengerChat',
	props: {
		username: {
			type: String,
			default: 'No one'
		},
		profile_image: {
			type: String,
			default: 'http://134.209.195.36/uploads/default.jpg'
		}
	},
	data: () => ({
		messages: []
	}),
	computed: {
		...mapGetters(['user', 'selectedConvo', 'profileImage', 'imageConvo', 'usernameConvo'])
	},
	watch: {
		selectedConvo: {
			immediate: true,
			async handler () {
				if (this.selectedConvo) {
					const result = await this.$http.get(`http://134.209.195.36/api/chat/single/${this.selectedConvo}`)
					this.messages = result.body
				}
			}
		}
	},
	methods: {
		...utility
	}
}
</script>

<style>
	.layout.from, .layout.to {
		padding: 1rem;
	}

	.layout.from {
		flex-direction: row-reverse;
	}

	.bubble {
		border-radius: 1.5rem;
		max-width: 70%;
		font-size: 1.1em;
		letter-spacing: .7px;
		padding: .75rem 1.2rem;
	}
</style>
