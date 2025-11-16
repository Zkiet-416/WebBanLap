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
      localStorage.setItem("isAdminLoggedIn", "true");
      window.location.href = "admin.html"; // gắn tên miền để chuyển tab
    } else {
      errorMsg.textContent = "Sai tài khoản hoặc mật khẩu!";
      errorMsg.style.display = "block";
    }
  }

