<template>
<v-list subheader class="grey lighten-5">
	<v-subheader class="hidden-sm-and-down">Recent chat</v-subheader>
	<v-list-tile v-for="convo in convos" :key="convo.id_conversation" avatar @click="syncConvo(convo)">
		<v-layout justify-center align-center>
			<v-badge :value="!!unRead(convo)" overlap color="primary" class="mx-2" left>
				<template v-slot:badge>
					<span>{{ unRead(convo) }}</span>
				</template>
				<v-list-tile-avatar class="pl-1">
					<img :src="getFullPath(convo.profile_image)">
				</v-list-tile-avatar>
			</v-badge>
			<v-list-tile-content class="hidden-sm-and-down">
				<v-list-tile-title>{{ convo.username }}</v-list-tile-title>
			</v-list-tile-content>
			<v-list-tile-action class="hidden-sm-and-down">
				<v-layout justify-center align-center>
					<v-icon v-if="notTyping(convo)" small :color="convo.status ? 'green' : 'grey'">fiber_manual_record</v-icon>
					<div v-else class="typing">
						<div class="typing_point"></div>
						<div class="typing_point"></div>
						<div class="typing_point"></div>
					</div>
				</v-layout>
			</v-list-tile-action>
		</v-layout>
	</v-list-tile>
	<p v-if="convos.length == 0">No conversations</p>
</v-list>
</template>

<script>
import utility from '../utility.js'
import { mapGetters, mapActions } from 'vuex'

export default {
	name: 'MessengerList',
	data: () => ({ }),
	computed: {
		...mapGetters([
			'online',
			'notif',
			'convos',
			'typingSec'
		])
	},
	watch: {
		online: {
			immediate: true,
			handler () {
				this.syncOnline()
			}
		},
		convos: {
			immediate: true,
			handler () {
				this.syncOnline()
			}
		}
	},
	methods: {
		...utility,
		...mapActions(['syncConvo']),
		unRead (convo) {
			if (this.notif.length) {
				let sum = 0
				this.notif.forEach(cur => {
					if (cur.type == 'chat' && cur.id_conversation == convo.id_conversation) {
						sum++
					}
				})
				return sum
			}
		},
		notTyping (convo) {
			if (this.typingSec.status) {
				const conv = this.typingSec.convos.find(cur => cur.id_conversation == convo.id_conversation)
				return !conv
			}
			return true
		},
		syncOnline () {
			this.convos.forEach((cur, i) => {
				this.convos[i].status = this.online.includes(cur.user_id)
			})
		}
	}
}
</script>

<style scoped>
.typing_point {
	background: var(--color-primary);
}
</style>
