// ============================================================
// Subscribe event.js - Premium 구독 페이지 인터랙션
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
    // --- 요소 참조 ---
    const toggleTrack = document.querySelector(".sub-toggle__track");
    const toggleOptions = document.querySelectorAll(".sub-toggle__option");
    const planButtons = document.querySelectorAll(".sub-plan");
    const closeBtn = document.querySelector(".sub-close");
    const backdrop = document.querySelector(".sub-backdrop");
    const popup = document.getElementById("learnMorePopup");
    const popupClose = document.querySelector(".sub-popup__close");
    const popupBackdrop = document.querySelector(".sub-popup__backdrop");
    const popupTitle = document.querySelector(".sub-popup__title");
    const popupDesc = document.querySelector(".sub-popup__desc");
    const footerPlanName = document.querySelector(".sub-footer__plan-name");
    const footerPrice = document.querySelector(".sub-footer__price");
    const footerPeriod = document.querySelector(".sub-footer__period");
    const footerBilling = document.querySelector(".sub-footer__billing");
    const payBtn = document.querySelector(".sub-footer__pay-btn");

    // --- 상태 ---
    let currentPeriod = "monthly";
    let currentPlan = "pro";

    // --- 가격 데이터 ---
    const priceData = {
        free: { monthly: "₩0", annual: "₩0", billingMonthly: "", billingAnnual: "", displayName: "Free" },
        pro: { monthly: "₩90,000", annual: "₩75,000", billingMonthly: "Billed monthly", billingAnnual: "1,000,000₩ billed annually", displayName: "Premium" },
        ultimate: { monthly: "₩150,000", annual: "₩125,000", billingMonthly: "Billed monthly", billingAnnual: "₩1,600,000 billed annually", displayName: "Premium+" },
    };

    // --- Learn More 팝업 데이터 ---
    const learnMoreData = {
        analytics: { title: "Advanced analytics", desc: "Track post performance, audience insights, engagement trends, and real-time data." },
        "boosted-replies": { title: "Boosted replies", desc: "Replies from Premium subscribers are more likely to be shown first." },
        xpro: { title: "X Pro", desc: "Monitor multiple timelines on one screen with a multi-column layout." },
        supergrok: { title: "SuperGrok", desc: "Get the highest usage limits for AI powered by xAI." },
        "handle-marketplace": { title: "Handle Marketplace", desc: "Request inactive handles for personal use or for your business." },
        "highest-reply-boost": { title: "Highest reply boost", desc: "Your replies get the highest visibility boost in conversations." },
        radar: { title: "Radar Advanced Search", desc: "Discover trending topics and analytics with advanced search tools." },
        "write-articles": { title: "Write Articles", desc: "Create and publish long-form articles directly on X." },
        "get-paid": { title: "Get paid to post", desc: "Earn revenue from your posts through the creator revenue sharing program." },
        "creator-subs": { title: "Creator Subscriptions", desc: "Offer paid subscriptions to your followers for exclusive content." },
        "xpro-compare": { title: "X Pro", desc: "Monitor multiple timelines on one screen with a multi-column layout." },
        "media-studio": { title: "Media Studio", desc: "Advanced media management tools for uploading, organizing, and publishing content." },
        "analytics-compare": { title: "Analytics", desc: "Detailed analytics dashboard for tracking your content performance." },
    };

    // ============================================================
    // 1. Annual/Monthly 토글
    // ============================================================
    toggleOptions.forEach((option) => {
        option.addEventListener("click", () => {
            const period = option.dataset.period;
            if (period === currentPeriod) return;

            currentPeriod = period;

            // aria-checked 토글
            toggleOptions.forEach((opt) => {
                const isActive = opt.dataset.period === period;
                opt.setAttribute("aria-checked", isActive);
                opt.classList.toggle("sub-toggle__option--active", isActive);
            });

            // 슬라이더 인디케이터 이동
            toggleTrack.dataset.period = period;

            // 가격 업데이트
            updatePrices();
            updateFooter();
        });
    });

    // ============================================================
    // 2. 플랜 카드 선택
    // ============================================================
    planButtons.forEach((btn) => {
        btn.addEventListener("click", (e) => {
            // Learn more 버튼 클릭 시 카드 선택 방지
            if (e.target.closest(".sub-feature__info")) return;

            const plan = btn.dataset.plan;
            if (plan === currentPlan) return;

            currentPlan = plan;

            // 모든 카드 선택 해제
            planButtons.forEach((b) => {
                b.classList.remove("sub-plan--selected");
                const card = b.querySelector(".sub-plan__card");
                const radio = b.querySelector(".sub-plan__radio");
                card.classList.remove("sub-plan__card--active");
                radio.classList.remove("sub-plan__radio--checked");

                // 체크 아이콘 제거
                const existingCheck = radio.querySelector(".sub-plan__check-icon");
                if (existingCheck) existingCheck.remove();

                // 빈 원으로 리셋
                const circle = radio.querySelector(".sub-plan__radio-circle");
                circle.innerHTML = "";
            });

            // 선택된 카드 활성화
            btn.classList.add("sub-plan--selected");
            const card = btn.querySelector(".sub-plan__card");
            const radio = btn.querySelector(".sub-plan__radio");
            card.classList.add("sub-plan__card--active");
            radio.classList.add("sub-plan__radio--checked");

            // 체크 아이콘 추가
            const circle = radio.querySelector(".sub-plan__radio-circle");
            circle.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true" class="sub-plan__check-icon"><g><path d="M9.64 18.952l-5.55-4.861 1.317-1.504 3.951 3.459 8.459-10.948L19.4 6.32 9.64 18.952z"></path></g></svg>`;

            updateFooter();
        });
    });

    // ============================================================
    // 3. Learn More 팝업
    // ============================================================
    document.querySelectorAll(".sub-feature__info").forEach((btn) => {
        btn.addEventListener("click", (e) => {
            e.stopPropagation();
            const infoKey = btn.dataset.info;
            const data = learnMoreData[infoKey];
            if (!data) return;

            popupTitle.textContent = data.title;
            popupDesc.textContent = data.desc;
            popup.style.display = "";
        });
    });

    function closePopup() {
        popup.style.display = "none";
    }

    if (popupClose) popupClose.addEventListener("click", closePopup);
    if (popupBackdrop) popupBackdrop.addEventListener("click", closePopup);

    // ============================================================
    // 4. 닫기 버튼 & 배경 클릭
    // ============================================================
    function closeDialog() {
        const overlay = document.querySelector(".sub-overlay");
        overlay.style.opacity = "0";
        overlay.style.transform = "scale(0.95)";
        overlay.style.transition = "opacity 0.2s, transform 0.2s";
        setTimeout(() => {
            overlay.style.display = "none";
        }, 200);
    }

    if (closeBtn) closeBtn.addEventListener("click", closeDialog);
    if (backdrop) backdrop.addEventListener("click", closeDialog);

    // ESC 키로 닫기
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            if (popup.style.display !== "none") {
                closePopup();
            } else {
                closeDialog();
            }
        }
    });

    // ============================================================
    // 5. Subscribe & Pay 버튼
    // ============================================================
    if (payBtn) {
        payBtn.addEventListener("click", () => {
            const plan = priceData[currentPlan];
            const price = currentPeriod === "monthly" ? plan.monthly : plan.annual;
            console.log(`Subscribe clicked: ${plan.displayName} - ${price}/${currentPeriod}`);
            // 결제 플로우 연결 (Bootpay 등)
        });
    }

    // ============================================================
    // 유틸리티 함수
    // ============================================================
    function updatePrices() {
        document.querySelectorAll(".sub-plan__price[data-monthly]").forEach((el) => {
            el.textContent = currentPeriod === "monthly" ? el.dataset.monthly : el.dataset.annual;
        });

        document.querySelectorAll(".sub-plan__billing-text[data-monthly]").forEach((el) => {
            el.textContent = currentPeriod === "monthly" ? el.dataset.monthly : el.dataset.annual;
        });
    }

    function updateFooter() {
        const plan = priceData[currentPlan];
        if (!plan) return;

        footerPlanName.textContent = plan.displayName;
        footerPrice.textContent = currentPeriod === "monthly" ? plan.monthly : plan.annual;
        footerPeriod.textContent = currentPlan === "free" ? "" : "/ month";
        footerBilling.textContent = currentPeriod === "monthly" ? plan.billingMonthly : plan.billingAnnual;
    }
});
