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
//ACC TẠO SẴN
const defaultAccount = [
    {
        username: "admin",
        email: "admin@gmail.com",
        phone: "0987654321",
        password: "123",
        image: "../assets/images/defaultAvt.svg"
    },
    {
        username: "user",
        email: "user@gmail.com",
        phone: "0123456789",
        password: "Abc@123",
        image: "../assets/images/defaultAvt.svg"

    }
];

if (!localStorage.getItem("accounts")) {
    localStorage.setItem("accounts", JSON.stringify(defaultAccount));
}

//lấy ds acc
function getAccounts() {
    return JSON.parse(localStorage.getItem("accounts")) || [];
}

//lưu ds acc
function saveAccount(accounts) {
    localStorage.setItem("accounts", JSON.stringify(accounts));
}

//dnhap
function login(e) {
    e.preventDefault();
    const acc = document.getElementById("acc1").value.trim();
    const pass = document.getElementById("psw1").value;
    if (!acc || !pass) {
        alert("Vui lòng nhập đầy đủ thông tin!");
        return;
    }
    const accounts = getAccounts();
    var user = null;
    for (let a of accounts) {
        if (a.email === acc || a.phone === acc) {
            user = a;
            break;
        }
    }
    if (!user)
        alert("Tài khoản không tồn tại!");
    else if (user.password != pass)
        alert("Sai mật khẩu!");
    else {
        alert("Đăng nhập thành công!");

        if (document.getElementById("rememberMe").checked) {
            localStorage.setItem("rememberAcc", acc);
            localStorage.setItem("rememberPass", pass);
        } else {
            localStorage.removeItem("rememberAcc");
            localStorage.removeItem("rememberPass");
        }

        window.parent.localStorage.setItem("currentUser", JSON.stringify(user));
        // bảo cha (main) tắt popup
        window.parent.document.getElementById("popupLogin").classList.add("hidden");
        window.parent.location.reload();
    }
}

//Dki
function register(e) {
    e.preventDefault();

    const username = document.getElementById("acc2").value.trim();
    const phone = document.getElementById("sdt").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("psw2").value;
    const confirm = document.getElementById("confirm").value;
    const agree = document.getElementById("agree").checked;

    if (!username || !phone || !email || !password || !confirm) {
        alert("Vui lòng điền đủ thông tin bắt buộc!");
        return;
    }

    if (!agree) {
        alert("Bạn phải đồng ý các điều khoản, điều kiện!");
        return;
    };

    if (confirm != password) {
        alert("Mật khẩu xác thực không đúng!");
        return;
    }

    const accounts = getAccounts();
    var existedEmail = false;
    var existedPhone = false;
    for (let a of accounts) {
        if (a.email === email) existedEmail = true;
        else if (a.phone == phone) existedPhone = true;
    }

    if (existedEmail) {
        alert("Email đã tồn tại!");
        return;
    }
    else if (existedPhone) {
        alert("Số điện thoại đã tồn tại!");
        return;
    }

    const newUser = { username, phone, email, password, image: "../img/defaultAvt.svg" };
    accounts.push(newUser);
    saveAccount(accounts);
    alert("Đăng ký thành công!");
    showLogin();
};

//Ẩn - hiện pass
const eyes = document.getElementsByClassName("eye");
for (let e of eyes) {
    e.addEventListener("click", function () {
        var input = e.previousElementSibling;
        if (input.type === "password") {
            input.type = "text";
            e.style.opacity = "0.5";
        }
        else {
            input.type = "password";
            e.style.opacity = "0.1";
        }
    })
};
//Tự động điền 
window.addEventListener("load", () => {
    const savedAcc = localStorage.getItem("rememberAcc");
    const savedPass = localStorage.getItem("rememberPass");
    if (savedAcc && savedPass) {
        document.getElementById("acc1").value = savedAcc;
        document.getElementById("psw1").value = savedPass;
        document.getElementById("rememberMe").checked = true;
    }
});






