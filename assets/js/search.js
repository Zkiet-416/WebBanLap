// ========== SEARCH SYSTEM ==========
let searchTimeout;

// Hàm chuyển tiếng Việt có dấu thành không dấu
function removeVietnameseTones(str) {
    if (!str) return '';
    
    str = str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    str = str.replace(/đ/g, 'd').replace(/Đ/g, 'D');
    return str;
}

function initializeSearch() {
    const searchInput = document.getElementById('searchInput');
    
    if (!searchInput) return;
    
    searchInput.addEventListener('input', function() {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            const term = this.value.trim();
            const normalizedTerm = removeVietnameseTones(term);
            
            if (term.length >= 2) {
                performSearch(term);
            } else {
                hideSearchResults();
            }
        }, 300);
    });
    
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.search-container')) {
            hideSearchResults();
        }
    });
}

function performSearch(term) {
    if (!window.allProducts || window.allProducts.length === 0) {
        console.log('Chưa có dữ liệu sản phẩm');
        return;
    }
    
    const searchText = removeVietnameseTones(term.toLowerCase());
    
    // Hiển thị tất cả tên sản phẩm đã chuẩn hóa
    window.allProducts.forEach(product => {
        if (product && product.model) {
            const normalizedName = removeVietnameseTones(product.model.toLowerCase());
            console.log('   -', normalizedName);
        }
    });
    
    const results = window.allProducts.filter(product => {
        if (!product || !product.model) return false;
        
        const productName = removeVietnameseTones(product.model.toLowerCase());
        const hasMatch = productName.includes(searchText);
        
        if (hasMatch) {
            console.log('✅ Khớp:', product.model);
        }
        
        return hasMatch;
    });
    
    const productResults = results.slice(0, 8);
    displaySearchResults(productResults, term);
}

function displaySearchResults(products, term) {
    const container = document.querySelector('.search-results-content');
    const results = document.getElementById('searchResults');
    
    if (!container || !results) return;
    
    let html = '';
    
    if (products.length === 0) {
        html = `
            <div class="no-results">
                <p>Không tìm thấy kết quả cho "<strong>${term}</strong>"</p>
                <small>Hãy thử với từ khóa khác</small>
            </div>
        `;
    } else {
        html += `
            <div class="search-section">
                <div class="section-header">
                    <span class="section-title">KẾT QUẢ TÌM KIẾM (${products.length} sản phẩm)</span>
                </div>
                <div class="search-items">
        `;
        
        products.forEach(product => {
            const typeBadge = product.category === 'laptop' ? 
                `<span class="product-badge laptop-badge">Laptop</span>` :
                `<span class="product-badge accessory-badge">Phụ kiện</span>`;
            
            html += `
                <div class="search-item" onclick="selectSearchProduct('${product.id}')">
                    <img src="${product.image}" alt="${product.model}" class="search-item-img"
                         onerror="this.src='../assets/images/default-product.jpg'">
                    <div class="search-item-info">
                        <div class="search-item-header">
                            ${typeBadge}
                            <div class="search-item-name">${product.model}</div>
                        </div>
                        <div class="search-item-price">
                            <span class="current-price">${window.formatPrice ? window.formatPrice(product.priceValue) : product.priceValue + 'đ'}</span>
                        </div>
                    </div>
                </div>
            `;
        });
        
        html += `</div></div>`;
    }
    
    container.innerHTML = html;
    results.classList.add('active');
}

function hideSearchResults() {
    const searchResults = document.getElementById('searchResults');
    if (searchResults) {
        searchResults.classList.remove('active');
    }
}

function selectSearchProduct(productId) {
    const product = window.allProducts.find(p => p.id === productId);
    
    if (product) {
        hideSearchResults();
        
        const searchInput = document.getElementById('searchInput');
        if (searchInput) searchInput.value = '';
        
        if (typeof window.showProductDetail === 'function') {
            window.showProductDetail(productId);
        }
    }
}

// Khởi tạo
document.addEventListener('DOMContentLoaded', initializeSearch);