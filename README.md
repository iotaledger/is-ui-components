<!-- This READM is based on the BEST-README-Template (https://github.com/othneildrew/Best-README-Template) -->
<div id="top"></div>
<!--
*** Thanks for checking out the Best-README-Template. If you have a suggestion
*** that would make this better, please fork the repo and create a pull request
*** or simply open an issue with the tag "enhancement".
*** Don't forget to give the project a star!
*** Thanks again! Now go create something AMAZING! :D
-->

<!-- PROJECT SHIELDS -->
<!--
*** I'm using markdown "reference style" links for readability.
*** Reference links are enclosed in brackets [ ] instead of parentheses ( ).
*** See the bottom of this document for the declaration of the reference variables
*** for contributors-url, forks-url, etc. This is an optional, concise syntax you may use.
*** https://www.markdownguide.org/basic-syntax/#reference-style-links
-->

[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![Apache 2.0 license][license-shield]][license-url]
[![Discord][discord-shield]][discord-url]
[![StackExchange][stackexchange-shield]][stackexchange-url]

<!-- Add additional Badges. Some examples >
![Format Badge](https://github.com/iotaledger/is-ui-components/workflows/Format/badge.svg "Format Badge")
![Audit Badge](https://github.com/iotaledger/is-ui-components/workflows/Audit/badge.svg "Audit Badge")
![Clippy Badge](https://github.com/iotaledger/is-ui-components/workflows/Clippy/badge.svg "Clippy Badge")
![BuildBadge](https://github.com/iotaledger/is-ui-components/workflows/Build/badge.svg "Build Badge")
![Test Badge](https://github.com/iotaledger/is-ui-components/workflows/Test/badge.svg "Test Badge")
![Coverage Badge](https://coveralls.io/repos/github/iotaledger/is-ui-components/badge.svg "Coverage Badge")


<!-- PROJECT LOGO -->
<br />
<div align="center">
    <a href="https://github.com/iotaledger/is-ui-components">
        <img src="banner.png" alt="Banner">
    </a>
    <h3 align="center">Integration Services UI Components</h3>
    <p align="center">
        Collection of <a href="https://github.com/iotaledger/integration-services/">Integration Services</a> UI components, Svelte stores and useful functions than can be used in SvelteKit webapps.
        <br />
        <a href="https://wiki.iota.org"><strong>Explore the docs »</strong></a>
        <br />
        <br />
        <a href="https://github.com/iotaledger/is-ui-components/labels/bug">Report Bug</a>
        ·
        <a href="https://github.com/iotaledger/is-ui-components/labels/request">Request Feature</a>
    </p>
</div>

<!-- TABLE OF CONTENTS -->
<!-- TODO
Edit the ToC to your needs. If your project is part of the wiki, you should link directly to the Wiki where possible and remove unneeded sections to prevent duplicates
-->
<!--
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
    </li>
    <li>
      <a href="#authentication">Authentication</a>
      <ul>
        <li><a href="#stores">Stores</a></li>
        <li><a href="#ui-components">UI Components</a>
        <ul>
          <li><a href="#isolated-components">Isolated components</a></li>
          <li><a href="#manager">Manager</a></li>
        </ul>
        </li>
        <li><a href="#functions">Functions</a>
      </ul>
    </li>
    <li>
      <a href="#identities">Identities</a>
      <ul>
        <li><a href="#stores">Stores</a></li>
        <li><a href="#ui-components">UI Components</a>
        <ul>
          <li><a href="#isolated-components">Isolated components</a></li>
          <li><a href="#manager">Manager</a></li>
        </ul>
        </li>
        <li><a href="#functions">Functions</a>
        <li><a href="#functions">Credentials verifier (manager)</a>
      </ul>
    </li>
    <li>
      <a href="#credential-verifier-manager">Credentials verifier (manager)</a>
      <ul>
        <li><a href="#ui-components">UI Components</a></li>
        <li><a href="#functions">Functions</a>
      </ul>
    </li>
    <li>
      <a href="#streams">Streams</a>
      <ul>
        <li><a href="#stores">Stores</a></li>
        <li><a href="#ui-components">UI Components</a>
        <ul>
          <li><a href="#isolated-components">Isolated components</a></li>
          <li><a href="#manager">Manager</a></li>
        </ul>
        </li>
        <li><a href="#functions">Functions</a>
      </ul>
    </li>
    <li>
      <a href="#notification-stream">Notifications system</a>
      <ul>
        <li><a href="#stores">Stores</a></li>
        <li><a href="#ui-components">UI Components</a>
        <ul>
          <li><a href="#manager">Manager</a></li>
        </ul>
        </li>
        <li><a href="#functions">Functions</a>
      </ul>
    </li>
    <li><a href="#color-customization">Color customization</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#authors">Authors</a></li>
    <li><a href="#default-templates">Default templates</a>
      <ul>
        <li><a href="#manager">Default table configuration</a></li>
        <li><a href="#manager">Credentials template</a></li>
        <li><a href="#manager">Identities template</a></li>
      </ul>
    </li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
    <li><a href="#acknowledgments">Acknowledgments</a></li>
  </ol>
</details>
-->

<!-- ABOUT THE PROJECT -->

## About The Project

This library aim to provide a rich set of reusable components to interact
with IOTA Integration Services. Those components simplify the creation of
Svelte-based UI that manage: Decentralize Identities, Secure Auditable
Channels and Verifiable Credentials.

<p align="right">(<a href="#top">back to top</a>)</p>

<!-- TODO
This section should list any major frameworks/libraries used to bootstrap your project. Leave any add-ons/plugins for the acknowledgements section. Here are a few examples:
-->

### Built With

-   [Svelte](https://svelte.dev/)

<p align="right">(<a href="#top">back to top</a>)</p>

<!-- GETTING STARTED -->

## Getting Started

1. Add the `@iota/is-ui-components` package

```bash
$ npm i @iota/is-ui-components
```

2. Create a `.env` in the root of the projects and add the corresponding necessary configuration:

```bash
VITE_IOTA_IS_SDK_API_KEY="XXXXXXXXXX"
# Use VITE_IOTA_IS_SDK_GATEWAY_URL for a single gateway url
VITE_IOTA_IS_SDK_GATEWAY_URL="XXXXXXXXXX"
# Use SSI Bridge & Audit Trail urls when you have separated instances
VITE_IOTA_IS_SDK_SSI_BRIDGE_URL="XXXXXXXXXX"
VITE_IOTA_IS_SDK_AUDIT_TRAIL_URL="XXXXXXXXXX"
```

If you dont add this file the IOTA IS SDK will use the default values

## Authentication

### Stores

This library creates a persistent Svelte Store that allows the data necessary for authentication to be stored in the browser's `localStorage` object. We can import it using:

```js
import { authenticationData } from '@iota/is-ui-components'
```

-   `authenticationData`
    -   `jwt`: token necessary to send authenticated requests to Integration Services Rest API
    -   `did`: identity identifier

The library also provides Derived stores that allow access to some relevant data related to authentication. They can be imported as follows:

```js
import { authenticatedUserDID, isAuthenticated } from '@iota/is-ui-components'
```

-   `authenticatedUserDID`: identity logged identifier
-   `isAuthenticated`: true if there is an identity authenticated and JWT is not expired.

### UI Components

The library allows the use of Svelte components that we can group into isolated components that fulfill an independent function (they are like a piece of a puzzle) and manager components that form a complete puzzle from some isolated components.

#### Isolated components

Isolated components can be imported from the library as follows:

```js
import { Login, Logout, Register, RegisterSuccess } from '@iota/is-ui-components'
```

These components can be customized by adjusting their props:

-   `Login`: panel that allows the authentication of an identity by dragging or selecting the json file that defines it.
    -   `switchToRegister`: function that is executed if we want to create a new identity (e.g change the view to offer an identity registration form)
    -   `onSuccess`: function that is executed when the login has been successful
-   `Logout`: panel to be able to log out
    -   `switchToLogin`: function that is executed if we want to log in an identity (e.g change the view to offer an identity login form)
-   `Register`: panel to create a new identity
    -   `switchToLogin`: function that is executed if we want to log in an identity (e.g change the view to offer an identity login form)
    -   `onSuccess`: function that is executed when the identity has been successfully created.
    -   `identitiesTemplate`: identities template with type and fields that can be created. By default [this template](#identities-template) is used.
-   `RegisterSuccess`: show info (type and username) of an identity and allow download it as a JSON file
    -   `identity`: identity JSON object created
    -   `type`: identity type
    -   `username`: identity username

#### Manager

We can put several of the isolated components together to form a manager that has greater logical complexity. The library offers a manager that allows you to manage the login, logout and registration of a new identity, as well as the possibility of downloading it in JSON format once it has been created. This manager can be imported as follows:

```js
import { LoginRegisterManager } from '@iota/is-ui-components'
```

This manager can be customized through the adjustment of its props:

-   `LoginRegisterManager`: show info (type and username) of an identity and allow download it as a JSON file
    -   `onLoginSuccess`: function that is executed when the login has been successful
    -   `identitiesTemplate`: identities template with type and fields that can be created. By default [this template](#identities-templates) is used.

### Functions

The library offers functions that can be used to facilitate the authentication process. To import them it is necessary to do it in the following way:

```js
import { authenticate, logout } from '@iota/is-ui-components'
```

-   `authenticate(id, secret)`: Allows to authenticate an identity. Returns `true` if authentication is successful or `false` if not.
    -   `id`: identity to be authenticated identifier
    -   `secret`: secret of identity to be authenticated
-   `logout()`:Allows you to log out of an identity
-   `isJwtExpired(token)`:Allows you to know if a JWT is expired or not (returns true if expired and false if not expired). In case JWT is expired, logout function is called and user has to log in again.

## Identities

### Stores

The library exposes Writable Stores where relevant data regarding identity management is stored. . We can import them using:

```js
import { searchIdentitiesResults, selectedIdentity, isLoadingIdentities } from '@iota/is-ui-components'
```

-   `searchIdentitiesResults`: an array with all the identities that result from the search

-   `selectedIdentity`: displays the details of the selected identity

-   `isLoadingIdentities`: `true` if the library is busy searching for identities

### UI Components

The library allows the use of Svelte components that we can group into isolated components that fulfill an independent function (they are like a piece of a puzzle) and manager components that form a complete puzzle from some isolated components.

#### Isolated components

Isolated components can be imported from the library as follows:

```js
import {
    IdentityList,
    IdentityDetails,
    CreateIdentityModal,
    CreateIdentityForm,
    Credential,
    CreateCredentialModal,
} from '@iota/is-ui-components'
```

These components can be customized by adjusting their props:

-   `IdentityList`: list of identities.

    -   `title`: list title (by default: `Identities`)
    -   `tableData`: table data
    -   `loading`: if `true` a spinner is rendered
    -   `actionButtons`: array with button actions available in the list
    -   `message`: message shown if there is no data in the table
    -   `showSearch`: if `true` the search is available in the list
    -   `onSearch`: function that is executed when searching. By default it executes an standard search by identity did, type and username.
    -   `searchQuery`: query placeholder
    -   `tableConfiguration`: table configuration. [This config](#default-table-configuration) is used by default.

-   `IdentityDetails`: it shows information details of a specific identity. We can see general information like DID, type or username. We can see also more advanced info like its claims or its verifiable credentials.
    -   `identity`: the identity to see the details
    -   `loading`: if `true`a spinner is rendered.
    -   `onRevokeSuccess`: function that is executed when a specific credential is successfully revoked.
    -   `actionButtons`: set of buttons that calls additional actions.
-   `CreateIdentityForm`: form with the fields necessary to create an identity
    -   `onSuccess`: function that is executed when an identity is created successfully.
    -   `identitiesTemplate`: identities template with type and fields that can be created. By default [this template](#identities-templates) is used.
-   `CreateIdentityModal`: modal that allows to create an identity
    -   `title`: list title (by default: `Create identity`)
    -   `isOpen`: if `true`modal is opened
    -   `onModalClose`: function that will be executed when the modal is closed
    -   `onSuccess`: function that will be executed when identity is successfully created
    -   `identitiesTemplate`: identities template with type and fields that can be created. By default [this template](#identities-templates) is used.
-   `Credential`: accordion that show data of a specific credential - `vc`: verifiable credential - `revoking`: `true` if credential is being revoked - `onRevoke`: function that will be executed when the credential is successfully revoked.
-   `CreateCredentialModal`: modal that allows to create a credential
    -   `isOpen`: if `true`modal is opened
    -   `onModalClose`: function that will be executed when the modal is closed
    -   `onSuccess`: function that will be executed when credential is successfully created
    -   `credentialsTemplate`: credentials template with type and fields that can be created. By default [this template](#credentials-template) is used.

#### Manager

We can put several of the isolated components together to form a manager that has greater logical complexity. The library offers a manager that allows you to manage identities such as listing them, searching by DID, user or type or creating them as well as access the details of a specific identity and create or revoke credentials. This manager can be imported as follows:

```js
import { IdentitiesManager } from '@iota/is-ui-components'
```

This manager can be customized through the adjustment of its props:

-   `IdentitiesManager`: show a initial list with the last identities. Also, it is possible to search by type, DID or username. This manager also provides a section with the identity details of a particular identity selected. In this section you can add verifiable credentials and revoke credential that has been created previously.

    -   `identitiesTemplate`: identities template with type and fields that can be created. By default [this template](#identities-templates) is used.
    -   `credentialsTemplate`: credentials template with type and fields that can be created. By default [this template](#credential-templates) is used.
    -   `showSearch`: if `true`the search is avaliable.
    -   `listViewButtons`: set of action buttons of identities list view
    -   `detailViewButtons`: set of action buttons of identity details view
    -   `tableConfiguration`: table configuration. [This config](#default-table-configuration) is used by default.

### Functions

The library offers functions that can be used to facilitate the identities management. To import them it is necessary to do it in the following way:

```js
import {
    searchAllIdentities,
    searchIdentityByDID,
    searchIdentitiesSingleRequest,
    stopIdentitiesSearch,
    createVC,
    revokeVC,
    updateIdentityInSearchResults,
    addIdentityToSearchResults,
    getVerifiableCredentials,
} from '@iota/is-ui-components'
```

-   `searchAllIdentities(query, {limit})`: Search identities by DID, type or username with a selected maximum results limit. In order not to overload the front part and allow a better user experience, the search function has been implemented in such a way that a set of requests with a few results is made to the library so as not to block the front. That is why the search function needs the `searchIdentitiesSingleRequest` function to be able to make these calls until the established limit is reached.
    -   `query`: query
    -   `limit`: maximum search results
-   `searchIdentityByDID(did)`: Search an identity by DID
    -   `did`: identity identifier
-   `searchIdentitiesSingleRequest(query, {searchByType, searchByUsername, limit, index})`: Single identities request.
    -   `query`: query
    -   `searchByType`: `true` if we want to search by type
    -   `searchByUsername`: `true` if we want to search by username
    -   `limit`: maximum search results
    -   `index`: search index
-   `stopIdentitiesSearch()`: function to stop the search. This is necessary because `searchAllIdentities` function not have to perform a single search, but rather, it normally makes several requests to the back part.
-   `createVC(initiatorVC, targetDid, credentialType, claimType, claim)`: function to create a new verifiable credential
    -   `initiatorVC`: initiator verifiable credential (or `undefined`)
    -   `targetDid`: identifier of the identity associated with the credential to be created
    -   `credentialType`: verifiable credential type
    -   `claimType`: claim type
    -   `claim`: claim object
-   `revokeVC(signatureValue)`: function to revoke an existing verifiable credential
    -   `signatureValue`: signature value of veriable credential to be revoked
-   `updateIdentityInSearchResults(identity)`: updates the identity that is passed as a parameter in the search results, the DID cannot be modified.
    -   `identity`. The identity with the new changes updated. The function overrides the identity with the same DID in search results.
-   `addIdentityInSearchResults(id)`: search the identity with the id provided and add it to the search results store.
    -   `id`. Identity identifier to be added to search results store.
-   `getVerifiableCredentials(identityId)`: returns an array of the verifiable credentials related to a specific identity.
    -   `identityId`: Identity identifier to get verifiable credentials.

## Credentials verifier (manager)

### UI Component

The library offers a special component to be able to verify credentials. This component can be imported like this:

```js
import { VerifyCredentialManager } from '@iota/is-ui-components'
```

It can be customized adjusting its props:

-   `VerifyCredentialManager`: It allows verifying one or more credentials by dragging a document in JSON format of the credential or adding it from the box.
    -   `maxFiles`: maximum number of files that can be verified simultaneously (by default its value is 10)

### Function

The library also offers a function to verify a verifiable credential. This can be imported like this:

```js
import { verifyVC } from '@iota/is-ui-components'
```

-   `verifyVC(json)`: returns `true`if the credential is verified or false if not.
    -   `json`: credential to be verified

## Streams

### Stores

The library offers Svelte Writable stores that allow the storage of data related to stream management. To import them we need to do it in the following way:

```js
import {
    selectedChannel,
    searchChannelsResults,
    selectedChannelData,
    selectedChannelBusy,
    selectedChannelSubscriptions,
    isAsyncLoadingChannels,
} from '@iota/is-ui-components'
```

-   `selectedChannel`: contains the information about the selected channel
-   `searchChannelsResults`: contains an array with the search results
-   `selectedChannelData`: contains the messages of a channel
-   `selectedChannelBusy`: indicates if the library is busy (`true`) to launch an action referring to a channel (read a channel, write a message, ...)
-   `selectedChannelSubscriptions`: contains the information about the subscriptions of the selected channel
-   `isAsyncLoadingChannels`: `true` if the library is busy searching for channels

### UI Components

#### Isolated components

```js
import {
    ChannelDetails,
    ChannelInfo,
    ChannelMessages,
    ChannelSubscriptions,
    CreateChannelModal,
    Subscription,
    WriteMessageModal,
} from '@iota/is-ui-components'
```

These components can be customized by adjusting their props:

-   `ChannelDetails`: contains the information about the selected channel
    -   `channel`: channel to get the details
    -   `channelData`: messages related to selected channel
    -   `subscriptionStatus`: state of subscription (authorized, subscribed, not subscribed)
    -   `subscriptions`: set of all subscriptions related to the channel
    -   `loading`: if `true` a spinner is rendered to indicate that details are loading
    -   `messageFeedButtons`: action buttons related to channel feed messages section (e.g write a message)
    -   `handleAcceptSubscription`: function that will be executed when clicking in Accept subscription
    -   `handleRejectSubscription`: function that will be executed when clicking in Reject subscription
-   `ChannelInfo`: show general information about a channel (title, description, ...)
    -   `channel`: channel
    -   `subscriptionStatus`: state of subscription (authorized, subscribed, not subscribed)
    -   `loading` if `true` a spinner is rendered to indicate that info is loading
    -   `onSubscriptionAction`: function that will be executed when a user request a subscription
-   `ChannelMessages`: shows the messages of a channel
    -   `channelData`: channel messages
    -   `actionButtons`: buttons to call actions related to messages (write a message, ...)
-   `ChannelSubscriptions`: contains a subscription management section
    -   `channel`: channel
    -   `subscriptions`: set of all subscriptions related to the channel
    -   `handleAcceptSubscription`: function that will be executed when clicking in Accept subscription
    -   `handleRejectSubscription`: function that will be executed when clicking in Reject subscription
-   `CreateChannelModal`: modal to create a channel
    -   `isOpen`: if `true`modal is opened
    -   `onModalClose`: function that will be executed when the modal is closed
    -   `onSuccess`: function that will be executed when channel is successfully created
-   `Subscription`: subscription box
    -   `displayActionButtons`: if `true` buttons are displayed
    -   `subscription`: subscription object
    -   `label`: subscription label
    -   `handleAcceptSubscription`: function that will be executed when clicking in Accept subscription
    -   `handleRejectSubscription`: function that will be executed when clicking in Reject subscription
-   `WriteMessageModal`: contains the messages of a channel
    -   `address`: channel address
    -   `isOpen`: if `true`modal is opened
    -   `title`: title (by default: `Write a message`)
    -   `onModalClose`: function that will be executed when the modal is closed
    -   `onSuccess`: function that will be executed when message is successfully sent

#### Manager

```js
import { StreamsManager } from '@iota/is-ui-components'
```

This component can be customized by adjusting their props:

-   `StreamsManager`: Initially, a set of channels is shown in the form of a list in which you can see some characteristics such as their name, description, channel address, as well as information about the topics (source and type). This component also allows you to search for channels and select a particular channel to access a details view where you can manage subscriptions as well as write messages within that channel if the logged in identity has the necessary permissions.
    -   `showSearch`: if `true` search is available
    -   `listViewButtons`: buttons to create actions related to list view
    -   `messageFeedButtons`: buttons to create actions related to messages view (details)
    -   `tableConfiguration`: table configuration. [This config](#default-table-configuration) is used by default.

### Functions

```js
import {
    searchAllChannels,
    searchChannelsSingleRequest,
    readChannelMessages,
    startReadingChannel,
    requestSubscription,
    requestUnsubscription,
    acceptSubscription,
    rejectSubscription,
    getSubscriptions,
    getSubscriptionStatus,
    writeMessage,
    createChannel,
    addChannelToSearchResults,
    isUserOwnerOfChannel,
    isUserSubscribedToChannel,
} from '@iota/is-ui-components'
```

-   `searchAllChannels(query, { limit })`: function that allows to search in all the channels by means of a query. The search is performed on the author id or on the topic source. It is important to know that the search through this function is done progressively with the intention of avoiding overloading the front. In this way, the procedure consists of performing small searches (calling the `searchChannelsSingleRequest` function) until reaching the total number of results or the maximum number of results required by the `limit` parameter.
    -   `query`: query
    -   `limit`: maximum number of search results
-   `searchChannelsSingleRequest(query, {searchByAuthorId, searchBySource, limit, index})`: this function allows you to perform a simple search. To learn more about the reason for the existence of this function, we recommend carefully reading the documentation referring to the function `searchAllChannels`.
    -   `query`: query
    -   `searchByAuthorId`: `true` if we want to search by author id
    -   `searchBySource`: `true` if we want to search by topic source
    -   `limit`: maximum search results
    -   `index`: search index
-   `readChannelMessages(channelAddress)`: this function allows you to store in the svelte store dedicated to the messages of a channel (`channelData`) the messages associated with the channel whose address is passed to it as a parameter.
    -   `channelAddress`: channel address from which to extract the associated messages.
-   `startReadingChannel(channelAddress)`: this function allows you to continuously listen to the messages of a channel and, therefore, update the arrival of new messages in real time.
-   `channelAddress`: address of the channel on which you continually listen for new messages.
-   `stopReadingChannel()`: this function allows you to stop the continuous listening of the messages associated with a channel whose address is passed as a parameter.
    -   `channelAddress`: address of the channel on which to stop continuous listening for new messages.
-   `requestSubscription(channelAddress)`: this function allows you to send a subscription request by the logged in identity to a certain channel.
    -   `channelAddress`: channel address to subscribe to
-   `requestUnsubscription(channelAddress)`: this function allows you to request an unsubscription of the channel by the logged in identity in a certain channel.
    -   `channelAddress`: channel address to unsubscribe to
-   `acceptSubscription(channelAddress, triggerReadChannel)`: this function allows the owner of a certain channel to accept the subscription request to that channel by an identity.
    -   `channelAddress`: address of the channel to accept the subscription request
    -   `triggerReadChannel`: when `true` it will start reading the channel messages (polling) if there are no errors.
-   `rejectSubscription(channelAddress, triggerReadChannel)`this function allows the owner of a certain channel to reject the subscription request to that channel by an identity.
    -   `channelAddress`: address of the channel to reject the subscription request
    -   `triggerReadChannel`: when `true` it will start reading the channel messages (polling) if there are no errors.
-   `getSubscriptions(channelAddress)`: this function allows you to obtain a list of all the subscriptions of a certain channel
    -   `channelAddress`: channel address to get all subscriptions
-   `getSubscriptionStatus(channelAddress)`: This function allows knowing the status of the subscription of the logged in identity on a certain channel.
    -   `channelAddress`: address of the channel on which to know the status of the subscription
-   `writeMessage(address, payload, publicPayload, metadata, type, triggerReadChannel)`: this function allows to write a message in a certain channel.
    -   `address`: address of the channel to which to write a message
    -   `payload`: encrypted payload of a channel
    -   `publicPayload`: public payload of a channel can be seen when checking at explorer
    -   `metadata`: public metadata of a channel can be seen when checking at explorer
    -   `type`: type describing the type of what is logged
    -   `triggerReadChannel`: when `true` it will start reading the channel messages (polling) if there are no errors.
-   `createChannel(topics)`: This function allows the creation of a channel
    -   `topics`: topics of a channel.
-   `isUserOwnerOfChannel(channelAddress)`: this function returns `true` if the logged in identity is the owner of a given channel
    -   `channelAddress`: address of the channel involved
-   `isUserSubscribedToChannel(channelAddress)`: this function returns `true` if the logged in identity is a subscriber of a given channel
    -   `channelAddress`: address of the channel involved

## Notifications system

The library also allows you to introduce a notification system in the form of toasts.

### Store

The library exposes a Svelte Writable Store to manage the notification set. It can be imported in the following way:

```js
import { notifications } from '@iota/is-ui-components'
```

-   `notifications`: It is a set (array) of the notifications

### UI Components

#### Manager

The library offers a notification manager to be able to integrate it into a website.
It is very important that the notification system is only imported once in the entire project, since if this condition is not met, the behavior of the notification manager may not be adequate.
To import it you need to do it as follows:

```js
import { NotificationManager } from '@iota/is-ui-components'
```

`NotificationManager`: This component allows you to automatically manage notifications in the form of floating toasts.

### Functions

The library allows access to functions that are useful for managing notifications:

-   `showNotification(notification)`: this function allows you to add a notification
    -   `notification`: notification to be added
-   `removeNotification(notification)`: this function allows you to remove a notification
    -   `notification`: notification to be removed
-   `updateNotification(id, updateData)`: this function allows you to update a notification
    -   `id`: notification id to be updated
    -   `updateData`: new notification details

## Color customization

You can customize the default Bootstrap 5 theme
using `scss` with `svelte-preprocess`.

Example:

```css
/* global.scss or some root component */
$theme-colors: (
    primary: pink
);
@import 'node_modules/bootstrap/scss/bootstrap.scss';
```

[Color reference](https://getbootstrap.com/docs/5.0/customize/color/#theme-colors)

## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".
Don't forget to give the project a star! Thanks again!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

Or: clone the repo:

```sh
git clone https://github.com/iota-community/is-ui-components.git
```

Add a `.env` file like based on `.env.example`:

```sh
VITE_IOTA_IS_SDK_API_KEY="XXXXXXXXXX"
# Use VITE_IOTA_IS_SDK_GATEWAY_URL for a single gateway url
VITE_IOTA_IS_SDK_GATEWAY_URL="XXXXXXXXXX"
# Use SSI Bridge & Audit Trail urls when you have separated instances
VITE_IOTA_IS_SDK_SSI_BRIDGE_URL="XXXXXXXXXX"
VITE_IOTA_IS_SDK_AUDIT_TRAIL_URL="XXXXXXXXXX"
```

You have to install dependencies and run the project

```sh
npm install
npm run start
```

and IS UI library will run on

```sh
http://localhost:3001/
```

<p align="right">(<a href="#top">back to top</a>)</p>

## Default templates

### Templates

-   [Default table](templates/defaultTable.json)
-   [Credentials](templates/credential.json)
-   [Identities](templates/identities.js)

<p align="right">(<a href="#top">back to top</a>)</p>

<!-- LICENSE -->

## License

Distributed under the Apache License. See `LICENSE` for more information.

<p align="right">(<a href="#top">back to top</a>)</p>

<!-- CONTACT -->

## Contact

Your Name - [@twitter_handle](https://twitter.com/twitter_handle) - email@email_client.com

Project Link: [https://github.com/iotaledger/is-ui-components](https://github.com/iotaledger/is-ui-components)

<p align="right">(<a href="#top">back to top</a>)</p>

<!-- ACKNOWLEDGMENTS -->

## Contributions

-   [Begoña Álvarez de la Cruz](https://github.com/begonaalvarezd)
-   [Eva Virseda Sanz](https://github.com/evavirseda)
-   [Rubén Álvarez Gallego](https://github.com/evavirseda)

<p align="right">(<a href="#top">back to top</a>)</p>

<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->

[contributors-shield]: https://img.shields.io/github/contributors/iotaledger/is-ui-components.svg?style=for-the-badge
[contributors-url]: https://github.com/iotaledger/is-ui-components/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/iotaledger/is-ui-components.svg?style=for-the-badge
[forks-url]: https://github.com/iotaledger/is-ui-components/network/members
[stars-shield]: https://img.shields.io/github/stars/iotaledger/is-ui-components.svg?style=for-the-badge
[stars-url]: https://github.com/iotaledger/is-ui-components/stargazers
[issues-shield]: https://img.shields.io/github/issues/iotaledger/is-ui-components.svg?style=for-the-badge
[issues-url]: https://github.com/iotaledger/is-ui-components/issues
[license-shield]: https://img.shields.io/github/license/iotaledger/is-ui-components.svg?style=for-the-badge
[license-url]: https://github.com/iotaledger/is-ui-components/blob/main/LICENSE
[discord-shield]: https://img.shields.io/badge/Discord-9cf.svg?style=for-the-badge&logo=discord
[discord-url]: https://discord.iota.org
[stackexchange-shield]: https://img.shields.io/badge/StackExchange-9cf.svg?style=for-the-badge&logo=stackexchange
[stackexchange-url]: https://iota.stackexchange.com
