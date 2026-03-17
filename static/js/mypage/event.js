// Notification event.js를 마이페이지용으로 이식
// 핵심 변경사항:
//   - populateReplyModal: .notif-tweet-item → .Post-Card 기반으로 정보 추출
//   - openReplyModal trigger: [data-testid='reply'] → .Post-Action-Btn.Reply
//   - 판매글 선택 버튼/서브뷰: Notification HTML의 [data-product-select-modal] 구조 그대로 유지
// 나머지 로직(이모지, 첨부파일, 위치, 태그, 임시저장, 공유 등)은 Notification event.js 100% 동일

window.onload = function () {
    // ===== 1. DOM =====
    const replyModalOverlay = document.querySelector("[data-reply-modal]");
    const q = (sel) => replyModalOverlay?.querySelector(sel);
    const qAll = (sel) => replyModalOverlay?.querySelectorAll(sel) ?? [];

    const replyModal = q(".tweet-modal");
    const replyCloseButton = q(".tweet-modal__close");
    const replyEditor = q(".tweet-modal__editor");
    const replySubmitButton = q(".tweet-modal__submit");
    const replyGauge = q("#replyGauge");
    const replyGaugeText = q("#replyGaugeText");
    const replyProductButton = q("[data-testid='productSelectButton']");
    const replyProductView = q("[data-product-select-modal]");
    const productSelectClose = replyProductView?.querySelector(
        "[data-product-select-close]",
    );
    const productSelectList = replyProductView?.querySelector(
        "[data-product-select-list]",
    );
    const productSelectComplete = replyProductView?.querySelector(
        "[data-product-select-complete]",
    );
    const productSelectEmpty = replyProductView?.querySelector(
        "[data-product-empty]",
    );
    const replyContextButton = q(".tweet-modal__context-button");
    const replyFooterMeta = q(".tweet-modal__footer-meta");
    const replySourceAvatar = q(".tweet-modal__source-avatar");
    const replySourceName = q(".tweet-modal__source-name");
    const replySourceHandle = q(".tweet-modal__source-handle");
    const replySourceTime = q(".tweet-modal__source-time");
    const replySourceText = q(".tweet-modal__source-text");
    const replyFormatButtons = qAll("[data-format]");
    const replyEmojiButton = q("[data-testid='emojiButton']");
    const replyEmojiPicker = q(".tweet-modal__emoji-picker");
    const replyEmojiSearchInput = q("[data-testid='emojiSearchInput']");
    const replyEmojiTabs = qAll(".tweet-modal__emoji-tab");
    const replyEmojiContent = q("[data-testid='emojiPickerContent']");
    const replyMediaUploadButton = q("[data-testid='mediaUploadButton']");
    const replyFileInput = q("[data-testid='fileInput']");
    const replyAttachmentPreview = q("[data-attachment-preview]");
    const replyAttachmentMedia = q("[data-attachment-media]");
    const composeView = q(".tweet-modal__compose-view");
    const replyGeoButton = q("[data-testid='geoButton']");
    const replyGeoButtonPath = replyGeoButton?.querySelector("path");
    const replyLocationDisplayButton = q("[data-location-display]");
    const replyLocationName = q("[data-location-name]");
    const replyLocationView = q(".tweet-modal__location-view");
    const replyLocationCloseButton = q(".tweet-modal__location-close");
    const replyLocationDeleteButton = q("[data-location-delete]");
    const replyLocationCompleteButton = q("[data-location-complete]");
    const replyLocationSearchInput = q("[data-location-search]");
    const replyLocationList = q("[data-location-list]");
    const replyUserTagTrigger = q("[data-user-tag-trigger]");
    const replyUserTagLabel = q("[data-user-tag-label]");
    const replyTagView = q(".tweet-modal__tag-view");
    const replyTagCloseButton = q("[data-testid='tag-back']");
    const replyTagCompleteButton = q("[data-tag-complete]");
    const replyTagSearchForm = q("[data-tag-search-form]");
    const replyTagSearchInput = q("[data-tag-search]");
    const replyTagChipList = q("[data-tag-chip-list]");
    const replyTagResults = q("[data-tag-results]");
    const replyMediaAltTrigger = q("[data-media-alt-trigger]");
    const replyMediaAltLabel = q("[data-media-alt-label]");
    const replyMediaView = q(".tweet-modal__media-view");
    const replyMediaBackButton = q("[data-testid='media-back']");
    const replyMediaPrevButton = q("[data-media-prev]");
    const replyMediaNextButton = q("[data-media-next]");
    const replyMediaSaveButton = q("[data-media-save]");
    const replyMediaTitle = q("[data-media-title]");
    const replyMediaPreviewImages = qAll("[data-media-preview-image]");
    const replyMediaAltInput = q("[data-media-alt-input]");
    const replyMediaAltCount = q("[data-media-alt-count]");

    // ===== 2. State =====
    let activeReplyTrigger = null,
        savedReplySelection = null,
        savedReplySelectionOffsets = null;
    let pendingReplyFormats = new Set(),
        activeEmojiCategory = "recent";
    let selectedLocation = null,
        pendingLocation = null;
    let selectedTaggedUsers = [],
        pendingTaggedUsers = [];
    let replyMediaEdits = [],
        pendingReplyMediaEdits = [],
        activeReplyMediaIndex = 0;
    let attachedReplyFiles = [],
        attachedReplyFileUrls = [];
    let pendingAttachmentEditIndex = null,
        currentTagResults = [],
        cachedLocationNames = [];
    let replyEmojiLibraryPicker = null;
    let shouldRestoreReplyEditorAfterEmojiInsert = false;
    let isInsertingReplyEmoji = false;
    let selectedProduct = null;

    const maxReplyImages = 4,
        maxReplyMediaAltLength = 1000,
        replyMaxLength = 500;
    const emojiRecentsKey = "mypage_reply_recent_emojis";
    const maxRecentEmojis = 18;

    // ===== 3. Config =====
    const emojiCategoryMeta = {
        recent: {
            label: "최근",
            sectionTitle: "최근",
            icon: '<svg viewBox="0 0 24 24" aria-hidden="true" class="tweet-modal__emoji-tab-icon"><g><path d="M12 1.75A10.25 10.25 0 112.75 12 10.26 10.26 0 0112 1.75zm0 1.5A8.75 8.75 0 1020.75 12 8.76 8.76 0 0012 3.25zm.75 3.5v5.19l3.03 1.75-.75 1.3-3.78-2.18V6.75h1.5z"></path></g></svg>',
        },
        smileys: {
            label: "스마일리 및 사람",
            sectionTitle: "스마일리 및 사람",
            icon: '<svg viewBox="0 0 24 24" aria-hidden="true" class="tweet-modal__emoji-tab-icon"><g><path d="M12 22.75C6.072 22.75 1.25 17.928 1.25 12S6.072 1.25 12 1.25 22.75 6.072 22.75 12 17.928 22.75 12 22.75zm0-20c-5.109 0-9.25 4.141-9.25 9.25s4.141 9.25 9.25 9.25 9.25-4.141 9.25-9.25S17.109 2.75 12 2.75zM9 11.75c-.69 0-1.25-.56-1.25-1.25S8.31 9.25 9 9.25s1.25.56 1.25 1.25S9.69 11.75 9 11.75zm6 0c-.69 0-1.25-.56-1.25-1.25S14.31 9.25 15 9.25s1.25.56 1.25 1.25S15.69 11.75 15 11.75zm-8.071 3.971c.307-.298.771-.397 1.188-.253.953.386 2.403.982 3.883.982s2.93-.596 3.883-.982c.417-.144.88-.044 1.188.253a.846.846 0 01-.149 1.34c-1.254.715-3.059 1.139-4.922 1.139s-3.668-.424-4.922-1.139a.847.847 0 01-.149-1.39z"></path></g></svg>',
        },
        animals: {
            label: "동물 및 자연",
            sectionTitle: "동물 및 자연",
            icon: '<svg viewBox="0 0 24 24" aria-hidden="true" class="tweet-modal__emoji-tab-icon"><g><path d="M12 3.5c3.77 0 6.75 2.86 6.75 6.41 0 3.17-1.88 4.94-4.15 6.28-.74.44-1.54.9-1.6 1.86-.02.38-.33.68-.71.68h-.6a.71.71 0 01-.71-.67c-.07-.95-.86-1.42-1.6-1.85C7.13 14.85 5.25 13.08 5.25 9.91 5.25 6.36 8.23 3.5 12 3.5z"></path></g></svg>',
        },
        food: {
            label: "음식 및 음료",
            sectionTitle: "음식 및 음료",
            icon: '<svg viewBox="0 0 24 24" aria-hidden="true" class="tweet-modal__emoji-tab-icon"><g><path d="M5 10.5c0-3.59 3.36-6.5 7.5-6.5s7.5 2.91 7.5 6.5v.58a5.42 5.42 0 01-2.08 4.26L16.5 21H8.5l-1.42-5.66A5.42 5.42 0 015 11.08v-.58z"></path></g></svg>',
        },
        activities: {
            label: "활동",
            sectionTitle: "활동",
            icon: '<svg viewBox="0 0 24 24" aria-hidden="true" class="tweet-modal__emoji-tab-icon"><g><path d="M12 2.25c5.385 0 9.75 4.365 9.75 9.75S17.385 21.75 12 21.75 2.25 17.385 2.25 12 6.615 2.25 12 2.25z"></path></g></svg>',
        },
        travel: {
            label: "여행 및 장소",
            sectionTitle: "여행 및 장소",
            icon: '<svg viewBox="0 0 24 24" aria-hidden="true" class="tweet-modal__emoji-tab-icon"><g><path d="M12 2.25c-4.142 0-7.5 3.245-7.5 7.248 0 5.207 6.46 11.611 6.735 11.881a1.08 1.08 0 001.53 0c.275-.27 6.735-6.674 6.735-11.881 0-4.003-3.358-7.248-7.5-7.248z"></path></g></svg>',
        },
        objects: {
            label: "사물",
            sectionTitle: "사물",
            icon: '<svg viewBox="0 0 24 24" aria-hidden="true" class="tweet-modal__emoji-tab-icon"><g><path d="M12 2.5c2.07 0 3.75 1.68 3.75 3.75 0 1.45-.83 2.71-2.04 3.33l-.21.11V11h.5A2.5 2.5 0 0116.5 13.5v1.38c0 1.27-.7 2.43-1.82 3.03l-.93.5V21.5h-3.5v-3.09l-.93-.5A3.44 3.44 0 017.5 14.88V13.5A2.5 2.5 0 0110 11h.5V9.69l-.21-.11A3.75 3.75 0 018.25 6.25 3.75 3.75 0 0112 2.5z"></path></g></svg>',
        },
        symbols: {
            label: "기호",
            sectionTitle: "기호",
            icon: '<svg viewBox="0 0 24 24" aria-hidden="true" class="tweet-modal__emoji-tab-icon"><g><path d="M5 4h14v4.5h-2V6H7v2.5H5V4zm2 6h4v4H7v-4zm6 0h4v4h-4v-4zM5 16h6v4H5v-4zm8 0h6v4h-6v-4z"></path></g></svg>',
        },
        flags: {
            label: "깃발",
            sectionTitle: "깃발",
            icon: '<svg viewBox="0 0 24 24" aria-hidden="true" class="tweet-modal__emoji-tab-icon"><g><path d="M6 2.75A.75.75 0 016.75 2h.5a.75.75 0 01.75.75V3h9.38c.97 0 1.45 1.17.76 1.85L16.1 6.9l2.05 2.05c.69.68.21 1.85-.76 1.85H8v10.45a.75.75 0 01-.75.75h-.5a.75.75 0 01-.75-.75V2.75z"></path></g></svg>',
        },
    };
    const emojiCategoryData = {
        smileys: [
            "😀",
            "😃",
            "😄",
            "😁",
            "😆",
            "🥹",
            "😂",
            "🤣",
            "😊",
            "😉",
            "😍",
            "🥰",
            "😘",
            "😗",
            "😙",
            "😚",
            "🙂",
            "🤗",
            "🤩",
            "🤔",
            "😐",
            "😑",
            "😌",
            "🙃",
            "😏",
            "🥳",
            "😭",
            "😤",
            "😴",
            "😵",
            "🤯",
            "😎",
            "🤓",
            "🫠",
            "😇",
            "🤠",
        ],
        animals: [
            "🐶",
            "🐱",
            "🐻",
            "🐼",
            "🐨",
            "🐯",
            "🦁",
            "🐮",
            "🐷",
            "🐸",
            "🐵",
            "🐧",
            "🐦",
            "🦄",
            "🐝",
            "🦋",
            "🌸",
            "🌻",
            "🍀",
            "🌿",
            "🌈",
            "🌞",
            "⭐",
            "🌙",
        ],
        food: [
            "🍔",
            "🍟",
            "🍕",
            "🌭",
            "🍗",
            "🍜",
            "🍣",
            "🍩",
            "🍪",
            "🍫",
            "🍿",
            "🥐",
            "🍎",
            "🍓",
            "🍉",
            "🍇",
            "☕",
            "🍵",
            "🧃",
            "🥤",
            "🍺",
            "🍷",
        ],
        activities: [
            "⚽",
            "🏀",
            "🏈",
            "⚾",
            "🎾",
            "🏐",
            "🎮",
            "🎲",
            "🎯",
            "🎳",
            "🎸",
            "🎧",
            "🎬",
            "📚",
            "🧩",
            "🏆",
            "🥇",
            "🏃",
            "🚴",
            "🏊",
        ],
        travel: [
            "🚗",
            "🚕",
            "🚌",
            "🚎",
            "🚓",
            "🚑",
            "✈️",
            "🚀",
            "🛸",
            "🚲",
            "⛵",
            "🚉",
            "🏠",
            "🏙️",
            "🌋",
            "🏝️",
            "🗼",
            "🗽",
            "🎡",
            "🌁",
        ],
        objects: [
            "💡",
            "📱",
            "💻",
            "⌚",
            "📷",
            "🎥",
            "🕹️",
            "💰",
            "💎",
            "🔑",
            "🪄",
            "🎁",
            "📌",
            "🧸",
            "🛒",
            "🧴",
            "💊",
            "🧯",
            "📢",
            "🧠",
        ],
        symbols: [
            "❤️",
            "💙",
            "💚",
            "💛",
            "💜",
            "🖤",
            "✨",
            "💫",
            "💥",
            "💯",
            "✔️",
            "❌",
            "⚠️",
            "🔔",
            "♻️",
            "➕",
            "➖",
            "➗",
            "✖️",
            "🔣",
        ],
        flags: [
            "🏳️",
            "🏴",
            "🏁",
            "🚩",
            "🎌",
            "🏳️‍🌈",
            "🇰🇷",
            "🇺🇸",
            "🇯🇵",
            "🇫🇷",
            "🇬🇧",
            "🇩🇪",
            "🇨🇦",
            "🇦🇺",
        ],
    };
    const formatButtonLabels = {
        bold: {
            inactive: "굵게, (CTRL+B) 님",
            active: "굵게, 활성 상태, (CTRL+B) 님 님",
        },
        italic: {
            inactive: "기울임꼴, (CTRL+I) 님",
            active: "기울임꼴, 활성 상태, (CTRL+I) 님 님",
        },
    };

    // ===== 4. Utils =====
    function getTextContent(el) {
        return el?.textContent.trim() ?? "";
    }
    function escapeHtml(value) {
        return String(value).replace(
            /[&<>"']/g,
            (c) =>
                ({
                    "&": "&amp;",
                    "<": "&lt;",
                    ">": "&gt;",
                    '"': "&quot;",
                    "'": "&#39;",
                })[c] ?? c,
        );
    }
    function getRecentEmojis() {
        try {
            const s = window.localStorage.getItem(emojiRecentsKey);
            const p = s ? JSON.parse(s) : [];
            return Array.isArray(p) ? p : [];
        } catch {
            return [];
        }
    }
    function saveRecentEmoji(emoji) {
        const r = getRecentEmojis().filter((i) => i !== emoji);
        r.unshift(emoji);
        try {
            window.localStorage.setItem(
                emojiRecentsKey,
                JSON.stringify(r.slice(0, maxRecentEmojis)),
            );
        } catch {
            return;
        }
    }
    function clearRecentEmojis() {
        try {
            window.localStorage.removeItem(emojiRecentsKey);
        } catch {
            return;
        }
    }
    function getEmojiSearchTerm() {
        return replyEmojiSearchInput?.value.trim().toLowerCase() ?? "";
    }
    function getEmojiEntriesForCategory(category) {
        if (category === "recent")
            return getRecentEmojis().map((emoji) => ({
                emoji,
                keywords: [emoji],
            }));
        return (emojiCategoryData[category] ?? []).map((emoji) => ({
            emoji,
            keywords: [emoji, emojiCategoryMeta[category]?.label ?? ""],
        }));
    }
    function getFilteredEmojiEntries(category) {
        const entries = getEmojiEntriesForCategory(category);
        const term = getEmojiSearchTerm();
        if (!term) return entries;
        return entries.filter((e) =>
            e.keywords.some((k) => k.toLowerCase().includes(term)),
        );
    }
    function buildEmojiSection(
        title,
        emojis,
        { clearable = false, emptyText = "" } = {},
    ) {
        const headerAction = clearable
            ? '<button type="button" class="tweet-modal__emoji-clear" data-action="clear-recent">모두 지우기</button>'
            : "";
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
            const sections = Object.keys(emojiCategoryData)
                .map((cat) => {
                    const entries = getFilteredEmojiEntries(cat);
                    return entries.length === 0
                        ? ""
                        : buildEmojiSection(
                              emojiCategoryMeta[cat].sectionTitle,
                              entries.map((e) => e.emoji),
                          );
                })
                .join("");
            replyEmojiContent.innerHTML =
                sections ||
                buildEmojiSection("검색 결과", [], {
                    emptyText: "일치하는 이모티콘이 없습니다.",
                });
            return;
        }
        if (activeEmojiCategory === "recent") {
            const recent = getRecentEmojis();
            replyEmojiContent.innerHTML =
                buildEmojiSection("최근", recent, {
                    clearable: recent.length > 0,
                    emptyText: "최근 사용한 이모티콘이 없습니다.",
                }) +
                buildEmojiSection(
                    emojiCategoryMeta.smileys.sectionTitle,
                    getEmojiEntriesForCategory("smileys").map((e) => e.emoji),
                );
            return;
        }
        replyEmojiContent.innerHTML = buildEmojiSection(
            emojiCategoryMeta[activeEmojiCategory].sectionTitle,
            getEmojiEntriesForCategory(activeEmojiCategory).map((e) => e.emoji),
        );
    }
    function renderEmojiPicker() {
        renderEmojiTabs();
        renderEmojiPickerContent();
    }

    // ===== 4-1. User Tags =====
    function cloneTaggedUsers(users) {
        return users.map((u) => ({ ...u }));
    }

    // [마이페이지 전용] .Post-Card 기준으로 태그 가능 사용자 추출
    function getCurrentPageTagUsers() {
        const cards = document.querySelectorAll(".Post-Card");
        const seen = new Set();
        return Array.from(cards)
            .map((card, i) => {
                const name = getTextContent(card.querySelector(".Post-Name"));
                const handle = getTextContent(
                    card.querySelector(".Post-Handle"),
                );
                const avatar =
                    card
                        .querySelector(".Post-Avatar-Img")
                        ?.getAttribute("src") ?? "";
                if (!name || !handle || seen.has(handle)) return null;
                seen.add(handle);
                return {
                    id: `${handle.replace("@", "") || "user"}-${i}`,
                    name,
                    handle,
                    avatar,
                };
            })
            .filter(Boolean);
    }

    function isTagModalOpen() {
        return Boolean(replyTagView && !replyTagView.hidden);
    }
    function getTagSearchTerm() {
        return replyTagSearchInput?.value.trim() ?? "";
    }
    function getTaggedUserSummary(users) {
        return users.length === 0
            ? "사용자 태그하기"
            : users.map((u) => u.name).join(", ");
    }
    function syncUserTagTrigger() {
        const can = isReplyImageSet();
        const label = getTaggedUserSummary(selectedTaggedUsers);
        if (replyUserTagTrigger) {
            replyUserTagTrigger.hidden = !can;
            replyUserTagTrigger.disabled = !can;
            replyUserTagTrigger.setAttribute("aria-label", label);
        }
        if (replyUserTagLabel) replyUserTagLabel.textContent = label;
        if (!can && isTagModalOpen()) closeTagPanel({ restoreFocus: false });
    }
    function renderTagChipList() {
        if (!replyTagChipList) return;
        if (pendingTaggedUsers.length === 0) {
            replyTagChipList.innerHTML = "";
            return;
        }
        replyTagChipList.innerHTML = pendingTaggedUsers
            .map((u) => {
                const av = u.avatar
                    ? `<span class="tweet-modal__tag-chip-avatar"><img src="${escapeHtml(u.avatar)}" alt="${escapeHtml(u.name)}" /></span>`
                    : '<span class="tweet-modal__tag-chip-avatar"></span>';
                return `<button type="button" class="tweet-modal__tag-chip" data-tag-remove-id="${escapeHtml(u.id)}">${av}<span class="tweet-modal__tag-chip-name">${escapeHtml(u.name)}</span><svg viewBox="0 0 24 24" aria-hidden="true" class="tweet-modal__tag-chip-icon"><g><path d="M10.59 12 4.54 5.96l1.42-1.42L12 10.59l6.04-6.05 1.42 1.42L13.41 12l6.05 6.04-1.42 1.42L12 13.41l-6.04 6.05-1.42-1.42L10.59 12z"></path></g></svg></button>`;
            })
            .join("");
    }
    function getFilteredTagUsers(query) {
        const nq = query.trim().toLowerCase();
        if (!nq) return [];
        return getCurrentPageTagUsers()
            .filter((u) => `${u.name} ${u.handle}`.toLowerCase().includes(nq))
            .slice(0, 6);
    }
    function renderTagResults(users) {
        if (!replyTagResults || !replyTagSearchInput) return;
        currentTagResults = users;
        const hasQuery = getTagSearchTerm().length > 0;
        if (!hasQuery) {
            replyTagSearchInput.setAttribute("aria-expanded", "false");
            replyTagSearchInput.removeAttribute("aria-controls");
            replyTagResults.removeAttribute("role");
            replyTagResults.removeAttribute("id");
            replyTagResults.innerHTML = "";
            return;
        }
        replyTagSearchInput.setAttribute("aria-expanded", "true");
        replyTagSearchInput.setAttribute("aria-controls", "mypage-tag-results");
        replyTagResults.setAttribute("role", "listbox");
        replyTagResults.id = "mypage-tag-results";
        if (users.length === 0) {
            replyTagResults.innerHTML =
                '<p class="tweet-modal__tag-empty">일치하는 사용자를 찾지 못했습니다.</p>';
            return;
        }
        replyTagResults.innerHTML = users
            .map((u) => {
                const sel = pendingTaggedUsers.some((t) => t.id === u.id);
                const sub = sel ? `${u.handle} 이미 태그됨` : u.handle;
                const av = u.avatar
                    ? `<span class="tweet-modal__tag-avatar"><img src="${escapeHtml(u.avatar)}" alt="${escapeHtml(u.name)}" /></span>`
                    : '<span class="tweet-modal__tag-avatar"></span>';
                return `<div role="option" class="tweet-modal__tag-option" data-testid="typeaheadResult"><div role="checkbox" aria-checked="${sel}" aria-disabled="${sel}" class="tweet-modal__tag-checkbox"><button type="button" class="tweet-modal__tag-user" data-tag-user-id="${escapeHtml(u.id)}" ${sel ? "disabled" : ""}>${av}<span class="tweet-modal__tag-user-body"><span class="tweet-modal__tag-user-name">${escapeHtml(u.name)}</span><span class="tweet-modal__tag-user-handle">${escapeHtml(sub)}</span></span></button></div></div>`;
            })
            .join("");
    }
    function runTagSearch() {
        const tq = getTagSearchTerm();
        renderTagResults(tq ? getFilteredTagUsers(tq) : []);
    }
    function openTagPanel() {
        if (!composeView || !replyTagView || !isReplyImageSet()) return;
        closeEmojiPicker();
        pendingTaggedUsers = cloneTaggedUsers(selectedTaggedUsers);
        composeView.hidden = true;
        replyTagView.hidden = false;
        if (replyTagSearchInput) replyTagSearchInput.value = "";
        renderTagChipList();
        renderTagResults([]);
        window.requestAnimationFrame(() => {
            replyTagSearchInput?.focus();
        });
    }
    function closeTagPanel({ restoreFocus = true } = {}) {
        if (!composeView || !replyTagView || replyTagView.hidden) return;
        replyTagView.hidden = true;
        composeView.hidden = false;
        pendingTaggedUsers = cloneTaggedUsers(selectedTaggedUsers);
        if (replyTagSearchInput) replyTagSearchInput.value = "";
        renderTagChipList();
        renderTagResults([]);
        if (restoreFocus)
            window.requestAnimationFrame(() => {
                (replyUserTagTrigger && !replyUserTagTrigger.hidden
                    ? replyUserTagTrigger
                    : replyEditor
                )?.focus();
            });
    }
    function applyPendingTaggedUsers() {
        selectedTaggedUsers = cloneTaggedUsers(pendingTaggedUsers);
        syncUserTagTrigger();
    }
    function resetTaggedUsers() {
        selectedTaggedUsers = [];
        pendingTaggedUsers = [];
        if (replyTagSearchInput) replyTagSearchInput.value = "";
        renderTagChipList();
        renderTagResults([]);
        syncUserTagTrigger();
    }

    // ===== 4-2. Media Alt Editor =====
    function createDefaultReplyMediaEdit() {
        return { alt: "" };
    }
    function cloneReplyMediaEdits(edits) {
        return edits.map((e) => ({ alt: e.alt }));
    }
    function isMediaEditorOpen() {
        return Boolean(replyMediaView && !replyMediaView.hidden);
    }
    function getReplyMediaTriggerLabel() {
        return replyMediaEdits.some((e) => e.alt.trim().length > 0)
            ? "설명 수정"
            : "설명 추가";
    }
    function syncReplyMediaEditsToAttachments() {
        if (!isReplyImageSet()) {
            replyMediaEdits = [];
            pendingReplyMediaEdits = [];
            activeReplyMediaIndex = 0;
            syncMediaAltTrigger();
            return;
        }
        replyMediaEdits = attachedReplyFiles.map((_, i) => {
            const ex = replyMediaEdits[i];
            return ex ? { alt: ex.alt ?? "" } : createDefaultReplyMediaEdit();
        });
        if (pendingReplyMediaEdits.length !== replyMediaEdits.length)
            pendingReplyMediaEdits = cloneReplyMediaEdits(replyMediaEdits);
        activeReplyMediaIndex = Math.min(
            activeReplyMediaIndex,
            Math.max(replyMediaEdits.length - 1, 0),
        );
        syncMediaAltTrigger();
    }
    function getCurrentReplyMediaUrl() {
        return attachedReplyFileUrls[activeReplyMediaIndex] ?? "";
    }
    function getReplyMediaImageAlt(index) {
        return replyMediaEdits[index]?.alt ?? "";
    }
    function getCurrentPendingReplyMediaEdit() {
        return (
            pendingReplyMediaEdits[activeReplyMediaIndex] ??
            createDefaultReplyMediaEdit()
        );
    }
    function syncMediaAltTrigger() {
        const can = isReplyImageSet();
        const label = getReplyMediaTriggerLabel();
        if (replyMediaAltTrigger) {
            replyMediaAltTrigger.hidden = !can;
            replyMediaAltTrigger.disabled = !can;
            replyMediaAltTrigger.setAttribute("aria-label", label);
        }
        if (replyMediaAltLabel) replyMediaAltLabel.textContent = label;
        if (!can && isMediaEditorOpen())
            closeMediaEditor({ restoreFocus: false, discardChanges: true });
    }
    function renderMediaEditor() {
        if (!replyMediaView || pendingReplyMediaEdits.length === 0) return;
        const edit = getCurrentPendingReplyMediaEdit();
        const url = getCurrentReplyMediaUrl();
        const alt = edit.alt ?? "";
        if (replyMediaTitle) replyMediaTitle.textContent = "이미지 설명 수정";
        if (replyMediaPrevButton)
            replyMediaPrevButton.disabled = activeReplyMediaIndex === 0;
        if (replyMediaNextButton)
            replyMediaNextButton.disabled =
                activeReplyMediaIndex >= pendingReplyMediaEdits.length - 1;
        replyMediaPreviewImages.forEach((img) => {
            img.src = url;
            img.alt = alt;
            img.style.transform = "";
        });
        if (replyMediaAltInput) replyMediaAltInput.value = alt;
        if (replyMediaAltCount)
            replyMediaAltCount.textContent = `${alt.length} / ${maxReplyMediaAltLength.toLocaleString()}`;
    }
    function openMediaEditor() {
        if (!composeView || !replyMediaView || !isReplyImageSet()) return;
        closeEmojiPicker();
        pendingReplyMediaEdits = cloneReplyMediaEdits(replyMediaEdits);
        activeReplyMediaIndex = 0;
        composeView.hidden = true;
        replyMediaView.hidden = false;
        renderMediaEditor();
        window.requestAnimationFrame(() => {
            replyMediaAltInput?.focus();
        });
    }
    function closeMediaEditor({
        restoreFocus = true,
        discardChanges = true,
    } = {}) {
        if (!composeView || !replyMediaView || replyMediaView.hidden) return;
        if (discardChanges)
            pendingReplyMediaEdits = cloneReplyMediaEdits(replyMediaEdits);
        replyMediaView.hidden = true;
        composeView.hidden = false;
        if (restoreFocus)
            window.requestAnimationFrame(() => {
                (replyMediaAltTrigger && !replyMediaAltTrigger.hidden
                    ? replyMediaAltTrigger
                    : replyEditor
                )?.focus();
            });
    }
    function saveReplyMediaEdits() {
        replyMediaEdits = cloneReplyMediaEdits(pendingReplyMediaEdits);
        renderReplyAttachment();
        syncMediaAltTrigger();
        closeMediaEditor({ discardChanges: false });
    }

    // ===== 4-3. Location =====
    function isLocationModalOpen() {
        return Boolean(replyLocationView && !replyLocationView.hidden);
    }
    function getLocationSearchTerm() {
        return replyLocationSearchInput?.value.trim() ?? "";
    }
    function getFilteredLocations() {
        const term = getLocationSearchTerm();
        if (cachedLocationNames.length === 0 && replyLocationList) {
            cachedLocationNames = Array.from(
                replyLocationList.querySelectorAll(
                    ".tweet-modal__location-item-label",
                ),
            )
                .map((i) => getTextContent(i))
                .filter(Boolean);
        }
        return term
            ? cachedLocationNames.filter((l) => l.includes(term))
            : cachedLocationNames;
    }
    function syncLocationUI() {
        const has = Boolean(selectedLocation);
        if (replyFooterMeta) replyFooterMeta.hidden = !has;
        if (replyLocationName)
            replyLocationName.textContent = selectedLocation ?? "";
        if (replyLocationDisplayButton) {
            replyLocationDisplayButton.hidden = !has;
            replyLocationDisplayButton.setAttribute(
                "aria-label",
                has ? `위치 ${selectedLocation}` : "위치 태그하기",
            );
        }
        if (replyGeoButton) {
            replyGeoButton.hidden = false;
            replyGeoButton.setAttribute(
                "aria-label",
                has ? `위치 태그하기, ${selectedLocation}` : "위치 태그하기",
            );
        }
        if (replyGeoButtonPath) {
            const np = has
                ? replyGeoButtonPath.dataset.pathActive
                : replyGeoButtonPath.dataset.pathInactive;
            if (np) replyGeoButtonPath.setAttribute("d", np);
        }
        if (replyLocationDeleteButton) replyLocationDeleteButton.hidden = !has;
        if (replyLocationCompleteButton)
            replyLocationCompleteButton.disabled = !pendingLocation;
    }
    function renderLocationList() {
        if (!replyLocationList) return;
        const locs = getFilteredLocations();
        if (locs.length === 0) {
            replyLocationList.innerHTML =
                '<p class="tweet-modal__location-empty">일치하는 위치를 찾지 못했습니다.</p>';
            return;
        }
        replyLocationList.innerHTML = locs
            .map((loc) => {
                const sel = pendingLocation === loc;
                return `<button type="button" class="tweet-modal__location-item" role="menuitem"><span class="tweet-modal__location-item-label">${loc}</span><span class="tweet-modal__location-item-check">${sel ? '<svg viewBox="0 0 24 24" aria-hidden="true"><g><path d="M9.64 18.952l-5.55-4.861 1.317-1.504 3.951 3.459 8.459-10.948L19.4 6.32 9.64 18.952z"></path></g></svg>' : ""}</span></button>`;
            })
            .join("");
    }
    function openLocationPanel() {
        if (!composeView || !replyLocationView) return;
        closeEmojiPicker();
        pendingLocation = selectedLocation;
        composeView.hidden = true;
        replyLocationView.hidden = false;
        if (replyLocationSearchInput) replyLocationSearchInput.value = "";
        renderLocationList();
        syncLocationUI();
        window.requestAnimationFrame(() => {
            replyLocationSearchInput?.focus();
        });
    }
    function closeLocationPanel({ restoreFocus = true } = {}) {
        if (!composeView || !replyLocationView || replyLocationView.hidden)
            return;
        replyLocationView.hidden = true;
        composeView.hidden = false;
        if (replyLocationSearchInput) replyLocationSearchInput.value = "";
        pendingLocation = selectedLocation;
        renderLocationList();
        syncLocationUI();
        if (restoreFocus)
            window.requestAnimationFrame(() => {
                replyEditor?.focus();
            });
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

    // ===== 4-4. Attachment =====
    function hasReplyAttachment() {
        return attachedReplyFiles.length > 0;
    }
    function clearAttachedReplyFileUrls() {
        if (attachedReplyFileUrls.length === 0) return;
        attachedReplyFileUrls.forEach((u) => URL.revokeObjectURL(u));
        attachedReplyFileUrls = [];
    }
    function isReplyImageSet() {
        return (
            attachedReplyFiles.length > 0 &&
            attachedReplyFiles.every((f) => f.type.startsWith("image/"))
        );
    }
    function isReplyVideoSet() {
        return (
            attachedReplyFiles.length === 1 &&
            attachedReplyFiles[0].type.startsWith("video/")
        );
    }
    function resetReplyAttachment() {
        clearAttachedReplyFileUrls();
        attachedReplyFiles = [];
        pendingAttachmentEditIndex = null;
        resetTaggedUsers();
        syncReplyMediaEditsToAttachments();
        if (replyFileInput) replyFileInput.value = "";
        if (replyAttachmentMedia) replyAttachmentMedia.innerHTML = "";
        if (replyAttachmentPreview) replyAttachmentPreview.hidden = true;
    }
    function createReplyAttachmentUrls() {
        clearAttachedReplyFileUrls();
        attachedReplyFileUrls = attachedReplyFiles.map((f) =>
            URL.createObjectURL(f),
        );
    }
    function getReplyImageCell(index, url, cls) {
        const alt = getReplyMediaImageAlt(index);
        return `<div class="media-cell ${cls}"><div class="media-cell-inner"><div class="media-img-container" aria-label="미디어" role="group"><div class="media-bg" style="background-image: url('${url}');"></div><img alt="${escapeHtml(alt)}" draggable="false" src="${url}" class="media-img"></div><div class="media-btn-row"><button type="button" class="media-btn" data-attachment-edit-index="${index}"><span>수정</span></button></div><button type="button" class="media-btn-delete" aria-label="미디어 삭제하기" data-attachment-remove-index="${index}"><svg viewBox="0 0 24 24" aria-hidden="true"><g><path d="M10.59 12L4.54 5.96l1.42-1.42L12 10.59l6.04-6.05 1.42 1.42L13.41 12l6.05 6.04-1.42 1.42L12 13.41l-6.04 6.05-1.42-1.42L10.59 12z"></path></g></svg></button></div></div>`;
    }
    function renderReplyImageGrid() {
        const n = attachedReplyFiles.length,
            urls = attachedReplyFileUrls;
        if (!replyAttachmentMedia || n === 0) return;
        if (n === 1) {
            replyAttachmentMedia.innerHTML = `<div class="media-aspect-ratio media-aspect-ratio--single"></div><div class="media-absolute-layer">${getReplyImageCell(0, urls[0], "media-cell--single")}</div>`;
            return;
        }
        if (n === 2) {
            replyAttachmentMedia.innerHTML = `<div class="media-aspect-ratio"></div><div class="media-absolute-layer"><div class="media-row"><div class="media-col">${getReplyImageCell(0, urls[0], "media-cell--left")}</div><div class="media-col">${getReplyImageCell(1, urls[1], "media-cell--right")}</div></div></div>`;
            return;
        }
        if (n === 3) {
            replyAttachmentMedia.innerHTML = `<div class="media-aspect-ratio"></div><div class="media-absolute-layer"><div class="media-row"><div class="media-col">${getReplyImageCell(0, urls[0], "media-cell--left-tall")}</div><div class="media-col">${getReplyImageCell(1, urls[1], "media-cell--right-top")}${getReplyImageCell(2, urls[2], "media-cell--right-bottom")}</div></div></div>`;
            return;
        }
        replyAttachmentMedia.innerHTML = `<div class="media-aspect-ratio"></div><div class="media-absolute-layer"><div class="media-row"><div class="media-col">${getReplyImageCell(0, urls[0], "media-cell--top-left")}${getReplyImageCell(2, urls[2], "media-cell--bottom-left")}</div><div class="media-col">${getReplyImageCell(1, urls[1], "media-cell--top-right")}${getReplyImageCell(3, urls[3], "media-cell--bottom-right")}</div></div></div>`;
    }
    function renderReplyVideoAttachment() {
        if (!replyAttachmentMedia || attachedReplyFiles.length === 0) return;
        const [file] = attachedReplyFiles,
            [fileUrl] = attachedReplyFileUrls;
        replyAttachmentMedia.innerHTML = `<div class="media-aspect-ratio media-aspect-ratio--single"></div><div class="media-absolute-layer"><div class="media-cell media-cell--single"><div class="media-cell-inner"><div class="media-img-container" aria-label="미디어" role="group"><video class="tweet-modal__attachment-video" controls preload="metadata"><source src="${fileUrl}" type="${file.type}"></video></div><div class="media-btn-row"><button type="button" class="media-btn" data-attachment-edit-index="0"><span>수정</span></button></div><button type="button" class="media-btn-delete" aria-label="미디어 삭제하기" data-attachment-remove-index="0"><svg viewBox="0 0 24 24" aria-hidden="true"><g><path d="M10.59 12L4.54 5.96l1.42-1.42L12 10.59l6.04-6.05 1.42 1.42L13.41 12l6.05 6.04-1.42 1.42L12 13.41l-6.04 6.05-1.42-1.42L10.59 12z"></path></g></svg></button></div></div></div>`;
    }
    function renderReplyAttachment() {
        if (!replyAttachmentPreview || !replyAttachmentMedia) return;
        if (attachedReplyFiles.length === 0) {
            replyAttachmentMedia.innerHTML = "";
            replyAttachmentPreview.hidden = true;
            resetTaggedUsers();
            syncReplyMediaEditsToAttachments();
            return;
        }
        replyAttachmentPreview.hidden = false;
        createReplyAttachmentUrls();
        if (isReplyImageSet()) {
            syncReplyMediaEditsToAttachments();
            syncUserTagTrigger();
            renderReplyImageGrid();
            return;
        }
        if (isReplyVideoSet()) {
            resetTaggedUsers();
            syncReplyMediaEditsToAttachments();
            renderReplyVideoAttachment();
            return;
        }
        resetTaggedUsers();
        syncReplyMediaEditsToAttachments();
        replyAttachmentMedia.innerHTML = "";
        const fp = document.createElement("div");
        const fi = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "svg",
        );
        const fg = document.createElementNS("http://www.w3.org/2000/svg", "g");
        const fpath = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "path",
        );
        const fn = document.createElement("span");
        fp.className = "tweet-modal__attachment-file";
        fi.setAttribute("viewBox", "0 0 24 24");
        fi.setAttribute("width", "22");
        fi.setAttribute("height", "22");
        fi.setAttribute("aria-hidden", "true");
        fpath.setAttribute(
            "d",
            "M14 2H7.75C5.68 2 4 3.68 4 5.75v12.5C4 20.32 5.68 22 7.75 22h8.5C18.32 22 20 20.32 20 18.25V8l-6-6zm0 2.12L17.88 8H14V4.12zm2.25 15.88h-8.5c-.97 0-1.75-.78-1.75-1.75V5.75C6 4.78 6.78 4 7.75 4H12v5.25c0 .41.34.75.75.75H18v8.25c0 .97-.78 1.75-1.75 1.75z",
        );
        fn.className = "tweet-modal__attachment-file-name";
        fn.textContent = attachedReplyFiles[0]?.name ?? "";
        fg.appendChild(fpath);
        fi.appendChild(fg);
        fp.appendChild(fi);
        fp.appendChild(fn);
        replyAttachmentMedia.appendChild(fp);
    }
    function removeReplyAttachment(index) {
        attachedReplyFiles = attachedReplyFiles.filter((_, i) => i !== index);
        pendingAttachmentEditIndex = null;
        renderReplyAttachment();
    }
    function handleReplyFileChange(e) {
        const next = Array.from(e.target.files ?? []);
        if (next.length === 0) {
            pendingAttachmentEditIndex = null;
            syncReplySubmitState();
            return;
        }
        const rep = next[0];
        const vid = next.find((f) => f.type.startsWith("video/"));
        const imgs = next.filter((f) => f.type.startsWith("image/"));
        if (pendingAttachmentEditIndex !== null) {
            if (!rep) {
                pendingAttachmentEditIndex = null;
                return;
            }
            if (rep.type.startsWith("video/")) {
                attachedReplyFiles = [rep];
            } else {
                const ed = isReplyVideoSet() ? [] : [...attachedReplyFiles];
                attachedReplyFiles =
                    ed.length === 0
                        ? [rep]
                        : ((ed[pendingAttachmentEditIndex] = rep),
                          ed.slice(0, maxReplyImages));
            }
            pendingAttachmentEditIndex = null;
            renderReplyAttachment();
            syncReplySubmitState();
            return;
        }
        if (vid) {
            attachedReplyFiles = [vid];
            renderReplyAttachment();
            syncReplySubmitState();
            return;
        }
        if (imgs.length > 0) {
            attachedReplyFiles = [
                ...(isReplyImageSet() ? [...attachedReplyFiles] : []),
                ...imgs,
            ].slice(0, maxReplyImages);
            renderReplyAttachment();
            syncReplySubmitState();
            return;
        }
        attachedReplyFiles = [rep];
        renderReplyAttachment();
        syncReplySubmitState();
    }

    // ===== 4-5. Format =====
    function hasReplyEditorText() {
        return replyEditor
            ? replyEditor.textContent.replace(/\u00a0/g, " ").trim().length > 0
            : false;
    }
    function togglePendingReplyFormat(fmt) {
        pendingReplyFormats.has(fmt)
            ? pendingReplyFormats.delete(fmt)
            : pendingReplyFormats.add(fmt);
    }
    function applyPendingReplyFormatsToContent() {
        if (
            !replyEditor ||
            pendingReplyFormats.size === 0 ||
            !hasReplyEditorText()
        )
            return;
        let span;
        if (
            replyEditor.childNodes.length === 1 &&
            replyEditor.firstElementChild?.tagName === "SPAN"
        ) {
            span = replyEditor.firstElementChild;
        } else {
            span = document.createElement("span");
            while (replyEditor.firstChild)
                span.appendChild(replyEditor.firstChild);
            replyEditor.appendChild(span);
        }
        span.style.fontWeight = pendingReplyFormats.has("bold") ? "bold" : "";
        span.style.fontStyle = pendingReplyFormats.has("italic")
            ? "italic"
            : "";
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
        const pre = range.cloneRange();
        pre.selectNodeContents(replyEditor);
        pre.setEnd(range.startContainer, range.startOffset);
        const start = pre.toString().length;
        savedReplySelectionOffsets = {
            start,
            end: start + range.toString().length,
        };
    }
    function resolveReplySelectionPosition(targetOffset) {
        if (!replyEditor) return null;
        const walker = document.createTreeWalker(
            replyEditor,
            NodeFilter.SHOW_TEXT,
        );
        let node = walker.nextNode(),
            remaining = Math.max(0, targetOffset),
            lastTextNode = null;
        while (node) {
            lastTextNode = node;
            const length = node.textContent?.length ?? 0;
            if (remaining <= length) return { node, offset: remaining };
            remaining -= length;
            node = walker.nextNode();
        }
        if (lastTextNode)
            return {
                node: lastTextNode,
                offset: lastTextNode.textContent?.length ?? 0,
            };
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
        const range =
            buildReplySelectionRangeFromOffsets(savedReplySelectionOffsets) ??
            savedReplySelection;
        if (!range) return false;
        sel.removeAllRanges();
        sel.addRange(range);
        return true;
    }
    function hasEmojiButtonLibrary() {
        return typeof window.EmojiButton === "function";
    }
    function restoreReplyEditorAfterEmojiInsert() {
        if (
            !shouldRestoreReplyEditorAfterEmojiInsert ||
            !replyEditor ||
            replyModalOverlay?.hidden
        )
            return;
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
        if (!replyEmojiButton || !replyEditor || !hasEmojiButtonLibrary())
            return null;
        if (replyEmojiLibraryPicker) return replyEmojiLibraryPicker;
        replyEmojiLibraryPicker = new window.EmojiButton({
            position: "bottom-start",
            rootElement: replyModalOverlay ?? undefined,
            zIndex: 1400,
        });
        replyEmojiLibraryPicker.on("emoji", (selection) => {
            const emoji =
                typeof selection === "string" ? selection : selection?.emoji;
            if (!emoji) return;
            shouldRestoreReplyEditorAfterEmojiInsert = true;
            insertReplyEmoji(emoji);
            closeEmojiPicker();
            restoreReplyEditorAfterEmojiInsert();
        });
        replyEmojiLibraryPicker.on("hidden", () => {
            replyEmojiButton?.setAttribute("aria-expanded", "false");
            if (shouldRestoreReplyEditorAfterEmojiInsert) {
                restoreReplyEditorAfterEmojiInsert();
                return;
            }
            saveReplySelection();
        });
        if (replyEmojiPicker) replyEmojiPicker.hidden = true;
        return replyEmojiLibraryPicker;
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
    function syncReplyFormatButtons() {
        if (!replyEditor) return;
        replyFormatButtons.forEach((btn) => {
            const fmt = btn.getAttribute("data-format");
            if (!fmt) return;
            const active = hasReplyEditorText()
                ? document.queryCommandState(fmt)
                : pendingReplyFormats.has(fmt);
            const labels = formatButtonLabels[fmt];
            btn.classList.toggle("tweet-modal__tool-btn--active", active);
            if (labels)
                btn.setAttribute(
                    "aria-label",
                    active ? labels.active : labels.inactive,
                );
        });
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
        if (!sel) {
            isInsertingReplyEmoji = false;
            return;
        }
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
    function syncReplySubmitState() {
        if (!replyEditor) return;
        let content = replyEditor.textContent?.replace(/\u00a0/g, " ") ?? "";
        if (content.length > replyMaxLength) {
            content = content.slice(0, replyMaxLength);
            replyEditor.textContent = content;
            placeCaretAtEnd(replyEditor);
            saveReplySelection();
        }
        const currentLength = content.length;
        const remaining = Math.max(replyMaxLength - currentLength, 0);
        const canSubmit = content.trim().length > 0 || hasReplyAttachment();
        const progress = `${Math.min(currentLength / replyMaxLength, 1) * 360}deg`;
        if (replySubmitButton) replySubmitButton.disabled = !canSubmit;
        if (replyGauge) {
            replyGauge.style.setProperty("--gauge-progress", progress);
            replyGauge.setAttribute("aria-valuenow", String(currentLength));
        }
        if (replyGaugeText) replyGaugeText.textContent = String(remaining);
    }

    // ===== 5. Reply Modal =====
    function populateReplyModal(button) {
        const card = button.closest(".Post-Card");
        if (!card) return;

        // 컨텍스트 텍스트: "@핸들님에게 보내는 답글"
        const handle = getTextContent(card.querySelector(".Post-Handle"));
        const name = getTextContent(card.querySelector(".Post-Name"));
        const time = getTextContent(card.querySelector(".Post-Time"));
        const text = getTextContent(card.querySelector(".Post-Text"));

        // 아바타: .Post-Avatar-Img가 있으면 src 사용, 없으면 텍스트 아바타 색으로 처리
        const avatarImg = card.querySelector(".Post-Avatar-Img");
        if (replySourceAvatar) {
            if (avatarImg && avatarImg.src) {
                replySourceAvatar.src = avatarImg.src;
                replySourceAvatar.style.background = "";
            } else {
                // 텍스트 아바타(.Post-Avatar)인 경우 빈 이미지 + 색 배경
                replySourceAvatar.src = "";
                replySourceAvatar.style.background = "#cfe8fc";
                replySourceAvatar.style.objectFit = "none";
            }
        }
        if (replyContextButton)
            replyContextButton.textContent = handle
                ? `${handle}님에게 보내는 답글`
                : "";
        if (replySourceName) replySourceName.textContent = name;
        if (replySourceHandle) replySourceHandle.textContent = handle;
        if (replySourceTime) replySourceTime.textContent = time;
        if (replySourceText) replySourceText.textContent = text;
    }

    function openReplyModal(button) {
        if (!replyModalOverlay || !replyEditor) return;
        activeReplyTrigger = button;
        shouldRestoreReplyEditorAfterEmojiInsert = false;
        document.body.classList.add("modal-open");
        replyModalOverlay.hidden = false;
        populateReplyModal(button);
        closeEmojiPicker();
        replyEditor.textContent = "";
        savedReplySelection = null;
        savedReplySelectionOffsets = null;
        pendingReplyFormats = new Set();
        activeEmojiCategory = "recent";
        selectedLocation = null;
        pendingLocation = null;
        selectedTaggedUsers = [];
        pendingTaggedUsers = [];
        selectedProduct = null;
        if (replyProductButton) replyProductButton.disabled = false;
        const existingProductCard = replyModalOverlay?.querySelector(
            "[data-selected-product]",
        );
        if (existingProductCard) existingProductCard.remove();
        resetReplyAttachment();
        if (replyEmojiSearchInput) replyEmojiSearchInput.value = "";
        if (replyLocationSearchInput) replyLocationSearchInput.value = "";
        if (composeView) composeView.hidden = false;
        if (replyLocationView) replyLocationView.hidden = true;
        if (replyTagView) replyTagView.hidden = true;
        if (replyMediaView) replyMediaView.hidden = true;
        if (replyProductView) replyProductView.hidden = true;
        closeDraftPanel({ restoreFocus: false });
        renderDraftPanel();
        renderLocationList();
        syncLocationUI();
        syncUserTagTrigger();
        syncReplyMediaEditsToAttachments();
        syncReplySubmitState();
        syncReplyFormatButtons();
        window.requestAnimationFrame(() => {
            replyEditor.focus();
        });
    }

    function canCloseReplyModal() {
        if (!replyEditor)
            return (
                !hasReplyAttachment() ||
                window.confirm("게시물을 삭제하시겠어요?")
            );
        const hasDraft =
            replyEditor.textContent.replace(/\u00a0/g, " ").trim().length > 0;
        return (
            (!hasDraft && !hasReplyAttachment()) ||
            window.confirm("게시물을 삭제하시겠어요?")
        );
    }

    function closeReplyModal(options = {}) {
        const { skipConfirm = false, restoreFocus = true } = options;
        if (!replyModalOverlay || replyModalOverlay.hidden) return;
        if (!skipConfirm && !canCloseReplyModal()) return;
        shouldRestoreReplyEditorAfterEmojiInsert = false;
        replyModalOverlay.hidden = true;
        document.body.classList.remove("modal-open");
        closeEmojiPicker();
        closeLocationPanel({ restoreFocus: false });
        closeTagPanel({ restoreFocus: false });
        closeMediaEditor({ restoreFocus: false, discardChanges: true });
        closeDraftPanel({ restoreFocus: false });
        if (replyProductView) replyProductView.hidden = true;
        if (replyEditor) replyEditor.textContent = "";
        savedReplySelection = null;
        savedReplySelectionOffsets = null;
        pendingReplyFormats = new Set();
        selectedLocation = null;
        pendingLocation = null;
        selectedTaggedUsers = [];
        pendingTaggedUsers = [];
        selectedProduct = null;
        if (replyProductButton) replyProductButton.disabled = false;
        const existingProductCard = replyModalOverlay?.querySelector(
            "[data-selected-product]",
        );
        if (existingProductCard) existingProductCard.remove();
        resetReplyAttachment();
        renderLocationList();
        syncLocationUI();
        syncUserTagTrigger();
        syncReplyMediaEditsToAttachments();
        syncReplySubmitState();
        syncReplyFormatButtons();
        if (restoreFocus) activeReplyTrigger?.focus();
        activeReplyTrigger = null;
    }

    function trapFocus(e) {
        if (!replyModal || e.key !== "Tab") return;
        const focusable = Array.from(
            replyModal.querySelectorAll(
                'button:not([disabled]), [href], input:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
            ),
        ).filter((el) => !el.hasAttribute("hidden"));
        if (focusable.length === 0) return;
        const first = focusable[0],
            last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
        }
    }

    // 답글 버튼 카운트 증가 (마이페이지 .Post-Action-Btn.Reply 기준)
    function updateReplyCount(button) {
        const cnt = button.querySelector(".Post-Action-Count");
        if (!cnt) return;
        const next = (Number.parseInt(cnt.textContent || "0", 10) || 0) + 1;
        cnt.textContent = String(next);
        button.setAttribute("aria-label", `답글 ${next}`);
    }

    // ===== 6. Draft Panel =====
    const draftView = q(".tweet-modal__draft-view");
    const draftButton = q(".tweet-modal__draft");
    const draftBackButton = draftView?.querySelector(".draft-panel__back");
    const draftActionButton = draftView?.querySelector(".draft-panel__action");
    const draftList = draftView?.querySelector(".draft-panel__list");
    const draftEmpty = draftView?.querySelector(".draft-panel__empty");
    const draftEmptyTitle = draftView?.querySelector(
        ".draft-panel__empty-title",
    );
    const draftEmptyBody = draftView?.querySelector(".draft-panel__empty-body");
    const draftFooter = draftView?.querySelector(".draft-panel__footer");
    const draftSelectAllButton = draftView?.querySelector(
        ".draft-panel__select-all",
    );
    const draftDeleteButton = draftView?.querySelector(
        ".draft-panel__footer-delete",
    );
    const draftConfirmOverlay = draftView?.querySelector(
        ".draft-panel__confirm-overlay",
    );
    const draftConfirmBackdrop = draftView?.querySelector(
        ".draft-panel__confirm-backdrop",
    );
    const draftConfirmTitle = draftView?.querySelector(
        ".draft-panel__confirm-title",
    );
    const draftConfirmDesc = draftView?.querySelector(
        ".draft-panel__confirm-desc",
    );
    const draftConfirmDeleteButton = draftView?.querySelector(
        ".draft-panel__confirm-primary",
    );
    const draftConfirmCancelButton = draftView?.querySelector(
        ".draft-panel__confirm-secondary",
    );
    const draftPanelState = {
        isEditMode: false,
        confirmOpen: false,
        selectedItems: new Set(),
    };

    function getDraftItems() {
        return draftList
            ? Array.from(draftList.querySelectorAll(".draft-panel__item"))
            : [];
    }
    function clearDraftSelection() {
        draftPanelState.selectedItems.clear();
        draftPanelState.confirmOpen = false;
    }
    function exitDraftEditMode() {
        draftPanelState.isEditMode = false;
        clearDraftSelection();
    }
    function enterDraftEditMode() {
        if (getDraftItems().length === 0) return;
        draftPanelState.isEditMode = true;
        draftPanelState.confirmOpen = false;
    }
    function hasDraftItem(item) {
        return item instanceof HTMLElement && getDraftItems().includes(item);
    }
    function toggleDraftSelection(item) {
        if (!draftPanelState.isEditMode || !hasDraftItem(item)) return;
        draftPanelState.selectedItems.has(item)
            ? draftPanelState.selectedItems.delete(item)
            : draftPanelState.selectedItems.add(item);
        draftPanelState.confirmOpen = false;
    }
    function areAllDraftItemsSelected() {
        const items = getDraftItems();
        return (
            items.length > 0 &&
            items.every((i) => draftPanelState.selectedItems.has(i))
        );
    }
    function toggleDraftSelectAll() {
        if (!draftPanelState.isEditMode) return;
        const items = getDraftItems();
        if (!items.length) return;
        areAllDraftItemsSelected()
            ? draftPanelState.selectedItems.clear()
            : (draftPanelState.selectedItems = new Set(items));
        draftPanelState.confirmOpen = false;
    }
    function hasDraftSelection() {
        return draftPanelState.selectedItems.size > 0;
    }
    function openDraftConfirm() {
        if (draftPanelState.isEditMode && hasDraftSelection())
            draftPanelState.confirmOpen = true;
    }
    function closeDraftConfirm() {
        draftPanelState.confirmOpen = false;
    }
    function deleteSelectedDrafts() {
        if (!hasDraftSelection()) return;
        getDraftItems().forEach((i) => {
            if (draftPanelState.selectedItems.has(i)) i.remove();
        });
        exitDraftEditMode();
    }
    function resetDraftPanel() {
        exitDraftEditMode();
        closeDraftConfirm();
    }
    function isDraftPanelOpen() {
        return Boolean(draftView && !draftView.hidden);
    }
    function isDraftConfirmOpen() {
        return draftPanelState.confirmOpen;
    }
    function buildDraftCheckbox(sel) {
        const cb = document.createElement("span");
        cb.className = `draft-panel__checkbox${sel ? " draft-panel__checkbox--checked" : ""}`;
        cb.setAttribute("aria-hidden", "true");
        cb.innerHTML =
            '<svg viewBox="0 0 24 24"><g><path d="M9.86 18a1 1 0 01-.73-.31l-3.9-4.11 1.45-1.38 3.2 3.38 7.46-8.1 1.47 1.36-8.19 8.9A1 1 0 019.86 18z"></path></g></svg>';
        return cb;
    }
    function renderDraftItems() {
        if (!draftList) return;
        getDraftItems().forEach((item) => {
            const sel = draftPanelState.selectedItems.has(item);
            const old = item.querySelector(".draft-panel__checkbox");
            if (old) old.remove();
            item.className = [
                "draft-panel__item",
                draftPanelState.isEditMode
                    ? "draft-panel__item--selectable"
                    : "",
                sel ? "draft-panel__item--selected" : "",
            ]
                .filter(Boolean)
                .join(" ");
            item.setAttribute(
                "aria-pressed",
                draftPanelState.isEditMode ? String(sel) : "false",
            );
            if (draftPanelState.isEditMode)
                item.prepend(buildDraftCheckbox(sel));
        });
    }
    function renderDraftPanel() {
        if (!draftView) return;
        const hasItems = getDraftItems().length > 0;
        if (draftActionButton) {
            draftActionButton.textContent = draftPanelState.isEditMode
                ? "완료"
                : "수정";
            draftActionButton.disabled = !hasItems;
            draftActionButton.classList.toggle(
                "draft-panel__action--done",
                draftPanelState.isEditMode,
            );
        }
        renderDraftItems();
        if (draftEmpty) draftEmpty.hidden = hasItems;
        if (draftEmptyTitle)
            draftEmptyTitle.textContent = "잠시 생각을 정리합니다";
        if (draftEmptyBody)
            draftEmptyBody.textContent =
                "아직 게시할 준비가 되지 않았나요? 임시저장해 두고 나중에 이어서 작성하세요.";
        if (draftFooter) draftFooter.hidden = !draftPanelState.isEditMode;
        if (draftSelectAllButton)
            draftSelectAllButton.textContent = areAllDraftItemsSelected()
                ? "모두 선택 해제"
                : "모두 선택";
        if (draftDeleteButton)
            draftDeleteButton.disabled = !hasDraftSelection();
        if (draftConfirmOverlay)
            draftConfirmOverlay.hidden = !draftPanelState.confirmOpen;
        if (draftConfirmTitle)
            draftConfirmTitle.textContent = "전송하지 않은 게시물 삭제하기";
        if (draftConfirmDesc)
            draftConfirmDesc.textContent =
                "이 작업은 취소할 수 없으며 선택한 전송하지 않은 게시물이 삭제됩니다.";
    }
    function openDraftPanel() {
        if (!composeView || !draftView) return;
        renderDraftPanel();
        composeView.hidden = true;
        draftView.hidden = false;
    }
    function closeDraftPanel({ restoreFocus = true } = {}) {
        if (!composeView || !draftView) return;
        resetDraftPanel();
        renderDraftPanel();
        draftView.hidden = true;
        composeView.hidden = false;
        if (restoreFocus) draftButton?.focus();
    }
    function getDraftItemByElement(target) {
        return target.closest(".draft-panel__item");
    }
    function loadDraftIntoComposer(item) {
        if (!item || !replyEditor) return;
        replyEditor.textContent = getTextContent(
            item.querySelector(".draft-panel__text"),
        );
        closeDraftPanel({ restoreFocus: false });
        syncReplySubmitState();
        saveReplySelection();
        window.requestAnimationFrame(() => {
            replyEditor.focus();
        });
    }

    // ===== 7. Product Select Panel =====
    replyProductButton?.addEventListener("click", (e) => {
        e.preventDefault();
        openProductSelectPanel();
    });
    productSelectClose?.addEventListener("click", () => {
        closeProductSelectPanel();
    });
    productSelectComplete?.addEventListener("click", () => {
        const checkedItem = productSelectList?.querySelector(
            ".draft-panel__item--selected",
        );
        if (checkedItem) {
            selectedProduct = {
                name:
                    checkedItem.querySelector(".draft-panel__text")
                        ?.textContent ?? "",
                price:
                    checkedItem.querySelector(".draft-panel__date")
                        ?.textContent ?? "",
                image:
                    checkedItem.querySelector(".draft-panel__avatar")?.src ??
                    "",
                id: checkedItem.dataset.productId ?? "",
            };
            renderSelectedProduct();
            if (replyProductButton) replyProductButton.disabled = true;
        }
        closeProductSelectPanel();
    });
    function openProductSelectPanel() {
        if (!replyProductView) return;
        renderProductList();
        if (composeView) composeView.hidden = true;
        replyProductView.hidden = false;
    }
    function closeProductSelectPanel() {
        if (!replyProductView) return;
        replyProductView.hidden = true;
        if (composeView) composeView.hidden = false;
    }
    function renderProductList() {
        if (!productSelectList) return;
        const sampleProducts = [
            {
                id: "1",
                name: "상품 이름 1",
                price: "₩50,000",
                stock: "100개",
                image: "../../static/images/main/global-gates-logo.png",
                tags: ["#부품", "#전자"],
            },
            {
                id: "2",
                name: "상품 이름 2",
                price: "₩30,000",
                stock: "50개",
                image: "../../static/images/main/global-gates-logo.png",
                tags: ["#부품", "#기계"],
            },
            {
                id: "3",
                name: "상품 이름 3",
                price: "₩80,000",
                stock: "200개",
                image: "../../static/images/main/global-gates-logo.png",
                tags: ["#부품", "#소재"],
            },
        ];
        if (sampleProducts.length === 0) {
            productSelectList.innerHTML = "";
            if (productSelectEmpty) productSelectEmpty.hidden = false;
            return;
        }
        if (productSelectEmpty) productSelectEmpty.hidden = true;
        productSelectList.innerHTML = sampleProducts
            .map(
                (p) =>
                    `<button type="button" class="draft-panel__item draft-panel__item--selectable" data-product-id="${p.id}" aria-pressed="false"><span class="draft-panel__checkbox"><svg viewBox="0 0 24 24" aria-hidden="true"><g><path d="M9 20c-.264 0-.518-.104-.707-.293l-4.785-4.785 1.414-1.414L9 17.586 19.072 7.5l1.42 1.416L9.708 19.7c-.188.19-.442.3-.708.3z"></path></g></svg></span><img class="draft-panel__avatar" alt="" src="${p.image}"><span class="draft-panel__item-body"><span class="draft-panel__text">${p.name}</span><span class="draft-panel__meta">${p.tags.join(" ")}</span><span class="draft-panel__date">${p.price} · ${p.stock}</span></span></button>`,
            )
            .join("");
    }
    productSelectList?.addEventListener("click", (e) => {
        const item = e.target.closest(".draft-panel__item");
        if (!item) return;
        const wasSelected = item.classList.contains(
            "draft-panel__item--selected",
        );
        productSelectList
            .querySelectorAll(".draft-panel__item--selected")
            .forEach((el) => {
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
        if (productSelectComplete)
            productSelectComplete.disabled = !productSelectList.querySelector(
                ".draft-panel__item--selected",
            );
    });
    function renderSelectedProduct() {
        const existing = replyModalOverlay?.querySelector(
            "[data-selected-product]",
        );
        if (existing) existing.remove();
        if (!selectedProduct || !replyEditor) return;
        const card = document.createElement("div");
        card.setAttribute("data-selected-product", "");
        card.className = "tweet-modal__selected-product";
        card.innerHTML = `<div class="selected-product__card"><img class="selected-product__image" src="${selectedProduct.image}" alt="${selectedProduct.name}"><div class="selected-product__info"><strong class="selected-product__name">${selectedProduct.name}</strong><span class="selected-product__price">${selectedProduct.price}</span></div><button type="button" class="selected-product__remove" aria-label="판매글 제거"><svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><g><path d="M10.59 12L4.54 5.96l1.42-1.42L12 10.59l6.04-6.05 1.42 1.42L13.41 12l6.05 6.04-1.42 1.42L12 13.41l-6.04 6.05-1.42-1.42L10.59 12z"></path></g></svg></button></div>`;
        card.querySelector(".selected-product__remove")?.addEventListener(
            "click",
            () => {
                selectedProduct = null;
                card.remove();
                if (replyProductButton) replyProductButton.disabled = false;
            },
        );
        replyEditor.parentElement?.appendChild(card);
    }

    // ===== 8. Init & Events =====
    renderLocationList();
    syncLocationUI();
    syncUserTagTrigger();
    renderDraftPanel();
    ensureReplyEmojiLibraryPicker();

    // 네비게이션 탭 (마이페이지)
    const navBarDivs = document.querySelectorAll(".Profile-Tab-Item");
    const navBarTexts = document.querySelectorAll(".Profile-Tab-Text");
    const navUnderlines = document.querySelectorAll(".Profile-Tab-Indicator");
    const contentDivs = document.querySelectorAll(".Profile-Content");
    navBarDivs.forEach((nav, i) => {
        nav.addEventListener("click", () => {
            navBarTexts.forEach((t) => t.classList.remove("selected"));
            navUnderlines.forEach((u) => u.classList.add("off"));
            contentDivs.forEach((c) => c.classList.add("off"));
            navBarTexts[i].classList.add("selected");
            navUnderlines[i].classList.remove("off");
            contentDivs[i].classList.remove("off");
        });
    });
    document.querySelector(".Profile-Tab-Item.Posts")?.click();

    // [마이페이지 전용] 답글 버튼: .Post-Action-Btn.Reply 클릭 → openReplyModal
    document.querySelectorAll(".Post-Action-Btn.Reply").forEach((button) => {
        button.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            openReplyModal(button);
        });
    });

    // 답글 모달 이벤트
    replyCloseButton?.addEventListener("click", closeReplyModal);
    replyModalOverlay?.addEventListener("click", (e) => {
        if (e.target === replyModalOverlay) closeReplyModal();
    });
    replyModalOverlay?.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            e.preventDefault();
            if (isMediaEditorOpen()) {
                closeMediaEditor();
                return;
            }
            if (isTagModalOpen()) {
                closeTagPanel();
                return;
            }
            if (isLocationModalOpen()) {
                closeLocationPanel();
                return;
            }
            if (replyProductView && !replyProductView.hidden) {
                closeProductSelectPanel();
                return;
            }
            if (isDraftConfirmOpen()) {
                closeDraftConfirm();
                renderDraftPanel();
                return;
            }
            if (isDraftPanelOpen()) {
                closeDraftPanel();
                return;
            }
            closeReplyModal();
            return;
        }
        trapFocus(e);
    });
    replyEditor?.addEventListener("input", () => {
        applyPendingReplyFormatsToContent();
        if (!hasReplyEditorText()) pendingReplyFormats = new Set();
        syncReplySubmitState();
        syncReplyFormatButtons();
    });
    replyEditor?.addEventListener("keyup", saveReplySelection);
    replyEditor?.addEventListener("keyup", syncReplyFormatButtons);
    replyEditor?.addEventListener("mouseup", saveReplySelection);
    replyEditor?.addEventListener("mouseup", syncReplyFormatButtons);
    replyEditor?.addEventListener("focus", saveReplySelection);
    replyEditor?.addEventListener("focus", syncReplyFormatButtons);
    replyEditor?.addEventListener("click", syncReplyFormatButtons);
    replyEditor?.addEventListener("keydown", (e) => {
        if (!e.ctrlKey) return;
        const key = e.key.toLowerCase();
        if (key !== "b" && key !== "i") return;
        e.preventDefault();
        applyReplyFormat(key === "b" ? "bold" : "italic");
    });
    replyMediaUploadButton?.addEventListener("click", (e) => {
        e.preventDefault();
        pendingAttachmentEditIndex = null;
        if (replyFileInput) replyFileInput.value = "";
        replyFileInput?.click();
    });
    replyFileInput?.addEventListener("change", handleReplyFileChange);
    replyAttachmentMedia?.addEventListener("click", (e) => {
        const rm = e.target.closest("[data-attachment-remove-index]");
        if (rm) {
            const ri = Number.parseInt(
                rm.getAttribute("data-attachment-remove-index") ?? "-1",
                10,
            );
            if (ri >= 0) removeReplyAttachment(ri);
            syncReplySubmitState();
            return;
        }
        const eb = e.target.closest("[data-attachment-edit-index]");
        if (eb) {
            pendingAttachmentEditIndex = Number.parseInt(
                eb.getAttribute("data-attachment-edit-index") ?? "-1",
                10,
            );
            if (replyFileInput) replyFileInput.value = "";
            replyFileInput?.click();
        }
    });
    document.addEventListener("selectionchange", () => {
        if (replyModalOverlay?.hidden || !replyEditor) return;
        saveReplySelection();
        syncReplyFormatButtons();
    });
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
    replyEmojiButton?.addEventListener("mousedown", (e) => {
        e.preventDefault();
        e.stopPropagation();
        saveReplySelection();
    });
    replyEmojiButton?.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleEmojiPicker();
    });
    replyGeoButton?.addEventListener("click", (e) => {
        e.preventDefault();
        openLocationPanel();
    });
    replyUserTagTrigger?.addEventListener("click", (e) => {
        e.preventDefault();
        openTagPanel();
    });
    replyMediaAltTrigger?.addEventListener("click", (e) => {
        e.preventDefault();
        openMediaEditor();
    });
    replyLocationDisplayButton?.addEventListener("click", (e) => {
        e.preventDefault();
        openLocationPanel();
    });
    replyEmojiPicker?.addEventListener("click", (e) => e.stopPropagation());
    replyEmojiSearchInput?.addEventListener("input", () =>
        renderEmojiPickerContent(),
    );
    replyLocationSearchInput?.addEventListener("input", () =>
        renderLocationList(),
    );
    replyTagSearchForm?.addEventListener("submit", (e) => e.preventDefault());
    replyTagSearchInput?.addEventListener("input", () => runTagSearch());
    replyMediaBackButton?.addEventListener("click", () => closeMediaEditor());
    replyMediaSaveButton?.addEventListener("click", () =>
        saveReplyMediaEdits(),
    );
    replyMediaPrevButton?.addEventListener("click", () => {
        if (activeReplyMediaIndex === 0) return;
        activeReplyMediaIndex -= 1;
        renderMediaEditor();
    });
    replyMediaNextButton?.addEventListener("click", () => {
        if (activeReplyMediaIndex >= pendingReplyMediaEdits.length - 1) return;
        activeReplyMediaIndex += 1;
        renderMediaEditor();
    });
    replyMediaAltInput?.addEventListener("input", () => {
        const edit = pendingReplyMediaEdits[activeReplyMediaIndex];
        if (!edit) return;
        edit.alt = replyMediaAltInput.value.slice(0, maxReplyMediaAltLength);
        renderMediaEditor();
    });
    replyEmojiTabs.forEach((tab) => {
        tab.addEventListener("click", () => {
            const cat = tab.getAttribute("data-emoji-category");
            if (cat) {
                activeEmojiCategory = cat;
                renderEmojiPicker();
            }
        });
    });
    replyEmojiContent?.addEventListener("mousedown", (e) => {
        if (
            e.target.closest(
                ".tweet-modal__emoji-option, .tweet-modal__emoji-clear",
            )
        )
            e.preventDefault();
    });
    replyEmojiContent?.addEventListener("click", (e) => {
        if (e.target.closest("[data-action='clear-recent']")) {
            clearRecentEmojis();
            activeEmojiCategory = "recent";
            renderEmojiPicker();
            return;
        }
        const eb = e.target.closest(".tweet-modal__emoji-option");
        if (!eb) return;
        const emoji = eb.getAttribute("data-emoji");
        if (emoji) {
            insertReplyEmoji(emoji);
            closeEmojiPicker();
        }
    });
    replyLocationCloseButton?.addEventListener("click", () =>
        closeLocationPanel(),
    );
    replyTagCloseButton?.addEventListener("click", () => closeTagPanel());
    replyTagCompleteButton?.addEventListener("click", () => {
        applyPendingTaggedUsers();
        closeTagPanel();
    });
    replyLocationDeleteButton?.addEventListener("click", () => {
        resetLocationState();
        closeLocationPanel();
    });
    replyLocationCompleteButton?.addEventListener("click", () => {
        if (pendingLocation) {
            applyLocation(pendingLocation);
            closeLocationPanel();
        }
    });
    replyLocationList?.addEventListener("click", (e) => {
        const lb = e.target.closest(".tweet-modal__location-item");
        if (!lb) return;
        const loc = getTextContent(
            lb.querySelector(".tweet-modal__location-item-label"),
        );
        if (loc) {
            applyLocation(loc);
            closeLocationPanel();
        }
    });
    replyTagChipList?.addEventListener("click", (e) => {
        const cb = e.target.closest("[data-tag-remove-id]");
        if (!cb) return;
        const uid = cb.getAttribute("data-tag-remove-id");
        pendingTaggedUsers = pendingTaggedUsers.filter((u) => u.id !== uid);
        renderTagChipList();
        runTagSearch();
        replyTagSearchInput?.focus();
    });
    replyTagResults?.addEventListener("click", (e) => {
        const ub = e.target.closest("[data-tag-user-id]");
        if (!ub || ub.hasAttribute("disabled")) return;
        const uid = ub.getAttribute("data-tag-user-id");
        const user = currentTagResults.find((u) => u.id === uid);
        if (!user || pendingTaggedUsers.some((u) => u.id === user.id)) return;
        pendingTaggedUsers = [...pendingTaggedUsers, { ...user }];
        renderTagChipList();
        if (replyTagSearchInput) replyTagSearchInput.value = "";
        renderTagResults([]);
        replyTagSearchInput?.focus();
    });
    replySubmitButton?.addEventListener("click", () => {
        if (!activeReplyTrigger || replySubmitButton.disabled) return;
        updateReplyCount(activeReplyTrigger);
        closeReplyModal({ skipConfirm: true });
    });
    document.addEventListener("click", (e) => {
        if (
            replyEmojiPicker &&
            !replyEmojiPicker.hidden &&
            !replyEmojiPicker.contains(e.target) &&
            !replyEmojiButton?.contains(e.target)
        )
            closeEmojiPicker();
    });
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && !replyModalOverlay?.hidden) return;
    });
    window.addEventListener(
        "resize",
        () => {
            if (replyEmojiPicker && !replyEmojiPicker.hidden)
                updateEmojiPickerPosition();
        },
        { passive: true },
    );
    window.addEventListener(
        "scroll",
        () => {
            if (replyEmojiPicker && !replyEmojiPicker.hidden)
                updateEmojiPickerPosition();
        },
        { passive: true },
    );

    // Draft panel events
    draftButton?.addEventListener("click", (e) => {
        e.preventDefault();
        openDraftPanel();
    });
    draftBackButton?.addEventListener("click", (e) => {
        e.preventDefault();
        closeDraftPanel();
    });
    draftActionButton?.addEventListener("click", (e) => {
        e.preventDefault();
        draftPanelState.isEditMode ? exitDraftEditMode() : enterDraftEditMode();
        renderDraftPanel();
    });
    draftSelectAllButton?.addEventListener("click", (e) => {
        e.preventDefault();
        toggleDraftSelectAll();
        renderDraftPanel();
    });
    draftDeleteButton?.addEventListener("click", (e) => {
        e.preventDefault();
        openDraftConfirm();
        renderDraftPanel();
    });
    draftConfirmDeleteButton?.addEventListener("click", (e) => {
        e.preventDefault();
        deleteSelectedDrafts();
        renderDraftPanel();
    });
    draftConfirmCancelButton?.addEventListener("click", (e) => {
        e.preventDefault();
        closeDraftConfirm();
        renderDraftPanel();
    });
    draftConfirmBackdrop?.addEventListener("click", (e) => {
        e.preventDefault();
        closeDraftConfirm();
        renderDraftPanel();
    });
    draftList?.addEventListener("click", (e) => {
        const item = getDraftItemByElement(e.target);
        if (!item) return;
        if (draftPanelState.isEditMode) {
            toggleDraftSelection(item);
            renderDraftPanel();
            return;
        }
        loadDraftIntoComposer(item);
    });

    // 마이페이지 기존 기능들
    // 프로필 수정 모달
    const modalBackDrop = document.querySelector(".Modal-BackDrop");
    const profileEditModalOverlay = document.querySelector(
        ".Profile-Edit-Modal-Overlay",
    );
    function openModal(el) {
        el?.classList.remove("off");
        modalBackDrop?.classList.remove("off");
        document.body.classList.add("modal-open");
    }
    function closeModal(el) {
        el?.classList.add("off");
        modalBackDrop?.classList.add("off");
        document.body.classList.remove("modal-open");
    }
    modalBackDrop?.addEventListener("click", () => {
        const opens = document.querySelectorAll(
            ".Profile-Edit-Modal-Overlay:not(.off), .Product-Write-Modal:not(.off)",
        );
        opens.forEach((m) => m.classList.add("off"));
        modalBackDrop.classList.add("off");
        document.body.classList.remove("modal-open");
    });
    document
        .querySelector(".Profile-Edit-Btn.Edit")
        ?.addEventListener("click", () => openModal(profileEditModalOverlay));
    document
        .querySelector(".Profile-Edit-Close-Button")
        ?.addEventListener("click", () => closeModal(profileEditModalOverlay));
    document
        .querySelector(".Profile-Edit-Save-Button")
        ?.addEventListener("click", () => closeModal(profileEditModalOverlay));

    // [FIX 1] 생년월일 정규식
    const birthdateInput = document.querySelector(
        ".Profile-Edit-Birthdate-Input",
    );
    const birthdateError = document.querySelector(
        ".Profile-Edit-Birthdate-Error",
    );
    if (birthdateInput) {
        birthdateInput.addEventListener("input", (e) => {
            e.target.value = e.target.value.replace(/[^0-9]/g, "");
            if (!birthdateError) return;
            const val = e.target.value;
            if (val.length < 8) {
                birthdateError.style.display = "none";
                return;
            }
            const y = parseInt(val.substring(0, 4), 10),
                m = parseInt(val.substring(4, 6), 10),
                d = parseInt(val.substring(6, 8), 10);
            const cur = new Date().getFullYear();
            let err = "";
            if (y < 1900 || y > cur) err = `연도: 1900~${cur}`;
            else if (m < 1 || m > 12) err = "월: 01~12";
            else {
                const last = new Date(y, m, 0).getDate();
                if (d < 1 || d > last) err = `일: 01~${last}`;
            }
            if (err) {
                birthdateError.style.display = "inline";
                birthdateError.textContent = err;
            } else {
                birthdateError.style.display = "none";
            }
        });
    }

    // [FIX 2] 클립보드 토스트
    const clipboardToast = document.querySelector(".Clipboard-Toast");
    function showClipboardToast(msg) {
        if (!clipboardToast) return;
        clipboardToast.querySelector("div").textContent =
            msg || "클립보드로 복사함";
        clipboardToast.classList.add("show");
        setTimeout(() => clipboardToast.classList.remove("show"), 2500);
    }

    // Like/Bookmark SVG 초기화
    const EMPTY_HEART = `<svg viewBox="0 0 24 24" class="Post-Action-Icon" aria-hidden="true"><g><path d="M16.697 5.5c-1.222-.06-2.679.51-3.89 2.16l-.805 1.09-.806-1.09C9.984 6.01 8.526 5.44 7.304 5.5c-1.243.07-2.349.78-2.91 1.91-.552 1.12-.633 2.78.479 4.82 1.074 1.97 3.257 4.27 7.129 6.61 3.87-2.34 6.052-4.64 7.126-6.61 1.111-2.04 1.03-3.7.477-4.82-.561-1.13-1.666-1.84-2.908-1.91zm4.187 7.69c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z"></path></g></svg>`;
    const FULL_HEART = `<svg viewBox="0 0 24 24" class="Post-Action-Icon" aria-hidden="true"><g><path d="M20.884 13.19c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z"></path></g></svg>`;
    const EMPTY_BK = `<svg viewBox="0 0 24 24" class="Post-Action-Icon" aria-hidden="true"><g><path d="M4 4.5C4 3.12 5.119 2 6.5 2h11C18.881 2 20 3.12 20 4.5v18.44l-8-5.71-8 5.71V4.5zM6.5 4c-.276 0-.5.22-.5.5v14.56l6-4.29 6 4.29V4.5c0-.28-.224-.5-.5-.5h-11z"></path></g></svg>`;
    const FULL_BK = `<svg viewBox="0 0 24 24" class="Post-Action-Icon" aria-hidden="true"><g><path d="M4 4.5C4 3.12 5.119 2 6.5 2h11C18.881 2 20 3.12 20 4.5v18.44l-8-5.71-8 5.71V4.5z"></path></g></svg>`;

    document.querySelectorAll(".Post-Action-Btn.Like").forEach((btn) => {
        const inLikes = !!btn.closest(".Profile-Content.Likes");
        const cnt = btn.querySelector(".Post-Action-Count");
        btn.querySelectorAll("svg").forEach((s) => s.remove());
        const e1 = document.createElement("span");
        e1.innerHTML = EMPTY_HEART;
        const es = e1.firstChild;
        if (inLikes) es.classList.add("off");
        const f1 = document.createElement("span");
        f1.innerHTML = FULL_HEART;
        const fs = f1.firstChild;
        if (!inLikes) fs.classList.add("off");
        if (cnt) {
            btn.insertBefore(es, cnt);
            btn.insertBefore(fs, cnt);
        } else {
            btn.appendChild(es);
            btn.appendChild(fs);
        }
        if (inLikes) btn.classList.add("liked");
        btn.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            const isLiked = btn.classList.contains("liked");
            btn.classList.toggle("liked", !isLiked);
            es.classList.toggle("off", !isLiked);
            fs.classList.toggle("off", isLiked);
            if (cnt) {
                const n =
                    parseInt(cnt.textContent.replace(/[^0-9]/g, ""), 10) || 0;
                cnt.textContent = isLiked ? n - 1 : n + 1;
            }
        });
    });
    document.querySelectorAll(".Post-Action-Btn.Bookmark").forEach((btn) => {
        const cnt = btn.querySelector(".Post-Action-Count");
        btn.querySelectorAll("svg").forEach((s) => s.remove());
        const e1 = document.createElement("span");
        e1.innerHTML = EMPTY_BK;
        const es = e1.firstChild;
        const f1 = document.createElement("span");
        f1.innerHTML = FULL_BK;
        const fs = f1.firstChild;
        fs.classList.add("off");
        if (cnt) {
            btn.insertBefore(es, cnt);
            btn.insertBefore(fs, cnt);
        } else {
            btn.appendChild(es);
            btn.appendChild(fs);
        }
        btn.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            const isBk = btn.classList.contains("bookmarked");
            btn.classList.toggle("bookmarked", !isBk);
            es.classList.toggle("off", !isBk);
            fs.classList.toggle("off", isBk);
        });
    });

    let activeMoreMenu = null,
        activeMenuEl = null,
        menuTrackRaf = null;
    const postMoreMenuPost = document.querySelector(".Post-More-Menu.Post");
    const postMoreMenuProduct = document.querySelector(
        ".Post-More-Menu.Product",
    );
    const postMoreMenuProductOther = document.querySelector(
        ".Post-More-Menu.ProductOther",
    );
    const postMoreMenuShare = document.querySelector(".Post-More-Menu.Share");
    const allMoreMenus = [
        postMoreMenuPost,
        postMoreMenuProduct,
        postMoreMenuProductOther,
        postMoreMenuShare,
    ];

    function closeAllMoreMenus() {
        allMoreMenus.forEach((m) => m?.classList.add("off"));
        activeMoreMenu = null;
        activeMenuEl = null;
        if (menuTrackRaf) {
            cancelAnimationFrame(menuTrackRaf);
            menuTrackRaf = null;
        }
    }
    function trackMenuPosition() {
        if (!activeMoreMenu || !activeMenuEl) return;
        const rect = activeMoreMenu.getBoundingClientRect();
        const menuW = activeMenuEl.offsetWidth;
        let left = rect.left;
        if (left + menuW > window.innerWidth - 8)
            left = Math.max(8, rect.right - menuW);
        activeMenuEl.style.top = `${rect.bottom + 4}px`;
        activeMenuEl.style.left = `${left}px`;
        menuTrackRaf = requestAnimationFrame(trackMenuPosition);
    }
    function positionMenuUnderBtn(menuEl, btnEl) {
        if (menuTrackRaf) cancelAnimationFrame(menuTrackRaf);
        menuEl.style.position = "fixed";
        menuEl.style.zIndex = "9999";
        activeMenuEl = menuEl;
        activeMoreMenu = btnEl;
        trackMenuPosition();
    }
    function openMoreMenu(menuEl, btnEl) {
        if (!menuEl) return;
        if (!menuEl.classList.contains("off") && activeMoreMenu === btnEl) {
            closeAllMoreMenus();
            return;
        }
        closeAllMoreMenus();
        positionMenuUnderBtn(menuEl, btnEl);
        menuEl.classList.remove("off");
        activeMoreMenu = btnEl;
    }

    // 소모달 열기/닫기 헬퍼
    function openSmallModal(sel) {
        closeAllMoreMenus();
        const m = document.querySelector(sel);
        if (m) {
            m.classList.remove("off");
            modalBackDrop?.classList.remove("off");
        }
    }
    function closeSmallModal(sel) {
        document.querySelector(sel)?.classList.add("off");
        modalBackDrop?.classList.add("off");
    }

    // ── 게시글 더보기 메뉴 ──
    postMoreMenuPost?.addEventListener("click", (e) => {
        const btn = e.target.closest(".Menu-Button");
        if (!btn) return;
        e.preventDefault();
        e.stopPropagation();

        // Approve / Disapprove 토글
        if (btn.classList.contains("ApproveToggle")) {
            const approved = btn.dataset.approved === "true";
            const username = btn.dataset.username;
            const newApproved = !approved;
            btn.dataset.approved = String(newApproved);
            const textEl = btn.querySelector(".ApproveText");
            const iconEl = btn.querySelector(".ApproveIcon");
            if (textEl)
                textEl.textContent = newApproved
                    ? `${username} Disapprove`
                    : `${username} Approve`;
            if (iconEl) {
                iconEl.innerHTML = newApproved
                    ? `<svg viewBox="0 0 24 24" aria-hidden="true"><g><path d="M10 4c-1.105 0-2 .9-2 2s.895 2 2 2 2-.9 2-2-.895-2-2-2zM6 6c0-2.21 1.791-4 4-4s4 1.79 4 4-1.791 4-4 4-4-1.79-4-4zm12.586 3l-2.043-2.04 1.414-1.42L20 7.59l2.043-2.05 1.414 1.42L21.414 9l2.043 2.04-1.414 1.42L20 10.41l-2.043 2.05-1.414-1.42L18.586 9zM3.651 19h12.698c-.337-1.8-1.023-3.21-1.945-4.19C13.318 13.65 11.838 13 10 13s-3.317.65-4.404 1.81c-.922.98-1.608 2.39-1.945 4.19zm.486-5.56C5.627 11.85 7.648 11 10 11s4.373.85 5.863 2.44c1.477 1.58 2.366 3.8 2.632 6.46l.11 1.1H1.395l.11-1.1c.266-2.66 1.155-4.88 2.632-6.46z"></path></g></svg>`
                    : `<svg viewBox="0 0 24 24" aria-hidden="true"><g><path d="M10 4c-1.105 0-2 .9-2 2s.895 2 2 2 2-.9 2-2-.895-2-2-2zM6 6c0-2.21 1.791-4 4-4s4 1.79 4 4-1.791 4-4 4-4-1.79-4-4zm4 7c-3.053 0-5.563 1.193-7.443 3.596l1.548 1.207C5.573 15.922 7.541 15 10 15s4.427.922 5.895 2.803l1.548-1.207C15.563 14.193 13.053 13 10 13zm8-6V5h-3V3h-2v2h-3v2h3v3h2V7h3z"></path></g></svg>`;
            }
            return;
        }
        if (btn.classList.contains("BanUser")) {
            openSmallModal(".Small-Modal.Ban-User");
            return;
        }
        if (btn.classList.contains("Report")) {
            closeAllMoreMenus();
            document
                .querySelector(".Notification-Dialog--Report")
                ?.classList.remove("off");
            return;
        }
        closeAllMoreMenus();
    });

    // ── 내 상품 더보기 메뉴 ──
    postMoreMenuProduct?.addEventListener("click", (e) => {
        const btn = e.target.closest(".Menu-Button");
        if (!btn) return;
        e.preventDefault();
        e.stopPropagation();
        if (btn.classList.contains("DeleteProduct")) {
            openSmallModal(".Small-Modal.Delete-Product");
            return;
        }
        if (btn.classList.contains("Edit")) {
            console.log("상품 수정");
            closeAllMoreMenus();
            return;
        }
        closeAllMoreMenus();
    });

    // ── 타인 상품 더보기 (관심없음) ──
    postMoreMenuProductOther?.addEventListener("click", (e) => {
        const btn = e.target.closest(".Menu-Button");
        if (!btn) return;
        e.preventDefault();
        e.stopPropagation();
        if (btn.classList.contains("NotInterested")) {
            openSmallModal(".Small-Modal.Not-Interested");
            return;
        }
        closeAllMoreMenus();
    });

    // ── 차단 모달 이벤트 ──
    document
        .querySelectorAll(
            ".Small-Modal.Ban-User .Small-Button.Ban, .Small-Modal.Ban-User .Small-Button.Cancel, .Small-Modal.Ban-User .Close-Button",
        )
        .forEach((el) => {
            el.addEventListener("click", () =>
                closeSmallModal(".Small-Modal.Ban-User"),
            );
        });

    // ── 관심없음 모달 이벤트 ──
    document
        .getElementById("confirmNotInterested")
        ?.addEventListener("click", () => {
            // 현재 열었던 카드 숨기거나 표시 처리
            closeSmallModal(".Small-Modal.Not-Interested");
            showClipboardToast("이 상품이 더 이상 표시되지 않습니다.");
        });
    document.querySelectorAll(".Not-Interested-Close").forEach((el) => {
        el.addEventListener("click", () =>
            closeSmallModal(".Small-Modal.Not-Interested"),
        );
    });

    // ── 상품 삭제 모달 이벤트 ──
    document
        .getElementById("confirmDeleteProduct")
        ?.addEventListener("click", () => {
            closeSmallModal(".Small-Modal.Delete-Product");
            showClipboardToast("상품이 삭제되었습니다.");
        });
    document.querySelectorAll(".Delete-Product-Close").forEach((el) => {
        el.addEventListener("click", () =>
            closeSmallModal(".Small-Modal.Delete-Product"),
        );
    });

    // ── 신고 모달 이벤트 ──
    document
        .querySelector(".Notification-Dialog__Close")
        ?.addEventListener("click", () =>
            document
                .querySelector(".Notification-Dialog--Report")
                ?.classList.add("off"),
        );
    document
        .querySelector(".Notification-Dialog__Backdrop")
        ?.addEventListener("click", () =>
            document
                .querySelector(".Notification-Dialog--Report")
                ?.classList.add("off"),
        );

    // ── 외부 클릭 시 더보기 메뉴 닫기 ──
    document.addEventListener("click", (e) => {
        if (
            !e.target.closest(".Post-More-Menu") &&
            !e.target.closest(".Post-More-Button") &&
            !e.target.closest(".Post-Action-Btn.Share")
        )
            closeAllMoreMenus();
    });

    // ── 공유 버튼 (Share) + 더보기 버튼 (More) 이벤트 위임 ──
    document.body.addEventListener(
        "click",
        (e) => {
            // 공유 버튼
            const shareBtn = e.target.closest(".Post-Action-Btn.Share");
            if (shareBtn) {
                e.preventDefault();
                e.stopPropagation();
                openMoreMenu(postMoreMenuShare, shareBtn);
                return;
            }
            // 더보기 버튼
            const moreBtn = e.target.closest(".Post-Card .Post-More-Button");
            if (moreBtn) {
                e.preventDefault();
                e.stopPropagation();
                const card = moreBtn.closest(".Post-Card");
                // 내 상품 탭인지 확인
                const isMyProduct = !!card?.closest(
                    ".Profile-Content.MyProducts",
                );
                // data-card-type 속성으로도 판별 가능
                const cardType = moreBtn.dataset.cardType;
                let targetMenu;
                if (isMyProduct || cardType === "myproduct") {
                    targetMenu = postMoreMenuProduct;
                } else if (card?.querySelector(".Post-Title")) {
                    // 내 탭이 아닌데 상품 카드면 → 타인 상품 (관심없음)
                    targetMenu = postMoreMenuProductOther;
                } else {
                    targetMenu = postMoreMenuPost;
                }
                openMoreMenu(targetMenu, moreBtn);
                return;
            }
        },
        true,
    );

    // ── 공유 메뉴 클릭 처리 ──
    postMoreMenuShare?.addEventListener("click", (e) => {
        const btn = e.target.closest(".Menu-Button");
        if (!btn) return;
        e.preventDefault();
        e.stopPropagation();
        if (btn.classList.contains("CopyLink")) {
            closeAllMoreMenus();
            navigator.clipboard
                ?.writeText(window.location.href)
                .then(() => showClipboardToast("클립보드로 복사함"))
                .catch(() => showClipboardToast("링크를 복사하지 못했습니다"));
            return;
        }
        if (btn.classList.contains("SendChat")) {
            closeAllMoreMenus();
            openShareChatModal();
            return;
        }
        if (btn.classList.contains("AddBookmark")) {
            closeAllMoreMenus();
            openShareBookmarkModal();
            return;
        }
        closeAllMoreMenus();
    });

    // ── 공유 Chat 모달 ──
    let activeShareModal = null;
    function closeShareModal() {
        if (!activeShareModal) return;
        activeShareModal.remove();
        activeShareModal = null;
        document.body.classList.remove("modal-open");
    }
    function openShareChatModal() {
        closeShareModal();
        const users = [];
        document.querySelectorAll(".Sidebar-User-Cell").forEach((cell, i) => {
            const name =
                cell.querySelector(".Sidebar-User-Name")?.textContent.trim() ||
                "";
            const handle =
                cell
                    .querySelector(".Sidebar-User-Handle")
                    ?.textContent.trim() || "";
            const avatar =
                cell.querySelector(".Sidebar-User-Avatar-Img")?.src || "";
            if (name || handle) users.push({ id: i, name, handle, avatar });
        });
        const rowsHtml = users.length
            ? users
                  .map(
                      (u) =>
                          `<button type="button" class="Share-Sheet-User">
                <span class="Share-Sheet-User-Avatar"><img src="${escapeHtml(u.avatar)}" alt="${escapeHtml(u.name)}"></span>
                <span class="Share-Sheet-User-Body">
                    <span class="Share-Sheet-User-Name">${escapeHtml(u.name)}</span>
                    <span class="Share-Sheet-User-Handle">${escapeHtml(u.handle)}</span>
                </span>
            </button>`,
                  )
                  .join("")
            : `<p class="Share-Sheet-Empty">전송할 수 있는 사용자가 없습니다.</p>`;

        const modal = document.createElement("div");
        modal.className = "Share-Sheet";
        modal.innerHTML = `
            <div class="Share-Sheet-Backdrop"></div>
            <div class="Share-Sheet-Card" role="dialog" aria-modal="true">
                <div class="Share-Sheet-Header">
                    <button type="button" class="Share-Sheet-Icon-Btn Share-Sheet-Close-Btn" aria-label="닫기">
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M10.59 12L4.54 5.96l1.42-1.42L12 10.59l6.04-6.05 1.42 1.42L13.41 12l6.05 6.04-1.42 1.42L12 13.41l-6.04 6.05-1.42-1.42L10.59 12z"/></svg>
                    </button>
                    <h2 class="Share-Sheet-Title">공유하기</h2>
                    <span class="Share-Sheet-Header-Spacer"></span>
                </div>
                <div class="Share-Sheet-Search">
                    <input type="text" class="Share-Sheet-Search-Input" placeholder="검색" aria-label="검색">
                </div>
                <div class="Share-Sheet-List">${rowsHtml}</div>
            </div>`;
        modal
            .querySelector(".Share-Sheet-Backdrop")
            .addEventListener("click", closeShareModal);
        modal
            .querySelector(".Share-Sheet-Close-Btn")
            .addEventListener("click", closeShareModal);
        modal.querySelectorAll(".Share-Sheet-User").forEach((btn) =>
            btn.addEventListener("click", () => {
                closeShareModal();
                showClipboardToast("쪽지로 전송됐습니다.");
            }),
        );
        document.body.appendChild(modal);
        document.body.classList.add("modal-open");
        activeShareModal = modal;
    }

    // ── 공유 북마크 모달 ──
    function openShareBookmarkModal() {
        closeShareModal();
        const modal = document.createElement("div");
        modal.className = "Share-Sheet";
        modal.innerHTML = `
            <div class="Share-Sheet-Backdrop"></div>
            <div class="Share-Sheet-Card Share-Sheet-Card--Bookmark" role="dialog" aria-modal="true">
                <div class="Share-Sheet-Header">
                    <button type="button" class="Share-Sheet-Icon-Btn Share-Sheet-Close-Btn" aria-label="닫기">
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M10.59 12L4.54 5.96l1.42-1.42L12 10.59l6.04-6.05 1.42 1.42L13.41 12l6.05 6.04-1.42 1.42L12 13.41l-6.04 6.05-1.42-1.42L10.59 12z"/></svg>
                    </button>
                    <h2 class="Share-Sheet-Title">폴더에 추가</h2>
                    <span class="Share-Sheet-Header-Spacer"></span>
                </div>
                <button type="button" class="Share-Sheet-Create-Folder Share-Sheet-Close-Btn">새 북마크 폴더 만들기</button>
                <button type="button" class="Share-Sheet-Folder" id="allBookmarkFolder">
                    <span class="Share-Sheet-Folder-Icon">
                        <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M2.998 8.5c0-1.38 1.119-2.5 2.5-2.5h9c1.381 0 2.5 1.12 2.5 2.5v14.12l-7-3.5-7 3.5V8.5zM18.5 2H8.998v2H18.5c.275 0 .5.224.5.5V15l2 1.4V4.5c0-1.38-1.119-2.5-2.5-2.5z"/></svg>
                    </span>
                    <span class="Share-Sheet-Folder-Name">모든 북마크</span>
                    <span class="Share-Sheet-Folder-Check" id="bookmarkCheck">
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M9.64 18.952l-5.55-4.861 1.317-1.504 3.951 3.459 8.459-10.948L19.4 6.32 9.64 18.952z"/></svg>
                    </span>
                </button>
            </div>`;
        modal
            .querySelector(".Share-Sheet-Backdrop")
            .addEventListener("click", closeShareModal);
        modal
            .querySelector(".Share-Sheet-Close-Btn")
            .addEventListener("click", closeShareModal);
        const folderBtn = modal.querySelector("#allBookmarkFolder");
        const checkEl = modal.querySelector("#bookmarkCheck");
        let bookmarked = false;
        checkEl.style.color = "transparent";
        folderBtn.addEventListener("click", () => {
            bookmarked = !bookmarked;
            checkEl.style.color = bookmarked ? "#1d9bf0" : "transparent";
            if (bookmarked) {
                closeShareModal();
                showClipboardToast("북마크에 추가됐습니다.");
            }
        });
        document.body.appendChild(modal);
        document.body.classList.add("modal-open");
        activeShareModal = modal;
    }

    // Escape 키로 공유 모달 닫기
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            closeAllMoreMenus();
            closeShareModal();
        }
    });

    // [FIX 4] 사이드바 팔로우 버튼 hover
    document.querySelectorAll(".Sidebar-Follow-Btn").forEach((btn) => {
        const textEl = btn.querySelector(".Sidebar-Follow-Btn-Text");
        if (!textEl) return;
        const original = textEl.textContent.trim();
        btn.addEventListener("mouseenter", () => {
            if (original === "Approved") textEl.textContent = "Disapprove";
        });
        btn.addEventListener("mouseleave", () => {
            textEl.textContent = original;
        });
    });

    // 내 상품 등록 모달
    const productWriteModal = document.querySelector(".Product-Write-Modal");
    document
        .querySelector(".Content-Header-Button")
        ?.addEventListener("click", () => openModal(productWriteModal));
    document
        .querySelector(".Product-Write-Modal .Modal-Close-Button")
        ?.addEventListener("click", () => closeModal(productWriteModal));
    document
        .querySelector(".Input-Footer-Button.cancel")
        ?.addEventListener("click", (e) => {
            e.preventDefault();
            closeModal(productWriteModal);
        });
    document
        .querySelector(".Input-Footer-Button.submit")
        ?.addEventListener("click", (e) => {
            e.preventDefault();
            closeModal(productWriteModal);
        });

    // [FIX 7] 상품 수량 숫자만
    const stockInput = document.querySelector(".Product-Stock-Input");
    if (stockInput) {
        stockInput.addEventListener("input", (e) => {
            e.target.value = e.target.value.replace(/[^0-9]/g, "");
        });
        stockInput.addEventListener("keydown", (e) => {
            const allowed = [
                "Backspace",
                "Delete",
                "ArrowLeft",
                "ArrowRight",
                "ArrowUp",
                "ArrowDown",
                "Tab",
                "Home",
                "End",
            ];
            if (allowed.includes(e.key) || e.ctrlKey || e.metaKey) return;
            if (e.key >= "0" && e.key <= "9") return;
            e.preventDefault();
        });
    }

    // 카테고리 칩
    const categoryScroll = document.getElementById("categoryScroll");
    const scrollLeftBtn = document.getElementById("scrollLeft");
    const scrollRightBtn = document.getElementById("scrollRight");
    function updateScrollArrows() {
        if (!categoryScroll) return;
        const { scrollLeft, scrollWidth, clientWidth } = categoryScroll;
        scrollLeftBtn?.style.setProperty(
            "display",
            scrollLeft > 0 ? "flex" : "none",
        );
        scrollRightBtn?.style.setProperty(
            "display",
            scrollLeft < scrollWidth - clientWidth - 1 ? "flex" : "none",
        );
    }
    categoryScroll?.addEventListener("scroll", updateScrollArrows);
    window.addEventListener("resize", updateScrollArrows);
    updateScrollArrows();
    scrollLeftBtn?.addEventListener("click", () =>
        categoryScroll.scrollBy({ left: -160, behavior: "smooth" }),
    );
    scrollRightBtn?.addEventListener("click", () =>
        categoryScroll.scrollBy({ left: 160, behavior: "smooth" }),
    );

    // 태그
    const tagList = document.getElementById("tagList");
    const postTagsInput = document.querySelector("input[name='postTag']");
    const composerTagToggle = document.getElementById("composerTagToggle");
    const composerTagEditor = document.getElementById("composerTagEditor");
    const productTagInput = document.getElementById("productTag");
    const originalChips = categoryScroll
        ? Array.from(categoryScroll.querySelectorAll(".Cat-Chip"))
        : [];
    let chipViewState = "top",
        selectedTags = [];

    function renderTags() {
        if (!tagList) return;
        if (!selectedTags.length) {
            tagList.classList.add("off");
            tagList.innerHTML = "";
            if (postTagsInput) postTagsInput.value = "";
            return;
        }
        tagList.classList.remove("off");
        tagList.innerHTML = selectedTags
            .map(
                ({ label }) =>
                    `<span class="Category-Tag" data-tag="${label}" style="cursor:pointer;" title="클릭하여 제거">${label}<button type="button" class="Tag-Remove-Btn" aria-label="태그 삭제">✕</button></span>`,
            )
            .join("");
        if (postTagsInput)
            postTagsInput.value = selectedTags.map((t) => t.label).join(",");
    }
    function addTag(label, chipKey) {
        const t = label.trim();
        if (!t || selectedTags.some((x) => x.chipKey === chipKey)) return;
        selectedTags.push({ label: t, chipKey });
        renderTags();
    }
    function removeTagByKey(chipKey) {
        selectedTags = selectedTags.filter((t) => t.chipKey !== chipKey);
        renderTags();
        categoryScroll
            ?.querySelectorAll(".Cat-Chip--Sub-Active,.Cat-Chip--Active")
            .forEach((chip) => {
                const key = chip.dataset.chipKey || chip.dataset.cat;
                if (key === chipKey)
                    chip.classList.remove(
                        "Cat-Chip--Sub-Active",
                        "Cat-Chip--Active",
                    );
            });
    }
    // [FIX 9] 태그 클릭으로 제거
    tagList?.addEventListener("click", (e) => {
        const tagEl = e.target.closest(".Category-Tag");
        if (!tagEl) return;
        const label = tagEl.dataset.tag;
        if (!label) return;
        const found = selectedTags.find((t) => t.label === label);
        if (found) removeTagByKey(found.chipKey);
    });
    function showTopChips() {
        if (!categoryScroll) return;
        chipViewState = "top";
        categoryScroll.innerHTML = "";
        originalChips.forEach((chip) => {
            // 이 대카테고리 아래 서브태그가 하나라도 선택돼 있으면 활성화 표시
            const subs = (chip.dataset.subs || "")
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean);
            const hasSubSelected =
                subs.length > 0 &&
                subs.some((s) => selectedTags.some((t) => t.chipKey === s));
            // 서브 없는 칩은 자신이 직접 태그됐을 때 활성화
            const selfSelected =
                subs.length === 0 &&
                selectedTags.some((t) => t.chipKey === chip.dataset.cat);
            chip.classList.toggle(
                "Cat-Chip--Active",
                hasSubSelected || selfSelected,
            );
            chip.classList.remove("Cat-Chip--Parent-Highlight");
            categoryScroll.appendChild(chip);
        });
        categoryScroll.scrollLeft = 0;
        updateScrollArrows();
    }
    function showSubChips(parentName, subsArray, parentChipKey) {
        if (!categoryScroll) return;
        chipViewState = "sub";
        categoryScroll.innerHTML = "";
        const b = document.createElement("button");
        b.type = "button";
        b.className = "Cat-Chip Cat-Chip--Back";
        b.textContent = `‹ ${parentName}`;
        b.dataset.action = "back";
        categoryScroll.appendChild(b);
        subsArray.forEach((sub) => {
            const sc = document.createElement("button");
            sc.type = "button";
            sc.className = "Cat-Chip";
            sc.dataset.cat = sub;
            sc.dataset.chipKey = sub;
            sc.textContent = sub;
            if (selectedTags.some((t) => t.chipKey === sub))
                sc.classList.add("Cat-Chip--Sub-Active");
            categoryScroll.appendChild(sc);
        });
        categoryScroll.scrollLeft = 0;
        updateScrollArrows();
    }
    categoryScroll?.addEventListener("click", (e) => {
        const chip = e.target.closest(".Cat-Chip");
        if (!chip) return;
        e.preventDefault();
        // 뒤로가기
        if (chip.dataset.action === "back") {
            showTopChips();
            return;
        }
        const hasSubs = chip.classList.contains("Cat-Chip--Has-Subs");
        // 탑뷰: 서브 있는 칩 → 서브뷰 진입만 (자체 태그 추가 없음)
        if (hasSubs && chipViewState === "top") {
            const pn = chip.dataset.cat;
            const subs = (chip.dataset.subs || "")
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean);
            showSubChips(pn, subs, chip.dataset.cat);
            return;
        }
        // 서브뷰: 서브칩 토글
        if (chipViewState === "sub") {
            const ck = chip.dataset.chipKey || chip.dataset.cat;
            const ia = chip.classList.contains("Cat-Chip--Sub-Active");
            chip.classList.toggle("Cat-Chip--Sub-Active", !ia);
            if (ia) removeTagByKey(ck);
            else addTag(ck, ck);
            return;
        }
        // 탑뷰: 서브 없는 칩 → 직접 태그 토글
        const ck = chip.dataset.cat;
        const ia = chip.classList.contains("Cat-Chip--Active");
        chip.classList.toggle("Cat-Chip--Active", !ia);
        if (ia) removeTagByKey(ck);
        else addTag(ck, ck);
        updateScrollArrows();
    });
    composerTagToggle?.addEventListener("click", () => {
        composerTagToggle.classList.add("off");
        composerTagEditor?.classList.remove("off");
        productTagInput?.focus();
    });
    productTagInput?.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            const v = productTagInput.value.trim();
            if (v) addTag(v, `manual:${v}`);
            productTagInput.value = "";
            composerTagEditor?.classList.add("off");
            composerTagToggle?.classList.remove("off");
        }
        if (e.key === "Escape") {
            productTagInput.value = "";
            composerTagEditor?.classList.add("off");
            composerTagToggle?.classList.remove("off");
        }
    });
    productTagInput?.addEventListener("blur", () => {
        const v = productTagInput.value.trim();
        if (v) addTag(v, `manual:${v}`);
        productTagInput.value = "";
        composerTagEditor?.classList.add("off");
        composerTagToggle?.classList.remove("off");
    });

    // 이미지 프리뷰
    const mediaPreviewOverlay = document.querySelector(
        ".Post-Media-Preview-Overlay",
    );
    const mediaPreviewImage = document.querySelector(
        ".Post-Media-Preview-Image",
    );
    document
        .querySelector(".Post-Media-Preview-Close")
        ?.addEventListener("click", () => {
            mediaPreviewOverlay?.classList.add("off");
            document.body.classList.remove("modal-open");
        });
    mediaPreviewOverlay?.addEventListener("click", (e) => {
        if (e.target === mediaPreviewOverlay) {
            mediaPreviewOverlay.classList.add("off");
            document.body.classList.remove("modal-open");
        }
    });
    document.querySelector(".Primary-Column")?.addEventListener(
        "click",
        (e) => {
            const imgEl = e.target.closest(".Post-Media-Img");
            if (imgEl && mediaPreviewOverlay && mediaPreviewImage) {
                e.preventDefault();
                mediaPreviewImage.src = imgEl.src;
                mediaPreviewImage.alt = imgEl.alt;
                mediaPreviewOverlay.classList.remove("off");
                document.body.classList.add("modal-open");
            }
        },
        true,
    );
};

function placeCaretAtEnd(element) {
    const selection = window.getSelection();
    if (!selection) return;
    const range = document.createRange();
    range.selectNodeContents(element);
    range.collapse(false);
    selection.removeAllRanges();
    selection.addRange(range);
}
