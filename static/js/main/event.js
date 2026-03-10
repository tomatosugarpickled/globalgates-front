document.addEventListener("DOMContentLoaded", () => {
    setupComposerState();
    setupComposerModal();
    setupBoardSelector();
    setupComposerToolbar();
    setupSearchForm();
    setupTimelineTabs();
    setupExpandablePostText();
    setupMediaPreview();
    setupTweetActions();
    setupConnectButtons();
});

const composerEmojiRecentsKey = "main_composer_recent_emojis";
const composerMaxRecentEmojis = 18;
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
        "🎮",
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
    ],
    travel: [
        "🚗",
        "🚌",
        "✈️",
        "🚀",
        "🚲",
        "⛵",
        "🏠",
        "🏙️",
        "🏝️",
        "🌁",
        "🗼",
        "🗽",
        "📍",
    ],
    objects: [
        "💡",
        "📱",
        "💻",
        "⌚",
        "📷",
        "🎥",
        "💰",
        "💎",
        "🔑",
        "🎁",
        "📌",
        "🧸",
        "🛒",
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
    ],
    flags: ["🏳️", "🏴", "🏁", "🚩", "🎌", "🏳️‍🌈", "🇰🇷", "🇺🇸", "🇯🇵", "🇫🇷", "🇬🇧"],
};

const composerFormatButtonLabels = {
    bold: {
        inactive: "굵게, (CTRL+B) 님",
        active: "굵게, 활성 상태, (CTRL+B) 님 님",
    },
    italic: {
        inactive: "기울임꼴, (CTRL+I) 님",
        active: "기울임꼴, 활성 상태, (CTRL+I) 님 님",
    },
};

function parseTwemoji(scope) {
    if (!scope || !window.twemoji) {
        return;
    }

    window.twemoji.parse(scope, {
        folder: "svg",
        ext: ".svg",
    });
}

function setupComposerState() {
    const composerSection = document.getElementById("composerSection");
    const composerTextarea = document.getElementById("postContent");
    const composerValue = document.getElementById("postContentValue");
    const composerGauge = document.getElementById("composerGauge");
    const composerGaugeText = document.getElementById("composerGaugeText");
    const submitButton = document.getElementById("postSubmitButton");
    const maxLength = 500;

    if (!composerSection || !composerTextarea) {
        return;
    }

    function getComposerText() {
        return (
            composerTextarea.textContent?.replace(/\u00a0/g, " ").trim() || ""
        );
    }

    function expandComposer() {
        composerSection.classList.add("isExpanded");
    }

    function normalizeComposerContent() {
        const text =
            composerTextarea.textContent?.replace(/\u00a0/g, " ") || "";
        if (text.trim() === "") {
            composerTextarea.innerHTML = "";
            if (composerValue) {
                composerValue.value = "";
            }
            return "";
        }

        return text;
    }

    function collapseComposer() {
        if (getComposerText() !== "") {
            return;
        }

        normalizeComposerContent();
        composerSection.classList.remove("isExpanded");
    }

    composerTextarea.addEventListener("focus", expandComposer);
    composerTextarea.addEventListener("click", expandComposer);
    composerTextarea.addEventListener("input", updateComposerGauge);

    document.addEventListener("click", (event) => {
        if (composerSection.contains(event.target)) {
            return;
        }

        collapseComposer();
    });

    updateComposerGauge();

    function updateComposerGauge() {
        if (!composerGauge || !composerGaugeText) {
            return;
        }

        let content = normalizeComposerContent();
        if (content.length > maxLength) {
            content = content.slice(0, maxLength);
            composerTextarea.textContent = content;
            placeCaretAtEnd(composerTextarea);
        }

        const normalizedContent = content.trim();
        if (composerValue) {
            composerValue.value = normalizedContent;
        }
        if (submitButton) {
            submitButton.disabled = normalizedContent.length === 0;
        }

        const currentLength = content.length;
        const ratio = Math.min(currentLength / maxLength, 1);
        const progress = `${ratio * 360}deg`;
        const remaining = Math.max(maxLength - currentLength, 0);

        composerGauge.style.setProperty("--gauge-progress", progress);
        composerGauge.setAttribute("aria-valuenow", String(currentLength));
        composerGaugeText.textContent = String(remaining);
    }
}

function setupComposerModal() {
    const createPostButton = document.getElementById("createPostButton");
    const composerModalOverlay = document.getElementById(
        "composerModalOverlay",
    );
    const composerModalClose = document.getElementById("composerModalClose");
    const composerSection = document.getElementById("composerSection");
    const composerTextarea = document.getElementById("postContent");
    const emojiPicker = composerSection?.querySelector(
        ".tweet-modal__emoji-picker",
    );
    const emojiButton = composerSection?.querySelector(
        "[data-testid='emojiButton']",
    );
    const boardMenu = document.getElementById("boardMenu");
    const audienceButton = document.getElementById("audienceButton");
    const locationModalOverlay = document.getElementById(
        "locationModalOverlay",
    );

    if (!createPostButton || !composerModalOverlay || !composerSection) {
        return;
    }

    function openComposerModal() {
        composerSection.hidden = false;
        composerModalOverlay.hidden = false;
        composerSection.classList.add("isExpanded");
        composerSection.classList.add("isModalOpen");
        window.setTimeout(() => {
            composerTextarea?.focus();
        }, 0);
    }

    function closeComposerModal() {
        composerModalOverlay.hidden = true;
        composerSection.classList.remove("isModalOpen");
        if (emojiPicker) {
            emojiPicker.hidden = true;
        }
        if (emojiButton) {
            emojiButton.setAttribute("aria-expanded", "false");
        }
        if (boardMenu) {
            boardMenu.hidden = true;
        }
        if (audienceButton) {
            audienceButton.setAttribute("aria-expanded", "false");
        }
        if (locationModalOverlay) {
            locationModalOverlay.hidden = true;
        }
        createPostButton.focus();
    }

    createPostButton.addEventListener("click", (event) => {
        event.preventDefault();
        openComposerModal();
    });

    composerModalClose?.addEventListener("click", closeComposerModal);

    composerModalOverlay.addEventListener("click", (event) => {
        if (event.target === composerModalOverlay) {
            closeComposerModal();
        }
    });

    document.addEventListener("keydown", (event) => {
        if (event.key !== "Escape" || composerModalOverlay.hidden) {
            return;
        }

        if (emojiPicker && !emojiPicker.hidden) {
            return;
        }

        if (locationModalOverlay && !locationModalOverlay.hidden) {
            locationModalOverlay.hidden = true;
            return;
        }

        closeComposerModal();
    });
}

