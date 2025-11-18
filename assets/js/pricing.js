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

// ✅ HÀM FORMAT GIÁ VỀ DẠNG CÓ DẤU CHẤM (16.390.000)
function formatPriceToString(price) {
  const priceNum = Math.round(Number(price) || 0);
  return priceNum.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

// ✅ HÀM LƯU MỚI - ĐỒNG BỘ CẢ 2 CHIỀU
function savePricingToLocalStorage(flatData) {
  try {
    // 1. Lưu dữ liệu FLAT cho trang User (products.js, main.html)
    localStorage.setItem("laptopProducts", JSON.stringify(flatData));
    console.log("✅ Đã lưu laptopProducts (flat array)");
    
    // 2. CẬP NHẬT NGƯỢC LẠI adminProductData (nested object)
    const adminData = localStorage.getItem("adminProductData");
    if (adminData) {
      try {
        const parsedAdminData = JSON.parse(adminData);
        
        // Duyệt qua từng sản phẩm trong flatData và cập nhật vào cấu trúc nested
        flatData.forEach(product => {
          const brandGroup = parsedAdminData.product.brand.find(b => {
            const category = product.category === "laptop" ? "laptop" : product.type;
            return b.name === (product.category === "laptop" ? "laptop" : product.type) || 
                   b.name === category;
          });
          
          if (brandGroup) {
            let arrayKey;
            if (product.category === "laptop") {
              arrayKey = "laptop";
            } else {
              arrayKey = product.type;
            }
            
            const productArray = brandGroup[arrayKey];
            if (Array.isArray(productArray)) {
              const targetProduct = productArray.find(p => p.id === product.id);
              
              if (targetProduct) {
                targetProduct.price = formatPriceToString(product.priceValue);
                
                if (product.importPrice !== undefined) {
                  targetProduct.importPrice = product.importPrice;
                }
                if (product.profit !== undefined) {
                  targetProduct.profit = product.profit;
                }
              }
            }
          }
        });
        
        // 3. Lưu lại adminProductData đã được cập nhật
        localStorage.setItem("adminProductData", JSON.stringify(parsedAdminData));
        console.log("✅ Đã đồng bộ ngược về adminProductData (nested object)");
        
      } catch (e) {
        console.error("⚠️ Không thể parse adminProductData:", e);
      }
    } else {
      console.warn("⚠️ Chưa có adminProductData trong localStorage");
    }
    
    // 4. Cập nhật window.allProducts nếu có
    if (window.allProducts) {
      window.allProducts = flatData;
    }
    
    // ✅ 5. THÊM MỚI: Trigger custom event để đồng bộ TRONG CÙNG TAB
    window.dispatchEvent(new CustomEvent('productsUpdated', { 
      detail: { products: flatData } 
    }));
    
    // ✅ 6. THÊM MỚI: Gửi tín hiệu broadcast cho các tab khác
    // (storage event tự động trigger, nhưng ta log để debug)
    console.log("📡 Đã gửi tín hiệu cập nhật tới các tab khác");
    
  } catch (e) {
    console.error("❌ Failed saving and syncing data:", e);
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
    .replace(/Đ/g, "d").replace(/Đ/g, "D")
    .toLowerCase();
}

async function loadPricing() {
  const content = document.getElementById("content");
  if (!content) return;

  // Đọc dữ liệu từ localStorage
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

  // Chuẩn hóa dữ liệu: đảm bảo có đủ trường cần thiết
  let needsUpdate = false;
  products = products.map(p => {
    const sellPrice = p.priceValue || 0;
    let importPrice = p.importPrice;
    let profit = p.profit;

    // Nếu chưa có importPrice thì tự tạo mặc định (90% giá bán)
    if (!importPrice || importPrice === 0) {
      importPrice = Math.round(sellPrice * 0.9);
      needsUpdate = true;
    }

    // Nếu chưa có profit, tính lại
    if (profit === undefined || profit === null || isNaN(profit)) {
      profit = sellPrice > 0 ? ((sellPrice - importPrice) / sellPrice) * 100 : 0;
      needsUpdate = true;
    }

    // ✅ XÁC ĐỊNH "LOẠI" THEO LOGIC CỦA ADMINPRODUCT.JS
    let displayBrand = "Khác";
    
    // Lấy prefix 2 ký tự đầu của ID để xác định loại
    const idPrefix = p.id ? p.id.substring(0, 2).toUpperCase() : "";
    
    if (idPrefix === 'AC') {
      displayBrand = "Laptop"; // Acer
    } else if (idPrefix === 'AS') {
      displayBrand = "Laptop"; // Asus
    } else if (idPrefix === 'HP') {
      displayBrand = "Laptop"; // HP
    } else if (idPrefix === 'LE') {
      displayBrand = "Laptop"; // Lenovo
    } else if (idPrefix === 'DE') {
      displayBrand = "Laptop"; // Dell
    } else if (p.id && p.id.toLowerCase().includes('balo')) {
      displayBrand = "Balo";
    } else if (p.id && p.id.toLowerCase().includes('de-tan-nhiet')) {
      displayBrand = "Đế tản nhiệt";
    } else if (p.id && p.id.toLowerCase().includes('tai-nghe')) {
      displayBrand = "Tai nghe";
    } else if (p.id && p.id.toLowerCase().includes('chuot')) {
      displayBrand = "Chuột";
    } else if (p.id && p.id.toLowerCase().includes('ban-phim')) {
      displayBrand = "Bàn phím";
    } else if (p.category === "laptop") {
      displayBrand = "Laptop";
    } else if (p.category === "phukien") {
      // Fallback: dựa vào type nếu không match ID
      const typeDisplayMap = {
        "balo": "Balo",
        "de-tan-nhiet": "Đế tản nhiệt",
        "tai-nghe": "Tai nghe",
        "chuot": "Chuột",
        "ban-phim": "Bàn phím"
      };
      displayBrand = typeDisplayMap[p.type] || "Phụ kiện";
    }

    return {
      id: p.id,
      name: p.model || p.name || "Unknown",
      brand: displayBrand, // ✅ Loại sản phẩm (Laptop, Balo, Đế tản nhiệt...)
      type: p.type, // Type gốc (Acer, Asus, balo, de-tan-nhiet...)
      category: p.category || "laptop",
      importPrice,
      sellPrice,
      profit: parseFloat(profit.toFixed(1)),
      image: p.image,
      description: p.description,
      status: p.status,
      qty: p.qty,
      originalProduct: p
    };
  });

  // ✅ Nếu có sản phẩm chưa có importPrice, lưu lại ngay
  if (needsUpdate) {
    const updatedProducts = products.map(p => {
      return {
        ...p.originalProduct,
        importPrice: p.importPrice,
        profit: p.profit,
        priceValue: p.sellPrice
      };
    });
    savePricingToLocalStorage(updatedProducts);
    console.log("✅ Đã tự động thêm importPrice cho các sản phẩm chưa có");
  }

  // Tạo danh sách loại (theo brand/type - name của branch trong products.js)
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
  let filteredProducts = []; // ✅ Lưu danh sách đã filter

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
      ? pageData.map((item, i) => {
          // ✅ LƯU ORIGINAL INDEX để tìm đúng sản phẩm khi edit
          const originalIndex = products.findIndex(p => p.id === item.id);
          return `
            <tr>
              <td>${item.brand}</td>
              <td>${item.name}</td>
              <td>${(item.importPrice || 0).toLocaleString("vi-VN")}</td>
              <td>${(item.sellPrice || 0).toLocaleString("vi-VN")}</td>
              <td>${formatProfit(item.profit || 0)}</td>
              <td><button class="edit-btn" data-original-index="${originalIndex}">Sửa</button></td>
            </tr>
          `;
        }).join("")
      : pageData.map((cat, i) => {
          const originalIndex = categories.findIndex(c => c.name === cat.name);
          return `
            <tr>
              <td>${cat.name}</td>
              <td>${formatProfit(cat.profit)}</td>
              <td><button class="edit-btn" data-original-index="${originalIndex}">Sửa</button></td>
            </tr>
          `;
        }).join("");

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

  // ✅ CHỈ RENDER PHẦN WRAPPER, KHÔNG LÀM MẤT FOCUS INPUT
  function updateTableOnly(data) {
    const wrapper = document.querySelector(".pricing-wrapper");
    if (wrapper) {
      wrapper.innerHTML = renderTable(data);
      attachTableEvents();
    }
  }

  function render(data) {
    content.innerHTML = `
      <h1 class="page-title">Giá bán</h1>

      <!-- 🔍 THANH TÌMKIEM RIÊNG CHO PRICING -->
      <div class="pricing-search">
        <input type="text" id="pricingSearchInput" placeholder="Tìm kiếm sản phẩm hoặc loại..." value="${searchKeyword}">
      </div>

      <div class="pricing-wrapper">
        ${renderTable(data)}
      </div>
    `;
    attachAllEvents();
  }

  function filterData(keyword) {
    if (!keyword) {
      filteredProducts = [];
      return mode === "product" ? products : categories;
    }
    const kw = normalizeForSearch(keyword);
    
    if (mode === "product") {
      filteredProducts = products.filter((item) => {
        const txt = `${item.name} ${item.brand} ${item.importPrice} ${item.sellPrice} ${item.profit}`;
        return normalizeForSearch(txt).includes(kw);
      });
      return filteredProducts;
    } else {
      return categories.filter((item) => {
        const txt = `${item.name} ${item.profit}`;
        return normalizeForSearch(txt).includes(kw);
      });
    }
  }

  // ✅ GẮN SỰ KIỆN CHỈ CHO BẢNG VÀ PAGINATION
  function attachTableEvents() {
    const modeBtn = document.getElementById("modeSwitch");
    if (modeBtn) {
      modeBtn.onclick = () => {
        mode = mode === "product" ? "category" : "product";
        currentPage = 1;
        searchKeyword = "";
        filteredProducts = [];
        categories = getCategories();
        render(filterData(searchKeyword));
      };
    }

    const paginationEl = document.querySelector(".pagination");
    if (paginationEl) {
      paginationEl.onclick = (e) => {
        const btn = e.target.closest(".page-btn");
        if (!btn) return;
        currentPage = parseInt(btn.dataset.page);
        updateTableOnly(filterData(searchKeyword));
      };
    }

    const tableEl = document.querySelector(".pricing-table");
    if (tableEl) {
      tableEl.onclick = (e) => {
        const btn = e.target.closest(".edit-btn");
        if (!btn) return;
        const originalIndex = parseInt(btn.dataset.originalIndex);
        if (mode === "product") openEditModal(products[originalIndex], originalIndex, false);
        else openEditModal(categories[originalIndex], originalIndex, true);
      };
    }
  }

  // ✅ GẮN TẤT CẢ SỰ KIỆN (BAO GỒM SEARCH)
  function attachAllEvents() {
    // Event cho search input
    const searchInput = document.getElementById("pricingSearchInput");
    if (searchInput) {
      searchInput.oninput = (e) => {
        searchKeyword = e.target.value.trim();
        currentPage = 1;
        updateTableOnly(filterData(searchKeyword)); // ✅ CHỈ UPDATE BẢNG
      };
    }

    // Các event khác
    attachTableEvents();
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
      <input type="text" id="newProfit" placeholder="Nhập % lợi nhuận mới (chỉ số)">
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
      <input type="text" id="newProfit" placeholder="Nhập % lợi nhuận mới (chỉ số)">
      <div class="modal-buttons">
        <button class="save-btn">Save</button>
        <button class="cancel-btn">Cancel</button>
      </div>`;

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    // ✅ THÊM VALIDATION CHO INPUT - CHỈ NHẬP SỐ
    const profitInput = document.getElementById("newProfit");
    profitInput.addEventListener("input", function(e) {
      this.value = this.value.replace(/[^0-9.]/g, '');
      const parts = this.value.split('.');
      if (parts.length > 2) {
        this.value = parts[0] + '.' + parts.slice(1).join('');
      }
    });

    profitInput.addEventListener("paste", function(e) {
      e.preventDefault();
      const pastedText = (e.clipboardData || window.clipboardData).getData('text');
      const numbersOnly = pastedText.replace(/[^0-9.]/g, '');
      this.value = numbersOnly;
    });

    modal.querySelector(".cancel-btn").onclick = () => overlay.remove();
    modal.querySelector(".save-btn").onclick = () => {
      const newProfitValue = document.getElementById("newProfit").value.trim();
      
      if (!newProfitValue) {
        alert("Vui lòng nhập % lợi nhuận mới!");
        return;
      }
      
      const newProfit = parseFloat(newProfitValue);
      
      if (isNaN(newProfit)) {
        alert("Giá trị không hợp lệ! Vui lòng chỉ nhập số.");
        return;
      }
      
      if (newProfit < 0 || newProfit > 100) {
        alert("% Lợi nhuận phải từ 0 đến 100!");
        return;
      }
      
      if (isCategory) {
        // Cập nhật tất cả sản phẩm trong loại
        products.forEach(p => {
          if (p.brand === item.name) {
            p.profit = parseFloat(newProfit.toFixed(1));
            p.sellPrice = Math.round(p.importPrice * (1 + newProfit / 100));
          }
        });
      } else {
        // Cập nhật sản phẩm đơn lẻ
        item.profit = parseFloat(newProfit.toFixed(1));
        item.sellPrice = Math.round(item.importPrice * (1 + newProfit / 100));
        products[index] = item;
      }
      
      // ✅ CHUYỂN ĐỔI VỀ FORMAT GỐC VỚI GIÁ CÓ DẤU CHẤM
      const updatedProducts = products.map(p => {
        return {
          id: p.originalProduct.id,
          model: p.originalProduct.model || p.name,
          price: formatPriceToString(p.sellPrice), // ✅ Format: "16.390.000"
          status: p.originalProduct.status,
          image: p.originalProduct.image,
          description: p.originalProduct.description,
          qty: p.originalProduct.qty,
          priceValue: p.sellPrice, // ✅ Số: 16390000
          importPrice: p.importPrice,
          profit: p.profit,
          category: p.category,
          type: p.type
        };
      });
      
      // Cập nhật danh mục trung bình
      categories = getCategories();
      
      // Lưu vào localStorage
      savePricingToLocalStorage(updatedProducts);
      
      overlay.remove();
      
      // ✅ CHỈ UPDATE BẢNG, GIỮ NGUYÊN SEARCH INPUT
      updateTableOnly(filterData(searchKeyword));
      
      alert("✅ Đã cập nhật giá bán thành công!");
      console.log("✅ Đã cập nhật và đồng bộ!");
    };
  }

  render(products);
}

window.loadPricing = loadPricing;