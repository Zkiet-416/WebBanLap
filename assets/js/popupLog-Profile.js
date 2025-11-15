window.addEventListener("load", () => {
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
            if (!dropUser.classList.contains("hidden")) {
                const rect = openLogin.getBoundingClientRect();
                dropUser.style.top = rect.bottom + 15 + "px";
                dropUser.style.left = rect.left + -30 + "px";
            }
        }
    });

    if (currentUser) {
        avatarUser.src = currentUser.image;
        loginText.textContent = `Hi, ${currentUser.username}`;
        avatarUser.style.display = "inline-block";

    }


    // bấm ra ngoài thì ẩn
    popupLogin.addEventListener("click", function (e) {
        if (e.target == popupLogin) popupLogin.classList.add("hidden");
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

    //XEM PROFILE
    const suggestions = document.getElementById('suggestions');
    const accessories = document.getElementById('accessories');
    const slider = document.querySelector('.slider');
    const productDetail = document.getElementById('productDetail');
    const historyPage = document.getElementById('historyPage');
    const cartDetail = document.getElementById("cartDetail");
    const openProfile = document.getElementById("openProfile");
    const profile = document.getElementById("profile");

    openProfile.addEventListener("click", function openProfile() {
        if (suggestions) suggestions.style.display = 'none';
        if (accessories) accessories.style.display = 'none';
        if (slider) slider.style.display = 'none';
        if (productDetail) productDetail.style.display = 'none';
        if (historyPage) historyPage.style.display = 'none';
        dropUser.classList.add("hidden");
        if (cartDetail) productDetail.style.display = 'none';

        profile.classList.remove("hidden");
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    });


    //click về trang chủ
    document.addEventListener('click', function (e) {
        if (e.target.closest('.logo') || e.target.closest('li')?.textContent.trim() === 'Trang chủ') {
            profile.classList.add("hidden");

            suggestions.classList.remove("hidden");
            accessories.classList.remove("hidden");
            slider.classList.remove("hidden");
            productDetail.classList.remove("hidden");
            window.resetToHomePage();

            e.preventDefault();
            e.stopPropagation();
        }
    });



});
