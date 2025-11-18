// ===== ẨN - HIỆN MẬT KHẨU =====
const eyes = document.getElementsByClassName("eye");
for (let e of eyes) {
  e.addEventListener("click", function () {
    var input = e.previousElementSibling;
    input.type = input.type === "password" ? "text" : "password";
    e.style.opacity = input.type === "text" ? "0.5" : "0.1";
  });
}

// ===== TỰ ĐIỀN THÔNG TIN NẾU ĐÃ LƯU =====
document.addEventListener("DOMContentLoaded", function () {
  const savedEmail = localStorage.getItem("adminSavedEmail");
  const savedPassword = localStorage.getItem("adminSavedPassword");
  const rememberCheckbox = document.getElementById("remember");

  if (savedEmail && savedPassword && rememberCheckbox) {
    document.getElementById("email").value = savedEmail;
    document.getElementById("password").value = savedPassword;
    rememberCheckbox.checked = true;
  }
});

function login(e) {
  e.preventDefault();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const errorMsg = document.getElementById("errorMsg");

  // nhập đúng tài khoản, sai thì báo lỗi
  const validEmail = "Admin@gmail.com";
  const validPassword = "12345";

  if (email === validEmail && password === validPassword) {
    errorMsg.style.display = "none";
    // Xử lý lưu mật khẩu
    const rememberCheckbox = document.getElementById("remember");
    if (rememberCheckbox.checked) {
      localStorage.setItem("adminSavedEmail", email);
      localStorage.setItem("adminSavedPassword", password);
    } else {
      localStorage.removeItem("adminSavedEmail");
      localStorage.removeItem("adminSavedPassword");
    }
    localStorage.setItem("isAdminLoggedIn", "true");
    window.location.href = "admin.html"; // gắn tên miền để chuyển tab
  } else {
    errorMsg.textContent = "Sai tài khoản hoặc mật khẩu!";
    errorMsg.style.display = "block";
  }

}

