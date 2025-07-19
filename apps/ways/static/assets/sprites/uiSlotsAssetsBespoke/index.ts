import { getLoadableAssets } from 'utils-pixi';

import autospin_active from './autospin_active.webp';
import autospin_active_hover from './autospin_active_hover.webp';
import turbo_active from './turbo_active.webp';
import turbo_active_hover from './turbo_active_hover.webp';
import bet_button from './bet_button.png';
import plus_button from './plus_button.png'
import minus_button from './minus_button.png'
import settings_button from './settings_button.png'
import volume_button from './volume_button.png'
import close_menu_button from './close_menu_button.png'
import menu_button from  './menu_button.png'
import info_layer_background from './info_layer_background.png'
import info_button from './info_button.png'

export const rawAssets = {
	autospin_active,
	autospin_active_hover,
	turbo_active,
	turbo_active_hover,
	bet_button,
	plus_button,
	minus_button,
	settings_button,
	volume_button,
	close_menu_button,
	menu_button,
	info_layer_background,
	info_button,
};

export default getLoadableAssets(rawAssets);
