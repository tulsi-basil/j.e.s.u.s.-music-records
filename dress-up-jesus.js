// Dress up Jesus functionality
document.addEventListener('DOMContentLoaded', function() {
    const jesusBody = document.getElementById('jesus-body');
    const clothingRackLeft = document.getElementById('clothingRackLeft');
    const clothingRackRight = document.getElementById('clothingRackRight');
    const clothingLayers = document.getElementById('clothing-layers');
    
    if (!jesusBody) return;
    
    let draggedElement = null;
    let offsetX = 0;
    let offsetY = 0;
    let highestZIndex = 1000;
    let currentStyle = 'gorp-core';
    
    // Define target heights for each clothing type (in pixels)
    const clothingSizes = {
        short_jacket: 150,
        long_jacket: 200,
        shirt: 150,
        pants: 200,
        hat: 50,
        shoes: 100,
        vest: 140,
        boots: 110
    };
    
    // Style switching functionality
    const styleButtons = document.querySelectorAll('.style-btn');
    styleButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            // Remove active class from all buttons
            styleButtons.forEach(b => b.classList.remove('active'));
            // Add active class to clicked button
            this.classList.add('active');
            // Update current style
            currentStyle = this.dataset.style;
            // Clear all clothing
            clearAllClothing();
            // Load new clothing for this style
            loadClothingForStyle(currentStyle);
        });
    });
    
    function clearAllClothing() {
        clothingRackLeft.innerHTML = '';
        clothingRackRight.innerHTML = '';
    }
    
    function loadClothingForStyle(style) {
        let items = [];
        
         if (style === 'gorp-core') {
            items = [
                // Jackets
                { file: 'jacket6.png', type: 'short_jacket' },
                { file: 'jacket 7.png', type: 'long_jacket' },
                { file: 'blue jacket.png', type: 'long_jacket' },
                { file: 'blue jacket 2.png', type: 'long_jacket' },
                { file: 'blue and green jacket.png', type: 'long_jacket' },
                { file: 'pale jacket.png', type: 'long_jacket' },
                // Vests
                { file: 'puffer vest.png', type: 'vest' },
                { file: 'hunting vest.png', type: 'vest' },
                // Pants
                { file: 'pale pants.png', type: 'pants' },
                { file: 'pale pants 2.png', type: 'pants' },
                { file: 'tactical pants.png', type: 'pants' },
                // Shoes
                { file: 'salomon1.png', type: 'shoes' },
                { file: 'salomon2.png', type: 'shoes' },
                { file: 'salomon3.png', type: 'shoes' }
            ];
        } else if (style === 'e-girl') {
            items = [
                // Shirts/Tops
                { file: 'e-girl shirt 1.png', type: 'shirt' },
                { file: 'e-girl shirt 2.png', type: 'shirt' },
                { file: 'e-girl shirt 3.png', type: 'shirt' },
                { file: 'e-girl shirt 4.png', type: 'shirt' },
                { file: 'e-girl sweatshirt 1.png', type: 'long_jacket' },
                // Pants
                { file: 'e-girl pants 2.png', type: 'pants' },
                { file: 'e-girl pants 3.png', type: 'pants' },
                { file: 'e-girl pants 4.png', type: 'pants' },
                { file: 'e-girl pants 5.png', type: 'pants' },
                // Shoes/Boots
                { file: 'e-girl boots 1.png', type: 'boots' },
                { file: 'e-girl shoes 1.png', type: 'shoes' },
                { file: 'e-girl shoes 2.png', type: 'shoes' }
            ];
        } else if (style === 'polish') {
            items = [
                // Shirts/Tops
                { file: 'polish shirt 1.png', type: 'shirt' },
                { file: 'polish shirt 2.png', type: 'shirt' },
                // Dresses/Robes
                { file: 'polish dress 1.png', type: 'long_jacket' },
                { file: 'polish dress 2.png', type: 'long_jacket' },
                { file: 'polish dress 3.png', type: 'long_jacket' },
                { file: 'polish dress 4.png', type: 'long_jacket' },
                { file: 'polish dress 5.png', type: 'long_jacket' }
            ];
        }
        
        // Load the items
        items.forEach((item, index) => {
            const thumbnail = document.createElement('img');
            thumbnail.src = `dress-up-assets/${item.file}`;
            thumbnail.className = 'clothing-item';
            thumbnail.alt = item.file;
            thumbnail.dataset.clothing = item.file;
            thumbnail.dataset.type = item.type;
            thumbnail.draggable = false;
            
            const targetHeight = clothingSizes[item.type];
            
            if (targetHeight) {
                thumbnail.style.height = targetHeight + 'px';
                thumbnail.style.width = 'auto';
                thumbnail.style.display = 'block';
            }
            
            thumbnail.onload = function() {
                if (targetHeight) {
                    this.style.height = targetHeight + 'px';
                    this.style.width = 'auto';
                    console.log(`Loaded ${item.file}: natural size ${this.naturalWidth}x${this.naturalHeight}, scaled to height ${targetHeight}px, actual display height: ${this.offsetHeight}px`);
                }
            };
            
            if (index % 2 === 0) {
                clothingRackLeft.appendChild(thumbnail);
            } else {
                clothingRackRight.appendChild(thumbnail);
            }
            
            thumbnail.addEventListener('mousedown', startDrag);
        });
    }
    
    // Load initial clothing (gorp-core by default)
    loadClothingForStyle(currentStyle);
    
    function startDrag(e) {
        draggedElement = e.target;
        
        // Calculate offset from mouse to element's top-left
        const rect = draggedElement.getBoundingClientRect();
        offsetX = e.clientX - rect.left;
        offsetY = e.clientY - rect.top;
        
        // Store current size before making it fixed position
        const currentHeight = draggedElement.offsetHeight;
        const currentWidth = draggedElement.offsetWidth;
        
        // Increment z-index to bring to front
        highestZIndex++;
        
        // Make it draggable
        draggedElement.classList.add('dragging');
        draggedElement.style.position = 'fixed';
        draggedElement.style.height = currentHeight + 'px';
        draggedElement.style.width = currentWidth + 'px';
        draggedElement.style.left = (e.clientX - offsetX) + 'px';
        draggedElement.style.top = (e.clientY - offsetY) + 'px';
        draggedElement.style.zIndex = highestZIndex;
        
        document.addEventListener('mousemove', drag);
        document.addEventListener('mouseup', stopDrag);
    }
    
    function drag(e) {
        if (!draggedElement) return;
        
        draggedElement.style.left = (e.clientX - offsetX) + 'px';
        draggedElement.style.top = (e.clientY - offsetY) + 'px';
    }
    
    function stopDrag(e) {
        if (!draggedElement) return;
        
        draggedElement.classList.remove('dragging');
        draggedElement.style.opacity = '1';
        
        document.removeEventListener('mousemove', drag);
        document.removeEventListener('mouseup', stopDrag);
        
        draggedElement = null;
    }
});