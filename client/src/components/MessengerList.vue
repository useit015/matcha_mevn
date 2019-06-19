<template>
<v-list subheader class="grey lighten-5">
	<v-subheader>Recent chat</v-subheader>
	<v-list-tile v-for="convo in convos" :key="convo.id_conversation" avatar @click="syncConvo(convo)">
		<v-badge :value="!!unRead(convo)" overlap color="primary" class="mx-2" left>
			<template v-slot:badge>
				<span>{{ unRead(convo) }}</span>
			</template>
			<v-list-tile-avatar>
				<img :src="getFullPath(convo.profile_image)">
			</v-list-tile-avatar>
		</v-badge>
		<v-list-tile-content>
			<v-list-tile-title>{{ convo.username }}</v-list-tile-title>
		</v-list-tile-content>
		<v-list-tile-action>
			<v-icon :color="convo.status ? 'teal' : 'grey'">fiber_manual_record</v-icon>
		</v-list-tile-action>
	</v-list-tile>
</v-list>
</template>

<script>
import utility from '../utility.js'
import { mapGetters, mapActions } from 'vuex'

export default {
	name: 'MessengerList',
	props: {
		convos: {
			type: Array,
			default: () => { return [] }
		}
	},
	computed: mapGetters(['notif']),
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
		}
	}
}
</script>
