<script lang="ts">
	export let title: string;
	export let checked: boolean;
</script>

<label for="toggle">
	<span class="text-golden">{title}</span>
	<div class="switch">
		<input type="checkbox" bind:checked id="toggle" />
		<span class="slider round" />
	</div>
</label>

<style>
	label {
		display: inline-flex;
		align-items: center;
	}

	/* The switch - the box around the slider */
	.switch {
		--switch-width: 40px;
		--switch-height: 22px;
		--button-height: 13px;

		margin-left: 10px;
		position: relative;
		display: inline-block;
		width: var(--switch-width);
		height: var(--switch-height);
	}

	/* Hide default HTML checkbox */
	.switch input {
		opacity: 0;
		width: 0;
		height: 0;
	}

	/* The slider */
	.slider {
		position: absolute;
		cursor: pointer;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		-webkit-transition: 0.4s;
		transition: 0.4s;
		border: 1px solid var(--blitz-golden-transparent);
		border-radius: 34px;
	}

	.slider:before {
		position: absolute;
		content: '';
		height: var(--button-height);
		width: var(--button-height);
		left: 4px;
		bottom: 4px;
		background-color: var(--blitz-golden);
		-webkit-transition: 0.4s;
		transition: 0.4s;
		border-radius: 50%;
	}

	.slider:hover,
	input:checked + .slider:hover {
		background-color: var(--blitz-golden-transparent);
	}

	input:checked {
		background-color: var(--blitz-golden);
	}

	input:checked + .slider {
		background-color: var(--blitz-golden);
	}

	input:checked + .slider:before {
		background-color: #011011;
		-webkit-transform: translateX(var(--switch-width));
		-ms-transform: translateX(var(--switch-width));
		transform: translateX(calc(var(--switch-width) - var(--button-height) - 10px));
	}
</style>
