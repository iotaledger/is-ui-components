<script lang="ts">
	import type { VerifiableCredentialBody } from 'iota-is-sdk/src';
	import {
		Accordion,
		AccordionItem,
		Button,
		Spinner,
		ModalHeader,
		ModalBody,
		ModalFooter
	} from 'sveltestrap';
	// We have to import Modal this way, otherwise it shouts SSR issues.
	import Modal from 'sveltestrap/src/Modal.svelte';
	import { Icon, JSONViewer } from './../../components';
	import { CREDENTIAL_ICON } from './../../lib/constants/identity';
	import { createJsonDataUrl } from './../../lib/utils';

	export let vc: VerifiableCredentialBody;
	export let revoking: boolean;
	export let onRevoke: (vc: VerifiableCredentialBody) => void;

	let { id, issuer, issuanceDate, credentialSubject } = vc;
	let type = vc.type?.[1];
	let isOpen = false;
	const onModalClose = () => (isOpen = !isOpen);
</script>

<Accordion>
	<AccordionItem>
		<div slot="header" class="d-flex align-items-center">
			<Icon type={CREDENTIAL_ICON.icon} boxed boxColor={CREDENTIAL_ICON.boxColor} size={48} />
			<div class="ms-4">
				<div class="fs-6 fw-bold">Credential</div>
				<div class="vc-type fw-bold text-secondary mt-1">
					{type}
				</div>
			</div>
		</div>
		<div class="my-4">
			<div class="d-flex justify-content-between">
				<div>
					<div class="label">
						Credential ID
						<div class="text-break text-secondary">{id}</div>
					</div>
					<div class="label mt-4">
						Issuer
						<div class="text-break text-secondary">{issuer}</div>
					</div>
					<div class="label mt-4">
						Issuance date
						<div class="text-secondary">{issuanceDate}</div>
					</div>
				</div>
				<div class="d-flex flex-column">
					<a
						class="btn btn-sm btn-outline-info text-decoration-none ms-auto"
						href={createJsonDataUrl(vc)}
						download={`verifiable-credential-${id}.json`}
					>
						<Icon type="download" />
						<span>Download</span>
					</a>
					<Button
						size="sm"
						outline
						color="danger"
						disabled={revoking}
						class="ms-auto mt-2"
						on:click={onModalClose}
					>
						<div class="d-flex justify-content-center">
							<span>{revoking ? 'Revoking...' : 'Revoke'}</span>
							<Modal {isOpen} toggle={onModalClose}>
								<div class="p-3 d-flex flex-column">
									<ModalHeader toggle={onModalClose}>Are you sure?</ModalHeader>
									<ModalBody>
										<div class="break-all">
											Credential with ID <span class="fw-light">{id}</span> is going to be revoked.
										</div>
									</ModalBody>
									<ModalFooter>
										<Button
											color="danger"
											on:click={() => {
												onRevoke(vc);
											}}
											>{#if revoking}
												<span>Revoking...</span>
												<Spinner size="sm" type="border" color="light" class="ms-1" />
											{:else}
												Yes, revoke
											{/if}</Button
										>
										<Button color="secondary" on:click={onModalClose}>Cancel</Button>
									</ModalFooter>
								</div>
							</Modal>
						</div>
					</Button>
				</div>
			</div>
			<div>
				<div class="label mt-4">JSON content</div>
				<div class="mt-1 p-4 bg-light rounded">
					<JSONViewer json={JSON.stringify(credentialSubject, null, '\t')} />
				</div>
			</div>
		</div>
	</AccordionItem>
</Accordion>

<style lang="scss">
	.vc-type {
		font-size: 12px;
	}
	.label {
		font-weight: 500;
		font-size: 12px;
	}
	.actions div {
		font-weight: 600;
		font-size: 14px;
	}

	.break-all {
		word-break: break-all;
	}
</style>
