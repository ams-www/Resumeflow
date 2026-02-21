'use strict';

/**
 * =============================================================================
 * 9. APP I/O (Import, Export, Scaling, Toast)
 * =============================================================================
 * Handles file operations, responsive viewport scaling for the A4 preview, 
 * and the global notification system.
 */

Object.assign(ResumeApp.prototype, {
    /**
     * Handles JSON file imports with validation and state reconciliation.
     * Ensures only valid .json files are processed and triggers UI re-sync.
     * @param {Event} e - Change event from the hidden file input.
     */
    handleImport(e) {
        const file = e.target?.files?.[0];
        if (!file) return;

        // Validation: Only permit JSON files to prevent runtime parsing errors
        if (!file.type.includes('json') && !file.name.endsWith('.json')) {
            this.showToast('Error: Please select a valid .json file');
            e.target.value = '';
            return;
        }

        const reader = new FileReader();
        
        reader.onload = (event) => {
            try {
                const rawContent = event.target.result;
                const data = JSON.parse(rawContent);
                
                // State reconciliation is handled internally by the Store class
                this.store.importState(data);
                this.showToast('Resume configuration imported');
                
                // Force a layout recalculation after the new state is rendered
                requestAnimationFrame(() => this.scalePreview());
            } catch (err) {
                console.error('ResumeApp: Import failed', err);
                this.showToast('Error: Invalid file structure');
            } finally {
                // Reset input to allow re-importing the same file if modified externally
                e.target.value = '';
            }
        };

        reader.onerror = () => {
            this.showToast('Error: Failed to read file from disk');
            e.target.value = '';
        };

        reader.readAsText(file);
    },

    /**
     * Serializes the current state and triggers a browser download.
     * Cleans up object URLs to prevent memory leaks.
     */
    handleExport() {
        try {
            const jsonString = this.store.exportState();
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);

            const anchor = document.createElement('a');
            const timestamp = new Date().toISOString().split('T')[0];
            
            anchor.href = url;
            anchor.download = `resumeflow-export-${timestamp}.json`;
            
            // Standard programmatic click for broad browser compatibility
            document.body.appendChild(anchor);
            anchor.click();
            
            // Cleanup: remove temporary node and revoke blob URL
            document.body.removeChild(anchor);
            setTimeout(() => URL.revokeObjectURL(url), 100);

            this.showToast('Resume exported as JSON');
        } catch (err) {
            console.error('ResumeApp: Export failed', err);
            this.showToast('Error: Failed to generate export');
        }
    },

    /**
     * High-performance A4 preview scaling engine.
     * Uses hardware-accelerated transforms to fit the fixed-dimension A4 
     * paper into the fluid workspace container.
     */
    scalePreview() {
        const { preview: container, resumePaper: paper } = this.elements;

        // Guard against execution if components are missing or hidden (e.g., initial tab load)
        if (!container || !paper || container.offsetWidth === 0) return;

        // Use requestAnimationFrame to synchronize with browser render cycles and prevent layout thrashing
        requestAnimationFrame(() => {
            // Calculate available width minus UI padding (80px safety margin)
            const horizontalSafetyPadding = 80;
            const availableWidth = container.clientWidth - horizontalSafetyPadding;
            
            // Calculate scale based on A4 width configuration
            // Clamped between MIN_SCALE and MAX_SCALE to preserve visual integrity
            const rawScale = availableWidth / CONFIG.A4_WIDTH_PX;
            const targetScale = Math.min(
                CONFIG.MAX_SCALE, 
                Math.max(CONFIG.MIN_SCALE, rawScale)
            );

            // Apply transform (transform-origin is handled in CSS as 'top center')
            paper.style.transform = `scale(${targetScale})`;

            /**
             * Compensation Logic: 
             * CSS 'scale' does not change the physical space the element occupies in the DOM flow.
             * We calculate the height difference and apply a negative margin to allow 
             * the preview container to scroll naturally without excess whitespace at the bottom.
             */
            const baseHeight = CONFIG.A4_HEIGHT_PX;
            const heightDifference = baseHeight * (1 - targetScale);
            
            paper.style.marginBottom = targetScale < 1 ? `-${heightDifference}px` : '0px';
        });
    },

    /**
     * Global notification system for the application.
     * Includes concurrency handling to prevent toast overlapping or flickering.
     * @param {string} message - The text to display.
     */
    showToast(message) {
        const toast = this.elements.toast;
        if (!toast) return;

        // Concurrency Guard: Clear active timers if a new toast is requested
        if (this._toastTimeout) {
            clearTimeout(this._toastTimeout);
            toast.classList.remove('show');
            this._toastTimeout = null;
        }

        /**
         * Orchestrates the show/hide lifecycle.
         */
        const triggerDisplay = () => {
            toast.textContent = message;
            toast.classList.add('show');

            this._toastTimeout = setTimeout(() => {
                toast.classList.remove('show');
                this._toastTimeout = null;
            }, CONFIG.TOAST_DURATION);
        };

        // If a toast is currently animating out, wait for it to clear before showing new one
        if (toast.classList.contains('show')) {
            setTimeout(triggerDisplay, 150);
        } else {
            triggerDisplay();
        }
    }
});

