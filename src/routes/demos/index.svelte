<script context="module" lang="ts">
    export const DEMOS = [
        { title: 'Authentication', url: '/demos/authentication' },
        { title: 'Device Manager', url: '/demos/device' },
    ]
</script>

<script lang="ts">
    import { Col, Container, ListGroup, ListGroupItem, Row } from 'sveltestrap'
</script>

<Container class="py-5">
    <Row>
        <Col sm="12" lg={{ size: 6, offset: 3 }}>
            <h1>Demos:</h1>
        </Col>
    </Row>
    <Row>
        <Col sm="12" lg={{ size: 6, offset: 3 }}>
            <ListGroup flush>
                {#each DEMOS as demo, index}
                    <ListGroupItem tag="a" href={demo.url}>{index}. {demo.title}</ListGroupItem>
                {/each}
            </ListGroup>
        </Col>
    </Row>
</Container>
