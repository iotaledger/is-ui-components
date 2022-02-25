<script context="module" lang="ts">
	export const prerender = true;
</script>

<script lang="ts">
	import { VerifyCredential } from './../components';
	import { Col, Container, Row } from 'sveltestrap';
</script>

<svelte:head>
	<title>Login / Register</title>
</svelte:head>

<Container class="my-5">
	<Row>
		<Col sm="12" md={{ size: 10, offset: 1 }} lg={{ size: 6, offset: 3 }}>
			<VerifyCredential />
		</Col>
	</Row>
</Container>
