<template>
<div class="cs-loader">
	<div class="cs-loader-inner">
		<label>●</label>
		<label>●</label>
		<label>●</label>
		<label>●</label>
		<label>●</label>
		<label>●</label>
	</div>
</div>
</template>

<script>
export default { name: 'loader' }
</script>

<style>
.cs-loader {
	position: absolute;
	top: 0;
	left: 0;
	height: 100%;
	width: 100%;
}

.cs-loader-inner {
	position: absolute;
	transform: translateY(-50%, -50%);
	top: 40%;
	left: 10%;
	width: calc(100vw - 20%);
	color: var(--color-primary);
	padding: 0 100px;
	text-align: center;
}

.cs-loader-inner label {
	font-size: 20px;
	opacity: 0;
	display:inline-block;
}

@keyframes lol {
	0% {
		opacity: 0;
		transform: translateX(-50vw);
	}
	33% {
		opacity: 1;
		transform: translateX(0px);
	}
	66% {
		opacity: 1;
		transform: translateX(0px);
	}
	100% {
		opacity: 0;
		transform: translateX(50vw);
	}
}

.cs-loader-inner label:nth-child(6) {
	animation: lol 3s infinite ease-in-out;
}

.cs-loader-inner label:nth-child(5) {
	animation: lol 3s 100ms infinite ease-in-out;
}

.cs-loader-inner label:nth-child(4) {
	animation: lol 3s 200ms infinite ease-in-out;
}

.cs-loader-inner label:nth-child(3) {
	animation: lol 3s 300ms infinite ease-in-out;
}

.cs-loader-inner label:nth-child(2) {
	animation: lol 3s 400ms infinite ease-in-out;
}

.cs-loader-inner label:nth-child(1) {
	animation: lol 3s 500ms infinite ease-in-out;
}
</style>
