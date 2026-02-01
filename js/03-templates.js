/**
 * =============================================================================
 * 3. TEMPLATES
 * =============================================================================
 */

const Templates = {
    /**
     * Generate skill pills HTML
     */
    skillPills(text) {
        if (!text) return '';
        return text.split(',')
            .map(s => s.trim())
            .filter(s => s)
            .map(s => `<span class="skill-pill">${Utils.escapeHtml(s)}</span>`)
            .join('');
    },

    /**
     * Generate editor list item
     */
    listItem(item, index, type) {
        const fields = {
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
        };

        const itemFields = fields[type];

        return `
            <div class="list-item" data-index="${index}" data-type="${type}">
                <div class="item-header">
                    <span class="item-number">#${index + 1}</span>
                    <div class="item-actions">
                        <button class="item-btn drag-handle" title="Drag to reorder">
                            <i class="fa-solid fa-grip-lines"></i>
                        </button>
                        <button class="item-btn delete" data-action="delete" title="Delete">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="item-fields">
                    ${itemFields.map(f => `
                        <input type="text" 
                               class="item-input" 
                               data-field="${f.key}" 
                               value="${Utils.escapeHtml(item[f.key] || '')}" 
                               placeholder="${f.placeholder}">
                    `).join('')}
                    <textarea class="item-textarea" 
                              data-field="description" 
                              placeholder="Description (use **text** for bold)"
                              rows="3">${item.description || ''}</textarea>
                </div>
            </div>
        `;
    },

    /**
     * Generate resume preview entry
     */
    previewEntry(item) {
        return `
            <div class="resume-entry">
                <div class="entry-header">
                    <span class="entry-title">${Utils.escapeHtml(item.title) || 'Untitled'}</span>
                    <span class="entry-date">${Utils.escapeHtml(item.date) || ''}</span>
                </div>
                ${item.subtitle ? `<div class="entry-subtitle">${Utils.escapeHtml(item.subtitle)}</div>` : ''}
                ${item.description ? `<div class="entry-description">${Utils.formatText(item.description)}</div>` : ''}
            </div>
        `;
    }
};

