<script lang="ts">
	import { CreateCredential, Credential, IdentityProfile } from '$components';
	import { searchIdentities, updateSelectedIdentity } from '$lib/identity';
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

	const switchToDetails = () => (state = State.Details);
	const switchToAddCredential = () => (state = State.AddCredential);

	const ACTIONS = [
		{
			label: 'Add credential',
			icon: 'plus',
			onClick: switchToAddCredential
		}
	];

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
				<Credential {vc} />
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
