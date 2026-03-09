(function () {
    "use strict";

    const scrollEl = document.getElementById("categoryScroll");
    const btnLeft = document.getElementById("scrollLeft");
    const btnRight = document.getElementById("scrollRight");

    /* ===== ORIGINAL CHIPS HTML (대카테고리 상태 저장) ===== */
    const originalChipsHTML = scrollEl ? scrollEl.innerHTML : "";

    /* ===== SCROLL ARROWS ===== */
    function checkScroll() {
        if (!scrollEl) return;
        btnLeft.style.display = scrollEl.scrollLeft > 0 ? "flex" : "none";
        btnRight.style.display =
            scrollEl.scrollLeft <
            scrollEl.scrollWidth - scrollEl.clientWidth - 1
                ? "flex"
                : "none";
    }

    if (scrollEl) {
        scrollEl.addEventListener("scroll", checkScroll);
        window.addEventListener("resize", checkScroll);
        checkScroll();
    }
    if (btnLeft)
        btnLeft.addEventListener("click", () => {
            scrollEl.scrollBy({ left: -200, behavior: "smooth" });
        });
    if (btnRight)
        btnRight.addEventListener("click", () => {
            scrollEl.scrollBy({ left: 200, behavior: "smooth" });
        });

    /* ===== CATEGORY CHIP CLICK (대카테고리 → 소카테고리) ===== */
    if (scrollEl) {
        scrollEl.addEventListener("click", (e) => {
            const chip = e.target.closest(".cat-chip");
            const backBtn = e.target.closest(".cat-back-btn");

            // ↑ 버튼: 대카테고리로 복귀
            if (backBtn) {
                scrollEl.innerHTML = originalChipsHTML;
                scrollEl.scrollLeft = 0;
                setTimeout(checkScroll, 50);
                return;
            }

            if (!chip) return;

            // 소카테고리가 있는 대카테고리 클릭 → 소카테고리 전환
            if (chip.classList.contains("has-subs")) {
                const catName = chip.dataset.cat;
                const subs = chip.dataset.subs.split(",");

                let html =
                    '<button class="cat-back-btn" title="대카테고리로 돌아가기"><svg viewBox="0 0 24 24"><path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" transform="rotate(270 12 12)"/></svg></button>';
                html += `<button class="cat-chip parent-highlight">${catName}</button>`;
                subs.forEach((s) => {
                    html += `<button class="cat-chip" data-cat="${s}" data-is-sub="true">${s}</button>`;
                });

                scrollEl.innerHTML = html;
                scrollEl.scrollLeft = 0;
                setTimeout(checkScroll, 50);
                return;
            }

            // 일반 칩 활성화
            const allChips = scrollEl.querySelectorAll(
                ".cat-chip:not(.parent-highlight)",
            );
            allChips.forEach((c) => {
                c.classList.remove("active", "sub-active");
            });

            if (chip.dataset.isSub) {
                chip.classList.add("sub-active");
            } else {
                chip.classList.add("active");
            }
        });
    }

    /* ===== DISCONNECT CONFIRMATION MODAL ===== */
    const modal = document.getElementById("disconnectModal");
    const modalTitle = document.getElementById("modalTitle");
    const modalConfirm = document.getElementById("modalConfirm");
    const modalCancel = document.getElementById("modalCancel");
    let pendingBtn = null;

    function openModal(btn) {
        pendingBtn = btn;

        // 핸들 또는 이름 가져오기
        let handle = "";
        const card = btn.closest("[data-handle]");
        if (card) {
            handle = card.dataset.handle;
        } else {
            const handleEl = btn.closest(".trend-item")?.querySelector(".sidebar-user-handle");
            if (handleEl) handle = handleEl.textContent.trim();
        }

        modalTitle.textContent = handle
            ? `${handle} 님과의 연결을 끊으시겠습니까?`
            : "연결을 끊으시겠습니까?";

        modal.classList.add("active");
    }

    function closeModal() {
        modal.classList.remove("active");
        pendingBtn = null;
    }

    if (modalConfirm) {
        modalConfirm.addEventListener("click", () => {
            if (pendingBtn) {
                pendingBtn.classList.remove("connected");
                pendingBtn.classList.add("default");
                pendingBtn.textContent = "Connect";
                pendingBtn.style.borderColor = "";
                pendingBtn.style.color = "";
                pendingBtn.style.background = "";
            }
            closeModal();
        });
    }

    if (modalCancel) {
        modalCancel.addEventListener("click", closeModal);
    }

    if (modal) {
        modal.addEventListener("click", (e) => {
            if (e.target === modal) closeModal();
        });
    }

    /* ===== CONNECT / CONNECTED / DISCONNECT ===== */
    document.addEventListener("click", (e) => {
        const btn = e.target.closest(".connect-btn, .connect-btn-sm");
        if (!btn) return;

        if (btn.classList.contains("default")) {
            btn.classList.remove("default");
            btn.classList.add("connected");
            btn.textContent = "Connected";
        } else if (btn.classList.contains("connected")) {
            // 바로 해제하지 않고 확인 모달 표시
            openModal(btn);
        }
    });

    /* Connected 버튼 hover → Disconnect 표시 */
    document.addEventListener("mouseover", (e) => {
        const btn = e.target.closest(
            ".connect-btn.connected, .connect-btn-sm.connected",
        );
        if (!btn) return;
        btn.textContent = "Disconnect";
        btn.style.borderColor = "#f4212e";
        btn.style.color = "#f4212e";
        btn.style.background = "rgba(244,33,46,.1)";
    });

    document.addEventListener("mouseout", (e) => {
        const btn = e.target.closest(
            ".connect-btn.connected, .connect-btn-sm.connected",
        );
        if (!btn) return;
        btn.textContent = "Connected";
        btn.style.borderColor = "#cfd9de";
        btn.style.color = "#0f1419";
        btn.style.background = "transparent";
    });

    /* ===== HEADER BACK ===== */
    const backBtn = document.getElementById("headerBack");
    if (backBtn) {
        backBtn.addEventListener("click", () => {
            history.back();
        });
    }

    console.log("[Friends] 페이지 로드 완료.");
})();
