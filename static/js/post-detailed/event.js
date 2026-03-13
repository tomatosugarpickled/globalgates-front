function parseTwemoji(scope) {
    if (!scope || !window.twemoji) {
        return;
    }

    window.twemoji.parse(scope, { folder: "svg", ext: ".svg" });
}

const composerFormatButtonLabels = {
    bold: {
        inactive: "굵게, (CTRL+B) 님",
        active: "굵게 취소, (CTRL+B) 님",
    },
    italic: {
        inactive: "기울임꼴, (CTRL+I) 님",
        active: "기울임꼴 취소, (CTRL+I) 님",
    },
};

const composerFormatStyleMap = {
    bold: {
        style: "fontWeight",
        value: "bold",
        tagNames: ["B", "STRONG"],
    },
    italic: {
        style: "fontStyle",
        value: "italic",
        tagNames: ["I", "EM"],
    },
};

const composerEmojiCategoryMeta = {
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
        icon: '<svg viewBox="0 0 24 24" aria-hidden="true" class="tweet-modal__emoji-tab-icon"><g><path d="M12 3.5c3.77 0 6.75 2.86 6.75 6.41 0 3.17-1.88 4.94-4.15 6.28-.74.44-1.54.9-1.6 1.86-.02.38-.33.68-.71.68h-.6a.71.71 0 01-.71-.67c-.07-.95-.86-1.42-1.6-1.85C7.13 14.85 5.25 13.08 5.25 9.91 5.25 6.36 8.23 3.5 12 3.5zm-4.79-.97c.61 0 1.1.49 1.1 1.1 0 .32-.14.63-.39.84-.4.34-.78.78-1.08 1.3-.18.3-.49.48-.84.48-.61 0-1.1-.49-1.1-1.1 0-.14.03-.29.09-.42.47-1.04 1.17-1.93 2.02-2.63.19-.15.43-.24.7-.24zm9.58 0c.27 0 .51.09.7.24.85.7 1.55 1.6 2.02 2.63.06.13.09.28.09.42 0 .61-.49 1.1-1.1 1.1-.35 0-.66-.18-.84-.48-.3-.52-.68-.96-1.08-1.3a1.1 1.1 0 01-.39-.84c0-.61.49-1.1 1.1-1.1z"></path></g></svg>',
    },
    food: {
        label: "음식 및 음료",
        sectionTitle: "음식 및 음료",
        icon: '<svg viewBox="0 0 24 24" aria-hidden="true" class="tweet-modal__emoji-tab-icon"><g><path d="M5 10.5c0-3.59 3.36-6.5 7.5-6.5s7.5 2.91 7.5 6.5v.58a5.42 5.42 0 01-2.08 4.26L16.5 21H8.5l-1.42-5.66A5.42 5.42 0 015 11.08v-.58zm2 0v.58c0 1.08.5 2.08 1.36 2.76l.3.24.95 3.92h5.78l.95-3.92.3-.24a3.42 3.42 0 001.36-2.76v-.58c0-2.48-2.47-4.5-5.5-4.5S7 8.02 7 10.5z"></path></g></svg>',
    },
    activities: {
        label: "활동",
        sectionTitle: "활동",
        icon: '<svg viewBox="0 0 24 24" aria-hidden="true" class="tweet-modal__emoji-tab-icon"><g><path d="M12 2.25c5.385 0 9.75 4.365 9.75 9.75S17.385 21.75 12 21.75 2.25 17.385 2.25 12 6.615 2.25 12 2.25zm0 1.5A8.25 8.25 0 103.75 12 8.26 8.26 0 0012 3.75zm-4.1 4.5c.27 0 .53.12.71.33l1.94 2.55 3.12-2.29c.36-.27.87-.22 1.18.12l2.83 3.12a.88.88 0 01-.07 1.24.88.88 0 01-1.24-.07l-2.3-2.54-3.16 2.33a.88.88 0 01-1.23-.16L7.2 9.64a.88.88 0 01.7-1.39z"></path></g></svg>',
    },
    travel: {
        label: "여행 및 장소",
        sectionTitle: "여행 및 장소",
        icon: '<svg viewBox="0 0 24 24" aria-hidden="true" class="tweet-modal__emoji-tab-icon"><g><path d="M12 2.25c-4.142 0-7.5 3.245-7.5 7.248 0 5.207 6.46 11.611 6.735 11.881a1.08 1.08 0 001.53 0c.275-.27 6.735-6.674 6.735-11.881 0-4.003-3.358-7.248-7.5-7.248zm0 17.493c-1.758-1.878-6-6.838-6-10.245 0-3.172 2.686-5.748 6-5.748s6 2.576 6 5.748c0 3.407-4.242 8.367-6 10.245zm0-13.243a3 3 0 100 6 3 3 0 000-6z"></path></g></svg>',
    },
    objects: {
        label: "사물",
        sectionTitle: "사물",
        icon: '<svg viewBox="0 0 24 24" aria-hidden="true" class="tweet-modal__emoji-tab-icon"><g><path d="M12 2.5c2.07 0 3.75 1.68 3.75 3.75 0 1.45-.83 2.71-2.04 3.33l-.21.11V11h.5A2.5 2.5 0 0116.5 13.5v1.38c0 1.27-.7 2.43-1.82 3.03l-.93.5V21.5h-3.5v-3.09l-.93-.5A3.44 3.44 0 017.5 14.88V13.5A2.5 2.5 0 0110 11h.5V9.69l-.21-.11A3.75 3.75 0 018.25 6.25 3.75 3.75 0 0112 2.5zm0 1.5a2.25 2.25 0 100 4.5 2.25 2.25 0 000-4.5zm-2 8.5a1 1 0 00-1 1v1.38c0 .72.4 1.39 1.04 1.73l1.71.92v1.47h.5v-1.47l1.71-.92A1.97 1.97 0 0015 14.88V13.5a1 1 0 00-1-1h-4z"></path></g></svg>',
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

const composerEmojiCategoryData = {
    smileys: [
        "😀",
        "😃",
        "😄",
        "😁",
        "😂",
        "😊",
        "😉",
        "😍",
        "🥰",
        "😎",
        "🤔",
        "😭",
        "🥳",
        "🤩",
        "😴",
        "😤",
        "🤯",
        "🫠",
    ],
    animals: [
        "🐶",
        "🐱",
        "🐻",
        "🐼",
        "🦊",
        "🐯",
        "🦁",
        "🐸",
        "🐵",
        "🐧",
        "🐦",
        "🦄",
        "🐝",
        "🦋",
        "🌸",
        "🌿",
        "🌙",
        "⭐",
    ],
    food: [
        "🍔",
        "🍕",
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
        "🥤",
    ],
    activities: [
        "⚽",
        "🏀",
        "🏈",
        "⚾",
        "🎾",
        "🎮",
        "🎧",
        "🎤",
        "🎬",
        "📚",
        "🎯",
        "🎨",
        "🧩",
        "🎻",
        "🥁",
        "🏆",
    ],
    travel: [
        "✈️",
        "🚗",
        "🚆",
        "🚢",
        "🚀",
        "🏝️",
        "🏔️",
        "🏙️",
        "🌉",
        "🗼",
        "🗽",
        "🏟️",
        "🌍",
        "🧭",
        "🧳",
        "📍",
    ],
    objects: [
        "📱",
        "💻",
        "⌚",
        "📷",
        "🎁",
        "💡",
        "🔒",
        "🧸",
        "🛍️",
        "💼",
        "📦",
        "🔋",
        "📡",
        "🧪",
        "🛠️",
        "💎",
    ],
    symbols: [
        "❤️",
        "💙",
        "💚",
        "💛",
        "🖤",
        "💯",
        "✨",
        "🔥",
        "✅",
        "❌",
        "⚠️",
        "❓",
        "➕",
        "➖",
        "♻️",
        "🔔",
    ],
    flags: [
        "🇰🇷",
        "🇺🇸",
        "🇯🇵",
        "🇨🇳",
        "🇬🇧",
        "🇫🇷",
        "🇩🇪",
        "🇸🇬",
        "🇦🇺",
        "🇨🇦",
        "🇪🇸",
        "🇮🇹",
        "🇹🇭",
        "🇻🇳",
        "🇧🇷",
        "🇮🇳",
    ],
};

window.addEventListener("DOMContentLoaded", setupPostDetailPage);

// 게시물 상세 화면의 액션 바 초기화만 연결한다.
function setupPostDetailPage() {
    setupInlineReplyComposer();
    setupPostDetailActions();
}

// 메인 게시글 모달의 답글 작성 기능 중 상세 화면에 필요한 것만 가볍게 다시 묶는다.
function setupInlineReplyComposer() {
    const composer = document.querySelector(".post-detail-inline-reply");
    if (!composer) {
        return;
    }

    const q = (selector) => composer.querySelector(selector);
    const qAll = (selector) => Array.from(composer.querySelectorAll(selector));
    const editor = q("[data-testid='tweetTextarea_0']");
    const footerBottom = composer.querySelector(".tweet-modal__footer-bottom");
    const context = q(".post-detail-inline-reply-context");
    const emojiButton = q("[data-testid='emojiButton']");
    const emojiPicker = q(".tweet-modal__emoji-picker");
    const emojiSearchInput = q("[data-testid='emojiSearchInput']");
    const emojiContent = q("[data-testid='emojiPickerContent']");
    const emojiTabs = qAll(".tweet-modal__emoji-tab");
    const mediaUploadButton = q("[data-testid='mediaUploadButton']");
    const fileInput = q("[data-testid='fileInput']");
    const attachmentPreview = q("[data-attachment-preview]");
    const attachmentMedia = q("[data-attachment-media]");
    const geoButton = q("[data-testid='geoButton']");
    const geoButtonPath = geoButton?.querySelector("path");
    const locationView = q(".tweet-modal__location-view");
    const locationCloseButton = q("[data-testid='location-back']");
    const locationSearchInput = q("[data-location-search]");
    const locationList = q("[data-location-list]");
    const locationItems = qAll(".tweet-modal__location-item");
    const locationDisplay = q("[data-location-display]");
    const locationName = q("[data-location-name]");
    const locationDeleteButton = q("[data-location-delete]");
    const locationCompleteButton = q("[data-location-complete]");
    const formatButtons = qAll("[data-format]");
    const submitButton = q("[data-testid='tweetButton']");
    const gauge = q("#replyGauge");
    const gaugeText = q("#replyGaugeText");
    const gifButton = q("[data-testid='gifSearchButton']");
    const maxLength = 500;
    const maxAttachments = 4;
    const emojiRecentsKey = "post_detail_inline_reply_recent_emojis";
    let activeEmojiCategory = "recent";
    let selectedLocation = null;
    let pendingLocation = null;
    let savedSelection = null;
    let attachedFiles = [];
    let attachmentPreviewUrls = [];
    let pendingFormats = new Set();

    function setFocusedState(nextFocused) {
        composer.classList.toggle("is-focused", nextFocused);
        if (footerBottom) {
            footerBottom.hidden = !nextFocused;
        }
        if (context) {
            context.hidden = !nextFocused;
        }
    }

    function getEditorLength() {
        return editor?.textContent?.replace(/\u00a0/g, " ").trim().length ?? 0;
    }

    function getRecentEmojis() {
        try {
            const saved = window.localStorage.getItem(emojiRecentsKey);
            const parsed = saved ? JSON.parse(saved) : [];
            return Array.isArray(parsed) ? parsed : [];
        } catch {
            return [];
        }
    }

    function saveRecentEmoji(emoji) {
        const next = getRecentEmojis().filter((item) => item !== emoji);
        next.unshift(emoji);
        try {
            window.localStorage.setItem(
                emojiRecentsKey,
                JSON.stringify(next.slice(0, 18)),
            );
        } catch {
            return;
        }
    }

    // 입력 상태, 첨부 상태, 글자 수를 한 번에 맞춰 submit 활성화와 게이지를 갱신한다.
    function syncInlineReplySubmitState() {
        const currentLength = getEditorLength();
        const remaining = maxLength - currentLength;
        const canSubmit =
            remaining >= 0 && (currentLength > 0 || attachedFiles.length > 0);

        if (gauge) {
            gauge.setAttribute(
                "aria-valuenow",
                String(Math.max(0, currentLength)),
            );
            gauge.style.setProperty(
                "--gauge-progress",
                `${Math.max(0, Math.min(360, (currentLength / maxLength) * 360))}deg`,
            );
        }
        if (gaugeText) {
            gaugeText.textContent = String(remaining);
            gaugeText.style.color = remaining < 0 ? "#f4212e" : "#536471";
        }
        if (submitButton) {
            submitButton.disabled = !canSubmit;
            submitButton.setAttribute("aria-disabled", String(!canSubmit));
        }
    }

    function saveEditorSelection() {
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0 || !editor) {
            return;
        }
        const range = selection.getRangeAt(0);
        if (editor.contains(range.commonAncestorContainer)) {
            savedSelection = range.cloneRange();
        }
    }

    function restoreEditorSelection() {
        if (!savedSelection) {
            return false;
        }
        const selection = window.getSelection();
        if (!selection) {
            return false;
        }
        selection.removeAllRanges();
        selection.addRange(savedSelection);
        return true;
    }

    function placeCaretAtEnd() {
        if (!editor) {
            return;
        }
        const range = document.createRange();
        range.selectNodeContents(editor);
        range.collapse(false);
        const selection = window.getSelection();
        selection?.removeAllRanges();
        selection?.addRange(range);
        saveEditorSelection();
    }

    function placeCaretAfterNode(node) {
        const range = document.createRange();
        range.setStartAfter(node);
        range.collapse(true);
        const selection = window.getSelection();
        selection?.removeAllRanges();
        selection?.addRange(range);
        saveEditorSelection();
    }

    function getFormatConfig(format) {
        return composerFormatStyleMap[format] ?? null;
    }

    function applyFormatStyles(element, formats) {
        const nextFormats = formats ?? pendingFormats;
        element.style.fontWeight = nextFormats.has("bold") ? "bold" : "";
        element.style.fontStyle = nextFormats.has("italic") ? "italic" : "";
        if (!element.style.fontWeight && !element.style.fontStyle) {
            element.removeAttribute("style");
        }
    }

    function getFormattedAncestor(node, format) {
        const config = getFormatConfig(format);
        if (!config) {
            return null;
        }

        let current =
            node?.nodeType === Node.TEXT_NODE ? node.parentElement : node;
        while (current && current !== editor) {
            if (
                config.tagNames.includes(current.tagName) ||
                current.style?.[config.style] === config.value
            ) {
                return current;
            }
            current = current.parentElement;
        }

        return null;
    }

    function getActiveEditorRange() {
        if (!editor) {
            return null;
        }

        const selection = window.getSelection();
        if (selection?.rangeCount) {
            const range = selection.getRangeAt(0);
            if (editor.contains(range.commonAncestorContainer)) {
                return range;
            }
        }

        placeCaretAtEnd();
        return window.getSelection()?.rangeCount
            ? window.getSelection().getRangeAt(0)
            : null;
    }

    function selectionHasFormat(format) {
        const range = getActiveEditorRange();
        if (!range) {
            return pendingFormats.has(format);
        }

        const startFormatted = Boolean(
            getFormattedAncestor(range.startContainer, format),
        );
        const endFormatted = Boolean(
            getFormattedAncestor(range.endContainer, format),
        );

        return range.collapsed
            ? startFormatted || pendingFormats.has(format)
            : startFormatted && endFormatted;
    }

    function unwrapFormatElement(element, format) {
        const config = getFormatConfig(format);
        if (!element || !config) {
            return;
        }

        if (config.tagNames.includes(element.tagName)) {
            const parent = element.parentNode;
            while (element.firstChild) {
                parent?.insertBefore(element.firstChild, element);
            }
            element.remove();
            return;
        }

        element.style[config.style] = "";
        if (!element.style.fontWeight && !element.style.fontStyle) {
            element.removeAttribute("style");
        }
        if (element.tagName === "SPAN" && !element.getAttribute("style")) {
            const parent = element.parentNode;
            while (element.firstChild) {
                parent?.insertBefore(element.firstChild, element);
            }
            element.remove();
        }
    }

    function wrapRangeWithFormat(range, format) {
        const fragment = range.extractContents();
        const span = document.createElement("span");
        applyFormatStyles(span, new Set([format]));
        span.appendChild(fragment);
        range.insertNode(span);
        placeCaretAfterNode(span);
        editor?.normalize();
    }

    function insertNodeAtSelection(node) {
        if (!editor) {
            return;
        }

        const range = getActiveEditorRange();
        if (!range) {
            return;
        }

        range.deleteContents();
        range.insertNode(node);
        placeCaretAfterNode(node);
    }

    function syncFormatButtonState() {
        formatButtons.forEach((button) => {
            const format = button.getAttribute("data-format");
            if (!format) {
                return;
            }
            const labels = composerFormatButtonLabels[format];
            const isActive =
                getEditorLength() > 0
                    ? selectionHasFormat(format)
                    : pendingFormats.has(format);
            button.classList.toggle("tweet-modal__tool-btn--active", isActive);
            if (labels) {
                button.setAttribute(
                    "aria-label",
                    isActive ? labels.active : labels.inactive,
                );
            }
        });
    }

    function applyFormat(format) {
        if (!editor) {
            return;
        }
        editor.focus();
        if (getEditorLength() === 0) {
            if (pendingFormats.has(format)) {
                pendingFormats.delete(format);
            } else {
                pendingFormats.add(format);
            }
            syncFormatButtonState();
            return;
        }

        editor.focus();
        if (!restoreEditorSelection()) {
            placeCaretAtEnd();
        }

        const range = getActiveEditorRange();
        if (!range || range.collapsed) {
            if (pendingFormats.has(format)) {
                pendingFormats.delete(format);
            } else {
                pendingFormats.add(format);
            }
            syncFormatButtonState();
            return;
        }

        const startFormatted = getFormattedAncestor(range.startContainer, format);
        const endFormatted = getFormattedAncestor(range.endContainer, format);
        if (startFormatted && startFormatted === endFormatted) {
            unwrapFormatElement(startFormatted, format);
            placeCaretAtEnd();
        } else {
            wrapRangeWithFormat(range, format);
        }

        syncFormatButtonState();
        syncInlineReplySubmitState();
    }

    function applyPendingFormatsToContent() {
        if (!editor || pendingFormats.size === 0 || getEditorLength() === 0) {
            return;
        }

        let span = null;
        if (
            editor.childNodes.length === 1 &&
            editor.firstElementChild?.tagName === "SPAN"
        ) {
            span = editor.firstElementChild;
        } else {
            span = document.createElement("span");
            while (editor.firstChild) {
                span.appendChild(editor.firstChild);
            }
            editor.appendChild(span);
        }

        span.style.fontWeight = pendingFormats.has("bold") ? "bold" : "";
        span.style.fontStyle = pendingFormats.has("italic") ? "italic" : "";

        const range = document.createRange();
        range.selectNodeContents(span);
        range.collapse(false);
        const selection = window.getSelection();
        selection?.removeAllRanges();
        selection?.addRange(range);
        saveEditorSelection();
    }

    function clearRecentEmojis() {
        try {
            window.localStorage.removeItem(emojiRecentsKey);
        } catch {
            return;
        }
    }

    function getEmojiEntriesForCategory(category) {
        if (category === "recent") {
            return getRecentEmojis().map((emoji) => ({
                emoji,
                keywords: [emoji],
            }));
        }

        return (composerEmojiCategoryData[category] ?? []).map((emoji) => ({
            emoji,
            keywords: [emoji, composerEmojiCategoryMeta[category]?.label ?? ""],
        }));
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
            ? `<div class="tweet-modal__emoji-grid">${emojis.map((emoji) => `<button type="button" class="tweet-modal__emoji-option" data-emoji="${emoji}" role="menuitem">${emoji}</button>`).join("")}</div>`
            : `<p class="tweet-modal__emoji-empty">${emptyText}</p>`;

        return `<section class="tweet-modal__emoji-section"><div class="tweet-modal__emoji-section-header"><h3 class="tweet-modal__emoji-section-title">${title}</h3>${headerAction}</div>${body}</section>`;
    }

    function renderEmojiTabs() {
        emojiTabs.forEach((tab) => {
            const category = tab.getAttribute("data-emoji-category");
            const meta = category ? composerEmojiCategoryMeta[category] : null;
            const isActive = category === activeEmojiCategory;

            tab.classList.toggle("tweet-modal__emoji-tab--active", isActive);
            tab.setAttribute("aria-selected", String(isActive));
            if (meta) {
                tab.innerHTML = meta.icon;
            }
        });

        parseTwemoji(emojiPicker);
    }

    function renderInlineReplyEmojiPicker() {
        if (!emojiContent) {
            return;
        }

        const searchTerm = emojiSearchInput?.value.trim().toLowerCase() ?? "";
        if (searchTerm) {
            const sections = Object.keys(composerEmojiCategoryData)
                .map((category) => {
                    const entries = getEmojiEntriesForCategory(category).filter(
                        (entry) =>
                            entry.keywords.some((keyword) =>
                                keyword.toLowerCase().includes(searchTerm),
                            ),
                    );
                    if (entries.length === 0) {
                        return "";
                    }
                    return buildEmojiSection(
                        composerEmojiCategoryMeta[category].sectionTitle,
                        entries.map((entry) => entry.emoji),
                    );
                })
                .join("");

            emojiContent.innerHTML =
                sections ||
                buildEmojiSection("검색 결과", [], {
                    emptyText: "일치하는 이모티콘이 없습니다.",
                });
            renderEmojiTabs();
            parseTwemoji(emojiContent);
            return;
        }

        if (activeEmojiCategory === "recent") {
            const recent = getRecentEmojis();
            emojiContent.innerHTML =
                buildEmojiSection("최근", recent, {
                    clearable: recent.length > 0,
                    emptyText: "최근 사용한 이모티콘이 없습니다.",
                }) +
                buildEmojiSection(
                    composerEmojiCategoryMeta.smileys.sectionTitle,
                    getEmojiEntriesForCategory("smileys").map(
                        (entry) => entry.emoji,
                    ),
                );
        } else {
            emojiContent.innerHTML = buildEmojiSection(
                composerEmojiCategoryMeta[activeEmojiCategory].sectionTitle,
                getEmojiEntriesForCategory(activeEmojiCategory).map(
                    (entry) => entry.emoji,
                ),
            );
        }

        renderEmojiTabs();
        parseTwemoji(emojiContent);
    }

    function updateEmojiPickerPosition() {
        if (!emojiPicker || !emojiButton) {
            return;
        }

        const rect = emojiButton.getBoundingClientRect();
        const pickerWidth = Math.min(565, window.innerWidth - 32);
        const maxLeft = Math.max(16, window.innerWidth - pickerWidth - 16);
        const left = Math.min(Math.max(16, rect.left), maxLeft);
        const top = rect.bottom + 8;
        const maxHeight = Math.max(220, window.innerHeight - top - 16);

        emojiPicker.style.left = `${left}px`;
        emojiPicker.style.top = `${top}px`;
        emojiPicker.style.maxHeight = `${maxHeight}px`;
    }

    function openEmojiPicker() {
        if (!emojiPicker || !emojiButton) {
            return;
        }

        renderInlineReplyEmojiPicker();
        emojiPicker.hidden = false;
        emojiButton.setAttribute("aria-expanded", "true");
        updateEmojiPickerPosition();
    }

    function closeEmojiPicker() {
        if (!emojiPicker || !emojiButton) {
            return;
        }

        emojiPicker.hidden = true;
        emojiButton.setAttribute("aria-expanded", "false");
    }

    function toggleEmojiPicker(forceOpen) {
        if (!emojiPicker) {
            return;
        }

        if (typeof forceOpen === "boolean") {
            if (forceOpen) {
                openEmojiPicker();
            } else {
                closeEmojiPicker();
            }
            return;
        }

        if (emojiPicker.hidden) {
            openEmojiPicker();
        } else {
            closeEmojiPicker();
        }
    }

    function insertEmoji(emoji) {
        if (!editor) {
            return;
        }

        editor.focus();
        if (!restoreEditorSelection()) {
            placeCaretAtEnd();
        }

        const textNode =
            pendingFormats.size > 0
                ? (() => {
                      const span = document.createElement("span");
                      applyFormatStyles(span);
                      span.textContent = emoji;
                      return span;
                  })()
                : document.createTextNode(emoji);
        insertNodeAtSelection(textNode);

        saveRecentEmoji(emoji);
        saveEditorSelection();
        syncInlineReplySubmitState();
        syncFormatButtonState();
        renderInlineReplyEmojiPicker();
    }

    function revokeAttachmentPreviewUrls() {
        attachmentPreviewUrls.forEach((url) => {
            URL.revokeObjectURL(url);
        });
        attachmentPreviewUrls = [];
    }

    function renderAttachments() {
        if (!attachmentPreview || !attachmentMedia || !mediaUploadButton) {
            return;
        }

        attachmentPreview.hidden = attachedFiles.length === 0;
        attachmentMedia.innerHTML = attachedFiles
            .map((file, index) => {
                const fileUrl = attachmentPreviewUrls[index] || "";
                const mediaMarkup = file.type.startsWith("image/")
                    ? `<img src="${fileUrl}" alt="${file.name}">`
                    : file.type.startsWith("video/")
                      ? `<video controls preload="metadata"><source src="${fileUrl}" type="${file.type}"></video>`
                      : `<div class="post-detail-inline-reply-attachment-file"><span>${file.name}</span></div>`;
                const className =
                    file.type.startsWith("image/") ||
                    file.type.startsWith("video/")
                        ? "post-detail-inline-reply-attachment-item"
                        : "";
                return `<div class="${className}" data-attachment-index="${index}">${mediaMarkup}<button type="button" class="post-detail-inline-reply-attachment-remove" data-attachment-remove-index="${index}" aria-label="첨부 삭제">✕</button></div>`;
            })
            .join("");
        mediaUploadButton.disabled = attachedFiles.length >= maxAttachments;
        syncInlineReplySubmitState();
    }

    function setAttachments(files) {
        attachedFiles = files.slice(0, maxAttachments);
        revokeAttachmentPreviewUrls();
        attachmentPreviewUrls = attachedFiles.map((file) =>
            URL.createObjectURL(file),
        );
        renderAttachments();
    }

    function syncLocationUI() {
        const hasLocation = Boolean(selectedLocation);
        if (locationDisplay) {
            locationDisplay.hidden = !hasLocation;
        }
        if (locationName) {
            locationName.textContent = selectedLocation ?? "";
        }
        if (geoButtonPath) {
            geoButtonPath.setAttribute(
                "d",
                hasLocation
                    ? geoButtonPath.dataset.pathActive ||
                          geoButtonPath.getAttribute("d")
                    : geoButtonPath.dataset.pathInactive ||
                          geoButtonPath.getAttribute("d"),
            );
        }
        if (locationDeleteButton) {
            locationDeleteButton.hidden = !hasLocation;
        }
        if (locationCompleteButton) {
            locationCompleteButton.disabled = !pendingLocation;
        }
    }

    // main 쪽 정적 위치 리스트를 그대로 쓰고, 필터링과 체크 표시만 바꿔서 JS를 줄인다.
    function renderInlineReplyLocationList() {
        if (locationItems.length === 0) {
            return;
        }
        const query = locationSearchInput?.value.trim() ?? "";
        locationItems.forEach((item) => {
            const label = item
                .querySelector(".tweet-modal__location-item-label")
                ?.textContent?.trim();
            const check = item.querySelector(
                ".tweet-modal__location-item-check",
            );
            const isVisible = !query || Boolean(label?.includes(query));
            const isActive = label === pendingLocation;

            item.hidden = !isVisible;
            if (check) {
                check.innerHTML = isActive
                    ? '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9.64 18.952l-5.55-4.861 1.317-1.504 3.951 3.459 8.459-10.948L19.4 6.32 9.64 18.952z"></path></svg>'
                    : "";
            }
        });
    }

    function toggleLocationPanel(forceOpen) {
        if (!locationView) {
            return;
        }
        const willOpen =
            typeof forceOpen === "boolean" ? forceOpen : locationView.hidden;
        locationView.hidden = !willOpen;
        if (willOpen) {
            pendingLocation = selectedLocation;
            renderInlineReplyLocationList();
            syncLocationUI();
            window.requestAnimationFrame(() => {
                locationSearchInput?.focus();
            });
            return;
        }
        if (locationSearchInput) {
            locationSearchInput.value = "";
        }
        renderInlineReplyLocationList();
    }

    setFocusedState(false);
    syncInlineReplySubmitState();
    syncLocationUI();
    renderInlineReplyEmojiPicker();

    editor?.addEventListener("focus", () => {
        setFocusedState(true);
    });

    editor?.addEventListener("input", () => {
        applyPendingFormatsToContent();
        saveEditorSelection();
        if (getEditorLength() === 0) {
            pendingFormats = new Set();
        }
        syncInlineReplySubmitState();
        syncFormatButtonState();
    });

    editor?.addEventListener("keyup", () => {
        saveEditorSelection();
        syncFormatButtonState();
    });

    editor?.addEventListener("mouseup", saveEditorSelection);

    composer.addEventListener("focusin", () => {
        setFocusedState(true);
    });

    composer.addEventListener("focusout", () => {
        window.setTimeout(() => {
            const activeElement = document.activeElement;
            const shouldStayFocused =
                Boolean(activeElement) && composer.contains(activeElement);
            if (!shouldStayFocused) {
                setFocusedState(false);
                toggleEmojiPicker(false);
                toggleLocationPanel(false);
            }
        }, 0);
    });

    emojiButton?.addEventListener("mousedown", (event) =>
        event.preventDefault(),
    );
    emojiButton?.addEventListener("click", (event) => {
        event.preventDefault();
        toggleLocationPanel(false);
        toggleEmojiPicker();
    });

    emojiSearchInput?.addEventListener("input", renderInlineReplyEmojiPicker);

    emojiTabs.forEach((tab) => {
        tab.addEventListener("click", () => {
            const category = tab.getAttribute("data-emoji-category");
            if (!category) {
                return;
            }
            activeEmojiCategory = category;
            renderInlineReplyEmojiPicker();
        });
    });

    emojiContent?.addEventListener("mousedown", (event) => {
        if (
            event.target.closest(
                ".tweet-modal__emoji-option, .tweet-modal__emoji-clear",
            )
        ) {
            event.preventDefault();
        }
    });
    emojiContent?.addEventListener("click", (event) => {
        if (event.target.closest("[data-action='clear-recent']")) {
            clearRecentEmojis();
            activeEmojiCategory = "recent";
            renderInlineReplyEmojiPicker();
            return;
        }

        const button = event.target.closest("[data-emoji]");
        const emoji = button?.getAttribute("data-emoji");
        if (!emoji) {
            return;
        }
        insertEmoji(emoji);
        toggleEmojiPicker(false);
    });

    mediaUploadButton?.addEventListener("click", (event) => {
        event.preventDefault();
        fileInput?.click();
    });

    fileInput?.addEventListener("change", (event) => {
        const nextFiles = Array.from(event.target.files ?? []);
        if (nextFiles.length === 0) {
            return;
        }
        const imageAndVideoFiles = nextFiles.filter(
            (file) =>
                file.type.startsWith("image/") ||
                file.type.startsWith("video/"),
        );
        setAttachments([...attachedFiles, ...imageAndVideoFiles]);
        fileInput.value = "";
    });

    attachmentMedia?.addEventListener("click", (event) => {
        const button = event.target.closest("[data-attachment-remove-index]");
        const index = Number.parseInt(
            button?.getAttribute("data-attachment-remove-index") || "",
            10,
        );
        if (Number.isNaN(index)) {
            return;
        }
        setAttachments(
            attachedFiles.filter((_, fileIndex) => fileIndex !== index),
        );
    });

    geoButton?.addEventListener("click", (event) => {
        event.preventDefault();
        toggleEmojiPicker(false);
        toggleLocationPanel();
    });

    locationDisplay?.addEventListener("click", (event) => {
        event.preventDefault();
        toggleEmojiPicker(false);
        toggleLocationPanel(true);
    });

    locationSearchInput?.addEventListener("input", () => {
        renderInlineReplyLocationList();
    });

    locationList?.addEventListener("click", (event) => {
        const button = event.target.closest(".tweet-modal__location-item");
        const location = button
            ?.querySelector(".tweet-modal__location-item-label")
            ?.textContent?.trim();
        if (!location) {
            return;
        }
        pendingLocation = location;
        renderInlineReplyLocationList();
        syncLocationUI();
    });

    locationCloseButton?.addEventListener("click", () => {
        pendingLocation = selectedLocation;
        toggleLocationPanel(false);
        syncLocationUI();
    });

    locationDeleteButton?.addEventListener("click", () => {
        selectedLocation = null;
        pendingLocation = null;
        toggleLocationPanel(false);
        syncLocationUI();
    });

    locationCompleteButton?.addEventListener("click", () => {
        selectedLocation = pendingLocation;
        toggleLocationPanel(false);
        syncLocationUI();
    });

    formatButtons.forEach((button) => {
        button.addEventListener("click", () => {
            const format = button.getAttribute("data-format");
            if (format) {
                applyFormat(format);
            }
        });
    });

    gifButton?.addEventListener("click", (event) => {
        event.preventDefault();
    });

    submitButton?.addEventListener("click", (event) => {
        event.preventDefault();
        if (submitButton.disabled || !editor) {
            return;
        }
        editor.innerHTML = "";
        setAttachments([]);
        fileInput.value = "";
        selectedLocation = null;
        pendingLocation = null;
        syncLocationUI();
        syncInlineReplySubmitState();
        toggleEmojiPicker(false);
        toggleLocationPanel(false);
        placeCaretAtEnd();
    });

    document.addEventListener("click", (event) => {
        if (!composer.contains(event.target)) {
            toggleEmojiPicker(false);
            toggleLocationPanel(false);
        }
    });
    window.addEventListener("resize", () => {
        if (emojiPicker && !emojiPicker.hidden) {
            updateEmojiPickerPosition();
        }
    });
    window.addEventListener(
        "scroll",
        () => {
            if (emojiPicker && !emojiPicker.hidden) {
                updateEmojiPickerPosition();
            }
        },
        { passive: true },
    );
    window.addEventListener("beforeunload", revokeAttachmentPreviewUrls);
}

