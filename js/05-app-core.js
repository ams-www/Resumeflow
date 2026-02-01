/**
 * =============================================================================
 * 5. MAIN APP CORE
 * =============================================================================
 */

class ResumeApp {
    constructor() {
        this.store = new Store();
        this.dragState = null;
        this.init();
    }

    init() {
        this.cacheElements();
        this.bindEvents();
        this.render();

        // Subscribe to state changes
        this.store.subscribe(() => this.render());

        // Initial preview scaling
        this.scalePreview();
    }

    cacheElements() {
        this.elements = {
            // Header controls
            btnImport: document.getElementById('btn-import'),
            btnExport: document.getElementById('btn-export'),
            btnTheme: document.getElementById('btn-theme'),
            btnPrint: document.getElementById('btn-print'),
            colorPicker: document.getElementById('color-picker'),
            colorDot: document.querySelector('.color-dot'),
            fileInput: document.getElementById('file-input'),
            viewBtns: document.querySelectorAll('.view-btn'),

            // Toggles & Inputs
            toggleExp: document.getElementById('toggle-exp'),
            toggleProj: document.getElementById('toggle-proj'),
            toggleEdu: document.getElementById('toggle-edu'),

            // Personal Inputs
            inName: document.getElementById('in-name'),
            inRole: document.getElementById('in-role'),
            inEmail: document.getElementById('in-email'),
            inPhone: document.getElementById('in-phone'),
            inLocation: document.getElementById('in-location'),
            inLinkedin: document.getElementById('in-linkedin'),
            inWebsite: document.getElementById('in-website'),
            inSummary: document.getElementById('in-summary'),

            // Skills & Additional Inputs
            inSkillsTech: document.getElementById('in-skills-tech'),
            inSkillsSoft: document.getElementById('in-skills-soft'),
            inLanguages: document.getElementById('in-languages'),
            inHobbies: document.getElementById('in-hobbies'),

            // Lists
            listExp: document.getElementById('list-exp'),
            listProj: document.getElementById('list-proj'),
            listEdu: document.getElementById('list-edu'),
            btnAddItems: document.querySelectorAll('.btn-add'),

            // Preview Outputs
            outName: document.getElementById('out-name'),
            outRole: document.getElementById('out-role'),
            outEmail: document.getElementById('out-email'),
            outPhone: document.getElementById('out-phone'),
            outLocation: document.getElementById('out-location'),
            outLinkedin: document.getElementById('out-linkedin'),
            outWebsite: document.getElementById('out-website'),
            outSummary: document.getElementById('out-summary'),
            outSkillsTech: document.getElementById('out-skills-tech'),
            outSkillsSoft: document.getElementById('out-skills-soft'),
            outLanguages: document.getElementById('out-languages'),
            outHobbies: document.getElementById('out-hobbies'),
            outExp: document.getElementById('out-exp'),
            outProj: document.getElementById('out-proj'),
            outEdu: document.getElementById('out-edu'),

            // Contact Wrappers & Sections
            wrapEmail: document.getElementById('wrap-email'),
            wrapPhone: document.getElementById('wrap-phone'),
            wrapLocation: document.getElementById('wrap-location'),
            wrapLinkedin: document.getElementById('wrap-linkedin'),
            wrapWebsite: document.getElementById('wrap-website'),
            sectionExp: document.getElementById('section-exp'),
            sectionProj: document.getElementById('section-proj'),
            sectionEdu: document.getElementById('section-edu'),

            // Containers
            preview: document.querySelector('.preview'),
            resumePaper: document.getElementById('resume-paper'),
            toast: document.getElementById('toast')
        };
    }
}

