/**
 * =============================================================================
 * 10. BOOTSTRAP & EVENTS
 * =============================================================================
 */

Object.assign(ResumeApp.prototype, {
    bindEvents() {
        // Header controls
        if (this.elements.btnImport) this.elements.btnImport.addEventListener('click', () => this.elements.fileInput.click());
        if (this.elements.fileInput) this.elements.fileInput.addEventListener('change', (e) => this.handleImport(e));
        if (this.elements.btnExport) this.elements.btnExport.addEventListener('click', () => this.handleExport());
        if (this.elements.btnTheme) this.elements.btnTheme.addEventListener('click', () => this.toggleTheme());
        if (this.elements.btnPrint) this.elements.btnPrint.addEventListener('click', () => window.print());
        if (this.elements.colorPicker) this.elements.colorPicker.addEventListener('input', (e) => this.handleColorChange(e));

        // View switching
        this.elements.viewBtns.forEach(btn => {
            btn.addEventListener('click', () => this.switchView(btn.dataset.view));
        });

        // Toggles
        if (this.elements.toggleExp) this.elements.toggleExp.addEventListener('change', () => this.toggleVisibility('exp'));
        if (this.elements.toggleProj) this.elements.toggleProj.addEventListener('change', () => this.toggleVisibility('proj'));
        if (this.elements.toggleEdu) this.elements.toggleEdu.addEventListener('change', () => this.toggleVisibility('edu'));

        // Personal Inputs
        const bindInput = (el, key) => {
            if (el) el.addEventListener('input', () => this.store.update(s => s.personal[key] = el.value));
        };
        bindInput(this.elements.inName, 'name');
        bindInput(this.elements.inRole, 'role');
        bindInput(this.elements.inEmail, 'email');
        bindInput(this.elements.inPhone, 'phone');
        bindInput(this.elements.inLocation, 'location');
        bindInput(this.elements.inLinkedin, 'linkedin');
        bindInput(this.elements.inWebsite, 'website');

        if (this.elements.inSummary) this.elements.inSummary.addEventListener('input', () => this.store.update(s => s.summary = this.elements.inSummary.value));
        
        // Skills
        if (this.elements.inSkillsTech) this.elements.inSkillsTech.addEventListener('input', () => this.store.update(s => s.skills.tech = this.elements.inSkillsTech.value));
        if (this.elements.inSkillsSoft) this.elements.inSkillsSoft.addEventListener('input', () => this.store.update(s => s.skills.soft = this.elements.inSkillsSoft.value));
        if (this.elements.inLanguages) this.elements.inLanguages.addEventListener('input', () => this.store.update(s => s.additional.languages = this.elements.inLanguages.value));
        if (this.elements.inHobbies) this.elements.inHobbies.addEventListener('input', () => this.store.update(s => s.additional.hobbies = this.elements.inHobbies.value));

        // Add Buttons
        this.elements.btnAddItems.forEach(btn => {
            btn.addEventListener('click', () => this.addItem(btn.dataset.type));
        });

        // Lists (Delegation)
        ['exp', 'proj', 'edu'].forEach(type => {
            const listKey = `list${type.charAt(0).toUpperCase() + type.slice(1)}`;
            const list = this.elements[listKey];
            if (!list) return;

            list.addEventListener('input', (e) => {
                const item = e.target.closest('.list-item');
                if (item && e.target.dataset.field) {
                    const index = parseInt(item.dataset.index);
                    const field = e.target.dataset.field;
                    this.store.update(s => {
                        if (s[type][index]) s[type][index][field] = e.target.value;
                    });
                }
            });

            list.addEventListener('click', (e) => {
                if (e.target.closest('[data-action="delete"]')) {
                    const item = e.target.closest('.list-item');
                    if (item) this.deleteItem(type, parseInt(item.dataset.index));
                }
            });

            list.addEventListener('pointerdown', (e) => this.handleDragStart(e, type));
        });

        // Global Drag
        document.addEventListener('pointermove', (e) => this.handleDragMove(e));
        document.addEventListener('pointerup', (e) => this.handleDragEnd(e));
        document.addEventListener('pointercancel', (e) => this.handleDragEnd(e));

        // Keyboard Shortcuts
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
                e.preventDefault();
                if (this.store.undo()) this.showToast('Undo');
            }
            if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
                e.preventDefault();
                if (this.store.redo()) this.showToast('Redo');
            }
        });

        // Resize Observer
        if (this.elements.preview) {
            new ResizeObserver(() => this.scalePreview()).observe(this.elements.preview);
        }
        window.addEventListener('afterprint', () => this.scalePreview());
    }
});

document.addEventListener('DOMContentLoaded', () => {
    window.resumeApp = new ResumeApp();
});

