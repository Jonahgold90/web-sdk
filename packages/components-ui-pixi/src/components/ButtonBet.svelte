<script lang="ts">
	import type { ButtonProps } from 'components-pixi';
	import { stateBetDerived, stateUrlDerived } from 'state-shared';
	import UiButton from './UiButton.svelte';
	import { UI_BASE_SIZE } from '../constants';
	import ButtonBetProvider from './ButtonBetProvider.svelte';
	import { OnHotkey } from 'components-shared';
	import { i18nDerived } from '../i18n/i18nDerived';
	import { Text, Rectangle } from 'pixi-svelte';

	const props: Partial<Omit<ButtonProps, 'children'>> = $props();
	const disabled = $derived(!stateBetDerived.isBetCostAvailable());
	const isSocial = stateUrlDerived.social();

	const baseWidth = UI_BASE_SIZE * 1.5;  // More compact
	const baseHeight = UI_BASE_SIZE * 0.9;

	const gold = 0xffd700;
	const dark = 0x18122b;
</script>

<ButtonBetProvider>
	{#snippet children({ key, onpress })}
		<OnHotkey hotkey="Space" {disabled} {onpress} />
		{#if isSocial}
			<UiButton
				{...props}
				sizes={{ width: baseWidth, height: baseHeight }}
				{onpress}
				{disabled}
				spriteKey={undefined}
				icon="payTable"
			>
				<Rectangle
					width={baseWidth}
					height={baseHeight}
					x={0}
					y={0}
					borderColor={0xD99AF7}
					borderWidth={5}
					borderRadius={28}
					backgroundColor={dark}
					alpha={0.9}
				/>
				<Text
					text={i18nDerived.bet()}
					style={{
						fontFamily: 'Arial',
						fontSize: 44,
						fontWeight: 'bold',
						fill: gold,
						stroke: 0x000000,
						strokeThickness: 5,
						dropShadow: true,
						dropShadowColor: gold,
						dropShadowBlur: 6,
						dropShadowDistance: 0,
						align: 'center',
					}}
					anchor={0.5}
					x={baseWidth / 2}
					y={baseHeight / 2}
				/>
			</UiButton>
		{:else}
			<UiButton
				{...props}
				sizes={{ width: UI_BASE_SIZE, height: UI_BASE_SIZE }}
				{onpress}
				{disabled}
				spriteKey="bet_button"
				icon="payTable"
			/>
		{/if}
	{/snippet}
</ButtonBetProvider>
