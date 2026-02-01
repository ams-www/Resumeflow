/**
 * =============================================================================
 * 4. STATE MANAGEMENT
 * =============================================================================
 */

class Store {
    constructor() {
        this.state = this.loadState();
        this.history = [Utils.clone(this.state)];
        this.historyIndex = 0;
        this.listeners = new Set();
        this.saveTimeout = null;

        // Apply saved theme immediately
        if(document.documentElement) {
            document.documentElement.setAttribute('data-theme', this.state.settings.theme);
            document.documentElement.style.setProperty('--resume-accent', this.state.settings.accentColor);
        }
    }

    getDefaultState() {
        return {
            settings: { theme: 'light', accentColor: '#6366f1' },
            visibility: { exp: true, proj: true, edu: true },
            personal: { name: '', role: '', email: '', phone: '', location: '', linkedin: '', website: '' },
            summary: '',
            skills: { tech: '', soft: '' },
            additional: { languages: '', hobbies: '' },
            exp: [], proj: [], edu: []
        };
    }

    loadState() {
        try {
            const saved = localStorage.getItem(CONFIG.STORAGE_KEY);
            if (saved) return this.mergeWithDefaults(JSON.parse(saved));
        } catch (e) { console.warn('Failed to load saved state:', e); }
        return this.getDefaultState();
    }

    mergeWithDefaults(saved) {
        const defaults = this.getDefaultState();
        return {
            settings: { ...defaults.settings, ...saved.settings },
            visibility: { ...defaults.visibility, ...saved.visibility },
            personal: { ...defaults.personal, ...saved.personal },
            summary: saved.summary || defaults.summary,
            skills: { ...defaults.skills, ...saved.skills },
            additional: { ...defaults.additional, ...saved.additional },
            exp: Array.isArray(saved.exp) ? saved.exp : [],
            proj: Array.isArray(saved.proj) ? saved.proj : [],
            edu: Array.isArray(saved.edu) ? saved.edu : []
        };
    }

    saveState() {
        clearTimeout(this.saveTimeout);
        this.saveTimeout = setTimeout(() => {
            try {
                localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(this.state));
            } catch (e) { console.warn('Failed to save state:', e); }
        }, CONFIG.SAVE_DELAY);
    }

    update(updater) {
        updater(this.state);
        this.pushHistory();
        this.saveState();
        this.notify();
    }

    pushHistory() {
        if (this.historyIndex < this.history.length - 1) {
            this.history = this.history.slice(0, this.historyIndex + 1);
        }
        this.history.push(Utils.clone(this.state));
        if (this.history.length > CONFIG.MAX_HISTORY) {
            this.history.shift();
        } else {
            this.historyIndex++;
        }
    }

    undo() {
        if (this.historyIndex > 0) {
            this.historyIndex--;
            this.state = Utils.clone(this.history[this.historyIndex]);
            this.saveState();
            this.notify();
            return true;
        }
        return false;
    }

    redo() {
        if (this.historyIndex < this.history.length - 1) {
            this.historyIndex++;
            this.state = Utils.clone(this.history[this.historyIndex]);
            this.saveState();
            this.notify();
            return true;
        }
        return false;
    }

    subscribe(listener) {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }

    notify() {
        this.listeners.forEach(listener => listener(this.state));
    }

    importState(data) {
        this.state = this.mergeWithDefaults(data);
        this.pushHistory();
        this.saveState();
        this.notify();
    }

    exportState() {
        return JSON.stringify(this.state, null, 2);
    }
}

