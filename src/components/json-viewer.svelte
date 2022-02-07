<script lang="ts">
	import { syntaxHighlight } from '$lib/utils';

	export let json: string;
</script>

<div class="json-viewer">
	{@html json === undefined ? 'undefined' : syntaxHighlight(json)}
</div>

<style lang="scss">
	.json-viewer {
		font-family: 'Courier New', Courier, monospace;
		font-size: 12px;
		white-space: pre-wrap;

		:global(.string) {
			color: green;
		}

		:global(.number) {
			color: darkorange;
		}

		:global(.boolean) {
			color: blue;
		}

		:global(.null) {
			color: magenta;
		}

		:global(.key) {
			color: gray;
		}
	}
</style>
