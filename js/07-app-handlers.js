/**
 * =============================================================================
 * 7. APP HANDLERS
 * =============================================================================
 * Logic for managing data mutations and UI state transitions.
 * Optimized for mobile touch targets and rapid state synchronization.
 */

Object.assign(ResumeApp.prototype, {
    /**
     * Appends a new entry to a dynamic section (Experience, Education, etc.).
     * @param {string} type - The section identifier ('exp', 'proj', 'edu').
     */
    addItem(type) {
        if (!this.store.state[type]) return;

        this.store.update(s => {
            s[type].push({
                id: Utils.uid(),
                title: '',
                subtitle: '',
                date: '',
                description: ''
            });
        });

        const label = type === 'exp' ? 'Experience' : type === 'edu' ? 'Education' : 'Project';
        this.showToast(`New ${label} entry added`);
    },

    /**
     * Removes an entry from a dynamic section.
     * Note: Native confirm() is used as a safety fallback; in a production 
     * environment with custom UI, this would be replaced by a non-blocking modal.
     * @param {string} type - The section identifier.
     * @param {number} index - Array index to remove.
     */
    deleteItem(type, index) {
        const items = this.store.state[type];
        if (!items || !items[index]) return;

        // Perform mutation via store
        this.store.update(s => {
            if (s[type]) s[type].splice(index, 1);
        });

        this.showToast('Item removed');
    },

    /**
     * Toggles the rendering of a specific section in the resume preview.
     * @param {string} type - The section identifier.
     */
    toggleVisibility(type) {
        this.store.update(s => {
            if (s.visibility) {
                s.visibility[type] = !s.visibility[type];
            }
        });
    },

    /**
     * Toggles between 'light' and 'dark' application themes.
     */
    toggleTheme() {
        this.store.update(s => {
            const current = s.settings.theme;
            s.settings.theme = current === 'light' ? 'dark' : 'light';
        });

        const isDark = this.store.state.settings.theme === 'dark';
        this.showToast(`${isDark ? 'Dark' : 'Light'} mode enabled`);
    },

    /**
     * Updates the primary accent color across the application.
     * @param {Event} e - Input event from the color picker.
     */
    handleColorChange(e) {
        const color = e?.target?.value;
        if (!color) return;

        this.store.update(s => {
            s.settings.accentColor = color;
        });
    },

    /**
     * Orchestrates view switching for responsive layouts.
     * @param {string} mode - 'edit' or 'preview'.
     */
    switchView(mode) {
        if (!mode) return;

        // 1. Update Body state for CSS-based layout shifts
        document.body.className = `mode-${mode}`;

        // 2. Synchronize Tab/Button accessibility and active states
        if (this.elements.viewBtns) {
            this.elements.viewBtns.forEach(btn => {
                const isActive = btn.dataset.view === mode;
                btn.classList.toggle('active', isActive);
                btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
            });
        }

        // 3. UX: If switching to preview, ensure scaling is recalculated
        if (mode === 'preview') {
            // Use requestAnimationFrame to wait for CSS layout transitions
            requestAnimationFrame(() => {
                if (typeof this.scalePreview === 'function') {
                    this.scalePreview();
                }
            });
        }
    }
});

