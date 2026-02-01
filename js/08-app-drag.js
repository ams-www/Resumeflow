/**
 * =============================================================================
 * 8. APP DRAG AND DROP (Visual Follow)
 * =============================================================================
 */

Object.assign(ResumeApp.prototype, {
    handleDragStart(e, type) {
        const handle = e.target.closest('.drag-handle');
        if (!handle || e.button !== 0) return;

        const item = handle.closest('.list-item');
        if (!item) return;

        e.preventDefault();
        
        // Capture pointer to ensure we track movement even if mouse leaves window
        if (e.pointerId !== undefined && typeof handle.setPointerCapture === 'function') {
            try { handle.setPointerCapture(e.pointerId); } catch (_) {}
        }

        const list = item.parentElement;
        const startIndex = Array.from(list.children).indexOf(item);
        const rect = item.getBoundingClientRect();

        // Create placeholder
        const placeholder = document.createElement('div');
        placeholder.className = 'drag-placeholder';
        placeholder.style.height = `${rect.height}px`;

        // Insert placeholder FIRST
        list.insertBefore(placeholder, item);

        // Calculate offset to keep item under cursor relative to where clicked
        const offsetX = e.clientX - rect.left;
        const offsetY = e.clientY - rect.top;

        this.dragState = {
            type,
            item,
            list,
            startIndex,
            placeholder,
            handle,
            offsetX,
            offsetY
        };

        // Prepare item for visual dragging (fixed position)
        item.style.width = `${rect.width}px`;
        item.style.height = `${rect.height}px`; // Fix height to prevent collapse
        item.classList.add('dragging');
        
        // Initial position
        this.updateDragPosition(e.clientX, e.clientY);
    },

    handleDragMove(e) {
        if (!this.dragState) return;
        e.preventDefault();

        // 1. Move the floating item
        this.updateDragPosition(e.clientX, e.clientY);

        // 2. Calculate where the placeholder should go
        const { list, placeholder } = this.dragState;
        
        // We hide the dragged item's pointer events in CSS (.dragging { pointer-events: none })
        // so `document.elementFromPoint` sees the elements UNDERNEATH the dragged item.
        const elementBelow = document.elementFromPoint(e.clientX, e.clientY);
        if (!elementBelow) return;

        const targetItem = elementBelow.closest('.list-item');
        
        // Only rearrange if we are hovering over a different item in the same list
        if (targetItem && targetItem.parentElement === list && targetItem !== this.dragState.item) {
            const targetRect = targetItem.getBoundingClientRect();
            const midpoint = targetRect.top + targetRect.height / 2;
            
            if (e.clientY < midpoint) {
                list.insertBefore(placeholder, targetItem);
            } else {
                list.insertBefore(placeholder, targetItem.nextSibling);
            }
        }
    },

    updateDragPosition(x, y) {
        if(!this.dragState) return;
        const { item, offsetX, offsetY } = this.dragState;
        item.style.left = `${x - offsetX}px`;
        item.style.top = `${y - offsetY}px`;
    },

    handleDragEnd(e) {
        if (!this.dragState) return;

        const { type, item, list, placeholder, startIndex, handle } = this.dragState;

        // Cleanup styles
        item.classList.remove('dragging');
        item.style.width = '';
        item.style.height = '';
        item.style.left = '';
        item.style.top = '';
        item.style.position = '';

        // Move item to placeholder's final spot
        placeholder.replaceWith(item);

        // Calculate New Index based on DOM order
        const items = Array.from(list.children);
        const newIndex = items.indexOf(item);

        this.dragState = null;

        // Release pointer
        if (handle && e.pointerId !== undefined && typeof handle.releasePointerCapture === 'function') {
            try { handle.releasePointerCapture(e.pointerId); } catch (_) {}
        }

        // Update Store if Changed
        if (newIndex !== -1 && newIndex !== startIndex) {
            this.store.update(s => {
                const arr = s[type];
                if (arr && arr[startIndex]) {
                    const [movedItem] = arr.splice(startIndex, 1);
                    if (movedItem) {
                        arr.splice(newIndex, 0, movedItem);
                    }
                }
            });
        }
    }
});


