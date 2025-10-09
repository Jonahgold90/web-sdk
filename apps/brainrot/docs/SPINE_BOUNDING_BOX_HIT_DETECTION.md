# Spine Bounding Box Hit Detection Implementation

## Overview

This document explains how we implemented accurate button click detection for Spine animations using bounding box attachments and polygon-based hit testing in the buy feature modal.

## Problem Statement

We needed accurate, responsive click detection for buttons in a Spine animation that:
- Works at any screen size or animation scale
- Matches the visual button shapes exactly
- Uses the animator's intended clickable regions
- Doesn't rely on hardcoded pixel coordinates

## Solution: Spine Bounding Box Attachments

### What are Bounding Box Attachments?

Bounding box attachments are invisible polygon shapes that animators add to Spine skeletons specifically for hit detection. They are **different** from display bounds:

- **Display Bounds**: The rectangular AABB (Axis-Aligned Bounding Box) that encompasses the entire visible skeleton - used for culling and layout
- **Bounding Box Attachments**: Invisible polygons attached to specific bones - used for interactive hit testing

### Key Concepts

1. **SkeletonBounds**: A class that collects all bounding box attachments from a skeleton and provides hit testing functionality
2. **Polygon Hit Testing**: Uses ray casting algorithm to determine if a point is inside a polygon
3. **World Transform**: Bounding boxes transform with their parent bones, so they automatically scale and move with the animation

## Implementation

### Required Library

```typescript
import * as spine from '@esotericsoftware/spine-pixi-v8';
```

**Important**: Use `@esotericsoftware/spine-pixi-v8` specifically, not `@pixi-spine/runtime-4.1` or `@esotericsoftware/spine-core`. The spine-pixi-v8 package includes all necessary classes for PixiJS v8 integration.

### Architecture

We created two components:

1. **BuyButtonBoundingBoxesWrapper.svelte**: Accesses the Spine context from inside `SpineProvider`
2. **BuyButtonBoundingBoxes.svelte**: Implements the hit detection logic

This separation is necessary because the Spine context (`@@pixi_spine`) is only available to components rendered inside `SpineProvider`.

### Step-by-Step Implementation

#### 1. Animator Setup (Spine Editor)

The animator must create bounding box attachments in Spine:

1. Create invisible bounding box attachments for each clickable region
2. Parent them to the appropriate bones
3. Name them descriptively (e.g., `yes_place_holder2`, `x_place_holder2`, `upper_cross`)

In the exported JSON, these appear as:

```json
{
  "yes_place_holder2": {
    "type": "boundingbox",
    "vertexCount": 4,
    "vertices": [-50, -25, 50, -25, 50, 25, -50, 25]
  }
}
```

#### 2. Context Access Wrapper Component

```typescript
// BuyButtonBoundingBoxesWrapper.svelte
import { getContext as getSvelteContext } from 'svelte';
import BuyButtonBoundingBoxes from './BuyButtonBoundingBoxes.svelte';

const spineInstance = getSvelteContext('@@pixi_spine');
```

**Key Point**: The context namespace is `'@@pixi_spine'`, not `'spine'`.

#### 3. Core Hit Detection Component

```typescript
// BuyButtonBoundingBoxes.svelte
import * as spine from '@esotericsoftware/spine-pixi-v8';
import type { Spine } from '@esotericsoftware/spine-pixi-v8';
import type { FederatedPointerEvent } from 'pixi.js';

let { spineInstance }: { spineInstance: Spine } = $props();

const bounds = new spine.SkeletonBounds();
```

### Critical Functions

#### 1. Refresh Bounds

Updates the skeleton's world transform and recalculates bounding box polygons:

```typescript
function refreshBounds() {
  // spine-pixi-v8 requires a Physics parameter
  const physics = spineInstance.skeleton.data.defaultPhysics || spine.Physics.none;
  spineInstance.skeleton.updateWorldTransform(physics);
  bounds.update(spineInstance.skeleton, true);
}
```

**Important**: In spine-pixi-v8, `updateWorldTransform()` requires a `Physics` parameter. Use the skeleton's default physics or `spine.Physics.none`.

#### 2. Point-in-Polygon Test

The `SkeletonBounds.containsPointPolygon()` static method **does not exist** in spine-pixi-v8, so we implement the ray casting algorithm manually:

```typescript
function containsPoint(polygon: ArrayLike<number>, x: number, y: number): boolean {
  const nn = polygon.length;
  let prevIndex = nn - 2;
  let inside = false;

  for (let ii = 0; ii < nn; ii += 2) {
    const vertexY = polygon[ii + 1];
    const prevY = polygon[prevIndex + 1];

    if ((vertexY < y && prevY >= y) || (prevY < y && vertexY >= y)) {
      const vertexX = polygon[ii];
      if (vertexX + (y - vertexY) / (prevY - vertexY) * (polygon[prevIndex] - vertexX) < x) {
        inside = !inside;
      }
    }
    prevIndex = ii;
  }

  return inside;
}
```

**How it works**:
- Casts a ray from the point to infinity
- Counts how many polygon edges it crosses
- If odd number of crossings, point is inside; if even, point is outside

#### 3. Hit Box Testing

Tests if a click hit a specific named bounding box:

```typescript
function hitBox(attachmentName: string, e: FederatedPointerEvent): boolean {
  refreshBounds();
  const p = spineInstance.toLocal(e.global);

  // Quick AABB check first (optimization)
  if (!bounds.aabbContainsPoint(p.x, p.y)) return false;

  // Find the specific bounding box and test polygon
  for (let i = 0; i < bounds.boundingBoxes.length; i++) {
    const bb = bounds.boundingBoxes[i];
    if (bb.name === attachmentName) {
      const poly = bounds.polygons[i];
      return containsPoint(poly, p.x, p.y);
    }
  }
  return false;
}
```

