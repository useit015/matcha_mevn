<template>
	<v-container>
		<v-layout row>
			<v-text-field class="ma-4"  label="message" v-model="msg"></v-text-field>
			<v-btn color="primary" class="ma-4" outline large @click="sendMsg">Send</v-btn>
		</v-layout>
	</v-container>
</template>

<script>
export default {
	name: 'Chat',
	data: () => ({
		to: null,
		msg: null
	}),
	methods: {
		sendMsg () {
			
		}
	}
}
</script>

<style>

</style>
