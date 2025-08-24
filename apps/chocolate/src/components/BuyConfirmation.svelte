<script lang="ts" module>
	export type EmitterEventBuyConfirmation =
		| { type: 'buyConfirmationShow' }
		| { type: 'buyConfirmationHide' }
		| { type: 'buyConfirmationConfirm' }
		| { type: 'buyConfirmationCancel' };
</script>

<script lang="ts">
	import { MainContainer } from 'components-layout';
	import { Sprite, Container, BitmapText, Text, Graphics } from 'pixi-svelte';
	import { getContext } from '../game/context';
	import { stateBet, stateModal } from 'state-shared';
	import { numberToCurrencyString } from 'utils-shared/amount';
	
	const context = getContext();

	// Show when buyBonus modal is active
	let show = $derived(stateModal.modal?.name === 'buyBonus');
	
	// Calculate cost
	const bonusCost = $derived(numberToCurrencyString(stateBet.betAmount * 100));

	// Center the confirmation on screen
	const position = $derived(() => {
		const layout = context.stateLayoutDerived.mainLayout();
		const width = layout.width;
		const height = layout.height;
		
		return { 
			x: width / 2, 
			y: height / 2 
		};
	});

	// Responsive scaling based on screen size
	const scale = $derived(() => {
		const layout = context.stateLayoutDerived.mainLayout();
		const width = layout.width;
		
		if (width < 480) return 0.6;
		if (width < 768) return 0.8;
		return 1.0;
	});

	function handleConfirm() {
		stateBet.activeBetModeKey = 'BONUS';
		context.eventEmitter.broadcast({ type: 'bet' });
		stateModal.modal = null;
	}

	function handleCancel() {
		stateModal.modal = null;
	}

	// Hover state for buttons
	let noHover = $state(false);
	let yesHover = $state(false);
</script>

{#if show}
	<MainContainer>
		<!-- Dark overlay to grey out background -->
		<Container x={0} y={0}>
			<Graphics
				draw={(graphics) => {
					const layout = context.stateLayoutDerived.mainLayout();
					graphics.clear();
					graphics.rect(-9999, -9999, layout.width + 19998, layout.height + 19998);
					graphics.fill(0x000000);
				}}
				alpha={0.7}
			/>
		</Container>
		
		<Container x={position().x} y={position().y} scale={scale()}>
			<!-- Background confirmation image -->
			<Sprite 
				key="buyFreeSpins" 
				anchor={{ x: 0.5, y: 0.5 }}
			/>
			
			<!-- Cost text positioned on billboard -->
			<BitmapText
				text={bonusCost}
				x={0}
				y={-20}
				anchor={{ x: 0.5, y: 0.5 }}
				style={{
					fontFamily: 'gold',
					fontSize: 48,
				}}
			/>
			
			<!-- NO button (left side of billboard) -->
			<Container 
				x={-60} 
				y={40} 
				interactive={true} 
				cursor="pointer" 
				onpointertap={handleCancel}
				onpointerover={() => noHover = true}
				onpointerout={() => noHover = false}
				scale={noHover ? 1.05 : 1.0}
			>
				<!-- Red background -->
				<Sprite 
					key="payFrame" 
					width={100}
					height={50}
					anchor={{ x: 0.5, y: 0.5 }}
					tint={noHover ? 0xcc0000 : 0xff0000}
				/>
				<Text
					text="NO"
					anchor={{ x: 0.5, y: 0.5 }}
					style={{
						fontFamily: 'Arial Black',
						fontSize: 20,
						fill: 'white',
						fontWeight: 'bold',
					}}
				/>
			</Container>
			
			<!-- YES button (right side of billboard) -->
			<Container 
				x={60} 
				y={40} 
				interactive={true} 
				cursor="pointer" 
				onpointertap={handleConfirm}
				onpointerover={() => yesHover = true}
				onpointerout={() => yesHover = false}
				scale={yesHover ? 1.05 : 1.0}
			>
				<!-- Green background -->
				<Sprite 
					key="payFrame" 
					width={100}
					height={50}
					anchor={{ x: 0.5, y: 0.5 }}
					tint={yesHover ? 0x00cc00 : 0x00ff00}
				/>
				<Text
					text="YES"
					anchor={{ x: 0.5, y: 0.5 }}
					style={{
						fontFamily: 'Arial Black',
						fontSize: 20,
						fill: 'white',
						fontWeight: 'bold',
					}}
				/>
			</Container>
		</Container>
	</MainContainer>
{/if}