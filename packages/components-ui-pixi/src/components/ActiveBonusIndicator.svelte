<script lang="ts">
    import { stateBet, stateBetDerived } from 'state-shared';
    import { Container, Sprite, Text, Graphics } from 'pixi-svelte';
    import { UI_BASE_FONT_SIZE } from '../constants';
    import { writable } from 'svelte/store';
  
    const activeMode = $derived(stateBetDerived.activeBetMode());
    const isActive = $derived(activeMode && activeMode.type === 'activate' && activeMode.mode !== 'BASE');
    const hovered = writable(false);
  
    const onDeactivate = () => {
      stateBet.activeBetModeKey = 'BASE';
    };
  
    const ICON_SIZE = 48;
    const BADGE_COLOR = 0xffe066;
    const TEXT_COLOR = 0x222222;
  
  </script>
  
  {#if isActive}
    <Container x={250} y={-10}>
      <!-- Badge background -->
      <Graphics
        draw={g => {
          g.clear();
          g.beginFill(0x3b2154, 0.85);
          g.lineStyle(2, 0xd47cff);
          g.drawRoundedRect(20, -30, 400, 60, 14);
          g.endFill();
        }}
      />
  
      <!-- Optional icon -->
      {#if activeMode.assets?.icon}
        <Sprite
          width={ICON_SIZE}
          height={ICON_SIZE}
          x={10}
          y={0}
          anchor={{ x: 0, y: 0.5 }}
          key={activeMode.assets.icon}
        />
      {/if}
  
      <!-- Super Boost Text -->
      <Text
        x={ICON_SIZE}
        y={0}
        anchor={{ x: 0, y: 0.5 }}
        text="SUPER BOOST"
        style={{
          fontFamily: 'proxima-nova',
          fontSize: UI_BASE_FONT_SIZE * 1,
          fill: 0xffffff,
          stroke: 0xffc0ff,
          strokeThickness: 2,
          fontWeight: 'bold',
          dropShadow: true,
          dropShadowColor: 0xd47cff,
          dropShadowDistance: 2,
        }}
      />
  
      <!-- ✕ Close Button with Hover -->
      <Container
        x={390}
        y={0}
        eventMode="static"
        cursor="pointer"
        onpointerup={onDeactivate}
        onpointerover={() => hovered.set(true)}
        onpointerout={() => hovered.set(false)}
        scale={$hovered ? { x: 1.1, y: 1.1 } : { x: 1, y: 1 }}
      >
        <!-- Circle background -->
        <Graphics
          draw={g => {
            g.clear();
            g.beginFill($hovered ? 0xffffff : 0x000000, $hovered ? 0.3 : 0.2);
            g.lineStyle(2, $hovered ? 0xff8888 : 0xd47cff);
            g.drawCircle(0, 0, 24);
            g.endFill();
          }}
        />
  
        <!-- ✕ icon -->
        <Text
          text="✕"
          anchor={{ x: 0.5, y: 0.5 }}
          style={{
            fontSize: UI_BASE_FONT_SIZE * 1,
            fill: $hovered ? 0xffffff : 0xff6666,
            fontWeight: 'bold',
            dropShadow: true,
            dropShadowColor: 0x000000,
            dropShadowBlur: 4,
            dropShadowDistance: 1,
          }}
        />
      </Container>
    </Container>
  {/if}
  