**Key steps**:
1. Convert global click coordinates to spine local coordinates using `toLocal()`
2. Quick AABB check first (optimization - avoids polygon tests if click is nowhere near skeleton)
3. Find bounding box by name
4. Test if point is inside the polygon

#### 4. Click Handler

```typescript
function onPointerDown(e: FederatedPointerEvent) {
  if (hitBox('yes_place_holder2', e)) {
    stateBuyButton.animationName = 'big_buy_yes_out';
    stateBuyButton.loop = false;
  } else if (hitBox('x_place_holder2', e)) {
    stateBuyButton.animationName = 'big_buy_no_out';
    stateBuyButton.loop = false;
  } else if (hitBox('upper_cross', e)) {
    stateBuyButton.animationName = 'big_buy_upper_cross_out';
    stateBuyButton.loop = false;
  }
}
```

#### 5. Make Spine Interactive

```typescript
onMount(() => {
  spineInstance.eventMode = 'static';
  spineInstance.cursor = 'pointer';
  spineInstance.on('pointerdown', onPointerDown);

  return () => {
    spineInstance.off('pointerdown', onPointerDown);
  };
});
```

**Important**: Set `eventMode = 'static'` to make the Spine instance receive pointer events.

### Parent Component Integration

```svelte
<!-- BuyButtonPopup.svelte -->
<SpineProvider key="buyButtonSpine" ...>
  <SpineTrack trackIndex={0} animationName={...} loop={...} />
  <BuyButtonBoundingBoxesWrapper />
</SpineProvider>
```

The wrapper component must be rendered **inside** `SpineProvider` to access the spine context.

## Common Pitfalls

### 1. ❌ Wrong Import Package
```typescript
// WRONG - these don't exist or don't have the right classes
import * as spine from '@pixi-spine/runtime-4.1';
import * as spine from '@esotericsoftware/spine-core';

// CORRECT
import * as spine from '@esotericsoftware/spine-pixi-v8';
```

### 2. ❌ Wrong Context Namespace
```typescript
// WRONG
const spineInstance = getSvelteContext('spine');

// CORRECT
const spineInstance = getSvelteContext('@@pixi_spine');
```

### 3. ❌ Missing Physics Parameter
```typescript
// WRONG - will throw "physics is undefined" error
spineInstance.skeleton.updateWorldTransform();

// CORRECT
const physics = spineInstance.skeleton.data.defaultPhysics || spine.Physics.none;
spineInstance.skeleton.updateWorldTransform(physics);
```

### 4. ❌ Using Non-Existent Method
```typescript
// WRONG - this method doesn't exist in spine-pixi-v8
spine.SkeletonBounds.containsPointPolygon(poly, x, y);

// CORRECT - implement ray casting manually
containsPoint(poly, x, y);
```

### 5. ❌ Accessing Context Outside SpineProvider
```typescript
// WRONG - spine context won't be available
<SpineProvider>...</SpineProvider>
<ComponentThatNeedsSpine />

// CORRECT - render inside provider
<SpineProvider>
  <ComponentThatNeedsSpine />
</SpineProvider>
```

### 6. ❌ Using Display Bounds Instead of Bounding Box Attachments
```typescript
// WRONG - SpineBoundsProvider gives you display bounds (AABB)
// This is for layout, not hit testing

// CORRECT - Use SkeletonBounds for hit testing bounding box attachments
const bounds = new spine.SkeletonBounds();
bounds.update(skeleton, true);
```

## Benefits of This Approach

1. **Animator Control**: Designers control clickable regions directly in Spine
2. **Automatic Scaling**: Bounding boxes transform with bones, so they work at any scale
3. **Accurate Detection**: Polygon testing matches visual shapes exactly
4. **Performance**: AABB pre-check avoids expensive polygon tests when click is far away
5. **Maintainable**: No hardcoded coordinates - changes happen in Spine editor

## Debugging Tips

### Check Available Bounding Boxes
```typescript
refreshBounds();
const boxNames = bounds.boundingBoxes.map(bb => bb.name);
console.log('Available bounding boxes:', boxNames);
```

### Visualize Click Points
```typescript
const p = spineInstance.toLocal(e.global);
console.log('Click at local coords:', p.x, p.y);
console.log('AABB contains point:', bounds.aabbContainsPoint(p.x, p.y));
```

### Check Polygon Data
```typescript
for (let i = 0; i < bounds.boundingBoxes.length; i++) {
  console.log(bounds.boundingBoxes[i].name, bounds.polygons[i]);
}
```

## References

- [Spine-Pixi Documentation](https://en.esotericsoftware.com/spine-pixi)
- [Spine Runtime API Reference](https://en.esotericsoftware.com/spine-api-reference:spine-pixi-typescript#SkeletonBounds)
- [Ray Casting Algorithm (Point in Polygon)](https://en.wikipedia.org/wiki/Point_in_polygon)

## Files Modified

- [BuyButtonBoundingBoxesWrapper.svelte](../src/components/BuyButtonBoundingBoxesWrapper.svelte) - Context access wrapper
- [BuyButtonBoundingBoxes.svelte](../src/components/BuyButtonBoundingBoxes.svelte) - Core hit detection logic
- [BuyButtonPopup.svelte](../src/components/BuyButtonPopup.svelte) - Parent component integration
- [BoardFrame.svelte](../src/components/BoardFrame.svelte) - Animation state and type definitions
