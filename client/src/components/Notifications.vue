<template>
	<v-container>
		<h1 class="heading display-2 text-xs-center text-md-left font-weight-thin pt-4 pb-3 mb-4 hidden-sm-and-down grey--text">Notifications</h1>
		<v-timeline align-top dense>
			<v-timeline-item color="primary" small v-for="(entry, i) in notifs" :key="i">
				<v-layout py-3 class="history_item">
					<v-flex xs3>
						<v-tooltip left>
							<template v-slot:activator="{ on }">
								<strong class="mt-2 d-block grey--text" v-on="on">{{ fromNow(entry.date) }}</strong>
							</template>
							<span>{{ formatTime(entry.date) }}</span>
						</v-tooltip>
					</v-flex>
					<v-flex pt-0>
						<v-chip disabled class="bubble grey lighten-5 px-2 py-2">
							<router-link :to="`/user/${entry.id}`">
								<v-avatar>
									<img :src="getFullPath(entry.profile_image)" :alt="entry.username">
								</v-avatar>
							</router-link>
							<span>
								<router-link :to="`/user/${entry.id}`" class="timeline_link">{{ entry.username }}</router-link>
							</span>
							<span class="ml-1">{{ getNotifMsg(entry) }}</span>
						</v-chip>
					</v-flex>
				</v-layout>
			</v-timeline-item>
		</v-timeline>
		<v-flex xs6 offset-xs3>
			<v-btn v-if="moreToLoad" large color="primary" flat round class="my-4" @click="increaseLimit">Load More</v-btn>
		</v-flex>
	</v-container>
</template>

<script>
import moment from 'moment'
import utility from '../utility.js'
import { mapGetters, mapActions } from 'vuex'

export default {
	name: 'Notifications',
	data: () => ({ limit: 15 }),
	computed: {
		...mapGetters(['notif']),
		notChats () {
			return this.notif.filter(cur => cur.type != 'chat')
		},
		notifs () {
			return this.notChats
				.sort((a, b) => new Date(b.date) - new Date(a.date))
				.slice(0, this.limit)
		},
		moreToLoad () {
			return this.limit < this.notChats.length - 1
		}
	},
	methods: {
		...utility,
			increaseLimit () {
			if (this.limit + 11 < this.notChats.length) {
				this.limit += 10
			} else {
				this.limit = this.notChats.length - 1
			}
		}
	}
}
</script>

<style>
.timeline_link {
	text-decoration: none;
}

.bubble.grey {
	border-radius: 5rem;
	border: 1px solid rgba(0, 0, 0, .1) !important;
	transition: all .3s ease-out;
}

.bubble.grey:hover {
	border: 1px solid rgba(0, 0, 0, .25) !important;
}

.v-timeline-item__body {
	margin-top: -.8rem !important;
}
</style>
