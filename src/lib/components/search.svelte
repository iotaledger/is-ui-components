<script lang="ts">
    import { DEFAULT_USERS } from '$lib/app/constants/identity'
    import { identityClient } from '$lib/app/base'
    import { searchCriteria, User, UserType } from 'boxfish-studio--iota-is-sdk'
    import { Button, FormGroup, Input, ListGroup, ListGroupItem, TabContent, TabPane } from 'sveltestrap'

    let id
    let username
    let type = UserType.Person
    let registrationDate
    let users: User[] = []

    const onSubmit = async (byId = false) => {
        if (byId) {
            let user = await identityClient.find(id)
            if (user) {
                users[0] = user
            }
        } else {
            users = await identityClient.search({
                type,
                username,
                registrationDate,
                limit: 100,
            } as searchCriteria)
        }
    }

    const resetUsers = () => {
        users = []
    }
</script>

<TabContent on:tab={resetUsers}>
    <TabPane tabId="fields" tab="By fields" active>
        <div class="mt-4">
            <FormGroup floating label="Username">
                <Input type="text" placeholder="Username" bind:value={username} on:change={resetUsers} />
            </FormGroup>
            <FormGroup floating label="Registration date">
                <Input type="date" placeholder="Registration date" bind:value={registrationDate} on:change={resetUsers} />
            </FormGroup>
            <FormGroup floating label="Type">
                <Input type="select" name="select" bind:value={type} on:change={resetUsers}>
                    {#each DEFAULT_USERS as _user, i}
                        <option value={_user.type}>
                            {_user.type}
                        </option>
                    {/each}
                </Input>
            </FormGroup>

            <Button color="primary" on:click={() => onSubmit()}>Search identities</Button>
        </div>
    </TabPane>
    <TabPane tabId="id" tab="By id">
        <div class="mt-4">
            <FormGroup floating label="Id*">
                <Input type="text" placeholder="Id*" bind:value={id} />
            </FormGroup>
            <Button color="primary" disabled={id === ''} on:click={() => onSubmit(true)}>Search identity</Button>
        </div>
    </TabPane>
</TabContent>

<div class="mt-4">
    {#if users}
        <ListGroup>
            {#each users as user}
                <ListGroupItem>
                    <div>
                        {user.username}
                    </div>
                    <div class="id">
                        {user.id}
                    </div>
                </ListGroupItem>
            {/each}
        </ListGroup>
    {/if}
</div>

<style lang="scss">
    .id {
        word-break: break-all;
    }
</style>
