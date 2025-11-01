let globalJsonData = { product: { brand: [] } };
let editingRow = null;
let currentOfferContent = "Ưu đãi đặc biệt: Tặng chuột không dây và túi chống sốc cao cấp!";
let currentViewingBrandName = null; 

// BIẾN PHÂN TRANG
let brandsPerPage = 10;
let currentBrandPage = 1;
let productsPerPage = 8;
let currentProductPage = 1;
let currentProductsList = []; 
let filteredProductsList = []; // Danh sách sản phẩm đã lọc

document.addEventListener('DOMContentLoaded', () => {
    const DOM = {
        brandManagementArea: document.getElementById('brand-management-area'),
        tableBody: document.getElementById('brand-list-tbody'),
        formHeader: document.querySelector('.form-header h3'),
        submitBtn: document.querySelector('.btn-submit'),
        resetBtn: document.querySelector('.btn-reset'),
        tenInput: document.getElementById('ten'),
        soLuongInput: document.getElementById('soluong'),
        productDetailsArea: document.getElementById('product-details-area'),
        productListTbody: document.getElementById('product-list'),
        brandSearchInput: document.getElementById('brand-search-input'), 
        brandPaginationContainer: document.getElementById('brand-pagination-container'),
        productPaginationContainer: document.getElementById('product-pagination-container')
    };
    
    // --- CÁC HÀM TIỆN ÍCH DỮ LIỆU JSON ---
    const findBrandByName = (name) => globalJsonData.product.brand.find(b => b.name === name); 
    const findBrandIndexByName = (name) => globalJsonData.product.brand.findIndex(b => b.name === name);
    const productTypes = ['laptop', 'balo', 'phukienkhac'];

    // Tính tổng số lượng sản phẩm
    const calculateProductCount = (brand) => {
        return productTypes.reduce((count, type) => {
            return count + (Array.isArray(brand[type]) ? brand[type].length : 0);
        }, 0);
    };

    // --- HÀM TẢI DỮ LIỆU JSON ---
    async function loadBrandsFromJSON() {
        try {
            const response = await fetch("AdminProduct.json"); 
            if (!response.ok) throw new Error(`Lỗi HTTP: ${response.status}`);
            const data = await response.json();
            
            if (data?.product?.brand) globalJsonData = data;
            else console.error("Cấu trúc AdminProduct.json không hợp lệ.");
            
            renderBrands();
        } catch (err) {
            console.error("❌ Lỗi khi tải AdminProduct.json:", err);
            DOM.tableBody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: red;">Lỗi tải dữ liệu. Vui lòng kiểm tra file AdminProduct.json.</td></tr>`;
        }
    }
    
    // HÀM TẠO PHÂN TRANG
    function createPagination(totalItems, itemsPerPage, currentPage, pageContainer, onPageChangeCallback) {
        const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
        pageContainer.innerHTML = '';
        if (currentPage > totalPages && totalItems > 0) currentPage = totalPages;
        
        const startPage = Math.max(1, currentPage - 1);
        const endPage = Math.min(totalPages, currentPage + 1);
        
        // Thêm nút "..." nếu cần
        if (startPage > 1) pageContainer.appendChild(createButton(1, currentPage, onPageChangeCallback, totalPages));
        if (startPage > 2) pageContainer.innerHTML += `<span>...</span>`;

        for (let i = startPage; i <= endPage; i++) {
            pageContainer.appendChild(createButton(i, currentPage, onPageChangeCallback, totalPages));
        }

        if (endPage < totalPages - 1) pageContainer.innerHTML += `<span>...</span>`;
        if (endPage < totalPages) pageContainer.appendChild(createButton(totalPages, currentPage, onPageChangeCallback, totalPages));
    }
    
    const createButton = (page, currentPage, onPageChangeCallback, totalPages) => {
        const button = document.createElement('button');
        button.classList.add('page-btn');
        button.textContent = page.toString();
        if (page === currentPage) button.classList.add('active');
        button.onclick = () => onPageChangeCallback(page);
        return button;
    };

    // RENDER BRAND VÀ PHÂN TRANG
    function renderBrands(filteredBrands = null) {
        DOM.tableBody.innerHTML = '';
        
        const brandsToPaginate = filteredBrands || globalJsonData.product.brand;
        const totalBrands = brandsToPaginate.length;

        const startIndex = (currentBrandPage - 1) * brandsPerPage;
        const brandsToRender = brandsToPaginate.slice(startIndex, startIndex + brandsPerPage);

        brandsToRender.forEach((brand) => { 
            const soLuong = calculateProductCount(brand); 
            const brandName = brand.name;
            const originalIndex = globalJsonData.product.brand.findIndex(b => b.name === brandName);

            const newRow = DOM.tableBody.insertRow();
            newRow.dataset.brandName = brandName;
            newRow.dataset.viewMode = 'false';
            newRow.dataset.id = originalIndex + 1; 

            newRow.innerHTML = `
                <td>${originalIndex + 1}</td> <td class="brand-name-cell">${brandName}</td>
                <td>${soLuong}</td>
                <td>
                    <label class="switch">
                        <input type="checkbox" ${brand.status === 'active' ? 'checked' : ''} onchange="toggleBrandStatus('${brandName}', this.checked)">
                        <span class="slider round"></span>
                    </label>
                </td>
                <td>
                    <div class="action-buttons-container">
                        <button class="action-btn delete-btn-v2" onclick="deleteBrand('${brandName}', this)">
                            <i class="fas fa-times"></i>
                        </button>
                        <div class="dropdown">
                            <i class="fas fa-chevron-down dropdown-toggle"></i>
                            <div class="dropdown-content">
                                <a href="#" onclick="viewProduct(this); return false;"><i class="fas fa-eye"></i> Chỉ xem</a>
                                <a href="#" onclick="editBrand('${brandName}', this); return false;"><i class="fas fa-edit"></i> Chỉnh sửa</a>
                            </div>
                        </div>
                    </div>
                </td>
            `;
        });
        
        createPagination(totalBrands, brandsPerPage, currentBrandPage, DOM.brandPaginationContainer, (newPage) => {
            currentBrandPage = newPage;
            renderBrands(filteredBrands); 
        });
    }

    // HIỂN THỊ SẢN PHẨM CỦA TRANG HIỆN TẠI
    window.showProductsForCurrentPage = (brandName) => {
        const productsToPaginate = filteredProductsList.length > 0 ? filteredProductsList : currentProductsList; 
        const totalProducts = productsToPaginate.length;
        const totalPages = Math.max(1, Math.ceil(totalProducts / productsPerPage));
        
        if (currentProductPage > totalPages && totalProducts > 0) currentProductPage = totalPages;
        else if (totalProducts === 0) currentProductPage = 1; 
        
        const startIndex = (currentProductPage - 1) * productsPerPage;
        const productsToRender = productsToPaginate.slice(startIndex, startIndex + productsPerPage);

        DOM.productListTbody.innerHTML = '';

        if (productsToRender.length > 0) {
            productsToRender.forEach((product, localIndex) => {
                const isVisible = (product.status || 'an').toLowerCase().trim() === 'hien';
                const statusText = isVisible ? "Hiển thị" : "Đã ẩn";
                const eyeIcon = isVisible ? "fas fa-eye" : "fas fa-eye-slash";
                const productTypeDisplay = product.type === 'laptop' ? '' : ` (${product.type})`;
                const newRow = DOM.productListTbody.insertRow();
                
                newRow.dataset.brandName = brandName;
                newRow.dataset.productType = product.type; 
                newRow.dataset.originalIndex = product.originalIndex; 
                newRow.dataset.model = product.model || 'N/A';
                newRow.dataset.price = product.price || 'N/A';
                newRow.dataset.statusText = statusText;
                newRow.dataset.id = product.id || `SP-${startIndex + localIndex + 1}`; 
                newRow.dataset.image = product.image || `https://placehold.co/40x40`; 
                newRow.dataset.description = product.description || "Đang cập nhật..."; 

                newRow.insertCell().textContent = newRow.dataset.id; 
                newRow.insertCell().innerHTML = `
                    <div class="sp-product-info">
                        <img src="${newRow.dataset.image}" alt="${newRow.dataset.model}" class="sp-product-image"> <div>
                            <div class="sp-product-name">${newRow.dataset.model}</div>
                            <div class="sp-product-brand">${brandName}${productTypeDisplay}</div>
                        </div>
                    </div>
                `;
                newRow.insertCell().textContent = newRow.dataset.price ? `${newRow.dataset.price} VNĐ` : 'N/A';
                newRow.insertCell().innerHTML = `<span class="sp-status ${isVisible ? "sp-in-stock" : "sp-out-of-stock"}">${statusText}</span>`;
                
                newRow.insertCell().innerHTML = `
                    <div class="sp-actions">
                        <span class="sp-detail-link" onclick="showDetailsPopup(this)">Chi tiết</span>
                        <button class="sp-action-btn sp-toggle-visibility-btn" title="Ẩn/Hiện" onclick="toggleProductStatus('${brandName}', '${product.type}', ${product.originalIndex}, this)"><i class="${eyeIcon}"></i></button>
                        <button class="sp-action-btn sp-remove-btn" title="Xóa" onclick="deleteProduct('${brandName}', '${product.type}', ${product.originalIndex}, this)"><i class="fas fa-times"></i></button>
                        <button class="sp-action-btn sp-edit-btn" title="Chỉnh sửa" onclick="editProduct('${brandName}', '${product.type}', ${product.originalIndex})"><i class="fas fa-pencil-alt"></i></button>
                    </div>
                `;
            });
        } else {
            const searchTerm = DOM.brandSearchInput.value.trim();
            const message = searchTerm ? 
                `Không tìm thấy sản phẩm nào khớp với từ khóa "${searchTerm}" cho thương hiệu ${brandName}.` : 
                `Không tìm thấy sản phẩm nào cho thương hiệu ${brandName}.`;
            DOM.productListTbody.innerHTML = `<tr><td colspan="5" style="text-align: center;">${message}</td></tr>`;
        }
        
        createPagination(totalProducts, productsPerPage, currentProductPage, DOM.productPaginationContainer, (newPage) => {
            currentProductPage = newPage;
            showProductsForCurrentPage(brandName);
        });
    }
    
    // GỘP TẤT CẢ SẢN PHẨM VÀ HIỂN THỊ
    window.showProductDetails = (brandName) => {
        currentViewingBrandName = brandName; 
        currentProductPage = 1;
        filteredProductsList = []; // Reset danh sách lọc khi chuyển thương hiệu

        DOM.productDetailsArea.style.display = 'block'; 
        DOM.productPaginationContainer.style.display = 'flex';
        DOM.brandManagementArea.style.display = 'none'; 
        
        const targetBrand = findBrandByName(brandName);
        
        if (targetBrand) {
            currentProductsList = productTypes.flatMap(type => {
                return (Array.isArray(targetBrand[type]) ? targetBrand[type] : []).map((p, index) => ({...p, type: type, originalIndex: index}));
            });
            showProductsForCurrentPage(brandName);
        } else {
             DOM.productListTbody.innerHTML = `<tr><td colspan="5" style="text-align: center;">Không tìm thấy thương hiệu ${brandName}.</td></tr>`;
        }
    }


    // --- CÁC HÀM THAO TÁC DỮ LIỆU ---
    
    window.deleteBrand = (brandName, btn) => {
        const row = btn.closest('tr');
        if (row.dataset.viewMode === 'true') return;

        const index = findBrandIndexByName(brandName);
        if (index !== -1 && confirm(`Bạn có chắc muốn xóa Brand: ${brandName} không?`)) {
            globalJsonData.product.brand.splice(index, 1);
            const totalBrands = globalJsonData.product.brand.length;
            const totalPages = Math.ceil(totalBrands / brandsPerPage);
            if (currentBrandPage > totalPages && totalBrands > 0) currentBrandPage = totalPages;
            else if (totalBrands === 0) currentBrandPage = 1;
            renderBrands(); 
        }
    };

    window.toggleBrandStatus = (brandName, isChecked) => {
        const brand = findBrandByName(brandName);
        if (brand) brand.status = isChecked ? 'active' : 'inactive';
    };

    window.editBrand = (brandName, link) => {
        const row = link.closest('tr');
        if (row.dataset.viewMode === 'true') return false; 

        const brand = findBrandByName(brandName);
        
        if (brand) {
            DOM.tenInput.value = brand.name;
            DOM.soLuongInput.value = calculateProductCount(brand); 

            DOM.submitBtn.textContent = 'Cập nhật';
            DOM.formHeader.textContent = `CHỈNH SỬA LOẠI SẢN PHẨM`; 
            editingRow = row; 
        }
        
        link.closest('.dropdown-content').style.display = 'none'; 
        return false; 
    };

    DOM.submitBtn.addEventListener('click', () => {
        const ten = DOM.tenInput.value.trim();
        if (!ten) return alert('Vui lòng nhập Tên/Thương hiệu hợp lệ!');

        if (editingRow) {
            const brand = findBrandByName(editingRow.dataset.brandName);
            if (brand) {
                brand.name = ten;
                editingRow.querySelector('.brand-name-cell').textContent = ten;
                editingRow.dataset.brandName = ten; 
            }
        } else {
            const newBrand = { "name": ten, "status": "active", "laptop": [] };
            globalJsonData.product.brand.push(newBrand);
            currentBrandPage = Math.ceil(globalJsonData.product.brand.length / brandsPerPage);
            renderBrands();
        }
        resetForm();
    });

    // --- CÁC HÀM KHÁC ---

    window.hideProductDetails = () => {
        DOM.productDetailsArea.style.display = 'none';
        DOM.productPaginationContainer.style.display = 'none';
        DOM.brandManagementArea.style.display = 'block';
        DOM.brandSearchInput.value = '';
        filterBrands('');
        currentViewingBrandName = null;
        currentProductPage = 1;
        currentProductsList = []; 
        filteredProductsList = []; 
    };
    
    const recompileProductList = (brand) => {
        currentProductsList = productTypes.flatMap(type => {
            return (Array.isArray(brand[type]) ? brand[type] : []).map((p, index) => ({...p, type: type, originalIndex: index}));
        });
        filteredProductsList = [];
        showProductsForCurrentPage(currentViewingBrandName);
        renderBrands(); // Cập nhật số lượng Brand
    };

    window.deleteProduct = (brandName, type, index, btn) => {
        const brand = findBrandByName(brandName);
        const product = brand?.[type]?.[index];

        if (product && confirm(`Bạn có chắc muốn xóa Sản phẩm "${product.model}" không?`)) {
            brand[type].splice(index, 1);
            recompileProductList(brand);
        }
    };
    
    window.editProduct = (brandName, type, index) => {
        const brand = findBrandByName(brandName);
        const product = brand?.[type]?.[index];
        if (!product) return alert("Lỗi: Không tìm thấy sản phẩm để chỉnh sửa.");

        const newModel = prompt("Chỉnh sửa Model sản phẩm:", product.model);
        if (newModel === null) return;

        const newPrice = prompt("Chỉnh sửa Giá tiền (ví dụ: 15.000.000):", product.price);
        if (newPrice === null) return;

        const newImage = prompt("Chỉnh sửa URL Hình ảnh:", product.image);
        if (newImage === null) return;

        const newDescription = prompt("Chỉnh sửa Thông số chi tiết (tách bằng |):", (product.description || '').replace(/\n/g, ' | '));
        if (newDescription === null) return;

        product.model = newModel.trim();
        product.price = newPrice.trim();
        product.image = newImage.trim();
        product.description = newDescription.trim();

        recompileProductList(brand);
    };

    window.toggleProductStatus = (brandName, type, index, btn) => {
        const brand = findBrandByName(brandName);
        const product = brand?.[type]?.[index];

        if (product) {
            product.status = (product.status === 'hien') ? 'an' : 'hien';
            
            const row = btn.closest('tr');
            const statusText = (product.status === 'hien') ? 'Hiển thị' : 'Đã ẩn';
            
            row.dataset.statusText = statusText;
            row.querySelector('.sp-status').textContent = statusText;
            row.querySelector('.sp-status').className = `sp-status ${product.status === 'hien' ? 'sp-in-stock' : 'sp-out-of-stock'}`;
            btn.querySelector('i').className = product.status === 'hien' ? 'fas fa-eye' : 'fas fa-eye-slash';
        }
    };

    window.addNewProduct = () => {
        if (!currentViewingBrandName) return alert("Lỗi: Không xác định được thương hiệu hiện tại.");

        const brand = findBrandByName(currentViewingBrandName);
        if (!brand) return;

        const productTypeInput = prompt(`Nhập Loại SP (${productTypes.join(', ')}):`);
        if (!productTypeInput) return;
        const type = productTypeInput.trim().toLowerCase();
        if (!productTypes.includes(type)) return alert(`Loại SP không hợp lệ. Vui lòng chọn: ${productTypes.join(', ')}.`);
            
        const id = prompt(`Nhập Mã SP (ID) cho loại ${type}:`);
        if (!id) return;
        if (brand[type] && brand[type].some(p => p.id === id)) return alert("Lỗi: Mã SP này đã tồn tại!");

        const model = prompt("Nhập Model SP:");
        if (!model) return;

        const price = prompt("Nhập Giá tiền (ví dụ: 15.000.000):");
        if (!price) return;
            
        const image = prompt("Nhập URL Hình ảnh:", "https://placehold.co/150x150?text=IMG");
        if (!image) return;

        const description = prompt("Nhập Thông số chi tiết (ngăn cách bằng dấu |):", "Thông tin mô tả...");
        if (!description) return;

        const newProduct = { "id": id, "model": model, "price": price, "image": image, "description": description, "status": "hien" };

        if (!brand[type]) brand[type] = [];
        brand[type].push(newProduct);
        
        currentProductPage = Math.ceil((currentProductsList.length + 1) / productsPerPage);
        recompileProductList(brand); 
    };
    
    // HÀM LỌC BRAND
    function filterBrands(searchTerm) {
        const term = searchTerm.toLowerCase().trim();
        const filtered = globalJsonData.product.brand.filter(brand => 
            (brand.name || '').toLowerCase().includes(term)
        );
        currentBrandPage = 1;
        renderBrands(filtered); 
    }
    
    // HÀM LỌC PRODUCT
    function filterProducts(searchTerm) {
        const term = searchTerm.toLowerCase().trim();
        
        if (!term) {
            filteredProductsList = [];
        } else {
            // Lọc theo model, id, hoặc price
            filteredProductsList = currentProductsList.filter(product => {
                const model = (product.model || '').toLowerCase();
                const id = (product.id || '').toLowerCase();
                const price = (product.price || '').toLowerCase();
                return model.includes(term) || id.includes(term) || price.includes(term);
            });
        }
        
        currentProductPage = 1;
        showProductsForCurrentPage(currentViewingBrandName); 
    }

    function resetForm() {
        DOM.tenInput.value = '';
        DOM.soLuongInput.value = 0; 
        DOM.submitBtn.textContent = 'Hoàn tất';
        DOM.formHeader.textContent = 'THÊM LOẠI SẢN PHẨM';
        editingRow = null;
    }
    
    DOM.resetBtn.addEventListener('click', resetForm);
    
    // [Các hàm popup và viewProduct giữ nguyên]

    window.closeModal = (event) => {
        if (event.target.id === 'detailsModal') event.target.style.display = "none";
    };
    
    window.editOffer = () => {
        const newContent = prompt("Nhập nội dung ưu đãi mới:", currentOfferContent.trim());
        
        if (newContent !== null) {
            currentOfferContent = newContent;
            document.getElementById('detail-offer-content').textContent = currentOfferContent;
            alert("Đã cập nhật ưu đãi thành công!");
        }
    };
    
    window.showDetailsPopup = (btn) => {
        const row = btn.closest('tr');
        
        const modal = document.getElementById('detailsModal');
        document.getElementById('modal-title').textContent = `Chi tiết ${row.dataset.model}`;
        document.getElementById('detail-product-name').textContent = `${row.dataset.brandName} ${row.dataset.model}`;
        document.getElementById('detail-price').innerHTML = `Giá: <strong>${row.dataset.price}</strong> VNĐ`;
        document.getElementById('detail-status').textContent = `Tình trạng: ${row.dataset.statusText === 'Hiển thị' ? 'Còn hàng' : 'Hết hàng'}`;
        document.getElementById('detail-offer-content').textContent = currentOfferContent; 
        document.getElementById('detail-product-image').src = row.dataset.image;
        document.getElementById('detail-description-content').textContent = row.dataset.description.replace(/ \| /g, '\n'); 
        
        modal.style.display = 'block';
    };


    window.viewProduct = (link) => {
        const row = link.closest('tr');
        const isViewOnly = !(row.dataset.viewMode === 'true');
        row.dataset.viewMode = isViewOnly;
        row.classList.toggle("view-mode", isViewOnly);
        
        const deleteBtn = row.querySelector('.delete-btn-v2');
        const editLink = row.querySelector('.dropdown-content a:nth-child(2)');

        deleteBtn.disabled = isViewOnly;
        deleteBtn.style.opacity = isViewOnly ? "0.5" : "1";
        deleteBtn.style.pointerEvents = isViewOnly ? "none" : "auto";

        editLink.style.pointerEvents = isViewOnly ? "none" : "auto";
        editLink.style.opacity = isViewOnly ? "0.5" : "1";
        
        link.innerHTML = isViewOnly ? '<i class="fas fa-eye-slash"></i> Thoát xem' : '<i class="fas fa-eye"></i> Chỉ xem';
        link.closest('.dropdown-content').style.display = 'none';

        return false; 
    };

    // Xử lý sự kiện tìm kiếm (Phân biệt Brand và Product)
    DOM.brandSearchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value;
        const isBrandPageVisible = DOM.brandManagementArea.style.display !== 'none';
        
        if (isBrandPageVisible) {
            filterBrands(searchTerm); 
        } else if (currentViewingBrandName) {
            filterProducts(searchTerm); 
        }
    });
    
    DOM.tableBody.addEventListener('click', (e) => {
        const brandNameCell = e.target.closest('.brand-name-cell');
        if (brandNameCell) showProductDetails(brandNameCell.textContent);
    });

    document.addEventListener('click', (e) => {
        const target = e.target;
        
        const isDropdownClick = target.closest('.dropdown');
        if (!isDropdownClick) document.querySelectorAll('.dropdown-content').forEach(dc => dc.style.display = 'none');

        if (target.classList.contains('dropdown-toggle')) {
            const dropdownContent = target.nextElementSibling;
            document.querySelectorAll('.dropdown-content').forEach(dc => {
                if (dc !== dropdownContent) dc.style.display = 'none';
            });
            
            if (dropdownContent) {
                dropdownContent.style.display = (dropdownContent.style.display === 'block') ? 'none' : 'block';
            }
        }
    });

    loadBrandsFromJSON();
});