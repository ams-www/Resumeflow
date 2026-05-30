'use strict';

/**
 * =============================================================================
 * 6. APP RENDERING LOGIC
 * =============================================================================
 * High-performance UI synchronization engine.
 * Implements granular DOM updates and focus-preservation logic to ensure
 * smooth interactions, especially on mobile devices and virtual keyboards.
 */

Object.assign(ResumeApp.prototype, {
    /**
     * Main render entry point.
     * Synchronizes the global state with the DOM using an optimized multi-pass approach.
     */
    render() {
        const state = this.store.state;
        if (!state) return;

        // 1. Core Styles & Design Tokens
        this._renderDesignTokens(state.settings);

        // 2. Global UI State (Theme & Section Visibility)
        this._renderGlobalUI(state);

        // 3. Form Inputs (Personal Identity & Textareas)
        this._renderEditorInputs(state);

        // 4. Resume Preview (Static Fields & Metadata)
        this._renderPreviewStatic(state);

        // 5. Dynamic Lists (Experience, Projects, Education)
        this._renderDynamicSections();
    },

    /**
     * Synchronizes CSS variables and theme attributes.
     * @private
     */
    _renderDesignTokens(settings) {
        const doc = document.documentElement;
        const { accentColor, theme } = settings;

        if (doc.getAttribute('data-theme') !== theme) {
            doc.setAttribute('data-theme', theme);
        }

        if (doc.style.getPropertyValue('--resume-accent') !== accentColor) {
            doc.style.setProperty('--resume-accent', accentColor);
        }

        const { colorPicker, colorDot, btnTheme } = this.elements;

        if (colorPicker && colorPicker.value !== accentColor) {
            colorPicker.value = accentColor;
        }

        if (colorDot) {
            colorDot.style.backgroundColor = accentColor;
        }

        if (btnTheme) {
            const themeIcon = btnTheme.querySelector('i');
            if (themeIcon) {
                const targetClass = theme === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
                if (themeIcon.className !== targetClass) {
                    themeIcon.className = targetClass;
                }
            }
        }
    },

    /**
     * Handles section visibility and checkbox states.
     * @private
     */
    _renderGlobalUI(state) {
        const sections = ['exp', 'proj', 'edu'];

        sections.forEach(type => {
            const visible = !!state.visibility[type];
            const key     = type.charAt(0).toUpperCase() + type.slice(1);

            const toggle  = this.elements[`toggle${key}`];
            const section = this.elements[`section${key}`];

            if (toggle && toggle.checked !== visible) {
                toggle.checked = visible;
            }

            if (section) {
                const displayStyle = visible ? 'block' : 'none';
                if (section.style.display !== displayStyle) {
                    section.style.display = displayStyle;
                }
            }
        });
    },

    /**
     * Updates form inputs without destroying focus or cursor position.
     * @private
     */
    _renderEditorInputs(state) {
        const { personal, summary, skills, additional } = state;

        const fields = [
            [this.elements.inName,       personal.name],
            [this.elements.inRole,       personal.role],
            [this.elements.inEmail,      personal.email],
            [this.elements.inPhone,      personal.phone],
            [this.elements.inLocation,   personal.location],
            [this.elements.inLinkedin,   personal.linkedin],
            [this.elements.inWebsite,    personal.website],
            [this.elements.inSummary,    summary],
            [this.elements.inSkillsTech, skills.tech],
            [this.elements.inSkillsSoft, skills.soft],
            [this.elements.inLanguages,  additional.languages],
            [this.elements.inHobbies,    additional.hobbies]
        ];

        for (const [el, val] of fields) {
            // Focus Guard: only update if the user isn't actively typing in this element
            if (el && el.value !== val && document.activeElement !== el) {
                el.value = val || '';
            }
        }
    },

    /**
     * Updates the preview panel with sanitized data.
     * @private
     */
    _renderPreviewStatic(state) {
        const { elements } = this;
        const { personal, summary, skills, additional } = state;

        if (elements.outName) elements.outName.textContent = personal.name || 'Your Name';
        if (elements.outRole) elements.outRole.textContent = personal.role || 'Your Professional Title';

        if (elements.outSummary) {
            const formatted = Utils.formatText(summary);
            if (elements.outSummary.innerHTML !== formatted) {
                elements.outSummary.innerHTML = formatted;
            }
        }

        // Skills & Metadata Pills
        const pillFields = [
            [elements.outSkillsTech, skills.tech],
            [elements.outSkillsSoft, skills.soft],
            [elements.outLanguages,  additional.languages],
            [elements.outHobbies,    additional.hobbies]
        ];

        pillFields.forEach(([el, val]) => {
            if (el) {
                const html = Templates.skillPills(val);
                if (el.innerHTML !== html) el.innerHTML = html;
            }
        });

        // Contact item visibility
        this.updateContactItem(elements.wrapEmail,    elements.outEmail,    personal.email);
        this.updateContactItem(elements.wrapPhone,    elements.outPhone,    personal.phone);
        this.updateContactItem(elements.wrapLocation, elements.outLocation, personal.location);
        this.updateContactItem(elements.wrapLinkedin, elements.outLinkedin, personal.linkedin);
        this.updateContactItem(elements.wrapWebsite,  elements.outWebsite,  personal.website);
    },

    /**
     * Helper to manage contact info visibility in the preview.
     */
    updateContactItem(wrapper, output, value) {
        if (!wrapper || !output) return;
        const displayStyle = value ? 'inline-flex' : 'none';

        if (wrapper.style.display !== displayStyle) {
            wrapper.style.display = displayStyle;
        }
        if (output.textContent !== value) {
            output.textContent = value || '';
        }
    },

    /**
     * Orchestrates rendering for all dynamic sections.
     * BUG FIX: removed unused `state` parameter.
     * @private
     */
    _renderDynamicSections() {
        this.renderList('exp');
        this.renderList('proj');
        this.renderList('edu');
    },

    /**
     * Renders a specific dynamic list for both the editor and preview panels.
     * Implements DOM-reconciliation logic to prevent losing focus and causing
     * mobile keyboard collapse.
     * @param {string} type - 'exp', 'proj', or 'edu'.
     */
    renderList(type) {
        const state   = this.store.state;
        const items   = state[type] || [];
        const typeKey = type.charAt(0).toUpperCase() + type.slice(1);

        const listEl = this.elements[`list${typeKey}`];
        const outEl  = this.elements[`out${typeKey}`];

        // 1. Update Preview (safe; doesn't affect focus)
        if (outEl) {
            const previewHtml = items.map(item => Templates.previewEntry(item)).join('');
            if (outEl.innerHTML !== previewHtml) {
                outEl.innerHTML = previewHtml;
            }
        }

        // 2. Update Editor (must be focus-aware)
        if (!listEl) return;

        const active          = document.activeElement;
        const isFocusedInList = listEl.contains(active);
        const itemCountChanged = listEl.children.length !== items.length;

        /**
         * Use innerHTML only if:
         * A) The item count changed (add / delete / drag-drop).
         * B) The user is not currently typing in this specific list.
         */
        if (!isFocusedInList || itemCountChanged) {
            const editorHtml = items.map((item, index) => Templates.listItem(item, index, type)).join('');
            if (listEl.innerHTML !== editorHtml) {
                listEl.innerHTML = editorHtml;
            }
        } else {
            /**
             * Reconciliation loop: the user IS typing, so we don't blow away the HTML.
             * Instead we update every field that is NOT currently focused.
             * BUG FIX: removed dead `currentIndex` variable that was declared but never used.
             */
            if (!active.closest('.list-item')) return;

            const inputs = listEl.querySelectorAll('.item-input, .item-textarea');
            inputs.forEach(input => {
                if (input === active) return; // Skip the focused field

                const itemEl  = input.closest('.list-item');
                const fieldKey = input.dataset.field;
                if (!itemEl || !fieldKey) return;

                // BUG FIX: parseInt without radix can misparse strings with leading
                // zeros in some environments — always supply radix 10.
                const itemIdx = parseInt(itemEl.dataset.index, 10);
                const val     = items[itemIdx] ? items[itemIdx][fieldKey] : '';

                if (input.value !== val) {
                    input.value = val || '';
                }
            });
        }
    }
});
