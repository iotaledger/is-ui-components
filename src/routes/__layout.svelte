<script lang="ts">
	import { Logo } from '$icons/';
	import 'bootstrap/dist/css/bootstrap.min.css';
</script>

<nav class="p-4 border">
	<div class="d-flex align-items-center">
		<div class="logo-wrapper me-4 rounded-1">
			<Logo />
		</div>
		<div class="info">
			<h1 class="mb-0">Integration Services</h1>
			<h2 class="mb-0">UI Components</h2>
		</div>
	</div>
</nav>

<main>
	<slot />
</main>

<style lang="scss">
	nav {
		background-color: #f2f9ff;
		.logo-wrapper {
			background-color: #108cff;
		}
		.info {
			h1 {
				font-size: 24px;
			}
			h2 {
				font-size: 16px;
			}
		}
	}
</style>
