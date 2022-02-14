<script lang="ts">
	import { UserType } from 'iota-is-sdk';

	import { Person, Organization, Device } from '$icons';

	export let username: string;
	export let type: UserType;

	const ICONS = {
		[UserType.Person]: Person,
		[UserType.Organization]: Organization,
		[UserType.Device]: Device,
		[UserType.Service]: Device,
		[UserType.Unknown]: Device,
		[UserType.Product]: Device
	};
	const SHADOWS = {
		[UserType.Person]: '#d4e5f5',
		[UserType.Organization]: '#d0f3e0',
		[UserType.Device]: '#f8cfe5',
		[UserType.Service]: '#fbffc9',
		[UserType.Unknown]: '#e3d5f4',
		[UserType.Product]: '#ffdaca'
	};
</script>

<div class="d-flex align-items-center">
	<div
		class="bg-icon rounded d-flex justify-content-center align-items-center"
		style="background: {SHADOWS[type]}"
	>
		<svelte:component this={ICONS[type]} />
	</div>
	<div class="username ps-2">{username}</div>
</div>

<style lang="scss">
	.bg-icon {
		width: 20px;
		height: 20px;
		@media (min-width: 990px) {
			width: 32px;
			height: 32px;
		}
	}
	.username {
		font-size: 14px;
		@media (min-width: 990px) {
			font-size: 16px;
		}
	}
</style>