function setupBoardSelector() {
    const audienceButton = document.getElementById("audienceButton");
    const boardMenu = document.getElementById("boardMenu");
    const boardType = document.getElementById("boardType");
    const communityId = document.getElementById("communityId");
    const boardOptions = Array.from(
        document.querySelectorAll(".boardMenuOption"),
    );
    const communityOptions = Array.from(
        document.querySelectorAll(".communityMenuItem"),
    );

    if (!audienceButton || !boardMenu || boardOptions.length === 0) {
        return;
    }

    function closeBoardMenu() {
        boardMenu.hidden = true;
        audienceButton.setAttribute("aria-expanded", "false");
    }

    function openBoardMenu() {
        boardMenu.hidden = false;
        audienceButton.setAttribute("aria-expanded", "true");
    }

    function selectBoard(option) {
        const boardLabel = option.dataset.boardLabel || "일반";
        const boardValue = option.dataset.boardValue || "general";

        audienceButton.textContent = boardLabel;
        if (boardType) {
            boardType.value = boardValue;
        }
        if (communityId) {
            communityId.value = "";
        }

        boardOptions.forEach((item) => {
            const isSelected = item === option;
            item.classList.toggle("isSelected", isSelected);
            item.setAttribute("aria-selected", isSelected ? "true" : "false");
        });
        communityOptions.forEach((item) => {
            item.classList.remove("isSelected");
        });

        closeBoardMenu();
    }

    function selectCommunity(option) {
        const communityLabel = option.dataset.communityLabel || "커뮤니티";
        const communityValue = option.dataset.communityId || "";

        audienceButton.textContent = communityLabel;
        if (boardType) {
            boardType.value = "community";
        }
        if (communityId) {
            communityId.value = communityValue;
        }

        boardOptions.forEach((item) => {
            item.classList.remove("isSelected");
            item.setAttribute("aria-selected", "false");
        });
        communityOptions.forEach((item) => {
            item.classList.toggle("isSelected", item === option);
        });

        closeBoardMenu();
    }

    audienceButton.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();

        if (boardMenu.hidden) {
            openBoardMenu();
        } else {
            closeBoardMenu();
        }
    });

    boardOptions.forEach((option) => {
        option.addEventListener("click", (event) => {
            event.preventDefault();
            event.stopPropagation();
            selectBoard(option);
        });
    });

    communityOptions.forEach((option) => {
        option.addEventListener("click", (event) => {
            event.preventDefault();
            event.stopPropagation();
            selectCommunity(option);
        });
    });

    document.addEventListener("click", (event) => {
        if (
            !boardMenu.hidden &&
            !boardMenu.contains(event.target) &&
            event.target !== audienceButton
        ) {
            closeBoardMenu();
        }
    });
}

