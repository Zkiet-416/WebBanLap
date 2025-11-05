// =======================
// pricing.js (v3 - styled modal + linked profit update + keep search state)
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

function savePricingToLocalStorage(data) {
  try {
    localStorage.setItem("adminProductData", JSON.stringify(data));
    console.log("✅ adminProductData saved to localStorage.");
  } catch (e) {
    console.error("❌ Failed saving adminProductData:", e);
  }
}

function loadPricingFromLocalStorage() {
  try {
    const s = localStorage.getItem("adminProductData");
    if (!s) return null;
    return JSON.parse(s);
  } catch (e) {
    console.error("❌ Failed reading adminProductData:", e);
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

function buildProductsFromAdminProduct(globalJsonData) {
  const productTypes = ["laptop", "balo", "phukienkhac"];
  const out = [];

  if (!globalJsonData || !globalJsonData.product || !Array.isArray(globalJsonData.product.brand)) {
    console.warn("AdminProduct data không hợp lệ hoặc không tồn tại.");
    return out;
  }

  globalJsonData.product.brand.forEach((brandObj) => {
    const brandName = brandObj.name || "Không rõ";
    productTypes.forEach((type) => {
      const arr = Array.isArray(brandObj[type]) ? brandObj[type] : [];
      arr.forEach((p) => {
        const rawPrice = parsePriceString(p.price);
        const sellPrice = rawPrice;
        // ✅ giá nhập mặc định = 90% giá bán
        const importPrice = Math.round(sellPrice * 0.9);
        const profit = sellPrice > 0 ? ((sellPrice - importPrice) / sellPrice) * 100 : 0;

        out.push({
          id: p.id || `${brandName}-${type}-${Math.random().toString(36).slice(2,8)}`,
          name: p.model || p.name || "Unknown",
          brand: brandName,
          type: brandName,
          importPrice,
          sellPrice,
          profit: parseFloat(profit.toFixed(1)),
        });
      });
    });
  });

  return out;
}

async function loadPricing() {
  const content = document.getElementById("content");
  if (!content) return;

  let products = loadPricingFromLocalStorage();
  if (!products || !products.length) {
    if (window.globalJsonData) {
      console.log("ℹ️ Lấy dữ liệu từ globalJsonData (AdminProduct.js).");
      products = buildProductsFromAdminProduct(window.globalJsonData);
      savePricingToLocalStorage(products);
    } else {
      console.error("❌ Không tìm thấy dữ liệu AdminProduct.");
      return;
    }
  }

  // tạo danh sách loại
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
        products.forEach(p => {
          if (p.brand === item.name) {
            p.profit = parseFloat(newProfit.toFixed(1));
            p.sellPrice = Math.round(p.importPrice * (1 + newProfit / 100));
          }
        });
      } else {
        item.profit = parseFloat(newProfit.toFixed(1));
        item.sellPrice = Math.round(item.importPrice * (1 + newProfit / 100));
        products[index] = item;
      }
      // Cập nhật danh mục trung bình
      categories = getCategories();
      savePricingToLocalStorage(products);
      overlay.remove();
      render(filterData(searchKeyword));
    };
  }

  render(products);
}

window.loadPricing = loadPricing;
