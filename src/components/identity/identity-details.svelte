<script lang="ts">
	import { Credential, IdentityProfile } from '$components';
	import { UserType } from 'iota-is-sdk';

	export let username: string;
	export let type: UserType;
	export let id: string;
	export let verifiableCredentials = [];
</script>

<div class="identity-details w-100">
	<div class="bg-light rounded p-4">
		<IdentityProfile title={username} {type} subtitle={id} size="large" />
	</div>
	<div class="credentials">
		{#each verifiableCredentials as vc}
			<div class="credential mt-4">
				<Credential {vc} />
			</div>
		{/each}
	</div>
</div>
