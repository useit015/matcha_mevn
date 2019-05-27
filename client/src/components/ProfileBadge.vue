<template>
	<v-layout justify-center py-0>
		<v-flex xs12 sm11 md9 offset-lg3 offset-xl4 offset-md2 offset-sm1 class="badge text-capitalize">
			<h2 class="title mb-2">{{ `${user.first_name} ${user.last_name}` }}</h2>
			<h4 class="font-weight-thin mb-3">{{ `@${user.username}` }}</h4>
			<div class="font-weight-light text-truncate" v-for="field in fields" :key="field.icon">
				<p class="my-2" v-if="field.exist">
					<v-icon small>{{ field.icon }}</v-icon>
					<span class="ml-2">{{ field.text }}</span>
				</p>
			</div>
			<v-layout align-center justify-start px-2 v-if="!settings">
				<p class="caption rating_value ma-0 rating_value">{{ user.rating ? user.rating.toFixed(1) : 0 }}</p>
				<v-rating readonly dense :value="user.rating" half-increments class="rating mt-1"></v-rating>
			</v-layout>
		</v-flex>
	</v-layout>
</template>

<script>
import utility from '../utility.js'
import moment from 'moment'

export default {
	name: 'ProfileBadge',
	props: {
		settings: { type: Boolean, default: false },
		user: { type: Object, default: () => { return {} } }
	},
	computed: {
		fields () {
			return [
				{
					 exist: true,
					 icon: 'calendar_today',
					 text: `Joined ${moment(this.user.created_at).format('MMMM YYYY')}`
				},
				{
					 exist: !!this.user.birthdate,
					 icon: 'child_care',
					 text: `Born ${moment(this.user.birthdate).format('MMMM D, YYYY')}`
				},
				{
					 exist: !!this.user.city && !!this.user.country,
					 icon: 'location_on',
					 text: `${this.user.city}, ${this.user.country}`
				},
			]
		}
	},
	methods: {
		...utility
	}
}
</script>

<style>
@media only screen and (max-width: 600px) {
	.badge {
		text-align: center !important;
		padding-left: 0 !important;
		padding-right: 0 !important;
	}
}

.rating_value {
	transform: translateX(25%);
}
</style>
