import type { PixiPoint, Sizes } from './types';

export const REM = 16;
export const MIN_CLICKABLE_SIZE = 3 * REM; // 44 x 44 is minimum clickable size

export const getPointValues = ({
	point,
	defaultValue,
}: {
	point: PixiPoint;
	defaultValue: number;
}) => {
	const finalDefaultValue = defaultValue === undefined ? 0 : defaultValue;
	if (typeof point === 'number') return [point, point];
	return [point?.x || finalDefaultValue, point?.y || finalDefaultValue];
};

export const anchorToPivot = ({ anchor, sizes }: { anchor: PixiPoint; sizes: Sizes }) => {
	const { width, height } = sizes;
	const [anchorX, anchorY] = getPointValues({ point: anchor, defaultValue: 0 });
	return { x: width * anchorX, y: height * anchorY };
};

/**
 * Detects if WebGL is enabled.
 * Inspired from http://www.browserleaks.com/webgl#howto-detect-webgl
 *
 * @return { number } -1 for not Supported,
 *										0 for disabled
 *										1 for enabled
 */
export function detectWebGL() {
	// Check for the WebGL rendering context
	if (window && !!window.WebGLRenderingContext) {
		let canvas = document.createElement('canvas'),
			names = ['webgl', 'experimental-webgl', 'moz-webgl', 'webkit-3d'],
			context = false;

		for (const i in names) {
			try {
				// @ts-ignore
				context = canvas.getContext(names[i]);
				// @ts-ignore
				if (context && typeof context.getParameter === 'function') {
					// WebGL is enabled.
					return 1;
				}
			} catch (e) {}
		}

		// WebGL is supported, but disabled.
		return 0;
	}

	// WebGL not supported.
	return -1;
}

export const preloadFont = () =>
	new Promise<void>((resolve) => {
		try {
			// Create a style element for our font faces
			const style = document.createElement('style');
			style.textContent = `
                @font-face {
                    font-family: 'proxima-nova';
                    src: url('/assets/fonts/localFonts/proxima-nova-regular.woff2') format('woff2');
                    font-weight: 400;
                    font-style: normal;
                    font-display: swap;
                }
                @font-face {
                    font-family: 'proxima-nova';
                    src: url('/assets/fonts/localFonts/proxima-nova-semibold.woff2') format('woff2');
                    font-weight: 600;
                    font-style: normal;
                    font-display: swap;
                }
                @font-face {
                    font-family: 'proxima-nova';
                    src: url('/assets/fonts/localFonts/proxima-nova-bold.woff2') format('woff2');
                    font-weight: 700;
                    font-style: normal;
                    font-display: swap;
                }
                @font-face {
                    font-family: 'proxima-nova';
                    src: url('/assets/fonts/localFonts/proxima-nova-italic.woff2') format('woff2');
                    font-weight: 400;
                    font-style: italic;
                    font-display: swap;
                }
            `;
            
            // Add the styles to the document
            document.head.appendChild(style);
            
            // Resolve immediately since we don't need to wait for font loading
            resolve();
		} catch (error) {
			console.error('Error loading local fonts:', error);
			resolve();
		}
	});

export function propsSyncEffect<TProps extends object, TTarget>({
	props,
	target,
	ignore,
}: {
	props: TProps;
	target?: TTarget | (() => TTarget);
	ignore?: (keyof TProps)[];
}) {
	$effect(() => {
		// The whole thing is wrapped inside an $effect
		// and because of ”props[key]“，it will react with every single props updated.
		let targetInstance = target instanceof Function ? target() : target;
		if (targetInstance) {
			(Object.keys(props) as (keyof TProps)[])
				.filter((key) => (ignore ? !ignore.includes(key) : true))
				.forEach((key) => {
					if (props[key] !== undefined) {
						// @ts-ignore
						targetInstance[key] = props[key];
					}
				});
		}
	});
}