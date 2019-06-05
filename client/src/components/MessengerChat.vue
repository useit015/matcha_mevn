<template>
	<v-layout column class="pa-3 main_chat">
		<v-flex v-for="(msg, i) in messages" :key="msg.id">
			<v-layout :class="`${msg.id_from == user.id ? 'from' : 'to'} pt-0`" align-start>
				<router-link :to="`/user/${msg.id_from}`" v-if="first(msg, i)">
					<v-avatar size="35">
						<img :src="getFullPath(msg.id_from == user.id ? profileImage : imageConvo)" :alt="usernameConvo">
					</v-avatar>
				</router-link>
				<div class="push" v-else></div>
				<div :class="`bubble mx-2 green white--text ${first(msg, i) ? 'round_top' : ''} ${last(msg, i) ? 'round_bottom' : ''}`" >
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
	data: () => ({
		messages: []
	}),
	computed: mapGetters(['user', 'selectedConvo', 'profileImage', 'imageConvo', 'newMessage', 'usernameConvo']),
	watch: {
		selectedConvo: {
			immediate: true,
			async handler () {
				if (this.selectedConvo) {
					const result = await this.$http.get(`http://134.209.195.36/api/chat/single/${this.selectedConvo}`)
					this.messages = result.body
				}
			}
		},
		async messages () {
			setTimeout(() => {
				const top = document.querySelector('.top')
				top.scrollTop = top.scrollHeight - top.clientHeight
			}, 0);
		},
		newMessage: {
			immediate: true,
			handler () {
				if (this.newMessage && this.selectedConvo == this.newMessage.id_conversation) {
					this.messages.push(this.newMessage)
					this.$store.dispatch('messageClr')
				}
			}
		}
	},
	methods: {
		...utility,
		msgSent (msg) {
			this.messages.push(msg)
		},
		first (msg, i) {
			if (!i) return true
			return (this.messages[i - 1].id_from != msg.id_from)
		},
		last (msg, i) {
			if (this.messages.length - 1 == i) return true
			return (this.messages[i + 1].id_from != msg.id_from)
		}
	}
}
</script>

<style>
.layout.from, .layout.to {
	padding: .3rem;
}

.layout.from {
	flex-direction: row-reverse;
}

.bubble {
	max-width: 70%;
	font-size: .9em;
	letter-spacing: .7px;
	padding: .5rem 1rem;
}

.layout.from > .bubble {
	border-radius: 1.5rem .4rem .4rem 1.5rem;
}

.layout.from > .bubble.round_top {
	border-radius: 1.5rem 1.5rem .4rem 1.5rem;
}

.layout.from > .bubble.round_bottom {
	border-radius: 1.5rem .4rem 1.5rem 1.5rem;
}

.layout.to > .bubble {
	border-radius: .4rem 1.5rem 1.5rem .4rem;
}

.layout.to > .bubble.round_top {
	border-radius: 1.5rem 1.5rem 1.5rem .4rem;
}

.layout.to > .bubble.round_bottom {
	border-radius: .4rem 1.5rem 1.5rem 1.5rem;
}

.bubble.round_bottom.round_top {
	border-radius: 1.5rem !important;
}

.push {
	width: 35px;
}

</style>
