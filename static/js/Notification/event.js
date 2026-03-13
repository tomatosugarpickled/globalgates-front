window.onload = function () {
    // ===== 1. DOM =====
    // 탭 네비게이션 링크 목록
    const tabLinks = document.querySelectorAll(".tab-link");
    // 알림 탭 버튼 목록 (전체/확인됨/언급)
    const notifTabs = document.querySelectorAll(".notif-tab");
    // 하단 네비게이션 바 (스크롤 시 숨김/표시)
    const bottombarSlide = document.querySelector(".bottombar-slide");
    // 드롭다운/모달이 렌더링되는 레이어 루트 요소
    const layersRoot = document.getElementById("layers");

    // 답글 모달의 오버레이 배경
    const replyModalOverlay = document.querySelector("[data-reply-modal]");
    // 답글 모달 내부에서 단일 요소를 선택하는 헬퍼
    const q = (sel) => replyModalOverlay?.querySelector(sel);
    // 답글 모달 내부에서 복수 요소를 선택하는 헬퍼
    const qAll = (sel) => replyModalOverlay?.querySelectorAll(sel) ?? [];

    // 답글 모달 본체 컨테이너
    const replyModal = q(".tweet-modal");
    // 답글 모달의 닫기 버튼
    const replyCloseButton = q(".tweet-modal__close");
    // 답글 텍스트 입력 에디터 (contenteditable)
    const replyEditor = q(".tweet-modal__editor");
    // 답글 제출(게시) 버튼
    const replySubmitButton = q(".tweet-modal__submit");
    // 답글 글자수 진행률 표시 컨테이너
    const replyProgress = q(".tweet-modal__progress");
    // 답글 글자수 진행률 바
    const replyProgressBar = q(".tweet-modal__progress-bar");
    // 답글 대상 게시물의 컨텍스트 버튼
    const replyContextButton = q(".tweet-modal__context-button");
    // 답글 하단 메타 정보 영역 (위치 등)
    const replyFooterMeta = q(".tweet-modal__footer-meta");
    // 원본 게시물 작성자의 아바타 이미지
    const replySourceAvatar = q(".tweet-modal__source-avatar");
    // 원본 게시물 작성자의 표시 이름
    const replySourceName = q(".tweet-modal__source-name");
    // 원본 게시물 작성자의 핸들 (@아이디)
    const replySourceHandle = q(".tweet-modal__source-handle");
    // 원본 게시물의 작성 시간
    const replySourceTime = q(".tweet-modal__source-time");
    // 원본 게시물의 본문 텍스트
    const replySourceText = q(".tweet-modal__source-text");
    // 텍스트 서식 버튼 목록 (굵게/기울임)
    const replyFormatButtons = qAll("[data-format]");
    // 이모지 피커 열기 버튼
    const replyEmojiButton = q("[data-testid='emojiButton']");
    // 이모지 선택 피커 패널
    const replyEmojiPicker = q(".tweet-modal__emoji-picker");
    // 이모지 검색 입력 필드
    const replyEmojiSearchInput = q("[data-testid='emojiSearchInput']");
    // 이모지 카테고리 탭 버튼 목록
    const replyEmojiTabs = qAll(".tweet-modal__emoji-tab");
    // 이모지 피커의 콘텐츠 영역
    const replyEmojiContent = q("[data-testid='emojiPickerContent']");
    // 미디어 업로드 버튼
    const replyMediaUploadButton = q("[data-testid='mediaUploadButton']");
    // 숨겨진 파일 입력 요소
    const replyFileInput = q("[data-testid='fileInput']");
    // 첨부파일 미리보기 컨테이너
    const replyAttachmentPreview = q("[data-attachment-preview]");
    // 첨부파일 미디어 렌더링 영역
    const replyAttachmentMedia = q("[data-attachment-media]");
    // 답글 작성 메인 뷰
    const composeView = q(".tweet-modal__compose-view");
    // 위치 태그 버튼
    const replyGeoButton = q("[data-testid='geoButton']");
    // 위치 버튼의 SVG path 요소
    const replyGeoButtonPath = replyGeoButton?.querySelector("path");
    // 선택된 위치를 표시하는 버튼
    const replyLocationDisplayButton = q("[data-location-display]");
    // 선택된 위치 이름 텍스트
    const replyLocationName = q("[data-location-name]");
    // 위치 선택 패널 뷰
    const replyLocationView = q(".tweet-modal__location-view");
    // 위치 패널의 닫기 버튼
    const replyLocationCloseButton = q(".tweet-modal__location-close");
    // 위치 삭제 버튼
    const replyLocationDeleteButton = q("[data-location-delete]");
    // 위치 선택 완료 버튼
    const replyLocationCompleteButton = q("[data-location-complete]");
    // 위치 검색 입력 필드
    const replyLocationSearchInput = q("[data-location-search]");
    // 위치 목록 컨테이너
    const replyLocationList = q("[data-location-list]");
    // 사용자 태그 트리거 버튼
    const replyUserTagTrigger = q("[data-user-tag-trigger]");
    // 사용자 태그 라벨 텍스트
    const replyUserTagLabel = q("[data-user-tag-label]");
    // 사용자 태그 패널 뷰
    const replyTagView = q(".tweet-modal__tag-view");
    // 태그 패널의 뒤로가기 버튼
    const replyTagCloseButton = q("[data-testid='tag-back']");
    // 태그 선택 완료 버튼
    const replyTagCompleteButton = q("[data-tag-complete]");
    // 태그 검색 폼
    const replyTagSearchForm = q("[data-tag-search-form]");
    // 태그 검색 입력 필드
    const replyTagSearchInput = q("[data-tag-search]");
    // 선택된 태그 칩 목록 컨테이너
    const replyTagChipList = q("[data-tag-chip-list]");
    // 태그 검색 결과 목록 컨테이너
    const replyTagResults = q("[data-tag-results]");
    // 미디어 대체 텍스트(ALT) 편집 트리거 버튼
    const replyMediaAltTrigger = q("[data-media-alt-trigger]");
    // 미디어 대체 텍스트 라벨
    const replyMediaAltLabel = q("[data-media-alt-label]");
    // 미디어 편집 패널 뷰
    const replyMediaView = q(".tweet-modal__media-view");
    // 미디어 편집 패널의 뒤로가기 버튼
    const replyMediaBackButton = q("[data-testid='media-back']");
    // 이전 미디어로 이동 버튼
    const replyMediaPrevButton = q("[data-media-prev]");
    // 다음 미디어로 이동 버튼
    const replyMediaNextButton = q("[data-media-next]");
    // 미디어 편집 저장 버튼
    const replyMediaSaveButton = q("[data-media-save]");
    // 미디어 편집 패널 제목
    const replyMediaTitle = q("[data-media-title]");
    // 미디어 미리보기 이미지 목록
    const replyMediaPreviewImages = qAll("[data-media-preview-image]");
    // 미디어 대체 텍스트 입력 필드
    const replyMediaAltInput = q("[data-media-alt-input]");
    // 미디어 대체 텍스트 글자수 카운터
    const replyMediaAltCount = q("[data-media-alt-count]");

    // ===== 2. State =====
    // 스크롤 위치, 답글 트리거 버튼, 공유 드롭다운/버튼 상태
    let lastScrollY = 0,
        activeReplyTrigger = null,
        activeShareDropdown = null,
        activeShareButton = null;
    // 공유 모달/토스트, 더보기 드롭다운/버튼 상태
    let activeShareModal = null,
        activeShareToast = null,
        activeMoreDropdown = null,
        activeMoreButton = null;
    // 알림 모달/토스트, 저장된 답글 텍스트 선택 영역
    let activeNotificationModal = null,
        activeNotificationToast = null,
        savedReplySelection = null;
    // 답글 서식(굵게/기울임) 상태, 활성 이모지 카테고리
    let pendingReplyFormats = new Set(),
        activeEmojiCategory = "recent";
    // 확정된 위치, 임시 선택 위치
    let selectedLocation = null,
        pendingLocation = null;
    // 확정된 태그 사용자 목록, 임시 태그 사용자 목록
    let selectedTaggedUsers = [],
        pendingTaggedUsers = [];
    // 미디어 ALT 편집 상태, 임시 편집 상태, 현재 미디어 인덱스
    let replyMediaEdits = [],
        pendingReplyMediaEdits = [],
        activeReplyMediaIndex = 0;
    // 첨부된 파일 목록, 파일 Object URL 목록
    let attachedReplyFiles = [],
        attachedReplyFileUrls = [];
    // 편집 중인 첨부파일 인덱스, 태그 검색 결과, 캐시된 위치명 목록
    let pendingAttachmentEditIndex = null,
        currentTagResults = [],
        cachedLocationNames = [];
    // 사용자별 팔로우 상태를 저장하는 Map
    const notificationFollowState = new Map();
    // 최대 첨부 이미지 수, 미디어 ALT 텍스트 최대 길이
    const maxReplyImages = 4,
        maxReplyMediaAltLength = 1000;

    // ===== 3. Config =====
    // 최근 사용 이모지 로컬스토리지 키
    const emojiRecentsKey = "notification_reply_recent_emojis";
    // 최근 사용 이모지 최대 저장 개수
    const maxRecentEmojis = 18;
    // 신고 사유 목록
    const notificationReportReasons = [
        "다른 회사 제품 도용 신고",
        "실제 존재하지 않는 제품 등록 신고",
        "스펙·원산지 허위 표기 신고",
        "특허 제품 무단 판매 신고",
        "수출입 제한 품목 신고",
        "반복적인 동일 게시물 신고",
    ];

    // 이모지 카테고리별 메타 정보 (라벨, 섹션 제목, 아이콘 SVG)
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

    // 이모지 카테고리별 이모지 데이터 배열
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

    // 서식 버튼의 활성/비활성 상태별 접근성 라벨
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
    // 요소의 텍스트 콘텐츠를 트림하여 반환한다
    function getTextContent(el) {
        return el?.textContent.trim() ?? "";
    }

    // HTML 특수문자를 이스케이프 처리한다
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

    // 지정 범위 내 이모지를 Twemoji SVG로 변환한다
    function parseTwemoji(scope) {
        if (scope && window.twemoji)
            window.twemoji.parse(scope, { folder: "svg", ext: ".svg" });
    }

    // 로컬스토리지에서 최근 사용 이모지 목록을 가져온다
    function getRecentEmojis() {
        try {
            const s = window.localStorage.getItem(emojiRecentsKey);
            const p = s ? JSON.parse(s) : [];
            return Array.isArray(p) ? p : [];
        } catch {
            return [];
        }
    }

    // 이모지를 최근 사용 목록 맨 앞에 저장한다
    function saveRecentEmoji(emoji) {
        const recent = getRecentEmojis().filter((i) => i !== emoji);
        recent.unshift(emoji);
        try {
            window.localStorage.setItem(
                emojiRecentsKey,
                JSON.stringify(recent.slice(0, maxRecentEmojis)),
            );
        } catch {
            return;
        }
    }

    // 최근 사용 이모지 목록을 초기화한다
    function clearRecentEmojis() {
        try {
            window.localStorage.removeItem(emojiRecentsKey);
        } catch {
            return;
        }
    }
    // 이모지 검색 입력값을 소문자로 반환한다
    function getEmojiSearchTerm() {
        return replyEmojiSearchInput?.value.trim().toLowerCase() ?? "";
    }

    // 특정 카테고리의 이모지 항목 배열을 반환한다
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

    // 검색어로 필터링된 이모지 항목을 반환한다
    function getFilteredEmojiEntries(category) {
        const entries = getEmojiEntriesForCategory(category);
        const term = getEmojiSearchTerm();
        if (!term) return entries;
        return entries.filter((e) =>
            e.keywords.some((k) => k.toLowerCase().includes(term)),
        );
    }

    // 이모지 섹션 HTML을 생성한다 (제목, 그리드, 비어있을 때 메시지 포함)
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

    // 이모지 카테고리 탭의 활성 상태를 렌더링한다
    function renderEmojiTabs() {
        replyEmojiTabs.forEach((tab) => {
            const cat = tab.getAttribute("data-emoji-category");
            const meta = cat ? emojiCategoryMeta[cat] : null;
            const active = cat === activeEmojiCategory;
            tab.classList.toggle("tweet-modal__emoji-tab--active", active);
            tab.setAttribute("aria-selected", String(active));
            if (meta) tab.innerHTML = meta.icon;
        });
        parseTwemoji(replyEmojiPicker);
    }

    // 이모지 피커의 콘텐츠 영역을 렌더링한다 (검색/카테고리별)
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
            parseTwemoji(replyEmojiContent);
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
            parseTwemoji(replyEmojiContent);
            return;
        }
        replyEmojiContent.innerHTML = buildEmojiSection(
            emojiCategoryMeta[activeEmojiCategory].sectionTitle,
            getEmojiEntriesForCategory(activeEmojiCategory).map((e) => e.emoji),
        );
        parseTwemoji(replyEmojiContent);
    }

    // 이모지 피커 전체를 렌더링한다 (탭 + 콘텐츠)
    function renderEmojiPicker() {
        renderEmojiTabs();
        renderEmojiPickerContent();
    }

    // ===== 4-1. User Tags =====
    // 태그된 사용자 배열을 깊은 복사한다
    function cloneTaggedUsers(users) {
        return users.map((u) => ({ ...u }));
    }

    // 현재 페이지의 트윗 목록에서 태그 가능한 사용자 목록을 추출한다
    function getCurrentPageTagUsers() {
        const tweetItems = document.querySelectorAll(".notif-tweet-item");
        const seen = new Set();
        return Array.from(tweetItems)
            .map((item, i) => {
                const name = getTextContent(
                    item.querySelector(".tweet-displayname"),
                );
                const handle = getTextContent(
                    item.querySelector(".tweet-handle"),
                );
                const avatar =
                    item.querySelector(".tweet-avatar")?.getAttribute("src") ??
                    "";
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

    // 태그 모달이 열려 있는지 확인한다
    function isTagModalOpen() {
        return Boolean(replyTagView && !replyTagView.hidden);
    }
    // 태그 검색 입력값을 반환한다
    function getTagSearchTerm() {
        return replyTagSearchInput?.value.trim() ?? "";
    }

    // 태그된 사용자 이름을 요약 문자열로 반환한다
    function getTaggedUserSummary(users) {
        return users.length === 0
            ? "사용자 태그하기"
            : users.map((u) => u.name).join(", ");
    }

    // 사용자 태그 트리거 버튼의 표시/비활성 상태를 동기화한다
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

    // 태그된 사용자 칩 목록을 렌더링한다
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

    // 검색어와 일치하는 태그 가능 사용자를 필터링한다
    function getFilteredTagUsers(query) {
        const nq = query.trim().toLowerCase();
        if (!nq) return [];
        return getCurrentPageTagUsers()
            .filter((u) => `${u.name} ${u.handle}`.toLowerCase().includes(nq))
            .slice(0, 6);
    }

    // 태그 검색 결과 목록을 렌더링한다
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
        replyTagSearchInput.setAttribute(
            "aria-controls",
            "notification-tag-results",
        );
        replyTagResults.setAttribute("role", "listbox");
        replyTagResults.id = "notification-tag-results";
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

    // 태그 검색을 실행하고 결과를 렌더링한다
    function runTagSearch() {
        const tq = getTagSearchTerm();
        renderTagResults(tq ? getFilteredTagUsers(tq) : []);
    }

    // 태그 패널을 열고 검색 입력에 포커스한다
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

    // 태그 패널을 닫고 변경 사항을 되돌린다
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
                replyUserTagTrigger && !replyUserTagTrigger.hidden
                    ? replyUserTagTrigger.focus()
                    : replyEditor?.focus();
            });
    }

    // 임시 태그 사용자를 확정 반영한다
    function applyPendingTaggedUsers() {
        selectedTaggedUsers = cloneTaggedUsers(pendingTaggedUsers);
        syncUserTagTrigger();
    }

    // 태그된 사용자 상태를 모두 초기화한다
    function resetTaggedUsers() {
        selectedTaggedUsers = [];
        pendingTaggedUsers = [];
        if (replyTagSearchInput) replyTagSearchInput.value = "";
        renderTagChipList();
        renderTagResults([]);
        syncUserTagTrigger();
    }

    // ===== 4-2. Media Alt Editor =====
    // 기본 미디어 편집 객체를 생성한다
    function createDefaultReplyMediaEdit() {
        return { alt: "" };
    }
    // 미디어 편집 배열을 깊은 복사한다
    function cloneReplyMediaEdits(edits) {
        return edits.map((e) => ({ alt: e.alt }));
    }
    // 미디어 편집기가 열려 있는지 확인한다
    function isMediaEditorOpen() {
        return Boolean(replyMediaView && !replyMediaView.hidden);
    }
    // 미디어 ALT 트리거 라벨을 반환한다 (설명 추가/수정)
    function getReplyMediaTriggerLabel() {
        return replyMediaEdits.some((e) => e.alt.trim().length > 0)
            ? "설명 수정"
            : "설명 추가";
    }

    // 첨부파일 변경에 맞춰 미디어 편집 상태를 동기화한다
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

    // 현재 선택된 미디어의 Object URL을 반환한다
    function getCurrentReplyMediaUrl() {
        return attachedReplyFileUrls[activeReplyMediaIndex] ?? "";
    }
    // 특정 인덱스의 미디어 ALT 텍스트를 반환한다
    function getReplyMediaImageAlt(index) {
        return replyMediaEdits[index]?.alt ?? "";
    }
    // 현재 선택된 미디어의 임시 편집 객체를 반환한다
    function getCurrentPendingReplyMediaEdit() {
        return (
            pendingReplyMediaEdits[activeReplyMediaIndex] ??
            createDefaultReplyMediaEdit()
        );
    }
    // 미디어 편집 패널 제목을 반환한다
    function getReplyMediaTitle() {
        return "이미지 설명 수정";
    }

    // 미디어 ALT 트리거 버튼의 표시/비활성 상태를 동기화한다
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

    // 미디어 편집기 UI를 현재 상태에 맞게 렌더링한다
    function renderMediaEditor() {
        if (!replyMediaView || pendingReplyMediaEdits.length === 0) return;
        const edit = getCurrentPendingReplyMediaEdit();
        const url = getCurrentReplyMediaUrl();
        const alt = edit.alt ?? "";
        if (replyMediaTitle) replyMediaTitle.textContent = getReplyMediaTitle();
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

    // 미디어 편집기를 열고 ALT 입력에 포커스한다
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

    // 미디어 편집기를 닫고 선택적으로 변경 사항을 되돌린다
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
                replyMediaAltTrigger && !replyMediaAltTrigger.hidden
                    ? replyMediaAltTrigger.focus()
                    : replyEditor?.focus();
            });
    }

    // 미디어 편집 내용을 저장하고 편집기를 닫는다
    function saveReplyMediaEdits() {
        replyMediaEdits = cloneReplyMediaEdits(pendingReplyMediaEdits);
        renderReplyAttachment();
        syncMediaAltTrigger();
        closeMediaEditor({ discardChanges: false });
    }

    // ===== 4-3. Location =====
    // 위치 모달이 열려 있는지 확인한다
    function isLocationModalOpen() {
        return Boolean(replyLocationView && !replyLocationView.hidden);
    }
    // 위치 검색 입력값을 반환한다
    function getLocationSearchTerm() {
        return replyLocationSearchInput?.value.trim() ?? "";
    }

    // 검색어로 필터링된 위치 목록을 반환한다
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

    // 위치 관련 UI 요소들의 상태를 동기화한다
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

    // 위치 목록을 렌더링한다 (선택 상태 체크 포함)
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

    // 위치 선택 패널을 열고 검색 입력에 포커스한다
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

    // 위치 패널을 닫고 변경 사항을 되돌린다
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

    // 선택한 위치를 확정 반영한다
    function applyLocation(loc) {
        selectedLocation = loc;
        pendingLocation = loc;
        syncLocationUI();
    }

    // 위치 상태를 모두 초기화한다
    function resetLocationState() {
        selectedLocation = null;
        pendingLocation = null;
        if (replyLocationSearchInput) replyLocationSearchInput.value = "";
        renderLocationList();
        syncLocationUI();
    }

    // 첨부파일이 존재하는지 확인한다
    function hasReplyAttachment() {
        return attachedReplyFiles.length > 0;
    }

    // 첨부파일 Object URL을 해제하고 배열을 초기화한다
    function clearAttachedReplyFileUrls() {
        if (attachedReplyFileUrls.length === 0) return;
        attachedReplyFileUrls.forEach((u) => URL.revokeObjectURL(u));
        attachedReplyFileUrls = [];
    }

    // 첨부파일이 모두 이미지인지 확인한다
    function isReplyImageSet() {
        return (
            attachedReplyFiles.length > 0 &&
            attachedReplyFiles.every((f) => f.type.startsWith("image/"))
        );
    }
    // 첨부파일이 단일 동영상인지 확인한다
    function isReplyVideoSet() {
        return (
            attachedReplyFiles.length === 1 &&
            attachedReplyFiles[0].type.startsWith("video/")
        );
    }

    // 답글 첨부파일을 모두 초기화한다
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

    // 첨부파일들의 Object URL을 생성한다
    function createReplyAttachmentUrls() {
        clearAttachedReplyFileUrls();
        attachedReplyFileUrls = attachedReplyFiles.map((f) =>
            URL.createObjectURL(f),
        );
    }

    // 이미지 그리드의 개별 셀 HTML을 생성한다
    function getReplyImageCell(index, url, cls) {
        const alt = getReplyMediaImageAlt(index);
        return `<div class="media-cell ${cls}"><div class="media-cell-inner"><div class="media-img-container" aria-label="미디어" role="group"><div class="media-bg" style="background-image: url('${url}');"></div><img alt="${escapeHtml(alt)}" draggable="false" src="${url}" class="media-img"></div><div class="media-btn-row"><button type="button" class="media-btn" data-attachment-edit-index="${index}"><span>수정</span></button></div><button type="button" class="media-btn-delete" aria-label="미디어 삭제하기" data-attachment-remove-index="${index}"><svg viewBox="0 0 24 24" aria-hidden="true"><g><path d="M10.59 12L4.54 5.96l1.42-1.42L12 10.59l6.04-6.05 1.42 1.42L13.41 12l6.05 6.04-1.42 1.42L12 13.41l-6.04 6.05-1.42-1.42L10.59 12z"></path></g></svg></button></div></div>`;
    }

    // 첨부 이미지를 1~4개 그리드 레이아웃으로 렌더링한다
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

    // 첨부 동영상을 미리보기로 렌더링한다
    function renderReplyVideoAttachment() {
        if (!replyAttachmentMedia || attachedReplyFiles.length === 0) return;
        const [file] = attachedReplyFiles,
            [fileUrl] = attachedReplyFileUrls;
        replyAttachmentMedia.innerHTML = `<div class="media-aspect-ratio media-aspect-ratio--single"></div><div class="media-absolute-layer"><div class="media-cell media-cell--single"><div class="media-cell-inner"><div class="media-img-container" aria-label="미디어" role="group"><video class="tweet-modal__attachment-video" controls preload="metadata"><source src="${fileUrl}" type="${file.type}"></video></div><div class="media-btn-row"><button type="button" class="media-btn" data-attachment-edit-index="0"><span>수정</span></button></div><button type="button" class="media-btn-delete" aria-label="미디어 삭제하기" data-attachment-remove-index="0"><svg viewBox="0 0 24 24" aria-hidden="true"><g><path d="M10.59 12L4.54 5.96l1.42-1.42L12 10.59l6.04-6.05 1.42 1.42L13.41 12l6.05 6.04-1.42 1.42L12 13.41l-6.04 6.05-1.42-1.42L10.59 12z"></path></g></svg></button></div></div></div>`;
    }

    // 첨부파일 유형에 따라 적절한 미리보기를 렌더링한다
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

    // 특정 인덱스의 첨부파일을 제거한다
    function removeReplyAttachment(index) {
        attachedReplyFiles = attachedReplyFiles.filter((_, i) => i !== index);
        pendingAttachmentEditIndex = null;
        renderReplyAttachment();
    }

    // 파일 입력 변경 시 첨부파일을 처리한다 (교체/추가)
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

    // 답글 에디터에 텍스트가 입력되어 있는지 확인한다
    function hasReplyEditorText() {
        return replyEditor
            ? replyEditor.textContent.replace(/\u00a0/g, " ").trim().length > 0
            : false;
    }

    // 대기 중인 서식(굵게/기울임)을 토글한다
    function togglePendingReplyFormat(fmt) {
        pendingReplyFormats.has(fmt)
            ? pendingReplyFormats.delete(fmt)
            : pendingReplyFormats.add(fmt);
    }

    // 대기 중인 서식을 에디터 콘텐츠에 적용한다
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

    // 에디터의 현재 텍스트 선택 영역을 저장한다
    function saveReplySelection() {
        if (!replyEditor) return;
        const sel = window.getSelection();
        if (!sel || sel.rangeCount === 0) return;
        const range = sel.getRangeAt(0);
        if (replyEditor.contains(range.commonAncestorContainer))
            savedReplySelection = range.cloneRange();
    }

    // 저장된 텍스트 선택 영역을 복원한다
    function restoreReplySelection() {
        if (!replyEditor || !savedReplySelection) return false;
        const sel = window.getSelection();
        if (!sel) return false;
        sel.removeAllRanges();
        sel.addRange(savedReplySelection);
        return true;
    }

    // 선택된 텍스트에 서식(굵게/기울임)을 적용한다
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

    // 서식 버튼의 활성 상태를 현재 선택 영역과 동기화한다
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

    // 이모지 피커를 닫는다
    function closeEmojiPicker() {
        if (!replyEmojiPicker || !replyEmojiButton) return;
        replyEmojiPicker.hidden = true;
        replyEmojiButton.setAttribute("aria-expanded", "false");
    }

    // 이모지 피커의 위치를 버튼 기준으로 계산하여 업데이트한다
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

    // 이모지 피커를 열고 위치를 계산한다
    function openEmojiPicker() {
        if (!replyEmojiPicker || !replyEmojiButton) return;
        renderEmojiPicker();
        replyEmojiPicker.hidden = false;
        replyEmojiButton.setAttribute("aria-expanded", "true");
        updateEmojiPickerPosition();
        parseTwemoji(replyEmojiPicker);
    }

    // 이모지 피커를 열기/닫기 토글한다
    function toggleEmojiPicker() {
        if (!replyEmojiPicker) return;
        replyEmojiPicker.hidden ? openEmojiPicker() : closeEmojiPicker();
    }

    // 선택한 이모지를 에디터 커서 위치에 삽입한다
    function insertReplyEmoji(emoji) {
        if (!replyEditor) return;
        replyEditor.focus();
        if (!restoreReplySelection()) {
            const range = document.createRange();
            range.selectNodeContents(replyEditor);
            range.collapse(false);
            const sel = window.getSelection();
            sel?.removeAllRanges();
            sel?.addRange(range);
        }
        if (!document.execCommand("insertText", false, emoji)) {
            const sel = window.getSelection();
            if (!sel || sel.rangeCount === 0) return;
            const range = sel.getRangeAt(0);
            range.deleteContents();
            range.insertNode(document.createTextNode(emoji));
            range.collapse(false);
            sel.removeAllRanges();
            sel.addRange(range);
        }
        applyPendingReplyFormatsToContent();
        saveRecentEmoji(emoji);
        saveReplySelection();
        syncReplySubmitState();
        syncReplyFormatButtons();
        renderEmojiPicker();
    }

    // 하단 탭 네비게이션의 활성 탭을 변경한다
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

    // 답글 제출 버튼과 진행률 바를 현재 입력 상태에 맞게 동기화한다
    function syncReplySubmitState() {
        if (
            !replyEditor ||
            !replySubmitButton ||
            !replyProgressBar ||
            !replyProgress
        )
            return;
        const text = replyEditor.textContent.replace(/\u00a0/g, " ").trim();
        const canSubmit = text.length > 0 || hasReplyAttachment();
        const pv = Math.min((text.length / 280) * 100, 100);
        replySubmitButton.disabled = !canSubmit;
        replyProgressBar.style.width = `${pv}%`;
        replyProgress.setAttribute("aria-valuenow", String(Math.round(pv)));
    }

    // 답글 대상 게시물의 컨텍스트 텍스트를 반환한다
    function getReplyContextText(tweetItem) {
        return (
            getTextContent(tweetItem?.querySelector(".tweet-reply-to")) ||
            "답글을 보낼 게시물을 찾지 못했습니다."
        );
    }

    // 답글 모달에 원본 게시물 정보를 채워 넣는다
    function populateReplyModal(button) {
        const ti = button.closest(".notif-tweet-item");
        if (!ti) return;
        if (replyContextButton)
            replyContextButton.textContent = getReplyContextText(ti);
        if (replySourceAvatar)
            replySourceAvatar.src =
                ti.querySelector(".tweet-avatar")?.getAttribute("src") ??
                replySourceAvatar.src;
        if (replySourceName)
            replySourceName.textContent = getTextContent(
                ti.querySelector(".tweet-displayname"),
            );
        if (replySourceHandle)
            replySourceHandle.textContent = getTextContent(
                ti.querySelector(".tweet-handle"),
            );
        if (replySourceTime)
            replySourceTime.textContent = getTextContent(
                ti.querySelector(".tweet-time"),
            );
        if (replySourceText)
            replySourceText.textContent = getTextContent(
                ti.querySelector(".tweet-text"),
            );
    }

    // ===== 5. Reply Modal =====
    // 답글 모달을 열고 모든 상태를 초기화한다
    function openReplyModal(button) {
        if (!replyModalOverlay || !replyEditor) return;
        activeReplyTrigger = button;
        document.body.classList.add("modal-open");
        replyModalOverlay.hidden = false;
        populateReplyModal(button);
        closeEmojiPicker();
        replyEditor.textContent = "";
        savedReplySelection = null;
        pendingReplyFormats = new Set();
        activeEmojiCategory = "recent";
        selectedLocation = null;
        pendingLocation = null;
        selectedTaggedUsers = [];
        pendingTaggedUsers = [];
        resetReplyAttachment();
        if (replyEmojiSearchInput) replyEmojiSearchInput.value = "";
        if (replyLocationSearchInput) replyLocationSearchInput.value = "";
        if (composeView) composeView.hidden = false;
        if (replyLocationView) replyLocationView.hidden = true;
        if (replyTagView) replyTagView.hidden = true;
        if (replyMediaView) replyMediaView.hidden = true;
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

    // 답글 모달을 닫을 수 있는지 확인한다 (작성 중이면 확인 대화상자 표시)
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

    // 답글 모달을 닫고 모든 상태를 정리한다
    function closeReplyModal(options = {}) {
        const { skipConfirm = false, restoreFocus = true } = options;
        if (!replyModalOverlay || replyModalOverlay.hidden) return;
        if (!skipConfirm && !canCloseReplyModal()) return;
        replyModalOverlay.hidden = true;
        document.body.classList.remove("modal-open");
        closeEmojiPicker();
        closeLocationPanel({ restoreFocus: false });
        closeTagPanel({ restoreFocus: false });
        closeMediaEditor({ restoreFocus: false, discardChanges: true });
        closeDraftPanel({ restoreFocus: false });
        if (replyEditor) replyEditor.textContent = "";
        savedReplySelection = null;
        pendingReplyFormats = new Set();
        selectedLocation = null;
        pendingLocation = null;
        selectedTaggedUsers = [];
        pendingTaggedUsers = [];
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

    // 모달 내에서 Tab 키 포커스를 가두어 접근성을 보장한다
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

    // 답글 버튼의 카운트를 1 증가시킨다
    function updateReplyCount(button) {
        const cnt = button.querySelector(".tweet-action-count");
        if (!cnt) return;
        const next = (Number.parseInt(cnt.textContent || "0", 10) || 0) + 1;
        cnt.textContent = String(next);
        button.setAttribute("aria-label", `${next} 답글`);
    }

    // ===== 6. Share / More Dropdowns =====
    // 브라우저 히스토리에 경로를 추가한다
    function pushSharePath(p) {
        try {
            window.history.pushState({}, "", p);
        } catch {
            return;
        }
    }

    // 공유할 게시물의 메타 정보 (핸들, ID, 퍼머링크, 북마크 버튼)를 반환한다
    function getSharePostMeta(button) {
        const ti = button.closest(".notif-tweet-item");
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

    // 게시물 링크를 클립보드에 복사한다
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

    // 공유 대상 사용자 행 HTML을 생성한다
    function getShareUserRows() {
        const users = getCurrentPageTagUsers();
        if (users.length === 0)
            return `<div class="share-sheet__empty"><p>전송할 수 있는 사용자가 없습니다.</p></div>`;
        return users
            .map(
                (u) =>
                    `<button type="button" class="share-sheet__user" data-share-user-id="${escapeHtml(u.id)}"><span class="share-sheet__user-avatar"><img src="${escapeHtml(u.avatar)}" alt="${escapeHtml(u.name)}" /></span><span class="share-sheet__user-body"><span class="share-sheet__user-name">${escapeHtml(u.name)}</span><span class="share-sheet__user-handle">${escapeHtml(u.handle)}</span></span></button>`,
            )
            .join("");
    }

    // Chat 공유 모달을 생성하여 표시한다
    function openShareChatModal(button) {
        closeShareDropdown();
        closeShareModal({ restorePath: false });
        pushSharePath("/messages/compose");
        const modal = document.createElement("div");
        modal.className = "share-sheet";
        modal.innerHTML = `<div class="share-sheet__backdrop" data-share-close="true"></div><div class="share-sheet__card" role="dialog" aria-modal="true" aria-labelledby="share-chat-title"><div class="share-sheet__header"><button type="button" class="share-sheet__icon-btn" data-share-close="true" aria-label="돌아가기"><svg viewBox="0 0 24 24" aria-hidden="true"><g><path d="M7.414 13l5.043 5.04-1.414 1.42L3.586 12l7.457-7.46 1.414 1.42L7.414 11H21v2H7.414z"></path></g></svg></button><h2 id="share-chat-title" class="share-sheet__title">공유하기</h2><span class="share-sheet__header-spacer"></span></div><div class="share-sheet__search"><input type="text" class="share-sheet__search-input" placeholder="검색" aria-label="검색" /></div><div class="share-sheet__list">${getShareUserRows()}</div></div>`;
        modal.addEventListener("click", (e) => {
            if (
                e.target.closest("[data-share-close='true']") ||
                e.target.classList.contains("share-sheet__backdrop") ||
                e.target.closest(".share-sheet__user")
            ) {
                e.preventDefault();
                closeShareModal();
            }
        });
        document.body.appendChild(modal);
        document.body.classList.add("modal-open");
        activeShareModal = modal;
    }

    // 북마크 폴더 추가 모달을 생성하여 표시한다
    function openShareBookmarkModal(button) {
        const { bookmarkButton } = getSharePostMeta(button);
        closeShareDropdown();
        closeShareModal({ restorePath: false });
        pushSharePath("/i/bookmarks/add");
        const modal = document.createElement("div");
        const isBookmarked =
            bookmarkButton?.classList.contains("active") ?? false;
        modal.className = "share-sheet";
        modal.innerHTML = `<div class="share-sheet__backdrop" data-share-close="true"></div><div class="share-sheet__card share-sheet__card--bookmark" role="dialog" aria-modal="true" aria-labelledby="share-bookmark-title"><div class="share-sheet__header"><button type="button" class="share-sheet__icon-btn" data-share-close="true" aria-label="닫기"><svg viewBox="0 0 24 24" aria-hidden="true"><g><path d="M10.59 12 4.54 5.96l1.42-1.42L12 10.59l6.04-6.05 1.42 1.42L13.41 12l6.05 6.04-1.42 1.42L12 13.41l-6.04 6.05-1.42-1.42L10.59 12z"></path></g></svg></button><h2 id="share-bookmark-title" class="share-sheet__title">폴더에 추가</h2><span class="share-sheet__header-spacer"></span></div><button type="button" class="share-sheet__create-folder">새 북마크 폴더 만들기</button><button type="button" class="share-sheet__folder" data-share-folder="all-bookmarks"><span class="share-sheet__folder-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><g><path d="M2.998 8.5c0-1.38 1.119-2.5 2.5-2.5h9c1.381 0 2.5 1.12 2.5 2.5v14.12l-7-3.5-7 3.5V8.5zM18.5 2H8.998v2H18.5c.275 0 .5.224.5.5V15l2 1.4V4.5c0-1.38-1.119-2.5-2.5-2.5z"></path></g></svg></span><span class="share-sheet__folder-name">모든 북마크</span><span class="share-sheet__folder-check${isBookmarked ? " share-sheet__folder-check--active" : ""}"><svg viewBox="0 0 24 24" aria-hidden="true"><g><path d="M9.64 18.952l-5.55-4.861 1.317-1.504 3.951 3.459 8.459-10.948L19.4 6.32 9.64 18.952z"></path></g></svg></span></button></div>`;
        modal.addEventListener("click", (e) => {
            if (
                e.target.closest("[data-share-close='true']") ||
                e.target.classList.contains("share-sheet__backdrop")
            ) {
                e.preventDefault();
                closeShareModal();
                return;
            }
            if (e.target.closest(".share-sheet__create-folder")) {
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

    // 공유 드롭다운 메뉴를 닫는다
    function closeShareDropdown() {
        if (!activeShareDropdown) return;
        activeShareDropdown.remove();
        activeShareDropdown = null;
        if (activeShareButton) {
            activeShareButton.setAttribute("aria-expanded", "false");
            activeShareButton = null;
        }
    }

    // 공유 드롭다운 메뉴를 생성하여 표시한다
    function openShareDropdown(button) {
        if (!layersRoot) return;
        closeShareDropdown();
        closeNotificationDropdown();
        const rect = button.getBoundingClientRect();
        const top = rect.bottom + window.scrollY + 8;
        const right = Math.max(16, window.innerWidth - rect.right);
        const lc = document.createElement("div");
        lc.className = "layers-dropdown-container";
        lc.innerHTML = `<div class="layers-overlay"></div><div class="layers-dropdown-inner"><div role="menu" class="dropdown-menu" style="top: ${top}px; right: ${right}px;"><div><div class="dropdown-inner"><button type="button" role="menuitem" class="menu-item share-menu-item share-menu-item--copy"><span class="menu-item__icon share-menu-item__icon"><svg viewBox="0 0 24 24" aria-hidden="true"><g><path d="M18.36 5.64c-1.95-1.96-5.11-1.96-7.07 0L9.88 7.05 8.46 5.64l1.42-1.42c2.73-2.73 7.16-2.73 9.9 0 2.73 2.74 2.73 7.17 0 9.9l-1.42 1.42-1.41-1.42 1.41-1.41c1.96-1.96 1.96-5.12 0-7.07zm-2.12 3.53l-7.07 7.07-1.41-1.41 7.07-7.07 1.41 1.41zm-12.02.71l1.42-1.42 1.41 1.42-1.41 1.41c-1.96 1.96-1.96 5.12 0 7.07 1.95 1.96 5.11 1.96 7.07 0l1.41-1.41 1.42 1.41-1.42 1.42c-2.73 2.73-7.16 2.73-9.9 0-2.73-2.74-2.73-7.17 0-9.9z"></path></g></svg></span><span class="menu-item__label">링크 복사하기</span></button><button type="button" role="menuitem" class="menu-item share-menu-item share-menu-item--chat"><span class="menu-item__icon share-menu-item__icon"><svg viewBox="0 0 24 24" aria-hidden="true"><g><path d="M1.998 5.5c0-1.381 1.119-2.5 2.5-2.5h15c1.381 0 2.5 1.119 2.5 2.5v13c0 1.381-1.119 2.5-2.5 2.5h-15c-1.381 0-2.5-1.119-2.5-2.5v-13zm2.5-.5c-.276 0-.5.224-.5.5v2.764l8 3.638 8-3.636V5.5c0-.276-.224-.5-.5-.5h-15zm15.5 5.463l-8 3.636-8-3.638V18.5c0 .276.224.5.5.5h15c.276 0 .5-.224.5-.5v-8.037z"></path></g></svg></span><span class="menu-item__label">Chat으로 전송하기</span></button><button type="button" role="menuitem" class="menu-item share-menu-item share-menu-item--bookmark"><span class="menu-item__icon share-menu-item__icon"><svg viewBox="0 0 24 24" aria-hidden="true"><g><path d="M18 3V0h2v3h3v2h-3v3h-2V5h-3V3zm-7.5 1a.5.5 0 00-.5.5V7h3.5A2.5 2.5 0 0116 9.5v3.48l3 2.1V11h2v7.92l-5-3.5v7.26l-6.5-3.54L3 22.68V9.5A2.5 2.5 0 015.5 7H8V4.5A2.5 2.5 0 0110.5 2H12v2zm-5 5a.5.5 0 00-.5.5v9.82l4.5-2.46 4.5 2.46V9.5a.5.5 0 00-.5-.5z"></path></g></svg></span><span class="menu-item__label">폴더에 북마크 추가하기</span></button></div></div></div></div>`;
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
                openShareChatModal(activeShareButton);
                return;
            }
            if (ab.classList.contains("share-menu-item--bookmark"))
                openShareBookmarkModal(activeShareButton);
        });
        layersRoot.appendChild(lc);
        activeShareDropdown = lc;
        activeShareButton = button;
        activeShareButton.setAttribute("aria-expanded", "true");
    }

    // 알림 더보기 드롭다운 메뉴 항목(팔로우/차단/신고)을 생성한다
    function getNotificationDropdownItems(button) {
        const ti = button.closest(".notif-tweet-item");
        const handle =
            getTextContent(ti?.querySelector(".tweet-handle")) || "@sokkomann";
        const isF = notificationFollowState.get(handle) ?? false;
        return [
            {
                actionClass: "menu-item--follow-toggle",
                label: isF
                    ? `${handle} 님 언팔로우하기`
                    : `${handle} 님 팔로우하기`,
                icon: isF
                    ? '<svg viewBox="0 0 24 24" aria-hidden="true"><g><path d="M10 4c-1.105 0-2 .9-2 2s.895 2 2 2 2-.9 2-2-.895-2-2-2zM6 6c0-2.21 1.791-4 4-4s4 1.79 4 4-1.791 4-4 4-4-1.79-4-4zm12.586 3l-2.043-2.04 1.414-1.42L20 7.59l2.043-2.05 1.414 1.42L21.414 9l2.043 2.04-1.414 1.42L20 10.41l-2.043 2.05-1.414-1.42L18.586 9zM3.651 19h12.698c-.337-1.8-1.023-3.21-1.945-4.19C13.318 13.65 11.838 13 10 13s-3.317.65-4.404 1.81c-.922.98-1.608 2.39-1.945 4.19zm.486-5.56C5.627 11.85 7.648 11 10 11s4.373.85 5.863 2.44c1.477 1.58 2.366 3.8 2.632 6.46l.11 1.1H1.395l.11-1.1c.266-2.66 1.155-4.88 2.632-6.46z"></path></g></svg>'
                    : '<svg viewBox="0 0 24 24" aria-hidden="true"><g><path d="M10 4c-1.105 0-2 .9-2 2s.895 2 2 2 2-.9 2-2-.895-2-2-2zM6 6c0-2.21 1.791-4 4-4s4 1.79 4 4-1.791 4-4 4-4-1.79-4-4zm4 7c-3.053 0-5.563 1.193-7.443 3.596l1.548 1.207C5.573 15.922 7.541 15 10 15s4.427.922 5.895 2.803l1.548-1.207C15.563 14.193 13.053 13 10 13zm8-6V5h-3V3h-2v2h-3v2h3v3h2V7h3z"></path></g></svg>',
            },
            {
                actionClass: "menu-item--block",
                label: `${handle} 님 차단하기`,
                testid: "block",
                icon: '<svg viewBox="0 0 24 24" aria-hidden="true"><g><path d="M12 3.75c-4.55 0-8.25 3.69-8.25 8.25 0 1.92.66 3.68 1.75 5.08L17.09 5.5C15.68 4.4 13.92 3.75 12 3.75zm6.5 3.17L6.92 18.5c1.4 1.1 3.16 1.75 5.08 1.75 4.56 0 8.25-3.69 8.25-8.25 0-1.92-.65-3.68-1.75-5.08zM1.75 12C1.75 6.34 6.34 1.75 12 1.75S22.25 6.34 22.25 12 17.66 22.25 12 22.25 1.75 17.66 1.75 12z"></path></g></svg>',
            },
            {
                actionClass: "menu-item--report",
                label: "게시물 신고하기",
                testid: "report",
                icon: '<svg viewBox="0 0 24 24" aria-hidden="true"><g><path d="M3 2h18.61l-3.5 7 3.5 7H5v6H3V2zm2 12h13.38l-2.5-5 2.5-5H5v10z"></path></g></svg>',
            },
        ];
    }

    // 알림 더보기 드롭다운을 닫는다
    function closeNotificationDropdown() {
        if (!activeMoreDropdown) return;
        activeMoreDropdown.remove();
        activeMoreDropdown = null;
        if (activeMoreButton) {
            activeMoreButton.setAttribute("aria-expanded", "false");
            activeMoreButton = null;
        }
    }

    // 알림 게시물의 사용자 메타 정보를 반환한다
    function getNotificationUserMeta(button) {
        const ti = button.closest(".notif-tweet-item");
        const all = Array.from(document.querySelectorAll(".notif-tweet-item"));
        const handle =
            getTextContent(ti?.querySelector(".tweet-handle")) || "@sokkomann";
        const displayName =
            getTextContent(ti?.querySelector(".tweet-displayname")) || "사용자";
        const tweetId = String(Math.max(all.indexOf(ti), 0) + 1);
        return { tweetItem: ti, handle, displayName, tweetId };
    }

    // 알림 관련 토스트 메시지를 표시한다
    function showNotificationToast(message) {
        activeNotificationToast?.remove();
        const toast = document.createElement("div");
        toast.className = "notification-toast";
        toast.setAttribute("role", "status");
        toast.setAttribute("aria-live", "polite");
        toast.textContent = message;
        document.body.appendChild(toast);
        activeNotificationToast = toast;
        window.setTimeout(() => {
            if (activeNotificationToast === toast)
                activeNotificationToast = null;
            toast.remove();
        }, 3000);
    }

    // 알림 모달(차단/신고)을 닫는다
    function closeNotificationModal() {
        if (!activeNotificationModal) return;
        activeNotificationModal.remove();
        activeNotificationModal = null;
        document.body.classList.remove("modal-open");
    }

    // 사용자 차단 확인 모달을 생성하여 표시한다
    function openNotificationBlockModal(button) {
        const { handle } = getNotificationUserMeta(button);
        closeNotificationDropdown();
        closeNotificationModal();
        const modal = document.createElement("div");
        modal.className = "notification-dialog notification-dialog--block";
        modal.innerHTML = `<div class="notification-dialog__backdrop"></div><div class="notification-dialog__card notification-dialog__card--small" role="alertdialog" aria-modal="true" aria-labelledby="notification-block-title" aria-describedby="notification-block-desc"><h2 id="notification-block-title" class="notification-dialog__title">${handle} 님을 차단할까요?</h2><p id="notification-block-desc" class="notification-dialog__description">내 공개 게시물을 볼 수 있지만 더 이상 게시물에 참여할 수 없습니다. 또한 ${handle} 님은 나를 팔로우하거나 쪽지를 보낼 수 없으며, 이 계정과 관련된 알림도 내게 표시되지 않습니다.</p><div class="notification-dialog__actions"><button type="button" class="notification-dialog__danger notification-dialog__confirm-block">차단</button><button type="button" class="notification-dialog__secondary notification-dialog__close">취소</button></div></div>`;
        modal.addEventListener("click", (e) => {
            if (
                e.target.classList.contains("notification-dialog__backdrop") ||
                e.target.closest(".notification-dialog__close")
            ) {
                e.preventDefault();
                closeNotificationModal();
                return;
            }
            if (e.target.closest(".notification-dialog__confirm-block")) {
                e.preventDefault();
                closeNotificationModal();
            }
        });
        document.body.appendChild(modal);
        document.body.classList.add("modal-open");
        activeNotificationModal = modal;
    }

    // 게시물 신고 모달을 생성하여 표시한다
    function openNotificationReportModal(button) {
        const { tweetId } = getNotificationUserMeta(button);
        closeNotificationDropdown();
        closeNotificationModal();
        const modal = document.createElement("div");
        modal.className = "notification-dialog notification-dialog--report";
        modal.innerHTML = `<div class="notification-dialog__backdrop"></div><div class="notification-dialog__card notification-dialog__card--report" role="dialog" aria-modal="true" aria-labelledby="notification-report-title"><div class="notification-dialog__header"><button type="button" class="notification-dialog__icon-btn notification-dialog__close" aria-label="돌아가기"><svg viewBox="0 0 24 24" aria-hidden="true"><g><path d="M7.414 13l5.043 5.04-1.414 1.42L3.586 12l7.457-7.46 1.414 1.42L7.414 11H21v2H7.414z"></path></g></svg></button><h2 id="notification-report-title" class="notification-dialog__title">신고하기</h2></div><div class="notification-dialog__body"><p class="notification-dialog__question">이 게시물에 어떤 문제가 있나요?</p><ul class="notification-report__list">${notificationReportReasons.map((r) => `<li><button type="button" class="notification-report__item"><span>${r}</span><svg viewBox="0 0 24 24" aria-hidden="true"><g><path d="M9.293 6.293 10.707 4.88 17.828 12l-7.121 7.12-1.414-1.413L14.999 12z"></path></g></svg></button></li>`).join("")}</ul></div></div>`;
        modal.addEventListener("click", (e) => {
            if (
                e.target.classList.contains("notification-dialog__backdrop") ||
                e.target.closest(".notification-dialog__close")
            ) {
                e.preventDefault();
                closeNotificationModal();
                return;
            }
            if (e.target.closest(".notification-report__item")) {
                e.preventDefault();
                closeNotificationModal();
            }
        });
        document.body.appendChild(modal);
        document.body.classList.add("modal-open");
        activeNotificationModal = modal;
    }

    // 알림 드롭다운 메뉴 항목 클릭 시 해당 액션을 처리한다
    function handleNotificationDropdownAction(button, actionClass) {
        const { handle } = getNotificationUserMeta(button);
        if (actionClass === "menu-item--follow-toggle") {
            const isF = notificationFollowState.get(handle) ?? false;
            notificationFollowState.set(handle, !isF);
            closeNotificationDropdown();
            if (!isF) showNotificationToast(`${handle} 님을 팔로우함`);
            return;
        }
        if (actionClass === "menu-item--block") {
            openNotificationBlockModal(button);
            return;
        }
        if (actionClass === "menu-item--report")
            openNotificationReportModal(button);
    }

    // 알림 더보기 드롭다운을 생성하여 표시한다
    function openNotificationDropdown(button) {
        if (!layersRoot) return;
        closeShareDropdown();
        closeNotificationDropdown();
        const rect = button.getBoundingClientRect();
        const top = rect.bottom + window.scrollY + 8;
        const items = getNotificationDropdownItems(button);
        const right = Math.max(16, window.innerWidth - rect.right);
        const lc = document.createElement("div");
        lc.className = "layers-dropdown-container";
        lc.innerHTML = `<div class="layers-overlay"></div><div class="layers-dropdown-inner"><div role="menu" class="dropdown-menu" style="top: ${top}px; right: ${right}px;"><div><div class="dropdown-inner" data-testid="Dropdown">${items
            .map((it) => {
                const ta = it.testid ? ` data-testid="${it.testid}"` : "";
                return `<button type="button" role="menuitem" class="menu-item ${it.actionClass}"${ta}><span class="menu-item__icon">${it.icon}</span><span class="menu-item__label">${it.label}</span></button>`;
            })
            .join("")}</div></div></div></div>`;
        lc.addEventListener("click", (e) => {
            const item = e.target.closest(".menu-item");
            if (item) {
                e.preventDefault();
                e.stopPropagation();
                if (activeMoreButton) {
                    const ac =
                        Array.from(item.classList).find((c) =>
                            c.startsWith("menu-item--"),
                        ) ?? "";
                    handleNotificationDropdownAction(activeMoreButton, ac);
                }
                return;
            }
            e.stopPropagation();
        });
        layersRoot.appendChild(lc);
        activeMoreDropdown = lc;
        activeMoreButton = button;
        activeMoreButton.setAttribute("aria-expanded", "true");
    }

    // ===== 7. Draft Panel =====
    // 임시저장 패널 뷰
    const draftView = q(".tweet-modal__draft-view");
    // 임시저장 패널 열기 버튼
    const draftButton = q(".tweet-modal__draft");
    // 임시저장 패널 뒤로가기 버튼
    const draftBackButton = draftView?.querySelector(".draft-panel__back");
    // 임시저장 패널 수정/완료 토글 버튼
    const draftActionButton = draftView?.querySelector(".draft-panel__action");
    // 임시저장 목록 컨테이너
    const draftList = draftView?.querySelector(".draft-panel__list");
    // 임시저장 비어있음 안내 영역
    const draftEmpty = draftView?.querySelector(".draft-panel__empty");
    // 임시저장 비어있음 제목
    const draftEmptyTitle = draftView?.querySelector(
        ".draft-panel__empty-title",
    );
    // 임시저장 비어있음 설명
    const draftEmptyBody = draftView?.querySelector(".draft-panel__empty-body");
    // 임시저장 편집 모드 하단 영역
    const draftFooter = draftView?.querySelector(".draft-panel__footer");
    // 임시저장 전체 선택/해제 버튼
    const draftSelectAllButton = draftView?.querySelector(
        ".draft-panel__select-all",
    );
    // 임시저장 선택 항목 삭제 버튼
    const draftDeleteButton = draftView?.querySelector(
        ".draft-panel__footer-delete",
    );
    // 임시저장 삭제 확인 오버레이
    const draftConfirmOverlay = draftView?.querySelector(
        ".draft-panel__confirm-overlay",
    );
    // 임시저장 삭제 확인 배경
    const draftConfirmBackdrop = draftView?.querySelector(
        ".draft-panel__confirm-backdrop",
    );
    // 임시저장 삭제 확인 제목
    const draftConfirmTitle = draftView?.querySelector(
        ".draft-panel__confirm-title",
    );
    // 임시저장 삭제 확인 설명
    const draftConfirmDesc = draftView?.querySelector(
        ".draft-panel__confirm-desc",
    );
    // 임시저장 삭제 확인의 삭제 버튼
    const draftConfirmDeleteButton = draftView?.querySelector(
        ".draft-panel__confirm-primary",
    );
    // 임시저장 삭제 확인의 취소 버튼
    const draftConfirmCancelButton = draftView?.querySelector(
        ".draft-panel__confirm-secondary",
    );

    // 임시저장 패널의 편집 모드, 확인 대화상자, 선택 항목 상태
    const draftPanelState = {
        isEditMode: false,
        confirmOpen: false,
        selectedItems: new Set(),
    };

    // 임시저장 항목 DOM 요소 배열을 반환한다
    function getDraftItems() {
        return draftList
            ? Array.from(draftList.querySelectorAll(".draft-panel__item"))
            : [];
    }
    // 임시저장 선택 상태를 초기화한다
    function clearDraftSelection() {
        draftPanelState.selectedItems.clear();
        draftPanelState.confirmOpen = false;
    }
    // 임시저장 편집 모드를 종료한다
    function exitDraftEditMode() {
        draftPanelState.isEditMode = false;
        clearDraftSelection();
    }
    // 임시저장 편집 모드를 시작한다
    function enterDraftEditMode() {
        if (getDraftItems().length === 0) return;
        draftPanelState.isEditMode = true;
        draftPanelState.confirmOpen = false;
    }
    // 해당 요소가 유효한 임시저장 항목인지 확인한다
    function hasDraftItem(item) {
        return item instanceof HTMLElement && getDraftItems().includes(item);
    }

    // 임시저장 항목의 선택 상태를 토글한다
    function toggleDraftSelection(item) {
        if (!draftPanelState.isEditMode || !hasDraftItem(item)) return;
        draftPanelState.selectedItems.has(item)
            ? draftPanelState.selectedItems.delete(item)
            : draftPanelState.selectedItems.add(item);
        draftPanelState.confirmOpen = false;
    }

    // 모든 임시저장 항목이 선택되어 있는지 확인한다
    function areAllDraftItemsSelected() {
        const items = getDraftItems();
        return (
            items.length > 0 &&
            items.every((i) => draftPanelState.selectedItems.has(i))
        );
    }

    // 임시저장 전체 선택/해제를 토글한다
    function toggleDraftSelectAll() {
        if (!draftPanelState.isEditMode) return;
        const items = getDraftItems();
        if (items.length === 0) return;
        areAllDraftItemsSelected()
            ? draftPanelState.selectedItems.clear()
            : (draftPanelState.selectedItems = new Set(items));
        draftPanelState.confirmOpen = false;
    }

    // 선택된 임시저장 항목이 있는지 확인한다
    function hasDraftSelection() {
        return draftPanelState.selectedItems.size > 0;
    }
    // 임시저장 삭제 확인 대화상자를 연다
    function openDraftConfirm() {
        if (draftPanelState.isEditMode && hasDraftSelection())
            draftPanelState.confirmOpen = true;
    }
    // 임시저장 삭제 확인 대화상자를 닫는다
    function closeDraftConfirm() {
        draftPanelState.confirmOpen = false;
    }

    // 선택된 임시저장 항목을 DOM에서 삭제한다
    function deleteSelectedDrafts() {
        if (!hasDraftSelection()) return;
        getDraftItems().forEach((i) => {
            if (draftPanelState.selectedItems.has(i)) i.remove();
        });
        exitDraftEditMode();
    }

    // 임시저장 패널 상태를 초기화한다
    function resetDraftPanel() {
        exitDraftEditMode();
        closeDraftConfirm();
    }
    // 임시저장 패널이 열려 있는지 확인한다
    function isDraftPanelOpen() {
        return Boolean(draftView && !draftView.hidden);
    }
    // 임시저장 삭제 확인 대화상자가 열려 있는지 확인한다
    function isDraftConfirmOpen() {
        return draftPanelState.confirmOpen;
    }
    // 임시저장 비어있음 안내 문구를 반환한다
    function getDraftEmptyCopy() {
        return {
            title: "잠시 생각을 정리합니다",
            body: "아직 게시할 준비가 되지 않았나요? 임시저장해 두고 나중에 이어서 작성하세요.",
        };
    }
    // 임시저장 삭제 확인 문구를 반환한다
    function getDraftConfirmCopy() {
        return {
            title: "전송하지 않은 게시물 삭제하기",
            body: "이 작업은 취소할 수 없으며 선택한 전송하지 않은 게시물이 삭제됩니다.",
        };
    }

    // 임시저장 항목용 체크박스 요소를 생성한다
    function buildDraftCheckbox(sel) {
        const cb = document.createElement("span");
        cb.className = `draft-panel__checkbox${sel ? " draft-panel__checkbox--checked" : ""}`;
        cb.setAttribute("aria-hidden", "true");
        cb.innerHTML =
            '<svg viewBox="0 0 24 24"><g><path d="M9.86 18a1 1 0 01-.73-.31l-3.9-4.11 1.45-1.38 3.2 3.38 7.46-8.1 1.47 1.36-8.19 8.9A1 1 0 019.86 18z"></path></g></svg>';
        return cb;
    }

    // 임시저장 항목들의 선택 상태와 체크박스를 렌더링한다
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

    // 임시저장 패널 전체 UI를 렌더링한다
    function renderDraftPanel() {
        if (!draftView) return;
        const hasItems = getDraftItems().length > 0;
        const ec = getDraftEmptyCopy(),
            cc = getDraftConfirmCopy();
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
        if (draftEmptyTitle) draftEmptyTitle.textContent = ec.title;
        if (draftEmptyBody) draftEmptyBody.textContent = ec.body;
        if (draftFooter) draftFooter.hidden = !draftPanelState.isEditMode;
        if (draftSelectAllButton)
            draftSelectAllButton.textContent = areAllDraftItemsSelected()
                ? "모두 선택 해제"
                : "모두 선택";
        if (draftDeleteButton)
            draftDeleteButton.disabled = !hasDraftSelection();
        if (draftConfirmOverlay)
            draftConfirmOverlay.hidden = !draftPanelState.confirmOpen;
        if (draftConfirmTitle) draftConfirmTitle.textContent = cc.title;
        if (draftConfirmDesc) draftConfirmDesc.textContent = cc.body;
    }

    // 임시저장 패널을 연다
    function openDraftPanel() {
        if (!composeView || !draftView) return;
        renderDraftPanel();
        composeView.hidden = true;
        draftView.hidden = false;
    }

    // 임시저장 패널을 닫고 상태를 초기화한다
    function closeDraftPanel({ restoreFocus = true } = {}) {
        if (!composeView || !draftView) return;
        resetDraftPanel();
        renderDraftPanel();
        draftView.hidden = true;
        composeView.hidden = false;
        if (restoreFocus) draftButton?.focus();
    }

    // 클릭 대상에서 가장 가까운 임시저장 항목 요소를 찾는다
    function getDraftItemByElement(target) {
        return target.closest(".draft-panel__item");
    }

    // 임시저장 항목의 텍스트를 에디터에 불러온다
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

    // ===== 8. Init & Events =====
    // 초기 UI 상태 설정
    renderLocationList();
    syncLocationUI();
    syncUserTagTrigger();
    setActiveTab("notifications");

    // 하단 탭 클릭 시 활성 탭을 변경한다
    tabLinks.forEach((link) => {
        link.addEventListener("click", (e) => {
            e.preventDefault();
            setActiveTab(link.dataset.tab);
        });
    });

    // 스크롤 방향에 따라 하단 바를 숨기거나 표시한다
    window.addEventListener(
        "scroll",
        (e) => {
            if (!bottombarSlide) return;
            const cy = window.scrollY;
            bottombarSlide.style.transform =
                cy > lastScrollY && cy > 100
                    ? "translateY(100%)"
                    : "translateY(0)";
            lastScrollY = cy;
        },
        { passive: true },
    );

    // 알림 탭 클릭 시 해당 탭을 활성화한다
    notifTabs.forEach((tab) => {
        tab.addEventListener("click", (e) => {
            e.preventDefault();
            notifTabs.forEach((t) => {
                t.classList.remove("notif-tab--active");
                t.setAttribute("aria-selected", "false");
            });
            tab.classList.add("notif-tab--active");
            tab.setAttribute("aria-selected", "true");
        });
    });

    // 좋아요 버튼 클릭 시 활성/비활성을 토글한다
    document.querySelectorAll(".tweet-action-btn--like").forEach((button) => {
        const path = button.querySelector("path"),
            count = button.querySelector(".tweet-action-count");
        button.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            const isActive = button.classList.toggle("active");
            if (!path || !count) return;
            button.setAttribute("data-testid", isActive ? "unlike" : "like");
            button.setAttribute(
                "aria-label",
                isActive ? "1 마음에 들어요" : "0 마음에 들어요",
            );
            path.setAttribute(
                "d",
                isActive ? path.dataset.pathActive : path.dataset.pathInactive,
            );
            count.textContent = isActive ? "1" : "";
        });
    });

    // 북마크 버튼 클릭 시 활성/비활성을 토글한다
    document
        .querySelectorAll(".tweet-action-btn--bookmark")
        .forEach((button) => {
            button.addEventListener("click", (e) => {
                e.preventDefault();
                e.stopPropagation();
                setBookmarkButtonState(
                    button,
                    !button.classList.contains("active"),
                );
            });
        });

    // 답글 버튼 클릭 시 답글 모달을 연다
    document.querySelectorAll("[data-testid='reply']").forEach((button) => {
        button.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            closeShareDropdown();
            closeNotificationDropdown();
            openReplyModal(button);
        });
    });

    // 더보기(캐럿) 버튼 클릭 시 드롭다운을 토글한다
    document.querySelectorAll("[data-testid='caret']").forEach((button) => {
        button.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            activeMoreButton === button
                ? closeNotificationDropdown()
                : openNotificationDropdown(button);
        });
    });

    // 공유 버튼 클릭 시 공유 드롭다운을 토글한다
    document.querySelectorAll(".tweet-action-btn--share").forEach((button) => {
        button.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            closeNotificationDropdown();
            activeShareButton === button
                ? closeShareDropdown()
                : openShareDropdown(button);
        });
    });

    // 답글 모달 닫기 버튼 클릭 시 모달을 닫는다
    replyCloseButton?.addEventListener("click", closeReplyModal);
    // 답글 모달 오버레이 클릭 시 모달을 닫는다
    replyModalOverlay?.addEventListener("click", (e) => {
        if (e.target === replyModalOverlay) closeReplyModal();
    });

    // Escape 키로 열린 패널/모달을 순서대로 닫고 Tab으로 포커스를 가둔다
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

    // 에디터 입력 시 서식 적용, 상태 동기화를 수행한다
    replyEditor?.addEventListener("input", () => {
        applyPendingReplyFormatsToContent();
        if (!hasReplyEditorText()) pendingReplyFormats = new Set();
        syncReplySubmitState();
        syncReplyFormatButtons();
    });
    // 에디터에서 키/마우스/포커스 이벤트 시 선택 영역 저장 및 서식 동기화
    replyEditor?.addEventListener("keyup", saveReplySelection);
    replyEditor?.addEventListener("keyup", syncReplyFormatButtons);
    replyEditor?.addEventListener("mouseup", saveReplySelection);
    replyEditor?.addEventListener("mouseup", syncReplyFormatButtons);
    replyEditor?.addEventListener("focus", saveReplySelection);
    replyEditor?.addEventListener("focus", syncReplyFormatButtons);
    replyEditor?.addEventListener("click", syncReplyFormatButtons);
    // Ctrl+B/I 단축키로 굵게/기울임 서식을 적용한다
    replyEditor?.addEventListener("keydown", (e) => {
        if (!e.ctrlKey) return;
        const key = e.key.toLowerCase();
        if (key !== "b" && key !== "i") return;
        e.preventDefault();
        applyReplyFormat(key === "b" ? "bold" : "italic");
    });

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

    // 텍스트 선택 변경 시 선택 영역을 저장하고 서식 버튼을 동기화한다
    document.addEventListener("selectionchange", () => {
        if (replyModalOverlay?.hidden || !replyEditor) return;
        saveReplySelection();
        syncReplyFormatButtons();
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
    replyEmojiButton?.addEventListener("mousedown", (e) => e.preventDefault());
    replyEmojiButton?.addEventListener("click", (e) => {
        e.preventDefault();
        toggleEmojiPicker();
    });
    // 위치 버튼 클릭 시 위치 선택 패널을 연다
    replyGeoButton?.addEventListener("click", (e) => {
        e.preventDefault();
        openLocationPanel();
    });
    // 사용자 태그 버튼 클릭 시 태그 패널을 연다
    replyUserTagTrigger?.addEventListener("click", (e) => {
        e.preventDefault();
        openTagPanel();
    });
    // 미디어 ALT 버튼 클릭 시 미디어 편집기를 연다
    replyMediaAltTrigger?.addEventListener("click", (e) => {
        e.preventDefault();
        openMediaEditor();
    });
    // 위치 표시 버튼 클릭 시 위치 패널을 연다
    replyLocationDisplayButton?.addEventListener("click", (e) => {
        e.preventDefault();
        openLocationPanel();
    });
    // 이모지 피커 내부 클릭 시 이벤트 전파를 막는다
    replyEmojiPicker?.addEventListener("click", (e) => e.stopPropagation());
    // 이모지 검색 입력 시 피커 콘텐츠를 갱신한다
    replyEmojiSearchInput?.addEventListener("input", () =>
        renderEmojiPickerContent(),
    );
    // 위치 검색 입력 시 위치 목록을 갱신한다
    replyLocationSearchInput?.addEventListener("input", () =>
        renderLocationList(),
    );
    // 태그 검색 폼 제출을 막는다
    replyTagSearchForm?.addEventListener("submit", (e) => e.preventDefault());
    // 태그 검색 입력 시 검색을 실행한다
    replyTagSearchInput?.addEventListener("input", () => runTagSearch());
    // 미디어 편집기 뒤로가기 클릭 시 편집기를 닫는다
    replyMediaBackButton?.addEventListener("click", () => closeMediaEditor());
    // 미디어 편집기 저장 클릭 시 편집 내용을 저장한다
    replyMediaSaveButton?.addEventListener("click", () =>
        saveReplyMediaEdits(),
    );

    // 이전 미디어 버튼 클릭 시 이전 이미지로 이동한다
    replyMediaPrevButton?.addEventListener("click", () => {
        if (activeReplyMediaIndex === 0) return;
        activeReplyMediaIndex -= 1;
        renderMediaEditor();
    });
    // 다음 미디어 버튼 클릭 시 다음 이미지로 이동한다
    replyMediaNextButton?.addEventListener("click", () => {
        if (activeReplyMediaIndex >= pendingReplyMediaEdits.length - 1) return;
        activeReplyMediaIndex += 1;
        renderMediaEditor();
    });

    // ALT 텍스트 입력 시 현재 미디어의 대체 텍스트를 업데이트한다
    replyMediaAltInput?.addEventListener("input", () => {
        const edit = pendingReplyMediaEdits[activeReplyMediaIndex];
        if (!edit) return;
        edit.alt = replyMediaAltInput.value.slice(0, maxReplyMediaAltLength);
        renderMediaEditor();
    });

    // 이모지 카테고리 탭 클릭 시 해당 카테고리를 활성화한다
    replyEmojiTabs.forEach((tab) => {
        tab.addEventListener("click", () => {
            const cat = tab.getAttribute("data-emoji-category");
            if (cat) {
                activeEmojiCategory = cat;
                renderEmojiPicker();
            }
        });
    });

    // 이모지 옵션/지우기 버튼 mousedown 시 포커스 이동을 방지한다
    replyEmojiContent?.addEventListener("mousedown", (e) => {
        if (
            e.target.closest(
                ".tweet-modal__emoji-option, .tweet-modal__emoji-clear",
            )
        )
            e.preventDefault();
    });

    // 이모지 클릭 시 에디터에 삽입하고, 지우기 클릭 시 최근 목록을 초기화한다
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

    // 위치 패널 닫기 버튼 클릭 시 패널을 닫는다
    replyLocationCloseButton?.addEventListener("click", () =>
        closeLocationPanel(),
    );
    // 태그 패널 뒤로가기 클릭 시 패널을 닫는다
    replyTagCloseButton?.addEventListener("click", () => closeTagPanel());
    // 태그 완료 버튼 클릭 시 태그를 적용하고 패널을 닫는다
    replyTagCompleteButton?.addEventListener("click", () => {
        applyPendingTaggedUsers();
        closeTagPanel();
    });
    // 위치 삭제 버튼 클릭 시 위치를 초기화하고 패널을 닫는다
    replyLocationDeleteButton?.addEventListener("click", () => {
        resetLocationState();
        closeLocationPanel();
    });

    // 위치 완료 버튼 클릭 시 위치를 적용하고 패널을 닫는다
    replyLocationCompleteButton?.addEventListener("click", () => {
        if (pendingLocation) {
            applyLocation(pendingLocation);
            closeLocationPanel();
        }
    });

    // 위치 목록에서 항목 클릭 시 해당 위치를 선택한다
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

    // 태그 칩의 삭제 버튼 클릭 시 해당 사용자를 태그 목록에서 제거한다
    replyTagChipList?.addEventListener("click", (e) => {
        const cb = e.target.closest("[data-tag-remove-id]");
        if (!cb) return;
        const uid = cb.getAttribute("data-tag-remove-id");
        pendingTaggedUsers = pendingTaggedUsers.filter((u) => u.id !== uid);
        renderTagChipList();
        runTagSearch();
        replyTagSearchInput?.focus();
    });

    // 태그 검색 결과에서 사용자 클릭 시 태그 목록에 추가한다
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

    // 답글 제출 버튼 클릭 시 답글 수를 증가시키고 모달을 닫는다
    replySubmitButton?.addEventListener("click", () => {
        if (!activeReplyTrigger || replySubmitButton.disabled) return;
        updateReplyCount(activeReplyTrigger);
        closeReplyModal({ skipConfirm: true });
    });

    // 문서 클릭 시 열린 피커/드롭다운을 외부 클릭으로 닫는다
    document.addEventListener("click", (e) => {
        if (
            replyEmojiPicker &&
            !replyEmojiPicker.hidden &&
            !replyEmojiPicker.contains(e.target) &&
            !replyEmojiButton?.contains(e.target)
        )
            closeEmojiPicker();
        if (activeShareDropdown && !activeShareDropdown.contains(e.target))
            closeShareDropdown();
        if (
            activeMoreDropdown &&
            !activeMoreDropdown.contains(e.target) &&
            !activeMoreButton?.contains(e.target)
        )
            closeNotificationDropdown();
    });

    // Escape 키로 열린 공유/알림 모달과 드롭다운을 닫는다
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            closeShareModal();
            closeNotificationModal();
            closeShareDropdown();
            closeNotificationDropdown();
        }
    });
    // 창 크기 변경 시 이모지 피커 위치를 재계산한다
    window.addEventListener(
        "resize",
        () => {
            if (replyEmojiPicker && !replyEmojiPicker.hidden)
                updateEmojiPickerPosition();
        },
        { passive: true },
    );
    // 스크롤 시 이모지 피커 위치를 재계산한다
    window.addEventListener(
        "scroll",
        () => {
            if (replyEmojiPicker && !replyEmojiPicker.hidden)
                updateEmojiPickerPosition();
        },
        { passive: true },
    );

    // Draft panel events
    // 임시저장 버튼 클릭 시 임시저장 패널을 연다
    draftButton?.addEventListener("click", (e) => {
        e.preventDefault();
        openDraftPanel();
    });
    // 임시저장 뒤로가기 클릭 시 패널을 닫는다
    draftBackButton?.addEventListener("click", (e) => {
        e.preventDefault();
        closeDraftPanel();
    });
    // 수정/완료 버튼 클릭 시 편집 모드를 토글한다
    draftActionButton?.addEventListener("click", (e) => {
        e.preventDefault();
        draftPanelState.isEditMode ? exitDraftEditMode() : enterDraftEditMode();
        renderDraftPanel();
    });
    // 전체 선택 버튼 클릭 시 모든 항목 선택/해제를 토글한다
    draftSelectAllButton?.addEventListener("click", (e) => {
        e.preventDefault();
        toggleDraftSelectAll();
        renderDraftPanel();
    });
    // 삭제 버튼 클릭 시 삭제 확인 대화상자를 연다
    draftDeleteButton?.addEventListener("click", (e) => {
        e.preventDefault();
        openDraftConfirm();
        renderDraftPanel();
    });
    // 삭제 확인 버튼 클릭 시 선택된 항목을 삭제한다
    draftConfirmDeleteButton?.addEventListener("click", (e) => {
        e.preventDefault();
        deleteSelectedDrafts();
        renderDraftPanel();
    });
    // 삭제 취소 버튼 클릭 시 확인 대화상자를 닫는다
    draftConfirmCancelButton?.addEventListener("click", (e) => {
        e.preventDefault();
        closeDraftConfirm();
        renderDraftPanel();
    });
    // 삭제 확인 배경 클릭 시 확인 대화상자를 닫는다
    draftConfirmBackdrop?.addEventListener("click", (e) => {
        e.preventDefault();
        closeDraftConfirm();
        renderDraftPanel();
    });

    // 임시저장 항목 클릭 시 편집 모드면 선택하고, 아니면 에디터에 불러온다
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
};
