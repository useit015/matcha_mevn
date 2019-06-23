<template>
<v-flex md8 :class="mobile ? 'hidden-md-and-up pb-0 mt-5' : 'hidden-sm-and-down'">
	<v-tabs fixed-tabs centered v-model="activeTab" :color="`grey lighten-${mobile ? 5 : 3}`" slider-color="primary">
		<v-tab v-for="link in links" :key="link.route" :href="`#tab-${link.route}`">
			<v-icon :left="!mobile">{{ link.icon }}</v-icon>
			<span :class="mobile ? 'pl-3 hidden-xs-only' : ''">{{ link.text }}</span>
		</v-tab>
	</v-tabs>
</v-flex>
</template>

<script>
export default {
	name: 'ProfileTabs',
	data() {
		this.links = [
			{ icon: 'person', text: 'Info', route: 'profile' },
			{ icon: 'photo_camera', text: 'Gallery', route: 'photo' }
		]
		if (this.settings) {
			this.links[0].text = 'Profile'
			this.links.push({ icon: 'history', text: 'History', route: 'history' })
			this.links.push({ icon: 'settings', text: 'Parameters', route: 'setting' })
		}
		return {
			activeTab: null,
		}
	},
	props: {
		settings: { type: Boolean, default: false },
		mobile: { type: Boolean, default: false },
		active: { type: String, default: '' },
	},
	watch: {
		active: {
			immediate: true,
			handler: 'sync'
		},
		activeTab () {
			this.$emit('change-tab', this.activeTab)
		}
	},
	methods: {
		sync () {
			this.activeTab = this.active
		}
	}
}
</script>

<style>
.v-tabs__container {
	height: 4rem;
}

.v-tabs__item--active,
.v-tabs__item--active > .v-icon {
	color: var(--color-primary) !important;
}
</style>
