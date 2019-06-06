<template>
	<v-list subheader class="grey lighten-5">
		<v-subheader>Recent chat</v-subheader>
		<v-list-tile v-for="convo in convos" :key="convo.id_conversation" avatar @click="changeConvo(convo)">
			<v-list-tile-avatar>
				<img :src="getFullPath(convo.profile_image)">
			</v-list-tile-avatar>
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

export default {
	name: 'MessengerList',
	props: {
		convos: {
			type: Array,
			default: () => { return [] }
		}
	},
	methods: {
		...utility,
		changeConvo (convo) {
			this.$store.dispatch('syncConvo', convo)
		}
	}
}
</script>