function setupComposerToolbar() {
    const composerSection = document.getElementById("composerSection");
    const composerTextarea = document.getElementById("postContent");
    const mediaUploadButton = document.querySelector(
        "[data-testid='mediaUploadButton']",
    );
    const fileInput = document.querySelector("[data-testid='fileInput']");
    const emojiButton = document.querySelector("[data-testid='emojiButton']");
    const emojiPicker = document.querySelector(".tweet-modal__emoji-picker");
    const emojiSearchInput = document.querySelector(
        "[data-testid='emojiSearchInput']",
    );
    const emojiTabs = document.querySelectorAll(".tweet-modal__emoji-tab");
    const emojiContent = document.querySelector(
        "[data-testid='emojiPickerContent']",
    );
    const formatButtons = document.querySelectorAll("[data-format]");
    const geoButton = document.querySelector("[data-testid='geoButton']");
    const locationButton = document.getElementById("composerLocation");
    const attachmentPreview = document.getElementById(
        "composerAttachmentPreview",
    );
    const attachmentList = document.getElementById("composerAttachmentList");
    const locationModalOverlay = document.getElementById(
        "locationModalOverlay",
    );
    const locationModalClose = document.getElementById("locationModalClose");
    const locationModalDelete = document.getElementById("locationModalDelete");
    const locationModalApply = document.getElementById("locationModalApply");
    const locationModalSearchInput = document.getElementById(
        "locationModalSearchInput",
    );
    const locationModalList = document.getElementById("locationModalList");
    const maxAttachments = 4;
    const availableLocations = [
        "대한민국 서초구",
        "대한민국 강남구",
        "대한민국 송파구",
        "대한민국 광진구",
        "대한민국 동작구",
        "대한민국 중구",
        "대한민국 과천시",
        "대한민국 관악구",
        "대한민국 용산구",
        "대한민국 마포구",
    ];
    const attachmentUrls = [];
    let pendingLocation = locationButton?.textContent.trim() || "";
    let activeEmojiCategory = "recent";
    let savedComposerSelection = null;
    let pendingComposerFormats = new Set();
    let attachedComposerFiles = [];
    let pendingAttachmentEditIndex = null;

    if (!composerSection || !composerTextarea) {
        return;
    }

    function saveComposerSelection() {
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) {
            savedComposerSelection = null;
            return;
        }

        const range = selection.getRangeAt(0);
        if (!composerTextarea.contains(range.commonAncestorContainer)) {
            return;
        }

        savedComposerSelection = range.cloneRange();
    }

    function restoreComposerSelection() {
        if (!savedComposerSelection) {
            return false;
        }

        const selection = window.getSelection();
        if (!selection) {
            return false;
        }

        selection.removeAllRanges();
        selection.addRange(savedComposerSelection);
        return true;
    }

    function hasComposerText() {
        return (
            composerTextarea.textContent.replace(/\u00a0/g, " ").trim().length >
            0
        );
    }

    function togglePendingComposerFormat(format) {
        if (pendingComposerFormats.has(format)) {
            pendingComposerFormats.delete(format);
        } else {
            pendingComposerFormats.add(format);
        }
    }

    function applyPendingComposerFormatsToContent() {
        if (pendingComposerFormats.size === 0 || !hasComposerText()) {
            return;
        }

        let span = null;

        if (
            composerTextarea.childNodes.length === 1 &&
            composerTextarea.firstElementChild &&
            composerTextarea.firstElementChild.tagName === "SPAN"
        ) {
            span = composerTextarea.firstElementChild;
        } else {
            span = document.createElement("span");

            while (composerTextarea.firstChild) {
                span.appendChild(composerTextarea.firstChild);
            }

            composerTextarea.appendChild(span);
        }

        span.style.fontWeight = pendingComposerFormats.has("bold")
            ? "bold"
            : "";
        span.style.fontStyle = pendingComposerFormats.has("italic")
            ? "italic"
            : "";

        const range = document.createRange();
        range.selectNodeContents(span);
        range.collapse(false);

        const selection = window.getSelection();
        selection?.removeAllRanges();
        selection?.addRange(range);
        saveComposerSelection();
    }

    function getRecentEmojis() {
        try {
            const saved = window.localStorage.getItem(composerEmojiRecentsKey);
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
                composerEmojiRecentsKey,
                JSON.stringify(next.slice(0, composerMaxRecentEmojis)),
            );
        } catch {
            return;
        }
    }

    function clearRecentEmojis() {
        try {
            window.localStorage.removeItem(composerEmojiRecentsKey);
        } catch {
            return;
        }
    }

    function getEmojiSearchTerm() {
        return emojiSearchInput?.value.trim().toLowerCase() ?? "";
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

    function getFilteredEmojiEntries(category) {
        const entries = getEmojiEntriesForCategory(category);
        const searchTerm = getEmojiSearchTerm();

        if (!searchTerm) {
            return entries;
        }

        return entries.filter((entry) =>
            entry.keywords.some((keyword) =>
                keyword.toLowerCase().includes(searchTerm),
            ),
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
            ? `
                <div class="tweet-modal__emoji-grid">
                    ${emojis
                        .map(
                            (emoji) => `
                                <button type="button" class="tweet-modal__emoji-option" data-emoji="${emoji}" role="menuitem">${emoji}</button>
                            `,
                        )
                        .join("")}
                </div>
            `
            : `<p class="tweet-modal__emoji-empty">${emptyText}</p>`;

        return `
            <section class="tweet-modal__emoji-section">
                <div class="tweet-modal__emoji-section-header">
                    <h3 class="tweet-modal__emoji-section-title">${title}</h3>
                    ${headerAction}
                </div>
                ${body}
            </section>
        `;
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

    function renderEmojiPicker() {
        if (!emojiContent) {
            return;
        }

        const searchTerm = getEmojiSearchTerm();
        if (searchTerm) {
            const sections = Object.keys(composerEmojiCategoryData)
                .map((category) => {
                    const entries = getFilteredEmojiEntries(category);
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
            const recentSection = buildEmojiSection("최근", recent, {
                clearable: recent.length > 0,
                emptyText: "최근 사용한 이모티콘이 없습니다.",
            });
            const smileys = buildEmojiSection(
                composerEmojiCategoryMeta.smileys.sectionTitle,
                getEmojiEntriesForCategory("smileys").map(
                    (entry) => entry.emoji,
                ),
            );

            emojiContent.innerHTML = recentSection + smileys;
            renderEmojiTabs();
            parseTwemoji(emojiContent);
            return;
        }

        const entries = getEmojiEntriesForCategory(activeEmojiCategory).map(
            (entry) => entry.emoji,
        );
        emojiContent.innerHTML = buildEmojiSection(
            composerEmojiCategoryMeta[activeEmojiCategory].sectionTitle,
            entries,
        );
        renderEmojiTabs();
        parseTwemoji(emojiContent);
    }

    function updateEmojiPickerPosition() {
        if (!emojiPicker || !emojiButton) {
            return;
        }

        const toolGroup = emojiPicker.closest(".toolGroup");
        const composerBounds = composerSection.getBoundingClientRect();
        const groupBounds = toolGroup?.getBoundingClientRect();
        const availableWidth = composerSection.classList.contains("isModalOpen")
            ? Math.max(280, composerSection.clientWidth - 32)
            : window.innerWidth - 32;
        const pickerWidth = Math.min(565, availableWidth);
        let left = 0;
        let maxHeight = 454;

        if (groupBounds) {
            const maxLeft =
                composerBounds.right - groupBounds.left - pickerWidth - 16;
            const minLeft = 16 - groupBounds.left;
            left = Math.min(0, maxLeft);
            left = Math.max(left, minLeft);

            if (composerSection.classList.contains("isModalOpen")) {
                maxHeight = Math.max(
                    220,
                    groupBounds.top - composerBounds.top - 24,
                );
            } else {
                maxHeight = Math.max(220, groupBounds.top - 16);
            }
        }

        emojiPicker.style.width = `${pickerWidth}px`;
        emojiPicker.style.left = `${left}px`;
        emojiPicker.style.right = "auto";
        emojiPicker.style.top = "auto";
        emojiPicker.style.bottom = "calc(100% + 8px)";
        emojiPicker.style.maxHeight = `${maxHeight}px`;
    }

    function openEmojiPicker() {
        if (!emojiPicker || !emojiButton) {
            return;
        }

        renderEmojiPicker();
        emojiPicker.hidden = false;
        emojiButton.setAttribute("aria-expanded", "true");
        updateEmojiPickerPosition();
        parseTwemoji(emojiPicker);
    }

    function closeEmojiPicker() {
        if (!emojiPicker || !emojiButton) {
            return;
        }

        emojiPicker.hidden = true;
        emojiButton.setAttribute("aria-expanded", "false");
    }

    function toggleEmojiPicker() {
        if (!emojiPicker) {
            return;
        }

        if (emojiPicker.hidden) {
            openEmojiPicker();
        } else {
            closeEmojiPicker();
        }
    }

    function insertEmojiAtCaret(emoji) {
        composerTextarea.focus();
        if (!restoreComposerSelection()) {
            placeCaretAtEnd(composerTextarea);
        }

        if (!document.execCommand("insertText", false, emoji)) {
            const selection = window.getSelection();
            if (!selection || selection.rangeCount === 0) {
                composerTextarea.textContent += emoji;
                placeCaretAtEnd(composerTextarea);
                composerTextarea.dispatchEvent(
                    new Event("input", { bubbles: true }),
                );
                return;
            }

            const range = selection.getRangeAt(0);
            range.deleteContents();
            range.insertNode(document.createTextNode(emoji));
            range.collapse(false);
            selection.removeAllRanges();
            selection.addRange(range);
        }

        applyPendingComposerFormatsToContent();
        saveRecentEmoji(emoji);
        saveComposerSelection();
        composerTextarea.dispatchEvent(new Event("input", { bubbles: true }));
        syncFormatButtons();
        renderEmojiPicker();
        closeEmojiPicker();
    }

    function applyComposerFormat(format) {
        composerTextarea.focus();

        if (!hasComposerText()) {
            togglePendingComposerFormat(format);
            syncFormatButtons();
            return;
        }

        if (!restoreComposerSelection()) {
            const range = document.createRange();
            range.selectNodeContents(composerTextarea);
            range.collapse(false);

            const selection = window.getSelection();
            selection?.removeAllRanges();
            selection?.addRange(range);
        }

        try {
            document.execCommand(format, false);
        } catch {
            return;
        }

        saveComposerSelection();
        composerTextarea.dispatchEvent(new Event("input", { bubbles: true }));
        syncFormatButtons();
    }

    function syncFormatButtons() {
        formatButtons.forEach((button) => {
            const format = button.getAttribute("data-format");
            if (!format) {
                return;
            }

            let isActive = false;
            try {
                isActive = hasComposerText()
                    ? document.queryCommandState(format)
                    : pendingComposerFormats.has(format);
            } catch {
                isActive = pendingComposerFormats.has(format);
            }

            const labels = composerFormatButtonLabels[format];
            button.classList.toggle("tweet-modal__tool-btn--active", isActive);
            if (labels) {
                button.setAttribute(
                    "aria-label",
                    isActive ? labels.active : labels.inactive,
                );
            }
        });
    }

    emojiButton?.addEventListener("mousedown", (event) => {
        event.preventDefault();
    });

    emojiButton?.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        toggleEmojiPicker();
    });

    emojiSearchInput?.addEventListener("input", renderEmojiPicker);

    emojiPicker?.addEventListener("click", (event) => {
        event.stopPropagation();
    });

    emojiTabs.forEach((tab) => {
        tab.addEventListener("click", (event) => {
            event.preventDefault();
            event.stopPropagation();
            const category = tab.getAttribute("data-emoji-category");
            if (!category) {
                return;
            }

            activeEmojiCategory = category;
            renderEmojiPicker();
        });
    });

    emojiContent?.addEventListener("mousedown", (event) => {
        const target = event.target.closest(
            ".tweet-modal__emoji-option, .tweet-modal__emoji-clear",
        );
        if (target) {
            event.preventDefault();
        }
    });

    emojiContent?.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        const clearButton = event.target.closest(
            "[data-action='clear-recent']",
        );
        if (clearButton) {
            clearRecentEmojis();
            activeEmojiCategory = "recent";
            renderEmojiPicker();
            return;
        }

        const option = event.target.closest(".tweet-modal__emoji-option");
        if (!option) {
            return;
        }

        const emoji = option.getAttribute("data-emoji");
        if (!emoji) {
            return;
        }

        insertEmojiAtCaret(emoji);
    });

    formatButtons.forEach((button) => {
        button.addEventListener("mousedown", (event) => {
            event.preventDefault();
        });

        button.addEventListener("click", (event) => {
            event.preventDefault();
            const format = button.getAttribute("data-format");
            if (!format) {
                return;
            }

            applyComposerFormat(format);
        });
    });

    composerTextarea.addEventListener("input", () => {
        applyPendingComposerFormatsToContent();

        if (!hasComposerText()) {
            pendingComposerFormats = new Set();
        }

        saveComposerSelection();
        syncFormatButtons();
    });
    composerTextarea.addEventListener("keyup", syncFormatButtons);
    composerTextarea.addEventListener("keyup", saveComposerSelection);
    composerTextarea.addEventListener("mouseup", syncFormatButtons);
    composerTextarea.addEventListener("mouseup", saveComposerSelection);
    composerTextarea.addEventListener("focus", syncFormatButtons);
    composerTextarea.addEventListener("focus", saveComposerSelection);
    composerTextarea.addEventListener("click", syncFormatButtons);
    composerTextarea.addEventListener("keydown", (event) => {
        if (!event.ctrlKey) {
            return;
        }

        const key = event.key.toLowerCase();
        if (key !== "b" && key !== "i") {
            return;
        }

        event.preventDefault();
        applyComposerFormat(key === "b" ? "bold" : "italic");
    });
    window.addEventListener("resize", updateEmojiPickerPosition);
    window.addEventListener(
        "scroll",
        () => {
            if (emojiPicker && !emojiPicker.hidden) {
                updateEmojiPickerPosition();
            }
        },
        { passive: true },
    );
    composerSection.addEventListener(
        "scroll",
        () => {
            if (emojiPicker && !emojiPicker.hidden) {
                updateEmojiPickerPosition();
            }
        },
        { passive: true },
    );
    document.addEventListener("selectionchange", () => {
        if (
            emojiPicker?.hidden === false ||
            document.activeElement === composerTextarea
        ) {
            saveComposerSelection();
            syncFormatButtons();
        }
    });
    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && emojiPicker && !emojiPicker.hidden) {
            closeEmojiPicker();
        }
    });

    geoButton?.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        openLocationModal();
    });

    mediaUploadButton?.addEventListener("click", (event) => {
        event.preventDefault();
        if ((fileInput?.files?.length ?? 0) >= maxAttachments) {
            return;
        }
        fileInput?.click();
    });

    fileInput?.addEventListener("change", () => {
        const files = Array.from(fileInput.files ?? []);
        if (files.length === 0) {
            pendingAttachmentEditIndex = null;
            return;
        }

        if (pendingAttachmentEditIndex !== null && files.length === 1) {
            const currentFiles = [...attachedComposerFiles];
            currentFiles[pendingAttachmentEditIndex] = files[0];
            pendingAttachmentEditIndex = null;
            renderAttachments(currentFiles.slice(0, maxAttachments));
            return;
        }

        pendingAttachmentEditIndex = null;
        renderAttachments(files.slice(0, maxAttachments));
    });

    attachmentList?.addEventListener("click", (event) => {
        const removeButton = event.target.closest("[data-remove-attachment]");
        if (!removeButton) {
            const editButton = event.target.closest("[data-attachment-edit-index]");
            if (!editButton || !fileInput) {
                return;
            }

            pendingAttachmentEditIndex = Number(
                editButton.getAttribute("data-attachment-edit-index"),
            );
            fileInput.value = "";
            fileInput.click();
            return;
        }

        const index = Number(
            removeButton.getAttribute("data-remove-attachment"),
        );
        const currentFiles = [...attachedComposerFiles];
        currentFiles.splice(index, 1);
        pendingAttachmentEditIndex = null;
        renderAttachments(currentFiles);
    });

    locationButton?.addEventListener("click", (event) => {
        event.preventDefault();
        openLocationModal();
    });

    locationModalClose?.addEventListener("click", closeLocationModal);
    locationModalOverlay?.addEventListener("click", (event) => {
        if (event.target === locationModalOverlay) {
            closeLocationModal();
        }
    });
    locationModalDelete?.addEventListener("click", () => {
        pendingLocation = "";
        applyLocation();
        closeLocationModal();
    });
    locationModalApply?.addEventListener("click", () => {
        applyLocation();
        closeLocationModal();
    });
    locationModalSearchInput?.addEventListener("input", renderLocationList);
    locationModalList?.addEventListener("click", (event) => {
        const item = event.target.closest("[data-location-value]");
        if (!item) {
            return;
        }

        pendingLocation = item.getAttribute("data-location-value") ?? "";
        renderLocationList();
    });

    document.addEventListener("click", (event) => {
        if (
            emojiPicker &&
            !emojiPicker.hidden &&
            !emojiPicker.contains(event.target) &&
            !emojiButton?.contains(event.target)
        ) {
            closeEmojiPicker();
        }
    });

    renderEmojiPicker();
    syncFormatButtons();

    function renderAttachments(files) {
        while (attachmentUrls.length > 0) {
            const url = attachmentUrls.pop();
            if (url) {
                URL.revokeObjectURL(url);
            }
        }

        if (!attachmentPreview || !attachmentList || !fileInput) {
            return;
        }

        if (files.length === 0) {
            attachedComposerFiles = [];
            attachmentPreview.hidden = true;
            attachmentList.innerHTML = "";
            fileInput.value = "";
            if (mediaUploadButton) {
                mediaUploadButton.disabled = false;
            }
            return;
        }

        const limitedFiles = files.slice(0, maxAttachments);
        attachedComposerFiles = [...limitedFiles];
        const dataTransfer = new DataTransfer();
        limitedFiles.forEach((file) => dataTransfer.items.add(file));
        fileInput.files = dataTransfer.files;
        if (mediaUploadButton) {
            mediaUploadButton.disabled = limitedFiles.length >= maxAttachments;
        }

        attachmentPreview.hidden = false;
        const objectUrls = limitedFiles.map((file) => {
            const objectUrl = URL.createObjectURL(file);
            attachmentUrls.push(objectUrl);
            return objectUrl;
        });

        if (limitedFiles.every((file) => file.type.startsWith("image/"))) {
            attachmentList.innerHTML = renderAttachmentImageGrid(objectUrls);
            return;
        }

        if (limitedFiles.length === 1 && limitedFiles[0].type.startsWith("video/")) {
            attachmentList.innerHTML = renderAttachmentVideo(limitedFiles[0], objectUrls[0]);
            return;
        }

        attachmentList.innerHTML = limitedFiles
            .map((file, index) =>
                renderAttachmentFileCard(file, index, objectUrls[index]),
            )
            .join("");
    }

    function getAttachmentImageCell(index, imageUrl, cellClass) {
        return `
            <div class="media-cell ${cellClass}">
                <div class="media-cell-inner">
                    <div class="media-img-container" aria-label="미디어" role="group">
                        <div class="media-bg" style="background-image: url('${imageUrl}');"></div>
                        <img alt="" draggable="false" src="${imageUrl}" class="media-img">
                    </div>
                    <div class="media-btn-row">
                        <button type="button" class="media-btn" data-attachment-edit-index="${index}">
                            <span>수정</span>
                        </button>
                    </div>
                    <button type="button" class="media-btn-delete" aria-label="미디어 삭제하기" data-remove-attachment="${index}">
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                            <g><path d="M10.59 12L4.54 5.96l1.42-1.42L12 10.59l6.04-6.05 1.42 1.42L13.41 12l6.05 6.04-1.42 1.42L12 13.41l-6.04 6.05-1.42-1.42L10.59 12z"></path></g>
                        </svg>
                    </button>
                </div>
            </div>
        `;
    }

    function renderAttachmentImageGrid(objectUrls) {
        const imageCount = objectUrls.length;

        if (imageCount === 1) {
            return `
                <div class="media-aspect-ratio media-aspect-ratio--single"></div>
                <div class="media-absolute-layer">
                    ${getAttachmentImageCell(0, objectUrls[0], "media-cell--single")}
                </div>
            `;
        }

        if (imageCount === 2) {
            return `
                <div class="media-aspect-ratio"></div>
                <div class="media-absolute-layer">
                    <div class="media-row">
                        <div class="media-col">
                            ${getAttachmentImageCell(0, objectUrls[0], "media-cell--left")}
                        </div>
                        <div class="media-col">
                            ${getAttachmentImageCell(1, objectUrls[1], "media-cell--right")}
                        </div>
                    </div>
                </div>
            `;
        }

        if (imageCount === 3) {
            return `
                <div class="media-aspect-ratio"></div>
                <div class="media-absolute-layer">
                    <div class="media-row">
                        <div class="media-col">
                            ${getAttachmentImageCell(0, objectUrls[0], "media-cell--left-tall")}
                        </div>
                        <div class="media-col">
                            ${getAttachmentImageCell(1, objectUrls[1], "media-cell--right-top")}
                            ${getAttachmentImageCell(2, objectUrls[2], "media-cell--right-bottom")}
                        </div>
                    </div>
                </div>
            `;
        }

        return `
            <div class="media-aspect-ratio"></div>
            <div class="media-absolute-layer">
                <div class="media-row">
                    <div class="media-col">
                        ${getAttachmentImageCell(0, objectUrls[0], "media-cell--top-left")}
                        ${getAttachmentImageCell(2, objectUrls[2], "media-cell--bottom-left")}
                    </div>
                    <div class="media-col">
                        ${getAttachmentImageCell(1, objectUrls[1], "media-cell--top-right")}
                        ${getAttachmentImageCell(3, objectUrls[3], "media-cell--bottom-right")}
                    </div>
                </div>
            </div>
        `;
    }

    function renderAttachmentVideo(file, objectUrl) {
        return `
            <div class="media-aspect-ratio media-aspect-ratio--single"></div>
            <div class="media-absolute-layer">
                <div class="media-cell media-cell--single">
                    <div class="media-cell-inner">
                        <div class="media-img-container" aria-label="미디어" role="group">
                            <video class="tweet-modal__attachment-video" controls preload="metadata">
                                <source src="${objectUrl}" type="${file.type}">
                            </video>
                        </div>
                        <div class="media-btn-row">
                            <button type="button" class="media-btn" data-attachment-edit-index="0">
                                <span>수정</span>
                            </button>
                        </div>
                        <button type="button" class="media-btn-delete" aria-label="미디어 삭제하기" data-remove-attachment="0">
                            <svg viewBox="0 0 24 24" aria-hidden="true">
                                <g><path d="M10.59 12L4.54 5.96l1.42-1.42L12 10.59l6.04-6.05 1.42 1.42L13.41 12l6.05 6.04-1.42 1.42L12 13.41l-6.04 6.05-1.42-1.42L10.59 12z"></path></g>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    function renderAttachmentFileCard(file, index, objectUrl) {
        if (file.type.startsWith("video/")) {
            return `
                <div class="media-cell media-cell--single">
                    <div class="media-cell-inner">
                        <div class="media-img-container" aria-label="미디어" role="group">
                            <video class="tweet-modal__attachment-video" controls preload="metadata">
                                <source src="${objectUrl}" type="${file.type}">
                            </video>
                        </div>
                        <div class="media-btn-row">
                            <button type="button" class="media-btn" data-attachment-edit-index="${index}">
                                <span>수정</span>
                            </button>
                        </div>
                        <button type="button" class="media-btn-delete" aria-label="미디어 삭제하기" data-remove-attachment="${index}">
                            <svg viewBox="0 0 24 24" aria-hidden="true">
                                <g><path d="M10.59 12L4.54 5.96l1.42-1.42L12 10.59l6.04-6.05 1.42 1.42L13.41 12l6.05 6.04-1.42 1.42L12 13.41l-6.04 6.05-1.42-1.42L10.59 12z"></path></g>
                            </svg>
                        </button>
                    </div>
                </div>
            `;
        }

        return `
            <div class="tweet-modal__attachment-file">
                <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
                    <g><path d="M14 2H7.75C5.68 2 4 3.68 4 5.75v12.5C4 20.32 5.68 22 7.75 22h8.5C18.32 22 20 20.32 20 18.25V8l-6-6zm0 2.12L17.88 8H14V4.12zm2.25 15.88h-8.5c-.97 0-1.75-.78-1.75-1.75V5.75C6 4.78 6.78 4 7.75 4H12v5.25c0 .41.34.75.75.75H18v8.25c0 .97-.78 1.75-1.75 1.75z"></path></g>
                </svg>
                <span class="tweet-modal__attachment-file-name">${file.name}</span>
                <button type="button" class="media-btn-delete" aria-label="파일 삭제하기" data-remove-attachment="${index}">
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                        <g><path d="M10.59 12L4.54 5.96l1.42-1.42L12 10.59l6.04-6.05 1.42 1.42L13.41 12l6.05 6.04-1.42 1.42L12 13.41l-6.04 6.05-1.42-1.42L10.59 12z"></path></g>
                    </svg>
                </button>
            </div>
        `;
    }

    function openLocationModal() {
        if (!locationModalOverlay) {
            return;
        }

        pendingLocation = locationButton?.textContent.trim() || "";
        locationModalOverlay.hidden = false;
        renderLocationList();
        locationModalSearchInput?.focus();
    }

    function closeLocationModal() {
        if (!locationModalOverlay) {
            return;
        }

        locationModalOverlay.hidden = true;
        if (locationModalSearchInput) {
            locationModalSearchInput.value = "";
        }
    }

    function renderLocationList() {
        if (!locationModalList || !locationModalApply || !locationModalDelete) {
            return;
        }

        const keyword = locationModalSearchInput?.value.trim() ?? "";
        const filtered = keyword
            ? availableLocations.filter((location) =>
                  location.includes(keyword),
              )
            : availableLocations;

        locationModalApply.disabled = pendingLocation === "";
        locationModalDelete.hidden =
            (locationButton?.textContent.trim() || "") === "";

        if (filtered.length === 0) {
            locationModalList.innerHTML =
                '<p class="tweet-modal__emoji-empty">일치하는 위치를 찾지 못했습니다.</p>';
            return;
        }

        locationModalList.innerHTML = filtered
            .map((location) => {
                const selected = pendingLocation === location;
                return `
                    <button type="button" class="locationModalItem" data-location-value="${location}">
                        <span>${location}</span>
                        <span class="locationModalCheck">${selected ? "✓" : ""}</span>
                    </button>
                `;
            })
            .join("");
    }

    function applyLocation() {
        if (!locationButton || !geoButton) {
            return;
        }

        locationButton.textContent = pendingLocation || "위치 추가";
        geoButton.classList.toggle(
            "tweet-modal__tool-btn--active",
            pendingLocation !== "",
        );
    }
}

function placeCaretAtEnd(element) {
    const selection = window.getSelection();
    if (!selection) {
        return;
    }

    const range = document.createRange();
    range.selectNodeContents(element);
    range.collapse(false);
    selection.removeAllRanges();
    selection.addRange(range);
}

function setupSearchForm() {
    const searchForm = document.getElementById("searchForm");
    const searchInput = document.getElementById("searchInput");
    const searchPanel = document.getElementById("searchPanel");
    const searchPanelEmpty = document.getElementById("searchPanelEmpty");
    const searchResults = document.getElementById("searchResults");
    const searchResultLabel = document.getElementById("searchResultLabel");

    if (!searchForm || !searchInput || !searchPanel) {
        return;
    }

    function openSearchPanel() {
        searchForm.classList.add("isFocused");
        searchPanel.hidden = false;
    }

    function closeSearchPanel() {
        searchForm.classList.remove("isFocused");
        searchPanel.hidden = true;
    }

    function updateSearchPanel() {
        const keyword = searchInput.value.trim();

        if (!searchPanelEmpty || !searchResults || !searchResultLabel) {
            return;
        }

        if (keyword === "") {
            searchPanelEmpty.hidden = false;
            searchResults.hidden = true;
            return;
        }

        searchPanelEmpty.hidden = true;
        searchResults.hidden = false;
        searchResultLabel.textContent = `#${keyword}`;
    }

    searchInput.addEventListener("focus", openSearchPanel);
    searchInput.addEventListener("click", openSearchPanel);
    searchInput.addEventListener("input", updateSearchPanel);

    document.addEventListener("click", (event) => {
        if (searchForm.contains(event.target)) {
            return;
        }

        closeSearchPanel();
    });

    updateSearchPanel();
}

