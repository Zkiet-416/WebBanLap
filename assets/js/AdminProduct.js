// ========== HÀM CHUẨN HÓA DỮ LIỆU (Copy từ products.js) ==========
// Hàm này BẮT BUỘC phải đồng bộ với hàm trong products.js
// Đây là hàm được yêu cầu thêm vào để chuyển đổi cấu trúc khi lưu
function normalizeData(data) {
    if (!data || !data.product || !data.product.brand) return [];

    let result = [];
    data.product.brand.forEach(brandGroup => {
        const groupName = brandGroup.name; 
        const categoryStatus = brandGroup.status;
        const subProducts = brandGroup[groupName];
        
        // ĐÃ SỬA: Quét thêm cả key 'phukienkhac' nếu groupName không chứa dữ liệu
        // Điều này đảm bảo các Brand tùy chỉnh (lưu trong phukienkhac) vẫn được chuẩn hóa
        let productsToProcess = [];
        if (Array.isArray(subProducts)) {
            productsToProcess = subProducts;
        } else if (Array.isArray(brandGroup['phukienkhac'])) {
             productsToProcess = brandGroup['phukienkhac'];
        }

        if (productsToProcess.length > 0) {
            productsToProcess.forEach(product => {
                // Xử lý giá, loại bỏ dấu chấm
                const priceValue = parseInt(String(product.price).replace(/\./g, '').replace(/\.0+$/, ''), 10);
                
                let productCategory = groupName === 'laptop' ? 'laptop' : 'phukien';
                let productType = '';
                
                if (productCategory === 'laptop') {
                    // Xác định type/brand laptop từ ID prefix
                    const idPrefix = product.id.substring(0, 2);
                    if (idPrefix === 'AC') productType = 'Acer';
                    else if (idPrefix === 'AS') productType = 'Asus';
                    else if (idPrefix === 'HP') productType = 'HP';
                    else if (idPrefix === 'LE') productType = 'Lenovo';
                    else if (idPrefix === 'DE') productType = 'Dell';
                    else productType = 'Khac';
                } else {
                    // Đối với phụ kiện/balo, type chính là tên nhóm
                    if (groupName === 'balo') {
                        productType = 'balo';
                    } else if (groupName === 'de-tan-nhiet') {
                        productType = 'de-tan-nhiet';
                    } else if (groupName === 'tai-nghe') {
                        productType = 'tai-nghe';
                    } else if (groupName === 'ban-phim') {
                        productType = 'ban-phim';
                    } else if (groupName === 'chuot') {
                        productType = 'chuot'; 
                    } else {
                        productType = 'phukienkhac';
                }}
                
                // Sử dụng ID + Model để tạo key duy nhất (Định dạng của products.js)
                const id = `${product.id}-${product.model.replace(/\s/g, '_')}`;
                let finalQty = product.qty;
                // Hoặc đơn giản: nếu type là 'phukienkhac' thì luôn là "0"
                if (productType === 'phukienkhac') {
                    finalQty = "0"; 
                    // Đảm bảo category cũng là 'phukien'
                    productCategory = 'phukien'; 
                }
                result.push({
                    ...product,
                    id: product.id,
                    priceValue: priceValue,
                    category: productCategory,
                    type: productType ,
                    qty:finalQty,
                    categoryStatus: categoryStatus
                });
            });
        }
    });
    return result;
}
// ========== KẾT THÚC HÀM CHUẨN HÓA ==========


let editingRow = null;
let currentOfferContent = "Ưu đãi đặc biệt: Tặng chuột không dây và túi chống sốc cao cấp!";
let currentViewingBrandName = null;
let autoRefreshIntervalId = null; // Biến lưu trữ ID của setInterval

// BIẾN PHÂN TRANG
let brandsPerPage = 10;
let currentBrandPage = 1;
let productsPerPage = 6;
let currentProductPage = 1;
let currentProductsList = [];
let filteredProductsList = [];

// --- BIẾN TRẠNG THÁI FORM MỚI ---
let isEditingMode = false;
let currentEditIndex = -1;
let currentEditType = "";

// ===================================
// --- CÁC HÀM XỬ LÝ MODAL FORM MỚI ---
// ===================================

