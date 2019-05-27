<template>
<v-slider v-model="scale" append-icon="zoom_in" prepend-icon="zoom_out" @click:append="zoomIn" @click:prepend="zoomOut" :min="min" :max="max" :step="step" :style="{ width: width +'px'}"></v-slider>
</template>

<script >
export default {
	data: function() {
		return { scale: 1 }
	},
	props: {
		min:	{ type: Number, default: 1 },
		max:	{ type: Number, default: 2 },
		width:	{ type: Number, default: 200 },
		step:	{ type: Number, default: 0.01 }
	},
	methods: {
		setScale: function(scale) { this.scale = scale },
		zoomOut: function() { this.scale -= 0.1 },
		zoomIn: function() { this.scale += 0.1 },
		reset: function() { this.scale = this.min }
	},
	watch: {
		scale: function() {
			this.$emit('vue-avatar-editor-scale:change-scale', this.scale)
		}
	}
}
</script>