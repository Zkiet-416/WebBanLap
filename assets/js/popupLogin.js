window.addEventListener("load", () => {
    //LOGIN - REGISTER POPUP
    const openLogin = document.getElementById("openLogin");
    const popupLogin = document.getElementById("popupLogin");
    const loginText = document.getElementById("loginText");
    const avatarUser = document.getElementById("avatarUser");
    const dropUser = document.getElementById("dropUser");
    let currentUser = JSON.parse(localStorage.getItem("currentUser"));


    //HIỆN POPUP
    openLogin.addEventListener("click", function () {
        currentUser = JSON.parse(localStorage.getItem("currentUser"));
        if (!currentUser) {
            popupLogin.classList.remove("hidden");
        } else {
            dropUser.classList.toggle("hidden");
        }
    });

    if (currentUser) {
        avatarUser.src = currentUser.image;
        loginText.textContent = `Hi, ${currentUser.username}`;
        avatarUser.style.display = "inline-block";

    }


    // bấm ra ngoài thì ẩn
    popupLogin.addEventListener("click", function (e) {
        if (e.target === popupLogin) popupLogin.classList.add("hidden");
    });
    document.addEventListener("click", function (e) {
        if (!openLogin.contains(e.target) && !dropUser.contains(e.target)) {
            dropUser.classList.add("hidden");
        }
    });


    // LOG OUT
    const logout = document.getElementById("logout");
    logout.addEventListener("click", function () {
        localStorage.removeItem("currentUser");
        location.reload();
    })

    const mainContainer = document.querySelector(".container");
    const openProfile = document.getElementById("openProfile");
    const profile = document.getElementById("profile");

    openProfile.addEventListener("click", function () {
        mainContainer.classList.add("hidden");
        profile.classList.remove("hidden");
        dropUser.classList.add("hidden");
    });
    const logo = document.getElementById("logo");
    if (logo) {
        logo.addEventListener("click", function () {
            // Ẩn profile
            if (profile) profile.classList.add("hidden");
            // Hiện container
            if (mainContainer) mainContainer.classList.remove("hidden");
            // Gọi hàm reset để hiển thị lại các section
            window.resetToHomePage();
        });
    }
});
