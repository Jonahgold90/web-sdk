<script lang="ts">
	import { BitmapText } from 'pixi-svelte';
	import { stateBet } from 'state-shared';
	import { getContext } from '../game/context';

	const context = getContext();

	// Debug: Check if component is running
	$effect(() => {
		console.log('CCValues component running, gameType:', context.stateGame.gameType);
	});

	// Get all CC symbols with their positions and cash values
	const ccSymbols = $derived(() => {
		console.log('ccSymbols derived running, gameType:', context.stateGame.gameType);
		
		if (context.stateGame.gameType !== 'freegame') {
			console.log('Not in freegame mode, returning empty array');
			return [];
		}
		
		console.log('Board data:', context.stateGame.board);
		
		const symbols: Array<{ x: number; y: number; value: string }> = [];
		
		context.stateGame.board.forEach((reel, reelIndex) => {
			console.log(`Checking reel ${reelIndex}:`, reel);
			reel.reelState.symbols.forEach((symbol, rowIndex) => {
				console.log(`Symbol at ${reelIndex},${rowIndex}:`, symbol.rawSymbol.name, symbol.rawSymbol);
				
				if (symbol.rawSymbol.name === 'CC') {
					console.log('Found CC symbol!', {
						reelIndex,
						rowIndex,
						cash_value: symbol.rawSymbol.cash_value,
						hasValue: !!symbol.rawSymbol.cash_value
					});
					
					if (symbol.rawSymbol.cash_value) {
						const betSize = stateBet.betSize();
						const displayValue = (betSize * symbol.rawSymbol.cash_value).toString();
						
						symbols.push({
							x: symbol.x || (reelIndex * 120 + 60),
							y: symbol.y || (rowIndex * 120 + 60),
							value: displayValue
						});
					}
				}
			});
		});
		
		console.log('Final CC symbols to render:', symbols);
		return symbols;
	});
</script>

{#each ccSymbols as ccSymbol}
	<BitmapText
		anchor={0.5}
		x={ccSymbol.x}
		y={ccSymbol.y}
		text={ccSymbol.value}
		style={{
			fontFamily: 'gold',
			fontSize: 30,
		}}
	/>
{/each}