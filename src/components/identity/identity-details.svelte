<script lang="ts">
	import type { UserType } from 'iota-is-sdk';
	import { Button } from 'sveltestrap';
	import { CreateCredential, Credential, Icon } from './../../components';
	import { USER_ICONS } from './../../lib/constants/identity';
	import { revokeVC, searchIdentities, updateSelectedIdentity } from './../../lib/identity';

	export let username: string;
	export let type: UserType;
	export let id: string;
	export let verifiableCredentials = [];

	enum State {
		Details = 'details',
		AddCredential = 'addCredential'
	}

	let state: State = State.Details;
	let revoking: boolean = false;

	const switchToDetails = () => (state = State.Details);
	const switchToAddCredential = () => (state = State.AddCredential);

	const handleRevoke = async (vc) => {
		revoking = true;
		await revokeVC({ signatureValue: vc.proof.signatureValue });
		await updateCredentials();
		revoking = false;
	};

	const updateCredentials = async () => {
		const identities = await searchIdentities(id);
		const foundIdentity = identities?.[0];
		if (foundIdentity) {
			updateSelectedIdentity(foundIdentity);
		}
	};

	// TODO: improve this. It is used to change the icon color when button is hovered.
	let iconColor = '#333333';
	const switchIconColor = () => {
		iconColor = iconColor === '#333333' ? 'white' : '#333333';
	};
	// ---------------------------------------------------------------------------------------------
</script>

<div class="identity-details w-100">
	<div class="d-flex align-items-center justify-content-between bg-light rounded p-4">
		<div class="d-flex">
			<Icon type={USER_ICONS[type].icon} size={64} boxed boxColor={USER_ICONS[type].shadow} />
			<div class="ms-4">
				<div class="text-secondary fst-italic">{type}</div>
				<div class="fs-4 fw-bold">{username}</div>
				<div class="text-secondary fw-bolder mt-1">{id}</div>
			</div>
		</div>
		<div class="d-flex align-items-center">
			<div on:mouseenter={switchIconColor} on:mouseleave={switchIconColor}>
				<Button
					size="sm"
					outline
					color="dark"
					on:click={switchToAddCredential}
					class="mt-3 mt-lg-0  d-flex align-items-center"
				>
					<Icon type="plus" size={24} color={iconColor} />
					<span class="ml-1">Add credential</span>
				</Button>
			</div>
		</div>
	</div>
	<div class="credentials">
		{#each verifiableCredentials as vc}
			<div class="credential mt-4">
				{#key vc}
					<Credential {vc} {revoking} onRevoke={handleRevoke} />
				{/key}
			</div>
		{/each}
	</div>

	<CreateCredential
		isOpen={state === State.AddCredential}
		onModalClose={switchToDetails}
		targetDid={id}
		onCreateSuccess={updateCredentials}
	/>
</div>
