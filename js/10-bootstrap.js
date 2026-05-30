'use strict';

/**
 * =============================================================================
 * 10. BOOTSTRAP & EVENTS
 * =============================================================================
 * Entry point and event orchestration for the ResumeFlow application.
 * Implements high-performance event delegation, optimized touch handling,
 * and robust lifecycle management for a production-grade user experience.
 */

Object.assign(ResumeApp.prototype, {
    /**
     * Binds all application event listeners using optimized patterns.
     * Prioritizes event delegation and passive listeners to minimize main-thread blocking.
     */
    bindEvents() {
        const { elements, store } = this;
        if (!elements) return;

        // --- 1. Global Navigation & Actions ---
        elements.btnImport?.addEventListener('click', () => elements.fileInput?.click());
        elements.fileInput?.addEventListener('change', (e) => this.handleImport(e));
        elements.btnExport?.addEventListener('click', () => this.handleExport());
        elements.btnTheme?.addEventListener('click',  () => this.toggleTheme());
        elements.btnPrint?.addEventListener('click',  () => window.print());

        elements.colorPicker?.addEventListener('input', (e) => this.handleColorChange(e), { passive: true });

        // --- 2. Responsive View Orchestration ---
        elements.viewBtns?.forEach(btn => {
            btn.addEventListener('click', () => {
                const view = btn.getAttribute('data-view');
                if (view) this.switchView(view);
            });
        });

        // --- 3. Section Visibility Management ---
        const toggleMap = { exp: 'toggleExp', proj: 'toggleProj', edu: 'toggleEdu' };
        Object.entries(toggleMap).forEach(([key, elementKey]) => {
            elements[elementKey]?.addEventListener('change', () => this.toggleVisibility(key));
        });

        // --- 4. Unified Form Interaction (Editor) ---
        // Each binding maps a DOM element to its dot-notation state path.
        // BUG FIX: removed the redundant `root` flag — the path traversal loop handles
        // single-segment paths (e.g. 'summary') correctly without special-casing.
        const inputBindings = [
            { el: elements.inName,       path: 'personal.name' },
            { el: elements.inRole,       path: 'personal.role' },
            { el: elements.inEmail,      path: 'personal.email' },
            { el: elements.inPhone,      path: 'personal.phone' },
            { el: elements.inLocation,   path: 'personal.location' },
            { el: elements.inLinkedin,   path: 'personal.linkedin' },
            { el: elements.inWebsite,    path: 'personal.website' },
            { el: elements.inSummary,    path: 'summary' },
            { el: elements.inSkillsTech, path: 'skills.tech' },
            { el: elements.inSkillsSoft, path: 'skills.soft' },
            { el: elements.inLanguages,  path: 'additional.languages' },
            { el: elements.inHobbies,    path: 'additional.hobbies' }
        ];

        inputBindings.forEach(({ el, path }) => {
            if (!el) return;
            const keys = path.split('.');
            el.addEventListener('input', () => {
                store.update(s => {
                    let current = s;
                    for (let i = 0; i < keys.length - 1; i++) current = current[keys[i]];
                    current[keys[keys.length - 1]] = el.value;
                }, true); // isTyping = true (debounced history)
            });
        });

        // --- 5. Dynamic List Orchestration (Experience, Education, Projects) ---
        elements.btnAddItems?.forEach(btn => {
            btn.addEventListener('click', () => {
                const type = btn.getAttribute('data-type');
                if (!type) return;

                this.addItem(type);

                // Accessibility: auto-focus the primary field of the new entry
                requestAnimationFrame(() => {
                    const listKey    = `list${type.charAt(0).toUpperCase() + type.slice(1)}`;
                    const firstInput = elements[listKey]?.lastElementChild?.querySelector('input');
                    firstInput?.focus();
                });
            });
        });

        ['exp', 'proj', 'edu'].forEach(type => {
            const listEl = elements[`list${type.charAt(0).toUpperCase() + type.slice(1)}`];
            if (!listEl) return;

            // Delegation: handle typing within dynamic list fields
            listEl.addEventListener('input', (e) => {
                const field  = e.target.getAttribute('data-field');
                const itemEl = e.target.closest('.list-item');
                if (!field || !itemEl) return;

                const index = parseInt(itemEl.getAttribute('data-index'), 10);
                store.update(s => {
                    if (s[type] && s[type][index]) {
                        s[type][index][field] = e.target.value;
                    }
                }, true);
            });

            // Delegation: handle delete button clicks
            listEl.addEventListener('click', (e) => {
                const deleteBtn = e.target.closest('[data-action="delete"]');
                if (deleteBtn) {
                    const itemEl = deleteBtn.closest('.list-item');
                    if (itemEl) {
                        const index = parseInt(itemEl.getAttribute('data-index'), 10);
                        this.deleteItem(type, index);
                    }
                }
            });

            // Reorder trigger
            listEl.addEventListener('pointerdown', (e) => this.handleDragStart(e, type));
        });

        // --- 6. Global Drag & Drop Tracking ---
        // BUG FIX: pointermove marked passive — handleDragMove never calls
        // preventDefault, so the passive flag is correct and avoids blocking scroll.
        document.addEventListener('pointermove',   (e) => this.handleDragMove(e), { passive: true });
        document.addEventListener('pointerup',     (e) => this.handleDragEnd(e));
        document.addEventListener('pointercancel', (e) => this.handleDragEnd(e));

        // --- 7. Keyboard Shortcuts (Undo / Redo) ---
        document.addEventListener('keydown', (e) => {
            const isMod = e.ctrlKey || e.metaKey;
            if (!isMod) return;

            const key = e.key.toLowerCase();
            if (key === 'z') {
                e.preventDefault();
                const success = e.shiftKey ? store.redo() : store.undo();
                if (success) this.showToast(e.shiftKey ? 'Redo successful' : 'Undo successful');
            } else if (key === 'y') {
                e.preventDefault();
                if (store.redo()) this.showToast('Redo successful');
            }
        });

        // --- 8. Viewport & Geometry Synchronization ---
        if (elements.preview && window.ResizeObserver) {
            const previewObserver = new ResizeObserver(Utils.throttle(() => this.scalePreview(), 50));
            previewObserver.observe(elements.preview);
        }

        window.addEventListener('afterprint', () => this.scalePreview());
        window.addEventListener('resize', Utils.debounce(() => this.scalePreview(), 150));
    }
});

/**
 * Self-initializing entry point.
 * Ensures the DOM is fully parsed and interactive before bootstrapping the app.
 */
(() => {
    const bootstrap = () => {
        if (!window.resumeApp) {
            window.resumeApp = new ResumeApp();
        }
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', bootstrap);
    } else {
        bootstrap();
    }
})();
