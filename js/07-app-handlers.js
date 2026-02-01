/**
 * =============================================================================
 * 7. APP HANDLERS (Add/Delete/Toggle)
 * =============================================================================
 */

Object.assign(ResumeApp.prototype, {
    addItem(type) {
        this.store.update(s => {
            s[type].push({
                id: Utils.uid(),
                title: '',
                subtitle: '',
                date: '',
                description: ''
            });
        });
        this.showToast('Item added');
    },

    deleteItem(type, index) {
        if (confirm('Delete this item?')) {
            this.store.update(s => {
                s[type].splice(index, 1);
            });
            this.showToast('Item deleted');
        }
    },

    toggleVisibility(type) {
        this.store.update(s => {
            s.visibility[type] = !s.visibility[type];
        });
    },

    toggleTheme() {
        this.store.update(s => {
            s.settings.theme = s.settings.theme === 'light' ? 'dark' : 'light';
        });
        this.showToast(this.store.state.settings.theme === 'dark' ? 'Dark mode' : 'Light mode');
    },

    handleColorChange(e) {
        this.store.update(s => {
            s.settings.accentColor = e.target.value;
        });
    },

    switchView(mode) {
        document.body.className = `mode-${mode}`;
        this.elements.viewBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === mode);
            btn.setAttribute('aria-selected', btn.dataset.view === mode);
        });
    }
});

