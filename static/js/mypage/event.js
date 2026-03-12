window.onload = () => {
    // 네비게이션 바 목록들
    const navBarDivs = document.querySelectorAll(".Profile-Tab-Item");
    // 네비게이션 바 Text들
    const navBarTexts = document.querySelectorAll(".Profile-Tab-Text");
    // 네비게이션 언더바들
    const navUnderlines = document.querySelectorAll(".Profile-Tab-Indicator");
    // 마이페이지 게시글 div들
    const contentDivs = document.querySelectorAll(".Profile-Content");

    // 네비게이션 바 클릭 이벤트
    navBarDivs.forEach((nav, i) => {
        nav.addEventListener("click", (e) => {
            navBarTexts.forEach((t) => t.classList.remove("selected"));
            navUnderlines.forEach((u) => u.classList.add("off"));
            contentDivs.forEach((c) => c.classList.add("off"));

            navBarTexts[i].classList.add("selected");
            navUnderlines[i].classList.remove("off");
            contentDivs[i].classList.remove("off");
        });
    });

    document.querySelector(".Profile-Tab-Item.Replies").click();
};
