<script lang="ts">
    import Modal from 'sveltestrap/src/Modal.svelte'
    import { Button, ModalBody, ModalFooter, Input, Label, Alert } from 'sveltestrap'

    export let presharedKey: string
    let isEqual = false
    let open = true

    function onSubmit() {
        open = !open
        presharedKey = undefined
    }

    function onPresharedKey(event: any) {
        isEqual = presharedKey === event.target.value
    }
</script>

<div>
    <Modal isOpen={open} toggle={onSubmit} backdrop={false}>
        <ModalBody>
            <Alert color="warning">
                <h4 class="alert-heading text-capitalize">Warning</h4>
                Keep this key in a safe place. This key is not stored by the service and can't be recovered.
            </Alert>
            <p>Share the preshared key with an auditor to grant access to the channel data.</p>
            <span>Preshared Key: </span><b>{presharedKey}</b>
            <div class="pt-3">
                <Input
                    type="text"
                    name="text"
                    id="presharedKeyText"
                    placeholder="Insert preshared key here to continue..."
                    on:input={onPresharedKey}
                />
                <div />
            </div></ModalBody
        >
        <ModalFooter>
            <Button color="primary" on:click={onSubmit} disabled={!isEqual}>OK</Button>
        </ModalFooter>
    </Modal>
</div>
