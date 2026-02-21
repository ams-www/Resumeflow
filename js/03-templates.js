/**
 * =============================================================================
 * 3. TEMPLATES
 * =============================================================================
 * Optimized, memory-efficient string templates for the ResumeFlow application.
 * All user-generated content is sanitized via Utils.escapeHtml to prevent XSS.
 */

const Templates = (() => {
    'use strict';

    /**
     * Static configuration for list item fields to avoid re-allocation on every render.
     */
    const FIELD_CONFIGS = Object.freeze({
        exp: [
            { key: 'title', placeholder: 'Job Title' },
            { key: 'subtitle', placeholder: 'Company Name' },
            { key: 'date', placeholder: 'Date Range (e.g., 2020 - Present)' }
        ],
        proj: [
            { key: 'title', placeholder: 'Project Name' },
            { key: 'subtitle', placeholder: 'Your Role / Technologies' },
            { key: 'date', placeholder: 'Year' }
        ],
        edu: [
            { key: 'title', placeholder: 'Degree / Certification' },
            { key: 'subtitle', placeholder: 'Institution Name' },
            { key: 'date', placeholder: 'Year' }
        ]
    });

    return Object.freeze({
        /**
         * Transforms a comma-separated string into a sequence of safe HTML pill elements.
         * @param {string} text - Comma-separated list of skills.
         * @returns {string} Sanitized HTML string.
         */
        skillPills(text) {
            if (!text || typeof text !== 'string') return '';
            
            return text.split(',')
                .reduce((acc, current) => {
                    const trimmed = current.trim();
                    if (trimmed) {
                        acc.push(`<span class="skill-pill">${Utils.escapeHtml(trimmed)}</span>`);
                    }
                    return acc;
                }, [])
                .join('');
        },

        /**
         * Generates the editor UI for a dynamic list item (Experience, Education, etc.).
         * Optimized with pre-defined field configurations.
         * * @param {Object} item - The data object for the entry.
         * @param {number} index - The current index in the array.
         * @param {string} type - The section type ('exp', 'proj', or 'edu').
         * @returns {string} Sanitized HTML string for the editor card.
         */
        listItem(item, index, type) {
            const itemFields = FIELD_CONFIGS[type] || [];
            
            // Generate input fields HTML
            const inputsHtml = itemFields.map(f => `
                <input type="text" 
                       class="item-input" 
                       data-field="${f.key}" 
                       value="${Utils.escapeHtml(item[f.key] || '')}" 
                       placeholder="${f.placeholder}"
                       spellcheck="false"
                       autocomplete="off">
            `).join('');

            return `
                <div class="list-item" data-index="${index}" data-type="${type}">
                    <div class="item-header">
                        <span class="item-number">#${index + 1}</span>
                        <div class="item-actions">
                            <button class="item-btn drag-handle" 
                                    title="Drag to reorder" 
                                    type="button"
                                    aria-label="Reorder item">
                                <i class="fa-solid fa-grip-lines"></i>
                            </button>
                            <button class="item-btn delete" 
                                    data-action="delete" 
                                    title="Delete" 
                                    type="button"
                                    aria-label="Delete item">
                                <i class="fa-solid fa-trash"></i>
                            </button>
                        </div>
                    </div>
                    <div class="item-fields">
                        ${inputsHtml}
                        <textarea class="item-textarea" 
                                  data-field="description" 
                                  placeholder="Description (use **text** for bold)"
                                  rows="3"
                                  spellcheck="true">${Utils.escapeHtml(item.description || '')}</textarea>
                    </div>
                </div>
            `;
        },

        /**
         * Generates the professional resume preview entry for the A4 paper view.
         * @param {Object} item - The data object for the entry.
         * @returns {string} Sanitized and formatted HTML string for the resume preview.
         */
        previewEntry(item) {
            const title = Utils.escapeHtml(item.title) || 'Untitled';
            const date = Utils.escapeHtml(item.date) || '';
            const subtitle = item.subtitle ? `<div class="entry-subtitle">${Utils.escapeHtml(item.subtitle)}</div>` : '';
            const description = item.description ? `<div class="entry-description">${Utils.formatText(item.description)}</div>` : '';

            return `
                <div class="resume-entry">
                    <div class="entry-header">
                        <span class="entry-title">${title}</span>
                        <span class="entry-date">${date}</span>
                    </div>
                    ${subtitle}
                    ${description}
                </div>
            `;
        }
    });
})();

