<template>
<v-slider
	v-model="scale"
	append-icon="zoom_in"
	prepend-icon="zoom_out"
	@click:append="zoomIn"
	@click:prepend="zoomOut"
	:min="min"
	:max="max"
	:step="step"
	:style="{ width: width +'px'}"
></v-slider>
</template>

<script >
export default {
	data: () => ({ scale: 1 }),
	props: {
		min: { type: Number, default: 1 },
		max: { type: Number, default: 2 },
		width: { type: Number, default: 200 },
		step: { type: Number, default: 0.01 }
	},
	methods: {
		setScale (scale) { this.scale = scale },
		zoomOut () { this.scale -= 0.1 },
		zoomIn () { this.scale += 0.1 },
		reset () { this.scale = this.min }
	},
	watch: {
		scale () {
			this.$emit('vue-avatar-editor-scale:change-scale', this.scale)
		}
	}
}
</script>
