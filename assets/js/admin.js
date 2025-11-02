document.addEventListener("DOMContentLoaded", () => {
  const content = document.getElementById("content");
  const menuItems = document.querySelectorAll(".menu-item");

  // Load mặc định Dashboard
  loadDashboard();

  // Gán sự kiện click cho menu
  menuItems.forEach((item) => {
    item.addEventListener("click", () => {
      menuItems.forEach((m) => m.classList.remove("active"));
      item.classList.add("active");

      const page = item.getAttribute("data-page");
      switch (page) {
        case "dashboard":
          loadDashboard();
          break;
        case "customers":
          content.innerHTML = `<h1 class="page-title">Khách hàng</h1><p>Quản lý danh sách khách hàng tại đây.</p>`;
          break;
        case "categories":
          content.innerHTML = `<h1 class="page-title">Loại sản phẩm</h1><p>Danh mục loại sản phẩm hiển thị ở đây.</p>`;
          break;
        case "products":
          content.innerHTML = `<h1 class="page-title">Sản phẩm</h1><p>Danh sách sản phẩm hiển thị ở đây.</p>`;
          break;
        case "orders":
          content.innerHTML = `<h1 class="page-title">Đơn hàng</h1><p>Danh sách đơn hàng hiển thị ở đây.</p>`;
          break;
        case "warehouse":
          content.innerHTML = `<h1 class="page-title">Kho</h1><p>Thông tin kho hàng được hiển thị ở đây.</p>`;
          break;
        case "pricing":
          content.innerHTML = "";
          loadPricing();
          break;
        case "complaints":
          content.innerHTML = `<h1 class="page-title">Khiếu nại</h1><p>Danh sách khiếu nại khách hàng tại đây.</p>`;
          break;
        case "settings":
          content.innerHTML = `<h1 class="page-title">Cài đặt</h1><p>Tùy chỉnh hệ thống tại đây.</p>`;
          break;
        default:
          content.innerHTML = `<h1 class="page-title">${page}</h1><p>Chưa có nội dung.</p>`;
      }
    });
  });

  // Hàm load dashboard
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
      </div>
    `;
  }
});
