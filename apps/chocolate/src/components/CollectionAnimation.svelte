<script lang="ts">
	import { Container, Text, BitmapText } from 'pixi-svelte';
	import { onMount } from 'svelte';
	import { tweened } from 'svelte/motion';
	import { cubicOut } from 'svelte/easing';
	import { bookEventAmountToCurrencyString, numberToCurrencyString } from 'utils-shared/amount';
	import { stateBet } from 'state-shared';

	import { getCellCenter } from '../game/gridUtils';
	import { getContext } from '../game/context';
	import type { BookEventOfType } from '../game/typesBookEvent';

	type Props = {
		show: boolean;
		debugMode?: boolean;
		onComplete?: () => void;
	};

	const props: Props = $props();
	const context = getContext();

	// Container references (not reactive state)
	let animationContainer: Container | undefined;
	let debugContainer: Container | undefined;
	let cwTotalsContainer: Container | undefined;

	// State for CW totals display
	let cwTotals = $state<Map<string, { x: number; y: number; total: number; visible: boolean }>>(new Map());
	let debugLabels = $state<Array<{ col: number; row: number; x: number; y: number }>>([]);

	// Debug effect to monitor cwTotals changes
	$effect(() => {
		console.log(`🔍 CW Totals changed: ${cwTotals.size} entries`, [...cwTotals.entries()]);
	});

	// Debug effect to monitor floatingTexts changes
	$effect(() => {
		console.log(`🔍 Floating texts changed: ${floatingTexts.length} texts`, floatingTexts.map(ft => `${ft.id}: "${ft.text}" at (${ft.position.x.toFixed(1)}, ${ft.position.y.toFixed(1)})`));
	});

	/**
	 * Calculate scaled values based on current bet
	 */
	function getScaledValues(step: BookEventOfType<'cc_collect_sequence'>['collections'][0]['steps'][0]) {
		const currentBet = stateBet.wageredBetAmount;
		const scaled_base_value = step.base_value * currentBet;
		const scaled_credited_value = scaled_base_value * step.multiplier_used;
		
		console.log(`💰 Scaling calculation: base_value=${step.base_value} × currentBet=${currentBet} = scaled_base_value=${scaled_base_value}`);
		console.log(`💰 Credit calculation: scaled_base_value=${scaled_base_value} × multiplier=${step.multiplier_used} = scaled_credited_value=${scaled_credited_value}`);
		
		return {
			scaled_base_value,
			scaled_credited_value
		};
	}

	// Initialize debug labels if debug mode is enabled
	$effect(() => {
		if (props.debugMode) {
			const labels = [];
			for (let col = 0; col < 5; col++) {
				for (let row = 0; row < 3; row++) {
					const { x, y } = getCellCenter(col, row);
					labels.push({ col, row, x, y });
				}
			}
			debugLabels = labels;
		} else {
			debugLabels = [];
		}
	});

	/**
	 * Play the full collection sequence animation
	 */
	export async function playCollectSequence(event: BookEventOfType<'cc_collect_sequence'>): Promise<void> {
		console.log('🎬 Starting collection sequence animation', event);
		
		// Clear any existing CW totals
		cwTotals.clear();
		
		// Process each CW collection sequentially
		for (let i = 0; i < event.collections.length; i++) {
			const collection = event.collections[i];
			console.log(`🎬 Processing CW ${i + 1}/${event.collections.length} at (${collection.cw.col}, ${collection.cw.row})`);
			
			await playCollectionForCW(collection);
		}
		
		console.log('✅ Collection sequence animation complete');
		props.onComplete?.();
	}

	/**
	 * Play collection animation for a single CW
	 */
	async function playCollectionForCW(collection: BookEventOfType<'cc_collect_sequence'>['collections'][0]): Promise<void> {
		const cwKey = `${collection.cw.col}-${collection.cw.row}`;
		const cwCenter = getCellCenter(collection.cw.col, collection.cw.row);
		
		console.log(`🎬 Setting up CW at (${collection.cw.col}, ${collection.cw.row}) with ${collection.steps.length} steps`);
		
		// Initialize CW total display - force reactivity with new Map
		const newCwTotals = new Map(cwTotals);
		newCwTotals.set(cwKey, {
			x: cwCenter.x,
			y: cwCenter.y, // Position in center of the CW symbol
			total: 0,
			visible: true
		});
		cwTotals = newCwTotals;

		console.log(`🎬 CW totals map now has ${cwTotals.size} entries`);

		// Animate each CC collection step
		for (let i = 0; i < collection.steps.length; i++) {
			const step = collection.steps[i];
			const { scaled_credited_value } = getScaledValues(step);
			console.log(`🎬 Starting step ${i + 1}/${collection.steps.length}: CC(${step.cc.col},${step.cc.row}) -> CW(${collection.cw.col},${collection.cw.row}) raw_value=${step.credited_value} scaled_value=${scaled_credited_value}`);
			await animateStepCollection(step, collection.cw, cwKey);
			console.log(`✅ Step ${i + 1} completed`);
		}

		// Pulse the CW symbol when complete
		await pulseCW(collection.cw);
		console.log(`✅ CW collection complete for (${collection.cw.col}, ${collection.cw.row})`);
	}

	// State for dynamic floating texts with reactive positions
	let floatingTexts = $state<Array<{
		id: string;
		position: { x: number; y: number };
		text: string;
		animating: boolean;
		showMultiplier?: boolean;
		baseValue?: number;
		multipliedValue?: number;
		multiplier?: number;
		slamEffect?: {
			show: boolean;
			y: number;
			scale: number;
		};
	}>>([]);
	

	/**
	 * Animate a single CC → CW collection step using Svelte tweened motion
	 */
	async function animateStepCollection(
		step: BookEventOfType<'cc_collect_sequence'>['collections'][0]['steps'][0],
		cw: { col: number; row: number },
		cwKey: string
	): Promise<void> {
		const ccCenter = getCellCenter(step.cc.col, step.cc.row);
		const cwCenter = getCellCenter(cw.col, cw.row);
		
		// Calculate scaled values for display
		const { scaled_base_value, scaled_credited_value } = getScaledValues(step);
		const hasMultiplier = step.multiplier_used > 1;

		console.log(`🎯 Animation: CC(${step.cc.col},${step.cc.row}) at (${ccCenter.x},${ccCenter.y}) -> CW(${cw.col},${cw.row}) at (${cwCenter.x},${cwCenter.y})`);
		console.log(`💰 Values: base=${scaled_base_value}, multiplied=${scaled_credited_value}, multiplier=${step.multiplier_used}`);

		// Create unique ID for this floating text
		const textId = `${step.cc.col}-${step.cc.row}-${Date.now()}`;
		
		// Start with base value, will show multiplier effect during animation
		// Use currency formatting for display
		const baseText = numberToCurrencyString(hasMultiplier ? scaled_base_value : scaled_credited_value);
		const floatingTextData = {
			id: textId,
			position: { x: ccCenter.x, y: ccCenter.y },
			text: baseText,
			animating: true,
			showMultiplier: false,
			baseValue: scaled_base_value,
			multipliedValue: scaled_credited_value,
			multiplier: step.multiplier_used,
			slamEffect: hasMultiplier ? {
				show: false,
				y: cwCenter.y - 60, // Start at CW multiplier position
				scale: 1.0
			} : undefined
		};
		
		console.log(`📝 Creating floating text: starting with "${floatingTextData.text}" ${hasMultiplier ? `(will multiply by ${step.multiplier_used})` : ''}`);
		floatingTexts = [...floatingTexts, floatingTextData];
		console.log(`📝 Floating texts array now has ${floatingTexts.length} items`);

		// Create tweened stores for smooth animation
		const tweenedX = tweened(ccCenter.x, { duration: 1500, easing: cubicOut });
		const tweenedY = tweened(ccCenter.y, { duration: 1500, easing: cubicOut });
		
		// Track animation progress for multiplier effect
		let animationProgress = 0;
		
		// Subscribe to tweened values and update position
		const unsubscribeX = tweenedX.subscribe(x => {
			const textIndex = floatingTexts.findIndex(ft => ft.id === textId);
			if (textIndex !== -1) {
				floatingTexts[textIndex].position.x = x;
				
				// Calculate animation progress (0 to 1)
				const totalDistance = Math.abs(cwCenter.x - ccCenter.x);
				const currentDistance = Math.abs(x - ccCenter.x);
				animationProgress = totalDistance > 0 ? currentDistance / totalDistance : 0;
				
				// No mid-animation multiplier effect - happens at the end with slam
				
				floatingTexts = [...floatingTexts]; // Force reactivity
			}
		});
		
		const unsubscribeY = tweenedY.subscribe(y => {
			const textIndex = floatingTexts.findIndex(ft => ft.id === textId);
			if (textIndex !== -1) {
				floatingTexts[textIndex].position.y = y;
				floatingTexts = [...floatingTexts]; // Force reactivity
			}
		});

		// Start the animation by setting the tweened values to the target
		await Promise.all([
			tweenedX.set(cwCenter.x),
			tweenedY.set(cwCenter.y)
		]);
		
		// Trigger slam effect when CC reaches CW (if has multiplier)
		if (hasMultiplier) {
			const textIndex = floatingTexts.findIndex(ft => ft.id === textId);
			if (textIndex !== -1 && floatingTexts[textIndex].slamEffect) {
				console.log(`💥 Starting slam effect for ${step.multiplier_used}x`);
				await performSlamEffect(textIndex, textId, scaled_credited_value);
			}
		}

		// Clean up subscriptions
		unsubscribeX();
		unsubscribeY();

		console.log(`✅ Animation complete for text "${floatingTextData.text}"`);
		
		// Update CW total with SCALED value
		const currentTotal = cwTotals.get(cwKey);
		if (currentTotal) {
			const newTotal = currentTotal.total + scaled_credited_value;
			console.log(`💰 Updating CW total from ${currentTotal.total} to ${newTotal} (added scaled: ${scaled_credited_value})`);
			
			// Force reactivity by creating a new Map
			const newCwTotals = new Map(cwTotals);
			newCwTotals.set(cwKey, {
				...currentTotal,
				total: newTotal
			});
			cwTotals = newCwTotals;
		} else {
			console.error(`❌ Could not find CW total for key: ${cwKey}`);
		}

		// Remove floating text from state
		floatingTexts = floatingTexts.filter(ft => ft.id !== textId);
		console.log(`🗑️ Removed floating text, array now has ${floatingTexts.length} items`);
	}


	/**
	 * Perform the slam effect where CW multiplier slams down on the CC value
	 */
	async function performSlamEffect(textIndex: number, textId: string, multipliedValue: number): Promise<void> {
		console.log(`🎯 Performing slam effect - textIndex: ${textIndex}, multiplier: ${floatingTexts[textIndex].multiplier}`);
		
		// Show slam effect
		floatingTexts[textIndex].slamEffect!.show = true;
		floatingTexts = [...floatingTexts];
		console.log(`💥 Slam effect show set to true, y position: ${floatingTexts[textIndex].slamEffect!.y}`);
		
		// Animate slam down
		const slamTween = tweened(floatingTexts[textIndex].slamEffect!.y, { duration: 300, easing: cubicOut });
		const scaleTween = tweened(1.0, { duration: 300, easing: cubicOut });
		
		const unsubSlam = slamTween.subscribe(y => {
			const idx = floatingTexts.findIndex(ft => ft.id === textId);
			if (idx !== -1 && floatingTexts[idx].slamEffect) {
				floatingTexts[idx].slamEffect.y = y;
				floatingTexts = [...floatingTexts];
			}
		});
		
		const unsubScale = scaleTween.subscribe(scale => {
			const idx = floatingTexts.findIndex(ft => ft.id === textId);
			if (idx !== -1 && floatingTexts[idx].slamEffect) {
				floatingTexts[idx].slamEffect.scale = scale;
				floatingTexts = [...floatingTexts];
			}
		});
		
		// Slam down to CC position with scale up
		await Promise.all([
			slamTween.set(floatingTexts[textIndex].position.y - 10),
			scaleTween.set(1.5)
		]);
		
		// Update CC value to multiplied amount
		floatingTexts[textIndex].showMultiplier = true;
		floatingTexts[textIndex].text = numberToCurrencyString(multipliedValue);
		floatingTexts = [...floatingTexts];
		
		// Brief pause for impact
		await new Promise(resolve => setTimeout(resolve, 150));
		
		// Scale back down and hide slam effect
		await scaleTween.set(0.8);
		floatingTexts[textIndex].slamEffect!.show = false;
		floatingTexts = [...floatingTexts];
		
		unsubSlam();
		unsubScale();
	}

	/**
	 * Pulse animation for CW symbol when collection is complete
	 */
	async function pulseCW(cw: { col: number; row: number }): Promise<void> {
		return new Promise((resolve) => {
			// Create a temporary pulse effect at CW position
			const cwCenter = getCellCenter(cw.col, cw.row);
			
			// You could add a pulse effect to the actual CW symbol here
			// For now, just add a brief delay and resolve
			setTimeout(resolve, 300);
		});
	}

	/**
	 * Clear all collection displays and animations
	 */
	export function clearCollections(): void {
		cwTotals = new Map();
		floatingTexts = [];
	}

	// Clear on hide
	$effect(() => {
		if (!props.show) {
			clearCollections();
		}
	});

	onMount(() => {
		return () => {
			clearCollections();
		};
	});
