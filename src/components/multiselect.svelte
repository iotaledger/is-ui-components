<!-- Inspiration: https://svelte.dev/repl/c7094fb1004b440482d2a88f4d1d7ef5?version=3.14.0 -->
<script>
	import { onMount } from 'svelte';
	import { fly } from 'svelte/transition';
	import { Icon } from './../components';
	export let id = '';
	export let value = [];
	export let placeholder = '';

	let input,
		inputValue,
		options = [],
		activeOption,
		showOptions = false,
		selected = {},
		first = true,
		slot;

	onMount(() => {
		slot.querySelectorAll('option').forEach((o) => {
			o.selected && !value.includes(o.value) && (value = [...value, o.value]);
			options = [...options, { value: o.value, name: o.textContent }];
		});
		value &&
			(selected = options.reduce(
				(obj, op) => (value.includes(op.value) ? { ...obj, [op.value]: op } : obj),
				{}
			));
		first = false;
	});

	$: if (!first) value = Object.values(selected).map((o) => o.value);
	$: filtered = options.filter((o) =>
		inputValue ? o.name.toLowerCase().includes(inputValue.toLowerCase()) : o
	);
	$: if ((activeOption && !filtered.includes(activeOption)) || (!activeOption && inputValue))
		activeOption = filtered[0];

	function add(token) {
		selected[token.value] = token;
	}

	function remove(value) {
		const { [value]: val, ...rest } = selected;
		selected = rest;
	}

	function optionsVisibility(show) {
		if (typeof show === 'boolean') {
			showOptions = show;
			show && input.focus();
		} else {
			showOptions = !showOptions;
		}
		if (!showOptions) {
			activeOption = undefined;
		}
	}

	function handleKeyup(e) {
		if (e.keyCode === 13) {
			Object.keys(selected).includes(activeOption.value)
				? remove(activeOption.value)
				: add(activeOption);
			inputValue = '';
		}
		if ([38, 40].includes(e.keyCode)) {
			// up and down arrows
			const increment = e.keyCode === 38 ? -1 : 1;
			const calcIndex = filtered.indexOf(activeOption) + increment;
			activeOption =
				calcIndex < 0
					? filtered[filtered.length - 1]
					: calcIndex === filtered.length
					? filtered[0]
					: filtered[calcIndex];
		}
	}

	function handleBlur(e) {
		optionsVisibility(false);
	}

	function handleTokenClick(e) {
		if (e.target.closest('.token-remove')) {
			e.stopPropagation();
			remove(e.target.closest('.token').dataset.id);
		} else if (e.target.closest('.remove-all')) {
			selected = [];
			inputValue = '';
		} else {
			optionsVisibility(true);
		}
	}

	function handleOptionMousedown(e) {
		const value = e.target.dataset.value;
		if (selected[value]) {
			remove(value);
		} else {
			add(options.filter((o) => o.value === value)[0]);
			input.focus();
		}
	}
</script>

<div class="bg-white border-bottom position-relative">
	<div
		class="d-flex flex-wrap align-items-center position-relative"
		class:showOptions
		on:click={handleTokenClick}
	>
		{#each Object.values(selected) as s}
			<div
				class="token d-flex align-items-center rounded mx-1 px-2 my-1 py-2 bg-light"
				data-id={s.value}
			>
				<span>{s.name}</span>
				<div
					class="d-flex align-items-center justify-content-center rounded cursor-pointer bg-secondary ms-2 me-2 token-remove"
					title="Remove {s.name}"
				>
					<Icon type="close" color="white" />
				</div>
			</div>
		{/each}
		<div class="actions d-flex align-items-center">
			<input
				{id}
				class="border-0 m-0 p-0 w-100"
				autocomplete="off"
				bind:value={inputValue}
				bind:this={input}
				on:keyup={handleKeyup}
				on:blur={handleBlur}
				{placeholder}
			/>
			<div
				class="remove-all d-flex align-items-center justify-content-center rounded cursor-pointer bg-danger ms-2 me-2"
				title="Remove All"
				class:d-none={!Object.keys(selected).length}
			>
				<Icon type="close" color="white" />
			</div>
		</div>
	</div>

	<select bind:this={slot} type="multiple" class="d-none"><slot /></select>

	{#if showOptions}
		<ul
			class="options overflow-auto position-absolute w-100"
			transition:fly={{ duration: 200, y: 5 }}
			on:mousedown|preventDefault={handleOptionMousedown}
		>
			{#each filtered as option}
				<li
					class:selected={selected[option.value]}
					class:active={activeOption === option}
					class="cursor-pointer p-2"
					data-value={option.value}
				>
					{option.name}
				</li>
			{/each}
		</ul>
	{/if}
</div>

<style lang="scss">
	input {
		outline: none;
	}

	.options {
		z-index: 100;
		left: 0;
		list-style: none;
		max-height: 70vh;
		padding-inline-start: 0;
		top: calc(100% + 1px);
	}

	.actions {
		flex: 1;
		min-width: 15rem;
	}

	li {
		background-color: white;
		cursor: pointer;
		padding: 0.5rem;
		&:last-child {
			border-bottom-left-radius: 0.2rem;
			border-bottom-right-radius: 0.2rem;
		}
		&:not(.selected):hover {
			background-color: hsl(214, 17%, 92%);
		}
		&.selected {
			background-color: hsl(232, 54%, 41%);
			color: white;
			&:nth-child(even) {
				background-color: hsl(232, 50%, 45%);
				color: white;
				&.active,
				&:hover {
					background-color: hsl(232, 48%, 50%);
				}
			}
		}

		&.active {
			background-color: hsl(214, 17%, 88%);
		}
	}
</style>
