<script lang="ts">
	type Props = {
		oncomplete: () => void;
	};

	const props: Props = $props();
	
	// Immediately call oncomplete since we're removing the transition spine
	props.oncomplete();
</script>
