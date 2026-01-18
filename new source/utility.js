// utility.js
// ES6 module containing common utility functions
// Used throughout the audio-components codebase

/**
 * Logical NOT function for screen reader accessibility.
 * The "!" character is often not announced by screen readers.
 * Use not(x) instead of !x for better readability.
 * @param {*} value - The value to negate
 * @returns {boolean} - The logical negation of value
 */
export function not(value) {
	return !value;
} // not
