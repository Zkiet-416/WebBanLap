
// ========= CHỌN YEAR - MONTH - DAY  ========= 
window.addEventListener("load", () => {


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
    //cập nhật ngày khi thay đổi tháng
    monthSelect.addEventListener("change", updateDays);
    yearSelect.addEventListener("change", updateDays);

    // ========= THAY AVATAR  ========= 
    const avatar = document.querySelector(".avatar img");
    const changeAvatar = document.getElementById("change-avatar");
    const fileInput = document.getElementById("fileInput");

    changeAvatar.addEventListener("click", () => {
        fileInput.click();
    });

    fileInput.addEventListener("change", function () {
        const file = this.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function (e) {
            const newAvatar = e.target.result;
            avatar.src = newAvatar;

            // Cập nhật vào currentUser
            let currentUser = JSON.parse(localStorage.getItem("currentUser"));
            if (currentUser) {
                currentUser.image = newAvatar;
                localStorage.setItem("currentUser", JSON.stringify(currentUser));

                // Đồng bộ vào danh sách accounts
                let accounts = JSON.parse(localStorage.getItem("accounts")) || [];
                accounts = accounts.map(acc => acc.email === currentUser.email ? currentUser : acc);
                localStorage.setItem("accounts", JSON.stringify(accounts));
            }
        }
        reader.readAsDataURL(file);
    });

    // ========= LẤY DỮ LIỆU =========
    const userProfile = JSON.parse(localStorage.getItem("currentUser"));
    const usernameInput = document.getElementById("profile-username");
    const fullnameInput = document.getElementById("profile-fullname");
    const emailInput = document.getElementById("profile-email");
    const phoneInput = document.getElementById("profile-phone");


    if (userProfile) {
        if (userProfile.image) avatar.src = userProfile.image;
        if (usernameInput) usernameInput.value = userProfile.username || "";
        if (fullnameInput) fullnameInput.value = userProfile.fullname || "";
        if (emailInput) emailInput.value = userProfile.email || "";
        if (phoneInput) phoneInput.value = userProfile.phone || "";
        if (userProfile.gender) {
            const genderRadio = document.querySelector(`input[name="gender"][value="${userProfile.gender}"]`);
            if (genderRadio) genderRadio.checked = true;
        }

        if (userProfile.birthday) {
            const [year, month, day] = userProfile.birthday.split("-");
            yearSelect.value = year;
            monthSelect.value = month;
            updateDays();
            daySelect.value = day;
        }
    }

    // ========= LƯU THÔNG TIN PROFILE =========
    const save = document.getElementById("save-profile");
    save.addEventListener("click", (e) => {
        e.preventDefault();
        let currentUser = JSON.parse(localStorage.getItem("currentUser"));
        const genderInput = document.querySelector('input[name="gender"]:checked')?.value || "";
        const birthdayInput = `${yearSelect.value}-${monthSelect.value}-${daySelect.value}` || "";

        currentUser.username = usernameInput.value.trim();
        currentUser.fullname = fullnameInput.value.trim();;
        currentUser.email = emailInput.value.trim();
        currentUser.phone = phoneInput.value.trim();
        currentUser.gender = genderInput;
        currentUser.birthday = birthdayInput;

        localStorage.setItem("currentUser", JSON.stringify(currentUser));

        let accounts = JSON.parse(localStorage.getItem("accounts")) || [];
        accounts = accounts.map(acc => acc.email === currentUser.email ? currentUser : acc);
        localStorage.setItem("accounts", JSON.stringify(accounts));

        alert("Lưu thông tin thành công!");
        location.reload();
    })
    // ========= CHẾ ĐỘ CHỈ XEM =========
    const profileSection = document.getElementById("profile");
    const allInputs = profileSection.querySelectorAll("input, select");
    const edit = document.getElementById("edit-profile");

    allInputs.forEach(function (i) {
        i.disabled = true;
    });
    changeAvatar.disabled = true;

    edit.addEventListener("click", function () {
        allInputs.forEach(function (i) {
            i.disabled = false;
        })
        changeAvatar.disabled = false;
        edit.classList.add("hidden");
        save.classList.remove("hidden");
    })

   
});

