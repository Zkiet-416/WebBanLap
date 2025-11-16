// === HÀM CHÍNH ĐƯỢC GỌI TỪ ADMIN.JS SAU KHI DÙNG innerHTML ===
window.loadStockPage = function() {
    
    // Lấy các thành phần DOM (Đã chuyển vào trong hàm để đảm bảo chúng tồn tại sau innerHTML)
    const thead = document.getElementById('inventory-thead');
    const tbody = document.getElementById('inventory-tbody');
    const lowStockList = document.getElementById('low-stock-list');
    const lookupButton = document.getElementById('lookup-button');
    const transactionTypeSelect = document.getElementById('transaction-type');
    const productSearchInput = document.getElementById('product-search-input'); 
    const startDateInput = document.getElementById('start-date'); 
    const endDateInput = document.getElementById('end-date'); 
    const paginationContainer = document.getElementById('pagination-container'); 

    // Biến toàn cục để lưu trữ tất cả giao dịch
    let allTransactions = [];
    // --- BIẾN PHÂN TRANG ---
    let itemsPerPage = 7; 
    let currentPage = 1;
    let currentDataSet = []; 
    
    const staticStockData = {
      "transactions": [
        {
          "id": 1,
          "name": "Laptop Acer Nitro V 15",
          "brand": "Acer",
          "img": "../assets/images/acer1.png",
          "date": "2024-09-15",
          "type": "nhap",
          "qty": 200
        },
        {
          "id": 2,
          "name": "Balo Asus ROG Archer",
          "brand": "Asus",
          "img": "../assets/images/balo1.png",
          "date": "2024-09-20",
          "type": "nhap",
          "qty": 100
        },
        {
          "id": 3,
          "name": "Chuột Logitech G502",
          "brand": "Logitech",
          "img": "../assets/images/mouse1.jpg",
          "date": "2024-09-25",
          "type": "nhap",
          "qty": 80
        },
        {
          "id": 4,
          "name": "Bàn phím cơ DareU EK87",
          "brand": "DareU",
          "img": "../assets/images/bp1.png",
          "date": "2024-09-28",
          "type": "nhap",
          "qty": 20
        },
        {
          "id": 1,
          "name": "Laptop Acer Nitro V 15",
          "brand": "Acer",
          "img": "../assets/images/acer1.png",
          "date": "2024-10-01",
          "type": "xuat",
          "qty": 20
        },
        {
          "id": 2,
          "name": "Balo Asus ROG Archer",
          "brand": "Asus",
          "img": "../assets/images/balo2.png",
          "date": "2024-10-05",
          "type": "xuat",
          "qty": 30
        },
        {
          "id": 1,
          "name": "Laptop Acer Nitro V 15",
          "brand": "Acer",
          "img": "../assets/images/acer1.png",
          "date": "2024-10-10",
          "type": "xuat",
          "qty": 20
        },
        {
          "id": 3,
          "name": "Chuột Logitech G502",
          "brand": "Logitech",
          "img": "../assets/images/mouse2.jpg",
          "date": "2024-10-11",
          "type": "xuat",
          "qty": 5
        },
        {
          "id": 4,
          "name": "Bàn phím cơ DareU EK87",
          "brand": "DareU",
          "img": "../assets/images/bp2.jpg",
          "date": "2024-10-15",
          "type": "xuat",
          "qty": 10
        },
        {
          "id": 2,
          "name": "Balo Asus ROG Archer",
          "brand": "Asus",
          "img": "../assets/images/balo2.png",
          "date": "2024-10-20",
          "type": "nhap",
          "qty": 50
        },
        {
          "id": 1,
          "name": "Laptop Acer Nitro V 15",
          "brand": "Acer",
          "img": "../assets/images/acer1.png",
          "date": "2024-10-22",
          "type": "nhap",
          "qty": 10
        },
        {
          "id": 3,
          "name": "Chuột Logitech G502",
          "brand": "Logitech",
          "img": "../assets/images/mouse2.jpg",
          "date": "2024-10-25",
          "type": "xuat",
          "qty": 60
        },
        {
          "id": 1,
          "name": "Laptop Acer Nitro V 15",
          "brand": "Acer",
          "img": "../assets/images/acer1.png",
          "date": "2024-10-28",
          "type": "xuat",
          "qty": 15
        },
        {
          "id": 2,
          "name": "Balo Asus ROG Archer",
          "brand": "Asus",
          "img": "../assets/images/balo2.png",
          "date": "2024-11-01",
          "type": "xuat",
          "qty": 10
        },
        {
          "id": 4,
          "name": "Bàn phím cơ DareU EK87",
          "brand": "DareU",
          "img": "../assets/images/bp2.jpg",
          "date": "2024-11-03",
          "type": "xuat",
          "qty": 10
        },
        {
          "id": 1,
          "name": "Laptop Acer Nitro V 15",
          "brand": "Acer",
          "img": "../assets/images/acer1.png",
          "date": "2024-11-05",
          "type": "nhap",
          "qty": 5
        }
      ]
    };
    
    // --- HÀM TÌM MAX ID ---
    function findMaxId(transactions) {
        if (!transactions || transactions.length === 0) {
            return 0;
        }
        // Dùng Math.max để tìm ID lớn nhất, đảm bảo ID là số nguyên
        return Math.max(...transactions.map(t => parseInt(t.id) || 0));
    }
    // --- KẾT THÚC HÀM TÌM MAX ID ---

    //ĐỌC DỮ LIỆU PHIẾU NHẬP TỪ LOCAL STORAGE
    /**
     * Tải và chuyển đổi dữ liệu phiếu nhập từ Local Storage (receipt.js)
     * thành các giao dịch 'nhap' để bổ sung vào kho.
     */
    function loadReceiptsFromLocalStorage(staticTransactions) { 
    const INVOICE_STORAGE_KEY = 'receiptData'; 
    let receiptTransactions = [];
    
    // *** 1. TÌM MAX ID VÀ THIẾT LẬP NEXT ID ***
    let maxExistingId = findMaxId(staticTransactions);
    let transactionIdCounter = maxExistingId + 1; 

    try {
        const rawData = localStorage.getItem(INVOICE_STORAGE_KEY);
        if (!rawData) return [];

        const invoices = JSON.parse(rawData);

        if (!Array.isArray(invoices)) return [];


        invoices.forEach(invoice => {
            const invoiceDate = invoice.date || new Date().toISOString().slice(0, 10);
            
            if (invoice.products && Array.isArray(invoice.products)) {
                invoice.products.forEach((product) => {
                    // *** 2. GÁN NEXT ID VÀO GIAO DỊCH NHẬP ***
                    receiptTransactions.push({
                        id: transactionIdCounter++, // Gán ID mới tăng dần
                        name: product.name || 'Sản phẩm mới nhập',
                        brand: 'Đã nhập (LS)', 
                        img: product.imagePath || 'https://via.placeholder.com/50/4CAF50/FFFFFF?text=R', 
                        date: invoiceDate,
                        type: 'nhap',
                        qty: parseInt(product.qty) || 0
                    });
                });
            }
        });

    } catch (error) {
        console.error("Lỗi khi đọc Local Storage của phiếu nhập:", error);
        return [];
    }

    return receiptTransactions;
}
    /**
     * Tải và chuyển đổi dữ liệu sản phẩm từ Local Storage ('adminproductdata')      new ver->doc proudcts.js
     * thành các giao dịch 'ton kho' ban đầu.
     * * ĐÃ SỬA: Key và Logic duyệt cấu trúc lồng nhau.
     * LƯU Ý: Dữ liệu không có trường 'stockQuantity', nên QTY mặc định = 1.
     */
    function loadAdminProductsAsInitialStock(transactionsForIdCheck) {
        const PRODUCT_STORAGE_KEY = 'laptopProducts'; // Key đúng: Chứa mảng các sản phẩm đã chuẩn hóa
        let initialStockTransactions = [];
        
        // Không cần dùng transactionIdCounter vì ta sẽ dùng product.id (ID đã chuẩn hóa) làm ID giao dịch
        // để đảm bảo tính toán tồn kho cho từng mẫu sản phẩm chi tiết.

        try {
            const rawData = localStorage.getItem(PRODUCT_STORAGE_KEY);
            if (!rawData) return [];

            const productsArray = JSON.parse(rawData);
            
            // 1. SỬA LỖI KIỂM TRA CẤU TRÚC: Phải là mảng các sản phẩm đã chuẩn hóa
            if (!Array.isArray(productsArray)) {
                console.warn("Dữ liệu sản phẩm không phải là mảng chuẩn hóa. Bỏ qua khởi tạo tồn kho ban đầu.");
                return [];
            }

            // 2. Đặt ngày rất cũ để đảm bảo nó là giao dịch sớm nhất (TỒN BAN ĐẦU)
            const initialDate = '2000-01-01';
            
            // Lặp qua MẢNG CÁC SẢN PHẨM ĐÃ CHUẨN HÓA
            productsArray.forEach(product => {
                
                // Bỏ qua sản phẩm bị ẩn (status: 'an')
                if (product.status === 'an') return; 
                
                const initialQty = 1; // Giả định tồn ban đầu là 1
                
                if (initialQty > 0) {
                    initialStockTransactions.push({
                        // Sử dụng ID ĐÃ CHUẨN HÓA làm ID giao dịch để tính toán tồn kho chi tiết
                        id: product.id, 
                        name: product.model || product.id || 'Sản phẩm không tên',
                        // Dùng 'type' (categoryName đã chuẩn hóa: 'laptop', 'de-tan-nhiet'...)
                        brand: product.type.toUpperCase() || 'CHƯA RÕ (LS)',
                        img: product.image || 'https://via.placeholder.com/50/FF9800/FFFFFF?text=P',
                        date: initialDate,
                        type: 'nhap',
                        qty: product.qty
                    });
                }
            });

        } catch (error) {
            console.error("Lỗi khi đọc Local Storage của sản phẩm ('laptopProducts'):", error);
            return [];
        }

        return initialStockTransactions;
    }
    
        function loadSaleTransactionsFromOrderHistory(transactionsForIdCheck) {
        const ORDER_HISTORY_KEY = 'orderHistory'; 
        let orderSaleTransactions = [];

        // Tìm ID lớn nhất hiện có để đảm bảo ID giao dịch mới không bị trùng
        let maxExistingId = findMaxId(transactionsForIdCheck);
        let transactionIdCounter = maxExistingId + 1; 

        try {
            const rawData = localStorage.getItem(ORDER_HISTORY_KEY);
            if (!rawData) return [];

            const orderHistory = JSON.parse(rawData);

            // Giả sử 'orderHistory' là một mảng các đơn hàng
            if (!Array.isArray(orderHistory)) return [];

            orderHistory.forEach(order => {
                // Chỉ xử lý các đơn hàng đã thanh toán/hoàn thành (tùy thuộc vào cấu trúc dữ liệu của bạn, tôi giả định trạng thái là 'paid' hoặc 'completed')
                // Nếu không có trường status, bạn có thể bỏ qua điều kiện này.
                // if (order.status !== 'completed' && order.status !== 'paid') return; 

                const saleDate = order.date || new Date().toISOString().slice(0, 10);

                if (order.items && Array.isArray(order.items)) {
                    order.items.forEach((item) => {
                        // Gán ID mới tăng dần và tạo giao dịch xuất
                        orderSaleTransactions.push({
                            id: transactionIdCounter++, // Gán ID mới
                            name: item.name || 'Sản phẩm bán ra',
                            brand: 'Đã bán (LS)', // Ghi rõ nguồn gốc
                            img: item.image || 'https://via.placeholder.com/50/DC3545/FFFFFF?text=O', // Ảnh đại diện cho Xuất
                            date: saleDate,
                            type: 'xuat', // Loại giao dịch là XUẤT
                            qty: parseInt(item.qty) || 0 // Số lượng bán
                        });
                    });
                }
            });

        } catch (error) {
            console.error("Lỗi khi đọc Local Storage của lịch sử đơn hàng:", error);
            return [];
        }

        return orderSaleTransactions;
    }
    //  CÁC HÀM TÍNH TOÁN VÀ HIỂN THỊ
    /**
 * Tính toán số lượng tồn kho cuối cùng cho mỗi sản phẩm.
 */
function calculateStock(transactions) {
    const stock = new Map();

    transactions.forEach(t => {
        // 1. Dùng t.name làm key để nhóm sản phẩm (như cấu trúc hiện tại của bạn)
        // LƯU Ý: Nếu bạn có nhiều sản phẩm cùng tên (nhưng khác SKU/ID), chúng sẽ bị gộp.
        // Nếu muốn tồn kho chính xác theo SKU, hãy đổi thành const key = t.id;
        const key = t.name; 

        // 2. ÉP KIỂU SỐ LƯỢNG (QUAN TRỌNG)
        // Đây là bước khắc phục lỗi "2" + 2 = "22"
        const quantity = parseInt(t.qty); 

        // Bỏ qua giao dịch nếu số lượng không hợp lệ hoặc không phải là số
        if (isNaN(quantity) || quantity < 0) return; 

        // 3. Khởi tạo đối tượng tồn kho nếu chưa có
        if (!stock.has(key)) {
            stock.set(key, {
                id: t.id,
                name: t.name,
                brand: t.brand,
                img: t.img,
                // Khởi tạo qty là số 0
                qty: 0 
            });
        }

        let currentStockItem = stock.get(key);
        let currentQty = currentStockItem.qty;

        // 4. Cập nhật số lượng tồn kho (SỬ DỤNG PHÉP CỘNG SỐ)
        if (t.type === 'nhap') {
            currentQty += quantity; // Cộng số
        } else if (t.type === 'xuat') {
            currentQty -= quantity; // Trừ số
        }

        // Cập nhật lại đối tượng trong Map
        currentStockItem.qty = currentQty;
        stock.set(key, currentStockItem);
    });

    // Trả về một mảng chứa tất cả các đối tượng tồn kho
    return Array.from(stock.values());
}

    /**
     * Cập nhật tiêu đề bảng dựa trên loại tra cứu (Tồn, Nhập, Xuất)
     */
    function updateTableHeader(type) {
        if (!thead) return; // Bảo vệ
        if (type === 'ton') {
            thead.innerHTML = `
                <tr>
                    <th style="width: 8%">ID</th>
                    <th style="width: 47%">Tên / Loại Sản Phẩm</th> 
                    <th style="width: 20%">Số lượng tồn</th>
                    <th style="width: 25%">Tình trạng</th>
                </tr>
            `;
        } else {
            // Dùng cho 'nhap' và 'xuat'
            thead.innerHTML = `
                <tr>
                    <th style="width: 8%">ID</th>
                    <th style="width: 37%">Tên / Loại Sản Phẩm</th> 
                    <th style="width: 20%">Ngày</th>
                    <th style="width: 15%">Loại</th>
                    <th style="width: 20%">Số lượng</th>
                </tr>
            `;
        }
    }
    
    /**
     * Hiển thị dữ liệu cho trang hiện tại lên bảng chính (Đã Cập Nhật để dùng cho phân trang)
     */
    function renderTablePage(data) {
        if (!tbody || !transactionTypeSelect) return; 
        const transactionType = transactionTypeSelect.value;
        tbody.innerHTML = ''; // Xóa nội dung cũ
        
        const colspan = (transactionType === 'ton') ? 4 : 5;

        if (data.length === 0) {
            tbody.innerHTML = `<tr><td colspan="${colspan}" style="text-align:center;">Không tìm thấy dữ liệu.</td></tr>`;
            return;
        }

        let htmlContent = '';
        data.forEach(p => {
            if (transactionType === 'ton') {
                // Logic hiển thị tồn kho
                let statusClass = 'status normal';
                let statusText = 'Bình thường';

                if (p.qty <= 10) {
                    statusClass = 'status warning';
                    statusText = 'Cảnh báo';
                } else if (p.qty <= 30) {
                    statusClass = 'status low';
                    statusText = 'Sắp hết';
                }

                htmlContent += `
                  <tr>
                    <td><b>${p.id}</b></td>
                    <td>
                      <div class="product-info">
                        <img src="${p.img}" alt="${p.name}">
                        <div>
                          <b>${p.name}</b><br>
                          <span>${p.brand}</span>
                        </div>
                      </div>
                    </td>
                    <td><b>${p.qty}</b></td>
                    <td class="${statusClass}">${statusText}</td>
                  </tr>
                `;
            } else {
                // Logic hiển thị giao dịch (Nhập/Xuất)
                 htmlContent += `
                  <tr>
                    <td><b>${p.id}</b></td>
                    <td>
                      <div class="product-info">
                        <img src="${p.img}" alt="${p.name}">
                        <div>
                          <b>${p.name}</b><br>
                          <span>${p.brand}</span>
                        </div>
                      </div>
                    </td>
                    <td>${p.date}</td>
                    <td>${p.type === 'nhap' ? 'Nhập' : 'Xuất'}</td>
                    <td><b>${p.qty}</b></td>
                  </tr>
                `;
            }
        });
        tbody.innerHTML = htmlContent;
    }


    // --- CÁC HÀM PHÂN TRANG ---

    /**
     * Tạo một nút phân trang
     */
    const createButton = (page, currentPage, onPageChangeCallback) => {
        const button = document.createElement('button');
        button.classList.add('page-btn');
        button.textContent = page.toString();
        if (page === currentPage) button.classList.add('active');
        button.onclick = () => onPageChangeCallback(page);
        return button;
    };

    /**
     * Hiển thị thanh điều khiển phân trang.
     * @param {number} totalItems Tổng số mục dữ liệu.
     */
    function renderPaginationControls(totalItems) {
        if (!paginationContainer) return; 
        const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
        paginationContainer.innerHTML = '';
        
        if (currentPage > totalPages && totalItems > 0) currentPage = totalPages;
        
        const onPageChangeCallback = (newPage) => {
            currentPage = newPage;
            updateTableDisplay();
        };

        const startPage = Math.max(1, currentPage - 1);
        const endPage = Math.min(totalPages, currentPage + 1);
        
        // Nút Trang đầu
        if (startPage > 1) {
            paginationContainer.appendChild(createButton(1, currentPage, onPageChangeCallback));
        }
        // Dấu ...
        if (startPage > 2) {
            const dots = document.createElement('span');
            dots.textContent = '...';
            paginationContainer.appendChild(dots);
        }

        // Các nút trang xung quanh trang hiện tại
        for (let i = startPage; i <= endPage; i++) {
            paginationContainer.appendChild(createButton(i, currentPage, onPageChangeCallback));
        }

        // Dấu ...
        if (endPage < totalPages - 1) {
            const dots = document.createElement('span');
            dots.textContent = '...';
            paginationContainer.appendChild(dots);
        }
        // Nút Trang cuối
        if (endPage < totalPages) {
            paginationContainer.appendChild(createButton(totalPages, currentPage, onPageChangeCallback));
        }
    }


    /**
     * Cập nhật hiển thị bảng và phân trang (Hàm điều phối chính)
     */
    function updateTableDisplay() {
        const totalItems = currentDataSet.length;
        
        // 1. Cắt dữ liệu cho trang hiện tại
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const dataToRender = currentDataSet.slice(startIndex, endIndex);

        // 2. Hiển thị dữ liệu lên bảng
        updateTableHeader(transactionTypeSelect.value); 
        renderTablePage(dataToRender); 

        // 3. Hiển thị điều khiển phân trang
        renderPaginationControls(totalItems);
    }
    
    /**
     * Hiển thị danh sách sắp hết hàng 
     */
    function renderLowStockList(stockData) {
        if (!lowStockList) return; 
        
        const headerHTML = `
            <div style="background-color:#E9F2F3; border-radius: 8px; padding:10px; margin-bottom:10px;">
                <h3>Sản phẩm sắp hết hàng (Tồn <= 10)</h3>
            </div>
        `;
        
        lowStockList.innerHTML = headerHTML; 

        // 3. Lọc và thêm các mục mới
        const lowStockItems = stockData.filter(p => p.qty <= 10);
        
        lowStockItems.forEach(p => {
             const lowItemDiv = document.createElement('div');
             lowItemDiv.classList.add('low-item');
             lowItemDiv.innerHTML = `
              <img src="${p.img}" alt="${p.name}">
              <div style="text-align:left; font-size: 1.1rem; font-weight:lighter; border-right:1px solid #ccc;">
                <b>${p.name}</b><br>${p.brand}
              </div>
              <p class="qty">${p.qty}</p>
            `;
            lowStockList.appendChild(lowItemDiv);
        });
    }


    /**
     * Hàm chính: Tải, lọc và hiển thị dữ liệu
     */
    async function handleLookup() {
        if (!productSearchInput || !transactionTypeSelect || !startDateInput || !endDateInput) return;

        // 1. Lấy giá trị từ các bộ lọc
        const productKeyword = productSearchInput.value.toLowerCase().trim();
        const transactionType = transactionTypeSelect.value;
        const startDate = startDateInput.value;
        const endDate = endDateInput.value;

        // 2. Lọc dữ liệu cho chế độ Nhập/Xuất
        let filteredTransactionsForInOut = allTransactions.filter(t => {
            // Dùng tên sản phẩm để tìm kiếm nếu ID không phải là số
            const matchesProduct = t.name.toLowerCase().includes(productKeyword) || 
                                   t.id.toString().includes(productKeyword);
            const matchesStartDate = !startDate || t.date >= startDate;
            const matchesEndDate = !endDate || t.date <= endDate;
            const matchesType = (t.type === transactionType);

            return matchesProduct && matchesStartDate && matchesEndDate && matchesType;
        });

        // 3. Quyết định cách lọc và hiển thị dữ liệu
        if (transactionType === 'ton') {
            
            // Lọc các giao dịch (tồn kho) dựa trên từ khóa sản phẩm và ngày kết thúc
            let stockFilteredTransactions = allTransactions.filter(t => {
                 const matchesProduct = t.name.toLowerCase().includes(productKeyword) || 
                                       t.id.toString().includes(productKeyword);
                 const matchesEndDate = !endDate || t.date <= endDate;
                 return matchesProduct && matchesEndDate;
            });

            // Tính toán tồn kho từ các giao dịch đã lọc
            const stockData = calculateStock(stockFilteredTransactions);
            
            // Cập nhật currentDataSet
            currentDataSet = stockData.filter(p => p.qty > 0); // Chỉ hiển thị sản phẩm còn tồn
            
            renderLowStockList(stockData); // Cập nhật cả danh sách sắp hết hàng (bao gồm cả SP có tồn=0)
        } else {
            // Nếu xem Nhập hoặc Xuất
            currentDataSet = filteredTransactionsForInOut;
            renderLowStockList([]); // Xóa danh sách sắp hết hàng
        }
        
        // 4. HIỂN THỊ PHÂN TRANG VÀ BẢNG
        currentPage = 1; // Luôn quay về trang 1 sau khi tra cứu mới
        updateTableDisplay();
    }
    
    
    /**
     * Hàm khởi tạo: Tải dữ liệu và thiết lập trang
     */
    function initialize() {
        if (!lookupButton || !transactionTypeSelect) {
             console.error("Thiếu phần tử DOM cần thiết cho trang kho hàng. Kiểm tra HTML.");
             if(tbody) tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; color: red;">Lỗi tải DOM. Vui lòng kiểm tra lại cấu trúc HTML.</td></tr>`;
             return;
        }

        try {
            // 1. Tải dữ liệu giao dịch tĩnh (Nhập/Xuất mẫu)
            let staticTransactions = staticStockData.transactions;

            // 2. Tải và chuyển đổi dữ liệu phiếu nhập từ Local Storage (receiptData)
            const receiptTransactions = loadReceiptsFromLocalStorage(staticTransactions);
            
            // 3. Chuẩn bị dữ liệu cho việc tìm Max ID
            const transactionsForIdCheck = [...staticTransactions, ...receiptTransactions];
            

            // 4. Tải và chuyển đổi dữ liệu sản phẩm ban đầu từ Local Storage (adminproductdata)
            const adminProductInitialTransactions = loadAdminProductsAsInitialStock(transactionsForIdCheck);
            const orderHistorySaleTransactions = loadSaleTransactionsFromOrderHistory([...transactionsForIdCheck, ...adminProductInitialTransactions]);
            
            // 5. Kết hợp tất cả: Dữ liệu tĩnh + Sản phẩm ban đầu (adminproductdata) + Phiếu nhập (receiptData)
            allTransactions = [
                ...staticTransactions, 
                ...adminProductInitialTransactions,
                ...receiptTransactions,
                ...orderHistorySaleTransactions
            ];
            
            // 6. Sắp xếp lại theo ngày để đảm bảo tính toán tồn kho chính xác
            allTransactions.sort((a, b) => new Date(a.date) - new Date(b.date));


            // Thiết lập sự kiện
            lookupButton.addEventListener('click', handleLookup);
            transactionTypeSelect.addEventListener('change', handleLookup);
            if (productSearchInput) productSearchInput.addEventListener('input', handleLookup);
            if (startDateInput) startDateInput.addEventListener('change', handleLookup);
            if (endDateInput) endDateInput.addEventListener('change', handleLookup);

            // Tải dữ liệu tồn kho ban đầu
            handleLookup(); 

        } catch (error) {
            console.error("Lỗi khởi tạo trang kho hàng:", error);
            if(tbody) tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; color: red;">Lỗi khởi tạo. Vui lòng tải lại trang.</td></tr>`;
        }
    }

    // Chạy hàm khởi tạo
    initialize();
};