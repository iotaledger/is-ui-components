<script context="module" lang="ts">
	export const prerender = true;
</script>

<script lang="ts">
	import { Registration, Login } from '$components';
	import { Container, Row, Col } from 'sveltestrap';
</script>

<svelte:head>
	<title>Login / Register</title>
</svelte:head>

<div class="login-register">
	<Container>
		<Row cols={{ lg: 3, md: 2, xs: 1 }}>
			<Col>
				<div class="box">
					<h3>Registration</h3>
					<Registration />
				</div>
			</Col>
			<Col>
				<div class="box">
					<h3>Login</h3>
					<Login />
				</div>
			</Col>
		</Row>
	</Container>
</div>

<style lang="scss">
	.login-register {
		margin-top: 30px;
		:global(.col) {
			margin-bottom: 30px;
		}
		.box {
			border: 1px solid #cccc;
			padding: 30px 20px;
			border-radius: 10px;
			height: 100%;
			box-shadow: rgba(0, 0, 0, 0.1) 0px 4px 12px;

			h3 {
				font-size: 16px;
				text-transform: uppercase;
				color: #118cff;
				margin-bottom: 24px;
			}
		}
	}
</style>
