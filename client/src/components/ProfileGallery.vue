<template>
<v-container grid-list-sm>
	<h1 class="heading display-2 font-weight-thin py-3 mb-4">Gallery</h1>
	<v-layout row wrap class="mt-4">
		<v-flex v-for="image in images" :key="image.id" xs4 grow class="img_container">
			<v-btn v-if="user.id == image.user_id" color="red" dark small icon @click="deleteImg(image)" class="del_img">
				<v-icon>close</v-icon>
			</v-btn>
			<img :src="profileImage(image.name)" class="image" width="100%" height="100%">
		</v-flex>
	</v-layout>
	<alert :data="alert"></alert>
</v-container>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import utility from '../utility.js'
import Alert from './Alert'

export default {
	name: 'ProfileTabs',
	data () {
		return {
			alert: {
				state: false,
				color: '',
				text: ''
			}
		}
	},
	components: { Alert },
	props: {
		images: {
			type: Array,
			default: () => { return [] }
		}
	},
	computed: mapGetters(['user']),
	methods: {
		...utility,
		...mapActions(['delImg']),
		profileImage (image) {
			return this.getFullPath(image)
		},
		async deleteImg (image) {
			try {
				const url = `${process.env.URL}/api/users/image/del`
				const headers = { 'x-auth-token': this.user.token }
				const data = {
					id: image.id,
					profile: image.profile
				}
				const res = await this.$http.post(url, data, { headers})
				if (res.body.ok) {
					this.delImg(image.id)
					this.showAlert('green', 'Photo has been removed', this)
				} else {
					this.showAlert('red', 'Oups.. something went wrong', this)
				}
			} catch (err) {
				console.log('Got error with --> ', err)
			}
		}
	}
}
</script>

<style>
.flex.xs4.grow {
	max-width: 100% !important;
}

.img_container {
	position: relative;
}

.del_img,
.del_img:hover {
	position: absolute;
	top: 0;
	right: 0;
	transform: translate(25%, -25%) scale(.8);
}
</style>
