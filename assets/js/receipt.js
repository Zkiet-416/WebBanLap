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
`;

  // --- KHU VỰC XỬ LÝ DỮ LIỆU ---

  function getAllProductsFromAdminData() {
    if (typeof globalJsonData === 'undefined' || !globalJsonData?.product?.brand) {
        console.error("Lỗi: Không tìm thấy globalJsonData hoặc dữ liệu không hợp lệ.");
        return [];
    }

    const allProducts = [];
    const productTypes = ['laptop', 'balo', 'de-tan-nhiet','tai-nghe','chuot','ban-phim'];

    globalJsonData.product.brand.forEach(brand => {
        productTypes.forEach(type => {
            if (Array.isArray(brand[type])) {
                brand[type].forEach(product => {
                    const cleanedPrice = (product.price || '0').replace(/\./g, '');
                    const originalPrice = Number(cleanedPrice); 
                    const costPrice = originalPrice * 0.90; 
                    allProducts.push({
                        name: product.model,
                        price: String(costPrice),
                        imagePath: product.image
                    });
                });
            }
        });
    });
    
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
  
  const productList = getAllProductsFromAdminData(); 
  const productMap = new Map();
  productList.forEach(p => {
      productMap.set(p.name, { price: p.price, imagePath: p.imagePath });
  });

  let invoices = JSON.parse(localStorage.getItem('receiptData')) || [
    {
      id: "PN001",
      date: "2025-10-28",
      products: [
        { name: "Bàn phím Akko MonsGeek M1W HE-SP V3 Dark Night", price: "2835000", qty: "10", imagePath: "../assets/images/bp1.png" }, 
        { name: "Chuột Razer Cobra - Zenless Zone One Edition", price: "990000", qty: "15", imagePath: "../assets/images/Mouse1.jpg" },
      ],
    },
    {
      id: "PN002",
      date: "2025-10-30",
      products: [{ name: "Laptop Acer Gaming Nitro V ANV15-41-R2UP", price: "14751000", qty: "5", imagePath: "../assets/images/Acer1.png" }],
    },
  ];

  function saveToLocalStorage() {
      localStorage.setItem('receiptData', JSON.stringify(invoices));
  }

  function isValidInvoiceId(id) {
    return /^PN\d{3}$/i.test(id);
  }

  function addProductRow(containerId) {
    // Chỉ còn dùng cho addProductContainer
    const addId = document.getElementById("addId").value.trim();
    const addDate = document.getElementById("addDate").value;

    if (!addId || !addDate) {
        alert("Vui lòng nhập ID Phiếu và chọn Ngày nhập trước khi thêm sản phẩm!");
        return; 
    }

    const container = document.getElementById(containerId);
    const row = document.createElement("div");
    row.className = "product-row";

    let selectHTML = '<select class="product-select" onchange="updatePrice(this)"><option value="">--- Chọn sản phẩm ---</option>';
    productList.forEach(p => {
        selectHTML += `<option value="${p.price}">${p.name}</option>`;
    });
    selectHTML += '</select>';

    row.innerHTML = `
        ${selectHTML}
        <input placeholder="Giá" type="number" readonly>
        <input placeholder="Số lượng" type="number">
        <button class="delete-product-row" onclick="this.parentNode.remove()">Xóa dòng</button>
    `;
    container.appendChild(row);
  }

  function updatePrice(selectElement) {
    const price = selectElement.value;
    const priceInput = selectElement.parentNode.querySelector('input[type="number"]:not([placeholder="Số lượng"])');
    if (priceInput) {
        priceInput.value = price;
    }
  }

  function renderTable() {
    let tbody = document.querySelector("#invoiceTable tbody");
    tbody.innerHTML = "";
    
    const sortedInvoices = [...invoices].sort((a, b) => new Date(b.date) - new Date(a.date));

    sortedInvoices.forEach((invoice) => {
      invoice.products.forEach((p, i) => {
        const formattedPrice = Number(p.price).toLocaleString('vi-VN');
        const imageUrl = p.imagePath || 'placeholder.jpg'; 
        
        // Đã xóa cột Action (nút Sửa/Xóa)
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
    if (!isValidInvoiceId(id)) {
        alert("ID Phiếu phải có cấu trúc 'PN' theo sau là 3 chữ số (ví dụ: PN001, PN123).");
        return;
    }

    if (invoices.some(inv => inv.id === id)) {
        alert(`ID Phiếu '${id}' đã tồn tại. Vui lòng chọn ID khác.`);
        return;
    }

    let products = [...document.querySelectorAll("#addProductContainer .product-row")].map((r) => {
        let selectEl = r.querySelector("select");
        let inputs = r.querySelectorAll("input"); 
        
        let productName = selectEl.options[selectEl.selectedIndex].text; 
        let productPrice = inputs[0].value; 
        let productQty = inputs[1].value; 
        
        const productInfo = productMap.get(productName);
        const imagePath = productInfo ? productInfo.imagePath : '';

        return { name: productName, price: productPrice, qty: productQty, imagePath: imagePath };
    });

    if (products.length === 0) {
        alert("Vui lòng thêm ít nhất một sản phẩm vào phiếu!");
        return;
    }

    if (products.some(p => p.name === "--- Chọn sản phẩm ---" || !p.qty || Number(p.qty) <= 0)) {
        alert("Vui lòng chọn sản phẩm và nhập số lượng hợp lệ (lớn hơn 0)!");
        return;
    }

    if (invoices.some(inv => inv.id === id)) {
        alert(`ID Phiếu '${id}' đã tồn tại. Vui lòng chọn ID khác.`);
        return;
    }

    invoices.push({ id, date, products });
    saveToLocalStorage();
    renderTable();

    // Reset form
    document.getElementById("addId").value = "";
    document.getElementById("addDate").value = "";
    document.getElementById("addProductContainer").innerHTML = "";
  }

  function searchInvoice() {
    const searchTerm = document.getElementById("searchInput").value.toLowerCase();
    let tbody = document.querySelector("#invoiceTable tbody");
    tbody.innerHTML = "";

    const filteredInvoices = invoices.filter(invoice => {
        if (invoice.id.toLowerCase().includes(searchTerm)) return true;
        if (invoice.date.includes(searchTerm)) return true;
        if (invoice.products.some(p => p.name.toLowerCase().includes(searchTerm))) return true;
        return false;
    });
    
    const sortedInvoices = [...filteredInvoices].sort((a, b) => new Date(b.date) - new Date(a.date));

    sortedInvoices.forEach((invoice) => {
        invoice.products.forEach((p, i) => {
            const formattedPrice = Number(p.price).toLocaleString('vi-VN');
            const imageUrl = p.imagePath || 'placeholder.jpg'; 

            // Đã xóa cột Action
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
                </tr>`;
        });
    });
  }

  renderTable();
  
  // Expose các hàm cần thiết ra window
  window.addProductRow = addProductRow;
  window.updatePrice = updatePrice; 
  window.saveInvoice = saveInvoice;
  window.searchInvoice = searchInvoice;
}
