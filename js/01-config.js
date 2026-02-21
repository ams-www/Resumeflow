'use strict';

/**
 * =============================================================================
 * 1. CONFIGURATION
 * =============================================================================
 * Centralized, immutable settings for the ResumeFlow application.
 * Values are optimized for performance, history management, and A4 precision.
 * Using Object.freeze to prevent runtime mutations and ensure state integrity.
 */

const CONFIG = Object.freeze({
    /** @type {string} Key used for localStorage persistence */
    STORAGE_KEY: 'resumeflow_data_v1',

    /** @type {number} Delay in milliseconds for debouncing state persistence */
    SAVE_DELAY: 500,

    /** @type {number} Maximum capacity of the undo/redo history buffer */
    MAX_HISTORY: 50,

    /** @type {number} Delay in milliseconds for debouncing history snapshots during active typing */
    HISTORY_DEBOUNCE: 1000,

    /** @type {number} Target A4 width in pixels at 96 DPI (210mm) */
    A4_WIDTH_PX: 794,

    /** @type {number} Target A4 height in pixels at 96 DPI (297mm) */
    A4_HEIGHT_PX: 1123,

    /** @type {number} Maximum allowed scale factor for the resume preview */
    MAX_SCALE: 1.0,

    /** @type {number} Minimum allowed scale factor for the resume preview to maintain readability */
    MIN_SCALE: 0.4,

    /** @type {number} Total display duration for toast notifications in milliseconds */
    TOAST_DURATION: 2000
});

