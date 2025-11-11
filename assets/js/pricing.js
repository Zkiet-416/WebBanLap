// =======================
// pricing.js (v4 - sync với user qua laptopProducts)
// =======================

function parsePriceString(price) {
  if (typeof price === "number") return Math.round(price);
  if (!price) return 0;
  return Math.round(
    Number(
      price.toString()
        .replace(/\s/g, "")
        .replace(/\./g, "")
        .replace(/,/g, "")
        .replace(/[^\d\-\.]/g, "")
    ) || 0
  );
}

// Lưu vào localStorage với key "laptopProducts" để đồng bộ với user
function savePricingToLocalStorage(data) {
  try {
    localStorage.setItem("laptopProducts", JSON.stringify(data));
    console.log("✅ laptopProducts saved to localStorage (sync with user).");
  } catch (e) {
    console.error("❌ Failed saving laptopProducts:", e);
  }
}

// Đọc từ localStorage key "laptopProducts" 
function loadPricingFromLocalStorage() {
  try {
    const s = localStorage.getItem("laptopProducts");
    if (!s) return null;
    return JSON.parse(s);
  } catch (e) {
    console.error("❌ Failed reading laptopProducts:", e);
    return null;
  }
}

function normalizeForSearch(s) {
  if (!s) return "";
  return s.toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d").replace(/Đ/g, "D")
    .toLowerCase();
}

