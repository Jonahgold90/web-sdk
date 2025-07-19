<script lang="ts">
	import type { ButtonProps } from 'components-pixi';
	import { stateModal, stateBet, stateBetDerived, stateUrlDerived } from 'state-shared';
	import UiButton from './UiButton.svelte';
	import { UI_BASE_SIZE, UI_BASE_FONT_SIZE } from '../constants';
	import { getContext } from '../context';
	import { i18nDerived } from '../i18n/i18nDerived';
	import { Text, Rectangle } from 'pixi-svelte';

	const props: Partial<Omit<ButtonProps, 'children'>> = $props();
	const { stateXstateDerived, eventEmitter } = getContext();
	const sizes = { width: UI_BASE_SIZE, height: UI_BASE_SIZE };
	const disabled = $derived(!stateXstateDerived.isIdle());
	const active = $derived(stateBetDerived.activeBetMode()?.type === 'activate');

	const openModal = () => (stateModal.modal = { name: 'buyBonus' });
	const disableActiveBetMode = () => (stateBet.activeBetModeKey = 'BASE');
	const onpress = () => {
		eventEmitter.broadcast({ type: 'soundPressGeneral' });
		if (active) {
			disableActiveBetMode();
		} else {
			openModal();
		}
	};

	const isSocial = stateUrlDerived.social();
	const baseWidth = UI_BASE_SIZE * 1.5;
	const baseHeight = UI_BASE_SIZE * 0.9;
	const gold = 0xffd700;
	const dark = 0x18122b;
	const purple = 0xD99AF7;
</script>

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
			borderColor={purple}
			borderWidth={5}
			borderRadius={28}
			backgroundColor={dark}
			alpha={0.9}
		/>
		<Text
			text={`PLAY\nBONUS`}
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
		{sizes}
		{onpress}
		{disabled}
		spriteKey="buy_bonus_button"
		icon="payTable"
	/>
{/if}
