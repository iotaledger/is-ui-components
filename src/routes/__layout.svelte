<script lang="ts">
	import { Logo } from '$icons/';
	import 'bootstrap/dist/css/bootstrap.min.css';
	import { Collapse, Navbar, NavbarToggler, NavbarBrand, Nav, NavItem, NavLink } from 'sveltestrap';

	let isOpen = false;

	function handleCollapse(event) {
		isOpen = event.detail.isOpen;
	}
	const SITE_PAGES = [
		{ title: 'Register and Login', url: '/login-register' },
		{ title: 'SSI Bridge', url: '/ssi-bridge' },
		{ title: 'Audit Trail', url: '/audit-trail' },
		{ title: 'Admin Page', url: '/admin' }
	];
</script>

<Navbar color="light" light expand="md">
	<NavbarBrand href="/">
		<div class="logo-wrapper me-4 rounded-1">
			<Logo />
		</div>

		<div class="info">
			<h1 class="mb-0">Integration Services</h1>
			<h2 class="mb-0">UI Components</h2>
		</div>
	</NavbarBrand>
	<NavbarToggler on:click={() => (isOpen = !isOpen)} />
	<Collapse {isOpen} navbar expand="md" on:update={handleCollapse}>
		<Nav class="ms-auto" navbar>
			{#each SITE_PAGES as page}
				<NavItem>
					<NavLink href={page.url}>{page.title}</NavLink>
				</NavItem>
			{/each}
		</Nav>
	</Collapse>
</Navbar>

<main>
	<slot />
</main>

<style lang="scss">
	:global(.navbar) {
		:global(.navbar-brand) {
			display: flex;

			.logo-wrapper {
				background-color: #108cff;
			}
			.info {
				h1 {
					font-size: 20px;
				}
				h2 {
					font-size: 16px;
				}
			}
		}
		:global(.nav-link) {
			@media (min-width: 990px) {
				margin-right: 16px;
			}
		}
	}
</style>
