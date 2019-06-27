<template>
<v-layout v-if="selectedConvo" column class="chat_container">
	<v-img v-if="!limit && selectedConvo" class="chat_load" :src="loadGif"></v-img>
	<v-flex v-for="(msg, i) in messages" :key="i + key">
		<h3 class="date_spacer subheading mb-2 mt-4" v-if="newConvo(msg, i)">{{ formatTime(msg.created_at) }}</h3>
		<v-layout :class="layoutClass(msg, i)" align-start>
			<v-tooltip lazy z-index="2" left>
				<template v-slot:activator="{ on }">
					<router-link :to="`/user/${msg.id_from}`" v-if="showAvatar(msg, i)" :class="avatarClass(msg, i)">
						<v-avatar size="40">
							<img v-on="on" :src="getFullPath(imageConvo)" :alt="usernameConvo">
						</v-avatar>
					</router-link>
				</template>
				<span>{{ usernameConvo }}</span>
			</v-tooltip>
			<div :class="pushClass(msg, i)"></div>
			<v-avatar size="20" v-if="seen(msg, i)" class="mt-2">
				<img :src="getFullPath(imageConvo)" :alt="usernameConvo">
			</v-avatar>
			<v-tooltip lazy z-index="2" :left="msg.id_from == user.id" :right="msg.id_from != user.id">
				<template v-slot:activator="{ on }">
					<div :class="bubbleClass(msg)" v-on="on">{{msg.message}}</div>
				</template>
				<span>{{ formatTime(msg.created_at) }}</span>
			</v-tooltip>
		</v-layout>
	</v-flex>
	<v-flex v-if="typing">
		<v-layout class="to py-0 px-2 top_msg bottom_msg" align-start>
			<router-link to="/" class="pull_up_single">
				<v-avatar size="40">
					<img :src="getFullPath(imageConvo)" :alt="usernameConvo">
				</v-avatar>
			</router-link>
			<div class="mx-2 chat_bubble grey lighten-3">
				<div class="typing">
					<div class="typing_point"></div>
					<div class="typing_point"></div>
					<div class="typing_point"></div>
				</div>
			</div>
		</v-layout>
	</v-flex>
</v-layout>
<h2 v-else class="display-2 text-xs-center text-md-left font-weight-thin pt-4 pb-3 mb-4 hidden-sm-and-down grey--text" >Get matched to start chatting with other users</h2>
</template>

<script>
import moment from 'moment'
import utility from '../utility.js'
import { mapGetters, mapActions } from 'vuex'

export default {
	name: 'MessengerChat',
	data: () => ({
		key: 0,
		messages: [],
		page:0,
		timer: {},
		limit: false,
		loadGif: 'https://i.giphy.com/media/uyCJt0OOhJBiE/giphy.webp'
	}),
	computed: {
		...mapGetters([
			'user',
			'typingSec',
			'seenConvo',
			'newMessage',
			'imageConvo',
			'idUserConvo',
			'profileImage',
			'selectedConvo',
			'usernameConvo'
		]),
		typing () {
			return this.typingSec.status && this.typingSec.convos.find(cur => cur.id_conversation == this.selectedConvo)
		}
	},
	watch: {
		selectedConvo: {
			immediate: true,
			async handler () {
				if (this.selectedConvo) {
					this.page = 0
					this.limit = false
					try {
						const result = await this.getChat()
						this.checkLimit(result.body)
						this.messages = result.body
						this.syncNotif()
						this.$socket.emit('seenConvo', {
							user: this.idUserConvo,
							convo: this.selectedConvo,
						})
					} catch (err) {
						console.log('Got error here --> ', err)
					}
				}
			}
		},
		messages () {
			if (this.page < 2) this.$nextTick(this.scroll)
		},
		newMessage () {
			if (this.newMessage && this.selectedConvo == this.newMessage.id_conversation) {
				this.messages.push(this.newMessage)
				this.messageClr()
			}
		},
		typing () {
			if (this.typing) {
				this.$nextTick(this.scroll)
			}
		},
		seenConvo () {
			if (this.seenConvo) {
				this.messages.forEach((cur, i) => {
					if (cur.id_from == this.user.id && !cur.is_read) {
						this.messages[i].is_read = 1
						this.key++ // ? To Force reRender the messages
					}
				})
				this.seenConvoClr()
			}
		}
	},
	created () {
		this.$nextTick(() => {
			const top = document.querySelector('.top_chat')
			top.addEventListener('scroll', async e => {
				if (!this.limit && top.scrollTop <= 10) {
					const result = await this.getChat()
					this.checkLimit(result.body)
					this.messages = [...result.body, ...this.messages]
					top.scrollTop = 150
				}
			})
		})
	},
	methods: {
		...utility,
		...mapActions([
			'syncNotif',
			'messageClr',
			'seenConvoClr',
			'typingSecClr'
		]),
		checkLimit (res) {
			if (res.length < 50) {
				this.limit = true
			} else {
				this.page++
			}
		},
		msgSent (msg) {
			this.messages.push(msg)
		},
		first (msg, i) {
			if (!i) return true
			return this.messages[i - 1].id_from != msg.id_from
		},
		last (msg, i) {
			if (this.messages.length - 1 == i) return true
			return this.messages[i + 1].id_from != msg.id_from
		},
		seen (msg, i) {
			if (msg.id_from == this.user.id && msg.is_read) {
				while (++i < this.messages.length) {
					if (this.messages[i].id_from == this.user.id && this.messages[i].is_read) {
						return false
					}
				}
				return true
			} else {
				return false
			}
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
				msg.id_from != this.user.id ? 'grey lighten-3' : 'primary white--text'
			].join(' ')
		},
		pushClass (msg, i) {
			if (!this.last(msg, i) && msg.id_from != this.user.id) {
				return 'push_left'
			} else if (!this.seen(msg, i) && msg.id_from == this.user.id) {
				return 'push_right'
			} else {
				return 'd-none'
			}
		},
		showAvatar (msg, i) {
			return this.last(msg, i) && msg.id_from != this.user.id
		},
		avatarClass (msg, i) {
			return this.last(msg, i) && !this.first(msg, i) ? 'pull_up' : 'pull_up_single'
		},
		newConvo (msg, i) {
			if (!i) return true
			return moment(msg.created_at).diff(this.messages[i - 1].created_at, 'minutes', true) > 60
		},
		scroll () {
			const top = document.querySelector('.top_chat')
			top.scrollTop = top.scrollHeight - top.clientHeight
		},
		async getChat () {
			try {
				const url = `${process.env.URL}/api/chat/single`
				const headers = { 'x-auth-token': this.user.token }
				const data = {
					id: this.selectedConvo,
					page: this.page,
				}
				const result = await this.$http.post(url, data, { headers })
				return result
			} catch (err) {
				console.log('Got error here --> ', err)
			}
		}
	}
}
</script>

<style>
.chat_container {
	overflow-x: hidden;
}

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
	overflow-x: hidden;
	white-space: pre-wrap;
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

.push_left {
	width: 40px;
}

.push_right {
	width: 20px;
}

.pull_up {
	margin-top: -5px;
}

.pull_up_single {
	margin-top: -2px;
}

.chat_load {
	width: 2.5rem;
	height: 2.5rem;
	margin: 0 auto;
}

.date_spacer {
	color: #777;
	font-size: 1.1em !important;
	text-align: center;
}
</style>
