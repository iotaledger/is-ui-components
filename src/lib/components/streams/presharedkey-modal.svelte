<script lang="ts">
    import Modal from 'sveltestrap/src/Modal.svelte'
    import { Button, ModalBody, ModalFooter, ModalHeader } from 'sveltestrap'

    export let presharedKey

    let open = true;
    const toggle = () => (open = !open);
</script>

<div>
  <Modal isOpen={open} {toggle}>
    <ModalHeader {toggle}>Preshared Key</ModalHeader>
    <ModalBody>
      <h4>This key is not stored anywhere and can't be recovered.</h4>
      <b><i>{presharedKey}</i></b>
    </ModalBody>
    <ModalFooter>
      <Button color="secondary" on:click={toggle}>Cancel</Button>
    </ModalFooter>
  </Modal>
</div>

