<script lang="ts">
	import { Dropdown, Icon, IdentityProfile, JSONViewer, Spinner } from '$components';
	import { createJsonDataUrl } from '$lib/utils';
	import type { VerifiableCredentialBody } from 'iota-is-sdk/src';
	import { Button } from 'sveltestrap';

	export let vc: VerifiableCredentialBody;
	export let revoking: boolean;
	export let onRevoke: (vc: VerifiableCredentialBody) => void;

	let { id, issuer, issuanceDate, credentialSubject } = vc;
	let type = vc.type?.[1];
</script>

<div class="credential p-3">
	<Dropdown>
		<div slot="header">
			<IdentityProfile title="Credential" {type} hideType subtitle={type} size="medium" />
		</div>
		<div slot="body">
			<div class="label pt-4">
				<div class="d-flex justify-content-between align-items-center">
					Credential ID
					<div class="actions">
						<div class="box my-2 py-1 px-2 d-flex align-items-center">
							<a
								href={createJsonDataUrl(vc)}
								download={`verifiable-credential-${id}.json`}
								class="download text-decoration-none text-primary ms-1"
							>
								<Icon type="download" />
								<span>Download</span>
							</a>
						</div>
						<Button outline color="danger" disabled={revoking}>
							<div class="d-flex justify-content-center" on:click={() => onRevoke(vc)}>
								<span>{revoking ? 'Revoking...' : 'Revoke'}</span>
								{#if revoking}
									<Spinner compact />
								{/if}
							</div>
						</Button>
					</div>
				</div>
				<div class="text-primary">{id}</div>
			</div>
			<div class="label pt-4">
				Issuer
				<div class="text-primary">{issuer}</div>
			</div>
			<div class="label pt-4">
				Issuance date
				<div class="text-primary">{issuanceDate}</div>
			</div>
			<div class="label pt-4 d-flex">
				<span class="me-2">"credentialSubject":</span>
				<JSONViewer json={JSON.stringify(credentialSubject, null, '\t')} />
			</div>
		</div>
	</Dropdown>
</div>

<style lang="scss">
	.credential {
		background-color: rgb(246, 252, 255);
		border-radius: 6px;
		.label {
			font-weight: 500;
			font-size: 12px;
			color: #828282;
		}
		.actions div {
			font-weight: 600;
			font-size: 14px;
		}
	}
</style>
