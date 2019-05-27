<template>
<v-container grid-list-sm>
	<h1 class="heading display-2 font-weight-thin py-3 mb-4 hidden-sm-and-down">Pictures</h1>
	<v-layout row wrap class="mt-4">
		<v-flex v-for="image in images" :key="image.id" xs4 grow>
			<img :src="profileImage(image.name)" class="image" width="100%" height="100%">
		</v-flex>
	</v-layout>
</v-container>
</template>

<script>
import utility from '../utility.js'

export default {
	name: 'ProfileTabs',
	data() {
		return {}
	},
	props: {
		images: {
			type: Array,
			default: () => { return [] }
		}
	},
	methods: {
		profileImage(image) {
			return utility.getFullPath(image)
		}
	}
}
</script>

<style>
.flex.xs4.grow {
	max-width: 100% !important;
}
</style>
