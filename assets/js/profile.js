window.addEventListener("load", () => {
    // ========= CHỌN YEAR - MONTH - DAY =========
    const daySelect = document.getElementById("day");
    const monthSelect = document.getElementById("month");
    const yearSelect = document.getElementById("year");

    for (let i = 1; i <= 12; i++) {
        const option = document.createElement("option");
        option.value = i;
        option.textContent = i;
        monthSelect.appendChild(option);
    }
    for (let i = 2025; i >= 1900; i--) {
        const option = document.createElement("option");
        option.value = i;
        option.textContent = i;
        yearSelect.appendChild(option);
    }

    function updateDays() {
        const month = parseInt(monthSelect.value);
        const year = parseInt(yearSelect.value);

        if (!month || !year) return;

        const daysInMonth = new Date(year, month, 0).getDate();
        daySelect.innerHTML = '<option>Ngày</option>';

        for (let i = 1; i <= daysInMonth; i++) {
            const option = document.createElement("option");
            option.value = i;
            option.textContent = i;
            daySelect.appendChild(option);
        }
    }

    monthSelect.addEventListener("change", updateDays);
    yearSelect.addEventListener("change", updateDays);

    // ========= THAY AVATAR =========
    const avatar = document.querySelector(".avatar img");
    const changeAvatar = document.getElementById("change-avatar");
    const fileInput = document.getElementById("fileInput");

    changeAvatar.addEventListener("click", () => fileInput.click());

    fileInput.addEventListener("change", function () {
        const file = this.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function (e) {
            const newAvatar = e.target.result;
            avatar.src = newAvatar;
            avatar.dataset.newImage = newAvatar;
        };
        reader.readAsDataURL(file);
    });
    // ========= XÓA AVT =========
    const deleteAvatar = document.getElementById("delete-avatar");
    deleteAvatar.addEventListener("click", () => {
        const defaultImg = "../assets/images/defaultAvt.png";
        avatar.src = defaultImg;
        avatar.dataset.newImage = defaultImg;
    });

    // ========= LẤY DỮ LIỆU NGƯỜI DÙNG =========
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    const usernameInput = document.getElementById("profile-username");
    const fullnameInput = document.getElementById("profile-fullname");
    const emailInput = document.getElementById("profile-email");
    const phoneInput = document.getElementById("profile-phone");

    if (currentUser) {
        if (currentUser.image) avatar.src = currentUser.image;
        usernameInput.value = currentUser.username || "";
        fullnameInput.value = currentUser.fullname || "";
        emailInput.value = currentUser.email || "";
        phoneInput.value = currentUser.phone || "";

        if (currentUser.gender) {
            const genderRadio = document.querySelector(`input[name="gender"][value="${currentUser.gender}"]`);
            if (genderRadio) genderRadio.checked = true;
        }

        if (currentUser.birthday) {
            const [year, month, day] = currentUser.birthday.split("-");
            yearSelect.value = year;
            monthSelect.value = month;
            updateDays();
            daySelect.value = day;
        }
    }

    // ========= LƯU THÔNG TIN =========
    const save = document.getElementById("save-profile");
    const edit = document.getElementById("edit-profile");

    save.addEventListener("click", (e) => {
        e.preventDefault();

        let currentUser = JSON.parse(localStorage.getItem("currentUser"));
        const genderInput = document.querySelector('input[name="gender"]:checked')?.value || "";
        const birthdayInput = `${yearSelect.value}-${monthSelect.value}-${daySelect.value}` || "";

        const username = usernameInput.value.trim();
        const fullname = fullnameInput.value.trim();
        const email = emailInput.value.trim();
        const phone = phoneInput.value.trim();

        // --- KIỂM TRA HỢP LỆ ---
        if (!username) {
            alert("Vui lòng nhập tên người dùng!");
            usernameInput.focus();
            return;
        }

        if (!email) {
            alert("Vui lòng nhập email!");
            return;
        }

        if (!phone) {
            alert("Vui lòng nhập số điện thoại!");
            return;
        }

        if (phone && !window.phonePattern.test(phone)) {
            phoneInput.focus();
            phoneInput.classList.add("error");
            alert("Số điện thoại không hợp lệ! Phải có 10 chữ số và bắt đầu bằng 0.");
            return;
        }

        if (email && !window.emailPattern.test(email)) {
            emailInput.focus();
            emailInput.classList.add("error");
            alert("Email không hợp lệ! Vui lòng nhập đúng định dạng (vd: ten@gmail.com).");
            return;
        }

        // --- KIỂM TRA TRÙNG EMAIL / SĐT ---
        let accounts = JSON.parse(localStorage.getItem("accounts")) || [];
        const isEmailExist = accounts.some(acc => acc.email === email && acc.email !== currentUser.email);
        const isPhoneExist = accounts.some(acc => acc.phone === phone && acc.phone !== currentUser.phone);

        if (isEmailExist) {
            alert("Email này đã được sử dụng cho tài khoản khác!");
            return;
        }
        if (isPhoneExist) {
            alert("Số điện thoại này đã được sử dụng cho tài khoản khác!");
            return;
        }

        let oldEmail = currentUser.email;
        let oldPhone = currentUser.phone;

        // --- CẬP NHẬT THÔNG TIN ---
        currentUser.username = username;
        currentUser.fullname = fullname;
        currentUser.email = email;
        currentUser.phone = phone;
        currentUser.gender = genderInput;
        currentUser.birthday = birthdayInput;
        //cập nhật ảnh
        if (avatar.dataset.newImage) {
            currentUser.image = avatar.dataset.newImage;
            delete avatar.dataset.newImage;
        } else {
            currentUser.image = avatar.src;
        }

        localStorage.setItem("currentUser", JSON.stringify(currentUser));
        accounts = accounts.map(acc => acc.email === oldEmail || acc.phone === oldPhone ? currentUser : acc);
        localStorage.setItem("accounts", JSON.stringify(accounts));
        //cập nhật avatarUser (góc đăng nhập)
        const avatarUser = document.getElementById("avatarUser");
        if (avatarUser) {
            avatarUser.src = currentUser.image || "../assets/images/defaultAvt.png";
        }
        //tắt chế độ sửa
        profileInputs.forEach(i => i.disabled = true);
        changeAvatar.disabled = true;
        deleteAvatar.disabled = true;
        save.classList.add("hidden");
        edit.classList.remove("hidden");
        cancel.classList.add("hidden");


        alert("Lưu thông tin thành công!");

    });


    // ========= CHẾ ĐỘ CHỈ XEM/ CHỈNH SỬA =========
    const profileSection = document.getElementById("profile");
    // chỉ lấy input của phần Hồ sơ, không lấy bên Đổi mật khẩu
    const profileInfo = document.getElementById("profile-info");
    const profileInputs = profileInfo.querySelectorAll("input, select");


    profileInputs.forEach(i => i.disabled = true);
    changeAvatar.disabled = true;
    deleteAvatar.disabled = true;

    edit.addEventListener("click", () => {
        profileInputs.forEach(i => i.disabled = false);
        changeAvatar.disabled = false;
        deleteAvatar.disabled = false;
        edit.classList.add("hidden");
        save.classList.remove("hidden");
        cancel.classList.remove("hidden");


        setupValidation(phoneInput, window.phonePattern, "Số điện thoại không hợp lệ! Phải có 10 chữ số và bắt đầu bằng 0."
        );
        setupValidation(emailInput, window.emailPattern, "Email không hợp lệ! Vui lòng nhập đúng định dạng (vd: ten@gmail.com)."
        );
    });

    const cancel = document.getElementById("cancel-profile");

    cancel.addEventListener("click", () => {
        if (currentUser) {
            usernameInput.value = currentUser.username || "";
            fullnameInput.value = currentUser.fullname || "";
            emailInput.value = currentUser.email || "";
            phoneInput.value = currentUser.phone || "";

            if (currentUser.gender) {
                const genderRadio = document.querySelector(`input[name="gender"][value="${currentUser.gender}"]`);
                if (genderRadio) genderRadio.checked = true;
            }

            if (currentUser.birthday) {
                const [year, month, day] = currentUser.birthday.split("-");
                yearSelect.value = year;
                monthSelect.value = month;
                updateDays();
                daySelect.value = day;
            }

            avatar.src = currentUser.image || "../assets/images/defaultAvt.png";
        }

        // Về chế độ chỉ xem
        profileInputs.forEach(i => i.disabled = true);
        changeAvatar.disabled = true;
        deleteAvatar.disabled = true;

        save.classList.add("hidden");
        edit.classList.remove("hidden");
        cancel.classList.add("hidden"); // ẩn nút Hủy
    });

    // ========= CHUYỂN TAB =========
    const tabIf = document.getElementById("tab-info");
    const tabPassword = document.getElementById("tab-pass");
    const profileIf = document.getElementById("profile-info");
    const changePassword = document.getElementById("change-password");

    tabIf.addEventListener("click", () => {
        tabIf.classList.add("active");
        tabPassword.classList.remove("active");

        profileIf.classList.remove("hidden");
        changePassword.classList.add("hidden");

        window.scrollTo({ top: 0, behavior: "smooth" });
    });

    tabPassword.addEventListener("click", () => {
        tabPassword.classList.add("active");
        tabIf.classList.remove("active");

        changePassword.classList.remove("hidden");
        profileIf.classList.add("hidden");

        window.scrollTo({ top: 0, behavior: "smooth" });
    });


    // ========= LƯU MẬT KHẨU =========
    const savePassword = document.getElementById("save-password");
    if (savePassword) {
        savePassword.addEventListener("click", (e) => {
            e.preventDefault();

            const oldPass = document.getElementById("old-password").value.trim();
            const newPass = document.getElementById("new-password").value.trim();
            const confirmPass = document.getElementById("confirm-password").value.trim();

            let currentUser = JSON.parse(localStorage.getItem("currentUser"));
            if (!currentUser) return alert("Không tìm thấy người dùng!");

            if (oldPass !== currentUser.password)
                return alert("Mật khẩu cũ không đúng!");
            if (newPass.length < 6)
                return alert("Mật khẩu mới phải có ít nhất 6 ký tự!");
            if (newPass !== confirmPass)
                return alert("Xác nhận mật khẩu không khớp!");

            currentUser.password = newPass;
            localStorage.setItem("currentUser", JSON.stringify(currentUser));

            let accounts = JSON.parse(localStorage.getItem("accounts")) || [];
            accounts = accounts.map(acc =>
                acc.email === currentUser.email ? currentUser : acc
            );
            localStorage.setItem("accounts", JSON.stringify(accounts));

            alert("Đổi mật khẩu thành công!");
            //đổi xong thì chuyển dìa tab-info 
            const tabIf = document.getElementById("tab-info");
            tabIf.click();
            //xóa dữ liệu trong ô
            document.getElementById("old-password").value = "";
            document.getElementById("new-password").value = "";
            document.getElementById("confirm-password").value = "";
        });
    }

    // ===== ẨN - HIỆN MẬT KHẨU =====
    const eyes = document.getElementsByClassName("eye-profile");
    for (let e of eyes) {
        e.addEventListener("click", function () {
            var input = e.previousElementSibling;
            input.type = input.type === "password" ? "text" : "password";
            e.style.opacity = input.type === "text" ? "0.5" : "0.1";
        });
    }

});
