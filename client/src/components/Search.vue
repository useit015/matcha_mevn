<template>
<v-container class="pt-5 px-0 discover" v-if="loaded">
	<v-layout wrap justify-center>
		<v-flex :xl2="search" :xl4="!search" :md3="search" :md8="!search" sm10>
			<v-container px-md-5>
				<v-layout column>
					<h4 class="title font-weight-thin mb-4">Show me</h4>
					<v-btn-toggle class="mb-5" v-model="gender">
						<v-btn class="toggle_btn" flat outline color="primary" value="male">
							<svg id="male" viewBox="0 0 512 512" width="17" height="20" style="fill: var(--color-primary)">
								<path d="M376.264,290.173c66.314-66.293,66.314-174.16,0-240.453c-66.314-66.294-174.214-66.294-240.529,0 c-66.314,66.293-66.314,174.16,0,240.453c28.07,28.061,63.591,44.24,100.254,48.546v56.923h-40.018 c-11.051,0-20.009,8.956-20.009,20.003s8.958,20.003,20.009,20.003h40.018v56.348c0.001,11.047,8.959,20.003,20.011,20.003 c11.051,0,20.009-8.956,20.009-20.003v-56.348h40.019c11.051,0,20.009-8.956,20.009-20.003s-8.958-20.003-20.009-20.003h-40.019 V338.72C312.673,334.413,348.194,318.234,376.264,290.173z M164.033,261.884c-50.711-50.695-50.711-133.181,0-183.876 c50.71-50.693,133.221-50.696,183.934,0c50.711,50.695,50.711,133.181,0,183.876C297.256,312.578,214.744,312.578,164.033,261.884 z"/>
							</svg>
							<span class="px-1">Men</span>
						</v-btn>
						<v-btn class="toggle_btn" flat outline color="primary" value="female">
							<svg id="female" height="17" viewBox="0 0 384 384" width="20" style="fill: var(--color-primary)">
								<path d="m383.792969 13.9375c-.175781-1.378906-.480469-2.707031-.984375-3.953125-.015625-.03125-.015625-.074219-.023438-.113281 0-.007813-.007812-.015625-.015625-.023438-.554687-1.3125-1.3125-2.503906-2.167969-3.609375-.210937-.261719-.417968-.519531-.640624-.765625-.914063-1.03125-1.90625-1.984375-3.058594-2.761718-.03125-.023438-.070313-.03125-.101563-.054688-1.113281-.734375-2.34375-1.289062-3.632812-1.726562-.320313-.113282-.632813-.210938-.960938-.296876-1.351562-.367187-2.742187-.632812-4.207031-.632812h-112c-8.832031 0-16 7.167969-16 16s7.167969 16 16 16h73.367188l-95.496094 95.496094c-25.464844-20.367188-56.816406-31.496094-89.871094-31.496094-79.398438 0-144 64.601562-144 144s64.601562 144 144 144 144-64.601562 144-144c0-33.039062-11.121094-64.382812-31.503906-89.871094l95.503906-95.503906v73.375c0 8.832031 7.167969 16 16 16s16-7.167969 16-16v-112c0-.335938-.078125-.65625-.097656-.984375-.023438-.367187-.0625-.71875-.109375-1.078125zm-239.792969 338.0625c-61.761719 0-112-50.238281-112-112s50.238281-112 112-112c29.902344 0 58.054688 11.640625 79.222656 32.734375 21.136719 21.210937 32.777344 49.363281 32.777344 79.265625 0 61.761719-50.238281 112-112 112zm0 0"/>
							</svg>
							<span class="px-1">Women</span>
						</v-btn>
					</v-btn-toggle>
					<h4 class="title font-weight-thin mb-3">Distance</h4>
					<v-range-slider class="mx-3 mb-5 pt-3" v-model="distance" hide-details :max="max" min="0" :step="step" thumb-label="always" thumb-size="30"></v-range-slider>
					<h4 class="title font-weight-thin mb-3">Age</h4>
					<v-range-slider class="mx-3 mb-4 pt-3" v-model="age" max="85" min="18" step="1" thumb-label="always" thumb-size="25"></v-range-slider>
					<h4 class="title font-weight-thin mb-3">Fame</h4>
					<v-range-slider class="mx-3 mb-4 pt-3" v-model="rating" max="5" min="0" step=".5" thumb-label="always" thumb-size="25"></v-range-slider>
					<h4 class="title font-weight-thin mb-4">Near</h4>
					<v-text-field class="loaction_input mb-4" color="primary" outline solo flat append-icon="place" v-model="location"></v-text-field>
					<h4 class="title font-weight-thin mb-4">Interests</h4>
					<v-autocomplete
						v-model="interests"
						:items="allTags"
						solo
						flat
						outline
						multiple
						deletable-chips
						hide-details
						class="tags_menu mb-5"
						chips
					></v-autocomplete>
					<v-layout align-center justify-between class="mb-4">
						<h4 class="title font-weight-thin">Sort by</h4>
						<v-btn flat icon class="sort_btn" color="primary" @click="changeSort">
							<v-icon :class="`sort_icon ${sortDir < 0 ? 'flip' : ''}`">sort</v-icon>
						</v-btn>
					</v-layout>
					<v-select outline solo v-model="sort" :items="sortTypes" class="sort_select mb-5"></v-select>
					<v-layout :column="search" align-center justify-center>
						<v-btn outline block large color="primary" :class="`${search ? '' : 'mr-3'} clear_btn`" @click="reset">
							<v-icon>refresh</v-icon>
						</v-btn>
						<v-btn outline block large color="primary" :class="`${search ? '' : 'm-3'} clear_btn`" @click="search = true">
							<v-icon>search</v-icon>
						</v-btn>
					</v-layout>
				</v-layout>
			</v-container>
		</v-flex>
		<v-flex xl10 md9 sm12 v-if="search">
			<v-layout row wrap justify-center>
				<v-flex class="user" v-for="user in sorted" :key="user.user_id" xl2 lg3 sm3 ma-3 grow>
					<user-card :user="user"/>
				</v-flex>
			</v-layout>
		</v-flex>
	</v-layout>
