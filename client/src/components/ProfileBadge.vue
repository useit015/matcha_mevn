<template>
<v-layout justify-center py-0>
	<v-flex xs12 sm11 md9 offset-lg3 offset-xl4 offset-md2 offset-sm1 class="badge text-capitalize">
		<h2 class="font-weight-thin mb-2">
			<v-tooltip bottom v-if="!settings && match">
				<template v-slot:activator="{ on }">
					<v-icon color="red" class="mb-1" small v-on="on">favorite</v-icon>
				</template>
				<span>You have a match</span>
			</v-tooltip>
			<span>{{ `${user.first_name} ${user.last_name}` }}</span>
		</h2>
		<h4 class="font-weight-thin mb-3">{{ `@${user.username}` }}</h4>
		<div class="font-weight-light text-truncate" v-for="field in fields" :key="field.icon">
			<p class="my-2" v-if="field.exist">
				<v-icon small>{{ field.icon }}</v-icon>
				<span class="ml-2">{{ field.text }}</span>
			</p>
		</div>
		<v-rating readonly dense :value="user.rating" half-increments class="rating mt-1"></v-rating>
	</v-flex>
</v-layout>
</template>

<script>
import moment from 'moment'
import utility from '../utility.js'

export default {
	name: 'ProfileBadge',
	props: {
		settings: { type: Boolean, default: false },
		match: { type: Boolean, default: false },
		user: { type: Object, default: () => ({ })}
	},
	computed: {
		fields () {
			return [
				{
					exist: true,
					icon: 'calendar_today',
					text: `Joined ${moment(this.user.created_at).format('MMMM YYYY')}`
				}, {
					exist: !!this.user.birthdate,
					icon: 'child_care',
					text: `Born ${moment(this.user.birthdate).format('MMMM D, YYYY')}`
				}, {
					exist: !!this.user.city && !!this.user.country,
					icon: 'location_on',
					text: `${this.user.city}, ${this.user.country}`
				}
			]
		}
	},
	methods: utility
}
</script>

<style>
.rating_value {
	transform: translateX(25%);
}
</style>
