/**
 * =============================================================================
 * 9. APP I/O (Import, Export, Print, Toast)
 * =============================================================================
 */

Object.assign(ResumeApp.prototype, {
    handleImport(e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target.result);
                this.store.importState(data);
                this.showToast('Resume imported successfully');
            } catch (err) {
                this.showToast('Invalid file format');
            }
        };
        reader.readAsText(file);
        e.target.value = ''; // Reset for same file
    },

    handleExport() {
        const json = this.store.exportState();
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = 'resume.json';
        a.click();

        URL.revokeObjectURL(url);
        this.showToast('Resume exported');
    },

    scalePreview() {
        const container = this.elements.preview;
        const paper = this.elements.resumePaper;

        if (!container || !paper || container.offsetWidth === 0) return;

        // Account for padding (2rem * 2 = 64px) + safe margin
        const containerWidth = container.clientWidth - 80;
        const scale = Math.min(1, Math.max(0.4, containerWidth / CONFIG.A4_WIDTH_PX));

        paper.style.transform = `scale(${scale})`;

        // Adjust margin to account for scaling
        const paperHeight = 1123; // A4 height in pixels
        const marginOffset = scale < 1 ? (paperHeight * (1 - scale)) : 0;
        paper.style.marginBottom = `-${marginOffset}px`;
    },

    showToast(message) {
        const toast = this.elements.toast;
        if (!toast) return;
        toast.textContent = message;
        toast.classList.add('show');

        setTimeout(() => {
            toast.classList.remove('show');
        }, 2000);
    }
});

