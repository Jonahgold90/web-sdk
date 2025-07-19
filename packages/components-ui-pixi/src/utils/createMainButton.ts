import * as PIXI from 'pixi.js';
import { i18nDerived } from '../i18n/i18nDerived';
import { stateUrlDerived } from 'state-shared';

export type ButtonOptions = {
  width?: number;
  height?: number;
  textStyle?: Partial<PIXI.TextStyle>;
  backgroundTexture?: PIXI.Texture;
};

/**
 * Creates a main button (BET/SPIN/etc) that adapts to social mode.
 * @param labelKey - The i18nDerived key (e.g., 'bet', 'buyBonus')
 * @param imageTexture - The PIXI.Texture for the image-based button (regular mode)
 * @param onClick - Callback for button press
 * @param options - Optional style/background overrides
 * @returns PIXI.Container with the button
 */
export function createMainButton(
  labelKey: keyof typeof i18nDerived,
  imageTexture: PIXI.Texture,
  onClick: () => void,
  options: ButtonOptions = {}
): PIXI.Container {
  const isSocial = stateUrlDerived.social();
  const container = new PIXI.Container();

  if (isSocial) {
    // Optionally add a background sprite for the text button
    if (options.backgroundTexture) {
      const bg = new PIXI.Sprite(options.backgroundTexture);
      if (options.width) bg.width = options.width;
      if (options.height) bg.height = options.height;
      container.addChild(bg);
    }

    // Create styled text
    const text = new PIXI.Text(i18nDerived[labelKey](), {
      fontFamily: 'Arial',
      fontSize: options.textStyle?.fontSize ?? 48,
      fill: options.textStyle?.fill ?? 0xffffff,
      fontWeight: options.textStyle?.fontWeight ?? 'bold',
      align: 'center',
      ...options.textStyle,
    });

    // Center text in container
    text.anchor.set(0.5);
    text.x = (options.width ?? text.width) / 2;
    text.y = (options.height ?? text.height) / 2;
    container.addChild(text);

    // Interactivity
    container.interactive = true;
    container.buttonMode = true;
    container.on('pointertap', onClick);
  } else {
    // Image-based button
    const sprite = new PIXI.Sprite(imageTexture);
    if (options.width) sprite.width = options.width;
    if (options.height) sprite.height = options.height;
    sprite.interactive = true;
    sprite.buttonMode = true;
    sprite.on('pointertap', onClick);
    container.addChild(sprite);
  }

  return container;
} 