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

    // 공유 드롭다운은 HTML의 #layers 루트에 동적으로 추가된다.
    const layersRoot = document.getElementById("layers");

    // 탭 미리보기 애니메이션 시간과 게시물 본문 축약 기준 길이다.
    const PREVIEW_DURATION_MS = 280;
    const MAX_POST_TEXT_LENGTH = 140;

    // 현재 열려 있는 UI와 마지막으로 눌린 트리거를 추적해서 중복 오픈과 복귀 포커스를 관리한다.
    let activeReplyTrigger = null;
    let activeShareDropdown = null;
    let activeShareButton = null;
    let activeShareModal = null;
    let activePostMoreMenu = null;
    let activePostMoreButton = null;

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

    // 게시물 더보기 메뉴는 카드 헤더 내부에 이미 있는 정적 마크업을 토글한다.
    const closePostMoreMenu = () => {
        if (!activePostMoreMenu) {
            return;
        }

        activePostMoreMenu.hidden = true;
        activePostMoreButton?.setAttribute("aria-expanded", "false");
        activePostMoreMenu = null;
        activePostMoreButton = null;
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

    // 답글 모달은 HTML에 이미 있으므로 hidden 처리와 입력 초기화만 수행한다.
    const closeReplyModal = () => {
        if (!replyModalOverlay || replyModalOverlay.hidden) {
            return;
        }

        replyModalOverlay.hidden = true;
        document.body.classList.remove("modal-open");

        if (replyEditor) {
            replyEditor.textContent = "";
        }

        if (replySubmitButton) {
            replySubmitButton.disabled = true;
        }

        activeReplyTrigger?.focus();
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
        const right = Math.max(16, window.innerWidth - rect.right);
        const dropdown = document.createElement("div");
        dropdown.className = "layers-dropdown-container";
        dropdown.innerHTML = `<div class="layers-overlay"></div><div class="layers-dropdown-inner"><div role="menu" class="dropdown-menu" style="top: ${top}px; right: ${right}px;"><div><div class="dropdown-inner"><button type="button" role="menuitem" class="menu-item share-menu-item share-menu-item--copy"><span class="menu-item__icon share-menu-item__icon"><svg viewBox="0 0 24 24" aria-hidden="true"><g><path d="M18.36 5.64c-1.95-1.96-5.11-1.96-7.07 0L9.88 7.05 8.46 5.64l1.42-1.42c2.73-2.73 7.16-2.73 9.9 0 2.73 2.74 2.73 7.17 0 9.9l-1.42 1.42-1.41-1.42 1.41-1.41c1.96-1.96 1.96-5.12 0-7.07zm-2.12 3.53l-7.07 7.07-1.41-1.41 7.07-7.07 1.41 1.41zm-12.02.71l1.42-1.42 1.41 1.42-1.41 1.41c-1.96 1.96-1.96 5.12 0 7.07 1.95 1.96 5.11 1.96 7.07 0l1.41-1.41 1.42 1.41-1.42 1.42c-2.73 2.73-7.16 2.73-9.9 0-2.73-2.74-2.73-7.17 0-9.9z"></path></g></svg></span><span class="menu-item__label">링크 복사하기</span></button><button type="button" role="menuitem" class="menu-item share-menu-item share-menu-item--chat"><span class="menu-item__icon share-menu-item__icon"><svg viewBox="0 0 24 24" aria-hidden="true"><g><path d="M1.998 5.5c0-1.381 1.119-2.5 2.5-2.5h15c1.381 0 2.5 1.119 2.5 2.5v13c0 1.381-1.119 2.5-2.5 2.5h-15c-1.381 0-2.5-1.119-2.5-2.5v-13zm2.5-.5c-.276 0-.5.224-.5.5v2.764l8 3.638 8-3.636V5.5c0-.276-.224-.5-.5-.5h-15zm15.5 5.463l-8 3.636-8-3.638V18.5c0 .276.224.5.5.5h15c.276 0 .5-.224.5-.5v-8.037z"></path></g></svg></span><span class="menu-item__label">Chat으로 전송하기</span></button><button type="button" role="menuitem" class="menu-item share-menu-item share-menu-item--bookmark"><span class="menu-item__icon share-menu-item__icon"><svg viewBox="0 0 24 24" aria-hidden="true"><g><path d="M18 3V0h2v3h3v2h-3v3h-2V5h-3V3zm-7.5 1a.5.5 0 00-.5.5V7h3.5A2.5 2.5 0 0116 9.5v3.48l3 2.1V11h2v7.92l-5-3.5v7.26l-6.5-3.54L3 22.68V9.5A2.5 2.5 0 015.5 7H8V4.5A2.5 2.5 0 0110.5 2H12v2zm-5 5a.5.5 0 00-.5.5v9.82l4.5-2.46 4.5 2.46V9.5a.5.5 0 00-.5-.5z"></path></g></svg></span><span class="menu-item__label">폴더에 북마크 추가하기</span></button></div></div></div></div>`;
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

    // 카드 헤더의 점 세 개 버튼은 카드 안에 있는 정적 더보기 메뉴만 열고 닫는다.
    const initializePostMoreMenus = () => {
        document.querySelectorAll(".postMoreButton").forEach((button) => {
            const menu = button.parentElement?.querySelector(".post-more-menu");
            if (!menu) {
                return;
            }

            button.addEventListener("click", (event) => {
                event.preventDefault();
                event.stopPropagation();
                const shouldOpen = menu.hidden;
                closePostMoreMenu();

                if (!shouldOpen) {
                    return;
                }

                menu.hidden = false;
                button.setAttribute("aria-expanded", "true");
                activePostMoreMenu = menu;
                activePostMoreButton = button;
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

    // 답글 모달은 HTML에 이미 있는 [data-reply-modal] 골격을 게시물 데이터로 채워서 사용한다.
    const initializeReplyModal = () => {
        if (
            !replyModalOverlay ||
            !replyModal ||
            !replyEditor ||
            !replySubmitButton
        ) {
            return;
        }

        // 입력이 비어 있으면 하단 답글 버튼을 비활성화한다.
        const syncReplySubmitState = () => {
            replySubmitButton.disabled =
                getTextContent(replyEditor).length === 0;
        };

        // 눌린 게시물 카드의 작성자/본문을 모달 상단 요약 영역에 복사한다.
        const openReplyModal = (button) => {
            const postCard = getPostCard(button);
            const avatarSrc = getPostAvatarSrc(postCard);
            const postText = postCard?.querySelector(".postText");
            activeReplyTrigger = button;

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
            syncReplySubmitState();
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

        replyEditor.addEventListener("input", syncReplySubmitState);
        replyCloseButton?.addEventListener("click", closeReplyModal);
        replyModalOverlay.addEventListener("click", (event) => {
            if (event.target === replyModalOverlay) {
                closeReplyModal();
            }
        });
        replySubmitButton.addEventListener("click", () => {
            if (!activeReplyTrigger || replySubmitButton.disabled) {
                return;
            }

            const nextCount = updateCount(activeReplyTrigger, 1);
            activeReplyTrigger.setAttribute("aria-label", `답글 ${nextCount}`);
            closeReplyModal();
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

        closeReplyModal();
        closeShareModal();
        closeShareDropdown();
        closePostMoreMenu();
        closeFilterMenu();
    });
};
