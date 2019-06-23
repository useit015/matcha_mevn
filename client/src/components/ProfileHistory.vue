<template>
<v-container>
	<h1 class="heading display-2 font-weight-thin py-3 mb-4">History</h1>
	<v-timeline align-top dense class="timeline_container">
		<v-timeline-item color="primary" small v-for="(entry, i) in history" :key="i">
			<v-layout py-3 class="history_item">
				<v-flex xs3 class="hidden-xs-only">
					<v-tooltip left>
						<template v-slot:activator="{ on }">
							<strong class="mt-2 d-block" v-on="on">{{ fromNow(getDate(entry)) }}</strong>
						</template>
						<span>{{ formatTime(entry) }}</span>
					</v-tooltip>
				</v-flex>
				<v-flex pt-0>
					<v-chip disabled class="bubble grey lighten-5 px-2 py-2">
						<router-link :to="`/user/${entry.id}`">
							<v-avatar>
								<img :src="getFullPath(entry.profile_image)" :alt="entry.username">
							</v-avatar>
						</router-link>
						<span v-if="entry.type !== 'follower' && entry.type !== 'visitor'" class="mr-1">{{ getHistoryAction(entry.type) }}</span>
						<span>
							<router-link :to="`/user/${entry.id}`" class="timeline_link">{{ entry.username }}</router-link>
						</span>
						<span v-if="entry.type === 'follower' || entry.type === 'visitor'" class="ml-1">{{ getHistoryAction(entry.type) }}</span>
						<span v-if="entry.type === 'visited'">'s profile</span>
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
import { mapGetters } from 'vuex'
import utility from '../utility.js'

export default {
	name: 'ProfileHistory',
	data: () => ({ limit: 15 }),
	computed: {
		...mapGetters({
			blocked: 'blocked',
			hist: 'history'
		}),
		history () {
			return this.hist
					.filter(cur => !this.blocked.includes(cur.id))
					.sort((a, b) => new Date(this.getDate(b)) - new Date(this.getDate(a)))
					.slice(0, this.limit)
		},
		moreToLoad () {
			return this.limit < this.hist.length - 1
		}
	},
	methods: {
		...utility,
		increaseLimit () {
			if (this.limit + 11 < this.hist.length) {
				this.limit += 10
			} else {
				this.limit = this.hist.length - 1
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
