import { stateI18n } from 'state-shared';

import { BOOK_AMOUNT_MULTIPLIER } from 'constants-shared/bet';
import { stateBet } from 'state-shared';

const NO_LOCALISATION_CURRENCY_MAP: Record<string, string> = {
	XGC: 'GC',
	XSC: 'SC',
};

// bookEventAmount: is the amount or win numbers in the events of books, e.g. the amount in setTotalWin bookEvent
// {
// 	"index": 3,
// 	"type": "setTotalWin",
// 	"amount": 100
// },
// if betting on $1,   100 bookEventAmount equals to $1.    betAmountMultiplier is (100 / BOOK_AMOUNT_MULTIPLIER =) 1
// if betting on $1,    50 bookEventAmount equals to $0.5.  betAmountMultiplier is ( 50 / BOOK_AMOUNT_MULTIPLIER =) 0.5
// if betting on $0.5, 100 bookEventAmount equals to $0.5.  betAmountMultiplier is (100 / BOOK_AMOUNT_MULTIPLIER =) 1
// if betting on $0.5,  50 bookEventAmount equals to $0.25. betAmountMultiplier is ( 50 / BOOK_AMOUNT_MULTIPLIER =) 0.5

export const bookEventAmountToBetAmountMultiplier = (bookEventAmount: number) =>
	bookEventAmount / BOOK_AMOUNT_MULTIPLIER;

export const bookEventAmountToNormalisedAmount = (bookEventAmount: number) => {
	const betAmountMultiplier = bookEventAmountToBetAmountMultiplier(bookEventAmount);
	return stateBet.wageredBetAmount * betAmountMultiplier;
};

export const numberToFloat = (value: number) => Number.parseFloat(`${value}`);

export const numberToCurrencyString = (value: number) => {
	if (stateBet.currency in NO_LOCALISATION_CURRENCY_MAP) {
		return `${NO_LOCALISATION_CURRENCY_MAP[stateBet.currency]} ${numberToFloat(value).toFixed(2)}`;
	}

	return stateI18n.i18n.number(value, {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
		style: 'currency',
		currency: stateBet.currency,
		// numberingSystem: 'latn',
	});
};

export const bookEventAmountToCurrencyString = (bookEventAmount: number) => {
	const normalisedAmount = bookEventAmountToNormalisedAmount(bookEventAmount);
	return numberToCurrencyString(normalisedAmount);
};

// Map of currencies to bitmap-font safe symbols/abbreviations
const BITMAP_SAFE_CURRENCY_MAP: Record<string, string> = {
	USD: '$',
	CAD: 'C$',
	AUD: 'A$',
	NZD: 'NZ$',
	HKD: 'HK$',
	SGD: 'S$',
	// Use symbols for currencies supported in bitmap fonts (€, £)
	EUR: '€',
	GBP: '£',
	// Use abbreviations for currencies with special symbols not in bitmap fonts
	JPY: 'JPY',
	CNY: 'CNY',
	KRW: 'KRW',
	INR: 'INR',
	RUB: 'RUB',
	BRL: 'BRL',
	MXN: 'MXN',
	// Social casino currencies
	XGC: 'GC',
	XSC: 'SC',
};

// Get currency code/abbreviation for bitmap font display (symbols might not render)
export const getCurrencyCode = () => {
	// Use bitmap-safe mapping if available
	if (stateBet.currency in BITMAP_SAFE_CURRENCY_MAP) {
		return BITMAP_SAFE_CURRENCY_MAP[stateBet.currency];
	}
	// Fallback to currency code itself
	return stateBet.currency;
};

// Format amount with currency code (bitmap font safe)
export const numberToCurrencyCodeString = (value: number) => {
	const formattedNumber = numberToFloat(value).toFixed(2);
	const currencyCode = getCurrencyCode();
	// Add space after currency code if it's more than 2 characters (abbreviation vs symbol)
	const separator = currencyCode.length > 2 ? ' ' : '';
	return `${currencyCode}${separator}${formattedNumber}`;
};

// Bitmap font safe version of bookEventAmountToCurrencyString
export const bookEventAmountToCurrencyCodeString = (bookEventAmount: number) => {
	const normalisedAmount = bookEventAmountToNormalisedAmount(bookEventAmount);
	return numberToCurrencyCodeString(normalisedAmount);
};
