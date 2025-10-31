const openLogin = document.getElementById("openLogin");
const popupLogin = document.getElementById("popupLogin");

// Mở popup
openLogin.addEventListener("click", function () {
    popupLogin.classList.remove("hidden");
})

popupLogin.addEventListener("click", function (e) {
    if (e.target === popupLogin) popupLogin.classList.add("hidden"); // bấm ra ngoài thì ẩn
});