<script lang="ts">
	import { Icon } from '$components';

	let expanded = false;

	const toggle = () => (expanded = !expanded);
</script>

<div>
	<div
		class="header position-relative d-flex justify-content-between align-items-center"
		role="button"
		on:click={toggle}
	>
		<slot name="header" />
		<div class="icon-wrapper" class:rotated={expanded}>
			<Icon type="chevron-down" />
		</div>
	</div>
	{#if expanded}
		<div class="body position-relative">
			<slot name="body" />
		</div>
	{/if}
</div>

<style lang="scss">
	.icon-wrapper {
		transition: transform 0.25s ease;
		transform: rotate(0);
		&.rotated {
			transform: rotate(180deg);
		}
	}
</style>
