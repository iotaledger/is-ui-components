<script lang="ts">
    import Modal from 'sveltestrap/src/Modal.svelte'
    import { Button, ModalBody, ModalFooter, Input, Label, Alert } from 'sveltestrap'

    export let presharedKey
    let isEqual = false

    let open = true
    let color = 'warning'
    let mouseClickOutsideModal
    const toggle = () => {
        if (mouseClickOutsideModal == false) {
            open = !open
        }
    }
    const handleInput = (e) => {
        if (presharedKey == e.target.value) {
            isEqual = true
            mouseClickOutsideModal = false
        } else {
            isEqual = false
        }
    }
</script>

<div>
    <Modal isOpen={open} {toggle}>
        <ModalBody>
            <Alert color="warning">
                <h4 class="alert-heading text-capitalize">{color}</h4>
                This key is not stored anywhere and can't be recovered.
            </Alert>

            Preshared Key: <b>{presharedKey}</b>
            <div class="pt-2">
                <Input
                    type="text"
                    name="text"
                    id="presharedKeyText"
                    placeholder="Copy preshared key here"
                    on:input={handleInput}
                />
                <div />
            </div></ModalBody
        >
        <ModalFooter>
            <Button color="primary" on:click={toggle} disabled={!isEqual}>OK</Button>
        </ModalFooter>
    </Modal>
</div>
