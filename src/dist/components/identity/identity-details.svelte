<script lang="ts">
	import { Credential, IdentityProfile, CreateCredential } from './../../components';
	import { revokeVC, searchIdentities, updateSelectedIdentity } from './../../lib/identity';
	import type { UserType } from 'iota-is-sdk';

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

	const ACTIONS = [
		{
			label: 'Add credential',
			icon: 'plus',
			onClick: switchToAddCredential
		}
	];

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
</script>

<div class="identity-details w-100">
	<div class="bg-light rounded p-4">
		<IdentityProfile title={username} {type} subtitle={id} size="large" actions={ACTIONS} />
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