// 메인 피드의 게시글 액션 중 상세 화면에 필요한 최소 동작만 옮긴다.
function setupPostDetailActions() {
    const layersRoot = document.getElementById("layers");
    let activeShareDropdown = null;
    let activeShareButton = null;
    let activeShareToast = null;
    let activeShareToastTimer = null;
    let activeShareModal = null;
    const shareMenuIcons = {
        copy: '<svg viewBox="0 0 24 24" aria-hidden="true"><g><path d="M18.36 5.64c-1.95-1.96-5.11-1.96-7.07 0L9.88 7.05 8.46 5.64l1.42-1.42c2.73-2.73 7.16-2.73 9.9 0 2.73 2.74 2.73 7.17 0 9.9l-1.42 1.42-1.41-1.42 1.41-1.41c1.96-1.96 1.96-5.12 0-7.07zm-2.12 3.53l-7.07 7.07-1.41-1.41 7.07-7.07 1.41 1.41zm-12.02.71l1.42-1.42 1.41 1.42-1.41 1.41c-1.96 1.96-1.96 5.12 0 7.07 1.95 1.96 5.11 1.96 7.07 0l1.41-1.41 1.42 1.41-1.42 1.42c-2.73 2.73-7.16 2.73-9.9 0-2.73-2.74-2.73-7.17 0-9.9z"></path></g></svg>',
        chat: '<svg viewBox="0 0 24 24" aria-hidden="true"><g><path d="M1.998 5.5c0-1.381 1.119-2.5 2.5-2.5h15c1.381 0 2.5 1.119 2.5 2.5v13c0 1.381-1.119 2.5-2.5 2.5h-15c-1.381 0-2.5-1.119-2.5-2.5v-13zm2.5-.5c-.276 0-.5.224-.5.5v2.764l8 3.638 8-3.636V5.5c0-.276-.224-.5-.5-.5h-15zm15.5 5.463l-8 3.636-8-3.638V18.5c0 .276.224.5.5.5h15c.276 0 .5-.224.5-.5v-8.037z"></path></g></svg>',
        bookmark: '<svg viewBox="0 0 24 24" aria-hidden="true"><g><path d="M18 3V0h2v3h3v2h-3v3h-2V5h-3V3zm-7.5 1a.5.5 0 00-.5.5V7h3.5A2.5 2.5 0 0116 9.5v3.48l3 2.1V11h2v7.92l-5-3.5v7.26l-6.5-3.54L3 22.68V9.5A2.5 2.5 0 015.5 7H8V4.5A2.5 2.5 0 0110.5 2H12v2zm-5 5a.5.5 0 00-.5.5v9.82l4.5-2.46 4.5 2.46V9.5a.5.5 0 00-.5-.5z"></path></g></svg>',
    };

    function escapeHtml(value) {
        return String(value).replace(
            /[&<>"']/g,
            (char) =>
                ({
                    "&": "&amp;",
                    "<": "&lt;",
                    ">": "&gt;",
                    '"': "&quot;",
                    "'": "&#39;",
                })[char] ?? char,
        );
    }

    // 좋아요와 북마크 아이콘은 path data를 바꿔 활성 상태를 맞춘다.
    function syncButtonPath(button, isActive) {
        const path = button?.querySelector("path");
        if (!path) {
            return;
        }

        path.setAttribute(
            "d",
            isActive
                ? path.dataset.pathActive || path.getAttribute("d")
                : path.dataset.pathInactive || path.getAttribute("d"),
        );
    }

    // 북마크 버튼은 시각 상태와 접근성 속성을 같이 갱신한다.
    function setBookmarkButtonState(button, isActive) {
        if (!button) {
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
        syncButtonPath(button, isActive);
    }

    // 공유 링크는 현재 게시글의 핸들, 포스트 id, 북마크 버튼 참조를 묶어서 만든다.
    function getSharePostMeta(button) {
        const postCard = button.closest(".postCard, [data-post-card]");
        const handle =
            postCard?.querySelector(".postHandle")?.textContent?.trim() ||
            "@user";
        const postId = postCard?.dataset.postId || "1";
        const bookmarkButton =
            postCard?.querySelector(".tweet-action-btn--bookmark") ?? null;
        const url = new URL(window.location.href);

        url.pathname = `/${handle.replace("@", "") || "user"}/status/${postId}`;
        url.search = "";
        url.hash = "";

        return {
            bookmarkButton,
            permalink: url.toString(),
        };
    }

    // 상세 화면 공통 피드백은 짧은 토스트 하나로만 보여 준다.
    function showShareToast(message) {
        if (activeShareToastTimer) {
            window.clearTimeout(activeShareToastTimer);
            activeShareToastTimer = null;
        }

        activeShareToast?.remove();
        activeShareToast = document.createElement("div");
        activeShareToast.className = "share-toast";
        activeShareToast.textContent = message;
        document.body.appendChild(activeShareToast);

        activeShareToastTimer = window.setTimeout(() => {
            activeShareToast?.remove();
            activeShareToast = null;
            activeShareToastTimer = null;
        }, 2200);
    }

    function closeShareModal() {
        if (!activeShareModal) {
            return;
        }

        activeShareModal.remove();
        activeShareModal = null;
        document.body.classList.remove("modal-open");
    }

    // 공유 드롭다운은 하나만 열리도록 유지하고 열림 상태도 같이 정리한다.
    function closeShareDropdown() {
        if (!activeShareDropdown) {
            return;
        }

        activeShareDropdown.remove();
        activeShareDropdown = null;
        if (activeShareButton) {
            activeShareButton.setAttribute("aria-expanded", "false");
            activeShareButton = null;
        }
    }

    // 메인 게시글처럼 공유 메뉴에서 현재 상세 게시글 링크를 복사한다.
    function copyShareLink(button) {
        const { permalink } = getSharePostMeta(button);
        closeShareDropdown();
        if (!navigator.clipboard?.writeText) {
            showShareToast("링크를 복사하지 못했습니다");
            return;
        }

        navigator.clipboard
            .writeText(permalink)
            .then(() => showShareToast("클립보드로 복사함"))
            .catch(() => showShareToast("링크를 복사하지 못했습니다"));
    }

    function getCurrentPageTagUsers() {
        const users = [];
        const seen = new Set();
        const cards = Array.from(
            document.querySelectorAll(".postCard, [data-post-card]"),
        );

        cards.forEach((card, index) => {
            const handle =
                card.querySelector(".postHandle")?.textContent?.trim() ||
                "@user";
            if (seen.has(handle)) {
                return;
            }

            const name =
                card.querySelector(".postName")?.textContent?.trim() ||
                "사용자";
            const avatar =
                card
                    .querySelector(".post-detail-avatar img")
                    ?.getAttribute("src") ||
                document
                    .querySelector(".post-detail-inline-reply-avatar img")
                    ?.getAttribute("src") ||
                "";

            seen.add(handle);
            users.push({
                id: `${handle.replace("@", "") || "user"}-${index}`,
                name,
                handle,
                avatar,
            });
        });

        return users;
    }

    function getShareUserRows() {
        const users = getCurrentPageTagUsers();
        if (users.length === 0) {
            return `<div class="share-sheet__empty"><p>전송할 수 있는 사용자가 없습니다.</p></div>`;
        }

        return users
            .map(
                (user) =>
                    `<button type="button" class="share-sheet__user" data-share-user-id="${escapeHtml(user.id)}"><span class="share-sheet__user-avatar">${user.avatar ? `<img src="${escapeHtml(user.avatar)}" alt="${escapeHtml(user.name)}" />` : ""}</span><span class="share-sheet__user-body"><span class="share-sheet__user-name">${escapeHtml(user.name)}</span><span class="share-sheet__user-handle">${escapeHtml(user.handle)}</span></span></button>`,
            )
            .join("");
    }

    function createShareMenuItemMarkup(type, label) {
        return `<button type="button" role="menuitem" class="menu-item share-menu-item share-menu-item--${type}"><span class="menu-item__icon share-menu-item__icon">${shareMenuIcons[type] ?? ""}</span><span class="menu-item__label">${label}</span></button>`;
    }

    function openShareModal(markup, onClick) {
        closeShareDropdown();
        closeShareModal();

        const modal = document.createElement("div");
        modal.className = "share-sheet";
        modal.innerHTML = markup;
        modal.addEventListener("click", onClick);

        document.body.appendChild(modal);
        document.body.classList.add("modal-open");
        activeShareModal = modal;
        return modal;
    }

    function openShareChatModal() {
        openShareModal(
            `<div class="share-sheet__backdrop" data-share-close="true"></div><div class="share-sheet__card" role="dialog" aria-modal="true" aria-labelledby="share-chat-title"><div class="share-sheet__header"><button type="button" class="share-sheet__icon-btn" data-share-close="true" aria-label="돌아가기"><svg viewBox="0 0 24 24" aria-hidden="true"><g><path d="M7.414 13l5.043 5.04-1.414 1.42L3.586 12l7.457-7.46 1.414 1.42L7.414 11H21v2H7.414z"></path></g></svg></button><h2 id="share-chat-title" class="share-sheet__title">공유하기</h2><span class="share-sheet__header-spacer"></span></div><div class="share-sheet__search"><input type="text" class="share-sheet__search-input" placeholder="검색" aria-label="검색" /></div><div class="share-sheet__list">${getShareUserRows()}</div></div>`,
            (e) => {
            if (
                e.target.closest("[data-share-close='true']") ||
                e.target.classList.contains("share-sheet__backdrop") ||
                e.target.closest(".share-sheet__user")
            ) {
                e.preventDefault();
                closeShareModal();
            }
        },
        );
    }

    function openShareBookmarkModal(button) {
        const { bookmarkButton } = getSharePostMeta(button);
        const isBookmarked =
            bookmarkButton?.classList.contains("active") ?? false;
        openShareModal(
            `
            <div class="share-sheet__backdrop" data-share-close="true"></div>
            <div class="share-sheet__card share-sheet__card--bookmark" role="dialog" aria-modal="true" aria-labelledby="share-bookmark-title">
                <div class="share-sheet__header">
                    <button type="button" class="share-sheet__icon-btn" data-share-close="true" aria-label="닫기">
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M10.59 12 4.54 5.96l1.42-1.42L12 10.59l6.04-6.05 1.42 1.42L13.41 12l6.05 6.04-1.42 1.42L12 13.41l-6.04 6.05-1.42-1.42L10.59 12z"></path>
                        </svg>
                    </button>
                    <h2 id="share-bookmark-title" class="share-sheet__title">폴더에 추가</h2>
                    <span class="share-sheet__header-spacer"></span>
                </div>
                <button type="button" class="share-sheet__create-folder">새 북마크 폴더 만들기</button>
                <button type="button" class="share-sheet__folder" data-share-folder="all-bookmarks">
                    <span class="share-sheet__folder-icon">
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M2.998 8.5c0-1.38 1.119-2.5 2.5-2.5h9c1.381 0 2.5 1.12 2.5 2.5v14.12l-7-3.5-7 3.5V8.5zM18.5 2H8.998v2H18.5c.275 0 .5.224.5.5V15l2 1.4V4.5c0-1.38-1.119-2.5-2.5-2.5z"></path>
                        </svg>
                    </span>
                    <span class="share-sheet__folder-name">모든 북마크</span>
                    <span class="share-sheet__folder-check${isBookmarked ? " share-sheet__folder-check--active" : ""}">
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M9.64 18.952l-5.55-4.861 1.317-1.504 3.951 3.459 8.459-10.948L19.4 6.32 9.64 18.952z"></path>
                        </svg>
                    </span>
                </button>
            </div>
        `,
            (event) => {
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
                closeShareModal();
                return;
            }

            if (event.target.closest("[data-share-folder='all-bookmarks']")) {
                event.preventDefault();
                setBookmarkButtonState(bookmarkButton, !isBookmarked);
                closeShareModal();
            }
        },
        );
    }

    // 상세 화면 공유 버튼은 드롭다운 하나만 띄우고 다시 누르면 닫는다.
    function openShareDropdown(button) {
        if (!layersRoot) {
            return;
        }

        closeShareDropdown();
        const rect = button.getBoundingClientRect();
        const top = rect.bottom + 8;
        const lc = document.createElement("div");
        lc.className = "layers-dropdown-container";
        lc.innerHTML = `<div class="layers-overlay"></div><div class="layers-dropdown-inner"><div role="menu" class="dropdown-menu"><div><div class="dropdown-inner">${createShareMenuItemMarkup("copy", "링크 복사하기")}${createShareMenuItemMarkup("chat", "Chat으로 전송하기")}${createShareMenuItemMarkup("bookmark", "폴더에 북마크 추가하기")}</div></div></div></div>`;
        layersRoot.appendChild(lc);

        const menu = lc.querySelector(".dropdown-menu");
        if (menu) {
            const menuWidth = menu.offsetWidth || 0;
            const left = Math.min(
                Math.max(16, rect.right - menuWidth + 20),
                Math.max(16, window.innerWidth - menuWidth - 16),
            );
            menu.style.top = `${top}px`;
            menu.style.left = `${left}px`;
            menu.style.right = "auto";
        }

        lc.addEventListener("click", (e) => {
            const ab = e.target.closest(".share-menu-item");
            if (!ab || !activeShareButton) {
                e.stopPropagation();
                return;
            }

            e.preventDefault();
            e.stopPropagation();

            if (ab.classList.contains("share-menu-item--copy")) {
                copyShareLink(activeShareButton);
                return;
            }
            if (ab.classList.contains("share-menu-item--chat")) {
                openShareChatModal();
                return;
            }
            if (ab.classList.contains("share-menu-item--bookmark")) {
                openShareBookmarkModal(activeShareButton);
            }
        });
        activeShareDropdown = lc;
        activeShareButton = button;
        activeShareButton.setAttribute("aria-expanded", "true");
    }

    document.querySelectorAll(".tweet-action-btn--like").forEach((button) => {
        const countElement = button.querySelector(".tweet-action-count");
        let baseCount = Number.parseInt(countElement?.textContent || "0", 10);

        if (Number.isNaN(baseCount)) {
            baseCount = 0;
        }

        button.addEventListener("click", (event) => {
            event.preventDefault();
            const isActive = button.classList.toggle("active");

            if (countElement) {
                countElement.textContent = String(
                    isActive ? baseCount + 1 : baseCount,
                );
            }

            syncButtonPath(button, isActive);
        });
    });

    document
        .querySelectorAll(".tweet-action-btn--bookmark")
        .forEach((button) => {
            const path = button.querySelector("path");
            button.addEventListener("click", (event) => {
                event.preventDefault();
                const isActive = button.classList.toggle("active");

                button.setAttribute(
                    "data-testid",
                    isActive ? "removeBookmark" : "bookmark",
                );
                button.setAttribute(
                    "aria-label",
                    isActive ? "북마크에 추가됨" : "북마크",
                );

                if (path) {
                    path.setAttribute(
                        "d",
                        isActive
                            ? path.dataset.pathActive || path.getAttribute("d")
                            : path.dataset.pathInactive ||
                                  path.getAttribute("d"),
                    );
                }
            });
        });

    document.querySelectorAll(".tweet-action-btn--share").forEach((button) => {
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

    document
        .querySelectorAll(".tweet-action-btn[data-testid='reply']")
        .forEach((button) => {
            button.addEventListener("click", (event) => {
                event.preventDefault();
            });
        });

    document.addEventListener("click", (event) => {
        if (
            activeShareDropdown &&
            !activeShareDropdown.contains(event.target) &&
            !activeShareButton?.contains(event.target)
        ) {
            closeShareDropdown();
        }
    });

    window.addEventListener(
        "scroll",
        () => {
            closeShareDropdown();
        },
        { passive: true },
    );

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            closeShareModal();
            closeShareDropdown();
        }
    });
}