window.openProductForm = (mode, productData = null, brandName = "", type = "", index = -1) => {
    // brandName ở đây chính là currentViewingBrandName (tên loại sản phẩm)
    const modal = document.getElementById('product-form-modal');
    const title = document.getElementById('custom-form-title');
    
    // DOM Elements cho ảnh
    const fileInput = document.getElementById('inp-image-file');
    const hiddenInput = document.getElementById('inp-image');
    const preview = document.getElementById('image-preview');

    // Reset form inputs
    document.getElementById('inp-model').value = "";
    document.getElementById('inp-id').value = "";
    document.getElementById('inp-price').value = "";
    document.getElementById('inp-desc').value = "";
    
    // Reset ảnh
    if(fileInput) fileInput.value = "";
    if(hiddenInput) hiddenInput.value = "";
    if(preview) {
        preview.src = "";
        preview.style.display = "none";
    }
    
    isEditingMode = (mode === 'edit');
    modal.style.display = 'flex';

    const typeSelect = document.getElementById('inp-type');
    const idInput = document.getElementById('inp-id');
    const priceInput = document.getElementById('inp-price'); // Lấy input Giá

    if (isEditingMode && productData) {
        // CHẾ ĐỘ SỬA
        title.textContent = "Chỉnh sửa";
        currentEditType = type;
        currentEditIndex = index;

        // Điền dữ liệu cũ vào form
        document.getElementById('inp-model').value = productData.model || "";
        typeSelect.value = type; // Auto select type
        typeSelect.disabled = true; // Không cho sửa loại khi đang edit
        idInput.value = productData.id || "";
        idInput.disabled = true; // Thường không nên sửa ID
        priceInput.value = productData.price || "";
        priceInput.disabled = true; // <--- ĐIỂM CHỈNH SỬA: Tắt chỉnh sửa Giá khi đang edit
        
        // Chuyển dấu | thành xuống dòng để dễ chỉnh sửa trong textarea
        document.getElementById('inp-desc').value = (productData.description || "").replace(/ \| /g, '\n'); 
        
        // Xử lý hiển thị ảnh cũ
        const oldImage = productData.image || "";
        if (oldImage && oldImage !== "https://placehold.co/150x150?text=NoImage") {
            hiddenInput.value = oldImage;
            preview.src = oldImage;
            preview.style.display = "block";
        }
    } else {
        // CHẾ ĐỘ THÊM MỚI
        title.textContent = "+ Thêm";
        currentEditIndex = -1; // Đảm bảo
        
        hiddenInput.value = "https://placehold.co/150x150?text=NoImage"; // Mặc định

        // Tự động chọn loại dựa trên currentViewingBrandName
        // <--- ĐÃ SỬA: Logic thông minh hơn để chọn category --->
        const standardTypes = ['laptop', 'balo', 'de-tan-nhiet', 'chuot', 'ban-phim', 'tai-nghe'];
        
        if (currentViewingBrandName && standardTypes.includes(currentViewingBrandName)) {
             // Nếu là brand chuẩn (balo, laptop...), chọn đúng tên đó
             typeSelect.value = currentViewingBrandName;
        } else {
             // Nếu là brand tùy chỉnh (Loa, Ghế...), chọn 'phukienkhac'
             typeSelect.value = 'phukienkhac'; 
        }
        
        // Kiểm tra xem việc gán value có thành công không (trường hợp option chưa load)
        if (!typeSelect.value) typeSelect.value = 'phukienkhac';

        typeSelect.disabled = true; // Khóa lại, không cho người dùng đổi lung tung
        idInput.disabled = false;
        priceInput.disabled = false; // <--- ĐIỂM CHỈNH SỬA: Bật chỉnh sửa Giá khi thêm mới
    }
};

window.closeProductForm = () => {
    document.getElementById('product-form-modal').style.display = 'none';
};

