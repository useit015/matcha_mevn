<template>
<v-card router :to="`/user/${user.user_id}`">
	<v-layout column justify-center align-center class="pt-1">
		<v-layout justify-space-between class="top pa-2">
			<v-chip disabled outline small color="grey lighten-1" class="ml-2">{{ distance }}</v-chip>
			<v-tooltip bottom class="status_container">
				<template v-slot:activator="{ on }">
					<v-icon :color="`${user.status ? 'green' : 'grey'} lighten-2`" class="status_icon mr-3" small v-on="on">fiber_manual_record</v-icon>
				</template>
				<span>{{ lastSeen }}</span>
			</v-tooltip>
		</v-layout>
		<v-avatar size="120">
			<v-img :src="profileImage(user.name)" aspect-ratio="1"></v-img>
		</v-avatar>
		<h5 class="name headline text-capitalize mt-2 mb-4">{{ user.first_name }}</h5>
		<v-layout align-start justify-center>
			<p class="caption text-capitalize rating_value">{{ user.rating.toFixed(1) }}</p>
			<v-rating readonly dense small :value="user.rating" half-increments class="rating"></v-rating>
		</v-layout>
		<v-layout justify-center align-center class="body-1 text-capitalize bottom mb-0 mt-auto py-2 px-4 grey lighten-5">
			<v-icon v-if="user.birthdate" color="primary" class="cake_icon px-1" small>cake</v-icon>
			<span v-if="user.birthdate" class="pr-1">{{ age }}</span>
			<v-icon color="primary lighten-1" class="location_icon px-1" small>place</v-icon>
			<span  v-if="user.city && user.country" class="text-truncate">{{ `${user.city}, ${user.country}` }}</span>
			<span  v-else class="text-truncate">Earth</span>
		</v-layout>
	</v-layout>
</v-card>
</template>

<script>
import moment from 'moment'
import { mapGetters } from 'vuex'
import utility from '../utility.js'

export default {
	name: 'UserCard',
	props: {
		user: {
			type: Object,
			default: () => { return {} }
		}
	},
	data () {
		return {
			
		}
	},
	computed: {
		...mapGetters(['location']),
		age () {
			return new Date().getFullYear() - new Date(this.user.birthdate).getFullYear()
		},
		distance () {
			const from = this.location
			const to = {
				lat: this.user.lat,
				lng: this.user.lng
			}
			return `${Math.round(this.calculateDistance(from, to))} kms away`
		},
		lastSeen () {
			if (this.user.status) return 'online'
			if (this.user.lastSeen)
				return moment(this.user.lastSeen).utc().fromNow()
			return moment(this.user.created_at).utc().fromNow()
		}
	},
	methods: {
		...utility,
		profileImage(image) {
			return this.getFullPath(image)
		}
	}

}
</script>

<style>
.name {
	color: #828282;
	position: relative;
}

.name:after {
	display: block;
	content: '';
	position: absolute;
	top: 125%;
	left: 50%;
	width: 40%;
	height: 1px;
	background: var(--color-primary);
	transform: translate(-50%, -50%);
}

.v-card {
	box-sizing: border-box;
	height: 100%;
	box-shadow: none;
	border: 1px solid rgba(0, 0, 0, .1) !important;
	transition: all .3s ease-out;
}

.v-card:hover {
	border: 1px solid rgba(25, 25, 25, .3) !important;
}

.v-card__title {
	background: none;
}

.top, .bottom {
	width: 100%;
}

.rating {
	transform: scale(.8) translateY(-1px);
}

.rating_value {
	margin-left: 7px;
	margin-right: -3px;
}

.status_container {
	display: flex;
	justify-content: center;
	align-items: center;
}

.status_icon {
	margin-left: auto !important;
}

.location_icon {
	transform: scale(1.1);
	margin-bottom: 2px;
}

.cake_icon {
	margin-bottom: 3px;
}

.love {
	transform: translate(-5px, -3px);
}

.v-responsive.v-image {
	border: 3px solid rgba(0, 0, 0, .1) !important;
}
</style>
