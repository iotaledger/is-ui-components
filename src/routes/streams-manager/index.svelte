<script context="module" lang="ts">
    export const prerender = true
</script>

<script lang="ts">
    import { StreamsManager } from '$lib/components'
    import { Col, Container, Row } from 'sveltestrap'
</script>

<svelte:head>
    <title>Streams Manager</title>
</svelte:head>

<Container class="my-5">
    <Row>
        <Col sm="12" md={{ size: 10, offset: 1 }}>
            <StreamsManager />
        </Col>
    </Row>
</Container>
