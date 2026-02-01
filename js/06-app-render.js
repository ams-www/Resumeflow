/**
 * =============================================================================
 * 6. APP RENDERING LOGIC
 * =============================================================================
 */

Object.assign(ResumeApp.prototype, {
    render() {
        const state = this.store.state;

        // Settings
        if (this.elements.colorPicker) this.elements.colorPicker.value = state.settings.accentColor;
        if (this.elements.colorDot) this.elements.colorDot.style.background = state.settings.accentColor;
        document.documentElement.style.setProperty('--resume-accent', state.settings.accentColor);
        document.documentElement.setAttribute('data-theme', state.settings.theme);

        // Theme Icon
        if (this.elements.btnTheme) {
            const themeIcon = this.elements.btnTheme.querySelector('i');
            if (themeIcon) themeIcon.className = state.settings.theme === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
        }

        // Toggles
        if (this.elements.toggleExp) this.elements.toggleExp.checked = state.visibility.exp;
        if (this.elements.toggleProj) this.elements.toggleProj.checked = state.visibility.proj;
        if (this.elements.toggleEdu) this.elements.toggleEdu.checked = state.visibility.edu;

        if (this.elements.sectionExp) this.elements.sectionExp.style.display = state.visibility.exp ? 'block' : 'none';
        if (this.elements.sectionProj) this.elements.sectionProj.style.display = state.visibility.proj ? 'block' : 'none';
        if (this.elements.sectionEdu) this.elements.sectionEdu.style.display = state.visibility.edu ? 'block' : 'none';

        // Personal Info
        const setText = (el, val) => { if (el) el.value = val; };
        setText(this.elements.inName, state.personal.name);
        setText(this.elements.inRole, state.personal.role);
        setText(this.elements.inEmail, state.personal.email);
        setText(this.elements.inPhone, state.personal.phone);
        setText(this.elements.inLocation, state.personal.location);
        setText(this.elements.inLinkedin, state.personal.linkedin);
        setText(this.elements.inWebsite, state.personal.website);
        setText(this.elements.inSummary, state.summary);
        setText(this.elements.inSkillsTech, state.skills.tech);
        setText(this.elements.inSkillsSoft, state.skills.soft);
        setText(this.elements.inLanguages, state.additional.languages);
        setText(this.elements.inHobbies, state.additional.hobbies);

        // Output Text
        if (this.elements.outName) this.elements.outName.textContent = state.personal.name || 'Your Name';
        if (this.elements.outRole) this.elements.outRole.textContent = state.personal.role || 'Your Professional Title';
        if (this.elements.outSummary) this.elements.outSummary.innerHTML = Utils.formatText(state.summary);
        
        // Output Skills
        if (this.elements.outSkillsTech) this.elements.outSkillsTech.innerHTML = Templates.skillPills(state.skills.tech);
        if (this.elements.outSkillsSoft) this.elements.outSkillsSoft.innerHTML = Templates.skillPills(state.skills.soft);
        if (this.elements.outLanguages) this.elements.outLanguages.innerHTML = Templates.skillPills(state.additional.languages);
        if (this.elements.outHobbies) this.elements.outHobbies.innerHTML = Templates.skillPills(state.additional.hobbies);

        // Contact Wrappers
        this.updateContactItem(this.elements.wrapEmail, this.elements.outEmail, state.personal.email);
        this.updateContactItem(this.elements.wrapPhone, this.elements.outPhone, state.personal.phone);
        this.updateContactItem(this.elements.wrapLocation, this.elements.outLocation, state.personal.location);
        this.updateContactItem(this.elements.wrapLinkedin, this.elements.outLinkedin, state.personal.linkedin);
        this.updateContactItem(this.elements.wrapWebsite, this.elements.outWebsite, state.personal.website);

        // Dynamic Lists
        this.renderList('exp');
        this.renderList('proj');
        this.renderList('edu');
    },

    updateContactItem(wrapper, output, value) {
        if (!wrapper || !output) return;
        wrapper.style.display = value ? 'inline-flex' : 'none';
        output.textContent = value;
    },

    renderList(type) {
        const state = this.store.state;
        const items = state[type];
        const listEl = this.elements[`list${type.charAt(0).toUpperCase() + type.slice(1)}`];
        const outEl = this.elements[`out${type.charAt(0).toUpperCase() + type.slice(1)}`];

        if (listEl) {
            listEl.innerHTML = items.map((item, index) => Templates.listItem(item, index, type)).join('');
        }
        if (outEl) {
            outEl.innerHTML = items.map(item => Templates.previewEntry(item)).join('');
        }
    }
});

