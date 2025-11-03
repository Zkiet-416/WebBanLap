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

  // --- [BẮT ĐẦU THAY ĐỔI 1] ---
  // Lấy danh sách sản phẩm từ Local Storage (do AdminProduct.js lưu)
  let productList = [];
  function getAllProducts() {
      const data = localStorage.getItem('AdminProductData');
      if (!data) {
          console.error("Không tìm thấy AdminProductData trong Local Storage. Vui lòng tải trang sản phẩm trước.");
          return [];
      }
      try {
          const jsonData = JSON.parse(data);
          const brands = jsonData.product.brand;
          let allProducts = [];

          brands.forEach(brand => {
              const productTypes = ['laptop', 'balo', 'phukienkhac'];
              productTypes.forEach(type => {
                  if (Array.isArray(brand[type])) {
                      brand[type].forEach(p => {
                          // Loại bỏ dấu chấm khỏi giá tiền để khớp với định dạng số
                          allProducts.push({ name: p.model, price: p.price.replace(/\./g, '') });
                      });
                  }
              });
          });
          return allProducts;
      } catch (e) {
          console.error("Lỗi khi đọc dữ liệu sản phẩm:", e);
          return [];
      }
  }
  // Tải danh sách sản phẩm 1 lần khi load
  productList = getAllProducts();


  // --- [BẮT ĐẦU THAY ĐỔI 2] ---
  // Cập nhật phiếu nhập mẫu bằng sản phẩm có thật
  let invoices = [
    {
      id: "PN001",
      date: "2025-10-28",
      products: [
        { name: "Bàn phím Akko MonsGeek M1W HE-SP V3 Dark Night", price: "3150000", qty: "10" },
        { name: "Chuột Razer Cobra - Zenless Zone One Edition", price: "1369000", qty: "15" },
      ],
    },
    {
      id: "PN002",
      date: "2025-10-30",
      products: [{ name: "Laptop Acer Gaming Nitro V ANV15-41-R2UP", price: "16390000", qty: "5" }],
    },
  ];
  // --- [KẾT THÚC THAY ĐỔI 2] ---

  let editingIndex = null;

  // --- [BẮT ĐẦU THAY ĐỔI 3] ---
  // Cập nhật hàm addProductRow để dùng <select> thay vì <input>
  function addProductRow(containerId) {
    
    // --- [ĐIỀU KIỆN MỚI THÊM VÀO] ---
    // Chỉ kiểm tra khi thêm mới (containerId là 'addProductContainer')
    if (containerId === 'addProductContainer') {
        const addId = document.getElementById("addId").value.trim();
        const addDate = document.getElementById("addDate").value;

        if (!addId || !addDate) {
            alert("Vui lòng nhập ID Phiếu và chọn Ngày nhập trước khi thêm sản phẩm!");
            return; // Dừng hàm, không thêm sản phẩm
        }
    }
    // --- [KẾT THÚC ĐIỀU KIỆN MỚI] ---

    const container = document.getElementById(containerId);
    const row = document.createElement("div");
    row.className = "product-row";

    // Tạo HTML cho <select>
    let selectHTML = '<select class="product-select" onchange="updatePrice(this)"><option value="">--- Chọn sản phẩm ---</option>';
    productList.forEach(p => {
        selectHTML += `<option value="${p.price}">${p.name}</option>`;
    });
    selectHTML += '</select>';

    // Thay đổi input tên thành <select> và đặt giá là readonly
    row.innerHTML = `
        ${selectHTML}
        <input placeholder="Giá" type="number" readonly>
        <input placeholder="Số lượng" type="number">
    `;
    container.appendChild(row);
  }

  // Hàm helper để cập nhật giá khi chọn <select>
  function updatePrice(selectElement) {
      const price = selectElement.value;
      const priceInput = selectElement.nextElementSibling; // Lấy ô input Giá ngay bên cạnh
      if (priceInput && priceInput.placeholder === 'Giá') {
          priceInput.value = price;
      }
  }
  // --- [KẾT THÚC THAY ĐỔI 3] ---


  // --- [BẮT ĐẦU THAY ĐỔI 4] ---
  // Cập nhật hàm saveInvoice để đọc từ <select>
  function saveInvoice() {
    let id = document.getElementById("addId").value.trim();
    let date = document.getElementById("addDate").value;
    
    // Đọc dữ liệu từ select và input
    let products = [...document.querySelectorAll("#addProductContainer .product-row")].map((r) => {
      let selectEl = r.querySelector("select");
      let inputs = r.querySelectorAll("input");
      
      let productName = selectEl.options[selectEl.selectedIndex].text;
      let productPrice = inputs[0].value; // Input giá
      let productQty = inputs[1].value;   // Input số lượng

      return { name: productName, price: productPrice, qty: productQty };
    });
    
    // Kiểm tra nếu chưa thêm sản phẩm nào
    if (products.length === 0) {
        alert("Vui lòng thêm ít nhất một sản phẩm vào phiếu!");
        return;
    }
    // Kiểm tra nếu sản phẩm đã thêm nhưng chưa chọn
    if (products.some(p => p.name === "--- Chọn sản phẩm ---" || !p.qty)) {
        alert("Vui lòng chọn sản phẩm và nhập số lượng đầy đủ!");
        return;
    }

    invoices.push({ id, date, products });
    renderTable();
    document.getElementById("addId").value = "";
    document.getElementById("addDate").value = "";
    document.getElementById("addProductContainer").innerHTML = "";
  }
  // --- [KẾT THÚC THAY ĐỔI 4] ---

  function renderTable() {
    let tbody = document.querySelector("#invoiceTable tbody");
    tbody.innerHTML = "";
    invoices.forEach((invoice, index) => {
      invoice.products.forEach((p, i) => {
        tbody.innerHTML += `
            <tr>
                <td>${i === 0 ? invoice.id : ""}</td>
                <td>${p.name}</td>
                <td>${invoice.date}</td>
                <td>${p.price}</td>
                <td>${p.qty}</td>
                ${
                  i === 0
                    ? `
                <td>
                    <button class="edit" onclick="editInvoice(${index})">Sửa</button>
                    <button class="delete" onclick="deleteInvoice(${index})">Xóa</button>
                </td>`
                    : `<td></td>`
                }
            </tr>`;
      });
    });
  }

  // --- [BẮT ĐẦU THAY ĐỔI 5] ---
  // Cập nhật hàm editInvoice để set giá trị cho <select>
  function editInvoice(index) {
    editingIndex = index;
    let inv = invoices[index];
    document.getElementById("editId").value = inv.id;
    document.getElementById("editDate").value = inv.date;
    document.getElementById("editProductContainer").innerHTML = "";
    
    inv.products.forEach((p) => {
      addProductRow("editProductContainer");
      
      // Lấy các element hàng cuối cùng vừa thêm
      let lastRow = document.querySelector("#editProductContainer .product-row:last-child");
      let selectEl = lastRow.querySelector("select");
      let inputs = lastRow.querySelectorAll("input");
      
      // Tìm và set <option> được chọn dựa trên tên
      let option = Array.from(selectEl.options).find(opt => opt.text === p.name);
      if(option) {
          option.selected = true;
      }

      inputs[0].value = p.price; // Input giá (vẫn readonly)
      inputs[1].value = p.qty;   // Input số lượng
    });

    document
      .querySelector("h2:nth-of-type(3)")
      .scrollIntoView({ behavior: "smooth" });
  }
  // --- [KẾT THÚC THAY ĐỔI 5] ---

  // --- [BẮT ĐẦU THAY ĐỔI 6] ---
  // Cập nhật hàm updateInvoice để đọc từ <select>
  function updateInvoice() {
    let date = document.getElementById("editDate").value;

    let products = [...document.querySelectorAll("#editProductContainer .product-row")].map(
      (r) => {
        let selectEl = r.querySelector("select");
        let inputs = r.querySelectorAll("input");
        
        let productName = selectEl.options[selectEl.selectedIndex].text;
        let productPrice = inputs[0].value; // Input giá
        let productQty = inputs[1].value;   // Input số lượng

        return { name: productName, price: productPrice, qty: productQty };
      }
    );
    
    // Kiểm tra tương tự như khi lưu
    if (products.length === 0) {
        alert("Vui lòng thêm ít nhất một sản phẩm vào phiếu!");
        return;
    }
    if (products.some(p => p.name === "--- Chọn sản phẩm ---" || !p.qty)) {
        alert("Vui lòng chọn sản phẩm và nhập số lượng đầy đủ!");
        return;
    }
    
    invoices[editingIndex].date = date;
    invoices[editingIndex].products = products;
    renderTable();
    
    // Tùy chọn: Xóa form edit sau khi cập nhật
    cancelEdit();
    editingIndex = null;
  }
  // --- [KẾT THÚC THAY ĐỔI 6] ---

  function cancelEdit() {
    document.getElementById("editId").value = "";
    document.getElementById("editDate").value = "";
    document.getElementById("editProductContainer").innerHTML = "";
    editingIndex = null;
  }

  function searchInvoice() {
    let query = document.getElementById("searchInput").value.toLowerCase();
    let tbody = document.querySelector("#invoiceTable tbody");
    tbody.innerHTML = "";

    invoices.forEach((invoice, index) => {
      const match =
        invoice.id.toLowerCase().includes(query) ||
        invoice.date.toLowerCase().includes(query) ||
        invoice.products.some((p) => p.name.toLowerCase().includes(query));

      if (match) {
        invoice.products.forEach((p, i) => {
          tbody.innerHTML += `
                <tr>
                    <td>${i === 0 ? invoice.id : ""}</td>
                    <td>${p.name}</td>
                    <td>${invoice.date}</td>
                    <td>${p.price}</td>
                    <td>${p.qty}</td>
                    ${
                      i === 0
                        ? `
                    <td>
                        <button class="edit" onclick="editInvoice(${index})">Sửa</button>
                        <button class="delete" onclick="deleteInvoice(${index})">Xóa</button>
                    </td>`
                        : `<td></td>`
                    }
                </tr>`;
        });
      }
    });
  }

  function deleteInvoice(index) {
    if (confirm("Bạn có chắc muốn xóa phiếu này?")) {
      invoices.splice(index, 1);
      renderTable();
    }
  }

  renderTable();
  
  // Expose các hàm ra window
  window.addProductRow = addProductRow;
  window.updatePrice = updatePrice; // [THÊM MỚI] Expose hàm cập nhật giá
  window.saveInvoice = saveInvoice;
  window.editInvoice = editInvoice;
  window.deleteInvoice = deleteInvoice;
  window.updateInvoice = updateInvoice;
  window.cancelEdit = cancelEdit;
  window.searchInvoice = searchInvoice;
}