window.handleProductFormSubmit = () => {
    // 1. Lấy dữ liệu từ form và Validate (Giữ nguyên)
    const model = document.getElementById('inp-model').value.trim();
    const type = document.getElementById('inp-type').value;
    const id = document.getElementById('inp-id').value.trim();
    const price = document.getElementById('inp-price').value.trim(); 
    const descRaw = document.getElementById('inp-desc').value.trim();
    
    // Lấy giá trị từ input ẩn (đã chứa Base64 hoặc URL cũ)
    const image = document.getElementById('inp-image').value.trim() || "https://placehold.co/150x150?text=NoImage";
    
    const description = descRaw.replace(/\n/g, ' | ');

    if (!model || !id || !price) {
        alert("Vui lòng nhập đầy đủ Tên, ID và Giá!");
        return;
    }

    // --- TRUY CẬP HÀM QUA GLOBAL ---
    // Vì findBrandByName không được expose, ta định nghĩa lại nó một lần nữa 
    // (hoặc chỉ cần gán globalJsonData ở phạm vi toàn cục là đủ)
    const findBrandByName = (name) => globalJsonData.product.brand.find(b => b.name === name);
    const brandName = currentViewingBrandName; 
    const brand = findBrandByName(brandName);

    if (!brand) {
        alert("Lỗi: Không xác định được loại sản phẩm hiện tại.");
        return;
    }

    if (!brand[type]) brand[type] = [];

    if (isEditingMode) {
        // --- LOGIC SỬA DỮ LIỆU (Giữ nguyên) ---
        const product = brand[currentEditType][currentEditIndex];
        if (product) {
            product.model = model;
            product.price = price; 
            product.description = description;
            product.image = image; // Lưu chuỗi Base64
            alert("Cập nhật thành công!");
        }
    } else {
        // --- LOGIC THÊM MỚI DỮ LIỆU (Giữ nguyên) ---
        const isDuplicate = brand[type].some(p => p.id === id);
        if (isDuplicate) {
            alert("Lỗi: Mã sản phẩm (ID) này đã tồn tại trong loại này!");
            return;
        }

        const newProduct = {
            id: id,
            model: model,
            price: price,
            image: image, // Lưu chuỗi Base64
            description: description,
            status: "hien"
        };
        brand[type].push(newProduct);
        alert("Thêm mới thành công!");
    }

    // 3. LƯU VÀ RENDER LẠI GIAO DIỆN

    // GỌI HÀM LƯU ĐÃ ĐƯỢC EXPOSE
    if (window.saveDataToLocalStorageGlobal) {
        window.saveDataToLocalStorageGlobal();
    }
    
    if (!isEditingMode) {
         currentProductPage = Math.ceil((brand[type].length) / productsPerPage);
    }
    
    // GỌI HÀM TÁI TẠO DANH SÁCH ĐÃ ĐƯỢC EXPOSE
    if (window.recompileProductListGlobal) {
        window.recompileProductListGlobal(brand);
    } else {
        // Fallback (Nếu không gán kịp, dù không nên)
        console.error("Không thể cập nhật UI vì recompileProductListGlobal chưa được định nghĩa.");
    }

    closeProductForm();
};

// ===================================
// --- KẾT THÚC HÀM MODAL FORM MỚI ---
// ===================================


