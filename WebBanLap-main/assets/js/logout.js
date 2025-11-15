// Xử lý chức năng đăng xuất
document.addEventListener('DOMContentLoaded', function() {
  const logoutMenu = document.getElementById('logout-menu');
  const logoutModal = document.getElementById('logoutModal');

  // Mở modal khi click vào menu đăng xuất
  if (logoutMenu) {
    logoutMenu.addEventListener('click', function(e) {
      e.stopPropagation();
      openLogoutModal();
    });
  }

  // Đóng modal khi click bên ngoài
  window.addEventListener('click', function(event) {
    if (event.target === logoutModal) {
      closeLogoutModal();
    }
  });
});

// Hàm mở modal đăng xuất
function openLogoutModal() {
  const modal = document.getElementById('logoutModal');
  if (modal) {
    modal.style.display = 'block';
  }
}

// Hàm đóng modal đăng xuất
function closeLogoutModal() {
  const modal = document.getElementById('logoutModal');
  if (modal) {
    modal.style.display = 'none';
  }
}

// Hàm xác nhận đăng xuất
function confirmLogout() {
  // Có thể thêm logic xóa session/token ở đây nếu cần
  // localStorage.removeItem('adminToken');
  // sessionStorage.clear();
  
  // Chuyển về trang đăng nhập
  window.location.href = '/WebBanLap/admin/adminlog.html';
}