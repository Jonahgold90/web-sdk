import type { BookEventOfType } from './typesBookEvent';
import { eventEmitter } from './eventEmitter';

/**
 * Utility function to play collection sequence animation
 * This can be called directly from the console or other components
 */
export async function playCollectSequence(event: BookEventOfType<'cc_collect_sequence'>): Promise<void> {
	console.log('🎬 Playing collection sequence from utility function', event);
	
	// Show collection animation
	eventEmitter.broadcast({ type: 'collectionAnimationShow' });
	
	// Play the animation sequence
	await eventEmitter.broadcastAsync({ 
		type: 'collectionAnimationPlay',
		event: event
	});
	
	console.log('✅ Collection sequence animation completed from utility');
}

/**
 * Toggle debug mode for collection animations
 */
export function toggleCollectionDebugMode(): void {
	eventEmitter.broadcast({ type: 'collectionAnimationToggleDebug' });
}

/**
 * Hide collection animations
 */
export function hideCollectionAnimations(): void {
	eventEmitter.broadcast({ type: 'collectionAnimationHide' });
}

/**
 * Show current bet amount for debugging scaling
 */
export function showCurrentBet(): void {
	const { stateBet } = require('state-shared');
	console.log(`💰 Current bet: ${stateBet.wageredBetAmount}`);
	console.log(`💰 Currency: ${stateBet.currency}`);
	console.log(`💰 Example scaling: base_value=10 would display as ${10 * stateBet.wageredBetAmount} in bet currency`);
}

/**
 * Sample collection sequence event for testing
 * Note: base_value and credited_value are in raw symbol units, not scaled by bet
 * The frontend will multiply these by the current bet amount
 */
export const sampleCollectionEvent: BookEventOfType<'cc_collect_sequence'> = {
	index: 10,
	type: 'cc_collect_sequence',
	collections: [
		{
			cw: { col: 2, row: 1 },
			cw_level: 3,
			cw_multiplier: 3,
			steps: [
				{ cc: { col: 0, row: 0 }, base_value: 10, multiplier_used: 3, credited_value: 30 },
				{ cc: { col: 1, row: 2 }, base_value: 5, multiplier_used: 3, credited_value: 15 }
			],
			total: 45
		},
		{
			cw: { col: 4, row: 0 },
			cw_level: 3,
			cw_multiplier: 3,
			steps: [
				{ cc: { col: 0, row: 0 }, base_value: 10, multiplier_used: 3, credited_value: 30 },
				{ cc: { col: 1, row: 2 }, base_value: 5, multiplier_used: 3, credited_value: 15 }
			],
			total: 45
		}
	]
};

/**
 * More complex sample collection event
 * Note: These are raw symbol values that will be scaled by current bet
 */
export const complexCollectionEvent: BookEventOfType<'cc_collect_sequence'> = {
	index: 15,
	type: 'cc_collect_sequence',
	collections: [
		{
			cw: { col: 1, row: 0 },
			cw_level: 2,
			cw_multiplier: 2,
			steps: [
				{ cc: { col: 0, row: 1 }, base_value: 25, multiplier_used: 2, credited_value: 50 },
				{ cc: { col: 2, row: 2 }, base_value: 15, multiplier_used: 2, credited_value: 30 },
				{ cc: { col: 4, row: 1 }, base_value: 10, multiplier_used: 2, credited_value: 20 }
			],
			total: 100
		},
		{
			cw: { col: 3, row: 2 },
			cw_level: 4,
			cw_multiplier: 10,
			steps: [
				{ cc: { col: 0, row: 1 }, base_value: 25, multiplier_used: 10, credited_value: 250 },
				{ cc: { col: 2, row: 2 }, base_value: 15, multiplier_used: 10, credited_value: 150 }
			],
			total: 400
		}
	]
};

// Make functions globally available for console testing
if (typeof window !== 'undefined') {
	(window as any).playCollectSequence = playCollectSequence;
	(window as any).toggleCollectionDebugMode = toggleCollectionDebugMode;
	(window as any).hideCollectionAnimations = hideCollectionAnimations;
	(window as any).showCurrentBet = showCurrentBet;
	(window as any).sampleCollectionEvent = sampleCollectionEvent;
	(window as any).complexCollectionEvent = complexCollectionEvent;
}