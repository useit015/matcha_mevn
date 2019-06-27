<template>
<v-app class="grey lighten-5 app">
	<Navbar/>
	<v-content>
		<router-view/>
	</v-content>
</v-app>
</template>

<script>
import Navbar from '@/components/Navbar'

export default {
	name: 'App',
	components: { Navbar },
	created () {
		let script = document.createElement('script')
		script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.GOOGLE_KEY}`
		script.async = true
		script.defer = true
		document.body.prepend(script)
	}
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

.cover__btn {
	position: absolute;
	top: 0;
	right: 0;
	transform: translate(-50%, 50%);
}

.avatar__btn,
.avatar__like {
	position: absolute;
	top: 85%;
	left: 85%;
	transform: translate(-50%, -50%) scale(.95);
}

.avatar__like {
	top: 15%;
	left: 85%;
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

@keyframes point {
	0% {
		opacity: .3;
	}
	100% {
		opacity: 1;
	}
}

.typing {
	display: flex;
	align-items: center;
	justify-content: center;
}

.typing_point {
	margin: 7.5px 2px;
	width: 5px;
	height: 5px;
	background: var(--color-primary);
	border-radius: 50%;
	animation-name: point;
	animation-duration: .9s;
	animation-iteration-count:infinite;
}

.typing_point:nth-child(1) {
	animation-delay: 0s;
}

.typing_point:nth-child(2) {
	animation-delay: .3s;
}

.typing_point:nth-child(3) {
	animation-delay: .6s;
}

.editor_dialog {
	overflow: hidden
}

@media only screen and (max-width: 600px) {
	.heading {
		font-size: 2.5em !important;
		padding-bottom: .5rem !important;
	}
	.title {
		font-size: 16px !important;
	}
	.v-chip__content {
		transform: scale(.9);
	}
	.chat_container {
		font-size: 85% !important;
	}
	.badge {
		text-align: center !important;
		padding-left: 0 !important;
		padding-right: 0 !important;
	}
	.parallax {
		height: 20rem;
	}
	.color_picker {
		height: 3.5rem !important;
		width: 3.5rem !important;
	}
	.header_content > * {
		transform: scale(.9) !important;
	}
	.header_content > .header_center > h1 {
		font-size: 1rem;
	}
}

@media only screen and (max-width: 400px) {
	.timeline_container {
		transform: scale(.8) translate(-5%, -10%);
	}
	.title {
		font-size: 14px !important;
	}
	.chat_container {
		font-size: 80% !important;
	}
	.color_picker {
		height: 3rem !important;
		width: 3rem !important;
	}
	.header_content > * {
		transform: scale(.8) !important;
	}
	.header_content > .header_center > h1 {
		font-size: .7rem;
	}
}

@media only screen and (max-width: 350px) {
	.timeline_container {
		transform: scale(.7) translate(-10%, -20%);
	}
	.title {
		font-size: 12px !important;
	}
	.v-chip__content {
		transform: scale(.8);
	}
	.chat_container {
		font-size: 70% !important;
	}
	.parallax {
		height: 15rem;
	}
	.color_picker {
		height: 2.5rem !important;
		width: 2.5rem !important;
	}
	.header_content > * {
		transform: scale(.7) !important;
	}
	.header_content > .header_center > h1 {
		font-size: .6rem;
	}
}
</style>
