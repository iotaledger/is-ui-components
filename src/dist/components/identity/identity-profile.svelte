<script lang="ts">
	import { Size } from './../../lib/types/layout';
	import { Icon } from './../../components';
	import { UserType } from 'iota-is-sdk';
	import { Button } from 'sveltestrap';

	export let title: string;
	export let type: UserType | string;
	export let subtitle: string;
	export let size: Size = Size.Small;
	export let hideType = false;
	export let actions: {
		icon: string;
		label: string;
		onClick: () => void;
	}[];

	const ICONS = {
		[UserType.Person]: {
			icon: 'individual',
			shadow: '#d4f0f5'
		},
		[UserType.Organization]: {
			icon: 'organization',
			shadow: '#d0f3e0'
		},
		[UserType.Device]: {
			icon: 'device',
			shadow: '#f8cfe5'
		},
		[UserType.Service]: {
			icon: 'device',
			shadow: '#fbffc9'
		},
		[UserType.Unknown]: {
			icon: 'device',
			shadow: '#e3d5f4'
		},
		[UserType.Product]: {
			icon: 'device',
			shadow: '#ffdaca'
		}
	};

	const CREDENTIAL_ICON = {
		icon: 'credential',
		shadow: '#f8cfe5'
	};

	const PROFILE_STYLES = {
		[Size.Small]: {
			icon: 24,
			titleClasses: 'fs-6',
			subtitleFontSize: '12px'
		},
		[Size.Medium]: {
			icon: 48,
			titleClasses: 'fs-6 fw-bold',
			subtitleFontSize: '12px'
		},
		[Size.Large]: {
			icon: 64,
			titleClasses: 'fs-4 fw-bold',
			subtitleFontSize: '14px'
		}
	};

	// TODO: improve this. It is used to change the icon color when button is hovered.
	let iconColor = '#333333';
	const switchIconColor = () => {
		iconColor = iconColor === '#333333' ? 'white' : '#333333';
	};
	// ---------------------------------------------------------------------------------------------
</script>

<div
	class="d-flex align-items-start align-items-lg-center justify-content-between flex-column flex-lg-row"
>
	<div class="d-flex align-items-center">
		<div
			class="rounded d-flex justify-content-center align-items-center"
			style="background: {ICONS[type]?.shadow ?? CREDENTIAL_ICON.shadow};
		width: {PROFILE_STYLES[size].icon * 1.25}px;
		height: {PROFILE_STYLES[size].icon * 1.25}px;"
		>
			<Icon type={ICONS[type]?.icon ?? CREDENTIAL_ICON.icon} size={PROFILE_STYLES[size].icon} />
		</div>
		<div class="ms-3 ps-2">
			{#if !hideType}
				<div class="subtitle fst-italic">{type}</div>
			{/if}
			<div class={PROFILE_STYLES[size].titleClasses}>{title}</div>
			{#if subtitle}
				<div
					class="subtitle fw-bolder mt-1 text-break"
					style={`font-size: ${PROFILE_STYLES[size].subtitleFontSize}`}
				>
					{subtitle}
				</div>
			{/if}
		</div>
	</div>
	{#if actions}
		{#each actions as { icon, label, onClick }}
			<div on:mouseenter={switchIconColor} on:mouseleave={switchIconColor}>
				<Button
					size="sm"
					outline
					color="dark"
					on:click={onClick}
					class="mt-3 mt-lg-0  d-flex align-items-center"
				>
					{#if icon}
						<Icon type={icon} size={24} color={iconColor} />
					{/if}
					<span class="ml-1">{label}</span>
				</Button>
			</div>
		{/each}
	{/if}
</div>

<style lang="scss">
	.subtitle {
		color: #828282;
	}
</style>
