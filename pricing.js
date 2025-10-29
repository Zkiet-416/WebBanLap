function loadPricing() {
  const content = document.getElementById("content");

  // ==== DỮ LIỆU MẪU ====
  const products = [
    { name: "Laptop Accer Aspire 7", category: "Laptop Accer", importPrice: 18000000, sellPrice: 18990000, profit: 5.5 },
    { name: "Laptop Accer Aspire 5", category: "Laptop Accer", importPrice: 13500000, sellPrice: 14490000, profit: 7.3 },
    { name: "Laptop Asus VivoBook", category: "Laptop Asus", importPrice: 12500000, sellPrice: 13350000, profit: 6.8 },
    { name: "Laptop Dell Inspiron", category: "Laptop Dell", importPrice: 15500000, sellPrice: 16600000, profit: 7.1 },
  ];

  const categories = [
    { name: "Laptop Accer", profit: 5.5 },
    { name: "Laptop Asus", profit: 7.3 },
    { name: "Laptop Dell", profit: 7.1 },
    { name: "Laptop HP", profit: 6.2 },
  ];

  let currentPage = 1;
  const itemsPerPage = 3;
  let mode = "product"; // hoặc "category"

  // ==== RENDER BẢNG ====
  const renderTable = (data) => {
    const start = (currentPage - 1) * itemsPerPage;
    const pageData = data.slice(start, start + itemsPerPage);

    const rows = pageData
      .map(
        (item, i) =>
          mode === "product"
            ? `<tr>
                <td>${item.name}</td>
                <td>${item.importPrice.toLocaleString()}</td>
                <td>${item.sellPrice.toLocaleString()}</td>
                <td>${item.profit}%</td>
                <td><button class="edit-btn" data-index="${i}">Sửa</button></td>
              </tr>`
            : `<tr>
                <td>${item.name}</td>
                <td>${item.profit}%</td>
                <td><button class="edit-btn" data-index="${i}">Sửa</button></td>
              </tr>`
      )
      .join("");

    const totalPages = Math.ceil(data.length / itemsPerPage);
    const pagination = Array.from({ length: totalPages }, (_, i) =>
      `<button class="page-btn ${i + 1 === currentPage ? "active" : ""}" data-page="${i + 1}">${i + 1}</button>`
    ).join("");

    return `
      <div class="pricing-header">
        <button class="switch-btn">${mode === "product" ? "Loại sản phẩm" : "Sản phẩm"}</button>
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

  const render = (data) => {
    content.innerHTML = `
      <h1 class="page-title">Giá bán</h1>
      <div class="pricing-wrapper">${renderTable(data)}</div>
    `;
    attachEvents(data);
  };

  // ==== GÁN SỰ KIỆN ====
  const attachEvents = (data) => {
    // Nút chuyển chế độ
    document.querySelector(".switch-btn").onclick = () => {
      mode = mode === "product" ? "category" : "product";
      currentPage = 1;
      render(mode === "product" ? products : categories);
    };

    // Nút sửa
    document.querySelectorAll(".edit-btn").forEach((btn) => {
      btn.onclick = () => openEditModal(data[btn.dataset.index]);
    });

    // Phân trang
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
        <input type="text" value="${item.profit}" disabled />

        <label>% Lợi nhuận mới</label>
        <input type="number" id="newProfit" placeholder="Nhập lợi nhuận mới" />

        ${
          mode === "product"
            ? `<label>Giá mới</label>
               <input type="number" id="newPrice" placeholder="Tự động tính" disabled />`
            : ""
        }

        <div class="modal-buttons">
          <button class="save-btn">Save</button>
          <button class="cancel-btn">Cancel</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    // Hiệu ứng mờ nền
    setTimeout(() => modal.classList.add("show"), 10);

    const newProfitInput = modal.querySelector("#newProfit");
    const newPriceInput = modal.querySelector("#newPrice");

    // Khi nhập % lợi nhuận mới → tự động tính giá bán mới
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

    modal.querySelector(".cancel-btn").onclick = () => {
      modal.classList.remove("show");
      setTimeout(() => modal.remove(), 300);
    };

    modal.querySelector(".save-btn").onclick = () => {
      const newProfit = parseFloat(newProfitInput.value);
      if (isNaN(newProfit) || newProfit <= 0) {
        alert("Vui lòng nhập lợi nhuận hợp lệ!");
        return;
      }

      if (mode === "product") {
        // Cập nhật sản phẩm
        item.profit = newProfit;
        item.sellPrice = Math.round(item.importPrice * (1 + newProfit / 100));
      } else {
        // Cập nhật loại sản phẩm + toàn bộ sản phẩm cùng loại
        item.profit = newProfit;
        products.forEach((p) => {
          if (p.category === item.name) {
            p.profit = newProfit;
            p.sellPrice = Math.round(p.importPrice * (1 + newProfit / 100));
          }
        });
      }

      alert("Đã lưu thay đổi thành công!");
      modal.classList.remove("show");
      setTimeout(() => modal.remove(), 300);
      render(mode === "product" ? products : categories);
    };
  };

  // ==== TÌM KIẾM ====
  const searchBox = document.querySelector(".search-box");
  searchBox.oninput = (e) => {
    const keyword = e.target.value.toLowerCase();
    const filtered =
      mode === "product"
        ? products.filter((p) => p.name.toLowerCase().includes(keyword))
        : categories.filter((c) => c.name.toLowerCase().includes(keyword));
    render(filtered);
  };

  // ==== HIỂN THỊ LẦN ĐẦU ====
  render(products);
}