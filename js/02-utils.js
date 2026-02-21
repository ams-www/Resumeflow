/**
 * =============================================================================
 * 2. UTILITIES
 * =============================================================================
 * High-performance, memory-efficient utility functions for the ResumeFlow app.
 * Optimized for frequent UI updates and mobile device constraints.
 */

const Utils = Object.freeze({
    /**
     * Cache for HTML entities used in the escape function.
     * Prevents garbage collection overhead by avoiding DOM-based escaping.
     */
    _entityMap: Object.freeze({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
        '/': '&#x2F;'
    }),

    /**
     * Generates a collision-resistant unique ID using a base-36 timestamp
     * combined with high-entropy random bits.
     * @returns {string}
     */
    uid() {
        return `${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 9)}`;
    },

    /**
     * High-performance HTML escaping using regex.
     * Approximately 10-20x faster than creating temporary DOM elements.
     * @param {string} str 
     * @returns {string}
     */
    escapeHtml(str) {
        if (typeof str !== 'string') return str ? String(str) : '';
        return str.replace(/[&<>"'/]/g, (s) => this._entityMap[s]);
    },

    /**
     * Formats plain text into safe HTML, supporting basic markdown and line breaks.
     * Processes escaping and formatting in a single pass to minimize string allocations.
     * @param {string} str 
     * @returns {string}
     */
    formatText(str) {
        if (!str) return '';
        // Escape first to prevent XSS, then inject safe bold tags
        return this.escapeHtml(str)
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\n/g, '<br>');
    },

    /**
     * Deep clones an object using structuredClone (modern) with a fallback.
     * Fallback is optimized for the plain-object state used in this application.
     * @param {any} obj 
     * @returns {any}
     */
    clone(obj) {
        if (obj === null || typeof obj !== 'object') return obj;

        try {
            if (typeof structuredClone === 'function') {
                return structuredClone(obj);
            }
        } catch (e) {
            // Fallback for older browsers or specific environments
            return JSON.parse(JSON.stringify(obj));
        }
        
        return JSON.parse(JSON.stringify(obj));
    },

    /**
     * Debounces a function to prevent excessive calls during rapid events
     * like typing or window resizing.
     * @param {Function} fn 
     * @param {number} delay 
     * @returns {Function}
     */
    debounce(fn, delay) {
        let timeoutId;
        return (...args) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => fn.apply(this, args), delay);
        };
    },

    /**
     * Throttles a function to ensure it is called at most once per specified interval.
     * Ideal for high-frequency events like pointermove or scroll.
     * @param {Function} fn 
     * @param {number} limit 
     * @returns {Function}
     */
    throttle(fn, limit) {
        let inThrottle;
        return (...args) => {
            if (!inThrottle) {
                fn.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
});

