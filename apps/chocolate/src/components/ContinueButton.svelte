<script lang="ts">
	interface Props {
		onclick?: () => void;
		style?: string;
	}

	let { onclick, style = "" }: Props = $props();

	const ContinueButton = new URL('../../assets/sprites/continueButton/CONTINUE_BUTTON.png', import.meta.url).href;
</script>

<img 
	src={ContinueButton} 
	alt="Continue" 
	style="margin: -10px auto 0; display: block; cursor: pointer; width: min(300px, 40vw); height: auto; transition: all 0.2s ease; filter: brightness(1); {style}"
	onclick={onclick}
	role="button"
	onmouseenter={(e) => e.currentTarget.style.opacity = '0.8'}
	onmouseleave={(e) => e.currentTarget.style.opacity = '1'}
	tabindex="0"
	onkeydown={(e) => e.key === 'Enter' && onclick?.()}
/>