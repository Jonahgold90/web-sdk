<script lang="ts">
	import type { ButtonProps } from 'components-pixi';
	import { stateBet, stateBetDerived } from 'state-shared';

	import UiButton from './UiButton.svelte';
	import { UI_BASE_SIZE } from '../constants';
	import { getContext } from '../context';

	const props: Partial<Omit<ButtonProps, 'children'>> = $props();
	const context = getContext();
	const sizes = { width: UI_BASE_SIZE, height: UI_BASE_SIZE };
	const active = $derived(stateBet.isTurbo);
	const disabled = $derived(stateBet.isSpaceHold);
	let hovered = $state(false);
	let pressed = $state(false);

	$effect(() => {
		console.log('hovered:', hovered, 'pressed:', pressed, 'disabled:', disabled);
	});

	const onpress = () => {
		context.eventEmitter.broadcast({ type: 'soundPressGeneral' });
		stateBetDerived.updateIsTurbo(!stateBet.isTurbo, { persistent: true });
	};

	context.eventEmitter.subscribeOnMount({
		stopButtonClick: () => stateBetDerived.updateIsTurbo(true, { persistent: false }),
		stopButtonEnable: () => stateBetDerived.updateIsTurbo(false, { persistent: false }),
	});
</script>

<UiButton
  {...props}
  {sizes}
  {active}
  {onpress}
  {disabled}
  icon="turbo"
  spriteKey={
    disabled
      ? "turbo_active_hover"
      : active
        ? "turbo_active"
        : "turbo_active_hover"
  }
  onmouseenter={() => (hovered = true)}
  onmouseleave={() => (hovered = false)}
/>
