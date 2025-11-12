// ========== SEARCH SYSTEM ==========
let searchTimeout;

// Khởi tạo hệ thống tìm kiếm
function initializeSearch() {
    const searchInput = document.getElementById('searchInput');
    
    if (!searchInput) return;
    
    // Real-time search với debounce
    searchInput.addEventListener('input', function() {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            const term = this.value.trim();
            if (term.length >= 2) {
                performSearch(term);
            } else {
                hideSearchResults();
            }
        }, 300);
    });
    
    // Hiển thị kết quả khi focus (nếu có từ khóa)
    searchInput.addEventListener('focus', function() {
        const searchTerm = this.value.trim();
        if (searchTerm.length >= 2) {
            performSearch(searchTerm);
        }
    });
    
    // Ẩn kết quả khi click outside
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.search-container')) {
            hideSearchResults();
        }
    });
    
    // Keyboard navigation
    searchInput.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            hideSearchResults();
            this.blur();
        }
    });
}

// Thực hiện tìm kiếm
function performSearch(term) {
    if (!window.allProducts) {
        console.error('Product data not loaded');
        return;
    }
    
    const results = window.allProducts.filter(product =>
        product.name.toLowerCase().includes(term.toLowerCase()) ||
        product.type.toLowerCase().includes(term.toLowerCase())
    );
    
    // Giới hạn 5 sản phẩm đầu tiên
    const productResults = results.slice(0, 5);
    displaySearchResults(productResults, term);
}

// Hiển thị kết quả tìm kiếm
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
                    <span class="section-title">SẢN PHẨM</span>
                    <a href="#" class="view-all" onclick="showAllSearchResults('${term}')">
                        Xem tất cả ${products.length} sản phẩm
                    </a>
                </div>
                <div class="search-items">
        `;
        
        products.forEach(product => {
            // Tính giá gốc (giả lập giảm giá 20%)
            const originalPrice = Math.round(product.priceValue * 1.2);
            
            html += `
                <div class="search-item" onclick="selectSearchProduct('${product.id}')">
                    <img src="${product.image}" alt="${product.name}" class="search-item-img" 
                         onerror="this.src='../assets/images/default-product.jpg'">
                    <div class="search-item-info">
                        <div class="search-item-name">${product.name}</div>
                        <div class="search-item-price">
                            <span class="current-price">${window.formatPrice(product.priceValue)}</span>
                            <span class="original-price">${window.formatPrice(originalPrice)}</span>
                        </div>
                    </div>
                </div>
            `;
        });
        
        html += `
                </div>
            </div>
        `;
    }
    
    container.innerHTML = html;
    results.classList.add('active');
}

// Ẩn kết quả tìm kiếm
function hideSearchResults() {
    const searchResults = document.getElementById('searchResults');
    if (searchResults) {
        searchResults.classList.remove('active');
    }
}

// Chọn sản phẩm từ kết quả tìm kiếm
function selectSearchProduct(productId) {
    console.log('Đang chọn sản phẩm:', productId);
    
    const product = window.allProducts.find(p => p.id === productId);
    console.log('Tìm thấy sản phẩm:', product);
    
    if (product && window.showProductDetail) {
        console.log('Gọi showProductDetail với productId...');
        // Gọi hàm từ productDetail.js với productId
        window.showProductDetail(productId);
        hideSearchResults();
        
        // Clear search input
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.value = '';
        }
        
        console.log('Đã hiển thị chi tiết sản phẩm');
    } else {
        console.error('Không tìm thấy sản phẩm hoặc hàm showProductDetail');
    }
}

// Hiển thị tất cả kết quả tìm kiếm
function showAllSearchResults(searchTerm) {
    if (!window.allProducts) return;
    
    // Filter sản phẩm theo search term
    const filteredProducts = window.allProducts.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.type.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    // Render kết quả vào product grid
    if (window.renderProducts) {
        window.renderProducts(filteredProducts, 1, "product-grid");
    }
    
    // Ẩn phần phụ kiện khi đang hiển thị kết quả tìm kiếm
    const accessoriesSection = document.getElementById("accessories");
    if (accessoriesSection) {
        accessoriesSection.style.display = "none";
    }
    
    hideSearchResults();
}

// Khởi tạo khi DOM ready
document.addEventListener('DOMContentLoaded', function() {
    initializeSearch();
});