function setupTimelineTabs() {
    const tabFeed = document.getElementById("tabFeed");
    const tabFriends = document.getElementById("tabFriends");
    const composerSection = document.getElementById("composerSection");
    const feedSection = document.getElementById("feedSection");
    const friendsSection = document.getElementById("friendsSection");

    if (
        !tabFeed ||
        !tabFriends ||
        !composerSection ||
        !feedSection ||
        !friendsSection
    ) {
        return;
    }

    function showFeedTab() {
        tabFeed.classList.add("isActive");
        tabFeed.setAttribute("aria-current", "page");
        tabFriends.classList.remove("isActive");
        tabFriends.removeAttribute("aria-current");
        composerSection.hidden = false;
        feedSection.hidden = false;
        friendsSection.hidden = true;
    }

    function showFriendsTab() {
        tabFriends.classList.add("isActive");
        tabFriends.setAttribute("aria-current", "page");
        tabFeed.classList.remove("isActive");
        tabFeed.removeAttribute("aria-current");
        composerSection.hidden = true;
        feedSection.hidden = true;
        friendsSection.hidden = false;
    }

    tabFeed.addEventListener("click", showFeedTab);
    tabFriends.addEventListener("click", showFriendsTab);
}

function setupConnectButtons() {
    const modal = document.getElementById("disconnectModal");
    const modalTitle = document.getElementById("modalTitle");
    const modalConfirm = document.getElementById("modalConfirm");
    const modalCancel = document.getElementById("modalCancel");
    let pendingButton = null;

    function openModal(button) {
        pendingButton = button;

        let handle = "";
        const card = button.closest("[data-handle]");
        if (card) {
            handle = card.dataset.handle;
        } else {
            const handleElement = button
                .closest(".trend-item")
                ?.querySelector(".sidebar-user-handle");
            if (handleElement) {
                handle = handleElement.textContent.trim();
            }
        }

        if (modalTitle) {
            modalTitle.textContent = handle
                ? `${handle} 님과의 연결을 끊으시겠습니까?`
                : "연결을 끊으시겠습니까?";
        }

        modal?.classList.add("active");
    }

    function closeModal() {
        modal?.classList.remove("active");
        pendingButton = null;
    }

    modalConfirm?.addEventListener("click", () => {
        if (pendingButton) {
            pendingButton.classList.remove("connected");
            pendingButton.classList.add("default");
            pendingButton.textContent = "Connect";
            pendingButton.style.borderColor = "";
            pendingButton.style.color = "";
            pendingButton.style.background = "";
        }
        closeModal();
    });

    modalCancel?.addEventListener("click", closeModal);

    modal?.addEventListener("click", (event) => {
        if (event.target === modal) {
            closeModal();
        }
    });

    document.addEventListener("click", (event) => {
        const button = event.target.closest(".connect-btn, .connect-btn-sm");
        if (!button) {
            return;
        }

        if (button.classList.contains("default")) {
            button.classList.remove("default");
            button.classList.add("connected");
            button.textContent = "Connected";
            return;
        }

        if (button.classList.contains("connected")) {
            openModal(button);
        }
    });

    document.addEventListener("mouseover", (event) => {
        const button = event.target.closest(
            ".connect-btn.connected, .connect-btn-sm.connected",
        );
        if (!button) {
            return;
        }

        button.textContent = "Disconnect";
        button.style.borderColor = "#f4212e";
        button.style.color = "#f4212e";
        button.style.background = "rgba(244,33,46,.1)";
    });

    document.addEventListener("mouseout", (event) => {
        const button = event.target.closest(
            ".connect-btn.connected, .connect-btn-sm.connected",
        );
        if (!button) {
            return;
        }

        button.textContent = "Connected";
        button.style.borderColor = "#cfd9de";
        button.style.color = "#0f1419";
        button.style.background = "transparent";
    });
}

