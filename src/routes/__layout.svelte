<script context="module" lang="ts">
    export const SITE_PAGES = [
        { title: 'Identity Manager', url: '/identity-manager' },
        { title: 'Streams Manager', url: '/streams-manager' },
        { title: 'Channel History', url: '/history' },
        { title: 'Verify Credential', url: '/verify-credential' },
    ]
</script>

<script lang="ts">
    import { startPollExpirationCheckJWT, stopPollExpirationCheckJWT } from '$lib/app/base'
    import { Icon, NotificationManager } from '$lib/components'
    import { goto } from '$app/navigation'
    import { logout, isAuthenticated } from '$lib/app'
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

    async function _logout() {
        logout()
        goto('/')
    }

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
            {#if $isAuthenticated}
                <NavItem><hr class="me-3" /></NavItem>
                <NavItem><NavLink on:click={_logout}>Logout</NavLink></NavItem>
            {/if}
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
