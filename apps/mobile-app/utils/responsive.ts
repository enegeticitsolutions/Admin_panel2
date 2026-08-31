import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

// ----------------------------------------------------
// Tablet/Web based designs (e.g. checkout.tsx)
// ----------------------------------------------------
const FIGMA_WIDTH_TABLET = 716; 
// figmaScale is capped at 1.0 to prevent layout elements from becoming excessively huge
const figmaScaleTablet = Math.min(width / FIGMA_WIDTH_TABLET, 1);

/**
 * Responsive scaling for tablet-based Figma designs (width: 716).
 * Used primarily in the checkout flow.
 */
export const fs = (value: number) => Math.round(value * figmaScaleTablet);


// ----------------------------------------------------
// Mobile based designs (e.g. subscriber module)
// ----------------------------------------------------
const BASE_WIDTH_MOBILE = 390; // Standard iPhone 14 Pro width

/**
 * Responsive scaling for mobile-based Figma designs (width: 390).
 * Used across the subscriber and beneficiary modules.
 */
export const scale = (size: number) => Math.round((width / BASE_WIDTH_MOBILE) * size);

/**
 * Vertical responsive scaling for mobile-based designs (height: 844).
 */
export const vscale = (size: number) => Math.round((height / 844) * size);

// Additional helpers
export const SCREEN_WIDTH = width;
export const SCREEN_HEIGHT = height;
