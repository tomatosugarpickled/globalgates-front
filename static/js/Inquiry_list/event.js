window.onload = function () {
    "use strict";

    const scrollEl = document.getElementById("categoryScroll");
    const btnLeft = document.getElementById("scrollLeft");
    const btnRight = document.getElementById("scrollRight");
    const modal = document.getElementById("disconnectModal");
    const modalTitle = document.getElementById("modalTitle");
    const modalConfirm = document.getElementById("modalConfirm");
    const modalCancel = document.getElementById("modalCancel");
    const headerBack = document.getElementById("headerBack");
    const inquiryTabs = Array.from(document.querySelectorAll("[data-inquiry-tab]"));
    const tabLinks = document.querySelectorAll(".tab-link");
    const bottombarSlide = document.querySelector(".bottombar-slide");
    const INQUIRY_TAB_PREVIEW_DURATION_MS = 280;
    const originalChipsHTML = scrollEl ? scrollEl.innerHTML : "";
    let pendingBtn = null;
    let lastScrollY = 0;

    function checkScroll() {
        if (!scrollEl || !btnLeft || !btnRight) return;

        btnLeft.style.display = scrollEl.scrollLeft > 0 ? "flex" : "none";
        btnRight.style.display =
            scrollEl.scrollLeft <
            scrollEl.scrollWidth - scrollEl.clientWidth - 1
                ? "flex"
                : "none";
    }

    function closeModal() {
        if (!modal) return;

        modal.classList.remove("active");
        pendingBtn = null;
    }

    function openModal(btn) {
        if (!modal || !modalTitle) return;

        pendingBtn = btn;

        const requestCard = btn.closest("[data-handle]");
        const sidebarHandle = btn
            .closest(".trend-item")
            ?.querySelector(".sidebar-user-handle");
        const requestLabel =
            requestCard?.dataset.handle || sidebarHandle?.textContent?.trim() || "";

        modalTitle.textContent = requestLabel
            ? `${requestLabel} 거래처를 disapproved 처리하시겠습니까?`
            : "이 거래처를 disapproved 처리하시겠습니까?";

        modal.classList.add("active");
    }

    function setActiveTab(tabName) {
        tabLinks.forEach((link) => {
            const path = link.querySelector("path");
            if (!path) return;

            const active = link.dataset.tab === tabName;
            path.setAttribute(
                "d",
                active ? path.dataset.active : path.dataset.inactive,
            );
            link.classList.toggle("tab-link--active", active);
        });
    }

    function setActiveInquiryTab(tabName) {
        inquiryTabs.forEach((tab) => {
            const active = tab.dataset.inquiryTab === tabName;
            tab.classList.toggle("inquiry-tab--active", active);
            tab.setAttribute("aria-selected", String(active));
        });
    }

    function previewInquiryTab(tab) {
        tab.classList.remove("inquiry-tab--preview");
        void tab.offsetWidth;
        tab.classList.add("inquiry-tab--preview");
        window.setTimeout(() => {
            tab.classList.remove("inquiry-tab--preview");
        }, INQUIRY_TAB_PREVIEW_DURATION_MS);
    }

    if (scrollEl) {
        scrollEl.addEventListener("scroll", checkScroll);
        window.addEventListener("resize", checkScroll);
        checkScroll();

        scrollEl.addEventListener("click", (event) => {
            const chip = event.target.closest(".cat-chip");
            const backBtn = event.target.closest(".cat-back-btn");

            if (backBtn) {
                scrollEl.innerHTML = originalChipsHTML;
                scrollEl.scrollLeft = 0;
                setTimeout(checkScroll, 50);
                return;
            }

            if (!chip) return;

            if (chip.classList.contains("has-subs")) {
                const category = chip.dataset.cat;
                const subs = chip.dataset.subs.split(",");

                let html =
                    '<button class="cat-back-btn" title="이전 카테고리" type="button"><svg viewBox="0 0 24 24"><path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" transform="rotate(270 12 12)"/></svg></button>';
                html += `<button class="cat-chip parent-highlight">${category}</button>`;
                subs.forEach((sub) => {
                    html += `<button class="cat-chip" data-cat="${sub}" data-is-sub="true">${sub}</button>`;
                });

                scrollEl.innerHTML = html;
                scrollEl.scrollLeft = 0;
                setTimeout(checkScroll, 50);
                return;
            }

            scrollEl
                .querySelectorAll(".cat-chip:not(.parent-highlight)")
                .forEach((button) => {
                    button.classList.remove("active", "sub-active");
                });

            chip.classList.add(chip.dataset.isSub ? "sub-active" : "active");
        });
    }

    if (btnLeft) {
        btnLeft.addEventListener("click", () => {
            scrollEl?.scrollBy({ left: -200, behavior: "smooth" });
        });
    }

    if (btnRight) {
        btnRight.addEventListener("click", () => {
            scrollEl?.scrollBy({ left: 200, behavior: "smooth" });
        });
    }

    if (modalConfirm) {
        modalConfirm.addEventListener("click", () => {
            if (pendingBtn) {
                pendingBtn.classList.remove("disconnect");
                pendingBtn.classList.add("default");
                pendingBtn.textContent = "approve";
            }

            closeModal();
        });
    }

    if (modalCancel) {
        modalCancel.addEventListener("click", closeModal);
    }

    if (modal) {
        modal.addEventListener("click", (event) => {
            if (event.target === modal) {
                closeModal();
            }
        });
    }

    document.addEventListener("click", (event) => {
        const button = event.target.closest(".connect-btn, .connect-btn-sm");
        if (!button) return;

        if (button.classList.contains("default")) {
            button.classList.remove("default");
            button.classList.add("disconnect");
            button.textContent = "disapproved";
            return;
        }

        if (button.classList.contains("disconnect")) {
            openModal(button);
        }
    });

    setActiveTab("notifications");
    setActiveInquiryTab("partners");

    tabLinks.forEach((link) => {
        link.addEventListener("click", (event) => {
            event.preventDefault();
            setActiveTab(link.dataset.tab);
        });
    });

    inquiryTabs.forEach((tab) => {
        tab.addEventListener("click", () => {
            previewInquiryTab(tab);
            setActiveInquiryTab(tab.dataset.inquiryTab);
        });
    });

    window.addEventListener(
        "scroll",
        () => {
            if (!bottombarSlide) return;

            const currentY = window.scrollY;
            bottombarSlide.style.transform =
                currentY > lastScrollY && currentY > 100
                    ? "translateY(100%)"
                    : "translateY(0)";
            lastScrollY = currentY;
        },
        { passive: true },
    );

    if (headerBack) {
        headerBack.addEventListener("click", () => {
            history.back();
        });
    }

    console.log("[Inquiry] 페이지 로드 완료.");
};
