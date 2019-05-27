<template>
<v-app class="grey lighten-5 app">
	<Navbar/>
	<v-content>
		<router-view/>
	</v-content>
	<v-fab-transition>
		<v-btn color="primary" dark fab fixed bottom right>
			<v-icon>keyboard_arrow_up</v-icon>
		</v-btn>
	</v-fab-transition>
</v-app>
</template>

<script>
import Navbar from '@/components/Navbar'
export default {
	name: 'App',
	components: { Navbar }
}
</script>

<style>
:root {
	--color-primary: #03a9f4;
	--color-accent: #01579b;
	--color-white: #FFF;
	--color-black: #111;
	--color-grey-light: #f3f3f3;
	--color-grey-dark: #575757;
	--color-green: #00ad53;
	--color-red: #ff0015;
}

* {
	margin: 0;
	padding: 0;
}

*,
*::after,
*::before {
	box-sizing: inherit;
}

html {
	box-sizing: border-box;
}

::selection {
	background-color: var(--color-primary);
	color: var(--color-white);
}

.app {
	overflow-x: hidden;
}

.heading {
	border-bottom: 1px solid #999;
}

.parallax {
	background-image: url(https://images.pexels.com/photos/96422/pexels-photo-96422.jpeg);
	background-position: center;
	background-size: cover;
	height: 25rem;
	width: 100%;
	background-attachment: fixed;
	background-repeat: no-repeat;
}

.strap {
	height: 4rem;
	flex-shrink: 0;
}

.avatar {
	transform: translateY(-8rem);
	position: relative;
	flex-shrink: 0;
}

.avatar__btn {
	position: absolute;
	top: 85%;
	left: 85%;
	transform: translate(-50%, -50%) scale(.95);
}

.v-btn--floating:not(.v-btn--depressed):not(.v-btn--flat),
.v-btn--floating:not(.v-btn--depressed):not(.v-btn--flat):focus {
	box-shadow: 0 0 3px rgba(0, 0, 0, .2) inset;
}

.avatar__img {
	box-shadow: 0 0 0 3px #f5f5f5,
		0 1px 5px rgba(0, 0, 0, .2);
}

.profile {
	padding-top: 4.5rem;
}

.main {
	margin-top: -2.75rem;
}
</style>
