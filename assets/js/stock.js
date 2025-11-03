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
    let currentDataSet = []; // Dữ liệu đã lọc cuối cùng để phân trang
    // -----------------------------

    // --- DỮ LIỆU GIAO DỊCH TĨNH (THAY THẾ CHO stock-data.json) ---
    // Dữ liệu này sẽ được dùng làm dữ liệu nền và được bổ sung bởi Local Storage
    const staticStockData = {
      "transactions": [
        {
          "id": 1,
          "name": "Laptop Acer Nitro V 15",
          "brand": "Acer",
          "img": "images/acer1.png",
          "date": "2024-09-15",
          "type": "nhap",
          "qty": 50
        },
        {
          "id": 2,
          "name": "Balo Asus ROG Archer",
          "brand": "Asus",
          "img": "images/balo1.png",
          "date": "2024-09-20",
          "type": "nhap",
          "qty": 100
        },
        {
          "id": 3,
          "name": "Chuột Logitech G502",
          "brand": "Logitech",
          "img": "images/mouse1.jpg",
          "date": "2024-09-25",
          "type": "nhap",
          "qty": 70
        },
        {
          "id": 4,
          "name": "Bàn phím cơ DareU EK87",
          "brand": "DareU",
          "img": "images/bp1.png",
          "date": "2024-09-28",
          "type": "nhap",
          "qty": 20
        },
        {
          "id": 1,
          "name": "Laptop Acer Nitro V 15",
          "brand": "Acer",
          "img": "images/acer1.png",
          "date": "2024-10-01",
          "type": "xuat",
          "qty": 20
        },
        {
          "id": 2,
          "name": "Balo Asus ROG Archer",
          "brand": "Asus",
          "img": "images/balo2.png",
          "date": "2024-10-05",
          "type": "xuat",
          "qty": 30
        },
        {
          "id": 1,
          "name": "Laptop Acer Nitro V 15",
          "brand": "Acer",
          "img": "images/acer1.png",
          "date": "2024-10-10",
          "type": "xuat",
          "qty": 20
        },
        {
          "id": 3,
          "name": "Chuột Logitech G502",
          "brand": "Logitech",
          "img": "images/mouse2.jpg",
          "date": "2024-10-11",
          "type": "xuat",
          "qty": 5
        },
        {
          "id": 4,
          "name": "Bàn phím cơ DareU EK87",
          "brand": "DareU",
          "img": "images/bp2.jpg",
          "date": "2024-10-15",
          "type": "xuat",
          "qty": 10
        },
        {
          "id": 2,
          "name": "Balo Asus ROG Archer",
          "brand": "Asus",
          "img": "images/balo2.png",
          "date": "2024-10-20",
          "type": "nhap",
          "qty": 50
        },
        {
          "id": 1,
          "name": "Laptop Acer Nitro V 15",
          "brand": "Acer",
          "img": "images/acer1.png",
          "date": "2024-10-22",
          "type": "nhap",
          "qty": 10
        },
        {
          "id": 3,
          "name": "Chuột Logitech G502",
          "brand": "Logitech",
          "img": "images/mouse2.jpg",
          "date": "2024-10-25",
          "type": "xuat",
          "qty": 60
        },
        {
          "id": 1,
          "name": "Laptop Acer Nitro V 15",
          "brand": "Acer",
          "img": "images/acer1.png",
          "date": "2024-10-28",
          "type": "xuat",
          "qty": 15
        },
        {
          "id": 2,
          "name": "Balo Asus ROG Archer",
          "brand": "Asus",
          "img": "images/balo2.png",
          "date": "2024-11-01",
          "type": "xuat",
          "qty": 10
        },
        {
          "id": 4,
          "name": "Bàn phím cơ DareU EK87",
          "brand": "DareU",
          "img": "images/bp2.jpg",
          "date": "2024-11-03",
          "type": "xuat",
          "qty": 10
        },
        {
          "id": 1,
          "name": "Laptop Acer Nitro V 15",
          "brand": "Acer",
          "img": "images/acer1.png",
          "date": "2024-11-05",
          "type": "nhap",
          "qty": 5
        }
      ]
    };

    //ĐỌC DỮ LIỆU PHIẾU NHẬP TỪ LOCAL STORAGE
    /**
     * Tải và chuyển đổi dữ liệu phiếu nhập từ Local Storage (receipt.js)
     * thành các giao dịch 'nhap' để bổ sung vào kho.
     */
    function loadReceiptsFromLocalStorage() {
        const INVOICE_STORAGE_KEY = 'invoices'; // Giả định key Local Storage của receipt.js
        let receiptTransactions = [];
        try {
            const rawData = localStorage.getItem(INVOICE_STORAGE_KEY);
            if (!rawData) return [];

            const invoices = JSON.parse(rawData);

            if (!Array.isArray(invoices)) return [];

            let transactionIdCounter = 9000; 

            invoices.forEach(invoice => {
                const invoiceDate = invoice.date || new Date().toISOString().slice(0, 10);
                
                if (invoice.products && Array.isArray(invoice.products)) {
                    invoice.products.forEach((product) => {
                        // Tạo một giao dịch 'nhap' cho từng sản phẩm trong phiếu
                        receiptTransactions.push({
                            // Dùng ID lớn để tránh trùng với ID sản phẩm tĩnh (1-4)
                            id: transactionIdCounter++, 
                            name: product.name || 'Sản phẩm mới nhập',
                            // Các trường thiếu trong dữ liệu Local Storage của receipt.js được gán giá trị mặc định
                            brand: 'Đã nhập (LS)', 
                            img: 'https://via.placeholder.com/50/4CAF50/FFFFFF?text=R', // Ảnh placeholder cho Nhập
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


    //  CÁC HÀM TÍNH TOÁN VÀ HIỂN THỊ
    function calculateStock(transactions) {
        const stock = new Map(); 

        transactions.forEach(t => {
            // Dùng tên sản phẩm làm key phụ nếu ID không khớp/không tồn tại, đảm bảo tính toán tồn kho dựa trên tên
            const key = t.id ? t.id : t.name; 

            if (!stock.has(key)) {
                stock.set(key, {
                    id: t.id,
                    name: t.name,
                    brand: t.brand,
                    img: t.img,
                    qty: 0
                });
            }

            const product = stock.get(key);
            if (t.type === 'nhap') {
                product.qty += t.qty;
            } else if (t.type === 'xuat') {
                product.qty -= t.qty;
            }
        });

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

            // 2. Tải và chuyển đổi dữ liệu phiếu nhập từ Local Storage
            const receiptTransactions = loadReceiptsFromLocalStorage();
            
            // 3. Kết hợp cả hai
            allTransactions = [...staticTransactions, ...receiptTransactions];
            
            // 4. Sắp xếp lại theo ngày để đảm bảo tính toán tồn kho chính xác
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
            // Bắt lỗi nếu có bất kỳ lỗi nào khác xảy ra trong quá trình thiết lập
            console.error("Lỗi khởi tạo trang kho hàng:", error);
            if(tbody) tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; color: red;">Lỗi khởi tạo. Vui lòng tải lại trang.</td></tr>`;
        }
    }

    // Chạy hàm khởi tạo
    initialize();

};