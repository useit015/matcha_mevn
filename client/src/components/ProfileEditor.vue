<template>
	<v-dialog v-model="dialog" max-width="500" persistent>
		<v-card class="grey lighten-3">
			<v-layout column align-center justify-center pt-4>
				<vue-avatar :width=400 :height=400 :border=0 ref="vueavatar" @vue-avatar-editor:image-ready="onImageReady" class="mb-3"></vue-avatar>
				<vue-avatar-scale ref="vueavatarscale" @vue-avatar-editor-scale:change-scale="onChangeScale" :width=250 :min=1 :max=3 :step=0.02></vue-avatar-scale>
			</v-layout>
			<v-card-actions>
				<v-spacer></v-spacer>
				<v-btn flat color="primary" @click="closeEditor">Cancel</v-btn>
				<v-btn flat color="primary" @click="saveClicked">Save</v-btn>
			</v-card-actions>
		</v-card>
	</v-dialog>
</template>

<script>
import VueAvatar from './VueAvatar.vue'
import VueAvatarScale from './VueAvatarScale.vue'
import utility from '../utility.js'
export default {
	name: 'ProfileEditor',
	components: {
		VueAvatar,
		VueAvatarScale
	},
	data() {
		return {
			dialog: false
		}
	},
	props: {
		user: {
			type: Object,
			default: function() {
				return {}
			}
		}
	},
	methods: {
		...utility,
		closeEditor() {
			this.dialog = false
			this.$refs.vueavatar.init()
		},
		pickFile() {
			this.$refs.vueavatar.clicked()
			this.dialog = true
		},
		onChangeScale (scale) {
			this.$refs.vueavatar.changeScale(scale)
		},
		saveClicked(){
			this.$emit('update-image', this.$refs.vueavatar.getImageScaled().toDataURL())
			this.$refs.vueavatarscale.reset()
			this.dialog = false
		},
		onImageReady(scale){
			this.$refs.vueavatarscale.setScale(scale)
		}
	}
}
</script>
