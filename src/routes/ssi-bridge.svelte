<script context="module" lang="ts">
	export const prerender = true;
</script>

<script lang="ts">
	import { Col, Container, Row } from 'sveltestrap';
	import { CreateVC, Details, Search, VerifyVC } from './../components';
</script>

<svelte:head>
	<title>SSI Bridge</title>
</svelte:head>

<div class="ssi-bridge">
	<Container>
		<Row cols={{ lg: 3, md: 2, xs: 1 }}>
			<Col>
				<div class="box">
					<h3>Create VC</h3>
					<CreateVC />
				</div>
			</Col>
			<!-- <Col>
				<div class="box">
					<h3>VC Verification</h3>
					<VerifyVC />
				</div>
			</Col> -->
			<Col>
				<div class="box">
					<h3>Search</h3>
					<Search />
				</div>
			</Col>
			<Col>
				<div class="box">
					<h3>Details</h3>
					<Details id="did:iota:BSxL2R763rGfJHCRVH3GAWHiwDaqjdV9ScxQedNugiwo" />
				</div>
			</Col>
		</Row>
	</Container>
</div>

<style lang="scss">
	.ssi-bridge {
		margin-top: 30px;
		h3 {
			font-size: 16px;
			text-transform: uppercase;
			color: #118cff;
			margin-bottom: 24px;
		}
		:global(.col) {
			margin-bottom: 30px;
		}
		.box {
			padding: 30px 20px;
			height: 100%;
		}
	}
</style>
