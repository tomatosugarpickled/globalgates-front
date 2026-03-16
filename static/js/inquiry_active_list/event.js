// inquiry_active_list 화면에서 사용하는 모든 상호작용을 한 곳에서 초기화한다.
window.onload = () => {
    // 상단 탭 / 패널 / 필터 / 기간 버튼처럼 처음부터 HTML에 존재하는 고정 UI 참조들이다.
    const tabButtons = Array.from(
        document.querySelectorAll("[data-inquiry-tab]"),
    );
    const panels = Array.from(
        document.querySelectorAll("[data-inquiry-panel]"),
    );
    const periodChips = Array.from(
        document.querySelectorAll("[data-period-chip]"),
    );
    const filterTrigger = document.querySelector(
        "[data-activity-filter-trigger]",
    );
    const filterMenu = document.querySelector("[data-activity-filter-menu]");
    const filterLabel = document.querySelector("[data-activity-filter-label]");
    const filterItems = Array.from(
        document.querySelectorAll("[data-activity-filter-item]"),
    );

    // 답글 모달은 HTML의 [data-reply-modal] 골격을 재사용하고, 열릴 때마다 내용만 채운다.
    const replyModalOverlay = document.querySelector("[data-reply-modal]");
    const replyModal = replyModalOverlay?.querySelector(".tweet-modal");
    const replyCloseButton = replyModalOverlay?.querySelector(
        ".tweet-modal__close",
    );
    const replyEditor = replyModalOverlay?.querySelector("[data-reply-editor]");
    const replySubmitButton = replyModalOverlay?.querySelector(
        "[data-reply-submit]",
    );
    const replySourceAvatar = replyModalOverlay?.querySelector(
        "[data-reply-source-avatar]",
    );
    const replyAvatar = replyModalOverlay?.querySelector("[data-reply-avatar]");
    const replySourceName = replyModalOverlay?.querySelector(
        "[data-reply-source-name]",
    );
    const replySourceHandle = replyModalOverlay?.querySelector(
        "[data-reply-source-handle]",
    );
    const replySourceTime = replyModalOverlay?.querySelector(
        "[data-reply-source-time]",
    );
    const replySourceText = replyModalOverlay?.querySelector(
        "[data-reply-source-text]",
    );

    // 답글 모달 원형 글자수 게이지
    const replyGauge = replyModalOverlay?.querySelector("[data-reply-gauge]");
    const replyGaugeText = replyModalOverlay?.querySelector("[data-reply-gauge-text]");
    // 답글 모달 툴바 버튼들
    const replyMediaUploadButton = replyModalOverlay?.querySelector("[data-testid='mediaUploadButton']");
    const replyFileInput = replyModalOverlay?.querySelector("[data-testid='fileInput']");
    // 서식 버튼 목록 (굵게/기울임)
    const replyFormatButtons = replyModalOverlay?.querySelectorAll("[data-format]") ?? [];
    // 이모지 피커 관련
    const replyEmojiButton = replyModalOverlay?.querySelector("[data-testid='emojiButton']");
    const replyEmojiPicker = replyModalOverlay?.querySelector(".tweet-modal__emoji-picker");
    const replyEmojiSearchInput = replyModalOverlay?.querySelector("[data-testid='emojiSearchInput']");
    const replyEmojiTabs = replyModalOverlay?.querySelectorAll(".tweet-modal__emoji-tab") ?? [];
    const replyEmojiContent = replyModalOverlay?.querySelector("[data-testid='emojiPickerContent']");
    // 첨부파일 관련
    const replyAttachmentPreview = replyModalOverlay?.querySelector("[data-attachment-preview]");
    const replyAttachmentMedia = replyModalOverlay?.querySelector("[data-attachment-media]");
    // 작성 화면 래퍼
    const composeView = replyModalOverlay?.querySelector(".tweet-modal__compose-view");
    // 위치 태그 버튼 및 서브뷰
    const replyGeoButton = replyModalOverlay?.querySelector("[data-testid='geoButton']");
    const replyGeoButtonPath = replyGeoButton?.querySelector("path");
    const replyLocationView = replyModalOverlay?.querySelector(".tweet-modal__location-view");
    const replyLocationCloseButton = replyLocationView?.querySelector(".tweet-modal__location-close");
    const replyLocationDeleteButton = replyLocationView?.querySelector("[data-location-delete]");
    const replyLocationCompleteButton = replyLocationView?.querySelector("[data-location-complete]");
    const replyLocationSearchInput = replyLocationView?.querySelector("[data-location-search]");
    const replyLocationList = replyLocationView?.querySelector("[data-location-list]");
    const replyLocationDisplayButton = replyModalOverlay?.querySelector("[data-location-display]");
    const replyLocationName = replyModalOverlay?.querySelector("[data-location-name]");
    const replyFooterMeta = replyModalOverlay?.querySelector(".tweet-modal__footer-meta");
    // 판매글 선택 버튼
    const replyProductButton = replyModalOverlay?.querySelector("[data-testid='productSelectButton']");
    // 판매글 선택 서브뷰
    const replyProductView = replyModalOverlay?.querySelector("[data-product-select-modal]");
    const productSelectClose = replyProductView?.querySelector("[data-product-select-close]");
    const productSelectList = replyProductView?.querySelector("[data-product-select-list]");
    const productSelectComplete = replyProductView?.querySelector("[data-product-select-complete]");
    const productSelectEmpty = replyProductView?.querySelector("[data-product-empty]");

    // 공유 드롭다운은 HTML의 #layers 루트에 동적으로 추가된다.
    const layersRoot = document.getElementById("layers");

    // 탭 미리보기 애니메이션 시간과 게시물 본문 축약 기준 길이다.
    const PREVIEW_DURATION_MS = 280;
    const MAX_POST_TEXT_LENGTH = 140;
    // 답글 최대 글자수 (main 게시하기와 동일)
    const REPLY_MAX_LENGTH = 500;

    // 현재 열려 있는 UI와 마지막으로 눌린 트리거를 추적해서 중복 오픈과 복귀 포커스를 관리한다.
    let activeReplyTrigger = null;
    let activeShareDropdown = null;
    let activeShareButton = null;
    let activeShareModal = null;
    let activePostMoreMenu = null;
    let activePostMoreButton = null;
    // 더보기 드롭다운(동적 #layers) 및 차단/신고 모달 상태
    let activeMoreDropdown = null;
    let activeMoreButton = null;
    let activeNotificationModal = null;
    let activeNotificationToast = null;
    // 사용자별 팔로우 상태를 저장하는 Map
    const followState = new Map();
    // 답글 서식/선택/이모지/첨부 상태
    let pendingReplyFormats = new Set();
    let savedReplySelection = null;
    let savedReplySelectionOffsets = null;
    let isInsertingReplyEmoji = false;
    let shouldRestoreReplyEditorAfterEmojiInsert = false;
    let replyEmojiLibraryPicker = null;
    let attachedReplyFiles = [];
    let attachedReplyFileUrls = [];
    let pendingAttachmentEditIndex = null;
    let selectedProduct = null;
    let selectedLocation = null;
    let pendingLocation = null;
    const cachedLocationNames = ["대한민국 서초구", "대한민국 강남구", "대한민국 송파구", "대한민국 광진구", "대한민국 동작구", "대한민국 중구"];
    const maxReplyImages = 4;
    let activeEmojiCategory = "recent";
    // 신고 사유 목록 (Notification과 동일)
    const reportReasons = [
        "다른 회사 제품 도용 신고",
        "실제 존재하지 않는 제품 등록 신고",
        "스펙·원산지 허위 표기 신고",
        "특허 제품 무단 판매 신고",
        "수출입 제한 품목 신고",
        "반복적인 동일 게시물 신고",
    ];

    // ===== 공통 유틸 =====
    // DOM 텍스트를 정리해서 비교/표시에 안전한 문자열로 만든다.
    const getTextContent = (element) =>
        element?.textContent?.replace(/\s+/g, " ").trim() ?? "";

    // 동적으로 innerHTML을 만들 때 사용되는 최소 HTML 이스케이프 유틸이다.
    const escapeHtml = (value) =>
        String(value ?? "")
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#39;");

    // 실제 프로필 이미지가 없을 때 사용할 간단한 원형 아바타 SVG를 data URL로 만든다.
    const buildAvatarDataUrl = (label) => {
        const safeLabel = escapeHtml(String(label || "나").slice(0, 2));
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="72" height="72" viewBox="0 0 72 72"><rect width="72" height="72" rx="36" fill="#1d9bf0"></rect><text x="36" y="43" text-anchor="middle" font-size="28" font-family="Arial, sans-serif" fill="#ffffff">${safeLabel}</text></svg>`;
        return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
    };

    // 이벤트가 발생한 버튼 기준으로 가장 가까운 게시물 카드를 찾는다.
    const getPostCard = (element) => element?.closest(".postCard") ?? null;

    // 게시물 카드에서 프로필 이미지를 읽고, 없으면 생성형 아바타를 반환한다.
    const getPostAvatarSrc = (postCard) => {
        const avatarImage = postCard?.querySelector(".postAvatarImage");
        return (
            avatarImage?.getAttribute("src") ||
            buildAvatarDataUrl(
                getTextContent(postCard?.querySelector(".postAvatar")),
            )
        );
    };

    // ===== 탭 표시 제어 =====
    // inquiry_active_list는 activity 패널만 실제 콘텐츠를 보여 주도록 고정한다.
    const ensureActivityPanelVisible = () => {
        panels.forEach((panel) => {
            panel.hidden = panel.dataset.inquiryPanel !== "activity";
        });
    };

    // 선택한 탭에만 활성 클래스와 aria-selected를 반영한다.
    const setActiveTabVisual = (tabName) => {
        tabButtons.forEach((tab) => {
            const isActive = tab.dataset.inquiryTab === tabName;
            tab.classList.toggle("inquiry-tab--active", isActive);
            tab.setAttribute("aria-selected", String(isActive));
        });
    };

    // 실제 패널 이동 없이 탭 버튼에만 짧은 눌림 프리뷰 애니메이션을 준다.
    const togglePreviewState = (tab) => {
        tab.classList.remove("inquiry-tab--preview");
        void tab.offsetWidth;
        tab.classList.add("inquiry-tab--preview");
        window.setTimeout(() => {
            tab.classList.remove("inquiry-tab--preview");
        }, PREVIEW_DURATION_MS);
    };

    // ===== 열린 UI 닫기 헬퍼 =====
    // 필터 드롭다운을 닫고 트리거의 aria 상태를 원복한다.
    const closeFilterMenu = () => {
        if (!filterTrigger || !filterMenu) {
            return;
        }

        filterMenu.hidden = true;
        filterTrigger.setAttribute("aria-expanded", "false");
    };

    // (기존 정적 메뉴 닫기 — 하위 호환)
    const closePostMoreMenu = () => {
        if (!activePostMoreMenu) return;
        activePostMoreMenu.hidden = true;
        activePostMoreButton?.setAttribute("aria-expanded", "false");
        activePostMoreMenu = null;
        activePostMoreButton = null;
    };

    // 더보기 동적 드롭다운(#layers)을 닫는다 (Notification과 동일)
    const closeMoreDropdown = () => {
        if (!activeMoreDropdown) return;
        activeMoreDropdown.remove();
        activeMoreDropdown = null;
        if (activeMoreButton) {
            activeMoreButton.setAttribute("aria-expanded", "false");
            activeMoreButton = null;
        }
    };

    // 차단/신고 모달을 닫는다
    const closeNotificationModal = () => {
        if (!activeNotificationModal) return;
        activeNotificationModal.remove();
        activeNotificationModal = null;
        document.body.classList.remove("modal-open");
    };

    // 토스트를 body 하단에 표시한다 (Notification과 동일)
    const showNotificationToast = (message) => {
        activeNotificationToast?.remove();
        const toast = document.createElement("div");
        toast.className = "notification-toast";
        toast.setAttribute("role", "status");
        toast.setAttribute("aria-live", "polite");
        toast.textContent = message;
        document.body.appendChild(toast);
        activeNotificationToast = toast;
        window.setTimeout(() => {
            if (activeNotificationToast === toast) activeNotificationToast = null;
            toast.remove();
        }, 3000);
    };

    // 더보기 드롭다운 메뉴 항목(팔로우/차단/신고)을 생성한다 (Notification과 동일)
    const getMoreDropdownItems = (button) => {
        const postCard = getPostCard(button);
        const handle = getTextContent(postCard?.querySelector(".postHandle")) || "@user";
        const isF = followState.get(handle) ?? false;
        return [
            {
                actionClass: "menu-item--follow-toggle",
                label: isF ? `${handle} 님 언팔로우하기` : `${handle} 님 팔로우하기`,
                icon: isF
                    ? '<svg viewBox="0 0 24 24" aria-hidden="true"><g><path d="M10 4c-1.105 0-2 .9-2 2s.895 2 2 2 2-.9 2-2-.895-2-2-2zM6 6c0-2.21 1.791-4 4-4s4 1.79 4 4-1.791 4-4 4-4-1.79-4-4zm12.586 3l-2.043-2.04 1.414-1.42L20 7.59l2.043-2.05 1.414 1.42L21.414 9l2.043 2.04-1.414 1.42L20 10.41l-2.043 2.05-1.414-1.42L18.586 9zM3.651 19h12.698c-.337-1.8-1.023-3.21-1.945-4.19C13.318 13.65 11.838 13 10 13s-3.317.65-4.404 1.81c-.922.98-1.608 2.39-1.945 4.19zm.486-5.56C5.627 11.85 7.648 11 10 11s4.373.85 5.863 2.44c1.477 1.58 2.366 3.8 2.632 6.46l.11 1.1H1.395l.11-1.1c.266-2.66 1.155-4.88 2.632-6.46z"></path></g></svg>'
                    : '<svg viewBox="0 0 24 24" aria-hidden="true"><g><path d="M10 4c-1.105 0-2 .9-2 2s.895 2 2 2 2-.9 2-2-.895-2-2-2zM6 6c0-2.21 1.791-4 4-4s4 1.79 4 4-1.791 4-4 4-4-1.79-4-4zm4 7c-3.053 0-5.563 1.193-7.443 3.596l1.548 1.207C5.573 15.922 7.541 15 10 15s4.427.922 5.895 2.803l1.548-1.207C15.563 14.193 13.053 13 10 13zm8-6V5h-3V3h-2v2h-3v2h3v3h2V7h3z"></path></g></svg>',
            },
            {
                actionClass: "menu-item--block",
                label: `${handle} 님 차단하기`,
                icon: '<svg viewBox="0 0 24 24" aria-hidden="true"><g><path d="M12 3.75c-4.55 0-8.25 3.69-8.25 8.25 0 1.92.66 3.68 1.75 5.08L17.09 5.5C15.68 4.4 13.92 3.75 12 3.75zm6.5 3.17L6.92 18.5c1.4 1.1 3.16 1.75 5.08 1.75 4.56 0 8.25-3.69 8.25-8.25 0-1.92-.65-3.68-1.75-5.08zM1.75 12C1.75 6.34 6.34 1.75 12 1.75S22.25 6.34 22.25 12 17.66 22.25 12 22.25 1.75 17.66 1.75 12z"></path></g></svg>',
            },
            {
                actionClass: "menu-item--report",
                label: "게시물 신고하기",
                icon: '<svg viewBox="0 0 24 24" aria-hidden="true"><g><path d="M3 2h18.61l-3.5 7 3.5 7H5v6H3V2zm2 12h13.38l-2.5-5 2.5-5H5v10z"></path></g></svg>',
            },
        ];
    };

    // 차단 확인 모달을 열기 (Notification과 동일)
    const openBlockModal = (button) => {
        const postCard = getPostCard(button);
        const handle = getTextContent(postCard?.querySelector(".postHandle")) || "@user";
        closeMoreDropdown();
        closeNotificationModal();
        const modal = document.createElement("div");
        modal.className = "notification-dialog notification-dialog--block";
        modal.innerHTML = `<div class="notification-dialog__backdrop"></div><div class="notification-dialog__card notification-dialog__card--small" role="alertdialog" aria-modal="true"><h2 class="notification-dialog__title">${escapeHtml(handle)} 님을 차단할까요?</h2><p class="notification-dialog__description">내 공개 게시물을 볼 수 있지만 더 이상 게시물에 참여할 수 없습니다. 또한 ${escapeHtml(handle)} 님은 나를 팔로우하거나 쪽지를 보낼 수 없으며, 이 계정과 관련된 알림도 내게 표시되지 않습니다.</p><div class="notification-dialog__actions"><button type="button" class="notification-dialog__danger notification-dialog__confirm-block">차단</button><button type="button" class="notification-dialog__secondary notification-dialog__close">취소</button></div></div>`;
        modal.addEventListener("click", (e) => {
            if (e.target.classList.contains("notification-dialog__backdrop") || e.target.closest(".notification-dialog__close")) {
                e.preventDefault(); closeNotificationModal(); return;
            }
            if (e.target.closest(".notification-dialog__confirm-block")) {
                e.preventDefault(); showNotificationToast(`${handle} 님을 차단했습니다`); closeNotificationModal();
            }
        });
        document.body.appendChild(modal); document.body.classList.add("modal-open"); activeNotificationModal = modal;
    };

    // 신고 모달을 열기 (Notification과 동일 — 신고 사유 목록 포함)
    const openReportModal = (button) => {
        closeMoreDropdown();
        closeNotificationModal();
        const modal = document.createElement("div");
        modal.className = "notification-dialog notification-dialog--report";
        modal.innerHTML = `<div class="notification-dialog__backdrop"></div><div class="notification-dialog__card notification-dialog__card--report" role="dialog" aria-modal="true"><div class="notification-dialog__header"><button type="button" class="notification-dialog__icon-btn notification-dialog__close" aria-label="돌아가기"><svg viewBox="0 0 24 24" aria-hidden="true"><g><path d="M7.414 13l5.043 5.04-1.414 1.42L3.586 12l7.457-7.46 1.414 1.42L7.414 11H21v2H7.414z"></path></g></svg></button><h2 class="notification-dialog__title">신고하기</h2></div><div class="notification-dialog__body"><p class="notification-dialog__question">이 게시물에 어떤 문제가 있나요?</p><ul class="notification-report__list">${reportReasons.map((r) => `<li><button type="button" class="notification-report__item"><span>${escapeHtml(r)}</span><svg viewBox="0 0 24 24" aria-hidden="true"><g><path d="M9.293 6.293 10.707 4.88 17.828 12l-7.121 7.12-1.414-1.413L14.999 12z"></path></g></svg></button></li>`).join("")}</ul></div></div>`;
        modal.addEventListener("click", (e) => {
            if (e.target.classList.contains("notification-dialog__backdrop") || e.target.closest(".notification-dialog__close")) {
                e.preventDefault(); closeNotificationModal(); return;
            }
            if (e.target.closest(".notification-report__item")) {
                e.preventDefault(); showNotificationToast("신고가 접수되었습니다"); closeNotificationModal();
            }
        });
        document.body.appendChild(modal); document.body.classList.add("modal-open"); activeNotificationModal = modal;
    };

    // 더보기 드롭다운 항목 클릭 시 해당 액션을 처리한다 (Notification과 동일)
    const handleMoreDropdownAction = (button, actionClass) => {
        const postCard = getPostCard(button);
        const handle = getTextContent(postCard?.querySelector(".postHandle")) || "@user";
        if (actionClass === "menu-item--follow-toggle") {
            const isF = followState.get(handle) ?? false;
            followState.set(handle, !isF);
            closeMoreDropdown();
            showNotificationToast(isF ? `${handle} 님 팔로우를 취소했습니다` : `${handle} 님을 팔로우했습니다`);
            return;
        }
        if (actionClass === "menu-item--block") { openBlockModal(button); return; }
        if (actionClass === "menu-item--report") openReportModal(button);
    };

    // 더보기 드롭다운을 #layers에 동적으로 생성한다 (Notification과 동일)
    const openMoreDropdown = (button) => {
        if (!layersRoot) return;
        closeShareDropdown();
        closeMoreDropdown();
        const rect = button.getBoundingClientRect();
        const top = rect.bottom + window.scrollY + 8;
        const items = getMoreDropdownItems(button);
        const menuWidth = 280;
        let left = rect.right + window.scrollX - menuWidth;
        if (left < 16) left = 16;
        if (left + menuWidth > window.innerWidth - 16) left = window.innerWidth - 16 - menuWidth;
        const lc = document.createElement("div");
        lc.className = "layers-dropdown-container";
        lc.innerHTML = `<div class="layers-overlay"></div><div class="layers-dropdown-inner"><div role="menu" class="dropdown-menu" style="top: ${top}px; left: ${left}px;"><div><div class="dropdown-inner">${items.map((it) => `<button type="button" role="menuitem" class="menu-item ${it.actionClass}"><span class="menu-item__icon">${it.icon}</span><span class="menu-item__label">${it.label}</span></button>`).join("")}</div></div></div></div>`;
        lc.addEventListener("click", (e) => {
            const item = e.target.closest(".menu-item");
            if (item) {
                e.preventDefault(); e.stopPropagation();
                if (activeMoreButton) {
                    const ac = Array.from(item.classList).find((c) => c.startsWith("menu-item--")) ?? "";
                    handleMoreDropdownAction(activeMoreButton, ac);
                }
                return;
            }
            e.stopPropagation();
        });
        layersRoot.appendChild(lc);
        activeMoreDropdown = lc;
        activeMoreButton = button;
        activeMoreButton.setAttribute("aria-expanded", "true");
    };

    // 공유 드롭다운은 #layers에 동적으로 추가되므로 DOM에서 제거한다.
    const closeShareDropdown = () => {
        if (!activeShareDropdown) {
            return;
        }

        activeShareDropdown.remove();
        activeShareDropdown = null;
        activeShareButton?.setAttribute("aria-expanded", "false");
        activeShareButton = null;
    };

    // 공유 바텀시트는 body에 동적으로 추가되므로 DOM에서 제거한다.
    const closeShareModal = () => {
        if (!activeShareModal) {
            return;
        }

        activeShareModal.remove();
        activeShareModal = null;
        document.body.classList.remove("modal-open");
    };

    // 답글 모달을 닫을 수 있는지 확인한다 (작성 중이면 확인 대화상자 표시)
    const canCloseReplyModal = () => {
        const hasAttachment = attachedReplyFiles.length > 0;
        if (!replyEditor) return !hasAttachment || window.confirm("게시물을 삭제하시겠어요?");
        const hasDraft = replyEditor.textContent.replace(/\u00a0/g, " ").trim().length > 0;
        return (!hasDraft && !hasAttachment) || window.confirm("게시물을 삭제하시겠어요?");
    };

    // 답글 모달은 HTML에 이미 있으므로 hidden 처리와 입력 초기화만 수행한다.
    const closeReplyModal = (options = {}) => {
        const { skipConfirm = false, restoreFocus = true } = options;
        if (!replyModalOverlay || replyModalOverlay.hidden) {
            return;
        }
        if (!skipConfirm && !canCloseReplyModal()) return;

        shouldRestoreReplyEditorAfterEmojiInsert = false;
        replyModalOverlay.hidden = true;
        document.body.classList.remove("modal-open");
        closeEmojiPicker();

        if (replyEditor) {
            replyEditor.textContent = "";
        }

        savedReplySelection = null;
        savedReplySelectionOffsets = null;
        pendingReplyFormats = new Set();
        resetReplyAttachment();
        selectedProduct = null;
        if (replyProductButton) replyProductButton.disabled = false;
        const existingProductCard2 = replyModalOverlay?.querySelector("[data-selected-product]");
        if (existingProductCard2) existingProductCard2.remove();
        if (replyProductView) replyProductView.hidden = true;
        if (replyLocationView) replyLocationView.hidden = true;
        selectedLocation = null;
        pendingLocation = null;
        syncLocationUI();
        if (composeView) composeView.hidden = false;
        syncReplySubmitState();
        syncReplyFormatButtons();

        if (restoreFocus) activeReplyTrigger?.focus();
        activeReplyTrigger = null;
    };

    // ===== 버튼 상태 / 카운트 / 토스트 =====
    // 북마크 버튼의 아이콘 경로와 라벨을 현재 상태에 맞게 바꾼다.
    const setBookmarkButtonState = (button, isActive) => {
        const path = button?.querySelector("path");
        if (!button || !path) {
            return;
        }

        button.classList.toggle("active", isActive);
        button.setAttribute(
            "data-testid",
            isActive ? "removeBookmark" : "bookmark",
        );
        button.setAttribute(
            "aria-label",
            isActive ? "북마크에 추가됨" : "북마크",
        );
        path.setAttribute(
            "d",
            isActive
                ? path.dataset.pathActive || path.getAttribute("d")
                : path.dataset.pathInactive || path.getAttribute("d"),
        );
    };

    // 액션 버튼 숫자를 증감시켜 화면에 바로 반영한다.
    const updateCount = (button, delta) => {
        const countElement = button?.querySelector(".tweet-action-count");
        if (!countElement) {
            return 0;
        }

        const currentCount =
            Number.parseInt(getTextContent(countElement) || "0", 10) || 0;
        const nextCount = Math.max(0, currentCount + delta);
        countElement.textContent = String(nextCount);
        return nextCount;
    };

    // 토스트는 HTML에 미리 없고, body 끝에 잠깐 추가했다가 제거한다.
    const showShareToast = (message) => {
        document.querySelector(".share-toast")?.remove();
        const toast = document.createElement("div");
        toast.className = "share-toast";
        toast.setAttribute("role", "status");
        toast.setAttribute("aria-live", "polite");
        toast.textContent = message;
        document.body.appendChild(toast);
        window.setTimeout(() => {
            toast.remove();
        }, 3000);
    };

    // 공유 대상 사용자 목록은 하단 추천 카드(.user-card)에서 읽어와 재사용한다.
    const getShareUsers = () =>
        Array.from(document.querySelectorAll(".user-card")).map((card) => ({
            id:
                card.dataset.handle ||
                getTextContent(card.querySelector(".user-handle")),
            name: getTextContent(card.querySelector(".user-name")),
            handle:
                card.dataset.handle ||
                getTextContent(card.querySelector(".user-handle")),
            avatar: buildAvatarDataUrl(
                getTextContent(card.querySelector(".user-avatar")) ||
                    getTextContent(card.querySelector(".user-name")),
            ),
        }));

    // 공유 관련 액션에서 공통으로 쓰는 게시물 메타데이터를 묶어 반환한다.
    const getSharePostMeta = (button) => {
        const postCard = getPostCard(button);
        const bookmarkButton =
            postCard?.querySelector(".tweet-action-btn--bookmark") ?? null;
        const postId = postCard?.dataset.postId || "";
        const url = new URL(window.location.href);
        url.hash = postId ? `post-${postId}` : "";
        return { bookmarkButton, permalink: url.toString() };
    };

    // 링크 복사는 드롭다운을 닫은 뒤 현재 게시물의 해시 URL을 클립보드에 기록한다.
    const copyShareLink = (button) => {
        const { permalink } = getSharePostMeta(button);
        closeShareDropdown();

        if (!navigator.clipboard?.writeText) {
            showShareToast("링크를 복사하지 못했습니다");
            return;
        }

        navigator.clipboard
            .writeText(permalink)
            .then(() => {
                showShareToast("클립보드로 복사함");
            })
            .catch(() => {
                showShareToast("링크를 복사하지 못했습니다");
            });
    };

    // ===== 공유 UI 동적 생성 =====
    // 공유용 채팅 바텀시트는 HTML에 정적 마크업이 없어서 body에 새로 만들어 붙인다.
    const openShareChatModal = () => {
        const users = getShareUsers();
        closeShareDropdown();
        closeShareModal();

        const modal = document.createElement("div");
        modal.className = "share-sheet";
        modal.innerHTML = `<div class="share-sheet__backdrop" data-share-close="true"></div><div class="share-sheet__card" role="dialog" aria-modal="true" aria-labelledby="share-chat-title"><div class="share-sheet__header"><button type="button" class="share-sheet__icon-btn" data-share-close="true" aria-label="돌아가기"><svg viewBox="0 0 24 24" aria-hidden="true"><g><path d="M7.414 13l5.043 5.04-1.414 1.42L3.586 12l7.457-7.46 1.414 1.42L7.414 11H21v2H7.414z"></path></g></svg></button><h2 id="share-chat-title" class="share-sheet__title">공유하기</h2><span class="share-sheet__header-spacer"></span></div><div class="share-sheet__search"><input type="text" class="share-sheet__search-input" placeholder="검색" aria-label="검색" /></div><div class="share-sheet__list">${users.length === 0 ? '<div class="share-sheet__empty"><p>전송할 수 있는 사용자가 없습니다.</p></div>' : users.map((user) => `<button type="button" class="share-sheet__user" data-share-user-name="${escapeHtml(user.name)}"><span class="share-sheet__user-avatar"><img src="${escapeHtml(user.avatar)}" alt="${escapeHtml(user.name)}" /></span><span class="share-sheet__user-body"><span class="share-sheet__user-name">${escapeHtml(user.name)}</span><span class="share-sheet__user-handle">${escapeHtml(user.handle)}</span></span></button>`).join("")}</div></div>`;
        modal.addEventListener("click", (event) => {
            const userButton = event.target.closest(".share-sheet__user");
            if (
                event.target.closest("[data-share-close='true']") ||
                event.target.classList.contains("share-sheet__backdrop")
            ) {
                event.preventDefault();
                closeShareModal();
                return;
            }

            if (userButton) {
                event.preventDefault();
                showShareToast(
                    `${userButton.getAttribute("data-share-user-name") || "사용자"}에게 전송함`,
                );
                closeShareModal();
            }
        });
        // HTML의 특정 슬롯이 아니라 body 끝에 직접 붙여 전체 화면 바텀시트로 사용한다.
        document.body.appendChild(modal);
        document.body.classList.add("modal-open");
        activeShareModal = modal;
    };

    // 북마크 폴더 바텀시트도 body에 동적으로 추가되는 UI다.
    const openShareBookmarkModal = (button) => {
        const { bookmarkButton } = getSharePostMeta(button);
        const isBookmarked =
            bookmarkButton?.classList.contains("active") ?? false;
        closeShareDropdown();
        closeShareModal();

        const modal = document.createElement("div");
        modal.className = "share-sheet";
        modal.innerHTML = `<div class="share-sheet__backdrop" data-share-close="true"></div><div class="share-sheet__card share-sheet__card--bookmark" role="dialog" aria-modal="true" aria-labelledby="share-bookmark-title"><div class="share-sheet__header"><button type="button" class="share-sheet__icon-btn" data-share-close="true" aria-label="닫기"><svg viewBox="0 0 24 24" aria-hidden="true"><g><path d="M10.59 12 4.54 5.96l1.42-1.42L12 10.59l6.04-6.05 1.42 1.42L13.41 12l6.05 6.04-1.42 1.42L12 13.41l-6.04 6.05-1.42-1.42L10.59 12z"></path></g></svg></button><h2 id="share-bookmark-title" class="share-sheet__title">폴더에 추가</h2><span class="share-sheet__header-spacer"></span></div><button type="button" class="share-sheet__create-folder">새 북마크 폴더 만들기</button><button type="button" class="share-sheet__folder" data-share-folder="all-bookmarks"><span class="share-sheet__folder-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><g><path d="M2.998 8.5c0-1.38 1.119-2.5 2.5-2.5h9c1.381 0 2.5 1.12 2.5 2.5v14.12l-7-3.5-7 3.5V8.5zM18.5 2H8.998v2H18.5c.275 0 .5.224.5.5V15l2 1.4V4.5c0-1.38-1.119-2.5-2.5-2.5z"></path></g></svg></span><span class="share-sheet__folder-name">모든 북마크</span><span class="share-sheet__folder-check${isBookmarked ? " share-sheet__folder-check--active" : ""}"><svg viewBox="0 0 24 24" aria-hidden="true"><g><path d="M9.64 18.952l-5.55-4.861 1.317-1.504 3.951 3.459 8.459-10.948L19.4 6.32 9.64 18.952z"></path></g></svg></span></button></div>`;
        modal.addEventListener("click", (event) => {
            if (
                event.target.closest("[data-share-close='true']") ||
                event.target.classList.contains("share-sheet__backdrop")
            ) {
                event.preventDefault();
                closeShareModal();
                return;
            }

            if (event.target.closest(".share-sheet__create-folder")) {
                event.preventDefault();
                showShareToast("새 폴더 만들기는 준비 중입니다");
                closeShareModal();
                return;
            }

            if (event.target.closest("[data-share-folder='all-bookmarks']")) {
                event.preventDefault();
                setBookmarkButtonState(bookmarkButton, !isBookmarked);
                closeShareModal();
            }
        });
        // HTML에 미리 선언된 모달이 없으므로 body에 직접 append 한다.
        document.body.appendChild(modal);
        document.body.classList.add("modal-open");
        activeShareModal = modal;
    };

    // 공유 드롭다운은 게시물 버튼 위치를 기준으로 계산해서 #layers 안에 띄운다.
    const openShareDropdown = (button) => {
        if (!layersRoot) {
            return;
        }

        closeShareDropdown();

        const rect = button.getBoundingClientRect();
        const top = rect.bottom + window.scrollY + 8;
        // 드롭다운을 버튼 오른쪽 끝에 맞추되 화면 밖으로 넘어가지 않도록 보정한다.
        const menuWidth = 260;
        let left = rect.right + window.scrollX - menuWidth;
        if (left < 16) left = 16;
        if (left + menuWidth > window.innerWidth - 16) left = window.innerWidth - 16 - menuWidth;
        const dropdown = document.createElement("div");
        dropdown.className = "layers-dropdown-container";
        dropdown.innerHTML = `<div class="layers-overlay"></div><div class="layers-dropdown-inner"><div role="menu" class="dropdown-menu" style="top: ${top}px; left: ${left}px;"><div><div class="dropdown-inner"><button type="button" role="menuitem" class="menu-item share-menu-item share-menu-item--copy"><span class="menu-item__icon share-menu-item__icon"><svg viewBox="0 0 24 24" aria-hidden="true"><g><path d="M18.36 5.64c-1.95-1.96-5.11-1.96-7.07 0L9.88 7.05 8.46 5.64l1.42-1.42c2.73-2.73 7.16-2.73 9.9 0 2.73 2.74 2.73 7.17 0 9.9l-1.42 1.42-1.41-1.42 1.41-1.41c1.96-1.96 1.96-5.12 0-7.07zm-2.12 3.53l-7.07 7.07-1.41-1.41 7.07-7.07 1.41 1.41zm-12.02.71l1.42-1.42 1.41 1.42-1.41 1.41c-1.96 1.96-1.96 5.12 0 7.07 1.95 1.96 5.11 1.96 7.07 0l1.41-1.41 1.42 1.41-1.42 1.42c-2.73 2.73-7.16 2.73-9.9 0-2.73-2.74-2.73-7.17 0-9.9z"></path></g></svg></span><span class="menu-item__label">링크 복사하기</span></button><button type="button" role="menuitem" class="menu-item share-menu-item share-menu-item--chat"><span class="menu-item__icon share-menu-item__icon"><svg viewBox="0 0 24 24" aria-hidden="true"><g><path d="M1.998 5.5c0-1.381 1.119-2.5 2.5-2.5h15c1.381 0 2.5 1.119 2.5 2.5v13c0 1.381-1.119 2.5-2.5 2.5h-15c-1.381 0-2.5-1.119-2.5-2.5v-13zm2.5-.5c-.276 0-.5.224-.5.5v2.764l8 3.638 8-3.636V5.5c0-.276-.224-.5-.5-.5h-15zm15.5 5.463l-8 3.636-8-3.638V18.5c0 .276.224.5.5.5h15c.276 0 .5-.224.5-.5v-8.037z"></path></g></svg></span><span class="menu-item__label">Chat으로 전송하기</span></button><button type="button" role="menuitem" class="menu-item share-menu-item share-menu-item--bookmark"><span class="menu-item__icon share-menu-item__icon"><svg viewBox="0 0 24 24" aria-hidden="true"><g><path d="M18 3V0h2v3h3v2h-3v3h-2V5h-3V3zm-7.5 1a.5.5 0 00-.5.5V7h3.5A2.5 2.5 0 0116 9.5v3.48l3 2.1V11h2v7.92l-5-3.5v7.26l-6.5-3.54L3 22.68V9.5A2.5 2.5 0 015.5 7H8V4.5A2.5 2.5 0 0110.5 2H12v2zm-5 5a.5.5 0 00-.5.5v9.82l4.5-2.46 4.5 2.46V9.5a.5.5 0 00-.5-.5z"></path></g></svg></span><span class="menu-item__label">폴더에 북마크 추가하기</span></button></div></div></div></div>`;
        dropdown.addEventListener("click", (event) => {
            const actionButton = event.target.closest(".share-menu-item");
            if (!actionButton || !activeShareButton) {
                return;
            }

            event.preventDefault();
            event.stopPropagation();

            if (actionButton.classList.contains("share-menu-item--copy")) {
                copyShareLink(activeShareButton);
                return;
            }

            if (actionButton.classList.contains("share-menu-item--chat")) {
                openShareChatModal(activeShareButton);
                return;
            }

            if (actionButton.classList.contains("share-menu-item--bookmark")) {
                openShareBookmarkModal(activeShareButton);
            }
        });
        // inquiry_active_list.html의 #layers가 이 드롭다운의 실제 마운트 지점이다.
        layersRoot.appendChild(dropdown);
        activeShareDropdown = dropdown;
        activeShareButton = button;
        activeShareButton.setAttribute("aria-expanded", "true");
    };

    // ===== 초기 이벤트 바인딩 =====
    // 탭 클릭은 시각적 활성화와 짧은 프리뷰만 처리하고, 실제 콘텐츠는 activity 패널에 유지한다.
    const initializeTabs = () => {
        ensureActivityPanelVisible();
        tabButtons.forEach((tab) => {
            tab.addEventListener("click", () => {
                setActiveTabVisual(tab.dataset.inquiryTab);
                togglePreviewState(tab);
                ensureActivityPanelVisible();
            });
        });
    };

    // 빠른 기간 칩은 단일 선택 상태만 유지한다.
    const initializePeriodChips = () => {
        periodChips.forEach((chip) => {
            chip.addEventListener("click", () => {
                periodChips.forEach((item) => {
                    item.classList.toggle("period-chip--active", item === chip);
                });
            });
        });
    };

    // 필터 버튼/메뉴의 열림 상태와 선택 라벨을 동기화한다.
    const initializeFilterDropdown = () => {
        if (!filterTrigger || !filterMenu || !filterLabel) {
            return;
        }

        filterTrigger.addEventListener("click", (event) => {
            event.preventDefault();
            const willOpen = filterMenu.hidden;
            filterMenu.hidden = !willOpen;
            filterTrigger.setAttribute("aria-expanded", String(willOpen));
        });

        filterItems.forEach((item) => {
            item.addEventListener("click", () => {
                const label = item.querySelector(
                    ".activity-filter-menu__label",
                );
                filterItems.forEach((entry) => {
                    const isSelected = entry === item;
                    entry.classList.toggle(
                        "activity-filter-menu__item--selected",
                        isSelected,
                    );
                    entry.setAttribute("aria-checked", String(isSelected));
                });
                filterLabel.textContent = getTextContent(label);
                closeFilterMenu();
            });
        });
    };

    // 긴 게시물 본문은 140자 기준으로 접고, 더보기/접기 토글을 동적으로 넣는다.
    const initializePostTextToggles = () => {
        document.querySelectorAll(".postText").forEach((textElement) => {
            const originalText = getTextContent(textElement);
            if (!originalText) {
                return;
            }

            textElement.dataset.fullText = originalText;

            if (originalText.length <= MAX_POST_TEXT_LENGTH) {
                textElement.innerHTML = `<span class="postTextContent">${escapeHtml(originalText)}</span>`;
                return;
            }

            const collapsedText = `${originalText.slice(0, MAX_POST_TEXT_LENGTH).trimEnd()}...`;
            textElement.dataset.collapsedText = collapsedText;
            textElement.dataset.expanded = "false";
            textElement.innerHTML = `<span class="postTextContent">${escapeHtml(collapsedText)}</span><button type="button" class="postTextToggle">더보기</button>`;
        });

        document.querySelectorAll(".postTextToggle").forEach((button) => {
            button.addEventListener("click", () => {
                const textElement = button.closest(".postText");
                if (!textElement) {
                    return;
                }

                const content = textElement.querySelector(".postTextContent");
                const isExpanded = textElement.dataset.expanded === "true";
                textElement.dataset.expanded = String(!isExpanded);
                content.textContent = isExpanded
                    ? textElement.dataset.collapsedText ||
                      textElement.dataset.fullText ||
                      ""
                    : textElement.dataset.fullText || "";
                button.textContent = isExpanded ? "더보기" : "접기";
            });
        });
    };

    // 카드 헤더의 점 세 개 버튼은 동적 드롭다운(#layers)을 열거나 닫는다 (Notification과 동일).
    const initializePostMoreMenus = () => {
        document.querySelectorAll(".postMoreButton").forEach((button) => {
            button.addEventListener("click", (event) => {
                event.preventDefault();
                event.stopPropagation();
                // 같은 버튼을 다시 누르면 닫기
                if (activeMoreButton === button) {
                    closeMoreDropdown();
                    return;
                }
                openMoreDropdown(button);
            });
        });
    };

    // 좋아요는 아이콘 path, 활성 클래스, 숫자, aria-label을 함께 갱신한다.
    const initializeLikeButtons = () => {
        document
            .querySelectorAll(".tweet-action-btn--like")
            .forEach((button) => {
                button.addEventListener("click", (event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    const isActive = button.classList.toggle("active");
                    const path = button.querySelector("path");
                    const nextCount = updateCount(button, isActive ? 1 : -1);

                    if (path) {
                        path.setAttribute(
                            "d",
                            isActive
                                ? path.dataset.pathActive ||
                                      path.getAttribute("d")
                                : path.dataset.pathInactive ||
                                      path.getAttribute("d"),
                        );
                    }

                    button.setAttribute(
                        "aria-label",
                        `마음에 들어요 ${nextCount}`,
                    );
                });
            });
    };

    // 북마크는 공통 상태 반영 함수만 호출한다.
    const initializeBookmarkButtons = () => {
        document
            .querySelectorAll(".tweet-action-btn--bookmark")
            .forEach((button) => {
                button.addEventListener("click", (event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    setBookmarkButtonState(
                        button,
                        !button.classList.contains("active"),
                    );
                });
            });
    };

    // 공유 버튼은 같은 버튼을 다시 누르면 닫고, 아니면 #layers 드롭다운을 연다.
    const initializeShareButtons = () => {
        document
            .querySelectorAll(".tweet-action-btn--share")
            .forEach((button) => {
                button.addEventListener("click", (event) => {
                    event.preventDefault();
                    event.stopPropagation();

                    if (activeShareButton === button) {
                        closeShareDropdown();
                        return;
                    }

                    openShareDropdown(button);
                });
            });
    };

    // ===== 이모지 데이터 및 유틸 =====
    const emojiRecentsKey = "inquiry_reply_recent_emojis";
    const maxRecentEmojis = 18;
    const emojiCategoryMeta = {
        recent: { label: "최근", sectionTitle: "최근", icon: '<svg viewBox="0 0 24 24" aria-hidden="true" class="tweet-modal__emoji-tab-icon"><g><path d="M12 1.75A10.25 10.25 0 112.75 12 10.26 10.26 0 0112 1.75zm0 1.5A8.75 8.75 0 1020.75 12 8.76 8.76 0 0012 3.25zm.75 3.5v5.19l3.03 1.75-.75 1.3-3.78-2.18V6.75h1.5z"></path></g></svg>' },
        smileys: { label: "스마일리 및 사람", sectionTitle: "스마일리 및 사람", icon: '<svg viewBox="0 0 24 24" aria-hidden="true" class="tweet-modal__emoji-tab-icon"><g><path d="M12 22.75C6.072 22.75 1.25 17.928 1.25 12S6.072 1.25 12 1.25 22.75 6.072 22.75 12 17.928 22.75 12 22.75zm0-20c-5.109 0-9.25 4.141-9.25 9.25s4.141 9.25 9.25 9.25 9.25-4.141 9.25-9.25S17.109 2.75 12 2.75zM9 11.75c-.69 0-1.25-.56-1.25-1.25S8.31 9.25 9 9.25s1.25.56 1.25 1.25S9.69 11.75 9 11.75zm6 0c-.69 0-1.25-.56-1.25-1.25S14.31 9.25 15 9.25s1.25.56 1.25 1.25S15.69 11.75 15 11.75zm-8.071 3.971c.307-.298.771-.397 1.188-.253.953.386 2.403.982 3.883.982s2.93-.596 3.883-.982c.417-.144.88-.044 1.188.253a.846.846 0 01-.149 1.34c-1.254.715-3.059 1.139-4.922 1.139s-3.668-.424-4.922-1.139a.847.847 0 01-.149-1.39z"></path></g></svg>' },
        animals: { label: "동물 및 자연", sectionTitle: "동물 및 자연", icon: '<svg viewBox="0 0 24 24" aria-hidden="true" class="tweet-modal__emoji-tab-icon"><g><path d="M12 3.5c3.77 0 6.75 2.86 6.75 6.41 0 3.17-1.88 4.94-4.15 6.28-.74.44-1.54.9-1.6 1.86-.02.38-.33.68-.71.68h-.6a.71.71 0 01-.71-.67c-.07-.95-.86-1.42-1.6-1.85C7.13 14.85 5.25 13.08 5.25 9.91 5.25 6.36 8.23 3.5 12 3.5zm-4.79-.97c.61 0 1.1.49 1.1 1.1 0 .32-.14.63-.39.84-.4.34-.78.78-1.08 1.3-.18.3-.49.48-.84.48-.61 0-1.1-.49-1.1-1.1 0-.14.03-.29.09-.42.47-1.04 1.17-1.93 2.02-2.63.19-.15.43-.24.7-.24zm9.58 0c.27 0 .51.09.7.24.85.7 1.55 1.6 2.02 2.63.06.13.09.28.09.42 0 .61-.49 1.1-1.1 1.1-.35 0-.66-.18-.84-.48-.3-.52-.68-.96-1.08-1.3a1.1 1.1 0 01-.39-.84c0-.61.49-1.1 1.1-1.1z"></path></g></svg>' },
        food: { label: "음식 및 음료", sectionTitle: "음식 및 음료", icon: '<svg viewBox="0 0 24 24" aria-hidden="true" class="tweet-modal__emoji-tab-icon"><g><path d="M17.5 2a5.5 5.5 0 00-5.5 5.5c0 .51.07 1.01.2 1.48L4 17.18V21h3.82l8.2-8.2c.47.13.97.2 1.48.2a5.5 5.5 0 000-11z"></path></g></svg>' },
        activities: { label: "활동", sectionTitle: "활동", icon: '<svg viewBox="0 0 24 24" aria-hidden="true" class="tweet-modal__emoji-tab-icon"><g><path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z"></path></g></svg>' },
        travel: { label: "여행 및 장소", sectionTitle: "여행 및 장소", icon: '<svg viewBox="0 0 24 24" aria-hidden="true" class="tweet-modal__emoji-tab-icon"><g><path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2z"></path></g></svg>' },
        objects: { label: "사물", sectionTitle: "사물", icon: '<svg viewBox="0 0 24 24" aria-hidden="true" class="tweet-modal__emoji-tab-icon"><g><path d="M12 2a7 7 0 00-7 7c0 2.38 1.19 4.47 3 5.74V17a1 1 0 001 1h6a1 1 0 001-1v-2.26c1.81-1.27 3-3.36 3-5.74a7 7 0 00-7-7zM9 21v-1h6v1a1 1 0 01-1 1h-4a1 1 0 01-1-1z"></path></g></svg>' },
        symbols: { label: "기호", sectionTitle: "기호", icon: '<svg viewBox="0 0 24 24" aria-hidden="true" class="tweet-modal__emoji-tab-icon"><g><path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z"></path></g></svg>' },
        flags: { label: "깃발", sectionTitle: "깃발", icon: '<svg viewBox="0 0 24 24" aria-hidden="true" class="tweet-modal__emoji-tab-icon"><g><path d="M3 2h18.61l-3.5 7 3.5 7H5v6H3V2zm2 12h13.38l-2.5-5 2.5-5H5v10z"></path></g></svg>' },
    };
    const emojiCategoryData = {
        smileys: ["😀","😃","😄","😁","😆","🥹","😂","🤣","😊","😉","😍","🥰","😘","😗","😙","😚","🙂","🤗","🤩","🤔","😐","😑","😌","🙃","😏","🥳","😭","😤","😴","😵","🤯","😎","🤓","🫠","😇","🤠"],
        animals: ["🐶","🐱","🐻","🐼","🐨","🐯","🦁","🐮","🐷","🐸","🐵","🐧","🐦","🦄","🐝","🦋","🌸","🌻","🍀","🌿","🌈","🌞","⭐","🌙"],
        food: ["🍔","🍟","🍕","🌭","🍗","🍜","🍣","🍩","🍪","🍫","🍿","🥐","🍎","🍓","🍉","🍇","☕","🍵","🧃","🥤","🍺","🍷"],
        activities: ["⚽","🏀","🏈","⚾","🎾","🏐","🎮","🎲","🎯","🎳","🎸","🎧","🎬","📚","🧩","🏆","🥇","🏃","🚴","🏊"],
        travel: ["🚗","🚕","🚌","🚎","🚓","🚑","✈️","🚀","🛸","🚲","⛵","🚉","🏠","🏙️","🌋","🏝️","🗼","🗽","🎡","🌁"],
        objects: ["💡","📱","💻","⌚","📷","🎥","🕹️","💰","💎","🔑","🪄","🎁","📌","🧸","🛒","🧴","💊","🧯","📢","🧠"],
        symbols: ["❤️","💙","💚","💛","💜","🖤","✨","💫","💥","💯","✔️","❌","⚠️","🔔","♻️","➕","➖","➗","✖️","🔣"],
        flags: ["🏳️","🏴","🏁","🚩","🎌","🏳️‍🌈","🇰🇷","🇺🇸","🇯🇵","🇫🇷","🇬🇧","🇩🇪","🇨🇦","🇦🇺"],
    };
    const formatButtonLabels = {
        bold: { inactive: "굵게, (CTRL+B) 님", active: "굵게, 활성 상태, (CTRL+B) 님 님" },
        italic: { inactive: "기울임꼴, (CTRL+I) 님", active: "기울임꼴, 활성 상태, (CTRL+I) 님 님" },
    };

    // ===== 이모지 유틸 함수 =====
    function getRecentEmojis() {
        try { const s = window.localStorage.getItem(emojiRecentsKey); const p = s ? JSON.parse(s) : []; return Array.isArray(p) ? p : []; } catch { return []; }
    }
    function saveRecentEmoji(emoji) {
        const recent = getRecentEmojis().filter((i) => i !== emoji);
        recent.unshift(emoji);
        try { window.localStorage.setItem(emojiRecentsKey, JSON.stringify(recent.slice(0, maxRecentEmojis))); } catch { return; }
    }
    function clearRecentEmojis() {
        try { window.localStorage.removeItem(emojiRecentsKey); } catch { return; }
    }
    function getEmojiSearchTerm() {
        return replyEmojiSearchInput?.value.trim().toLowerCase() ?? "";
    }
    function getEmojiEntriesForCategory(category) {
        if (category === "recent") return getRecentEmojis().map((emoji) => ({ emoji, keywords: [emoji] }));
        return (emojiCategoryData[category] ?? []).map((emoji) => ({ emoji, keywords: [emoji, emojiCategoryMeta[category]?.label ?? ""] }));
    }
    function getFilteredEmojiEntries(category) {
        const entries = getEmojiEntriesForCategory(category);
        const term = getEmojiSearchTerm();
        if (!term) return entries;
        return entries.filter((e) => e.keywords.some((k) => k.toLowerCase().includes(term)));
    }
    function buildEmojiSection(title, emojis, { clearable = false, emptyText = "" } = {}) {
        const headerAction = clearable ? '<button type="button" class="tweet-modal__emoji-clear" data-action="clear-recent">모두 지우기</button>' : "";
        const body = emojis.length
            ? `<div class="tweet-modal__emoji-grid">${emojis.map((e) => `<button type="button" class="tweet-modal__emoji-option" data-emoji="${e}" role="menuitem">${e}</button>`).join("")}</div>`
            : `<p class="tweet-modal__emoji-empty">${emptyText}</p>`;
        return `<section class="tweet-modal__emoji-section"><div class="tweet-modal__emoji-section-header"><h3 class="tweet-modal__emoji-section-title">${title}</h3>${headerAction}</div>${body}</section>`;
    }
    function renderEmojiTabs() {
        replyEmojiTabs.forEach((tab) => {
            const cat = tab.getAttribute("data-emoji-category");
            const meta = cat ? emojiCategoryMeta[cat] : null;
            const active = cat === activeEmojiCategory;
            tab.classList.toggle("tweet-modal__emoji-tab--active", active);
            tab.setAttribute("aria-selected", String(active));
            if (meta) tab.innerHTML = meta.icon;
        });
    }
    function renderEmojiPickerContent() {
        if (!replyEmojiContent) return;
        const searchTerm = getEmojiSearchTerm();
        if (searchTerm) {
            const sections = Object.keys(emojiCategoryData).map((cat) => {
                const entries = getFilteredEmojiEntries(cat);
                return entries.length === 0 ? "" : buildEmojiSection(emojiCategoryMeta[cat].sectionTitle, entries.map((e) => e.emoji));
            }).join("");
            replyEmojiContent.innerHTML = sections || buildEmojiSection("검색 결과", [], { emptyText: "일치하는 이모티콘이 없습니다." });
            return;
        }
        if (activeEmojiCategory === "recent") {
            const recent = getRecentEmojis();
            replyEmojiContent.innerHTML = buildEmojiSection("최근", recent, { clearable: recent.length > 0, emptyText: "최근 사용한 이모티콘이 없습니다." }) + buildEmojiSection(emojiCategoryMeta.smileys.sectionTitle, getEmojiEntriesForCategory("smileys").map((e) => e.emoji));
            return;
        }
        replyEmojiContent.innerHTML = buildEmojiSection(emojiCategoryMeta[activeEmojiCategory].sectionTitle, getEmojiEntriesForCategory(activeEmojiCategory).map((e) => e.emoji));
    }
    function renderEmojiPicker() {
        renderEmojiTabs();
        renderEmojiPickerContent();
    }

    // ===== 답글 에디터 헬퍼 함수 =====
    function hasReplyEditorText() {
        return replyEditor ? replyEditor.textContent.replace(/\u00a0/g, " ").trim().length > 0 : false;
    }
    function hasReplyAttachment() {
        return attachedReplyFiles.length > 0;
    }
    function togglePendingReplyFormat(fmt) {
        pendingReplyFormats.has(fmt) ? pendingReplyFormats.delete(fmt) : pendingReplyFormats.add(fmt);
    }
    function applyPendingReplyFormatsToContent() {
        if (!replyEditor || pendingReplyFormats.size === 0 || !hasReplyEditorText()) return;
        let span;
        if (replyEditor.childNodes.length === 1 && replyEditor.firstElementChild?.tagName === "SPAN") {
            span = replyEditor.firstElementChild;
        } else {
            span = document.createElement("span");
            while (replyEditor.firstChild) span.appendChild(replyEditor.firstChild);
            replyEditor.appendChild(span);
        }
        span.style.fontWeight = pendingReplyFormats.has("bold") ? "bold" : "";
        span.style.fontStyle = pendingReplyFormats.has("italic") ? "italic" : "";
        const range = document.createRange();
        range.selectNodeContents(span);
        range.collapse(false);
        const sel = window.getSelection();
        sel?.removeAllRanges();
        sel?.addRange(range);
        saveReplySelection();
    }
    function saveReplySelection() {
        if (!replyEditor || isInsertingReplyEmoji) return;
        const sel = window.getSelection();
        if (!sel || sel.rangeCount === 0) return;
        const range = sel.getRangeAt(0);
        if (!replyEditor.contains(range.commonAncestorContainer)) return;
        savedReplySelection = range.cloneRange();
        savedReplySelectionOffsets = getReplySelectionOffsets(range);
    }
    function getReplySelectionOffsets(range) {
        if (!replyEditor) return null;
        const pre = range.cloneRange();
        pre.selectNodeContents(replyEditor);
        pre.setEnd(range.startContainer, range.startOffset);
        const start = pre.toString().length;
        return { start, end: start + range.toString().length };
    }
    function resolveReplySelectionPosition(targetOffset) {
        if (!replyEditor) return null;
        const walker = document.createTreeWalker(replyEditor, NodeFilter.SHOW_TEXT);
        let node = walker.nextNode();
        let remaining = Math.max(0, targetOffset);
        let lastTextNode = null;
        while (node) {
            lastTextNode = node;
            const length = node.textContent?.length ?? 0;
            if (remaining <= length) return { node, offset: remaining };
            remaining -= length;
            node = walker.nextNode();
        }
        if (lastTextNode) return { node: lastTextNode, offset: lastTextNode.textContent?.length ?? 0 };
        return { node: replyEditor, offset: replyEditor.childNodes.length };
    }
    function buildReplySelectionRangeFromOffsets(offsets) {
        if (!replyEditor || !offsets) return null;
        const startPos = resolveReplySelectionPosition(offsets.start);
        const endPos = resolveReplySelectionPosition(offsets.end);
        if (!startPos || !endPos) return null;
        const range = document.createRange();
        range.setStart(startPos.node, startPos.offset);
        range.setEnd(endPos.node, endPos.offset);
        return range;
    }
    function restoreReplySelection() {
        if (!replyEditor) return false;
        const sel = window.getSelection();
        if (!sel) return false;
        const range = buildReplySelectionRangeFromOffsets(savedReplySelectionOffsets) ?? savedReplySelection;
        if (!range) return false;
        sel.removeAllRanges();
        sel.addRange(range);
        return true;
    }
    function isSelectionInsideEditor() {
        if (!replyEditor) return false;
        const sel = window.getSelection();
        if (!sel || sel.rangeCount === 0) return false;
        return replyEditor.contains(sel.getRangeAt(0).commonAncestorContainer);
    }
    function syncReplyFormatButtons() {
        if (!replyEditor) return;
        // selection이 에디터 밖에 있으면 queryCommandState가 잘못된 결과를 반환하므로
        // 에디터 안에 있을 때만 실제 DOM 상태를 읽고, 밖이면 pending 상태만 반영한다
        const selInEditor = isSelectionInsideEditor();
        replyFormatButtons.forEach((btn) => {
            const fmt = btn.getAttribute("data-format");
            if (!fmt) return;
            let active;
            if (!hasReplyEditorText()) {
                active = pendingReplyFormats.has(fmt);
            } else if (selInEditor) {
                active = document.queryCommandState(fmt);
            } else {
                return; // 에디터 밖 — 버튼 상태를 변경하지 않음
            }
            const labels = formatButtonLabels[fmt];
            btn.classList.toggle("tweet-modal__tool-btn--active", active);
            if (labels) btn.setAttribute("aria-label", active ? labels.active : labels.inactive);
        });
    }
    function applyReplyFormat(format) {
        if (!replyEditor) return;
        replyEditor.focus();
        if (!hasReplyEditorText()) {
            togglePendingReplyFormat(format);
            syncReplyFormatButtons();
            return;
        }
        if (!restoreReplySelection()) {
            const range = document.createRange();
            range.selectNodeContents(replyEditor);
            range.collapse(false);
            const sel = window.getSelection();
            sel?.removeAllRanges();
            sel?.addRange(range);
        }
        document.execCommand(format, false);
        saveReplySelection();
        syncReplySubmitState();
        syncReplyFormatButtons();
    }

    // ===== 이모지 피커 함수 =====
    function hasEmojiButtonLibrary() {
        return typeof window.EmojiButton === "function";
    }
    function restoreReplyEditorAfterEmojiInsert() {
        if (!shouldRestoreReplyEditorAfterEmojiInsert || !replyEditor || replyModalOverlay?.hidden) return;
        shouldRestoreReplyEditorAfterEmojiInsert = false;
        window.requestAnimationFrame(() => {
            isInsertingReplyEmoji = true;
            replyEditor.focus();
            isInsertingReplyEmoji = false;
            restoreReplySelection();
            saveReplySelection();
            syncReplyFormatButtons();
        });
    }
    function ensureReplyEmojiLibraryPicker() {
        if (!replyEmojiButton || !replyEditor || !hasEmojiButtonLibrary()) return null;
        if (replyEmojiLibraryPicker) return replyEmojiLibraryPicker;
        replyEmojiLibraryPicker = new window.EmojiButton({
            position: "bottom-start",
            rootElement: replyModalOverlay ?? undefined,
            zIndex: 1400,
        });
        replyEmojiLibraryPicker.on("emoji", (selection) => {
            const emoji = typeof selection === "string" ? selection : selection?.emoji;
            if (!emoji) return;
            shouldRestoreReplyEditorAfterEmojiInsert = true;
            insertReplyEmoji(emoji);
            closeEmojiPicker();
            restoreReplyEditorAfterEmojiInsert();
        });
        replyEmojiLibraryPicker.on("hidden", () => {
            replyEmojiButton?.setAttribute("aria-expanded", "false");
            if (shouldRestoreReplyEditorAfterEmojiInsert) { restoreReplyEditorAfterEmojiInsert(); return; }
            saveReplySelection();
        });
        if (replyEmojiPicker) replyEmojiPicker.hidden = true;
        return replyEmojiLibraryPicker;
    }
    function closeEmojiPicker() {
        const libraryPicker = replyEmojiLibraryPicker;
        if (libraryPicker) {
            if (libraryPicker.pickerVisible) libraryPicker.hidePicker();
            replyEmojiButton?.setAttribute("aria-expanded", "false");
            restoreReplyEditorAfterEmojiInsert();
            return;
        }
        if (!replyEmojiPicker || !replyEmojiButton) return;
        replyEmojiPicker.hidden = true;
        replyEmojiButton.setAttribute("aria-expanded", "false");
        restoreReplyEditorAfterEmojiInsert();
    }
    function updateEmojiPickerPosition() {
        if (!replyEmojiPicker || !replyEmojiButton) return;
        const rect = replyEmojiButton.getBoundingClientRect();
        const pw = Math.min(565, window.innerWidth - 32);
        const ml = Math.max(16, window.innerWidth - pw - 16);
        const left = Math.min(Math.max(16, rect.left), ml);
        const top = Math.min(rect.bottom + 8, window.innerHeight - 24);
        const mh = Math.max(220, window.innerHeight - top - 16);
        replyEmojiPicker.style.left = `${left}px`;
        replyEmojiPicker.style.top = `${top}px`;
        replyEmojiPicker.style.maxHeight = `${mh}px`;
    }
    function openEmojiPicker() {
        const libraryPicker = ensureReplyEmojiLibraryPicker();
        if (libraryPicker && replyEmojiButton) {
            saveReplySelection();
            replyEmojiButton.setAttribute("aria-expanded", "true");
            libraryPicker.showPicker(replyEmojiButton);
            return;
        }
        if (!replyEmojiPicker || !replyEmojiButton) return;
        renderEmojiPicker();
        replyEmojiPicker.hidden = false;
        replyEmojiButton.setAttribute("aria-expanded", "true");
        updateEmojiPickerPosition();
    }
    function toggleEmojiPicker() {
        const libraryPicker = ensureReplyEmojiLibraryPicker();
        if (libraryPicker && replyEmojiButton) {
            saveReplySelection();
            if (libraryPicker.pickerVisible) {
                libraryPicker.hidePicker();
                replyEmojiButton.setAttribute("aria-expanded", "false");
            } else {
                replyEmojiButton.setAttribute("aria-expanded", "true");
                libraryPicker.showPicker(replyEmojiButton);
            }
            return;
        }
        if (!replyEmojiPicker) return;
        replyEmojiPicker.hidden ? openEmojiPicker() : closeEmojiPicker();
    }
    function insertReplyEmoji(emoji) {
        if (!replyEditor) return;
        isInsertingReplyEmoji = true;
        replyEditor.focus();
        if (!restoreReplySelection()) {
            const range = document.createRange();
            range.selectNodeContents(replyEditor);
            range.collapse(false);
            const sel = window.getSelection();
            sel?.removeAllRanges();
            sel?.addRange(range);
        }
        const sel = window.getSelection();
        if (!sel) { isInsertingReplyEmoji = false; return; }
        let range;
        if (sel.rangeCount === 0) {
            range = document.createRange();
            range.selectNodeContents(replyEditor);
            range.collapse(false);
            sel.removeAllRanges();
            sel.addRange(range);
        } else {
            range = sel.getRangeAt(0);
        }
        if (!replyEditor.contains(range.commonAncestorContainer)) {
            range = document.createRange();
            range.selectNodeContents(replyEditor);
            range.collapse(false);
            sel.removeAllRanges();
            sel.addRange(range);
        }
        const emojiNode = document.createTextNode(emoji);
        range.deleteContents();
        range.insertNode(emojiNode);
        const nextRange = document.createRange();
        nextRange.setStartAfter(emojiNode);
        nextRange.collapse(true);
        sel.removeAllRanges();
        sel.addRange(nextRange);
        isInsertingReplyEmoji = false;
        applyPendingReplyFormatsToContent();
        saveRecentEmoji(emoji);
        saveReplySelection();
        syncReplySubmitState();
        syncReplyFormatButtons();
        if (replyEmojiPicker && !replyEmojiPicker.hidden) renderEmojiPicker();
    }

    // ===== 첨부파일 함수 =====
    function getReplyMediaImageAlt() { return ""; }
    function clearAttachedReplyFileUrls() {
        if (attachedReplyFileUrls.length === 0) return;
        attachedReplyFileUrls.forEach((u) => URL.revokeObjectURL(u));
        attachedReplyFileUrls = [];
    }
    function createReplyAttachmentUrls() {
        clearAttachedReplyFileUrls();
        attachedReplyFileUrls = attachedReplyFiles.map((f) => URL.createObjectURL(f));
    }
    function isReplyImageSet() {
        return attachedReplyFiles.length > 0 && attachedReplyFiles.every((f) => f.type.startsWith("image/"));
    }
    function isReplyVideoSet() {
        return attachedReplyFiles.length === 1 && attachedReplyFiles[0].type.startsWith("video/");
    }
    function resetReplyAttachment() {
        clearAttachedReplyFileUrls();
        attachedReplyFiles = [];
        pendingAttachmentEditIndex = null;
        if (replyFileInput) replyFileInput.value = "";
        if (replyAttachmentMedia) replyAttachmentMedia.innerHTML = "";
        if (replyAttachmentPreview) replyAttachmentPreview.hidden = true;
    }
    function getReplyImageCell(index, url, cls) {
        const alt = getReplyMediaImageAlt(index);
        return `<div class="media-cell ${cls}"><div class="media-cell-inner"><div class="media-img-container" aria-label="미디어" role="group"><div class="media-bg" style="background-image: url('${url}');"></div><img alt="${escapeHtml(alt)}" draggable="false" src="${url}" class="media-img"></div><div class="media-btn-row"><button type="button" class="media-btn" data-attachment-edit-index="${index}"><span>수정</span></button></div><button type="button" class="media-btn-delete" aria-label="미디어 삭제하기" data-attachment-remove-index="${index}"><svg viewBox="0 0 24 24" aria-hidden="true"><g><path d="M10.59 12L4.54 5.96l1.42-1.42L12 10.59l6.04-6.05 1.42 1.42L13.41 12l6.05 6.04-1.42 1.42L12 13.41l-6.04 6.05-1.42-1.42L10.59 12z"></path></g></svg></button></div></div>`;
    }
    function renderReplyImageGrid() {
        const n = attachedReplyFiles.length, urls = attachedReplyFileUrls;
        if (!replyAttachmentMedia || n === 0) return;
        if (n === 1) { replyAttachmentMedia.innerHTML = `<div class="media-aspect-ratio media-aspect-ratio--single"></div><div class="media-absolute-layer">${getReplyImageCell(0, urls[0], "media-cell--single")}</div>`; return; }
        if (n === 2) { replyAttachmentMedia.innerHTML = `<div class="media-aspect-ratio"></div><div class="media-absolute-layer"><div class="media-row"><div class="media-col">${getReplyImageCell(0, urls[0], "media-cell--left")}</div><div class="media-col">${getReplyImageCell(1, urls[1], "media-cell--right")}</div></div></div>`; return; }
        if (n === 3) { replyAttachmentMedia.innerHTML = `<div class="media-aspect-ratio"></div><div class="media-absolute-layer"><div class="media-row"><div class="media-col">${getReplyImageCell(0, urls[0], "media-cell--left-tall")}</div><div class="media-col">${getReplyImageCell(1, urls[1], "media-cell--right-top")}${getReplyImageCell(2, urls[2], "media-cell--right-bottom")}</div></div></div>`; return; }
        replyAttachmentMedia.innerHTML = `<div class="media-aspect-ratio"></div><div class="media-absolute-layer"><div class="media-row"><div class="media-col">${getReplyImageCell(0, urls[0], "media-cell--top-left")}${getReplyImageCell(2, urls[2], "media-cell--bottom-left")}</div><div class="media-col">${getReplyImageCell(1, urls[1], "media-cell--top-right")}${getReplyImageCell(3, urls[3], "media-cell--bottom-right")}</div></div></div>`;
    }
    function renderReplyVideoAttachment() {
        if (!replyAttachmentMedia || attachedReplyFiles.length === 0) return;
        const [file] = attachedReplyFiles, [fileUrl] = attachedReplyFileUrls;
        replyAttachmentMedia.innerHTML = `<div class="media-aspect-ratio media-aspect-ratio--single"></div><div class="media-absolute-layer"><div class="media-cell media-cell--single"><div class="media-cell-inner"><div class="media-img-container" aria-label="미디어" role="group"><video class="tweet-modal__attachment-video" controls preload="metadata"><source src="${fileUrl}" type="${file.type}"></video></div><div class="media-btn-row"><button type="button" class="media-btn" data-attachment-edit-index="0"><span>수정</span></button></div><button type="button" class="media-btn-delete" aria-label="미디어 삭제하기" data-attachment-remove-index="0"><svg viewBox="0 0 24 24" aria-hidden="true"><g><path d="M10.59 12L4.54 5.96l1.42-1.42L12 10.59l6.04-6.05 1.42 1.42L13.41 12l6.05 6.04-1.42 1.42L12 13.41l-6.04 6.05-1.42-1.42L10.59 12z"></path></g></svg></button></div></div></div>`;
    }
    function renderReplyAttachment() {
        if (!replyAttachmentPreview || !replyAttachmentMedia) return;
        if (attachedReplyFiles.length === 0) {
            replyAttachmentMedia.innerHTML = "";
            replyAttachmentPreview.hidden = true;
            return;
        }
        replyAttachmentPreview.hidden = false;
        createReplyAttachmentUrls();
        if (isReplyImageSet()) { renderReplyImageGrid(); return; }
        if (isReplyVideoSet()) { renderReplyVideoAttachment(); return; }
        replyAttachmentMedia.innerHTML = "";
        const fp = document.createElement("div");
        const fi = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        const fg = document.createElementNS("http://www.w3.org/2000/svg", "g");
        const fpath = document.createElementNS("http://www.w3.org/2000/svg", "path");
        const fn = document.createElement("span");
        fp.className = "tweet-modal__attachment-file";
        fi.setAttribute("viewBox", "0 0 24 24");
        fi.setAttribute("width", "22");
        fi.setAttribute("height", "22");
        fi.setAttribute("aria-hidden", "true");
        fpath.setAttribute("d", "M14 2H7.75C5.68 2 4 3.68 4 5.75v12.5C4 20.32 5.68 22 7.75 22h8.5C18.32 22 20 20.32 20 18.25V8l-6-6zm0 2.12L17.88 8H14V4.12zm2.25 15.88h-8.5c-.97 0-1.75-.78-1.75-1.75V5.75C6 4.78 6.78 4 7.75 4H12v5.25c0 .41.34.75.75.75H18v8.25c0 .97-.78 1.75-1.75 1.75z");
        fn.className = "tweet-modal__attachment-file-name";
        fn.textContent = attachedReplyFiles[0]?.name ?? "";
        fg.appendChild(fpath); fi.appendChild(fg); fp.appendChild(fi); fp.appendChild(fn);
        replyAttachmentMedia.appendChild(fp);
    }
    function removeReplyAttachment(index) {
        attachedReplyFiles = attachedReplyFiles.filter((_, i) => i !== index);
        pendingAttachmentEditIndex = null;
        renderReplyAttachment();
    }
    function handleReplyFileChange(e) {
        const next = Array.from(e.target.files ?? []);
        if (next.length === 0) { pendingAttachmentEditIndex = null; syncReplySubmitState(); return; }
        const rep = next[0];
        const vid = next.find((f) => f.type.startsWith("video/"));
        const imgs = next.filter((f) => f.type.startsWith("image/"));
        if (pendingAttachmentEditIndex !== null) {
            if (!rep) { pendingAttachmentEditIndex = null; return; }
            if (rep.type.startsWith("video/")) { attachedReplyFiles = [rep]; }
            else {
                const ed = isReplyVideoSet() ? [] : [...attachedReplyFiles];
                attachedReplyFiles = ed.length === 0 ? [rep] : ((ed[pendingAttachmentEditIndex] = rep), ed.slice(0, maxReplyImages));
            }
            pendingAttachmentEditIndex = null;
            renderReplyAttachment();
            syncReplySubmitState();
            return;
        }
        if (vid) { attachedReplyFiles = [vid]; renderReplyAttachment(); syncReplySubmitState(); return; }
        if (imgs.length > 0) {
            attachedReplyFiles = [...(isReplyImageSet() ? [...attachedReplyFiles] : []), ...imgs].slice(0, maxReplyImages);
            renderReplyAttachment(); syncReplySubmitState(); return;
        }
        attachedReplyFiles = [rep];
        renderReplyAttachment();
        syncReplySubmitState();
    }

    // ===== 동기화 함수 =====
    function syncReplySubmitState() {
        if (!replyEditor) return;
        let content = replyEditor.textContent?.replace(/\u00a0/g, " ") ?? "";
        if (content.length > REPLY_MAX_LENGTH) {
            content = content.slice(0, REPLY_MAX_LENGTH);
            replyEditor.textContent = content;
            placeCaretAtEnd(replyEditor);
            saveReplySelection();
        }
        const currentLength = content.length;
        const remaining = Math.max(REPLY_MAX_LENGTH - currentLength, 0);
        const canSubmit = content.trim().length > 0 || hasReplyAttachment();
        const progress = `${Math.min(currentLength / REPLY_MAX_LENGTH, 1) * 360}deg`;
        if (replySubmitButton) replySubmitButton.disabled = !canSubmit;
        if (replyGauge) {
            replyGauge.style.setProperty("--gauge-progress", progress);
            replyGauge.setAttribute("aria-valuenow", String(currentLength));
        }
        if (replyGaugeText) replyGaugeText.textContent = String(remaining);
    }

    // 모달 내에서 Tab 키 포커스를 가두어 접근성을 보장한다
    function trapFocus(e) {
        if (!replyModal || e.key !== "Tab") return;
        const focusable = Array.from(
            replyModal.querySelectorAll('button:not([disabled]), [href], input:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'),
        ).filter((el) => !el.hasAttribute("hidden"));
        if (focusable.length === 0) return;
        const first = focusable[0], last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }

    // 답글 모달은 HTML에 이미 있는 [data-reply-modal] 골격을 게시물 데이터로 채워서 사용한다.
    // ===== 위치 선택 로직 (Notification과 동일) =====
    // 위치 검색 필터
    function getFilteredLocations() {
        const q = replyLocationSearchInput?.value?.trim().toLowerCase() ?? "";
        if (!q) return cachedLocationNames;
        return cachedLocationNames.filter((l) => l.toLowerCase().includes(q));
    }

    // 위치 UI 동기화
    function syncLocationUI() {
        const has = Boolean(selectedLocation);
        if (replyFooterMeta) replyFooterMeta.hidden = !has;
        if (replyLocationName) replyLocationName.textContent = selectedLocation ?? "";
        if (replyLocationDisplayButton) {
            replyLocationDisplayButton.hidden = !has;
        }
        if (replyGeoButtonPath) {
            const np = has ? (replyGeoButtonPath.dataset.pathActive || replyGeoButtonPath.getAttribute("d")) : (replyGeoButtonPath.dataset.pathInactive || replyGeoButtonPath.getAttribute("d"));
            if (np) replyGeoButtonPath.setAttribute("d", np);
        }
        if (replyLocationDeleteButton) replyLocationDeleteButton.hidden = !has;
        if (replyLocationCompleteButton) replyLocationCompleteButton.disabled = !pendingLocation;
    }

    // 위치 목록 렌더링
    function renderLocationList() {
        if (!replyLocationList) return;
        const locs = getFilteredLocations();
        if (locs.length === 0) {
            replyLocationList.innerHTML = '<p class="tweet-modal__location-empty">일치하는 위치를 찾지 못했습니다.</p>';
            return;
        }
        replyLocationList.innerHTML = locs.map((loc) => {
            const sel = pendingLocation === loc;
            return `<button type="button" class="tweet-modal__location-item" role="menuitem"><span class="tweet-modal__location-item-label">${escapeHtml(loc)}</span><span class="tweet-modal__location-item-check">${sel ? '<svg viewBox="0 0 24 24" aria-hidden="true"><g><path d="M9.64 18.952l-5.55-4.861 1.317-1.504 3.951 3.459 8.459-10.948L19.4 6.32 9.64 18.952z"></path></g></svg>' : ""}</span></button>`;
        }).join("");
    }

    // 위치 패널 열기
    function openLocationPanel() {
        if (!composeView || !replyLocationView) return;
        closeEmojiPicker();
        pendingLocation = selectedLocation;
        composeView.hidden = true;
        replyLocationView.hidden = false;
        if (replyLocationSearchInput) replyLocationSearchInput.value = "";
        renderLocationList();
        syncLocationUI();
        window.requestAnimationFrame(() => { replyLocationSearchInput?.focus(); });
    }

    // 위치 패널 닫기
    function closeLocationPanel({ restoreFocus = true } = {}) {
        if (!composeView || !replyLocationView || replyLocationView.hidden) return;
        replyLocationView.hidden = true;
        composeView.hidden = false;
        if (replyLocationSearchInput) replyLocationSearchInput.value = "";
        pendingLocation = selectedLocation;
        renderLocationList();
        syncLocationUI();
        if (restoreFocus) window.requestAnimationFrame(() => { replyEditor?.focus(); });
    }

    function applyLocation(loc) {
        selectedLocation = loc;
        pendingLocation = loc;
        syncLocationUI();
    }

    function resetLocationState() {
        selectedLocation = null;
        pendingLocation = null;
        if (replyLocationSearchInput) replyLocationSearchInput.value = "";
        renderLocationList();
        syncLocationUI();
    }

    const initializeReplyModal = () => {
        if (
            !replyModalOverlay ||
            !replyModal ||
            !replyEditor ||
            !replySubmitButton
        ) {
            return;
        }

        // 눌린 게시물 카드의 작성자/본문을 모달 상단 요약 영역에 복사한다.
        const openReplyModal = (button) => {
            const postCard = getPostCard(button);
            const avatarSrc = getPostAvatarSrc(postCard);
            const postText = postCard?.querySelector(".postText");
            activeReplyTrigger = button;
            shouldRestoreReplyEditorAfterEmojiInsert = false;

            if (replySourceAvatar) {
                replySourceAvatar.src = avatarSrc;
                replySourceAvatar.alt = getTextContent(
                    postCard?.querySelector(".postName"),
                );
            }

            if (replyAvatar) {
                replyAvatar.src = avatarSrc;
            }

            if (replySourceName) {
                replySourceName.textContent = getTextContent(
                    postCard?.querySelector(".postName"),
                );
            }

            if (replySourceHandle) {
                replySourceHandle.textContent = getTextContent(
                    postCard?.querySelector(".postHandle"),
                );
            }

            if (replySourceTime) {
                replySourceTime.textContent = getTextContent(
                    postCard?.querySelector(".postTime"),
                );
            }

            if (replySourceText) {
                replySourceText.textContent =
                    postText?.dataset.fullText || getTextContent(postText);
            }

            replyEditor.textContent = "";
            savedReplySelection = null;
            savedReplySelectionOffsets = null;
            pendingReplyFormats = new Set();
            activeEmojiCategory = "recent";
            closeEmojiPicker();
            resetReplyAttachment();
            selectedProduct = null;
            if (replyProductButton) replyProductButton.disabled = false;
            const existingProductCard = replyModalOverlay?.querySelector("[data-selected-product]");
            if (existingProductCard) existingProductCard.remove();
            if (replyProductView) replyProductView.hidden = true;
            if (replyLocationView) replyLocationView.hidden = true;
            selectedLocation = null;
            pendingLocation = null;
            if (replyEmojiSearchInput) replyEmojiSearchInput.value = "";
            if (composeView) composeView.hidden = false;
            syncLocationUI();
            syncReplySubmitState();
            syncReplyFormatButtons();
            replyModalOverlay.hidden = false;
            document.body.classList.add("modal-open");
            window.requestAnimationFrame(() => {
                replyEditor.focus();
            });
        };

        // 카드 하단의 답글 액션 버튼은 먼저 다른 공유 UI를 닫고 답글 모달을 연다.
        document.querySelectorAll("[data-testid='reply']").forEach((button) => {
            button.addEventListener("click", (event) => {
                event.preventDefault();
                event.stopPropagation();
                closeShareDropdown();
                closeShareModal();
                openReplyModal(button);
            });
        });

        // 에디터 입력 시 서식 적용, 상태 동기화
        replyEditor.addEventListener("input", () => {
            applyPendingReplyFormatsToContent();
            if (!hasReplyEditorText()) pendingReplyFormats = new Set();
            syncReplySubmitState();
            syncReplyFormatButtons();
        });
        // 에디터에서 키/마우스/포커스 이벤트 시 선택 영역 저장 및 서식 동기화
        replyEditor.addEventListener("keyup", saveReplySelection);
        replyEditor.addEventListener("keyup", syncReplyFormatButtons);
        replyEditor.addEventListener("mouseup", saveReplySelection);
        replyEditor.addEventListener("mouseup", syncReplyFormatButtons);
        replyEditor.addEventListener("focus", saveReplySelection);
        replyEditor.addEventListener("focus", syncReplyFormatButtons);
        replyEditor.addEventListener("click", syncReplyFormatButtons);

        // Ctrl+B/I 단축키로 굵게/기울임 서식을 적용한다
        replyEditor.addEventListener("keydown", (e) => {
            if (!e.ctrlKey) return;
            const key = e.key.toLowerCase();
            if (key !== "b" && key !== "i") return;
            e.preventDefault();
            applyReplyFormat(key === "b" ? "bold" : "italic");
        });

        // 서식 버튼 클릭 시 해당 서식을 적용한다
        replyFormatButtons.forEach((btn) => {
            btn.addEventListener("mousedown", (e) => e.preventDefault());
            btn.addEventListener("click", (e) => {
                e.preventDefault();
                const fmt = btn.getAttribute("data-format");
                if (fmt) {
                    applyReplyFormat(fmt);
                    syncReplyFormatButtons();
                }
            });
        });

        // 이모지 버튼 클릭 시 이모지 피커를 토글한다
        replyEmojiButton?.addEventListener("mousedown", (e) => { e.preventDefault(); e.stopPropagation(); saveReplySelection(); });
        replyEmojiButton?.addEventListener("click", (e) => { e.preventDefault(); e.stopPropagation(); toggleEmojiPicker(); });

        // 미디어 업로드 버튼 클릭 시 파일 선택 대화상자를 연다
        replyMediaUploadButton?.addEventListener("click", (e) => {
            e.preventDefault();
            pendingAttachmentEditIndex = null;
            if (replyFileInput) replyFileInput.value = "";
            replyFileInput?.click();
        });

        // 파일 선택 시 첨부파일을 처리한다
        replyFileInput?.addEventListener("change", handleReplyFileChange);

        // 첨부 미디어 영역에서 삭제/수정 버튼 클릭을 처리한다
        replyAttachmentMedia?.addEventListener("click", (e) => {
            const rm = e.target.closest("[data-attachment-remove-index]");
            if (rm) {
                const ri = Number.parseInt(rm.getAttribute("data-attachment-remove-index") ?? "-1", 10);
                if (ri >= 0) removeReplyAttachment(ri);
                syncReplySubmitState();
                return;
            }
            const eb = e.target.closest("[data-attachment-edit-index]");
            if (eb) {
                pendingAttachmentEditIndex = Number.parseInt(eb.getAttribute("data-attachment-edit-index") ?? "-1", 10);
                if (replyFileInput) replyFileInput.value = "";
                replyFileInput?.click();
            }
        });

        // 텍스트 선택 변경 시 선택 영역을 저장하고 서식 버튼을 동기화한다
        document.addEventListener("selectionchange", () => {
            if (replyModalOverlay?.hidden || !replyEditor) return;
            if (!isSelectionInsideEditor()) return;
            saveReplySelection();
            syncReplyFormatButtons();
        });

        // 이모지 피커 내부 클릭 시 이벤트 전파를 막는다
        replyEmojiPicker?.addEventListener("click", (e) => e.stopPropagation());
        // 이모지 검색 입력 시 피커 콘텐츠를 갱신한다
        replyEmojiSearchInput?.addEventListener("input", () => renderEmojiPickerContent());
        // 이모지 카테고리 탭 클릭 시 해당 카테고리를 활성화한다
        replyEmojiTabs.forEach((tab) => {
            tab.addEventListener("click", () => {
                const cat = tab.getAttribute("data-emoji-category");
                if (cat) { activeEmojiCategory = cat; renderEmojiPicker(); }
            });
        });
        // 이모지 옵션/지우기 버튼 mousedown 시 포커스 이동을 방지한다
        replyEmojiContent?.addEventListener("mousedown", (e) => {
            if (e.target.closest(".tweet-modal__emoji-option, .tweet-modal__emoji-clear")) e.preventDefault();
        });
        // 이모지 클릭 시 에디터에 삽입하고, 지우기 클릭 시 최근 목록을 초기화한다
        replyEmojiContent?.addEventListener("click", (e) => {
            if (e.target.closest("[data-action='clear-recent']")) {
                clearRecentEmojis();
                activeEmojiCategory = "recent";
                renderEmojiPicker();
                return;
            }
            const eb2 = e.target.closest(".tweet-modal__emoji-option");
            if (!eb2) return;
            const emoji = eb2.getAttribute("data-emoji");
            if (emoji) { insertReplyEmoji(emoji); closeEmojiPicker(); }
        });

        // 위치 태그 버튼 클릭 시 위치 선택 패널을 연다
        replyGeoButton?.addEventListener("click", (e) => {
            e.preventDefault();
            openLocationPanel();
        });
        // 위치 패널 닫기 버튼
        replyLocationCloseButton?.addEventListener("click", () => closeLocationPanel());
        // 위치 삭제 버튼
        replyLocationDeleteButton?.addEventListener("click", () => {
            resetLocationState();
            closeLocationPanel();
        });
        // 위치 완료 버튼
        replyLocationCompleteButton?.addEventListener("click", () => {
            if (pendingLocation) {
                applyLocation(pendingLocation);
                closeLocationPanel();
            }
        });
        // 위치 검색 입력
        replyLocationSearchInput?.addEventListener("input", () => renderLocationList());
        // 위치 항목 클릭
        replyLocationList?.addEventListener("click", (e) => {
            const item = e.target.closest(".tweet-modal__location-item");
            if (!item) return;
            const loc = item.querySelector(".tweet-modal__location-item-label")?.textContent;
            if (loc) {
                pendingLocation = pendingLocation === loc ? null : loc;
                renderLocationList();
                if (replyLocationCompleteButton) replyLocationCompleteButton.disabled = !pendingLocation;
            }
        });
        // 위치 표시 버튼 클릭 시 위치 패널 열기
        replyLocationDisplayButton?.addEventListener("click", (e) => {
            e.preventDefault();
            openLocationPanel();
        });

        // ===== 판매글 선택 서브뷰 =====
        replyProductButton?.addEventListener("click", (e) => {
            e.preventDefault();
            openProductSelectPanel();
        });

        productSelectClose?.addEventListener("click", () => {
            closeProductSelectPanel();
        });

        productSelectComplete?.addEventListener("click", () => {
            const checkedItem = productSelectList?.querySelector(".draft-panel__item--selected");
            if (checkedItem) {
                selectedProduct = {
                    name: checkedItem.querySelector(".draft-panel__text")?.textContent ?? "",
                    price: checkedItem.querySelector(".draft-panel__date")?.textContent ?? "",
                    image: checkedItem.querySelector(".draft-panel__avatar")?.src ?? "",
                    id: checkedItem.dataset.productId ?? "",
                };
                renderSelectedProduct();
                if (replyProductButton) replyProductButton.disabled = true;
            }
            closeProductSelectPanel();
        });

        // 판매글 선택 서브뷰 열기 (compose view를 숨기고 product view를 표시)
        function openProductSelectPanel() {
            if (!replyProductView) return;
            renderProductList();
            if (composeView) composeView.hidden = true;
            replyProductView.hidden = false;
        }

        // 판매글 선택 서브뷰 닫기 (product view를 숨기고 compose view를 복원)
        function closeProductSelectPanel() {
            if (!replyProductView) return;
            replyProductView.hidden = true;
            if (composeView) composeView.hidden = false;
        }

        // 내 상품 목록 렌더링 (Notification과 동일한 draft-panel 스타일)
        function renderProductList() {
            if (!productSelectList) return;
            // TODO: REST API - GET /api/products/my 로 실제 데이터 가져오기
            const sampleProducts = [
                { id: "1", name: "상품 이름 1", price: "₩50,000", stock: "100개", image: "../../static/images/main/global-gates-logo.png", tags: ["#부품", "#전자"] },
                { id: "2", name: "상품 이름 2", price: "₩30,000", stock: "50개", image: "../../static/images/main/global-gates-logo.png", tags: ["#부품", "#기계"] },
                { id: "3", name: "상품 이름 3", price: "₩80,000", stock: "200개", image: "../../static/images/main/global-gates-logo.png", tags: ["#부품", "#소재"] },
            ];

            if (sampleProducts.length === 0) {
                productSelectList.innerHTML = "";
                if (productSelectEmpty) productSelectEmpty.hidden = false;
                return;
            }
            if (productSelectEmpty) productSelectEmpty.hidden = true;

            productSelectList.innerHTML = sampleProducts.map((p) => `
                <button type="button" class="draft-panel__item draft-panel__item--selectable" data-product-id="${escapeHtml(p.id)}" aria-pressed="false">
                    <span class="draft-panel__checkbox">
                        <svg viewBox="0 0 24 24" aria-hidden="true"><g><path d="M9 20c-.264 0-.518-.104-.707-.293l-4.785-4.785 1.414-1.414L9 17.586 19.072 7.5l1.42 1.416L9.708 19.7c-.188.19-.442.3-.708.3z"></path></g></svg>
                    </span>
                    <img class="draft-panel__avatar" alt="" src="${escapeHtml(p.image)}">
                    <span class="draft-panel__item-body">
                        <span class="draft-panel__text">${escapeHtml(p.name)}</span>
                        <span class="draft-panel__meta">${p.tags.join(" ")}</span>
                        <span class="draft-panel__date">${escapeHtml(p.price)} · ${escapeHtml(p.stock)}</span>
                    </span>
                </button>
            `).join("");
        }

        // 상품 클릭 시 선택 토글 (단일 선택) — 한 번만 등록
        productSelectList?.addEventListener("click", (e) => {
            const item = e.target.closest(".draft-panel__item");
            if (!item) return;
            const wasSelected = item.classList.contains("draft-panel__item--selected");
            productSelectList.querySelectorAll(".draft-panel__item--selected").forEach((el) => {
                el.classList.remove("draft-panel__item--selected");
                el.setAttribute("aria-pressed", "false");
                const cb = el.querySelector(".draft-panel__checkbox");
                if (cb) cb.classList.remove("draft-panel__checkbox--checked");
            });
            if (!wasSelected) {
                item.classList.add("draft-panel__item--selected");
                item.setAttribute("aria-pressed", "true");
                const cb = item.querySelector(".draft-panel__checkbox");
                if (cb) cb.classList.add("draft-panel__checkbox--checked");
            }
            if (productSelectComplete) {
                productSelectComplete.disabled = !productSelectList.querySelector(".draft-panel__item--selected");
            }
        });

        // 선택된 판매글을 에디터 아래에 표시
        function renderSelectedProduct() {
            const existing = replyModalOverlay?.querySelector("[data-selected-product]");
            if (existing) existing.remove();
            if (!selectedProduct || !replyEditor) return;

            const card = document.createElement("div");
            card.setAttribute("data-selected-product", "");
            card.className = "tweet-modal__selected-product";
            card.innerHTML = `
                <div class="selected-product__card">
                    <img class="selected-product__image" src="${escapeHtml(selectedProduct.image)}" alt="${escapeHtml(selectedProduct.name)}">
                    <div class="selected-product__info">
                        <strong class="selected-product__name">${escapeHtml(selectedProduct.name)}</strong>
                        <span class="selected-product__price">${escapeHtml(selectedProduct.price)}</span>
                    </div>
                    <button type="button" class="selected-product__remove" aria-label="판매글 제거">
                        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                            <g><path d="M10.59 12L4.54 5.96l1.42-1.42L12 10.59l6.04-6.05 1.42 1.42L13.41 12l6.05 6.04-1.42 1.42L12 13.41l-6.04 6.05-1.42-1.42L10.59 12z"></path></g>
                        </svg>
                    </button>
                </div>
            `;
            card.querySelector(".selected-product__remove")?.addEventListener("click", () => {
                selectedProduct = null;
                card.remove();
                if (replyProductButton) replyProductButton.disabled = false;
            });
            replyEditor.parentElement?.appendChild(card);
        }

        // 답글 모달 닫기 버튼 클릭 시 모달을 닫는다
        replyCloseButton?.addEventListener("click", () => closeReplyModal());
        // 답글 모달 오버레이 클릭 시 모달을 닫는다
        replyModalOverlay.addEventListener("click", (event) => {
            if (event.target === replyModalOverlay) {
                closeReplyModal();
            }
        });

        // Escape 키로 열린 피커/모달을 순서대로 닫고 Tab으로 포커스를 가둔다
        replyModalOverlay.addEventListener("keydown", (e) => {
            if (e.key === "Escape") {
                e.preventDefault();
                // 서브뷰가 열려있으면 먼저 닫기
                if (replyLocationView && !replyLocationView.hidden) {
                    closeLocationPanel();
                    return;
                }
                if (replyProductView && !replyProductView.hidden) {
                    closeProductSelectPanel();
                    return;
                }
                closeReplyModal();
                return;
            }
            trapFocus(e);
        });

        // 답글 제출 버튼 클릭 시 답글 수를 증가시키고 모달을 닫는다
        replySubmitButton.addEventListener("click", () => {
            if (!activeReplyTrigger || replySubmitButton.disabled) {
                return;
            }

            const nextCount = updateCount(activeReplyTrigger, 1);
            activeReplyTrigger.setAttribute("aria-label", `답글 ${nextCount}`);
            closeReplyModal({ skipConfirm: true });
        });

        // 외부 클릭으로 이모지 피커를 닫는다
        document.addEventListener("click", (e) => {
            if (
                replyEmojiPicker &&
                !replyEmojiPicker.hidden &&
                !replyEmojiPicker.contains(e.target) &&
                !replyEmojiButton?.contains(e.target)
            )
                closeEmojiPicker();
        });
    };

    // 화면에 필요한 모든 상호작용을 한 번에 연결한다.
    initializeTabs();
    initializePeriodChips();
    initializeFilterDropdown();
    initializePostTextToggles();
    initializePostMoreMenus();
    initializeLikeButtons();
    initializeBookmarkButtons();
    initializeShareButtons();
    initializeReplyModal();

    // ===== 전역 닫기 핸들러 =====
    // 바깥 영역 클릭 시 열려 있는 드롭다운/메뉴만 닫는다.
    document.addEventListener("click", (event) => {
        if (
            filterMenu &&
            !filterMenu.hidden &&
            !filterMenu.contains(event.target) &&
            !filterTrigger?.contains(event.target)
        ) {
            closeFilterMenu();
        }

        if (
            activePostMoreMenu &&
            !activePostMoreMenu.contains(event.target) &&
            !activePostMoreButton?.contains(event.target)
        ) {
            closePostMoreMenu();
        }

        // 동적 더보기 드롭다운 바깥 클릭 시 닫기
        if (
            activeMoreDropdown &&
            !activeMoreDropdown.contains(event.target) &&
            !activeMoreButton?.contains(event.target)
        ) {
            closeMoreDropdown();
        }

        if (
            activeShareDropdown &&
            !activeShareDropdown.contains(event.target) &&
            !activeShareButton?.contains(event.target)
        ) {
            closeShareDropdown();
        }
    });

    // Escape는 현재 열려 있는 보조 UI를 모두 닫는 공통 단축키다.
    document.addEventListener("keydown", (event) => {
        if (event.key !== "Escape") {
            return;
        }

        closeNotificationModal();
        closeShareModal();
        closeShareDropdown();
        closeMoreDropdown();
        closePostMoreMenu();
        closeFilterMenu();
    });
};

// contenteditable에 공통으로 쓰는 커서 이동 유틸이다.
function placeCaretAtEnd(element) {
    const selection = window.getSelection();
    if (!selection) return;
    const range = document.createRange();
    range.selectNodeContents(element);
    range.collapse(false);
    selection.removeAllRanges();
    selection.addRange(range);
}