async function loadPricing() {
  const content = document.getElementById("content");
  if (!content) return;

  // Đọc dữ liệu từ localStorage (đồng bộ với user)
  let products = loadPricingFromLocalStorage();
  
  if (!products || !Array.isArray(products) || products.length === 0) {
    console.error("❌ Không tìm thấy dữ liệu laptopProducts trong localStorage.");
    content.innerHTML = `
      <h1 class="page-title">Giá bán</h1>
      <p style="text-align:center; margin-top:50px;">
        Không có dữ liệu sản phẩm. Vui lòng kiểm tra lại.
      </p>`;
    return;
  }

  // Chuyển đổi dữ liệu từ format user sang format admin
  let needsUpdate = false;
  products = products.map(p => {
    const sellPrice = p.priceValue || 0;
    let importPrice = p.importPrice;
    let profit = p.profit; // ✅ ưu tiên lấy profit đã lưu, không tính lại

    // Nếu chưa có importPrice thì tự tạo mặc định
    if (!importPrice || importPrice === 0) {
      importPrice = Math.round(sellPrice * 0.9);
    }

    // Nếu chưa có profit, mới tính lại
    if (profit === undefined || profit === null || isNaN(profit)) {
      profit = sellPrice > 0 ? ((sellPrice - importPrice) / sellPrice) * 100 : 0;
    }

    return {
      id: p.id,
      name: p.name || "Unknown",
      brand: p.type || "Khác",
      type: p.type || "Khác",
      category: p.category || "laptop",
      importPrice,
      sellPrice,
      profit: parseFloat(profit.toFixed(1)),
      image: p.image,
      ram: p.ram,
      manHinh: p.manHinh,
      cardManHinh: p.cardManHinh,
      cpu: p.cpu,
      pin: p.pin,
      heDieuHanh: p.heDieuHanh
    };
  });

  // ✅ Nếu có sản phẩm chưa có importPrice, lưu lại ngay
  if (needsUpdate) {
  const userFormatProducts = products.map(p => ({
    id: p.id,
    type: p.type,
    name: p.name,
    priceValue: p.sellPrice,
    image: p.image,
    ram: p.ram,
    manHinh: p.manHinh,
    cardManHinh: p.cardManHinh,
    cpu: p.cpu,
    pin: p.pin,
    heDieuHanh: p.heDieuHanh,
    category: p.category,
    importPrice: p.importPrice,
    profit: p.profit // ✅ lưu thêm trường này để không bị tính lại sai
  }));
    savePricingToLocalStorage(userFormatProducts);
    console.log("✅ Đã tự động thêm importPrice cho các sản phẩm chưa có");
  }

  // Tạo danh sách loại
  function getCategories() {
    const categoryMap = {};
    products.forEach((p) => {
      const cat = p.brand || "Khác";
      if (!categoryMap[cat]) categoryMap[cat] = { name: cat, totalProfit: 0, count: 0 };
      categoryMap[cat].totalProfit += Number(p.profit || 0);
      categoryMap[cat].count += 1;
    });
    return Object.values(categoryMap).map(cat => ({
      name: cat.name,
      profit: cat.count ? parseFloat((cat.totalProfit / cat.count).toFixed(1)) : 0
    }));
  }

  let categories = getCategories();
  let mode = "product";
  let currentPage = 1;
  const itemsPerPage = 10;
  let searchKeyword = "";

  function formatProfit(value) {
    const n = Number(value);
    if (Number.isInteger(n)) return n + "%";
    return n.toFixed(1) + "%";
  }

  function renderTable(data) {
    const start = (currentPage - 1) * itemsPerPage;
    const pageData = data.slice(start, start + itemsPerPage);
    const totalPages = Math.max(1, Math.ceil(data.length / itemsPerPage));

    const tableRows = mode === "product"
      ? pageData.map((item, i) => `
        <tr>
          <td>${item.brand}</td>
          <td>${item.name}</td>
          <td>${(item.importPrice || 0).toLocaleString("vi-VN")}</td>
          <td>${(item.sellPrice || 0).toLocaleString("vi-VN")}</td>
          <td>${formatProfit(item.profit || 0)}</td>
          <td><button class="edit-btn" data-index="${start + i}">Sửa</button></td>
        </tr>`).join("")
      : pageData.map((cat, i) => `
        <tr>
          <td>${cat.name}</td>
          <td>${formatProfit(cat.profit)}</td>
          <td><button class="edit-btn" data-index="${start + i}">Sửa</button></td>
        </tr>`).join("");

    const pagination = Array.from({ length: totalPages }, (_, idx) => {
      const pageNum = idx + 1;
      return `<button class="page-btn ${pageNum === currentPage ? "active" : ""}" data-page="${pageNum}">${pageNum}</button>`;
    }).join("");

    return `
      <div class="pricing-header">
        <button id="modeSwitch" class="switch-btn">${mode === "product" ? "Xem theo loại" : "Xem theo sản phẩm"}</button>
      </div>
      <table class="pricing-table">
        <thead>
          ${mode === "product"
            ? "<tr><th>Loại</th><th>Tên sản phẩm</th><th>Giá nhập</th><th>Giá bán</th><th>% lợi nhuận</th><th></th></tr>"
            : "<tr><th>Loại</th><th>% lợi nhuận TB</th><th></th></tr>"
          }
        </thead>
        <tbody>${tableRows}</tbody>
      </table>
      <div class="pagination">${pagination}</div>`;
  }

  function render(data) {
    content.innerHTML = `<h1 class="page-title">Giá bán</h1><div class="pricing-wrapper">${renderTable(data)}</div>`;
    attachEvents();
  }

  function filterData(keyword) {
    if (!keyword) return mode === "product" ? products : categories;
    const kw = normalizeForSearch(keyword);
    return (mode === "product" ? products : categories).filter((item) => {
      const txt = mode === "product"
        ? `${item.name} ${item.brand} ${item.importPrice} ${item.sellPrice} ${item.profit}`
        : `${item.name} ${item.profit}`;
      return normalizeForSearch(txt).includes(kw);
    });
  }

  function attachEvents() {
    document.getElementById("modeSwitch").onclick = () => {
      mode = mode === "product" ? "category" : "product";
      currentPage = 1;
      categories = getCategories();
      render(filterData(searchKeyword));
    };

    document.querySelector(".pagination").onclick = (e) => {
      const btn = e.target.closest(".page-btn");
      if (!btn) return;
      currentPage = parseInt(btn.dataset.page);
      render(filterData(searchKeyword));
    };

    document.querySelector(".pricing-table").onclick = (e) => {
      const btn = e.target.closest(".edit-btn");
      if (!btn) return;
      const index = parseInt(btn.dataset.index);
      if (mode === "product") openEditModal(products[index], index, false);
      else openEditModal(categories[index], index, true);
    };

    const headerSearch = document.querySelector(".search-box input");
    if (headerSearch) {
      headerSearch.oninput = (e) => {
        searchKeyword = e.target.value.trim();
        currentPage = 1;
        render(filterData(searchKeyword));
      };
    }
  }

  function openEditModal(item, index, isCategory = false) {
    const oldModal = document.querySelector(".modal-overlay");
    if (oldModal) oldModal.remove();

    const overlay = document.createElement("div");
    overlay.className = "modal-overlay show";
    const modal = document.createElement("div");
    modal.className = "modal";

    modal.innerHTML = isCategory
      ? `
      <label>Loại sản phẩm</label>
      <input type="text" value="${item.name}" disabled>
      <label>% Lợi nhuận cũ</label>
      <input type="text" value="${item.profit}" disabled>
      <label>% Lợi nhuận mới</label>
      <input type="number" id="newProfit" value="${item.profit}">
      <div class="modal-buttons">
        <button class="save-btn">Save</button>
        <button class="cancel-btn">Cancel</button>
      </div>`
      : `
      <label>Loại sản phẩm</label>
      <input type="text" value="${item.brand}" disabled>
      <label>Tên sản phẩm</label>
      <input type="text" value="${item.name}" disabled>
      <label>% Lợi nhuận cũ</label>
      <input type="text" value="${item.profit}" disabled>
      <label>% Lợi nhuận mới</label>
      <input type="number" id="newProfit" value="${item.profit}">
      <div class="modal-buttons">
        <button class="save-btn">Save</button>
        <button class="cancel-btn">Cancel</button>
      </div>`;

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    modal.querySelector(".cancel-btn").onclick = () => overlay.remove();
    modal.querySelector(".save-btn").onclick = () => {
      const newProfit = parseFloat(document.getElementById("newProfit").value) || 0;
      
      if (isCategory) {
        // Cập nhật tất cả sản phẩm trong loại
        products.forEach(p => {
          if (p.brand === item.name) {
            p.profit = parseFloat(newProfit.toFixed(1));
            // 🛠️ **KHÔNG tính lại importPrice**
            // Thay vào đó: tính lại sellPrice dựa trên importPrice cố định và profit mới
            // sellPrice = importPrice * (1 + profit/100)
            p.sellPrice = Math.round(p.importPrice * (1 + newProfit / 100));
          }
        });
      } else {
        // Cập nhật sản phẩm đơn lẻ
        item.profit = parseFloat(newProfit.toFixed(1));
        // 🛠️ **KHÔNG tính lại importPrice**
        // Cập nhật sellPrice dựa trên importPrice cố định
        item.sellPrice = Math.round(item.importPrice * (1 + newProfit / 100));
        products[index] = item;
      }
      
      // Chuyển đổi lại về format user và lưu
      const userFormatProducts = products.map(p => ({
        id: p.id,
        type: p.type,
        name: p.name,
        priceValue: p.sellPrice,
        image: p.image,
        ram: p.ram,
        manHinh: p.manHinh,
        cardManHinh: p.cardManHinh,
        cpu: p.cpu,
        pin: p.pin,
        heDieuHanh: p.heDieuHanh,
        category: p.category,
        // Lưu thêm importPrice để admin có thể dùng lại
        importPrice: p.importPrice
      }));
      
      // Cập nhật danh mục trung bình
      categories = getCategories();
      
      // Lưu vào localStorage với format user
      savePricingToLocalStorage(userFormatProducts);
      
      overlay.remove();
      render(filterData(searchKeyword));
      
      console.log("✅ Đã cập nhật và đồng bộ với user!");
    };
  }

  render(products);
}

window.loadPricing = loadPricing;
