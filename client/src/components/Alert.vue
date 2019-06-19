<template>
<v-snackbar v-model="data.state" :color="data.color" :timeout="4000" auto-height top right>
	{{ data.text }} 
	<v-btn dark flat @click="data.state = false">
		<v-icon>close</v-icon>
	</v-btn>
</v-snackbar>
</template>

<script>
export default {
	name: 'Alert',
	data: () => {
		return {}
	},
	props: {
		data: {
			type: Object,
			default: () => {
				return {
					state: false,
					color: '',
					text: ''
				}
			}
		}
	}
}
</script>

<style>
.v-snack__content {
	padding: .75rem 1.5rem !important;
}
</style>
