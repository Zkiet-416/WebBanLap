function formatCategoryName(name) {
  if (!name) return "";
  return name
    .split("-")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

async function loadPricing() {
  const content = document.getElementById("content");

  // ==== ĐỌC DỮ LIỆU TỪ FILE JSON ====
  let products = [];
  try {
    const res = await fetch("/WebBanLap-main/products.json");
    products = await res.json();
  } catch (error) {
    console.error("❌ Lỗi khi đọc products.json:", error);
    content.innerHTML = "<p>Không thể tải dữ liệu sản phẩm!</p>";
    return;
  }

  // ==== XỬ LÝ DỮ LIỆU ====
  products = products.map((p) => {
    const importPrice = Math.round((p.price || 0) * 0.9); // Giả định giá nhập = 90% giá bán
    const sellPrice = p.price || 0;
    const profit = ((sellPrice - importPrice) / importPrice) * 100; // ✅ Tính lợi nhuận thực tế
    return {
      name: p.name,
      category: p.type || "Khác",
      importPrice,
      sellPrice,
      profit,
    };
  });

// ==== TÍNH LỢI NHUẬN TRUNG BÌNH CHO LOẠI SẢN PHẨM ====
const categoryMap = {};
products.forEach((p) => {
  if (!categoryMap[p.category]) {
    categoryMap[p.category] = {
      name: p.category,
      totalProfit: 0,
      count: 0,
    };
  }
  const profit = ((p.sellPrice - p.importPrice) / p.importPrice) * 100;
  categoryMap[p.category].totalProfit += profit;
  categoryMap[p.category].count += 1;
});
const categories = Object.values(categoryMap).map(cat => ({
  name: cat.name,
  profit: (cat.totalProfit / cat.count).toFixed(1),
}));

  // ==== BIẾN TRẠNG THÁI ====
  let currentPage = 1;
  const itemsPerPage = 10;
  let mode = "product";

  // ==== HÀM HIỂN THỊ BẢNG ====
  const renderTable = (data) => {
    const start = (currentPage - 1) * itemsPerPage;
    const pageData = data.slice(start, start + itemsPerPage);

    const rows = pageData
      .map(
        (item, i) =>
          mode === "product"
            ? `<tr>
                <td>${formatCategoryName(item.name)}</td>
                <td>${item.importPrice.toLocaleString("vi-VN")}</td>
                <td>${item.sellPrice.toLocaleString("vi-VN")}</td>
                <td>${(Math.round(item.profit * 10) / 10).toFixed(item.profit % 1 === 0 ? 0 : 1)}%</td>
                <td><button class="edit-btn" data-index="${i}">Sửa</button></td>
              </tr>`
            : `<tr>
                <td>${formatCategoryName(item.name)}</td>
                <td>${item.profit}%</td>
                <td><button class="edit-btn" data-index="${i}">Sửa</button></td>
              </tr>`
      )
      .join("");

    const totalPages = Math.ceil(data.length / itemsPerPage);
    const pagination = Array.from({ length: totalPages }, (_, i) =>
      `<button class="page-btn ${i + 1 === currentPage ? "active" : ""}" data-page="${
        i + 1
      }">${i + 1}</button>`
    ).join("");

    return `
      <div class="pricing-header">
        <button class="switch-btn">${
          mode === "product" ? "Loại sản phẩm" : "Sản phẩm"
        }</button>
      </div>
      <table class="pricing-table">
        <thead>
          <tr>
            ${
              mode === "product"
                ? "<th>Tên sản phẩm</th><th>Giá nhập</th><th>Giá bán</th><th>% lợi nhuận</th><th></th>"
                : "<th>Loại sản phẩm</th><th>% lợi nhuận</th><th></th>"
            }
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
      <div class="pagination">${pagination}</div>
    `;
  };

  // ==== RENDER TRANG ====
  const render = (data) => {
    content.innerHTML = `
      <h1 class="page-title">Giá bán</h1>
      <div class="pricing-wrapper">${renderTable(data)}</div>
    `;
    attachEvents(data);
  };

  // ==== GÁN SỰ KIỆN ====
  const attachEvents = (data) => {
    document.querySelector(".switch-btn").onclick = () => {
      mode = mode === "product" ? "category" : "product";
      currentPage = 1;
      render(mode === "product" ? products : categories);
    };

    document.querySelectorAll(".edit-btn").forEach((btn) => {
      btn.onclick = () => openEditModal(data[btn.dataset.index]);
    });

    document.querySelectorAll(".page-btn").forEach((btn) => {
      btn.onclick = () => {
        currentPage = parseInt(btn.dataset.page);
        render(mode === "product" ? products : categories);
      };
    });
  };

  // ==== POPUP SỬA ====
const openEditModal = (item) => {
  const modal = document.createElement("div");
  modal.className = "modal-overlay";
  modal.innerHTML = `
    <div class="modal scale-in">
      <h2>${mode === "product" ? "Tên sản phẩm" : "Loại sản phẩm"}</h2>
      <input type="text" value="${item.name}" disabled />

      <label>% Lợi nhuận cũ</label>
      <input type="text" value="${parseFloat(item.profit).toFixed(1)}" disabled />

      <label>% Lợi nhuận mới</label>
      <input type="number" id="newProfit" placeholder="Nhập lợi nhuận mới" />

      ${
        mode === "product"
          ? `<label>Giá mới</label>
             <input type="number" id="newPrice" placeholder="Tự động tính" disabled />`
          : ""
      }

      <div class="modal-buttons">
        <button class="save-btn">Lưu</button>
        <button class="cancel-btn">Hủy</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  setTimeout(() => modal.classList.add("show"), 10);

  const newProfitInput = modal.querySelector("#newProfit");
  const newPriceInput = modal.querySelector("#newPrice");

  // === Khi đang ở chế độ "Sản phẩm"
  if (mode === "product") {
    newProfitInput.addEventListener("input", () => {
      const newProfit = parseFloat(newProfitInput.value);
      if (!isNaN(newProfit)) {
        const newPrice = Math.round(item.importPrice * (1 + newProfit / 100));
        newPriceInput.value = newPrice;
      } else {
        newPriceInput.value = "";
      }
    });
  }

  // === Nút Hủy
  modal.querySelector(".cancel-btn").onclick = () => {
    modal.classList.remove("show");
    setTimeout(() => modal.remove(), 300);
  };

  // === Nút Lưu
  modal.querySelector(".save-btn").onclick = () => {
    const newProfit = parseFloat(newProfitInput.value);
    if (isNaN(newProfit) || newProfit <= 0) {
      alert("Vui lòng nhập lợi nhuận hợp lệ!");
      return;
    }

    if (mode === "product") {
      // Sửa từng sản phẩm
      item.profit = newProfit;
      item.sellPrice = Math.round(item.importPrice * (1 + newProfit / 100));
    } else {
      // === Sửa loại sản phẩm: ảnh hưởng đến tất cả sản phẩm cùng loại
      const categoryName = item.name;
      products.forEach((p) => {
        if (p.category === categoryName) {
          p.profit = newProfit;
          p.sellPrice = Math.round(p.importPrice * (1 + newProfit / 100));
        }
      });
      // Cập nhật lại loại sản phẩm đang hiển thị
      item.profit = newProfit;
    }

    alert("✅ Đã lưu thay đổi thành công!");
    modal.classList.remove("show");
    setTimeout(() => modal.remove(), 300);
    render(mode === "product" ? products : categories);
  };
};

// ==== TÌM KIẾM (CÓ HỖ TRỢ DẤU VÀ RESET PHÂN TRANG) ====
const searchBox = document.querySelector(".search-box");
if (searchBox) {
  searchBox.oninput = (e) => {
    const keyword = removeVietnameseTones(e.target.value.trim().toLowerCase());

    // Reset về trang đầu tiên
    currentPage = 1;

    const filtered =
      mode === "product"
        ? products.filter((p) =>
            removeVietnameseTones(p.name.toLowerCase()).includes(keyword)
          )
        : categories.filter((c) =>
            removeVietnameseTones(c.name.toLowerCase()).includes(keyword)
          );

    render(filtered);
  };
}

// === HÀM LOẠI BỎ DẤU TIẾNG VIỆT ===
function removeVietnameseTones(str) {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // bỏ dấu
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");
}

  // ==== HIỂN THỊ LẦN ĐẦU ====
  render(products);
}
