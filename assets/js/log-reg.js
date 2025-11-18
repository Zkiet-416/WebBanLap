window.addEventListener("DOMContentLoaded", function () {

    // ===== BIỂU THỨC KIỂM TRA =====
    window.phonePattern = /^0[0-9]{9}$/;
    window.emailPattern = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;

    // ===== HÀM DÙNG CHUNG: HIỂN THỊ LỖI VÀ KIỂM TRA INPUT =====
    window.setupValidation = function (inputEl, pattern, errorMsg) {
        const errorEl = document.createElement("small");
        errorEl.style.color = "red";
        errorEl.style.fontSize = "13px";
        inputEl.after(errorEl);


        inputEl.addEventListener("input", () => {
            const value = inputEl.value.trim();
            if (!pattern.test(value) || value == "") {
                errorEl.textContent = errorMsg;
                inputEl.style.borderColor = "#e74c3c";
                inputEl.style.boxShadow = "0 0 5px #f5b7b1";
            } else {
                errorEl.textContent = "";
                inputEl.style.borderColor = "";
                inputEl.style.boxShadow = "";
            }
        });


    };
    checkLockedUser();

    // ===== CÁC XỬ LÝ LOGIN / REGISTER =====
    const logTab = document.getElementById("log-tab");
    const regTab = document.getElementById("reg-tab");
    const logForm = document.getElementById("log-form");
    const regForm = document.getElementById("reg-form");
    const returnLog = document.getElementById("return-log");

    logTab.addEventListener("click", showLogin);
    regTab.addEventListener("click", showRegister);
    returnLog.addEventListener("click", showLogin);
    logForm.addEventListener("submit", login);
    regForm.addEventListener("submit", register);

    function showLogin() {
        logTab.classList.add("active");
        regTab.classList.remove("active");
        regForm.classList.add("hidden");
        logForm.classList.remove("hidden");
    }

    function showRegister() {
        regTab.classList.add("active");
        logTab.classList.remove("active");
        logForm.classList.add("hidden");
        regForm.classList.remove("hidden");
    }

    // ACC TẠO SẴN
    const defaultAccount = [
        {
            username: "user",
            email: "user@gmail.com",
            phone: "0123456789",
            password: "123456",
            image: "../assets/images/defaultAvt.png",
            status: "active"
        }
    ];
    if (!localStorage.getItem("accounts")) {
        localStorage.setItem("accounts", JSON.stringify(defaultAccount));
    }

    function getAccounts() {
        return JSON.parse(localStorage.getItem("accounts")) || [];
    }
    function saveAccount(accounts) {
        localStorage.setItem("accounts", JSON.stringify(accounts));
    }

    // ===== LOGIN =====
    function login(e) {
        e.preventDefault();
        const acc = document.getElementById("acc1").value.trim();
        const pass = document.getElementById("psw1").value;
        if (!acc || !pass) {
            alert("Vui lòng nhập đầy đủ thông tin!");
            return;
        }

        const accounts = getAccounts();
        const user = accounts.find(a => a.email === acc || a.phone === acc);
        if (!user) return alert("Tài khoản không tồn tại!");
        if (user.password !== pass) return alert("Sai mật khẩu!");
        if (user.status === "locked" || user.status === false) {
            return alert("Tài khoản của bạn đã bị khoá! Vui lòng liên hệ admin.");

        }
        alert("Đăng nhập thành công!");
        if (document.getElementById("rememberMe").checked == true) {
            localStorage.setItem("rememberAcc", acc);
            localStorage.setItem("rememberPass", pass);
        } else {
            localStorage.removeItem("rememberAcc");
            localStorage.removeItem("rememberPass");
        }

        localStorage.setItem("currentUser", JSON.stringify(user));
        window.parent.document.getElementById("popupLogin").classList.add("hidden");
        location.reload();
    }

    // ===== REGISTER =====
    function register(e) {
        e.preventDefault();

        const username = document.getElementById("acc2").value.trim();
        const phone = document.getElementById("sdt").value.trim();
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("psw2").value;
        const confirm = document.getElementById("confirm").value;
        const agree = document.getElementById("agree").checked;

        if (!username || !phone || !email || !password || !confirm)
            return alert("Vui lòng điền đủ thông tin bắt buộc!");
        if (!agree) return alert("Bạn phải đồng ý các điều khoản!");
        if (confirm !== password) return alert("Mật khẩu xác thực không đúng!");
        if (!window.phonePattern.test(phone)) return alert("Số điện thoại không hợp lệ!");
        if (!window.emailPattern.test(email)) return alert("Email không hợp lệ!");

        const accounts = getAccounts();
        if (accounts.some(a => a.email === email)) return alert("Email đã tồn tại!");
        if (accounts.some(a => a.phone === phone)) return alert("Số điện thoại đã tồn tại!");

        const newUser = { username, phone, email, password, image: "../assets/images/defaultAvt.png", status: "active" };
        accounts.push(newUser);
        saveAccount(accounts);
        alert("Đăng ký thành công!");
        showLogin();
    }

    // ===== THÊM VALIDATION CHO FORM REGISTER =====
    const phoneInput = document.getElementById("sdt");
    const emailInput = document.getElementById("email");
    if (phoneInput && emailInput) {
        setupValidation(phoneInput, window.phonePattern, "Số điện thoại không hợp lệ! Phải có 10 chữ số và bắt đầu bằng 0.");
        setupValidation(emailInput, window.emailPattern, "Email không hợp lệ! Vui lòng nhập đúng định dạng (vd: ten@gmail.com).");
    }

    // ===== ẨN - HIỆN MẬT KHẨU =====
    const eyes = document.getElementsByClassName("eye");
    for (let e of eyes) {
        e.addEventListener("click", function () {
            var input = e.previousElementSibling;
            input.type = input.type === "password" ? "text" : "password";
            e.style.opacity = input.type === "text" ? "0.5" : "0.1";
        });
    }

    // ===== TỰ ĐIỀN LOGIN NẾU NHỚ TÀI KHOẢN =====
    const savedAcc = localStorage.getItem("rememberAcc");
    const savedPass = localStorage.getItem("rememberPass");
    if (savedAcc && savedPass) {
        document.getElementById("acc1").value = savedAcc;
        document.getElementById("psw1").value = savedPass;
        document.getElementById("rememberMe").checked = true;
    }

    window.lockUnlockUser = function (userId, action) {
        const accounts = getAccounts();
        const userIndex = accounts.findIndex(a => a.email === userId || a.phone === userId);

        if (userIndex !== -1) {
            accounts[userIndex].status = action === 'lock' ? 'locked' : 'active';
            saveAccount(accounts);
            return true;
        }
        return false;
    }



});
setInterval(checkLockedUser, 1000);

//KHI ĐANG DNHAP BỊ ADMIN KHÓA
function checkLockedUser() {
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    if (!currentUser) return;

    const accounts = JSON.parse(localStorage.getItem("accounts")) || [];

    const user = accounts.find(a =>
        a.email === currentUser.email || a.phone === currentUser.phone
    );

    if (!user || user.status === "locked" || user.status === false) {
        alert("Tài khoản của bạn đã bị khóa bởi admin.");
        localStorage.removeItem("currentUser");
        window.parent.document.getElementById("popupLogin").classList.remove("hidden");
    }
}