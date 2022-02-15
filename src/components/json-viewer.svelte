<script lang="ts">
	import { syntaxHighlight } from '$lib/utils';

	export let json: string;
</script>

<div class="json-viewer text-primary">
	{@html json === undefined ? 'undefined' : syntaxHighlight(json)}
</div>

<style lang="scss">
	.json-viewer {
		font-family: 'Courier New', Courier, monospace;
		font-size: 12px;
		white-space: pre-wrap;
	}
</style>
