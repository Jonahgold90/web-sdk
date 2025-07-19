<script lang="ts" module>
	import { Rectangle, type RectangleProps } from 'pixi-svelte';
	import { Sprite, type SpriteProps } from 'pixi-svelte';

	export type Props = RectangleProps & {
		spriteKey?: string;
	};
</script>

<script lang="ts">
	const props: Props = $props();
	if (props.spriteKey) {
		// console.log('UiSprite: Rendering Sprite with key:', props.spriteKey, 'size:', props.width, props.height);
	}
</script>

{#if props.spriteKey}
	<!-- {console.log('Rendering Sprite with key:', props.spriteKey, 'size:', props.width, props.height)} -->
	<Sprite
    key={props.spriteKey}
    width={props.width}
    height={props.height}
    anchor={0.5}
    x={props.width / 2}
    y={props.height / 2}
  	/>
{:else}
	<Rectangle borderRadius={50} {...props} />
{/if}

<!-- ADD YOUR DESIGN -->

<!-- <script lang="ts" module>
	import { Sprite, type SpriteProps } from 'pixi-svelte';
	import type { sharedAssetsPixi } from 'constants-shared/assets';

	export type Props = SpriteProps & {
		key: keyof typeof sharedAssetsPixi;
	};
</script>

<script lang="ts">
	const props: Props = $props();
</script>

<Sprite {...props} /> -->