</script>

{#if props.show}
	<Container bind:this={animationContainer}>
		<!-- Debug cell labels -->
		{#if props.debugMode}
			<Container bind:this={debugContainer}>
				{#each debugLabels as label}
					<Text
						x={label.x}
						y={label.y}
						text={`(${label.col},${label.row})`}
						anchor={0.5}
						style={{
							fontFamily: 'Arial',
							fontSize: 12,
							fill: 0xFF0000,
							fontWeight: 'bold'
						}}
					/>
				{/each}
			</Container>
		{/if}

		<!-- CW totals display -->
		<Container bind:this={cwTotalsContainer}>
			{#each [...cwTotals.entries()] as [key, total] (key)}
				{#if total.visible && total.total > 0}
					<BitmapText
						anchor={0.5}
						x={total.x}
						y={total.y}
						text={numberToCurrencyString(total.total)}
						style={{
							fontFamily: 'gold',
							fontSize: 36,
						}}
					/>
				{/if}
			{/each}
		</Container>

		<!-- Floating text animations -->
		<Container>
			{#each floatingTexts as floatingText (floatingText.id)}
				<!-- Main floating text using same bitmap text as CC values -->
				{#if floatingText.text !== '$0.00' && floatingText.text !== '0.00' && floatingText.text !== '$0' && floatingText.text !== '0'}
					<BitmapText
						anchor={0.5}
						x={floatingText.position.x}
						y={floatingText.position.y}
						text={floatingText.text}
						scale={floatingText.showMultiplier ? 1.2 : 1.0}
						style={{
							fontFamily: 'gold',
							fontSize: 30,
						}}
					/>
				{/if}
				
				<!-- Slam effect - multiplier coming down -->
				{#if floatingText.slamEffect && floatingText.slamEffect.show && floatingText.multiplier}
					<BitmapText
						anchor={0.5}
						x={floatingText.position.x}
						y={floatingText.slamEffect.y}
						scale={floatingText.slamEffect.scale}
						text={`${floatingText.multiplier}X`}
						style={{
							fontFamily: 'gold',
							fontSize: 36,
						}}
					/>
				{/if}
			{/each}
		</Container>
	</Container>
{/if}