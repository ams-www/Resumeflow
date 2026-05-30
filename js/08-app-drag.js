'use strict';

/**
 * =============================================================================
 * 8. APP DRAG AND DROP (Visual Follow)
 * =============================================================================
 * High-performance, pointer-event based reordering logic.
 * Optimized for mobile touch-concurrency and desktop precision.
 * Uses hardware-accelerated transforms and requestAnimationFrame for 60fps movement.
 */

Object.assign(ResumeApp.prototype, {
    /**
     * Initializes the drag sequence.
     * @param {PointerEvent} e
     * @param {string} type - The section type identifier ('exp', 'proj', 'edu').
     */
    handleDragStart(e, type) {
        // Only permit primary pointer (left-click / touch); guard concurrent drags
        if (e.button !== 0 || this.dragState) return;

        const handle = e.target.closest('.drag-handle');
        if (!handle) return;

        const item = handle.closest('.list-item');
        if (!item) return;

        // Prevent browser defaults (scrolling, text selection)
        e.preventDefault();

        const list        = item.parentElement;
        const rect        = item.getBoundingClientRect();
        const itemsArray  = Array.from(list.children);
        const startIndex  = itemsArray.indexOf(item);

        // Capture pointer to ensure tracking continues outside handle bounds
        try {
            handle.setPointerCapture(e.pointerId);
        } catch (_) {
            // Silently fail if pointerId is stale or browser restricts capture
        }

        // Create a layout placeholder to preserve height and flow in the editor list
        const placeholder = document.createElement('div');
        placeholder.className   = 'drag-placeholder';
        placeholder.style.height = `${rect.height}px`;
        placeholder.style.marginBottom = window.getComputedStyle(item).marginBottom;

        // Swap item with placeholder in DOM flow
        list.insertBefore(placeholder, item);

        this.dragState = {
            type,
            item,
            list,
            startIndex,
            placeholder,
            handle,
            // Cursor offset relative to item top-left prevents visual jumping
            offsetX:  e.clientX - rect.left,
            offsetY:  e.clientY - rect.top,
            rafId:    null,
            currentX: e.clientX,
            currentY: e.clientY
        };

        // Prepare item for visual dragging (fixed position via CSS .dragging class)
        item.style.width  = `${rect.width}px`;
        item.style.height = `${rect.height}px`;
        item.style.top    = '0';
        item.style.left   = '0';
        item.classList.add('dragging');

        // Start the movement loop
        this._animateDrag();
    },

    /**
     * Internal animation loop for smooth hardware-accelerated movement.
     * @private
     */
    _animateDrag() {
        if (!this.dragState) return;

        const { item, currentX, currentY, offsetX, offsetY } = this.dragState;

        // translate3d keeps the operation on the compositor thread (no layout/paint cycles)
        item.style.transform = `translate3d(${currentX - offsetX}px, ${currentY - offsetY}px, 0)`;

        this.dragState.rafId = requestAnimationFrame(() => this._animateDrag());
    },

    /**
     * Handles movement and performs intersection testing for live reordering.
     * @param {PointerEvent} e
     */
    handleDragMove(e) {
        if (!this.dragState) return;

        // Update tracking coordinates for the animation loop
        this.dragState.currentX = e.clientX;
        this.dragState.currentY = e.clientY;

        // CSS .dragging has pointer-events:none so elementFromPoint detects elements beneath
        const target = document.elementFromPoint(e.clientX, e.clientY);
        if (!target) return;

        const { list, placeholder, item: draggingItem } = this.dragState;
        const targetItem = target.closest('.list-item');

        // Only rearrange when hovering over a peer in the same list
        if (targetItem && targetItem.parentElement === list && targetItem !== draggingItem) {
            const midpoint = targetItem.getBoundingClientRect().top + targetItem.getBoundingClientRect().height / 2;
            list.insertBefore(placeholder, e.clientY < midpoint ? targetItem : targetItem.nextSibling);
        }
    },

    /**
     * Finalizes the reorder operation and synchronizes with the Store.
     * @param {PointerEvent} e
     */
    handleDragEnd(e) {
        if (!this.dragState) return;

        const { type, item, list, placeholder, startIndex, handle, rafId } = this.dragState;

        // Terminate animation loop
        if (rafId) cancelAnimationFrame(rafId);

        // Release pointer capture
        try {
            handle.releasePointerCapture(e.pointerId);
        } catch (_) {
            // Pointer may already be released (e.g. on pointercancel)
        }

        // Reset visual overrides applied in handleDragStart
        item.classList.remove('dragging');
        item.style.transform = '';
        item.style.width     = '';
        item.style.height    = '';
        item.style.top       = '';
        item.style.left      = '';

        // Commit item to its new DOM position
        placeholder.replaceWith(item);

        const newIndex = Array.from(list.children).indexOf(item);

        // Clear drag session before any async work
        this.dragState = null;

        // Update the persistence layer only if a real move occurred
        if (newIndex !== -1 && newIndex !== startIndex) {
            this.store.update(s => {
                const arr = s[type];
                if (arr && arr[startIndex] !== undefined) {
                    const [movedItem] = arr.splice(startIndex, 1);
                    arr.splice(newIndex, 0, movedItem);
                }
            });
            this.showToast('Section reordered');
        }
    }
});
