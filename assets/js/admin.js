document.addEventListener("DOMContentLoaded", () => {
  const content = document.getElementById("content");
  const menuItems = document.querySelectorAll(".menu-item");

  // === Thêm <link> CSS động ===
  let pageStyle = document.createElement("link");
  pageStyle.rel = "stylesheet";
  pageStyle.id = "page-style";
  document.head.appendChild(pageStyle);

  // === Load mặc định Dashboard ===
  loadDashboard();

  // === Gán sự kiện click cho menu ===
  menuItems.forEach((item) => {
    item.addEventListener("click", () => {
      menuItems.forEach((m) => m.classList.remove("active"));
      item.classList.add("active");

      const page = item.getAttribute("data-page");

      // Gỡ CSS cũ trước khi đổi trang
      pageStyle.removeAttribute("href");

      switch (page) {
        case "dashboard":
          loadDashboard();
          break;

        case "customers":
          content.innerHTML = `
            <h1 class="page-title">Khách hàng</h1>
            <p>Quản lý danh sách khách hàng tại đây.</p>`;
          break;

        case "categories":
          content.innerHTML = `
            <h1 class="page-title">Loại sản phẩm</h1>
            <p>Danh mục loại sản phẩm hiển thị ở đây.</p>`;
          break;

        case "products":
          // Gán CSS riêng cho trang sản phẩm
          pageStyle.href = "/WebBanLap/assets/css/AdminProduct.css";
          content.innerHTML = `
          <div class="container-simple">
        <div>
            <h1 class="page-title">Sản phẩm</h1>
        </div>

        <div class="search-box" style="margin-bottom:20px;">
            <input type="text" id="brand-search-input" placeholder="Tìm kiếm theo tên" >
            <i class="fas fa-search"></i>
        </div>

        <div id="brand-management-area">
            <main class="main-content">
                <div class="table-and-pagination-wrapper">
                    <section class="table-container">
                        <div class="product-type-table">
                            <table >
                                <thead >
                                    <tr>
                                        <th>ID</th>
                                        <th>Tên / Thương hiệu</th>
                                        <th>Số lượng</th>
                                        <th>Trạng thái</th>
                                        <th>Thao tác</th> 
                                    </tr>
                                </thead>
                                <tbody id="brand-list-tbody">
                                </tbody >
                            </table>
                        </div>
                    </section>
                    <div id="brand-pagination-container" class="pagination-container"></div>
                </div>

                <aside class="add-product-form">
                    <div class="form-header">
                        <h3 id="form-header">THÊM LOẠI SẢN PHẨM</h3>
                    </div>
                    <div class="form-body">
                        <label for="ten">Tên / Thương hiệu:</label>
                        <input type="text" id="ten" class="form-input">

                        <label for="soluong">Số lượng ban đầu:</label>
                        <input type="number" id="soluong" class="form-input" min="0" value="0" disabled> 

                        <div class="form-actions">
                            <button class="btn btn-reset">Đặt lại</button>
                            <button class="btn btn-submit">Hoàn tất</button>
                        </div>
                    </div>
                </aside>
            </main>
        </div>

        <div id="product-details-area" class="sp-content-area">
            <div class="sp-controls-row-top">
                <button class="back-button" onclick="hideProductDetails()">
                    <i class="fas fa-arrow-left"></i> Quay lại
                </button>
                <button class="sp-create-button" onclick="addNewProduct()">+ Thêm Sản Phẩm</button>
            </div>
            
            <div class="table-and-pagination-wrapper">
                <div class="sp-product-table-wrapper"> 
                    <div class="sp-product-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>Mã SP</th> <th>Tên / Loại Sản Phẩm</th>
                                    <th>Giá tiền</th>
                                    <th>Trạng thái</th>
                                    <th>Thao tác</th>
                                </tr>
                            </thead>
                            <tbody id="product-list">
                            </tbody >
                        </table>
                    </div>
                </div>
                </div>
        </div>
        <div id="product-pagination-container" class="pagination-container page-2-pagination"></div>
    </div>

    <div id="detailsModal" class="modal-overlay" onclick="closeModal(event)">
        <div class="modal-content" onclick="event.stopPropagation()">
            <div class="modal-header">
                <h2 id="modal-title">Chi tiết sản phẩm</h2>
                <span class="close-btn" onclick="document.getElementById('detailsModal').style.display='none'">&times;</span>
            </div>
            
            <div class="detail-general">
                <div class="detail-image-box">
                    <img id="detail-product-image" src="" alt="Sản phẩm" class="detail-image">
                </div>
                <div class="detail-summary">
                    <h3 id="detail-product-name"></h3>
                    <div id="detail-price" class="detail-price">Giá: </div>
                    <div id="detail-status" class="detail-status">Tình trạng: </div>
                    
                    <div id="detail-offer-box" style="margin-top: 15px; font-size: 0.95rem;">
                        <div style="display: flex; align-items: center; padding: 10px 15px; background-color: #FFC0CB; border-radius: 25px 25px 0 0; color: #D50000;">
                            <i class="fas fa-cube" style="margin-right: 8px; font-size: 1.2rem;"></i>
                            <strong style="font-size: 1.1rem;">Ưu đãi:</strong>
                            <i class="fas fa-pen-nib" onclick="editOffer()" style="margin-left: auto; font-size: 1rem; cursor: pointer;"></i>
                        </div>
                        <div id="detail-offer-content" style="padding: 10px 15px; border: 1px solid #FF7043; border-top: none; background-color: white; min-height: 70px; color: #333;"></div>
                    </div>
                    </div>
            </div>

            <div class="detail-specs">
                <h4 class="detail-specs-title">Thông số kỹ thuật chi tiết</h4>
                <div id="detail-description-content" style="font-size: 0.95rem; line-height: 1.7; color: #333; white-space: pre-line;"></div>
            </div>
        </div>
    </div>`;
          window.loadAdminProductPage();
          break;

        case "orders":
          content.innerHTML = `
            <h1 class="page-title">Đơn hàng</h1>
            <p>Danh sách đơn hàng hiển thị ở đây.</p>`;
          break;

        case "warehouse":
          pageStyle.href = "/WebBanLap/assets/css/stock.css";
          content.innerHTML = `
            <div> 
            <h1 class="page-title" style="margin-bottom:-10px">Kho</h1> 

        <main class="main-content">
            
            <div class="main-left-area"> 
                
                <div class="header-controls">
                    
                    <div class="search-box">
                        <input type="text" id="product-search-input" placeholder="Tìm tên/ID sản phẩm...">
                        <i class="fas fa-search"></i>
                    </div>

                    <div class="filter-group">
                        <label for="transaction-type">Phân loại</label>
                        <select id="transaction-type">
                            <option value="ton" selected>Tồn kho</option>
                            <option value="nhap">Nhập</option>
                            <option value="xuat">Xuất</option>
                        </select>
                    </div>
                    
                    <div class="date-picker-group">
                        <label for="start-date">Từ ngày</label>
                        <input type="date" id="start-date">
                    </div>
                    
                    <div class="date-picker-group">
                        <label for="end-date">Đến ngày</label>
                        <input type="date" id="end-date">
                    </div>
                    
                    <button id="lookup-button" class="filter-btn lookup-btn">
                        <i class="fas fa-search"></i> Tra cứu
                    </button>

                </div>

                <div class="inventory-background">
                    <div class="table-wrapper">
                        <table class="inventory-table">
                            <thead id="inventory-thead">
                                </thead>
                            <tbody id="inventory-tbody">
                                </tbody >
                        </table>
                    </div>
                </div>
                
                <div id="pagination-container" class="pagination-container">
                    </div>
                
            </div>
            <aside class="right-panel">
                <div class="warning-header">
                    ⚠️ SẢN PHẨM SẮP HẾT
                </div>
                
                <div id="low-stock-list" class="low-stock-list">
                    
                    </div>
            </aside>
        </main>
    </div>`;
          window.loadStockPage();
          break;

        case "pricing":
          content.innerHTML = "";
          loadPricing();
          break;

        case "complaints":
          pageStyle.href = "/WebBanLap/assets/css/receipt.css";
          content.innerHTML = "";
          LoadReceipt();
          break;

        default:
          content.innerHTML = `
            <h1 class="page-title">${page}</h1>
            <p>Chưa có nội dung.</p>`;
      }
    });
  });

  // === Hàm load Dashboard ===
  function loadDashboard() {
    content.innerHTML = `
      <h1 class="page-title">Dashboard</h1>
      <div class="stats">
        <div class="stat-box">
          <h3>Khách hàng</h3>
          <div class="number">2,006</div>
        </div>
        <div class="stat-box">
          <h3>Đơn hàng</h3>
          <div class="number">608</div>
        </div>
        <div class="stat-box">
          <h3>Doanh thu</h3>
          <div class="number">126,000,000</div>
        </div>
      </div>
      <div class="history-box">
        <h3>Lịch sử đơn hàng</h3>
      </div>`;
  }
});
