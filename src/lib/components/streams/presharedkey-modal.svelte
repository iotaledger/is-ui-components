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
    <Modal isOpen={open} toggle={onSubmit}>
        <ModalBody>
            <Alert color="warning">
                <h4 class="alert-heading text-capitalize">Warning</h4>
                This key is not stored anywhere and can't be recovered.
            </Alert>

            Preshared Key: <b>{presharedKey}</b>
            <div class="pt-2">
                <Input
                    type="text"
                    name="text"
                    id="presharedKeyText"
                    placeholder="Insert preshared key here"
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
