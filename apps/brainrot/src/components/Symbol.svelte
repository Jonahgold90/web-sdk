<script lang="ts">
	import { SpineProvider, SpineTrack } from 'pixi-svelte';

	import SymbolSpine from './SymbolSpine.svelte';
	import SymbolSprite from './SymbolSprite.svelte';
	import type { SymbolState, RawSymbol } from '../game/types';
	import { SYMBOL_SIZE } from '../game/constants';
	import { getSymbolInfo } from '../game/utils';
	import { getContext } from '../game/context';
	import { stateGame } from '../game/stateGame.svelte';

	type Props = {
		x?: number;
		y?: number;
		state: SymbolState;
		rawSymbol: RawSymbol;
		oncomplete?: () => void;
		loop?: boolean;
	};

	const props: Props = $props();
	const context = getContext();
	const symbolInfo = $derived(getSymbolInfo({ rawSymbol: props.rawSymbol, state: props.state }));
	const isSprite = $derived(symbolInfo.type === 'sprite');
	const showWinFrame = $derived(
		['win', 'postWinStatic', 'explosion'].includes(props.state) &&
			!['S'].includes(props.rawSymbol.name),
	);

	// For M symbols, hide multiplier initially until revealed by lightning animation
	// Both mobile and desktop now use the reveal system
	let multiplierRevealed = $state(false);

	// Listen for laser reveal event to show multipliers (triggered by lightning animation)
	context.eventEmitter?.subscribeOnMount({
		skibidiLaserReveal: () => {
			if (props.rawSymbol.name === 'M') {
				multiplierRevealed = true;
			}
		},
	});

	// Show multiplier if: not M symbol, OR M symbol and (laser revealed OR laser already fired)
	const showMultiplier = $derived(
		props.rawSymbol.name !== 'M' ||
		multiplierRevealed ||
		stateGame.laserHasFired
	);
</script>

{#if isSprite}
	<SymbolSprite {symbolInfo} x={props.x} y={props.y} oncomplete={props.oncomplete} />
{:else}
	<SymbolSpine
		loop={props.loop}
		{symbolInfo}
		x={props.x}
		y={props.y}
		multiplierValue={props.rawSymbol.name === 'M' && showMultiplier ? props.rawSymbol.multiplier : undefined}
		listener={{
			complete: props.oncomplete,
			event: (_, event) => {
				if (event.data?.name === 'wildExplode') {
					context.eventEmitter?.broadcast({ type: 'soundOnce', name: 'sfx_wild_explode' });
				}
			},
		}}
	/>
{/if}

{#if showWinFrame}
	<SpineProvider x={props.x} y={props.y} key="payOutline" width={SYMBOL_SIZE}>
		<SpineTrack trackIndex={0} animationName={'brbo_win_frame'} loop />
	</SpineProvider>
{/if}
