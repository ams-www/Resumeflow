'use strict';

/**
 * =============================================================================
 * 4. STATE MANAGEMENT
 * =============================================================================
 * High-performance state container with optimized history and persistence.
 * Uses a subscriber pattern to orchestrate UI updates and structured deep merging
 * to handle schema evolution.
 */

// OPTIMIZATION: hoisted to module level so mergeWithDefaults never re-allocates them.
const _MERGE_CATEGORIES = Object.freeze(['settings', 'visibility', 'personal', 'skills', 'additional']);
const _MERGE_ARRAYS      = Object.freeze(['exp', 'proj', 'edu']);

class Store {
    constructor() {
        /** @private */
        this._listeners     = new Set();
        /** @private */
        this._saveTimeout   = null;
        /** @private */
        this._historyTimeout = null;

        // Initialize state from storage or defaults
        this.state = this.loadState();

        // History stack: stores deep clones of state snapshots
        this.history      = [Utils.clone(this.state)];
        this.historyIndex = 0;

        // Sync initial design tokens to CSS variables to prevent FOUC
        this._applyDesignTokens();
    }

    /**
     * Returns the master blueprint for the resume data structure.
     * @returns {Object}
     */
    getDefaultState() {
        return {
            settings:   { theme: 'light', accentColor: '#6366f1' },
            visibility: { exp: true, proj: true, edu: true },
            personal:   { name: '', role: '', email: '', phone: '', location: '', linkedin: '', website: '' },
            summary:    '',
            skills:     { tech: '', soft: '' },
            additional: { languages: '', hobbies: '' },
            exp:  [],
            proj: [],
            edu:  []
        };
    }

    /**
     * Fetches persisted data and ensures it complies with the current schema.
     * @returns {Object}
     */
    loadState() {
        try {
            const saved = localStorage.getItem(CONFIG.STORAGE_KEY);
            if (saved) return this.mergeWithDefaults(JSON.parse(saved));
        } catch (e) {
            console.error('Store: Persistence load failure', e);
        }
        return this.getDefaultState();
    }

    /**
     * Recursively merges saved data with the current default schema.
     * Prevents runtime errors when new sections or fields are added to the app.
     * @param {Object} saved
     * @returns {Object}
     */
    mergeWithDefaults(saved) {
        const defaults = this.getDefaultState();
        if (!saved || typeof saved !== 'object') return defaults;

        const merged = { ...defaults };

        _MERGE_CATEGORIES.forEach(cat => {
            if (saved[cat] && typeof saved[cat] === 'object') {
                merged[cat] = { ...defaults[cat], ...saved[cat] };
            }
        });

        merged.summary = typeof saved.summary === 'string' ? saved.summary : defaults.summary;

        _MERGE_ARRAYS.forEach(arr => {
            merged[arr] = Array.isArray(saved[arr]) ? saved[arr] : [];
        });

        return merged;
    }

    /**
     * Synchronizes the design system with the DOM via CSS custom properties.
     * @private
     */
    _applyDesignTokens() {
        const doc = document.documentElement;
        if (!doc) return;
        const { theme, accentColor } = this.state.settings;
        doc.setAttribute('data-theme', theme);
        doc.style.setProperty('--resume-accent', accentColor);
    }

    /**
     * Persists current state to localStorage with debouncing.
     */
    saveState() {
        if (this._saveTimeout) clearTimeout(this._saveTimeout);
        this._saveTimeout = setTimeout(() => {
            try {
                localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(this.state));
            } catch (e) {
                console.error('Store: Persistence save failure', e);
            }
        }, CONFIG.SAVE_DELAY);
    }

    /**
     * Core mutation method.
     * @param {Function} updater  - Function that receives state and modifies it.
     * @param {boolean}  isTyping - If true, history snapshots are debounced to prevent overhead.
     */
    update(updater, isTyping = false) {
        updater(this.state);

        // Apply visual settings changes immediately (before render)
        this._applyDesignTokens();

        if (!isTyping) {
            this.pushHistory();
        } else {
            // Group rapid typing events into a single history entry
            if (this._historyTimeout) clearTimeout(this._historyTimeout);
            this._historyTimeout = setTimeout(() => this.pushHistory(), CONFIG.HISTORY_DEBOUNCE);
        }

        this.saveState();
        this.notify();
    }

    /**
     * Captures a deep snapshot of the current state for the undo/redo stack.
     */
    pushHistory() {
        // Truncate redo stack if a new change happens after undo
        if (this.historyIndex < this.history.length - 1) {
            this.history = this.history.slice(0, this.historyIndex + 1);
        }

        const snapshot     = Utils.clone(this.state);
        const lastSnapshot = this.history[this.historyIndex];

        // Skip snapshot if state is effectively unchanged
        if (JSON.stringify(lastSnapshot) === JSON.stringify(snapshot)) return;

        this.history.push(snapshot);

        // Enforce maximum buffer size
        if (this.history.length > CONFIG.MAX_HISTORY) {
            this.history.shift();
            // historyIndex stays the same: items shifted down by one so index
            // still points to the last entry after shift+push balance out.
        } else {
            this.historyIndex++;
        }
    }

    /**
     * Reverts to the previous state snapshot.
     * @returns {boolean} Success status.
     */
    undo() {
        if (this.historyIndex > 0) {
            this.historyIndex--;
            this.state = Utils.clone(this.history[this.historyIndex]);
            this._applyDesignTokens();
            this.saveState();
            this.notify();
            return true;
        }
        return false;
    }

    /**
     * Moves forward in the history stack.
     * @returns {boolean} Success status.
     */
    redo() {
        if (this.historyIndex < this.history.length - 1) {
            this.historyIndex++;
            this.state = Utils.clone(this.history[this.historyIndex]);
            this._applyDesignTokens();
            this.saveState();
            this.notify();
            return true;
        }
        return false;
    }

    /**
     * Pub/Sub: adds a function to be called on state change.
     * @param {Function} listener
     * @returns {Function} Unsubscribe function.
     */
    subscribe(listener) {
        this._listeners.add(listener);
        return () => this._listeners.delete(listener);
    }

    /**
     * Notifies all subscribers of a state change.
     */
    notify() {
        this._listeners.forEach(listener => listener(this.state));
    }

    /**
     * Replaces current state with external data.
     * @param {Object} data
     */
    importState(data) {
        this.state        = this.mergeWithDefaults(data);
        this.history      = [Utils.clone(this.state)];
        this.historyIndex = 0;
        this._applyDesignTokens();
        this.saveState();
        this.notify();
    }

    /**
     * Returns a JSON representation of the current state.
     * @returns {string}
     */
    exportState() {
        return JSON.stringify(this.state, null, 2);
    }
}
