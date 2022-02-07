<script context="module" lang="ts">
	export const prerender = true;
</script>

<script lang="ts">
	import { Container, Row, Col, ListGroup, ListGroupItem } from 'sveltestrap';
	const SITE_PAGES = [
		{ title: 'Register and Login', url: '/login-register' },
		{ title: 'SSI Bridge', url: '/ssi-bridge' },
		{ title: 'Audit Trail', url: '/audit-trail' },
		{ title: 'Admin Page', url: '/admin' }
	];
</script>

<svelte:head>
	<title>IS-UI Components</title>
</svelte:head>
<div class="homepage">
	<Container>
		<Row>
			<Col sm="12" lg={{ size: 6, offset: 3 }}>
				<ListGroup flush>
					{#each SITE_PAGES as page}
						<ListGroupItem tag="a" href={page.url}>{page.title}</ListGroupItem>
					{/each}
				</ListGroup>
			</Col>
		</Row>
	</Container>
</div>

<style lang="scss">
	.homepage {
		margin-top: 30px;
		:global(.list-group-item) {
			padding-top: 30px;
			padding-bottom: 30px;
		}
	}
</style>
