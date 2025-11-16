function LoadReceipt() {
  document.getElementById("content").innerHTML = `
    <h2>Danh sách Phiếu nhập hàng</h2>
    <input type="text" id="searchInput" placeholder="Tìm theo ID / tên sản phẩm / ngày..." style="width: 50%; margin-bottom: 12px" oninput="searchInvoice()">

    <div class="table-container">
        <table id="invoiceTable">
            <thead>
                <tr>
                    <th>ID Phiếu</th>
                    <th>Sản phẩm</th>
                    <th>Ngày nhập</th>
                    <th>Giá</th>
                    <th>Số lượng</th>
                    <th>Hành động</th>
                </tr>
            </thead>
            <tbody></tbody>
        </table>
    </div>
    
    <h2>Thêm Phiếu nhập hàng</h2>
    <div>
        <input id="addId" placeholder="ID phiếu">
        <input id="addDate" type="date">
        <div id="addProductContainer"></div>

        <button class="btn-add-product" onclick="addProductRow('addProductContainer')">+ Thêm sản phẩm</button>
        <br><br>
        <button class="save" onclick="saveInvoice()">Lưu phiếu nhập</button>
    </div>

    <h2>Chỉnh sửa Phiếu nhập hàng</h2>
    <div>
        <input id="editId" disabled>
        <input id="editDate" type="date">
        <div id="editProductContainer"></div>

        <button class="btn-add-product" onclick="addProductRow('editProductContainer')">+ Thêm sản phẩm</button>
        <br><br>
        <button class="cancel" onclick="cancelEdit()">Hủy</button>
        <button class="save" onclick="updateInvoice()">Lưu thay đổi</button>
    </div>
`;

  // Hàm tiện ích để trích xuất danh sách sản phẩm phẳng từ globalJsonData
  function getAllProductsFromAdminData() {
    if (typeof globalJsonData === 'undefined' || !globalJsonData?.product?.brand) {
        console.error("Lỗi: Không tìm thấy globalJsonData hoặc dữ liệu không hợp lệ. Đảm bảo AdminProduct.js đã được tải trước.");
        return [];
    }

    const allProducts = [];
    const productTypes = ['laptop', 'balo', 'de-tan-nhiet','tai-nghe','chuot','ban-phim'];

    globalJsonData.product.brand.forEach(brand => {
        productTypes.forEach(type => {
            if (Array.isArray(brand[type])) {
                brand[type].forEach(product => {
                    // Loại bỏ dấu chấm (.) trong giá tiền để chuyển từ định dạng chuỗi VN sang chuỗi số
                    const cleanedPrice = (product.price || '0').replace(/\./g, '');
                    
                    allProducts.push({
                        name: product.model,
                        price: cleanedPrice,
                        imagePath: product.image
                    });
                });
            }
        });
    });
    
    // Loại bỏ các sản phẩm trùng lặp (nếu có)
    const uniqueProducts = [];
    const productSet = new Set(); 
    allProducts.forEach(p => {
        const key = `${p.name}|${p.price}`;
        if (!productSet.has(key)) {
            productSet.add(key);
            uniqueProducts.push(p);
        }
    });

    return uniqueProducts;
  }
  
  // 1. Dữ liệu sản phẩm tĩnh (Static Product List)
  const productList = getAllProductsFromAdminData(); 
  // 2. Tạo Map để tìm kiếm nhanh imagePath bằng Tên sản phẩm
  const productMap = new Map();
  productList.forEach(p => {
      productMap.set(p.name, { price: p.price, imagePath: p.imagePath });
  });

  // Lấy dữ liệu từ Local Storage hoặc sử dụng dữ liệu mẫu
  let invoices = JSON.parse(localStorage.getItem('receiptData')) || [
    {
      id: "PN001",
      date: "2025-10-28",
      products: [
        { name: "Bàn phím Akko MonsGeek M1W HE-SP V3 Dark Night", price: "3150000", qty: "10", imagePath: "../assets/images/bp1.png" }, 
        { name: "Chuột Razer Cobra - Zenless Zone One Edition", price: "1369000", qty: "15", imagePath: "../assets/images/Mouse1.jpg" },
      ],
    },
    {
      id: "PN002",
      date: "2025-10-30",
      products: [{ name: "Laptop Acer Gaming Nitro V ANV15-41-R2UP", price: "16390000", qty: "5", imagePath: "../assets/images/Acer1.png" }],
    },
  ];


  let editingIndex = null;
  
  // Hàm lưu dữ liệu vào Local Storage
  function saveToLocalStorage() {
      localStorage.setItem('receiptData', JSON.stringify(invoices));
  }

  // ... (Hàm addProductRow và updatePrice giữ nguyên) ...

  function addProductRow(containerId) {
    
    // Chỉ kiểm tra khi thêm mới 
    if (containerId === 'addProductContainer') {
        const addId = document.getElementById("addId").value.trim();
        const addDate = document.getElementById("addDate").value;

        if (!addId || !addDate) {
            alert("Vui lòng nhập ID Phiếu và chọn Ngày nhập trước khi thêm sản phẩm!");
            return; 
        }
    }

    const container = document.getElementById(containerId);
    const row = document.createElement("div");
    row.className = "product-row";

    // Tạo HTML cho <select> sử dụng productList đã được cập nhật
    let selectHTML = '<select class="product-select" onchange="updatePrice(this)"><option value="">--- Chọn sản phẩm ---</option>';
    productList.forEach(p => {
        // Giá trị của option là giá tiền (chuỗi số đã làm sạch), text là tên sản phẩm
        selectHTML += `<option value="${p.price}">${p.name}</option>`;
    });
    selectHTML += '</select>';

    // Thêm nút xóa sản phẩm
    row.innerHTML = `
        ${selectHTML}
        <input placeholder="Giá" type="number" readonly>
        <input placeholder="Số lượng" type="number">
        <button class="delete-product-row" onclick="this.parentNode.remove()">Xóa</button>
    `;
    container.appendChild(row);
  }

  // Hàm này sẽ tự động chạy khi chọn sản phẩm trong dropdown
  function updatePrice(selectElement) {
    const price = selectElement.value; // Lấy giá trị (là giá tiền đã được làm sạch) từ <option>
    // Input giá tiền là phần tử input đầu tiên sau select
    const priceInput = selectElement.parentNode.querySelector('input[type="number"]:not([placeholder="Số lượng"])');
    if (priceInput) {
        priceInput.value = price;
    }
  }


  function renderTable() {
    let tbody = document.querySelector("#invoiceTable tbody");
    tbody.innerHTML = "";
    
    // Sort invoices by date descending (tùy chọn)
    const sortedInvoices = [...invoices].sort((a, b) => new Date(b.date) - new Date(a.date));

    sortedInvoices.forEach((invoice, index) => {
      // Cần tìm lại index gốc để chỉnh sửa/xóa
      const originalIndex = invoices.findIndex(inv => inv.id === invoice.id); 

      invoice.products.forEach((p, i) => {
        // Định dạng giá tiền 
        const formattedPrice = Number(p.price).toLocaleString('vi-VN');
        
        // *************** BỔ SUNG LOGIC HIỂN THỊ ẢNH *******************
        const imageUrl = p.imagePath || 'placeholder.jpg'; 
        
        // Sử dụng một class mới cho TD để dễ dàng định dạng CSS (ví dụ: căn giữa, flex)
        tbody.innerHTML += `
                <tr>
                    <td>${i === 0 ? invoice.id : ""}</td>
                    
                    <td class="product-cell-display" style="display: flex; align-items: center; gap: 10px;">
                        <img src="${imageUrl}" alt="${p.name}" style="width: 50px; height: 50px; object-fit: cover;">
                        <span>${p.name}</span>
                    </td>

                    <td>${invoice.date}</td>
                    <td>${formattedPrice}</td>
                    <td>${p.qty}</td>
                    ${
                      i === 0
                        ? `
                    <td>
                        <button class="edit" onclick="editInvoice(${originalIndex})">Sửa</button>
                        <button class="delete" onclick="deleteInvoice(${originalIndex})">Xóa</button>
                    </td>`
                        : `<td></td>`
                    }
                </tr>`;
      });
    });
  }


  function saveInvoice() {
    const id = document.getElementById("addId").value.trim();
    const date = document.getElementById("addDate").value;

    if (!id || !date) {
        alert("Vui lòng nhập ID Phiếu và chọn Ngày nhập!");
        return;
    }

    // Đọc dữ liệu từ select và input
    let products = [...document.querySelectorAll("#addProductContainer .product-row")].map((r) => {
        let selectEl = r.querySelector("select");
        let inputs = r.querySelectorAll("input"); 
        
        let productName = selectEl.options[selectEl.selectedIndex].text; 
        let productPrice = inputs[0].value; 
        let productQty = inputs[1].value; 
        
        // Lấy imagePath từ productMap
        const productInfo = productMap.get(productName);
        const imagePath = productInfo ? productInfo.imagePath : '';

        return { name: productName, price: productPrice, qty: productQty, imagePath: imagePath };
    });

    // Kiểm tra nếu chưa thêm sản phẩm nào
    if (products.length === 0) {
        alert("Vui lòng thêm ít nhất một sản phẩm vào phiếu!");
        return;
    }

    // Kiểm tra nếu sản phẩm đã thêm nhưng chưa chọn/nhập số lượng
    if (products.some(p => p.name === "--- Chọn sản phẩm ---" || !p.qty || Number(p.qty) <= 0)) {
        alert("Vui lòng chọn sản phẩm và nhập số lượng hợp lệ (lớn hơn 0)!");
        return;
    }

    // Kiểm tra trùng ID (tùy chọn)
    if (invoices.some(inv => inv.id === id)) {
        alert(`ID Phiếu '${id}' đã tồn tại. Vui lòng chọn ID khác.`);
        return;
    }

    invoices.push({ id, date, products });
    saveToLocalStorage(); // LƯU VÀO LOCAL STORAGE
    renderTable();

    // Reset form
    document.getElementById("addId").value = "";
    document.getElementById("addDate").value = "";
    document.getElementById("addProductContainer").innerHTML = "";
  }
  
  // ... (Hàm editInvoice và updateInvoice giữ nguyên logic lưu imagePath) ...

  function editInvoice(index) {
    editingIndex = index;
    const invoice = invoices[index];
    
    document.getElementById("editId").value = invoice.id;
    document.getElementById("editDate").value = invoice.date;
    
    const container = document.getElementById("editProductContainer");
    container.innerHTML = "";

    // Load các sản phẩm hiện tại của phiếu
    invoice.products.forEach(p => {
        const row = document.createElement("div");
        row.className = "product-row";

        // Tạo HTML cho <select>
        let selectHTML = '<select class="product-select" onchange="updatePrice(this)"><option value="">--- Chọn sản phẩm ---</option>';
        productList.forEach(prod => {
            // So sánh tên sản phẩm để chọn option đúng
            const isSelected = prod.name === p.name ? 'selected' : '';
            selectHTML += `<option value="${prod.price}" ${isSelected}>${prod.name}</option>`;
        });
        selectHTML += '</select>';

        // Thêm nút xóa sản phẩm
        row.innerHTML = `
            ${selectHTML}
            <input placeholder="Giá" type="number" readonly value="${p.price}">
            <input placeholder="Số lượng" type="number" value="${p.qty}">
            <button class="delete-product-row" onclick="this.parentNode.remove()">Xóa</button>
        `;
        container.appendChild(row);
    });

    // Cuộn đến phần chỉnh sửa
    document.getElementById("editId").scrollIntoView({ behavior: 'smooth' });
  }


  function updateInvoice() {
    if (editingIndex === null) return; 

    let date = document.getElementById("editDate").value;
    let products = [...document.querySelectorAll("#editProductContainer .product-row")].map(
        (r) => {
            let selectEl = r.querySelector("select");
            let inputs = r.querySelectorAll("input"); 
            let productName = selectEl.options[selectEl.selectedIndex].text;
            let productPrice = inputs[0].value;
            let productQty = inputs[1].value;

            const productInfo = productMap.get(productName);
            const imagePath = productInfo ? productInfo.imagePath : '';

            return { name: productName, price: productPrice, qty: productQty, imagePath: imagePath };
        }
    );

    // Kiểm tra tương tự như khi lưu
    if (!date) {
        alert("Vui lòng chọn Ngày nhập!");
        return;
    }

    if (products.length === 0) {
        alert("Vui lòng thêm ít nhất một sản phẩm vào phiếu!");
        return;
    }

    if (products.some(p => p.name === "--- Chọn sản phẩm ---" || !p.qty || Number(p.qty) <= 0)) {
        alert("Vui lòng chọn sản phẩm và nhập số lượng hợp lệ (lớn hơn 0)!");
        return;
    }

    invoices[editingIndex].date = date;
    invoices[editingIndex].products = products;
    saveToLocalStorage(); // LƯU VÀO LOCAL STORAGE
    renderTable();
    cancelEdit();
  }


  function cancelEdit() {
    editingIndex = null;
    document.getElementById("editId").value = "";
    document.getElementById("editDate").value = "";
    document.getElementById("editProductContainer").innerHTML = "";
  }


  function searchInvoice() {
    const searchTerm = document.getElementById("searchInput").value.toLowerCase();
    
    // Tái tạo lại renderTable với danh sách đã lọc
    let tbody = document.querySelector("#invoiceTable tbody");
    tbody.innerHTML = "";

    const filteredInvoices = invoices.filter(invoice => {
        // Tìm kiếm theo ID phiếu
        if (invoice.id.toLowerCase().includes(searchTerm)) return true;
        
        // Tìm kiếm theo ngày
        if (invoice.date.includes(searchTerm)) return true; // Tìm kiếm khớp một phần ngày
        
        // Tìm kiếm theo tên sản phẩm
        if (invoice.products.some(p => p.name.toLowerCase().includes(searchTerm))) return true;

        return false;
    });
    
    const sortedInvoices = [...filteredInvoices].sort((a, b) => new Date(b.date) - new Date(a.date));

    sortedInvoices.forEach((invoice, index) => {
        // Cần tìm lại index gốc để chỉnh sửa/xóa
        const originalIndex = invoices.findIndex(inv => inv.id === invoice.id); 

        invoice.products.forEach((p, i) => {
            const formattedPrice = Number(p.price).toLocaleString('vi-VN');
            
            const imageUrl = p.imagePath || 'placeholder.jpg'; 

            tbody.innerHTML += `
                <tr>
                    <td>${i === 0 ? invoice.id : ""}</td>
                    
                    <td class="product-cell-display" style="display: flex; align-items: center; gap: 10px;">
                        <img src="${imageUrl}" alt="${p.name}" style="width: 50px; height: 50px; object-fit: cover;">
                        <span>${p.name}</span>
                    </td>

                    <td>${invoice.date}</td>
                    <td>${formattedPrice}</td>
                    <td>${p.qty}</td>
                    ${
                      i === 0
                        ? `
                    <td>
                        <button class="edit" onclick="editInvoice(${originalIndex})">Sửa</button>
                        <button class="delete" onclick="deleteInvoice(${originalIndex})">Xóa</button>
                    </td>`
                        : `<td></td>`
                    }
                </tr>`;
        });
    });
  }

  // Cập nhật hàm deleteInvoice để lưu vào Local Storage
  function deleteInvoice(index) {
    if (confirm("Bạn có chắc muốn xóa phiếu này?")) {
      invoices.splice(index, 1);
      saveToLocalStorage(); // LƯU VÀO LOCAL STORAGE
      renderTable();
    }
  }

  renderTable();
  
  // Expose các hàm ra window
  window.addProductRow = addProductRow;
  window.updatePrice = updatePrice; 
  window.saveInvoice = saveInvoice;
  window.editInvoice = editInvoice;
  window.deleteInvoice = deleteInvoice;
  window.updateInvoice = updateInvoice;
  window.cancelEdit = cancelEdit;
  window.searchInvoice = searchInvoice; // expose search function
}