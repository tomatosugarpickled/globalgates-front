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

    // ===== Share / 공유하기 =====

    // --- State ---
    let activeShareModal = null;
    let activeShareToast = null;

    // --- Utils ---

    // 브라우저 히스토리에 경로를 추가한다
    function pushSharePath(p) {
        try {
            window.history.pushState({}, "", p);
        } catch {
            return;
        }
    }

    // 공유할 게시물의 메타 정보를 반환한다
    function getSharePostMeta(menuEl) {
        const ti = menuEl.closest(".notif-tweet-item");
        const all = Array.from(document.querySelectorAll(".notif-tweet-item"));
        const handle =
            getTextContent(ti?.querySelector(".tweet-handle")) || "@sokkomann";
        const bk = ti?.querySelector(".tweet-action-btn--bookmark") ?? null;
        const tid = String(Math.max(all.indexOf(ti), 0) + 1);
        const url = new URL(window.location.href);
        url.pathname = `/${handle.replace("@", "") || "user"}/status/${tid}`;
        url.hash = "";
        url.search = "";
        return {
            handle,
            tweetItem: ti,
            tweetId: tid,
            permalink: url.toString(),
            bookmarkButton: bk,
        };
    }

    // 공유 관련 토스트 메시지를 표시한다
    function showShareToast(message) {
        activeShareToast?.remove();
        const toast = document.createElement("div");
        toast.className = "share-toast";
        toast.setAttribute("role", "status");
        toast.setAttribute("aria-live", "polite");
        toast.textContent = message;
        document.body.appendChild(toast);
        activeShareToast = toast;
        window.setTimeout(() => {
            if (activeShareToast === toast) activeShareToast = null;
            toast.remove();
        }, 3000);
    }

    // 북마크 버튼의 활성/비활성 상태를 설정한다
    function setBookmarkButtonState(button, isActive) {
        const path = button?.querySelector("path");
        if (!button || !path) return;
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
            isActive ? path.dataset.pathActive : path.dataset.pathInactive,
        );
    }

    // 공유 모달을 닫고 경로를 복원한다
    function closeShareModal({ restorePath = true } = {}) {
        if (!activeShareModal) return;
        activeShareModal.remove();
        activeShareModal = null;
        document.body.classList.remove("modal-open");
        if (restorePath) pushSharePath("/notifications");
    }

    // 공유 메뉴를 닫는다 (.off 토글)
    function closeShareMenu(menuEl) {
        menuEl?.classList.add("off");
    }

    // --- 링크 복사하기 ---
    function copyShareLink(menuEl) {
        const { permalink } = getSharePostMeta(menuEl);
        closeShareMenu(menuEl);
        if (!navigator.clipboard?.writeText) {
            showShareToast("링크를 복사하지 못했습니다");
            return;
        }
        navigator.clipboard
            .writeText(permalink)
            .then(() => showShareToast("클립보드로 복사함"))
            .catch(() => showShareToast("링크를 복사하지 못했습니다"));
    }

    // --- Chat으로 전송하기 (Share-Sheet-* 모달) ---

    // 공유 대상 사용자 행 HTML을 생성한다
    function getShareUserRows() {
        const users = getCurrentPageTagUsers();
        if (users.length === 0)
            return `<div class="Share-Sheet-Empty"><p>전송할 수 있는 사용자가 없습니다.</p></div>`;
        return users
            .map(
                (u) =>
                    `<button type="button" class="Share-Sheet-User" data-share-user-id="${escapeHtml(u.id)}">
            <span class="Share-Sheet-User-Avatar">
                <img src="${escapeHtml(u.avatar)}" alt="${escapeHtml(u.name)}" />
            </span>
            <span class="Share-Sheet-User-Body">
                <span class="Share-Sheet-User-Name">${escapeHtml(u.name)}</span>
                <span class="Share-Sheet-User-Handle">${escapeHtml(u.handle)}</span>
            </span>
        </button>`,
            )
            .join("");
    }

    function openShareChatModal(menuEl) {
        closeShareMenu(menuEl);
        closeShareModal({ restorePath: false });
        pushSharePath("/messages/compose");

        const modal = document.createElement("div");
        modal.className = "Share-Sheet";
        modal.innerHTML = `
        <div class="Share-Sheet-Backdrop" data-share-close="true"></div>
        <div class="Share-Sheet-Card" role="dialog" aria-modal="true" aria-labelledby="share-chat-title">
            <div class="Share-Sheet-Header">
                <button type="button" class="Share-Sheet-Icon-Btn" data-share-close="true" aria-label="돌아가기">
                    <svg viewBox="0 0 24 24" aria-hidden="true"><g><path d="M7.414 13l5.043 5.04-1.414 1.42L3.586 12l7.457-7.46 1.414 1.42L7.414 11H21v2H7.414z"></path></g></svg>
                </button>
                <h2 id="share-chat-title" class="Share-Sheet-Title">공유하기</h2>
                <span class="Share-Sheet-Header-Spacer"></span>
            </div>
            <div class="Share-Sheet-Search">
                <input type="text" class="Share-Sheet-Search-Input" placeholder="검색" aria-label="검색" />
            </div>
            <div class="Share-Sheet-List">${getShareUserRows()}</div>
        </div>`;

        modal.addEventListener("click", (e) => {
            if (
                e.target.closest("[data-share-close='true']") ||
                e.target.classList.contains("Share-Sheet-Backdrop") ||
                e.target.closest(".Share-Sheet-User")
            ) {
                e.preventDefault();
                closeShareModal();
            }
        });

        document.body.appendChild(modal);
        document.body.classList.add("modal-open");
        activeShareModal = modal;
    }

    // --- 폴더에 북마크 추가하기 ---
    function openShareBookmarkModal(menuEl) {
        const { bookmarkButton } = getSharePostMeta(menuEl);
        closeShareMenu(menuEl);
        closeShareModal({ restorePath: false });
        pushSharePath("/i/bookmarks/add");

        const isBookmarked =
            bookmarkButton?.classList.contains("active") ?? false;
        const modal = document.createElement("div");
        modal.className = "Share-Sheet";
        modal.innerHTML = `
        <div class="Share-Sheet-Backdrop" data-share-close="true"></div>
        <div class="Share-Sheet-Card Share-Sheet-Card--Bookmark" role="dialog" aria-modal="true" aria-labelledby="share-bookmark-title">
            <div class="Share-Sheet-Header">
                <button type="button" class="Share-Sheet-Icon-Btn" data-share-close="true" aria-label="닫기">
                    <svg viewBox="0 0 24 24" aria-hidden="true"><g><path d="M10.59 12 4.54 5.96l1.42-1.42L12 10.59l6.04-6.05 1.42 1.42L13.41 12l6.05 6.04-1.42 1.42L12 13.41l-6.04 6.05-1.42-1.42L10.59 12z"></path></g></svg>
                </button>
                <h2 id="share-bookmark-title" class="Share-Sheet-Title">폴더에 추가</h2>
                <span class="Share-Sheet-Header-Spacer"></span>
            </div>
            <button type="button" class="Share-Sheet-Create-Folder">새 북마크 폴더 만들기</button>
            <button type="button" class="Share-Sheet-Folder" data-share-folder="all-bookmarks">
                <span class="Share-Sheet-Folder-Icon">
                    <svg viewBox="0 0 24 24" aria-hidden="true"><g><path d="M2.998 8.5c0-1.38 1.119-2.5 2.5-2.5h9c1.381 0 2.5 1.12 2.5 2.5v14.12l-7-3.5-7 3.5V8.5zM18.5 2H8.998v2H18.5c.275 0 .5.224.5.5V15l2 1.4V4.5c0-1.38-1.119-2.5-2.5-2.5z"></path></g></svg>
                </span>
                <span class="Share-Sheet-Folder-Name">모든 북마크</span>
                <span class="Share-Sheet-Folder-Check${isBookmarked ? " Share-Sheet-Folder-Check--Active" : ""}">
                    <svg viewBox="0 0 24 24" aria-hidden="true"><g><path d="M9.64 18.952l-5.55-4.861 1.317-1.504 3.951 3.459 8.459-10.948L19.4 6.32 9.64 18.952z"></path></g></svg>
                </span>
            </button>
        </div>`;

        modal.addEventListener("click", (e) => {
            if (
                e.target.closest("[data-share-close='true']") ||
                e.target.classList.contains("Share-Sheet-Backdrop")
            ) {
                e.preventDefault();
                closeShareModal();
                return;
            }
            if (e.target.closest(".Share-Sheet-Create-Folder")) {
                e.preventDefault();
                closeShareModal();
                return;
            }
            if (e.target.closest("[data-share-folder='all-bookmarks']")) {
                e.preventDefault();
                setBookmarkButtonState(bookmarkButton, !isBookmarked);
                closeShareModal();
            }
        });

        document.body.appendChild(modal);
        document.body.classList.add("modal-open");
        activeShareModal = modal;
    }

    // --- Events ---

    // .Post-More-Menu.Share 내 버튼 클릭 이벤트
    document.querySelectorAll(".Post-More-Menu.Share").forEach((menuEl) => {
        menuEl.addEventListener("click", (e) => {
            const btn = e.target.closest(".Menu-Button");
            if (!btn) return;
            e.preventDefault();
            e.stopPropagation();

            const text = btn.querySelector(".Button-Text")?.textContent.trim();
            if (text === "링크 복사하기") {
                copyShareLink(menuEl);
            } else if (text === "Chat으로 전송하기") {
                openShareChatModal(menuEl);
            } else if (text === "폴더에 북마크 추가하기") {
                openShareBookmarkModal(menuEl);
            }
        });
    });

    // Escape 키로 공유 모달을 닫는다
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") closeShareModal();
    });

    document.querySelector(".Profile-Tab-Item.Posts").click();
};
