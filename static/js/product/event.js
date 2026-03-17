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

    const ownerMenu = document.querySelector(".Post-More-Menu.Owner");
    const productMenu = document.querySelector(".Post-More-Menu.Product");
    const shareMenu = document.querySelector(".Post-More-Menu.Share");
    const moreMenu = ownerMenu ?? productMenu;

    const overlay = document.querySelector(".Post-Media-Preview-Overlay");
    const overlayImg = overlay?.querySelector(".Post-Media-Preview-Image");
    const overlayClose = overlay?.querySelector(".Post-Media-Preview-Close");

    const deleteModal = document.querySelector(".Small-Modal.Delete-Product");
    const backdropModal = document.querySelector(".Modal-BackDrop");
    const reportDialog = document.querySelector(".Notification-Dialog--Report");
    const chatSheet = document.querySelector(".Share-Sheet");

    const ICONS = {
        heartEmpty: `<path d="M16.697 5.5c-1.222-.06-2.679.51-3.89 2.16l-.805 1.09-.806-1.09C9.984 6.01 8.526 5.44 7.304 5.5c-1.243.07-2.349.78-2.91 1.91-.552 1.12-.633 2.78.479 4.82 1.074 1.97 3.257 4.27 7.129 6.61 3.87-2.34 6.052-4.64 7.126-6.61 1.111-2.04 1.03-3.7.477-4.82-.561-1.13-1.666-1.84-2.908-1.91zm4.187 7.69c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z"/>`,
        heartFull: `<path d="M20.884 13.19c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z"/>`,
        bookmarkEmpty: `<path d="M4 4.5C4 3.12 5.119 2 6.5 2h11C18.881 2 20 3.12 20 4.5v18.44l-8-5.71-8 5.71V4.5zM6.5 4c-.276 0-.5.22-.5.5v14.56l6-4.29 6 4.29V4.5c0-.28-.224-.5-.5-.5h-11z"/>`,
        bookmarkFull: `<path d="M4 4.5C4 3.12 5.119 2 6.5 2h11C18.881 2 20 3.12 20 4.5v18.44l-8-5.71-8 5.71V4.5z"/>`,
    };

    // ── 토스트 ──
    function showToast(msg) {
        const existing = document.querySelector(".Product-Detail-Toast");
        if (existing) existing.remove();
        const t = document.createElement("div");
        t.className = "Product-Detail-Toast";
        t.textContent = msg;
        document.body.appendChild(t);
        setTimeout(() => t.remove(), 2500);
    }

    // ── 미디어 프리뷰 ──
    function openOverlay(src, alt) {
        if (!overlay || !overlayImg) return;
        overlayImg.src = src;
        overlayImg.alt = alt || "상품 이미지 미리보기";
        overlay.classList.remove("off");
        document.body.classList.add("modal-open");
    }
    function closeOverlay() {
        if (!overlay) return;
        overlay.classList.add("off");
        document.body.classList.remove("modal-open");
        setTimeout(() => {
            if (overlayImg) overlayImg.src = "";
        }, 200);
    }
    overlayClose?.addEventListener("click", closeOverlay);
    overlay?.addEventListener("click", (e) => {
        if (e.target === overlay) closeOverlay();
    });
    mediaGrid?.addEventListener("click", (e) => {
        const img = e.target.closest(".Product-Detail-Media-Image");
        if (img) openOverlay(img.src, img.alt);
    });

    // ── 메뉴 열기/닫기 ──
    let activeMenu = null,
        activeTrigger = null;

    function positionMenu(menu, btn) {
        const rect = btn.getBoundingClientRect();
        const menuW = menu.offsetWidth;
        const menuH = menu.offsetHeight;
        let left = rect.right - menuW;
        left = Math.max(8, Math.min(left, window.innerWidth - menuW - 8));
        const spaceBelow = window.innerHeight - rect.bottom;
        const top =
            spaceBelow >= menuH + 8 ? rect.bottom + 4 : rect.top - menuH - 4;
        menu.style.left = `${left}px`;
        menu.style.top = `${top}px`;
    }
    function openMenu(menu, btn) {
        if (activeMenu && activeMenu !== menu) closeAllMenus();
        menu.classList.remove("off");
        btn.setAttribute("aria-expanded", "true");
        activeMenu = menu;
        activeTrigger = btn;
        menu.style.position = "fixed";
        menu.style.zIndex = "9999";
        requestAnimationFrame(() => positionMenu(menu, btn));
    }
    function closeMenu(menu, btn) {
        if (!menu) return;
        menu.classList.add("off");
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

    document.addEventListener("click", (e) => {
        if (!activeMenu) return;
        if (
            !activeMenu.contains(e.target) &&
            !activeTrigger?.contains(e.target)
        )
            closeAllMenus();
    });
    function onViewportChange() {
        if (activeMenu && activeTrigger)
            positionMenu(activeMenu, activeTrigger);
    }
    window.addEventListener("scroll", onViewportChange, { passive: true });
    window.addEventListener("resize", onViewportChange, { passive: true });

    moreBtn?.addEventListener("click", (e) => {
        e.stopPropagation();
        moreMenu?.classList.contains("off")
            ? openMenu(moreMenu, moreBtn)
            : closeMenu(moreMenu, moreBtn);
    });
    shareBtn?.addEventListener("click", (e) => {
        e.stopPropagation();
        shareMenu?.classList.contains("off")
            ? openMenu(shareMenu, shareBtn)
            : closeMenu(shareMenu, shareBtn);
    });

    // ── 소모달(백드롭) 열기/닫기 ──
    function openSmall(modal) {
        modal?.classList.remove("off");
        backdropModal?.classList.remove("off");
    }
    function closeSmall(modal) {
        modal?.classList.add("off");
        backdropModal?.classList.add("off");
    }
    backdropModal?.addEventListener("click", () => {
        closeSmall(deleteModal);
        closeSmall(reportDialog);
    });

    // ── 더보기 메뉴 (Product — 다른 유저용) ──
    productMenu?.addEventListener("click", (e) => {
        const btn = e.target.closest(".Menu-Button");
        if (!btn) return;
        closeAllMenus();

        if (btn.classList.contains("Ingore")) {
            // 관심없음: 현재 상품 카드를 숨기거나 페이지 뒤로 이동
            const card = document.querySelector("[data-product-card]");
            if (card) card.style.display = "none";
            showToast("이 상품이 더 이상 표시되지 않습니다.");
            return;
        }
        if (btn.classList.contains("Report")) {
            openSmall(reportDialog);
        }
    });

    // ── 신고 모달 닫기 ──
    reportDialog
        ?.querySelector(".Notification-Dialog__Close")
        ?.addEventListener("click", () => closeSmall(reportDialog));
    reportDialog
        ?.querySelector(".Notification-Dialog__Backdrop")
        ?.addEventListener("click", () => closeSmall(reportDialog));
    reportDialog
        ?.querySelectorAll(".Notification-Report__Item")
        .forEach((item) => {
            item.addEventListener("click", () => {
                closeSmall(reportDialog);
                showToast("신고가 접수됐습니다.");
            });
        });

    // ── 더보기 메뉴 (Owner — 등록한 회원용) ──
    ownerMenu?.addEventListener("click", (e) => {
        const btn = e.target.closest(".Menu-Button");
        if (!btn) return;
        closeAllMenus();

        if (btn.classList.contains("DisConnect")) {
            openSmall(deleteModal);
        }
        // Edit은 별도 수정 페이지로 이동하는 로직 추가 예정
    });

    // ── 상품 삭제 모달 ──
    const closeDeleteBtns = deleteModal?.querySelectorAll(
        ".Delete-Product-Close, .Small-Button.Cancel",
    );
    closeDeleteBtns?.forEach((b) =>
        b.addEventListener("click", () => closeSmall(deleteModal)),
    );
    deleteModal
        ?.querySelector(".Small-Button.Ban")
        ?.addEventListener("click", () => {
            closeSmall(deleteModal);
            // TODO: DELETE /api/products/:id
            showToast("상품이 삭제됐습니다.");
        });

    // ── 공유 메뉴 ──
    shareMenu?.addEventListener("click", (e) => {
        const btn = e.target.closest(".Menu-Button");
        if (!btn) return;
        const text = btn.querySelector(".Button-Text")?.textContent.trim();
        closeAllMenus();

        if (text === "링크 복사하기") {
            navigator.clipboard
                ?.writeText(window.location.href)
                .then(() => showToast("클립보드로 복사함"))
                .catch(() => showToast("링크를 복사하지 못했습니다."));
            return;
        }
        if (text === "Chat으로 전송하기") {
            chatSheet?.classList.remove("off");
            backdropModal?.classList.remove("off");
            return;
        }
        if (text === "폴더에 북마크 추가하기") {
            openBookmarkSheet();
        }
    });

    // Chat 전송 시트 닫기
    chatSheet
        ?.querySelector("[data-share-close='true']")
        ?.addEventListener("click", () => {
            chatSheet.classList.add("off");
            backdropModal?.classList.add("off");
        });
    chatSheet
        ?.querySelector(".Share-Sheet-Backdrop")
        ?.addEventListener("click", () => {
            chatSheet.classList.add("off");
            backdropModal?.classList.add("off");
        });
    chatSheet?.querySelectorAll(".Share-Sheet-User").forEach((userBtn) => {
        userBtn.addEventListener("click", () => {
            chatSheet.classList.add("off");
            backdropModal?.classList.add("off");
            showToast("쪽지로 전송됐습니다.");
        });
    });

    // 북마크 폴더 시트 (동적 생성)
    function openBookmarkSheet() {
        const existing = document.querySelector(".Bookmark-Sheet");
        if (existing) {
            existing.remove();
            return;
        }

        const sheet = document.createElement("div");
        sheet.className = "Share-Sheet Bookmark-Sheet";
        sheet.innerHTML = `
            <div class="Share-Sheet-Backdrop"></div>
            <div class="Share-Sheet-Card Share-Sheet-Card--Bookmark" role="dialog" aria-modal="true">
                <div class="Share-Sheet-Header">
                    <button type="button" class="Share-Sheet-Icon-Btn bk-close" aria-label="닫기">
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M10.59 12L4.54 5.96l1.42-1.42L12 10.59l6.04-6.05 1.42 1.42L13.41 12l6.05 6.04-1.42 1.42L12 13.41l-6.04 6.05-1.42-1.42L10.59 12z"/></svg>
                    </button>
                    <h2 class="Share-Sheet-Title">폴더에 추가</h2>
                    <span class="Share-Sheet-Header-Spacer"></span>
                </div>
                <button type="button" class="Share-Sheet-Create-Folder bk-close">새 북마크 폴더 만들기</button>
                <button type="button" class="Share-Sheet-Folder" id="bkAllFolder">
                    <span class="Share-Sheet-Folder-Icon">
                        <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M2.998 8.5c0-1.38 1.119-2.5 2.5-2.5h9c1.381 0 2.5 1.12 2.5 2.5v14.12l-7-3.5-7 3.5V8.5zM18.5 2H8.998v2H18.5c.275 0 .5.224.5.5V15l2 1.4V4.5c0-1.38-1.119-2.5-2.5-2.5z"/></svg>
                    </span>
                    <span class="Share-Sheet-Folder-Name">모든 북마크</span>
                    <span class="Share-Sheet-Folder-Check" id="bkCheck" style="color:transparent">
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M9.64 18.952l-5.55-4.861 1.317-1.504 3.951 3.459 8.459-10.948L19.4 6.32 9.64 18.952z"/></svg>
                    </span>
                </button>
            </div>`;

        function closeSheet() {
            sheet.remove();
            backdropModal?.classList.add("off");
        }
        sheet
            .querySelector(".Share-Sheet-Backdrop")
            .addEventListener("click", closeSheet);
        sheet
            .querySelectorAll(".bk-close")
            .forEach((b) => b.addEventListener("click", closeSheet));

        let bookmarked = false;
        sheet.querySelector("#bkAllFolder").addEventListener("click", () => {
            bookmarked = !bookmarked;
            sheet.querySelector("#bkCheck").style.color = bookmarked
                ? "#1d9bf0"
                : "transparent";
            if (bookmarked) {
                closeSheet();
                showToast("북마크에 추가됐습니다.");
            }
        });

        document.body.appendChild(sheet);
        backdropModal?.classList.remove("off");
    }

    // ── 좋아요 ──
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

    // ── 북마크 ──
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

    // ── ESC ──
    document.addEventListener("keydown", (e) => {
        if (e.key !== "Escape") return;
        closeOverlay();
        closeAllMenus();
        closeSmall(deleteModal);
        closeSmall(reportDialog);
        chatSheet?.classList.add("off");
        document.querySelector(".Bookmark-Sheet")?.remove();
        backdropModal?.classList.add("off");
    });
};
