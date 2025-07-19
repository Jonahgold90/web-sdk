<script lang="ts">
	import LoaderBase from './LoaderBase.svelte';

	type Props = {
		src: string;
	};

	const props: Props = $props();

	let showText = $state(true);

	const MAX_WIDTH = 400;
	const BACKGROUND_COLOR = '#090909';
	const FINISH_ONCE_TIMEOUT = 2000;
</script>


<LoaderBase
	src={props.src}
	maxWidth={MAX_WIDTH}
	backgroundColor={BACKGROUND_COLOR}
	timeout={FINISH_ONCE_TIMEOUT}
/>

