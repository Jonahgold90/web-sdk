<script lang="ts">
	import type { Snippet } from 'svelte';

	// Add buttonType prop to control button color
	export type ButtonType = 'activate' | 'buy';

	type Props = {
		title: Snippet;
		description: Snippet;
		price: Snippet;
		button: Snippet;
		buttonType?: ButtonType; // Optional, for button color
		imageSrc?: string; // Optional, for image under title
	};

	const props: Props = $props();
</script>

<div class="bonus-card-wrap">
	<div class="info">
		{@render props.title()}
		{#if props.imageSrc}
			<img class="bonus-image" src={props.imageSrc} />
		{/if}
		{@render props.description()}
	</div>
	<div class="spacer"></div>
	<div class="bottom-group">
		<div class="price-wrap">
			{@render props.price()}
		</div>
		<div class="button-wrap {props.buttonType === 'activate' ? 'activate' : ''} {props.buttonType === 'buy' ? 'buy' : ''}">
			{@render props.button()}
		</div>
	</div>
</div>

<style lang="scss">
	.bonus-card-wrap {
		padding: 2rem;
		flex-direction: column;
		display: flex;
		justify-content: flex-start;
		align-items: stretch;

		border-radius: 18px;
		background: #fff;
		text-align: left;
		width: 320px;
		min-width: 320px;
		max-width: 320px;
		min-height: 380px;
		color: #111;
		box-shadow: 0 4px 24px rgba(0,0,0,0.08);
	}

	.info {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.3em;
	}

	.info .bonus-title {
		margin-bottom: 0.1em;
	}

	.bonus-image {
		display: block;
		margin: 0.125rem auto 1rem auto;
		width: 144px;
		height: 144px;
		object-fit: contain;
	}

	.spacer {
		flex: 1 1 auto;
	}

	.bottom-group {
		display: flex;
		flex-direction: column;
		align-items: stretch;
		gap: 0.5rem;
	}

	.bonus-card-wrap :global(.title) {
		color: #111 !important;
		font-size: 2rem !important;
		line-height: 2.2rem !important;
		text-align: center;
		font-weight: 700;
	}

	.bonus-card-wrap :global(.description) {
		color: #111 !important;
		font-size: 1.25rem !important;
		text-align: center;
		min-height: 4.5rem;
		white-space: pre-line;
		display: inline-flex;
		align-items: center;
	}

	.price-wrap {
		display: flex;
		justify-content: center;
		align-items: center;
		margin-bottom: 0;
	}

	.bonus-card-wrap :global(.price) {
		color: #111 !important;
		font-size: 2rem !important;
		line-height: 2.2rem !important;
		text-align: center;
		white-space: nowrap;
		font-weight: 700;
	}

	.button-wrap {
		display: flex;
		justify-content: center;
		align-items: center;
		margin-top: 1rem;
	}

	.button-wrap button,
	.button-wrap.buy button {
		background: #20cfcf !important;
		color: #fff !important;
	}

	.button-wrap.activate button {
		background: #ffe066 !important;
		color: #111 !important;
	}
</style>
