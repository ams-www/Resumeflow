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
        // Only permit primary pointer button (left-click/touch)
        // Guard against multiple concurrent drag operations
        if (e.button !== 0 || this.dragState) return;

        const handle = e.target.closest('.drag-handle');
        if (!handle) return;

        const item = handle.closest('.list-item');
        if (!item) return;

        // Prevent browser default behaviors (scrolling, text selection)
        e.preventDefault();

        const list = item.parentElement;
        const rect = item.getBoundingClientRect();
        const itemsArray = Array.from(list.children);
        const startIndex = itemsArray.indexOf(item);

        // Capture pointer to ensure tracking continues outside handle bounds
        try {
            handle.setPointerCapture(e.pointerId);
        } catch (captureError) {
            // Silently fail if pointerId is stale or browser environment restricts capture
        }

        // Create layout placeholder to preserve height and flow in the editor list
        const placeholder = document.createElement('div');
        placeholder.className = 'drag-placeholder';
        placeholder.style.height = `${rect.height}px`;

        // Cache item styles to prevent reflows during move
        const computedStyle = window.getComputedStyle(item);
        const margin = computedStyle.marginBottom;
        placeholder.style.marginBottom = margin;

        // Swap item with placeholder in DOM flow
        list.insertBefore(placeholder, item);

        // State orchestration
        this.dragState = {
            type,
            item,
            list,
            startIndex,
            placeholder,
            handle,
            // Calculate cursor offset relative to item top-left to avoid jumping
            offsetX: e.clientX - rect.left,
            offsetY: e.clientY - rect.top,
            rafId: null,
            currentX: e.clientX,
            currentY: e.clientY
        };

        // Prepare item for visual dragging (fixed position via CSS class)
        // Set dimensions explicitly to prevent collapse when removed from flow
        item.style.width = `${rect.width}px`;
        item.style.height = `${rect.height}px`;
        item.style.top = '0';
        item.style.left = '0';
        item.classList.add('dragging');

        // Start movement loop
        this._animateDrag();
    },

    /**
     * Internal animation loop for smooth hardware-accelerated movement.
     * @private
     */
    _animateDrag() {
        if (!this.dragState) return;

        const { item, currentX, currentY, offsetX, offsetY } = this.dragState;
        
        // Use 3D transform for compositor-thread optimization (no layout/paint cycles)
        const x = currentX - offsetX;
        const y = currentY - offsetY;
        item.style.transform = `translate3d(${x}px, ${y}px, 0)`;

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

        // Intersection testing: find reorder target under cursor
        // CSS .dragging has pointer-events: none, so we detect elements beneath
        const target = document.elementFromPoint(e.clientX, e.clientY);
        if (!target) return;

        const { list, placeholder, item: draggingItem } = this.dragState;
        const targetItem = target.closest('.list-item');

        // Only rearrange if we are hovering over a peer in the same list
        if (targetItem && targetItem.parentElement === list && targetItem !== draggingItem) {
            const targetRect = targetItem.getBoundingClientRect();
            const midpoint = targetRect.top + targetRect.height / 2;
            
            // Logic: if above midpoint, move placeholder before; if below, move after
            if (e.clientY < midpoint) {
                list.insertBefore(placeholder, targetItem);
            } else {
                list.insertBefore(placeholder, targetItem.nextSibling);
            }
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

        // Cleanup Pointer Capture
        try {
            handle.releasePointerCapture(e.pointerId);
        } catch (releaseError) {}

        // Reset visual overrides
        item.classList.remove('dragging');
        item.style.transform = '';
        item.style.width = '';
        item.style.height = '';
        item.style.top = '';
        item.style.left = '';

        // Commit item to its new position in the DOM
        placeholder.replaceWith(item);

        // Calculate final index based on resulting DOM order
        const newIndex = Array.from(list.children).indexOf(item);

        // Clear drag session state
        this.dragState = null;

        // Update persistence layer only if a move actually occurred
        if (newIndex !== -1 && newIndex !== startIndex) {
            this.store.update(s => {
                const arr = s[type];
                if (arr && arr[startIndex]) {
                    const [movedItem] = arr.splice(startIndex, 1);
                    arr.splice(newIndex, 0, movedItem);
                }
            });
            this.showToast('Section reordered');
        }
    }
});

