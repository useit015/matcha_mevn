<template>
<div>
	<v-dialog v-model="dialog" max-width="450" persistent>
		<v-card class="grey lighten-3 editor_dialog">
			<v-layout column align-center justify-center class="pt-5">
				<vue-avatar :width=280 :height=280 :border=0 ref="vueavatar" @vue-avatar-editor:image-ready="onImageReady" @file_error="error = true" @file_success="error = false" class="mb-3"></vue-avatar>
				<vue-avatar-scale ref="vueavatarscale" @vue-avatar-editor-scale:change-scale="onChangeScale" :width=250 :min=1 :max=3 :step=0.02></vue-avatar-scale>
			</v-layout>
			<v-card-actions>
				<v-spacer></v-spacer>
				<v-btn flat color="primary" @click="closeEditor">Cancel</v-btn>
				<v-btn flat color="primary" @click="saveClicked" :disabled="error">Save</v-btn>
			</v-card-actions>
		</v-card>
	</v-dialog>
	<alert :data="alert"></alert>
</div>
</template>

<script>
import { mapGetters } from 'vuex'
import utility from '../utility.js'
import Alert from './Alert'
import VueAvatar from './VueAvatar'
import VueAvatarScale from './VueAvatarScale'

export default {
	name: 'ProfileEditor',
	components: {
		Alert,
		VueAvatar,
		VueAvatarScale
	},
	data: () => ({
		error: null,
		dialog: false,
		alert: {
			state: false,
			color: '',
			text: ''
		}
	}),
	computed: mapGetters(['user']),
	watch: {
		error() {
			if (this.error == true) {
				this.$emit('file_error')
			} else {
				this.$emit('file_succes')
			}
		}
	},
	methods: {
		...utility,
		closeEditor () {
			this.dialog = false
			this.$refs.vueavatar.init()
		},
		pickFile () {
			if (this.user.images.length < 5) {
				this.$refs.vueavatar.clicked()
				this.dialog = true
			} else {
				this.showAlert('red', 'Max photos if five, you must delete one in order to add', this)
			}
		},
		onChangeScale (scale) {
			this.$refs.vueavatar.changeScale(scale)
		},
		saveClicked () {
			this.$emit('update-image', this.$refs.vueavatar.getImageScaled().toDataURL())
			this.$refs.vueavatarscale.reset()
			this.dialog = false
		},
		onImageReady (scale) {
			this.$refs.vueavatarscale.setScale(scale)
		}
	}
}
</script>
