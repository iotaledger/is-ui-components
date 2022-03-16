<script lang="ts">
    import { Icon } from '$lib/components'
    // We have to import Input this way, otherwise it shouts SSR issues.
    import Input from 'sveltestrap/src/Input.svelte'

    export let value
    export let placeholder = ''
    export let onSubmit = (..._: any[]): void => {}
</script>

<div class="search position-relative">
    <Input
        type="text"
        {placeholder}
        autofocus
        class="position-relative ps-5"
        bind:value
        on:keypress={(e) => {
            if (e.key === 'Enter') onSubmit()
        }}
    />
    <button class="border-0 bg-transparent position-absolute" on:click={onSubmit}>
        <Icon type="search" size={16} />
    </button>
</div>

<style lang="scss">
    .search {
        button {
            top: 50%;
            left: 8px;
            transform: translateY(-50%);
        }
    }
</style>
