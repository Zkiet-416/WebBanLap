// ========== SEARCH SYSTEM ==========
let searchTimeout;

// Hàm chuyển tiếng Việt có dấu thành không dấu
function removeVietnameseTones(str) {
    if (!str) return '';
    
    str = str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    str = str.replace(/đ/g, 'd').replace(/Đ/g, 'D');
    return str;
}

// Hàm chuẩn hóa chuỗi giá tiền thành số
function normalizePrice(priceStr) {
    if (!priceStr) return 0;
    const numericString = priceStr.toString().replace(/[^\d]/g, '');
    return parseInt(numericString) || 0;
}

// Hàm phân tích từ khóa tìm kiếm theo giá
function parsePriceSearch(term) {
    const pricePatterns = [
        // Nhập số trực tiếp (10.000.000, 10000000, 5.5tr, 500k)
        { pattern: /^(\d{1,3}(?:\.\d{3})*(?:\.\d+)?)\s*$/, type: 'exact', multiplier: 1 },
        { pattern: /^(\d+)\s*$/, type: 'exact', multiplier: 1 },
        
        // Dưới X triệu
        { pattern: /duoi\s*(\d+)\s*trieu/i, type: 'under', multiplier: 1000000 },
        { pattern: /dưới\s*(\d+)\s*trieu/i, type: 'under', multiplier: 1000000 },
        
        // Trên X triệu
        { pattern: /tren\s*(\d+)\s*trieu/i, type: 'over', multiplier: 1000000 },
        { pattern: /trên\s*(\d+)\s*trieu/i, type: 'over', multiplier: 1000000 },
        
        // Khoảng X-Y triệu
        { pattern: /tu\s*(\d+)\s*den\s*(\d+)\s*trieu/i, type: 'range', multiplier: 1000000 },
        { pattern: /từ\s*(\d+)\s*đến\s*(\d+)\s*trieu/i, type: 'range', multiplier: 1000000 },
        { pattern: /(\d+)\s*-\s*(\d+)\s*trieu/i, type: 'range', multiplier: 1000000 },
        
        // Giá cụ thể (triệu)
        { pattern: /gia\s*(\d+)\s*trieu/i, type: 'exact', multiplier: 1000000 },
        { pattern: /giá\s*(\d+)\s*trieu/i, type: 'exact', multiplier: 1000000 },
        { pattern: /(\d+)\s*trieu/i, type: 'exact', multiplier: 1000000 },
        
        // Giá cụ thể (nghìn)
        { pattern: /(\d+)\s*nghin/i, type: 'exact', multiplier: 1000 },
        { pattern: /(\d+)\s*nghìn/i, type: 'exact', multiplier: 1000 },
        
        // Chỉ số (15tr, 20tr, 5k, 10k)
        { pattern: /(\d+)\s*tr/i, type: 'exact', multiplier: 1000000 },
        { pattern: /(\d+)\s*k/i, type: 'exact', multiplier: 1000 }
    ];

    const normalizedTerm = removeVietnameseTones(term.toLowerCase());
    
    // Kiểm tra nếu chỉ là số (bao gồm số có dấu chấm)
    const justNumbers = normalizedTerm.replace(/[\.\s]/g, '');
    if (/^\d+$/.test(justNumbers)) {
        const priceValue = parseInt(justNumbers);
        if (priceValue > 1000) { // Chỉ xử lý nếu số đủ lớn (trên 1000đ)
            const tolerance = priceValue * 0.15;
            return { 
                type: 'exact', 
                min: Math.max(0, priceValue - tolerance), 
                max: priceValue + tolerance, 
                originalTerm: term 
            };
        }
    }
    
    for (const pricePattern of pricePatterns) {
        const match = normalizedTerm.match(pricePattern.pattern);
        if (match) {
            if (pricePattern.type === 'range') {
                const min = parseInt(match[1].replace(/\./g, '')) * pricePattern.multiplier;
                const max = parseInt(match[2].replace(/\./g, '')) * pricePattern.multiplier;
                return { type: 'range', min, max, originalTerm: term };
            } else if (pricePattern.type === 'under') {
                const max = parseInt(match[1].replace(/\./g, '')) * pricePattern.multiplier;
                return { type: 'under', max, originalTerm: term };
            } else if (pricePattern.type === 'over') {
                const min = parseInt(match[1].replace(/\./g, '')) * pricePattern.multiplier;
                return { type: 'over', min, originalTerm: term };
            } else if (pricePattern.type === 'exact') {
                let numberStr = match[1].replace(/\./g, '');
                const exact = parseInt(numberStr) * pricePattern.multiplier;
                // Cho phép sai số ±15%
                const tolerance = exact * 0.15;
                return { 
                    type: 'exact', 
                    min: Math.max(0, exact - tolerance), 
                    max: exact + tolerance, 
                    originalTerm: term 
                };
            }
        }
    }
    
    return null;
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
    const priceSearch = parsePriceSearch(term);
    
    let results = [];
    
    // Ưu tiên tìm kiếm theo giá nếu phát hiện
    if (priceSearch) {
        console.log(`Tìm kiếm theo giá:`, priceSearch);
        results = searchByPrice(priceSearch);
    } else {
        // Tìm kiếm theo tên thông thường
        results = searchByName(searchText);
    }
    
    const productResults = results.slice(0, 8);
    displaySearchResults(productResults, term, priceSearch);
}

// Hàm tìm kiếm theo giá
function searchByPrice(priceSearch) {
    return window.allProducts.filter(product => {
        if (!product || !product.priceValue) return false;
        
        const price = product.priceValue;
        
        switch (priceSearch.type) {
            case 'under':
                return price <= priceSearch.max;
                
            case 'over':
                return price >= priceSearch.min;
                
            case 'range':
                return price >= priceSearch.min && price <= priceSearch.max;
                
            case 'exact':
                return price >= priceSearch.min && price <= priceSearch.max;
                
            default:
                return false;
        }
    }).sort((a, b) => a.priceValue - b.priceValue);
}

// Hàm tìm kiếm theo tên
function searchByName(searchText) {
    return window.allProducts.filter(product => {
        if (!product || !product.model) return false;
        
        const productName = removeVietnameseTones(product.model.toLowerCase());
        return productName.includes(searchText);
    });
}

function displaySearchResults(products, term, priceSearch) {
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
        // Thêm thông tin tìm kiếm theo giá nếu có
        let priceInfo = '';
        if (priceSearch) {
            priceInfo = getPriceSearchInfo(priceSearch);
        }
        
        html += `
            <div class="search-section">
                <div class="section-header">
                    <span class="section-title">KẾT QUẢ TÌM KIẾM (${products.length} sản phẩm)</span>
                    ${priceInfo}
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

// Hàm hiển thị thông tin tìm kiếm theo giá
function getPriceSearchInfo(priceSearch) {
    let infoText = '';
    
    switch (priceSearch.type) {
        case 'under':
            infoText = `Dưới ${window.formatPrice(priceSearch.max)}`;
            break;
        case 'over':
            infoText = `Trên ${window.formatPrice(priceSearch.min)}`;
            break;
        case 'range':
            infoText = `Từ ${window.formatPrice(priceSearch.min)} đến ${window.formatPrice(priceSearch.max)}`;
            break;
        case 'exact':
            const exactPrice = (priceSearch.min + priceSearch.max) / 2;
            infoText = `Khoảng ${window.formatPrice(exactPrice)}`;
            break;
    }
    
    return `<div class="price-search-info">${infoText}</div>`;
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