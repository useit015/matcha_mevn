<template>
	<div>
		<div class="header">
			<div class="header_layout"></div>
			<v-layout justify-center align-center class="header_content">
				<div class="header_center">
					<h1 class="display-3 white--text hidden-xs-only text-xs-center font-weight-thin mb-5">Meet Someone worth meeting today</h1>
					<v-layout justify-center wrap>
						<v-flex xs10 sm8 md7>
							<v-layout column>
								<h4 class="title font-weight-thin white--text mb-4">Show me</h4>
								<v-btn-toggle class="mb-5 home_toggle" v-model="gender">
									<v-btn
										class="home_toggle_btn"
										flat
										outline
										color="primary"
										value="male">
										<svg id="male" viewBox="0 0 512 512" width="17" height="20" style="fill: var(--color-primary)">
											<path d="M376.264,290.173c66.314-66.293,66.314-174.16,0-240.453c-66.314-66.294-174.214-66.294-240.529,0 c-66.314,66.293-66.314,174.16,0,240.453c28.07,28.061,63.591,44.24,100.254,48.546v56.923h-40.018 c-11.051,0-20.009,8.956-20.009,20.003s8.958,20.003,20.009,20.003h40.018v56.348c0.001,11.047,8.959,20.003,20.011,20.003 c11.051,0,20.009-8.956,20.009-20.003v-56.348h40.019c11.051,0,20.009-8.956,20.009-20.003s-8.958-20.003-20.009-20.003h-40.019 V338.72C312.673,334.413,348.194,318.234,376.264,290.173z M164.033,261.884c-50.711-50.695-50.711-133.181,0-183.876 c50.71-50.693,133.221-50.696,183.934,0c50.711,50.695,50.711,133.181,0,183.876C297.256,312.578,214.744,312.578,164.033,261.884 z"/>
										</svg>
										<span class="px-1">Men</span>
									</v-btn>
									<v-btn
										class="home_toggle_btn"
										flat
										outline
										color="primary"
										value="female">
										<svg id="female" height="17" viewBox="0 0 384 384" width="20" style="fill: var(--color-primary)">
											<path d="m383.792969 13.9375c-.175781-1.378906-.480469-2.707031-.984375-3.953125-.015625-.03125-.015625-.074219-.023438-.113281 0-.007813-.007812-.015625-.015625-.023438-.554687-1.3125-1.3125-2.503906-2.167969-3.609375-.210937-.261719-.417968-.519531-.640624-.765625-.914063-1.03125-1.90625-1.984375-3.058594-2.761718-.03125-.023438-.070313-.03125-.101563-.054688-1.113281-.734375-2.34375-1.289062-3.632812-1.726562-.320313-.113282-.632813-.210938-.960938-.296876-1.351562-.367187-2.742187-.632812-4.207031-.632812h-112c-8.832031 0-16 7.167969-16 16s7.167969 16 16 16h73.367188l-95.496094 95.496094c-25.464844-20.367188-56.816406-31.496094-89.871094-31.496094-79.398438 0-144 64.601562-144 144s64.601562 144 144 144 144-64.601562 144-144c0-33.039062-11.121094-64.382812-31.503906-89.871094l95.503906-95.503906v73.375c0 8.832031 7.167969 16 16 16s16-7.167969 16-16v-112c0-.335938-.078125-.65625-.097656-.984375-.023438-.367187-.0625-.71875-.109375-1.078125zm-239.792969 338.0625c-61.761719 0-112-50.238281-112-112s50.238281-112 112-112c29.902344 0 58.054688 11.640625 79.222656 32.734375 21.136719 21.210937 32.777344 49.363281 32.777344 79.265625 0 61.761719-50.238281 112-112 112zm0 0"/>
										</svg>
										<span class="px-1">Women</span>
									</v-btn>
								</v-btn-toggle>
								<h4 class="title font-weight-thin white--text mb-4">Near</h4>
								<v-text-field
									class="home_loaction_input mb-4"
									color="primary"
									outline
									solo
									flat
									append-icon="place"
									v-model="location"
								></v-text-field>
								<h4 class="title font-weight-thin white--text mb-3">Age</h4>
								<v-range-slider
									class="mx-3 mb-4 pt-3"
									v-model="age"
									max="85"
									min="18"
									step="1"
									thumb-label="always"
									thumb-size="25"
								></v-range-slider>
								<v-layout align-center justify-center>
									<v-btn
										outline
										block
										large
										color="primary"
										class="home_clear_btn"
										@click="mainSearch">
										<span>let's go</span>
										<v-icon right>search</v-icon>
									</v-btn>
								</v-layout>
							</v-layout>
						</v-flex>
					</v-layout>
				</div>
			</v-layout>
		</div>
	</div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
	name: 'Users',
	data: () => ({
		gender: null,
		location: null,
		age: [18, 85]
	}),
	computed: mapGetters(['tags']),
	methods: {
		mainSearch () {
			this.$router.push(`/search?gender=${this.gender}&location=${this.location}&min=${this.age[0]}&max=${this.age[1]}`)
		}
	}
}
</script>

<style>
.header_layout,
.header_content {
	height: 100%;
	width: 100%;
}

.header_center {
	z-index: 3;
}

.header_layout {
	z-index: 0;
	position: absolute;
	background: rgba(0, 0, 0, .6);
	opacity:
}

.header {
	height: calc(100vh - 64px);
	background-image: url(https://images.pexels.com/photos/1308748/pexels-photo-1308748.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260);
	background-position: center;
	background-size: cover;
}

.header > h1 {
	font-size: 5em !important;
}

.home_toggle.theme--light.v-btn-toggle {
	background: transparent !important;
	display: flex;
	justify-content: center;
}

.home_toggle_btn {
	flex: 1 1 50%;
	height: 56px;
	opacity: 1 !important;
}

.home_toggle_btn::before {
	opacity: .3 !important;
}

.home_loaction_input > .v-input__control > .v-input__slot,
.home_tags_menu > .v-input__control > .v-input__slot {
	border: 2px solid var(--color-primary) !important;
}

.home_clear_btn {
	height: 56px;
}

.v-select-list.v-card.theme--light {
	background: transparent;
}

.v-select-list.v-card.theme--light > .v-list.theme--light {
	background: rgba(0, 0, 0, .4);
	color: #fff;
}

.complete::-webkit-scrollbar-track {
	-webkit-box-shadow: none;
	background: rgba(0, 0, 0, .4);
}
 
.complete::-webkit-scrollbar-thumb {
	background-color: var(--color-primary);
	border-radius: 4px;
}

.complete::-webkit-scrollbar {
	width: .45em;
}
</style> 