</v-container>
<loader v-else/>
</template>

<script>
import loader from './loader'
import { mapGetters, mapActions } from 'vuex'
import UserCard from './UserCard'
import countries from '../nats.json'
import utility from '../utility'

export default {
	name: 'Discover',
	components: {
		UserCard,
		loader
	},
	props: {
		data: {
			type: Object,
			default: () => ({ })
		}
	},
	data () {
		return {
			max: 0,
			step: 0,
			search: false,
			sortDir: 1,
			sort: null,
			users: [],
			interests: [],
			gender: null,
			location: null,
			loaded: false,
			age: [18, 85],
			rating: [0, 5],
			distance: [0, 0],
			tags: ['sports', 'cinema', 'music'],
			sortTypes: ['age', 'distance', 'rating', 'interests'],
			nats: countries,
			filters: {
				self: val => val.user_id != this.user.id,
				blocked: val => !this.blocked.includes(val.user_id),
				blockedBy: val => !this.blockedBy.includes(val.user_id),
				rating: val => val.rating >= this.rating[0] && val.rating <= this.rating[1],
				gender: val => !this.gender || val.gender === this.gender,
				location: val => !this.location || [val.country, val.address, val.city].some(cur => cur && cur.has(this.location)),
				distance: val => {
					if (this.distance[0] == this.distance[1]) return true
					if (val.lat && val.lng) {
						const { lat, lng } = val
						const distance = this.calculateDistance(this.userLocation, { lat, lng })
						return distance >= this.distance[0] && distance <= this.distance[1]
					}
				},
				age: val => {
					const year = new Date(val.birthdate).getFullYear()
					const now = new Date().getFullYear()
					return year >= now - this.age[1] && year <=  now - this.age[0]
				},
				interest: val => {
					if (!this.interests.length)
						return true
					for (const interest of this.interests)
						if (val.tags.split(',').includes(interest))
							return true
					return false
				}
			}
		}
	},
	computed: {
		...mapGetters({
			user: 'user',
			allTags: 'tags',
			online: 'online',
			status: 'status',
			blocked: 'blocked',
			blockedBy: 'blockedBy',
			userLocation: 'location'
		}),
		filtered () {
			if (!this.search) return []
			return this.users
				.filter(this.filters.self)
				.filter(this.filters.blocked)
				.filter(this.filters.blockedBy)
				.filter(this.filters.rating)
				.filter(this.filters.gender)
				.filter(this.filters.location)
				.filter(this.filters.age)
				.filter(this.filters.distance)
				.filter(this.filters.interest)
		},
		sorted () {
			if (!this.search) return []
			if (!this.sort || this.sort == 'distance') {
				return this.sortDir < 0 ? [... this.filtered].reverse() :  this.filtered
			} 
			let sortFunc
			const age = (bd) => new Date() - new Date(bd)
			const commonTags = a => {
				if (!a || !a.length) return 0
				const tags = a.split(',')
				return this.user.tags.split(',').filter(val => -1 !== tags.indexOf(val)).length
			}
			switch (this.sort) {
				case 'age':
					sortFunc = (a, b) => this.sortDir * (age(a.birthdate) - age(b.birthdate))
					break
				case 'rating':
					sortFunc = (a, b) => this.sortDir * (b.rating - a.rating)
					break
				case 'interests':
					sortFunc = (a, b) => this.sortDir * (commonTags(b.tags) - commonTags(a.tags))
					break
			}
			return [...this.filtered].sort(sortFunc)
		},
		maxDis () {
			if (this.sort === null && this.sortDir === 1 && this.users.length) {
				const { lat, lng } = this.users[this.users.length - 1]
				const to = { lat: Number(lat), lng: Number(lng) }
				const raw = (this.calculateDistance(this.userLocation, to) / 4).toFixed(0)
				const r = Math.ceil(Number(raw)/Math.pow(10, raw.length - 1))
				return Number(r + raw.split('').splice(1).map(cur => '0').join(''))
			}
		}
	},
	async created () {
		const token = localStorage.getItem('token')
		const url = `${process.env.URL}/api/users/show`
		const headers = { 'x-auth-token': token }
		const res = await this.$http.post(url, {filter:false}, { headers })
		if (!res.body.msg) {
			this.users = res.body.map(cur => ({
				...cur,
				rating: Number(cur.rating)
			}))
			if (this.data.gender || this.data.location) {
				if (this.data.gender != 'null') this.gender = this.data.gender
				if (this.data.location != 'null') this.location = this.data.location
				if (this.data.min && this.data.max
					&& !isNaN(this.data.max) && !isNaN(this.data.min)
					&& Number(this.data.max) >= Number(this.data.min))
						this.age = [Number(this.data.min), Number(this.data.max)]
				this.search = true
			}
			this.whoIsUp()
			this.loaded = true
		} else {
			this.logout(this.user.id)
			this.$router.push('/login')
		}
	},
	methods: {
		...utility,
		...mapActions(['logout']),
		reset () {
			this.search = false
			this.rating = [0, 5]
			this.age = [18, 85]
			this.gender = null
			this.distance = [0, this.maxDis]
			this.location = null
		},
		changeSort () {
			this.sortDir = -this.sortDir
		},
		whoIsUp () {
			this.users.forEach((user, i) => {
				this.users[i].lastSeen = this.users[i].status
				this.users[i].status = this.online.includes(user.user_id)
			})
		}
	},
	watch: {
		online: {
			immediate: true,
			handler () {
				this.whoIsUp()
			}
		},
		age () {
			if (this.age[0] > this.age[1]) {
				const temp = this.age[0]
				this.age[0] = this.age[1]
				this.age[1] = temp
			}
		},
		rating () {
			if (this.rating[0] > this.rating[1]) {
				const temp = this.rating[0]
				this.rating[0] = this.rating[1]
				this.rating[1] = temp
			}
		},
		distance () {
			if (this.distance[0] > this.distance[1]) {
				const temp = this.distance[0]
				this.distance[0] = this.distance[1]
				this.distance[1] = temp
			}
		},
		maxDis: {
			immediate: true,
			handler () {
				const distance = this.maxDis
				if (distance) {
					this.distance[1] = distance
					this.max = distance
					this.step = Math.ceil(distance / 30)
				}
			}
		}
	}
}
</script>

