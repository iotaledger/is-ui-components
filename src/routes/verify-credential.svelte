<script context="module" lang="ts">
    export const prerender = true
</script>

<script lang="ts">
    import { VerifyCredentialManager } from '$lib/components'
    import { Col, Container, Row } from 'sveltestrap'
</script>

<svelte:head>
    <title>Verify Credential</title>
</svelte:head>

<Container class="my-5">
    <Row>
        <Col sm="12" md={{ size: 10, offset: 1 }} lg={{ size: 6, offset: 3 }}>
            <VerifyCredentialManager />
        </Col>
    </Row>
</Container>
