window.onload = () => {
    "use strict";

    // ===== 1. Friends.html의 고정 DOM 참조 =====
    // 카테고리 칩이 들어 있는 기존 HTML 영역.
    // event.js는 이 #categoryScroll 내부만 동적으로 교체하고, 바깥 래퍼는 그대로 재사용한다.
    const scrollEl = document.getElementById("categoryScroll");
    // 카테고리 스크롤 좌우 화살표 버튼.
    const btnLeft = document.getElementById("scrollLeft");
    const btnRight = document.getElementById("scrollRight");

    // Friends.html에 미리 선언된 연결 해제 확인 모달.
    // 이 스크립트는 모달 DOM을 append/remove 하지 않고 .active 클래스만 토글한다.
    const modal = document.getElementById("disconnectModal");
    const modalTitle = document.getElementById("modalTitle");
    const modalConfirm = document.getElementById("modalConfirm");
    const modalCancel = document.getElementById("modalCancel");

    // 상단 헤더 뒤로가기 버튼.
    const headerBackButton = document.getElementById("headerBack");

    // ===== 2. 화면 상태 저장 =====
    // Friends.html의 초기 대카테고리 칩 마크업을 그대로 저장한다.
    // 소카테고리 화면에서 뒤로 가면 이 문자열을 다시 #categoryScroll에 넣어 원래 상태로 복원한다.
    const originalChipsHTML = scrollEl ? scrollEl.innerHTML : "";
    // 현재 "연결 끊기" 확인 대상 버튼을 저장한다.
    let pendingDisconnectButton = null;

    // ===== 3. 카테고리 배너 헬퍼 =====
    // 현재 스크롤 위치를 기준으로 좌우 화살표 노출 여부를 갱신한다.
    function updateScrollArrowVisibility() {
        if (!scrollEl || !btnLeft || !btnRight) return;

        btnLeft.style.display = scrollEl.scrollLeft > 0 ? "flex" : "none";
        btnRight.style.display =
            scrollEl.scrollLeft <
            scrollEl.scrollWidth - scrollEl.clientWidth - 1
                ? "flex"
                : "none";
    }

    // innerHTML을 교체한 직후 레이아웃이 다시 잡힌 다음 화살표 상태를 재계산한다.
    function scheduleScrollArrowVisibilityUpdate() {
        window.setTimeout(updateScrollArrowVisibility, 50);
    }

    // Friends.html의 #categoryScroll에 처음 있던 대카테고리 버튼 목록을 복원한다.
    // 이 함수가 호출되면 renderSubCategories()가 넣은 동적 버튼들은 모두 제거된다.
    function restoreMainCategories() {
        if (!scrollEl) return;

        scrollEl.innerHTML = originalChipsHTML;
        scrollEl.scrollLeft = 0;
        scheduleScrollArrowVisibilityUpdate();
    }

    // 선택한 대카테고리의 소카테고리 버튼 세트를 만들어
    // Friends.html의 기존 <div id="categoryScroll"> 안에만 다시 그린다.
    // 별도 레이어나 모달을 추가하지 않고, 해당 영역의 innerHTML만 교체한다.
    function renderSubCategories(categoryName, subCategories) {
        if (!scrollEl) return;

        let nextMarkup =
            '<button class="cat-back-btn" title="대카테고리로 돌아가기"><svg viewBox="0 0 24 24"><path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" transform="rotate(270 12 12)"/></svg></button>';
        nextMarkup += `<button class="cat-chip parent-highlight">${categoryName}</button>`;

        subCategories.forEach((subCategory) => {
            nextMarkup += `<button class="cat-chip" data-cat="${subCategory}" data-is-sub="true">${subCategory}</button>`;
        });

        scrollEl.innerHTML = nextMarkup;
        scrollEl.scrollLeft = 0;
        scheduleScrollArrowVisibilityUpdate();
    }

    // 현재 보이는 칩 목록 안에서 선택 상태를 한 개만 유지한다.
    function setActiveChip(chip) {
        if (!scrollEl || !chip) return;

        const allChips = scrollEl.querySelectorAll(
            ".cat-chip:not(.parent-highlight)",
        );

        allChips.forEach((chipButton) => {
            chipButton.classList.remove("active", "sub-active");
        });

        if (chip.dataset.isSub) {
            chip.classList.add("sub-active");
            return;
        }

        chip.classList.add("active");
    }

    // 카테고리 영역 전체에 대한 이벤트 위임 처리.
    // 동적으로 다시 그린 소카테고리 버튼도 동일한 핸들러가 계속 동작하도록 한다.
    function handleCategoryClick(event) {
        const clickedChip = event.target.closest(".cat-chip");
        const clickedBackButton = event.target.closest(".cat-back-btn");

        // 소카테고리 화면의 뒤로가기 버튼 클릭 시 원래 대카테고리 HTML을 복원한다.
        if (clickedBackButton) {
            restoreMainCategories();
            return;
        }

        if (!clickedChip) return;

        // data-subs가 있는 대카테고리는 현재 #categoryScroll 내부를 소카테고리 버튼 세트로 교체한다.
        if (clickedChip.classList.contains("has-subs")) {
            const categoryName = clickedChip.dataset.cat || "";
            const subCategories = (clickedChip.dataset.subs || "")
                .split(",")
                .filter(Boolean);

            renderSubCategories(categoryName, subCategories);
            return;
        }

        setActiveChip(clickedChip);
    }

    // ===== 4. 연결 버튼 / 모달 헬퍼 =====
    // 모달 제목에 표시할 핸들을 현재 카드에서 읽는다.
    // 현재 Friends.html은 .user-card[data-handle]을 사용하고,
    // 과거/확장용 sidebar 카드가 돌아와도 .sidebar-user-handle까지 읽을 수 있게 남겨둔다.
    function getHandleFromButton(button) {
        const userCard = button.closest("[data-handle]");
        if (userCard) return userCard.dataset.handle || "";

        const sidebarHandle = button
            .closest(".trend-item")
            ?.querySelector(".sidebar-user-handle");
        return sidebarHandle?.textContent.trim() || "";
    }

    // 기존 HTML 모달(#disconnectModal)을 연다.
    // DOM을 새로 추가하지 않고 제목만 갱신한 뒤 .active 클래스를 붙여 표시한다.
    function openDisconnectModal(button) {
        if (!modal || !modalTitle) return;

        pendingDisconnectButton = button;

        const handle = getHandleFromButton(button);
        modalTitle.textContent = handle
            ? `${handle} 님과의 연결을 끊으시겠습니까?`
            : "연결을 끊으시겠습니까?";

        modal.classList.add("active");
    }

    // 기존 HTML 모달(#disconnectModal)을 닫는다.
    // append/remove 없이 .active 클래스만 제거한다.
    function closeDisconnectModal() {
        if (!modal) return;

        modal.classList.remove("active");
        pendingDisconnectButton = null;
    }

    // Connected 상태 버튼을 기본 Connect 상태로 되돌린다.
    function resetButtonToDefault(button) {
        button.classList.remove("connected");
        button.classList.add("default");
        button.textContent = "Connect";
        button.style.borderColor = "";
        button.style.color = "";
        button.style.background = "";
    }

    // 기본 Connect 버튼을 Connected 상태로 바꾼다.
    function setButtonToConnected(button) {
        button.classList.remove("default");
        button.classList.add("connected");
        button.textContent = "Connected";
    }

    // Connected 버튼 hover 상태의 시각 속성을 통일해서 제어한다.
    function updateConnectedButtonHoverState(button, isHovering) {
        if (isHovering) {
            button.textContent = "Disconnect";
            button.style.borderColor = "#f4212e";
            button.style.color = "#f4212e";
            button.style.background = "rgba(244,33,46,.1)";
            return;
        }

        button.textContent = "Connected";
        button.style.borderColor = "#cfd9de";
        button.style.color = "#0f1419";
        button.style.background = "transparent";
    }

    // 문서 전체에서 Connect / Connected 버튼 클릭을 위임 처리한다.
    // 현재 Friends.html의 .connect-btn뿐 아니라, 추후 .connect-btn-sm이 다시 추가되어도 함께 동작한다.
    function handleConnectButtonClick(event) {
        const clickedButton = event.target.closest(
            ".connect-btn, .connect-btn-sm",
        );
        if (!clickedButton) return;

        if (clickedButton.classList.contains("default")) {
            setButtonToConnected(clickedButton);
            return;
        }

        if (clickedButton.classList.contains("connected")) {
            openDisconnectModal(clickedButton);
        }
    }

    // Connected 버튼에 마우스를 올리면 Disconnect 상태처럼 보이게 바꾼다.
    function handleConnectedButtonMouseOver(event) {
        const hoveredButton = event.target.closest(
            ".connect-btn.connected, .connect-btn-sm.connected",
        );
        if (!hoveredButton) return;

        updateConnectedButtonHoverState(hoveredButton, true);
    }

    // 마우스가 빠지면 Connected 기본 스타일로 복구한다.
    function handleConnectedButtonMouseOut(event) {
        const hoveredButton = event.target.closest(
            ".connect-btn.connected, .connect-btn-sm.connected",
        );
        if (!hoveredButton) return;

        updateConnectedButtonHoverState(hoveredButton, false);
    }

    // ===== 5. 이벤트 바인딩 =====
    if (scrollEl) {
        scrollEl.addEventListener("scroll", updateScrollArrowVisibility);
        scrollEl.addEventListener("click", handleCategoryClick);
        window.addEventListener("resize", updateScrollArrowVisibility);
        updateScrollArrowVisibility();
    }

    if (btnLeft && scrollEl) {
        btnLeft.addEventListener("click", () => {
            scrollEl.scrollBy({ left: -200, behavior: "smooth" });
        });
    }

    if (btnRight && scrollEl) {
        btnRight.addEventListener("click", () => {
            scrollEl.scrollBy({ left: 200, behavior: "smooth" });
        });
    }

    if (modalConfirm) {
        modalConfirm.addEventListener("click", () => {
            if (pendingDisconnectButton) {
                resetButtonToDefault(pendingDisconnectButton);
            }

            closeDisconnectModal();
        });
    }

    if (modalCancel) {
        modalCancel.addEventListener("click", closeDisconnectModal);
    }

    if (modal) {
        modal.addEventListener("click", (event) => {
            // 오버레이 자체를 클릭했을 때만 닫고,
            // 모달 박스 내부 클릭은 그대로 둔다.
            if (event.target === modal) {
                closeDisconnectModal();
            }
        });
    }

    document.addEventListener("click", handleConnectButtonClick);
    document.addEventListener("mouseover", handleConnectedButtonMouseOver);
    document.addEventListener("mouseout", handleConnectedButtonMouseOut);

    if (headerBackButton) {
        headerBackButton.addEventListener("click", () => {
            history.back();
        });
    }

    // 페이지 로드 완료 로그.
    console.log("[Friends] 페이지 로드 완료.");
};
