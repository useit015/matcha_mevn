<template>
	<v-layout column class="pa-3">
		<v-flex v-for="(msg, i) in messages" :key="msg.id">
			<v-layout :class="layoutClass(msg, i)" align-start>
				<v-tooltip lazy z-index="2" left>
					<template v-slot:activator="{ on }">
						<router-link :to="`/user/${msg.id_from}`" v-if="showAvatar(msg, i)" :class="avatarClass(msg, i)">
							<v-avatar size="40">
								<img v-on="on" :src="avatarSrc(msg)" :alt="usernameConvo">
							</v-avatar>
						</router-link>
					</template>
					<span>{{ usernameConvo }}</span>
				</v-tooltip>
				<div class="push" v-if="push(msg, i)"></div>
				<v-tooltip lazy z-index="2" :left="msg.id_from == user.id" :right="msg.id_from != user.id">
					<template v-slot:activator="{ on }">
						<div :class="bubbleClass(msg)" v-on="on">
							{{ msg.message }}
						</div>
					</template>
					<span>{{ formatTime(msg.created_at) }}</span>
				</v-tooltip>
			</v-layout>
		</v-flex>
	</v-layout>
</template>

<script>
import { mapGetters } from 'vuex'
import moment from 'moment'
import utility from '../utility.js'

export default {
	name: 'MessengerChat',
	data: () => ({ messages: [] }),
	computed: mapGetters([
		'user',
		'selectedConvo',
		'profileImage',
		'imageConvo',
		'newMessage',
		'usernameConvo'
	]),
	watch: {
		selectedConvo: {
			immediate: true,
			async handler () {
				if (this.selectedConvo) {
					try {
						const url = `http://134.209.195.36/api/chat/single/${this.selectedConvo}`
						const result = await this.$http.get(url)
						this.messages = result.body
					} catch (err) {
						console.error(err)
					}
				}
			}
		},
		newMessage: {
			immediate: true,
			handler () {
				if (this.newMessage && this.selectedConvo == this.newMessage.id_conversation) {
					this.messages.push(this.newMessage)
					this.$store.dispatch('messageClr')
				}
			}
		},
		async messages () {
			setTimeout(() => {
				const top = document.querySelector('.top')
				top.scrollTop = top.scrollHeight - top.clientHeight
			},
			0);
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
		},
		layoutClass (msg, i) {
			return [
				msg.id_from == this.user.id ? 'from' : 'to',
				this.first(msg, i) ? 'top_msg' : '',
				this.last(msg, i) ? 'bottom_msg' : '',
				'py-0',
				'px-2'
			].join(' ')
		},
		bubbleClass (msg) {
			return [
				'mx-2',
				'chat_bubble',
				msg.id_from != this.user.id ? 'grey lighten-3' : 'blue lighten-1 white--text'
			].join(' ')
		},
		showAvatar (msg, i) {
			return this.last(msg, i) && msg.id_from != this.user.id
		},
		avatarClass (msg, i) {
			return this.last(msg, i) && !this.first(msg, i) ? 'pull_up' : 'pull_up_single'
		},
		avatarSrc (msg) {
			return this.getFullPath(msg.id_from == this.user.id ? this.profileImage : this.imageConvo)
		},
		push (msg, i) {
			return !this.last(msg, i) && msg.id_from != this.user.id
		}
	}
}
</script>

<style>
.layout.from {
	flex-direction: row-reverse;
}

.chat_bubble {
	box-sizing: border-box;
	max-width: 70%;
	font-size: .95em;
	letter-spacing: .75px;
	padding: .6rem 1rem;
	margin-bottom: .2rem;
}

.chat_bubble.grey, .chat_bubble.blue {
	border: .5px solid rgba(0, 0, 0, .05);
	border-color: rgba(0, 0, 0, .05) !important;

}

.layout.from > .chat_bubble {
	border-radius: 1.5rem 4px 4px 1.5rem;
}

.layout.to > .chat_bubble {
	border-radius: 4px 1.5rem 1.5rem 4px;
}

.layout.from.top_msg > .chat_bubble {
	border-radius: 1.5rem 1.5rem 4px 1.5rem;
}

.layout.to.top_msg > .chat_bubble {
	border-radius: 1.5rem 1.5rem 1.5rem 4px;
}

.layout.from.bottom_msg > .chat_bubble {
	border-radius: 1.5rem 4px 1.5rem 1.5rem;
}

.layout.to.bottom_msg > .chat_bubble {
	border-radius: 4px 1.5rem 1.5rem 1.5rem;
}

.bottom_msg {
	margin-bottom: 1rem !important;
}

.top_msg.bottom_msg > .chat_bubble {
	border-radius: 1.5rem !important;
}

.push {
	width: 40px;
}

.pull_up {
	margin-top: -5px;
}

.pull_up_single {
	margin-top: -2px;
}
</style>