window.loadAdminProductPage = () => {
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
    
    // <--- ĐÃ SỬA: THÊM 'phukienkhac' VÀO DANH SÁCH NÀY ĐỂ CODE QUÉT ĐƯỢC DỮ LIỆU CỦA BRAND TÙY CHỈNH --->
    const productTypes = ['laptop', 'balo', 'de-tan-nhiet','chuot','ban-phim','tai-nghe', 'phukienkhac']; 

    // --- HÀM TIỆN ÍCH CHUYỂN ĐỔI TÊN TIẾNG VIỆT (ĐÃ THÊM MỚI) ---
    const getname = (englishName) => {
        switch (englishName) {
            case 'laptop':
                return 'Laptop';
            case 'balo':
                return 'Balo';
            case 'de-tan-nhiet':
                return 'Đế tản nhiệt';
            case 'chuot':
                return 'Chuột';
            case 'ban-phim':
                return 'Bàn phím';
            case 'tai-nghe':
                return 'Tai nghe';
            case 'phukienkhac':  // <--- ĐÃ SỬA: Thêm case cho phụ kiện khác
                return 'Khác';
            default:
                return englishName; // Giữ nguyên nếu không tìm thấy
        }
    };
    
    // Tính tổng số lượng sản phẩm
    const calculateProductCount = (brand) => {
    let count = 0;
    for (const type of productTypes) {
        if (Array.isArray(brand[type])) { //kiem tra trong cac mang loai san pham, neu co sp thi +
            count += brand[type].length;
        }
    }
    return count;
};
    // --- HÀM TIỆN ÍCH CẬP NHẬT HEADER CHUNG ---
const updatePageTitle = (newTitle) => {
    const mainTitle = document.getElementById('main-page-title'); 
    if (mainTitle) {
        mainTitle.innerHTML = newTitle;
    } else {
        console.warn("Lỗi: Không tìm thấy element có ID 'main-page-title'. Vui lòng kiểm tra admin.js.");
    }
};
    
     // --- EVENT LISTENER CHO FILE UPLOAD (THÊM MỚI) ---
    const imgFileInput = document.getElementById('inp-image-file');
    const imgHiddenInput = document.getElementById('inp-image');
    const imgPreview = document.getElementById('image-preview');

    if (imgFileInput) {
        imgFileInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                // Kiểm tra file có phải là ảnh không
                if (!file.type.startsWith('image/')) {
                    alert("Vui lòng chọn file hình ảnh!");
                    return;
                }
                
                const reader = new FileReader();
                reader.onload = function(event) {
                    // Hiển thị preview
                    imgPreview.src = event.target.result;
                    imgPreview.style.display = 'block';
                    // Lưu Base64 vào input ẩn
                    imgHiddenInput.value = event.target.result;
                };
                // Đọc file dưới dạng DataURL (Base64)
                reader.readAsDataURL(file);
            }
        });
    }

    // --- CÁC HÀM LOCAL STORAGE (ĐÃ CẬP NHẬT) ---
    // Key cho trang products.js (dùng mảng flat đã chuẩn hóa)
    const MAIN_PRODUCTS_KEY = 'laptopProducts'; 
    // Key riêng cho trang Admin (dùng object nested gốc)
    const ADMIN_DATA_KEY = 'adminProductData'; 

    /**
     * Lưu dữ liệu vào Local Storage.
     * 1. Lưu cấu trúc object NESTED (globalJsonData) vào ADMIN_DATA_KEY cho trang admin.
     * 2. Chuyển đổi sang cấu trúc mảng FLAT (dùng normalizeData) và lưu vào MAIN_PRODUCTS_KEY cho trang products.js.
     */
    function saveDataToLocalStorage() {
        try {
            // 1. Lưu dữ liệu NESTED (dạng object) cho trang Admin
            localStorage.setItem(ADMIN_DATA_KEY, JSON.stringify(globalJsonData));
            
            // 2. Chuẩn hóa và lưu dữ liệu FLAT (dùng normalizeData) cho trang products.js
            const normalizedProducts = normalizeData(globalJsonData);
            localStorage.setItem(MAIN_PRODUCTS_KEY, JSON.stringify(normalizedProducts));

            console.log("✅ Đã lưu dữ liệu (Nested) vào Admin và (Flat) vào Main Products.");

        } catch (error) {
            console.error("❌ Lỗi khi lưu dữ liệu vào Local Storage:", error);
        }
    }
    
    /**
     * Tải dữ liệu từ Local Storage.
     * Chỉ tải dữ liệu NESTED từ ADMIN_DATA_KEY để trang admin hoạt động.
     * Trang products.js sẽ tự tải từ MAIN_PRODUCTS_KEY.
     */
    function loadDataFromLocalStorage() {
        try {
            // Chỉ tải dữ liệu NESTED của Admin
            const savedData = localStorage.getItem(ADMIN_DATA_KEY);
            if (savedData) {
                const parsedData = JSON.parse(savedData);
                // Kiểm tra cấu trúc dữ liệu
                if (parsedData?.product?.brand) {
                    globalJsonData = parsedData;
                    console.log("✅ Tải dữ liệu (Nested) từ Admin Storage thành công.");
                    return true;
                }
            }
        } catch (error) {
            console.error("❌ Lỗi khi tải dữ liệu (Nested) từ Admin Storage:", error);
        }
        console.log("Không tìm thấy dữ liệu Admin, sử dụng dữ liệu tĩnh.");
        return false;
    }

    // --- HÀM TẢI DỮ LIỆU TĨNH ---
    function loadStaticData() {
        try {
            // Thử tải từ ADMIN_DATA_KEY
            if (loadDataFromLocalStorage()) {
                // Tải thành công
            } else {
                console.log("Sử dụng dữ liệu tĩnh (static).");
                // Lưu dữ liệu tĩnh vào Local Storage lần đầu
                // saveDataToLocalStorage() giờ sẽ lưu vào cả 2 key
                saveDataToLocalStorage();
            }

            if (globalJsonData?.product?.brand) {
                renderBrands();
            } else {
                DOM.tableBody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: red;">Lỗi tải dữ liệu. Cấu trúc dữ liệu không hợp lệ.</td></tr>`;
            }
        } catch (err) {
            console.error("❌ Lỗi khi tải dữ liệu:", err);
            DOM.tableBody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: red;">Lỗi khi render dữ liệu.</td></tr>`;
        }
    }
    // --- HÀM TẠO NÚT PHÂN TRANG (da sua lai logic) ---
    const createButton = (page, currentPage, onPageChangeCallback) => {
        const button = document.createElement('button');
        button.classList.add('page-btn');
        button.textContent = page.toString();
        if (page === currentPage) button.classList.add('active');
        button.onclick = () => onPageChangeCallback(page);
        return button;
    };

    // --- HÀM TẠO PHÂN TRANG ---
   function createPagination(totalItems, itemsPerPage, currentPage, pageContainer, onPageChangeCallback) {
    if (!pageContainer) return;
    const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
    pageContainer.innerHTML = '';

    if (totalPages <= 1) return;
    if (currentPage > totalPages) currentPage = totalPages;
    let startPage = Math.max(1, currentPage - 1);
    let endPage = Math.min(totalPages, currentPage + 1);
    const maxPagesToShow = 3;
    if (totalPages > maxPagesToShow) {
        if (currentPage === 1) { 
            startPage = 1;
            endPage = Math.min(totalPages, maxPagesToShow);
        } else if (currentPage === totalPages) {
            startPage = Math.max(1, totalPages - (maxPagesToShow - 1));
            endPage = totalPages;
        } else {
            startPage = Math.max(1, currentPage - 1);
            endPage = Math.min(totalPages, currentPage + 1);
        }
    } else {
        startPage = 1;
        endPage = totalPages;
    }
    if (startPage > 1) {
        pageContainer.appendChild(createButton(1, currentPage, onPageChangeCallback)); 
        if (startPage > 2) {
            const dots = document.createElement('span');
            dots.textContent = '...';
            pageContainer.appendChild(dots);
        }
    }
    for (let i = startPage; i <= endPage; i++) {
        pageContainer.appendChild(createButton(i, currentPage, onPageChangeCallback));
    }
    if (endPage < totalPages) {
        // Dấu ...
        if (endPage < totalPages - 1) {
            const dots = document.createElement('span');
            dots.textContent = '...';
            pageContainer.appendChild(dots);
        }
        // Nút Trang cuối
        pageContainer.appendChild(createButton(totalPages, currentPage, onPageChangeCallback));
    }
}
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
            
            // DÒNG ĐÃ SỬA: Ưu tiên displayName, nếu không có thì dùng tên ánh xạ từ getname
            const vietnameseBrandName = brand.displayName || getname(brandName);
            
            const originalIndex = globalJsonData.product.brand.findIndex(b => b.name === brandName);

            const newRow = DOM.tableBody.insertRow();
            newRow.dataset.brandName = brandName;
            newRow.dataset.viewMode = 'false';
            newRow.dataset.id = originalIndex + 1;

            newRow.innerHTML = `
                <td>${originalIndex + 1}</td> <td class="brand-name-cell">${vietnameseBrandName}</td>
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
                        <a href="#" onclick="editBrand('${brandName}', this); return false;"><i class="fas fa-edit", style="color:black"></i> </a>
                        
                    </div>
                </td>
            `;
        });

        createPagination(totalBrands, brandsPerPage, currentBrandPage, DOM.brandPaginationContainer, (newPage) => {
            currentBrandPage = newPage;
            renderBrands(filteredBrands);
        });
    }
    
    // --- HÀM LÀM MỚI DANH SÁCH SẢN PHẨM ---
    window.refreshCurrentProductList = () => {
        if (!currentViewingBrandName) {
            console.warn("Chưa có loại sản phẩm nào được chọn.");
            return;
        }
        
        // 1. Reset ô tìm kiếm
        DOM.brandSearchInput.value = '';
        
        // 2. Reset danh sách sản phẩm đã lọc
        filteredProductsList = [];
        
        // 3. Reset về trang đầu tiên
        // Giữ nguyên trang hiện tại để tiện cho người dùng theo dõi
        // currentProductPage = 1; 
        
        // 4. Gọi lại hàm hiển thị
        window.showProductsForCurrentPage(currentViewingBrandName);
        
        console.log(`Đã làm mới danh sách sản phẩm cho loại: ${getname(currentViewingBrandName)}`);
    };

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
            const targetBrand = findBrandByName(brandName);
            // Lấy tên hiển thị: ưu tiên displayName nếu có
            const vietnameseBrandName = targetBrand.displayName || getname(brandName); 
            
            productsToRender.forEach((product, localIndex) => {
                const isVisible = (product.status || 'an').toLowerCase().trim() === 'hien';
                const statusText = isVisible ? "Hiển thị" : "Đã ẩn";
                const eyeIcon = isVisible ? "fas fa-eye" : "fas fa-eye-slash";
                
                // Áp dụng hàm ánh xạ cho tên loại sản phẩm (type)
                const vietnameseType = getname(product.type); 
                const productTypeDisplay = product.type === 'laptop' ? '' : ` (${vietnameseType})`; 
                
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
                            <div class="sp-product-brand">${vietnameseBrandName}${productTypeDisplay}</div>
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
                `Không tìm thấy sản phẩm nào khớp với từ khóa "${searchTerm}" cho loại sản phẩm ${getname(brandName)}.` :
                `Không tìm thấy sản phẩm nào cho loại sản phẩm ${getname(brandName)}.`;
            DOM.productListTbody.innerHTML = `<tr><td colspan="5" style="text-align: center;">${message}</td></tr>`;
        }

        createPagination(totalProducts, productsPerPage, currentProductPage, DOM.productPaginationContainer, (newPage) => {
            currentProductPage = newPage;
            showProductsForCurrentPage(brandName);
        });
    };

    // GỘP TẤT CẢ SẢN PHẨM VÀ HIỂN THỊ
    window.showProductDetails = (brandName) => {
        currentViewingBrandName = brandName;
        currentProductPage = 1;
        filteredProductsList = []; // Reset danh sách lọc khi chuyển loại sản phẩm
        updatePageTitle(`Sản phẩm`);
        DOM.productDetailsArea.style.display = 'block';
        DOM.productPaginationContainer.style.display = 'flex';
        DOM.brandManagementArea.style.display = 'none';

        const targetBrand = findBrandByName(brandName);

        if (targetBrand) {
            currentProductsList = productTypes.flatMap(type => {
                return (Array.isArray(targetBrand[type]) ? targetBrand[type] : []).map((p, index) => ({...p, type: type, originalIndex: index}));
            });
            showProductsForCurrentPage(brandName);
            
            // BẮT ĐẦU TỰ ĐỘNG LÀM MỚI (AUTO-REFRESH)
            // Dừng interval cũ nếu có
            if (autoRefreshIntervalId) clearInterval(autoRefreshIntervalId);
            
            // Thiết lập interval mới (ví dụ: 60000ms = 60 giây)
            autoRefreshIntervalId = setInterval(() => {
                console.log("Auto-refreshing product list...");
                window.refreshCurrentProductList(); 
            }, 20000); // Tự động làm mới sau mỗi 60 giây
            
        } else {
             DOM.productListTbody.innerHTML = `<tr><td colspan="5" style="text-align: center;">Không tìm thấy loại sản phẩm ${getname(brandName)}.</td></tr>`;
        }
    };


    // --- CÁC HÀM THAO TÁC DỮ LIỆU ---

    window.deleteBrand = (brandName, btn) => {
        const row = btn.closest('tr');
        if (row.dataset.viewMode === 'true') return;

        const index = findBrandIndexByName(brandName);
        if (index !== -1 && confirm(`Bạn có chắc muốn xóa Loại sản phẩm: ${getname(brandName)} không?`)) {
            globalJsonData.product.brand.splice(index, 1);
            const totalBrands = globalJsonData.product.brand.length;
            const totalPages = Math.ceil(totalBrands / brandsPerPage);
            if (currentBrandPage > totalPages && totalBrands > 0) currentBrandPage = totalPages;
            else if (totalBrands === 0) currentBrandPage = 1;
            renderBrands();
            saveDataToLocalStorage(); // Lưu thay đổi
        }
    };

    window.toggleBrandStatus = (brandName, isChecked) => {
        const brand = findBrandByName(brandName);
        if (brand) {
            brand.status = isChecked ? 'active' : 'inactive';
            saveDataToLocalStorage(); // Lưu thay đổi
        }
    };

    window.editBrand = (brandName, link) => {
        const row = link.closest('tr');
        if (row.dataset.viewMode === 'true') return false;

        const brand = findBrandByName(brandName);

        if (brand) {
            const currentDisplayName = brand.displayName || getname(brand.name);
            DOM.formHeader.textContent = `CHỈNH SỬA LOẠI SẢN PHẨM: ${currentDisplayName.toUpperCase()}`; 
            
            DOM.tenInput.value = currentDisplayName;
            DOM.soLuongInput.value = calculateProductCount(brand);

            DOM.submitBtn.textContent = 'Cập nhật';
            editingRow = row;
        }

        link.closest('.dropdown-content').style.display = 'none';
        return false;
    };

    DOM.submitBtn.addEventListener('click', () => {
        const ten = DOM.tenInput.value.trim(); // Lấy tên mới người dùng nhập vào
        if (!ten) return alert('Vui lòng nhập Tên loại sản phẩm hợp lệ!');

        if (editingRow) {
            // --- LOGIC SỬA TÊN HIỂN THỊ (EDIT) ---
            const originalBrandName = editingRow.dataset.brandName; 
            const brand = findBrandByName(originalBrandName);

            if (brand) {
                // DÒNG CẬP NHẬT MỚI: Lưu tên hiển thị tùy chỉnh vào thuộc tính displayName
                brand.displayName = ten; 
                
                // Cập nhật tên hiển thị trong bảng bằng TÊN MỚI NHẬP VÀO
                editingRow.querySelector('.brand-name-cell').textContent = ten;

                // Log thông báo
                console.log(`Đã cập nhật tên hiển thị (displayName) và lưu lại: "${ten}". Tên ID gốc ("${originalBrandName}") không đổi.`);
            }
        } else {
            // --- LOGIC THÊM MỚI ---
            // Thêm thuộc tính displayName để hiển thị tên tiếng Việt mặc định
            const newBrand = { 
                "name": ten, 
                "status": "active", 
                "laptop": [], 
                "balo": [], 
                "de-tan-nhiet": [], 
                "chuot": [], 
                "ban-phim": [], 
                "tai-nghe": [],
                "phukienkhac": [], // <--- ĐÃ SỬA: Thêm sẵn mảng này
                "displayName": getname(ten) // Thêm displayName mặc định
            };
            globalJsonData.product.brand.push(newBrand);
            currentBrandPage = Math.ceil(globalJsonData.product.brand.length / brandsPerPage);
            renderBrands();
        }
        
        resetForm();
        saveDataToLocalStorage(); // Lưu thay đổi (bao gồm cả displayName mới)
    });

    // --- CÁC HÀM KHÁC ---
    //ham quay lai loai san pham
    window.hideProductDetails = () => {
        updatePageTitle('Loại sản phẩm');
        DOM.productDetailsArea.style.display = 'none';
        DOM.productPaginationContainer.style.display = 'none';
        DOM.brandManagementArea.style.display = 'block';
        DOM.brandSearchInput.value = '';
        filterBrands('');
        
        // DỪNG TỰ ĐỘNG LÀM MỚI (AUTO-REFRESH)
        if (autoRefreshIntervalId) {
            clearInterval(autoRefreshIntervalId);
            autoRefreshIntervalId = null;
            console.log("Đã dừng auto-refresh.");
        }
        
        currentViewingBrandName = null;
        currentProductPage = 1;
        currentProductsList = [];
        filteredProductsList = [];
    };
    window.saveDataToLocalStorageGlobal = saveDataToLocalStorage;
    
    const recompileProductList = (brand) => {
        currentProductsList = productTypes.flatMap(type => {
            return (Array.isArray(brand[type]) ? brand[type] : []).map((p, index) => ({...p, type: type, originalIndex: index}));
        });
        filteredProductsList = [];
        showProductsForCurrentPage(currentViewingBrandName);
        renderBrands(); // Cập nhật số lượng Brand
    };
    window.recompileProductListGlobal = recompileProductList;

    window.deleteProduct = (brandName, type, index, btn) => {
        const brand = findBrandByName(brandName);
        const product = brand?.[type]?.[index];

        if (product && confirm(`Bạn có chắc muốn xóa Sản phẩm "${product.model}" không?`)) {
            brand[type].splice(index, 1);
            recompileProductList(brand);
            saveDataToLocalStorage(); // Lưu thay đổi
        }
    };

    // <--- HÀM editProduct GỌI MODAL FORM MỚI --->
    window.editProduct = (brandName, type, index) => {
        const brand = findBrandByName(brandName);
        const product = brand?.[type]?.[index];
        if (!product) return alert("Lỗi: Không tìm thấy sản phẩm để chỉnh sửa.");
        
        // GỌI FORM MODAL MỚI
        openProductForm('edit', product, brandName, type, index);
    };

    window.toggleProductStatus = (brandName, type, index, btn) => {
        const brand = findBrandByName(brandName);
        const product = brand?.[type]?.[index];

        if (product) {
            product.status = (product.status === 'hien') ? 'an' : 'hien';
            saveDataToLocalStorage(); 
            if (window.recompileProductListGlobal) window.recompileProductListGlobal(brand);
        }
    };

    // <--- HÀM addNewProduct GỌI MODAL FORM MỚI --->
    window.addNewProduct = () => {
        if (!currentViewingBrandName) return alert("Vui lòng chọn một Loại sản phẩm để xem chi tiết trước khi thêm.");
        // GỌI FORM MODAL MỚI
        openProductForm('add');
    };

    // HÀM LỌC BRAND (Loại sản phẩm)
    function filterBrands(searchTerm) {
        const term = searchTerm.toLowerCase().trim();
        const filtered = [];
        
        for (let i = 0; i < globalJsonData.product.brand.length; i++) {
            const brand = globalJsonData.product.brand[i];
            const brandName = (brand.name || '').toLowerCase();
            const displayName = (getname(brand.name) || '').toLowerCase(); // Lọc bằng tên tùy chỉnh

            if (brandName.includes(term) || displayName.includes(term)) {
                filtered.push(brand);
            }
        }
        
        currentBrandPage = 1;
        renderBrands(filtered);
    }
    // HÀM LỌC PRODUCT
    function filterProducts(searchTerm) {
    const term = searchTerm.toLowerCase().trim();
    const searchInput = document.getElementById('searchTermInput'); 
    let noResultsDiv = document.getElementById('no-results-message');
    if (!noResultsDiv) {
        noResultsDiv = document.createElement('div');
        noResultsDiv.id = 'no-results-message';
        if (searchInput && searchInput.parentNode) {
            searchInput.parentNode.insertBefore(noResultsDiv, searchInput);
        } else {
            document.body.appendChild(noResultsDiv);
        }
    }
    if (!term) {
        filteredProductsList = []; 
        // Ẩn thông báo nếu input trống
        if (noResultsDiv) noResultsDiv.style.display = 'none';
    } else {
        let tempFilteredProductsList = [];    
        // --- Logic Lọc Sản Phẩm ---
        for (let i = 0; i < currentProductsList.length; i++) {
            const product = currentProductsList[i];
            const model = (product.model || '').toLowerCase();
            const id = (product.id || '').toLowerCase();
            if (model.includes(term) || id.includes(term))  tempFilteredProductsList.push(product);
        }
        filteredProductsList = tempFilteredProductsList;
        if (filteredProductsList.length === 0) {
            if (noResultsDiv) {
                noResultsDiv.innerHTML = `Không tìm thấy sản phẩm nào khớp với từ khóa: <b>${searchTerm}</b>`;
                noResultsDiv.style.display = 'block'; 
                noResultsDiv.style.padding = '15px';
                noResultsDiv.style.margin = '15px 0';
                noResultsDiv.style.border = '1px solid #f5c6cb';
                noResultsDiv.style.backgroundColor = '#f8d7da';
                noResultsDiv.style.color = '#721c24';
                noResultsDiv.style.borderRadius = '5px';
                noResultsDiv.style.fontWeight = 'bold';
                noResultsDiv.style.textAlign = 'center';
            }
            if (searchInput) searchInput.value = '';
        } else {
            if (noResultsDiv) noResultsDiv.style.display = 'none';
        }
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


    window.closeModal = (event) => {
        if (event.target.id === 'detailsModal') event.target.style.display = "none";
    };

    // HÀM NÀY VẪN GIỮ PROMPT VÌ NÓ DÙNG ĐỂ SỬA ƯU ĐÃI CHUNG, KHÔNG PHẢI DỮ LIỆU SẢN PHẨM
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
        
        // Lấy tên hiển thị của brand hiện tại
        const brand = findBrandByName(row.dataset.brandName);
        const vietnameseBrandName = brand.displayName || getname(row.dataset.brandName);

        document.getElementById('detail-product-name').textContent = `${vietnameseBrandName} ${row.dataset.model}`;
        
        document.getElementById('detail-price').innerHTML = `Giá: <strong>${row.dataset.price}</strong> VNĐ`;
        document.getElementById('detail-status').textContent = `Tình trạng: ${row.dataset.statusText === 'Hiển thị' ? 'Còn hàng' : 'Hết hàng'}`;
        document.getElementById('detail-offer-content').textContent = currentOfferContent;
        document.getElementById('detail-product-image').src = row.dataset.image;
        const rawDescription = row.dataset.description || "Đang cập nhật...";
        const formattedDescription = rawDescription.replace(/ \| /g, '\n').replace(/\|/g, '\n'); // Thay thế " | " và "|"
    
    document.getElementById('detail-description-content').textContent = formattedDescription;
        modal.style.display = 'block';
    };

    window.viewProduct = (link) => {
        resetForm();
        
        const row = link.closest('tr');
        const isViewOnly = !(row.dataset.viewMode === 'true');
        row.dataset.viewMode = isViewOnly;
        row.classList.toggle("view-mode", isViewOnly);

        const deleteBtn = row.querySelector('.delete-btn-v2');
        const editLink = row.querySelector('.dropdown-content a:nth-child(2)');

//        deleteBtn.disabled = isViewOnly;
//        deleteBtn.style.opacity = isViewOnly ? "0.5" : "1";
//        deleteBtn.style.pointerEvents = isViewOnly ? "none" : "auto";
//
//        editLink.style.pointerEvents = isViewOnly ? "none" : "auto";
//        editLink.style.opacity = isViewOnly ? "0.5" : "1";
//
//        link.innerHTML = isViewOnly ? '<i class="fas fa-eye-slash"></i> Thoát xem' : '<i class="fas fa-eye"></i> Chỉ xem';
//        link.closest('.dropdown-content').style.display = 'none';

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
        // Vẫn gọi showProductDetails bằng tên không dấu (brandName) để logic chạy đúng
        if (brandNameCell) {
            // Lấy tên brand không dấu từ dataset của row cha
            const row = brandNameCell.closest('tr');
            if(row && row.dataset.brandName) {
                 showProductDetails(row.dataset.brandName);
            }
        }
    });

//    document.addEventListener('click', (e) => {
//        const target = e.target;
//
//        const isDropdownClick = target.closest('.dropdown');
//        if (!isDropdownClick) document.querySelectorAll('.dropdown-content').forEach(dc => dc.style.display = 'none');
//
//        if (target.classList.contains('dropdown-toggle')) {
//            const dropdownContent = target.nextElementSibling;
//            document.querySelectorAll('.dropdown-content').forEach(dc => {
//                if (dc !== dropdownContent) dc.style.display = 'none';
//            });
//
//            if (dropdownContent) {
//                dropdownContent.style.display = (dropdownContent.style.display === 'block') ? 'none' : 'block';
//            }
//        }
//    });
    loadStaticData();
};