<style>
.v-slider {
	opacity: .7;
}

.tags_menu
> .v-input__control> .v-input__slot,
.loaction_input
> .v-input__control> .v-input__slot {
	box-shadow: none !important;
	border: 2px solid var(--color-primary) !important;
	opacity: .5;
}

.v-slider.v-slider--is-active,
.tags_menu.v-select--is-menu-active
> .v-input__control > .v-input__slot,
.loaction_input.v-input--is-focused
> .v-input__control > .v-input__slot {
	opacity: 1;
}

.loaction_input > .v-input__control
> .v-input__slot > .v-text-field__slot > input {
	margin: 0;
}

.v-input__icon.v-input__icon--append > .v-icon {
	color: var(--color-primary);
}

.v-menu__content.menuable__content__active.v-autocomplete__content {
	border: 2px solid var(--color-primary);
	border-top: none;
	box-shadow: none;
	transform: translateY(-3px);
}
.theme--light.v-btn-toggle,
.v-menu__content.menuable__content__active.v-autocomplete__content
> .v-select-list > .v-list {
	background-color: #FAFAFA !important;
}

.v-btn-toggle {
	display: flex;
}

.toggle_btn {
	flex: 1 1;
	height: 3.33rem;
}

.clear_btn {
	align-self: flex-end;
}

.v-btn-toggle--selected {
	box-shadow: none;
}

.user {
	overflow: hidden;
}

.sort_icon.flip {
	transform: rotate(180deg);
}

.sort_btn {
	margin: 0 0 0 auto !important;
	padding: 0 !important;
}

.sort_select
> .v-input__control> .v-input__slot {
	box-shadow: none !important;
	border: 2px solid var(--color-primary) !important;
	opacity: .5;
}

.sort_select.v-select--is-menu-active
> .v-input__control > .v-input__slot {
	opacity: 1;
}
</style>