function setupTweetActions() {
    document.querySelectorAll(".tweet-action-btn--like").forEach((button) => {
        const countElement = button.querySelector(".tweet-action-count");
        const path = button.querySelector("path");
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
            if (path) {
                path.setAttribute(
                    "d",
                    isActive
                        ? path.dataset.pathActive || path.getAttribute("d")
                        : path.dataset.pathInactive || path.getAttribute("d"),
                );
            }
        });
    });

    document
        .querySelectorAll(".tweet-action-btn--bookmark")
        .forEach((button) => {
            const path = button.querySelector("path");
            button.addEventListener("click", (event) => {
                event.preventDefault();
                const isActive = button.classList.toggle("active");
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
        });
    });

    document
        .querySelectorAll(".tweet-action-btn[data-testid='reply']")
        .forEach((button) => {
            button.addEventListener("click", (event) => {
                event.preventDefault();
            });
        });
}

function setupExpandablePostText() {
    const maxLength = 200;

    document.querySelectorAll(".postText").forEach((element, index) => {
        const fullText = element.textContent.replace(/\s+/g, " ").trim();
        if (fullText.length <= maxLength) {
            return;
        }

        const truncatedText = `${fullText.slice(0, maxLength).trimEnd()}...`;
        const toggleButton = document.createElement("button");
        toggleButton.type = "button";
        toggleButton.className = "postTextToggle";
        toggleButton.id = `${element.id || `postText${index}`}_toggle`;
        toggleButton.textContent = "더보기";
        const textSpan = document.createElement("span");
        textSpan.className = "postTextContent";
        textSpan.textContent = truncatedText;

        element.dataset.fullText = fullText;
        element.textContent = "";
        element.append(textSpan, toggleButton);

        toggleButton.addEventListener("click", () => {
            textSpan.textContent = element.dataset.fullText || fullText;
            toggleButton.remove();
        });
    });
}

function setupMediaPreview() {
    const mediaPreviewOverlay = document.getElementById("mediaPreviewOverlay");
    const mediaPreviewImage = document.getElementById("mediaPreviewImage");
    const mediaPreviewClose = document.getElementById("mediaPreviewClose");

    if (!mediaPreviewOverlay || !mediaPreviewImage) {
        return;
    }

    function closePreview() {
        mediaPreviewOverlay.hidden = true;
        mediaPreviewImage.removeAttribute("src");
    }

    document
        .querySelectorAll("img.postMediaImage, img.postAvatarImage")
        .forEach((image) => {
            image.addEventListener("click", () => {
                const imageSrc = image.getAttribute("src");
                if (!imageSrc) {
                    return;
                }

                mediaPreviewImage.src = imageSrc;
                mediaPreviewImage.alt = image.alt || "게시물 이미지 미리보기";
                mediaPreviewOverlay.hidden = false;
            });
        });

    mediaPreviewClose?.addEventListener("click", closePreview);

    mediaPreviewOverlay.addEventListener("click", (event) => {
        if (event.target === mediaPreviewOverlay) {
            closePreview();
        }
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && !mediaPreviewOverlay.hidden) {
            closePreview();
        }
    });
}
