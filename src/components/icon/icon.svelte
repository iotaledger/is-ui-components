<script lang="ts">
	import {
		ArrowLeft,
		ChevronDown,
		Close,
		Device,
		Download,
		Identity,
		Individual,
		Organization,
		Search
	} from './icons';

	const TYPES = {
		'arrow-left': ArrowLeft,
		'chevron-down': ChevronDown,
		close: Close,
		device: Device,
		download: Download,
		identity: Identity,
		individual: Individual,
		organization: Organization,
		search: Search
	};

	export let size: number = 24;
	export let type: string = undefined;
	export let color: string = '#333333';

	$: selected = TYPES[type];
</script>

{#if selected}
	<svg
		class="icon-component"
		data-label="icon"
		width={size}
		height={size}
		viewBox="0 0 24 24"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
		style="--color:{color};"
	>
		<svelte:component this={selected} />
	</svg>
{/if}

<style lang="scss">
	:global(svg.icon-component path) {
		stroke: var(--color);
	}
</style>
