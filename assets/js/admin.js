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

  // === LẮnG NGHE THAY ĐỔI TỪ LOCALSTORAGE ===
  // Khi user mua hàng, localStorage sẽ thay đổi, ta sẽ tự động reload Dashboard
  window.addEventListener('storage', function(e) {
    // Kiểm tra nếu đang ở trang Dashboard và có thay đổi đơn hàng
    const isDashboardActive = document.querySelector('.menu-item[data-page="dashboard"]')?.classList.contains('active');
    
    if (isDashboardActive && e.key === 'ordersHistory') {
      console.log('🔄 Phát hiện đơn hàng mới, đang cập nhật Dashboard...');
      loadDashboard();
    }
  });

  // === POLLING: Kiểm tra định kỳ mỗi 3 giây ===
  let lastOrderCount = 0;
  
  function checkForNewOrders() {
    const isDashboardActive = document.querySelector('.menu-item[data-page="dashboard"]')?.classList.contains('active');
    
    if (isDashboardActive) {
      try {
        const ordersData = localStorage.getItem('ordersHistory');
        if (ordersData) {
          const orders = JSON.parse(ordersData);
          const currentCount = Array.isArray(orders) ? orders.length : 0;
          
          // Nếu số lượng đơn hàng thay đổi, reload Dashboard
          if (lastOrderCount !== 0 && currentCount !== lastOrderCount) {
            console.log(`🔄 Cập nhật Dashboard: ${lastOrderCount} → ${currentCount} đơn hàng`);
            loadDashboard();
          }
          
          lastOrderCount = currentCount;
        }
      } catch (err) {
        console.error('Lỗi kiểm tra đơn hàng:', err);
      }
    }
  }
  
  // Chạy polling mỗi 3 giây
  setInterval(checkForNewOrders, 3000);

  // === Gán sự kiện click cho menu ===
  menuItems.forEach((item) => {
    item.addEventListener("click", () => {
    if (item.classList.contains('logout-item')) {
        return;
    }

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
          pageStyle.href="../assets/css/customers.css";
          content.innerHTML = `
          <div>
            <h1 class="page-title">Khách hàng</h1>
            <p>Quản lý danh sách khách hàng tại đây.</p>
            <div class="search-user">
                <input type="text" id="search" placeholder="Tìm kiếm theo tên,sdt,email... " oninput="searchUser()">
                <i class="fas fa-search"></i>
            </div>
            <div class="edit-add">
                <select id="mode" onclick="edit()">
                <option value="see">&#128065; Chỉ xem</option>
                <option value="edit">&#128395; Chỉnh sửa</option>  
                </select>
                <button onclick="openADD()">+ Thêm khách hàng</button>
            </div>  
            <div class="add-user">
                <tr>
                <td><input type="text" id="name" placeholder="Họ tên"></td>
                <td><input type="email" id="email" placeholder="Email"></td>
                <td><input type="text" id="phone" placeholder="Số điện thoại"  maxlength="10"
                oninput="this.value = this.value.replace(/[^0-9]/g, '').slice(0,10)">
                <td><input type="text" id="acc" placeholder="Tài khoản"></td>
                <td><input type="text" id="pass" placeholder="Mật khẩu"></td>
                <td><button onclick="addUser()">Thêm khách hàng</button></td>
                <td><button onclick="closeADD()">Hủy</button></td>
                </tr>
            </div>
            <table id="userTable">
                <thead>
                <tr >
                    <th>STT</th>
                    <th>Họ và tên</th>
                    <th>Email</th>
                    <th>Số điện thoại</th>
                    <th>Tài khoản</th>
                    <th>Mật khẩu</th>
                    <th>Trạng thái</th>
                </tr>
                </thead>
                <tbody id="userBody">
                </tbody>
            </table>
        </div>`;
            loadUsers();
          break;
          
        case "products":
          // Gán CSS riêng cho trang sản phẩm
          pageStyle.href = "../assets/css/AdminProduct.css";
          content.innerHTML = `
          <div class="container-simple">
        <div>
            <h1 class="page-title" id="main-page-title">Loại sản phẩm</h1>
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
                                        <th>Tên loại sản phẩm</th>
                                        <th>Số lượng</th>
                                        <th>Trạng thái</th>
                                        <th>Thao tác</th> 
                                    </tr>
                                </thead>
                                <tbody id="brand-list-tbody">
                                </tbody>
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
                        <label for="ten">Tên loại sản phẩm:</label>
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
                                    <th>Giá nhập</th>
                                    <th>Trạng thái</th>
                                    <th>Thao tác</th>
                                </tr>
                            </thead>
                            <tbody id="product-list">
                            </tbody>
                        </table>
                    </div>
                </div>
                </div>
        </div>
        <div id="product-pagination-container" class="pagination-container page-2-pagination"></div>
    </div>
                    <div id="product-form-modal" class="custom-modal-overlay" style="display: none;">
                   <div class="custom-form-container">
                       <div class="custom-form-header">
                           <h3 id="custom-form-title">+ Thêm</h3>
                       </div>

                       <div class="custom-form-body">
                           <div class="form-group">
                               <label>Tên Model:</label>
                               <input type="text" id="inp-model" placeholder="Nhập tên sản phẩm...">
                           </div>

                           <div class="form-group">
                               <label>Loại (Category):</label>
                               <select id="inp-type">
                                   <option value="laptop">Laptop</option>
                                   <option value="balo">Balo</option>
                                   <option value="de-tan-nhiet">Đế tản nhiệt</option>
                                   <option value="chuot">Chuột</option>
                                   <option value="ban-phim">Bàn phím</option>
                                   <option value="tai-nghe">Tai nghe</option>
                                   <option value="phukienkhac">Phụ kiện khác</option>
                               </select>
                           </div>

                           <div class="form-group">
                               <label>ID (Mã SP):</label>
                               <input type="text" id="inp-id" placeholder="VD: AC-NITRO5">
                           </div>

                           <div class="form-group">
                               <label>Giá (VNĐ):</label>
                               <input type="text" id="inp-price" placeholder="VD: 15.000.000">
                           </div>

                           <div class="form-group">
                               <label>Mô tả:</label>
                               <textarea id="inp-desc" rows="4" placeholder="Thông số kỹ thuật (ngăn cách bằng dấu |)..."></textarea>
                           </div>

                            <div class="form-group">
                                 <label>Hình ảnh:</label>
                                 <input type="file" id="inp-image-file" accept="image/*" style="width: 100%; margin-bottom: 5px;">

                                 <input type="hidden" id="inp-image">

                                 <small style="font-size: 0.8rem; color: #666;">*Chọn ảnh từ máy tính</small>
                              </div>

                              <div class="form-group" style="text-align: center;">
                                 <img id="image-preview" src="" style="max-width: 150px; max-height: 150px; border: 1px solid #ddd; display: none; margin-top: 10px; object-fit: contain;">
                              </div>

                           <div class="custom-form-actions">
                               <button class="btn-custom-reset" onclick="closeProductForm()">Hủy / Đặt lại</button>
                               <button class="btn-custom-submit" onclick="handleProductFormSubmit()">Hoàn tất</button>
                           </div>
                       </div>
                   </div>
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
          pageStyle.href="../assets/css/orders.css";
          content.innerHTML = `
            <h1 class="page-title">Đơn hàng</h1>
            <div>

            <main>
                <section id="ordersContainer" aria-live="polite"></section>
            </main>

            <!-- Modal chỉnh sửa -->
            <div id="overlay" class="overlay" role="dialog" aria-modal="true" aria-hidden="true">
                <div class="modal" role="document" aria-labelledby="modalTitle">
                <form id="editForm">
                    <h2 id="modalTitle">Chỉnh sửa đơn hàng</h2>

                    <div class="form-row">
                    <label for="editId">Mã đơn</label>
                    <input id="editId" type="text" required />
                    </div>

                    <div class="form-row">
                    <label for="editCustomer">Khách hàng</label>
                    <input id="editCustomer" type="text" readonly />
                    </div>

                    <div class="form-row">
                    <label for="editStatus">Trạng thái</label>
                    <select id="editStatus">
                        <option>Đang xử lý</option>
                        <option>Đã giao</option>
                        <option>Đã hủy</option>
                    </select>
                    </div>

                    <div style="margin-top:12px">
                    <div class="small">Chỉnh sửa số lượng các món (đổi số lượng rồi nhấn Lưu). Có thể xóa từng món.</div>
                    <table class="items-edit-table" id="editItemsTable" aria-label="Danh sách món hàng">
                        <thead>
                        <tr><th>Sản phẩm</th><th>Số lượng</th><th>Hành động</th></tr>
                        </thead>
                        <tbody></tbody>
                    </table>
                    </div>

                    <div class="modal-actions">
                    <button type="button" id="deleteBtn" class="btn delete">Xóa đơn</button>
                    <button type="button" id="cancelBtn" class="btn cancel">Hủy</button>
                    <button type="submit" class="btn save">Lưu</button>
                    </div>
                </form>
                </div>
            </div>
            </div>`;
        renderOrdersManagement();
          break;

        case "warehouse":
          pageStyle.href = "../assets/css/stock.css";
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
                                </tbody>
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
          pageStyle.href = "../assets/css/pricing.css";
          content.innerHTML = "";
          loadPricing();
          break;

        case "complaints":
          pageStyle.href = "../assets/css/receipt.css";
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

function loadDashboard() {
  // Lấy số lượng khách hàng từ localStorage
  const ACCOUNTS_KEY = 'accounts';
  const customersData = localStorage.getItem(ACCOUNTS_KEY);
  let customerCount = 0;
  
  if (customersData) {
    try {
      const customers = JSON.parse(customersData);
      if (Array.isArray(customers)) {
        customerCount = customers.length;
      }
    } catch (err) {
      console.error('Lỗi đọc dữ liệu khách hàng:', err);
      customerCount = 0;
    }
  }

  // Lấy dữ liệu đơn hàng từ localStorage
  const ORDERS_KEY = 'ordersHistory';
  let orderCount = 0;
  let totalProductsSold = 0;
  let recentOrders = [];

  try {
    const ordersData = localStorage.getItem(ORDERS_KEY);
    if (ordersData) {
      const orders = JSON.parse(ordersData);
      if (Array.isArray(orders)) {
        orderCount = orders.length;
        
        // Tính tổng số lượng sản phẩm đã bán
        orders.forEach(order => {
          const items = order.items || order.products || order.lines || [];
          if (Array.isArray(items)) {
            items.forEach(item => {
              const quantity = Number(item.quantity || item.qty || 0);
              totalProductsSold += quantity;
            });
          }
        });

        // Lấy 5 đơn hàng gần nhất để hiển thị
        recentOrders = orders
          .map(order => ({
            id: order.id || order.orderId || order.code || 'N/A',
            customerName: order.customerName || (order.customer && order.customer.name) || order.customer || 'N/A',
            totalAmount: Number(order.totalAmount || order.total || 0),
            status: order.status || order.orderStatus || 'Đã giao',
            createdAt: order.createdAt || order.orderDate || ''
          }))
          .slice(-5) // Lấy 5 đơn gần nhất
          .reverse(); // Đảo ngược để đơn mới nhất lên đầu
      }
    }
  } catch (err) {
    console.error('Lỗi đọc dữ liệu đơn hàng:', err);
  }

  // Helper function để format tiền
  function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND' 
    }).format(amount);
  }

  // Helper function để escape HTML
  function escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Tạo HTML cho lịch sử đơn hàng
  const orderHistoryHTML = recentOrders.length > 0 ? `
    <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
      <thead>
        <tr style="background-color: #f5f5f5; text-align: left;">
          <th style="padding: 10px; border-bottom: 2px solid #ddd;">Mã đơn</th>
          <th style="padding: 10px; border-bottom: 2px solid #ddd;">Khách hàng</th>
          <th style="padding: 10px; border-bottom: 2px solid #ddd;">Tổng tiền</th>
          <th style="padding: 10px; border-bottom: 2px solid #ddd;">Trạng thái</th>
          <th style="padding: 10px; border-bottom: 2px solid #ddd;">Ngày đặt</th>
        </tr>
      </thead>
      <tbody>
        ${recentOrders.map(order => `
          <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 10px;">${escapeHtml(order.id)}</td>
            <td style="padding: 10px;">${escapeHtml(order.customerName)}</td>
            <td style="padding: 10px;">${formatCurrency(order.totalAmount)}</td>
            <td style="padding: 10px;">
              <span style="padding: 4px 8px; border-radius: 4px; font-size: 12px; 
  background-color: ${order.status === 'Đã giao' ? '#4CAF50' : 
                   order.status === 'Đang xử lý' ? '#FF9800' : 
                   order.status === 'Mới đặt' ? '#2196F3' : '#f44336'}; 
  color: white;">
  ${escapeHtml(order.status)}
</span>
            </td>
            <td style="padding: 10px;">${escapeHtml(order.createdAt)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  ` : '<p style="text-align: center; padding: 20px; color: #999;">Chưa có đơn hàng nào.</p>';

  // Render nội dung Dashboard
  content.innerHTML = `
    <h1 class="page-title">Dashboard</h1>
    <div class="stats">
      <div class="stat-box">
        <h3>Khách hàng</h3>
        <div class="number">${customerCount}</div>
      </div>
      <div class="stat-box">
        <h3>Đơn hàng</h3>
        <div class="number">${orderCount}</div>
      </div>
      <div class="stat-box">
        <h3>Số lượng sản phẩm đã bán</h3>
        <div class="number">${totalProductsSold}</div>
      </div>
    </div>
    <div class="history-box">
      <h3>Lịch sử đơn hàng (5 đơn gần nhất)</h3>
      ${orderHistoryHTML}
    </div>
  `;
  
  // Cập nhật lastOrderCount sau khi load
  try {
    const ordersData = localStorage.getItem('ordersHistory');
    if (ordersData) {
      const orders = JSON.parse(ordersData);
      lastOrderCount = Array.isArray(orders) ? orders.length : 0;
    }
  } catch (err) {
    console.error('Lỗi cập nhật lastOrderCount:', err);
  }
}
});