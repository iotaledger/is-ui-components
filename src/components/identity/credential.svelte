<script lang="ts">
	import { Dropdown, Icon, IdentityProfile, JSONViewer } from '$components';
	import { createJsonDataUrl } from '$lib/utils';
	import type { VerifiableCredentialBody } from 'iota-is-sdk/src';

	export let vc: VerifiableCredentialBody;

	let { id, issuer, issuanceDate, credentialSubject } = vc;
	let type = vc.type?.[1];
</script>

<div class="credential p-3">
	<Dropdown>
		<div slot="header">
			<IdentityProfile title="Credential" {type} hideType subtitle={type} size="medium" />
		</div>
		<div slot="body">
			<div class="download position-absolute">
				<a
					href={createJsonDataUrl(vc)}
					download={`verifiable-credential-${id}.json`}
					class="download text-decoration-none text-primary ms-1"
				>
					<Icon type="download" />
					<span>Download</span>
				</a>
			</div>
			<div class="label pt-4">
				<span>Credential ID</span>
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
		.download {
			top: 8px;
			right: 24px;
			font-weight: 600;
			font-size: 14px;
		}
	}
</style>
