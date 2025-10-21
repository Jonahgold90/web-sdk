<script lang="ts">
	import { Sprite, BitmapText } from 'pixi-svelte';
	import { bookEventAmountToCurrencyString } from 'utils-shared/amount';
	import { getContext } from '../game/context';

	const context = getContext();

	// Position adjustment constants from BoardFrame
	const POSITION_ADJUSTMENT = 1.01;
	const VERTICAL_OFFSET = -20; // Same offset as reelFrame

	// Position at the top of the board instead of center
	// Additional offset to move it higher (half the frame's height at 0.35 scale)
	const yPosition = $derived(
		context.stateGameDerived.boardLayout().y * POSITION_ADJUSTMENT +
		VERTICAL_OFFSET -
		(context.stateGameDerived.boardLayout().height / 2) - 50);

	const xPosition = $derived(context.stateGameDerived.boardLayout().x * POSITION_ADJUSTMENT);

	// Track tumble win amount
	let tumbleWinAmount = $state(0);

	context.eventEmitter.subscribeOnMount({
		tumbleWinAmountReset: () => {
			tumbleWinAmount = 0;
		},
		tumbleWinAmountUpdate: (emitterEvent) => {
			tumbleWinAmount = emitterEvent.amount;
		},
	});

	// Format amount using the same utility as the PAYS display
	const tumbleWinAmountFormatted = $derived(bookEventAmountToCurrencyString(tumbleWinAmount));
</script>

<!-- TumbleFrame positioned at the top of reelFrame, centered horizontally, always visible -->
<!-- Scaled to 30% of original size -->
<Sprite
	key="tumbleFrame"
	anchor={0.5}
	x={xPosition}
	y={yPosition}
	scale={0.35}
	zIndex={3}
/>

<!-- Cumulative win amount text centered on the tumble frame -->
{#if tumbleWinAmount > 0}
<BitmapText
	text={tumbleWinAmountFormatted}
	x={xPosition}
	y={yPosition}
	anchor={{ x: 0.5, y: 0.5 }}
	style={{
		fontFamily: 'yellowFont',
		fontSize: 8,
	}}
	zIndex={4}
/>
{/if}
