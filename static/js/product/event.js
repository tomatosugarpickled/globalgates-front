window.onload = () => {
    const moreBtn = document.getElementById("heroMoreButton");
    const shareBtn = document.getElementById("heroShareButton");
    const mediaGrid = document.querySelector(".Product-Detail-Media-Grid");
    const likeBtn = document.querySelector(
        ".Product-Detail-ActionBar-Button--Like",
    );
    const bookmarkBtn = document.querySelector(
        ".Product-Detail-ActionBar-Button--Bookmark",
    );

    // 더보기 메뉴 — Owner 우선, 없으면 Product
    const ownerMenu = document.querySelector(".Post-More-Menu.Owner");
    const productMenu = document.querySelector(".Post-More-Menu.Product");
    const shareMenu = document.querySelector(".Post-More-Menu.Share");
    const moreMenu = ownerMenu ?? productMenu;

    // 미디어 프리뷰 오버레이 (HTML에 이미 존재)
    const overlay = document.querySelector(".Post-Media-Preview-Overlay");
    const overlayImg = overlay?.querySelector(".Post-Media-Preview-Image");
    const overlayClose = overlay?.querySelector(".Post-Media-Preview-Close");

    const ICONS = {
        heartEmpty: `<path d="M16.697 5.5c-1.222-.06-2.679.51-3.89 2.16l-.805 1.09-.806-1.09C9.984 6.01 8.526 5.44 7.304 5.5c-1.243.07-2.349.78-2.91 1.91-.552 1.12-.633 2.78.479 4.82 1.074 1.97 3.257 4.27 7.129 6.61 3.87-2.34 6.052-4.64 7.126-6.61 1.111-2.04 1.03-3.7.477-4.82-.561-1.13-1.666-1.84-2.908-1.91zm4.187 7.69c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z"/>`,
        heartFull: `<path d="M20.884 13.19c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z"/>`,
        bookmarkEmpty: `<path d="M4 4.5C4 3.12 5.119 2 6.5 2h11C18.881 2 20 3.12 20 4.5v18.44l-8-5.71-8 5.71V4.5zM6.5 4c-.276 0-.5.22-.5.5v14.56l6-4.29 6 4.29V4.5c0-.28-.224-.5-.5-.5h-11z"/>`,
        bookmarkFull: `<path d="M4 4.5C4 3.12 5.119 2 6.5 2h11C18.881 2 20 3.12 20 4.5v18.44l-8-5.71-8 5.71V4.5z"/>`,
    };

    function openOverlay(src, alt) {
        if (!overlay || !overlayImg) return;
        overlayImg.src = src;
        overlayImg.alt = alt || "상품 이미지 미리보기";
        overlay.classList.remove("off");
        overlay.classList.add("on");
        document.body.classList.add("modal-open");
    }

    function closeOverlay() {
        if (!overlay) return;
        overlay.classList.add("off");
        overlay.classList.remove("on");
        document.body.classList.remove("modal-open");
        // 닫힌 후 src 초기화 (transition 끝난 뒤)
        setTimeout(() => {
            if (overlayImg) overlayImg.src = "";
        }, 200);
    }

    // 닫기 버튼
    overlayClose?.addEventListener("click", closeOverlay);

    // 오버레이 배경(Dialog 바깥) 클릭 시 닫기
    overlay?.addEventListener("click", (e) => {
        if (e.target === overlay) closeOverlay();
    });

    // ESC 키
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            closeOverlay();
            closeAllMenus();
        }
    });

    // 미디어 그리드 이미지 클릭
    mediaGrid?.addEventListener("click", (e) => {
        const img = e.target.closest(".Product-Detail-Media-Image");
        if (!img) return;
        openOverlay(img.src, img.alt);
    });

    let activeMenu = null;
    let activeTrigger = null;

    function positionMenu(menu, btn) {
        const MARGIN = 8;
        const btnRect = btn.getBoundingClientRect();
        const menuH = menu.offsetHeight;
        const menuW = menu.offsetWidth;

        // 가로: 버튼 오른쪽 끝 정렬, 뷰포트 밖이면 보정
        let left = btnRect.right - menuW + window.scrollX;
        left = Math.max(8, Math.min(left, window.innerWidth - menuW - 8));

        // 세로: 아래 공간 vs 위 공간 비교
        const spaceBelow = window.innerHeight - btnRect.bottom;
        const spaceAbove = btnRect.top;
        let top;
        if (spaceBelow >= menuH + MARGIN || spaceBelow >= spaceAbove) {
            top = btnRect.bottom + MARGIN + window.scrollY;
        } else {
            top = btnRect.top - menuH - MARGIN + window.scrollY;
        }

        menu.style.left = `${left}px`;
        menu.style.top = `${top}px`;
    }

    function openMenu(menu, btn) {
        // 다른 메뉴가 열려 있으면 먼저 닫기
        if (activeMenu && activeMenu !== menu) closeAllMenus();

        menu.classList.remove("off");
        menu.classList.add("on");
        btn.setAttribute("aria-expanded", "true");
        activeMenu = menu;
        activeTrigger = btn;

        // DOM에 표시된 뒤 위치 계산
        requestAnimationFrame(() => positionMenu(menu, btn));
    }

    function closeMenu(menu, btn) {
        if (!menu) return;
        menu.classList.add("off");
        menu.classList.remove("on");
        btn?.setAttribute("aria-expanded", "false");
        if (activeMenu === menu) {
            activeMenu = null;
            activeTrigger = null;
        }
    }

    function closeAllMenus() {
        closeMenu(moreMenu, moreBtn);
        closeMenu(shareMenu, shareBtn);
    }

    // 메뉴 외부 클릭 → 닫기
    document.addEventListener("click", (e) => {
        if (!activeMenu) return;
        const insideMenu = activeMenu.contains(e.target);
        const insideTrigger = activeTrigger?.contains(e.target);
        if (!insideMenu && !insideTrigger) closeAllMenus();
    });

    // 스크롤 · 리사이즈 → 열린 메뉴 위치 재계산
    function onViewportChange() {
        if (activeMenu && activeTrigger)
            positionMenu(activeMenu, activeTrigger);
    }
    window.addEventListener("scroll", onViewportChange, { passive: true });
    window.addEventListener("resize", onViewportChange, { passive: true });

    moreBtn?.addEventListener("click", (e) => {
        e.stopPropagation();
        moreMenu.classList.contains("on")
            ? closeMenu(moreMenu, moreBtn)
            : openMenu(moreMenu, moreBtn);
    });

    shareBtn?.addEventListener("click", (e) => {
        e.stopPropagation();
        shareMenu.classList.contains("on")
            ? closeMenu(shareMenu, shareBtn)
            : openMenu(shareMenu, shareBtn);
    });

    if (likeBtn) {
        const likeSvg = likeBtn.querySelector("svg");
        const likeCount = likeBtn.querySelector(
            ".Product-Detail-ActionBar-Count",
        );
        let liked = false;
        let count = parseInt(likeCount?.textContent ?? "0", 10);

        likeBtn.addEventListener("click", () => {
            liked = !liked;
            likeBtn.classList.toggle("active", liked);
            likeBtn.setAttribute("aria-pressed", String(liked));
            if (likeSvg)
                likeSvg.innerHTML = liked ? ICONS.heartFull : ICONS.heartEmpty;
            if (likeCount)
                likeCount.textContent = String(liked ? ++count : --count);
        });
    }

    if (bookmarkBtn) {
        const bookmarkSvg = bookmarkBtn.querySelector("svg");
        let bookmarked = false;

        bookmarkBtn.addEventListener("click", () => {
            bookmarked = !bookmarked;
            bookmarkBtn.classList.toggle("active", bookmarked);
            bookmarkBtn.setAttribute("aria-pressed", String(bookmarked));
            if (bookmarkSvg)
                bookmarkSvg.innerHTML = bookmarked
                    ? ICONS.bookmarkFull
                    : ICONS.bookmarkEmpty;
        });
    }
};
