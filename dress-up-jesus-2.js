document.addEventListener('DOMContentLoaded', function() {
    const dresserLeft = document.getElementById('dresserLeft');
    const dresserRight = document.getElementById('dresserRight');
    const clothingArea = document.getElementById('clothingArea');
    const jesusBody = document.querySelector('.jesus-body');
    const jesusHands = document.querySelector('.jesus-hands');
    
    // Z-index layers
    const BELOW_HANDS_Z = 400;
    const HANDS_Z = 500;
    const ABOVE_HANDS_Z = 600;

    // Set hands z-index via JS to keep it as the divider
    if (jesusHands) {
        jesusHands.style.zIndex = HANDS_Z;
        jesusHands.style.position = 'relative';
    }

    let currentStyle = 'gorp-core';
    let highestZIndexBelow = BELOW_HANDS_Z;
    let highestZIndexAbove = ABOVE_HANDS_Z;
    let draggedItem = null;
    let offsetX = 0;
    let offsetY = 0;
    let sourceContainer = null;
    
    // Clothing type sizes (in pixels)
    const clothingSizes = {
        'short_jacket': 120,
        'long_jacket': 160,
        'shirt': 100,
        'pants': 140,
        'vest': 110,
        'boots': 80,
        'shoes': 70
    };
    
    // Clothing catalog
    const clothingCatalog = {
        'gorp-core': [
            { file: 'jacket6.png', type: 'short_jacket', aboveHands: false },
            { file: 'jacket 7.png', type: 'long_jacket', aboveHands: false },
            { file: 'blue jacket.png', type: 'long_jacket', aboveHands: false },
            { file: 'blue jacket 2.png', type: 'long_jacket', aboveHands: false },
            { file: 'blue and green jacket.png', type: 'long_jacket', aboveHands: false },
            { file: 'pale jacket.png', type: 'long_jacket', aboveHands: false },
            { file: 'puffer vest.png', type: 'vest', aboveHands: false },
            { file: 'hunting vest.png', type: 'vest', aboveHands: false },
            { file: 'pale pants.png', type: 'pants', aboveHands: false },
            { file: 'pale pants 2.png', type: 'pants', aboveHands: false },
            { file: 'tactical pants.png', type: 'pants', aboveHands: false },
            { file: 'salomon1.png', type: 'shoes', aboveHands: false },
            { file: 'salomon2.png', type: 'shoes', aboveHands: false },
            { file: 'salomon3.png', type: 'shoes', aboveHands: false }
        ],
        'e-girl': [
            { file: 'e-girl shirt 1.png', type: 'shirt', aboveHands: false },
            { file: 'e-girl shirt 2.png', type: 'shirt', aboveHands: false },
            { file: 'e-girl shirt 3.png', type: 'shirt', aboveHands: false },
            { file: 'e-girl shirt 4.png', type: 'shirt', aboveHands: false },
            { file: 'e-girl sweatshirt 1.png', type: 'long_jacket', aboveHands: false },
            { file: 'e-girl pants 2.png', type: 'pants', aboveHands: false },
            { file: 'e-girl pants 3.png', type: 'pants', aboveHands: false },
            { file: 'e-girl pants 4.png', type: 'pants', aboveHands: false },
            { file: 'e-girl pants 5.png', type: 'pants', aboveHands: false },
            { file: 'e-girl boots 1.png', type: 'boots', aboveHands: false },
            { file: 'e-girl shoes 1.png', type: 'shoes', aboveHands: false },
            { file: 'e-girl shoes 2.png', type: 'shoes', aboveHands: false }
        ],
        'polish': [
            { file: 'polish shirt 1.png', type: 'shirt', aboveHands: false },
            { file: 'polish shirt 2.png', type: 'shirt', aboveHands: false },
            { file: 'polish dress 1.png', type: 'long_jacket', aboveHands: true },
            { file: 'polish dress 2.png', type: 'long_jacket', aboveHands: true },
            { file: 'polish dress 3.png', type: 'long_jacket', aboveHands: true },
            { file: 'polish dress 4.png', type: 'long_jacket', aboveHands: true },
            { file: 'polish dress 5.png', type: 'long_jacket', aboveHands: true }
        ]
    };
    
    // Style switching
    const styleButtons = document.querySelectorAll('.style-btn');
    styleButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            styleButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentStyle = this.dataset.style;
            clearClothing();
            loadClothing(currentStyle);
        });
    });
    
    function clearClothing() {
        dresserLeft.innerHTML = '';
        dresserRight.innerHTML = '';
        clothingArea.innerHTML = '';
    }
    
    function loadClothing(style) {
        const items = clothingCatalog[style] || [];
        
        items.forEach((item, index) => {
            const thumbnail = document.createElement('img');
            thumbnail.src = `dress-up-assets/${item.file}`;
            thumbnail.className = 'clothing-thumbnail';
            thumbnail.dataset.file = item.file;
            thumbnail.dataset.type = item.type;
            thumbnail.dataset.scale = '1';
            thumbnail.dataset.inDresser = 'true';
            thumbnail.dataset.aboveHands = item.aboveHands;
            
            const targetHeight = clothingSizes[item.type];
            thumbnail.style.height = targetHeight + 'px';
            thumbnail.style.width = 'auto';
            
            if (index % 2 === 0) {
                dresserLeft.appendChild(thumbnail);
            } else {
                dresserRight.appendChild(thumbnail);
            }
            
            thumbnail.addEventListener('mousedown', handleItemClick);
            thumbnail.addEventListener('touchstart', startDragItem);
        });
    }
    
    function handleItemClick(e) {
        if (e.shiftKey) {
            e.preventDefault();
            enlargeItem(e.target);
        } else if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            shrinkItem(e.target);
        } else {
            startDragItem(e);
        }
    }

    // --- Pinch to zoom ---
    function getDistance(touch1, touch2) {
        const dx = touch1.clientX - touch2.clientX;
        const dy = touch1.clientY - touch2.clientY;
        return Math.sqrt(dx * dx + dy * dy);
    }

    function addPinchToZoom(item) {
        let initialDistance = null;
        let initialHeight = null;

        item.addEventListener('touchstart', (e) => {
            if (e.touches.length === 2) {
                e.preventDefault();
                e.stopPropagation();
                // Cancel any active drag when pinch starts
                if (draggedItem) {
                    draggedItem.classList.remove('dragging');
                    draggedItem = null;
                    document.removeEventListener('touchmove', dragItem);
                    document.removeEventListener('touchend', stopDragItem);
                }
                initialDistance = getDistance(e.touches[0], e.touches[1]);
                initialHeight = parseFloat(item.style.height);
            }
        }, { passive: false });

        item.addEventListener('touchmove', (e) => {
            if (e.touches.length === 2 && initialDistance !== null) {
                e.preventDefault();
                e.stopPropagation();
                const currentDistance = getDistance(e.touches[0], e.touches[1]);
                const scale = currentDistance / initialDistance;
                const baseHeight = clothingSizes[item.dataset.type];
                const newHeight = Math.max(baseHeight * 0.5, Math.min(baseHeight * 3, initialHeight * scale));
                item.style.height = newHeight + 'px';
                item.dataset.scale = newHeight / baseHeight;
            }
        }, { passive: false });

        item.addEventListener('touchend', (e) => {
            if (e.touches.length < 2) {
                initialDistance = null;
                initialHeight = null;
            }
        });
    }
    
    function startDragItem(e) {
        // Don't start a drag if this is a two-finger touch (pinch)
        if (e.touches && e.touches.length === 2) return;

        e.preventDefault();
        e.stopPropagation();
        
        draggedItem = e.target;
        const inDresser = draggedItem.dataset.inDresser === 'true';
        const aboveHands = draggedItem.dataset.aboveHands === 'true';
        
        sourceContainer = draggedItem.parentElement;
        
        const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
        const clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
        
        const itemRect = draggedItem.getBoundingClientRect();
        const areaRect = clothingArea.getBoundingClientRect();
        
        if (inDresser) {
            draggedItem.dataset.inDresser = 'false';
            draggedItem.classList.remove('clothing-thumbnail');
            draggedItem.classList.add('clothing-item');
            
            const x = itemRect.left - areaRect.left;
            const y = itemRect.top - areaRect.top;
            
            draggedItem.style.position = 'absolute';
            draggedItem.style.left = x + 'px';
            draggedItem.style.top = y + 'px';
            draggedItem.style.transform = 'none';
            
            clothingArea.appendChild(draggedItem);

            // Add pinch to zoom now that it's in the clothing area
            addPinchToZoom(draggedItem);
        }
        
        // Assign z-index based on aboveHands, keeping items stacked within their layer
        if (aboveHands) {
            draggedItem.style.zIndex = ++highestZIndexAbove;
        } else {
            draggedItem.style.zIndex = ++highestZIndexBelow;
        }
        
        offsetX = clientX - itemRect.left;
        offsetY = clientY - itemRect.top;
        
        draggedItem.classList.add('dragging');
        
        document.addEventListener('mousemove', dragItem);
        document.addEventListener('mouseup', stopDragItem);
        document.addEventListener('touchmove', dragItem);
        document.addEventListener('touchend', stopDragItem);
    }
    
    function dragItem(e) {
        if (!draggedItem) return;
        // Don't drag if two fingers are on screen (pinching)
        if (e.touches && e.touches.length === 2) return;
        e.preventDefault();
        
        const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
        const clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
        
        const areaRect = clothingArea.getBoundingClientRect();
        const x = clientX - areaRect.left - offsetX;
        const y = clientY - areaRect.top - offsetY;
        
        draggedItem.style.left = x + 'px';
        draggedItem.style.top = y + 'px';
    }
    
    function stopDragItem() {
        if (draggedItem) {
            draggedItem.classList.remove('dragging');
            draggedItem = null;
        }
        
        sourceContainer = null;
        
        document.removeEventListener('mousemove', dragItem);
        document.removeEventListener('mouseup', stopDragItem);
        document.removeEventListener('touchmove', dragItem);
        document.removeEventListener('touchend', stopDragItem);
    }
    
    function enlargeItem(item) {
        let scale = parseFloat(item.dataset.scale) || 1;
        scale += 0.1;
        item.dataset.scale = scale;
        
        const baseHeight = clothingSizes[item.dataset.type];
        item.style.height = (baseHeight * scale) + 'px';
    }
    
    function shrinkItem(item) {
        let scale = parseFloat(item.dataset.scale) || 1;
        scale = Math.max(0.5, scale - 0.1);
        item.dataset.scale = scale;
        
        const baseHeight = clothingSizes[item.dataset.type];
        item.style.height = (baseHeight * scale) + 'px';
    }
    
    // Load initial clothing
    loadClothing(currentStyle);
});