/**
 * =============================================================================
 * 2. UTILITIES
 * =============================================================================
 */

const Utils = {
    /**
     * Generate a unique ID
     */
    uid() {
        return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
    },

    /**
     * Escape HTML to prevent XSS
     */
    escapeHtml(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    },

    /**
     * Format text with basic markdown (bold, line breaks)
     */
    formatText(str) {
        if (!str) return '';
        return this.escapeHtml(str)
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\n/g, '<br>');
    },

    /**
     * Deep clone an object
     */
    clone(obj) {
        return JSON.parse(JSON.stringify(obj));
    }
};

