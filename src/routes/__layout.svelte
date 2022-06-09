<script lang="ts" context="module">
    import { settingsStore } from '$lib/app/settings'
    export async function load({ fetch }) {
        const url = '/settings.json'
        const res = await fetch(url)
        if (res.ok) {
            const settings = await res.json()
            settingsStore.set(settings)
            console.log('response:', JSON.stringify(settings))
            return {
                status: res.status,
            }
        }
        return {
            status: res.status,
            error: new Error('Could not load the settings.'),
        }
    }
</script>

<script lang="ts">
    export const SITE_PAGES = [
        { title: 'Identity Manager', url: '/identity-manager' },
        { title: 'Streams Manager', url: '/streams-manager' },
        { title: 'Channel History', url: '/history' },
        { title: 'Verify Credential', url: '/verify-credential' },
    ]
    import { startPollExpirationCheckJWT, stopPollExpirationCheckJWT } from '$lib/app/base'
    import { Icon, NotificationManager } from '$lib/components'
    import '$lib/scss/index.scss'
    import 'bootstrap/dist/css/bootstrap.min.css'
    import { onMount } from 'svelte'
    import { Collapse, Nav, Navbar, NavbarBrand, NavbarToggler, NavItem, NavLink } from 'sveltestrap'

    let isOpen = false

    onMount(() => {
        startPollExpirationCheckJWT()
        return () => {
            stopPollExpirationCheckJWT()
        }
    })

    function handleCollapse(event) {
        isOpen = event.detail.isOpen
    }
</script>

<Navbar color="light" light expand="md">
    <NavbarBrand href="/">
        <div class="bg-primary rounded me-2 d-flex align-items-center">
            <Icon type="iota-logo" size={48} color="transparent" />
        </div>
        <div class="info">
            <h1 class="mb-0">Integration Services</h1>
            <h2 class="mb-0">UI Components</h2>
        </div>
    </NavbarBrand>
    <NavbarToggler on:click={() => (isOpen = !isOpen)} />
    <Collapse {isOpen} navbar expand="md" on:update={handleCollapse}>
        <Nav class="ms-auto" navbar>
            {#each SITE_PAGES as page}
                <NavItem>
                    <NavLink href={page.url}>{page.title}</NavLink>
                </NavItem>
            {/each}
        </Nav>
    </Collapse>
</Navbar>

<main>
    <slot />
</main>

<NotificationManager />

<style lang="scss">
    :global(.navbar) {
        :global(.navbar-brand) {
            display: flex;

            .info {
                h1 {
                    font-size: 20px;
                    font-weight: 600;
                }
                h2 {
                    font-size: 16px;
                }
            }
        }
        :global(.nav-link) {
            @media (min-width: 990px) {
                margin-right: 16px;
            }
        }
    }
</style>
