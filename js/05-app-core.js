'use strict';

/**
 * =============================================================================
 * 5. MAIN APP CORE
 * =============================================================================
 * The central orchestrator for the ResumeFlow application.
 * This class initializes the state store, manages DOM references, and
 * coordinates the lifecycle of the application.
 * * Note: Functional modules (rendering, handlers, I/O) are attached to this 
 * class prototype in subsequent files.
 */

class ResumeApp {
    /**
     * Initializes the application instance.
     */
    constructor() {
        /** @type {Store} Primary state management container */
        this.store = new Store();

        /** @type {Object|null} State tracker for active drag-and-drop operations */
        this.dragState = null;

        /** @type {Object} Cached DOM element references */
        this.elements = {};

        // Execute core initialization
        this._init();
    }

    /**
     * Internal lifecycle orchestrator.
     * @private
     */
    _init() {
        try {
            this.cacheElements();
            
            // Only proceed if core UI components are found
            if (!this.elements.resumePaper) {
                console.error('ResumeApp: Critical UI components missing from DOM.');
                return;
            }

            // Bind interactions (defined in 10-bootstrap.js)
            if (typeof this.bindEvents === 'function') {
                this.bindEvents();
            }

            // Initial UI sync
            this.render();

            // Establish reactive link: UI re-renders on state mutation
            this.store.subscribe(() => {
                requestAnimationFrame(() => this.render());
            });

            // Handle initial viewport geometry
            this._handleInitialLayout();
            
        } catch (error) {
            console.error('ResumeApp: Initialization failed:', error);
        }
    }

    /**
     * Ensures the preview is correctly scaled on first load.
     * @private
     */
    _handleInitialLayout() {
        // Delay scaling slightly to allow browser layout engine to settle
        window.addEventListener('load', () => {
            if (typeof this.scalePreview === 'function') {
                this.scalePreview();
            }
        }, { once: true });
    }

    /**
     * Performance Optimization: Traverses the DOM once and caches references.
     * Prevents expensive repetitive document.getElementById calls.
     */
    cacheElements() {
        /**
         * Utility to safely retrieve elements.
         * @param {string} id 
         * @returns {HTMLElement|null}
         */
        const get = (id) => document.getElementById(id);
        const query = (selector) => document.querySelector(selector);
        const all = (selector) => document.querySelectorAll(selector);

        this.elements = {
            // Header & Global Navigation
            btnImport:      get('btn-import'),
            btnExport:      get('btn-export'),
            btnTheme:       get('btn-theme'),
            btnPrint:       get('btn-print'),
            colorPicker:    get('color-picker'),
            colorDot:       query('.color-dot'),
            fileInput:      get('file-input'),
            viewBtns:       all('.view-btn'),

            // Section Visibility Toggles
            toggleExp:      get('toggle-exp'),
            toggleProj:     get('toggle-proj'),
            toggleEdu:      get('toggle-edu'),

            // Form Inputs: Identity
            inName:         get('in-name'),
            inRole:         get('in-role'),
            inEmail:        get('in-email'),
            inPhone:        get('in-phone'),
            inLocation:     get('in-location'),
            inLinkedin:     get('in-linkedin'),
            inWebsite:      get('in-website'),
            inSummary:      get('in-summary'),

            // Form Inputs: Skills & Metadata
            inSkillsTech:   get('in-skills-tech'),
            inSkillsSoft:   get('in-skills-soft'),
            inLanguages:    get('in-languages'),
            inHobbies:      get('in-hobbies'),

            // Dynamic Editor Lists
            listExp:        get('list-exp'),
            listProj:       get('list-proj'),
            listEdu:        get('list-edu'),
            btnAddItems:    all('.btn-add'),

            // Preview Panel Outputs
            outName:        get('out-name'),
            outRole:        get('out-role'),
            outEmail:       get('out-email'),
            outPhone:       get('out-phone'),
            outLocation:    get('out-location'),
            outLinkedin:    get('out-linkedin'),
            outWebsite:     get('out-website'),
            outSummary:     get('out-summary'),
            outSkillsTech:  get('out-skills-tech'),
            outSkillsSoft:  get('out-skills-soft'),
            outLanguages:   get('out-languages'),
            outHobbies:     get('out-hobbies'),
            outExp:         get('out-exp'),
            outProj:        get('out-proj'),
            outEdu:         get('out-edu'),

            // Layout Wrappers
            wrapEmail:      get('wrap-email'),
            wrapPhone:      get('wrap-phone'),
            wrapLocation:   get('wrap-location'),
            wrapLinkedin:   get('wrap-linkedin'),
            wrapWebsite:    get('wrap-website'),
            
            // Resume Paper Sections
            sectionExp:     get('section-exp'),
            sectionProj:    get('section-proj'),
            sectionEdu:     get('section-edu'),

            // System Containers
            preview:        query('.preview'),
            resumePaper:    get('resume-paper'),
            toast:          get('toast')
        };
    }
}

