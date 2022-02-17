<script context="module" lang="ts">
	export const prerender = true;
</script>

<script lang="ts">
	import { IdentityManager } from './../dist/components';
	import { Col, Container, Row } from 'sveltestrap';
</script>

<svelte:head>
	<title>Login / Register</title>
</svelte:head>

<Container class="my-5">
	<Row>
		<Col sm="12">
			<IdentityManager />
		</Col>
	</Row>
</Container>
