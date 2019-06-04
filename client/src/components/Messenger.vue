<template>
	<v-container fluid class="Messenger pa-0">
		<v-layout class="layout">
			<v-flex xs3 class="green list">
				<MessengerList/>
			</v-flex>
			<v-flex>
				<v-layout column>
					<v-flex xs10 class="purple">
						<MessengerChat/>
					</v-flex>
					<v-flex xs2>
						<MessengerForm/>
					</v-flex>
				</v-layout>
			</v-flex>
		</v-layout>
	</v-container>
</template>

<script>
import MessengerList from './MessengerList'
import MessengerChat from './MessengerChat'
import MessengerForm from './MessengerForm'

export default {
	name: 'Messenger',
	components: {
		MessengerList,
		MessengerChat,
		MessengerForm
	},
	data: () => ({

	}),

}
</script>

<style>
	.Messenger, .list, .layout {
		width: 100%;
		height: 100%;
	}
</style>
