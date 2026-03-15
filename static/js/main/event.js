// 메인 홈 화면의 모든 상호작용을 한 파일 안에서 초기화한다.
// 현재 구조는 모듈 분리 대신 `window.onload` 내부에 기능별 setup 함수를 두고,
// DOMContentLoaded 시점에 필요한 UI만 순서대로 연결하는 방식이다.
window.onload = () => {
    // 게시글 작성 모달 관련 초기화: 상태, 모달 열기/닫기, 태그, 카테고리, 보드 선택, 툴바, 임시저장.
    setupComposerState();
    setupComposerModal();
    setupComposerTagInput();
    setupComposerCategoryTags();
    setupBoardSelector();
    setupComposerToolbar();
    setupComposerDraftPanel();
    setupSearchForm();
    setupExchangeRates();
    setupTimelineTabs();
    setupExpandablePostText();
    setupMediaPreview();
    setupReplyModal();
    setupTweetActions();
    setupPostMoreMenus();
    setupConnectButtons();
    setupMoreMenu();
    setupAccountMenu();
};

function showTimedToast({
    toastElement,
    message,
    duration = 3000,
    activeTimer = null,
    setActiveTimer = null,
}) {
    if (!toastElement) {
        return;
    }

    if (activeTimer) {
        window.clearTimeout(activeTimer);
    }

    toastElement.textContent = message;
    toastElement.hidden = false;

    const nextTimer = window.setTimeout(() => {
        toastElement.hidden = true;
        if (typeof setActiveTimer === "function") {
            setActiveTimer(null);
        }
    }, duration);

    if (typeof setActiveTimer === "function") {
        setActiveTimer(nextTimer);
    }
}

// 템플릿 문자열에 사용자 입력을 섞는 구간이 많아서 최소한의 HTML 이스케이프를
// 파일 내부에 둔다. 외부 전역 helper 누락으로 전체 스크립트가 죽는 일을 막는다.
function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (character) => {
        const escapedByCharacter = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;",
        };

        return escapedByCharacter[character] || character;
    });
}

// 더보기 메뉴는 버튼 위치를 기준으로 뜨되 화면 밖으로 밀리면 안 된다.
// 추가 의존성 없이 동일 계산을 보장하려고 좌표 계산을 파일 안에 유지한다.
function calculateMoreMenuPosition({
    windowWidth,
    windowHeight,
    buttonRect,
    menuWidth,
    menuHeight,
    gap = 8,
    margin = 12,
}) {
    const safeMenuWidth = Math.max(0, Number(menuWidth) || 0);
    const safeMenuHeight = Math.max(0, Number(menuHeight) || 0);
    const maxLeft = Math.max(margin, windowWidth - safeMenuWidth - margin);
    const preferredLeft = buttonRect.right - safeMenuWidth;
    const left = Math.min(maxLeft, Math.max(margin, preferredLeft));
    const bottomAlignedTop = buttonRect.bottom + gap;
    const topIfOverflow = buttonRect.top - safeMenuHeight - gap;
    const top = safeMenuHeight > 0 &&
        bottomAlignedTop + safeMenuHeight > windowHeight - margin &&
        topIfOverflow >= margin
        ? topIfOverflow
        : Math.max(margin, bottomAlignedTop);

    return { left, top };
}

// 피드에서는 긴 본문만 접기/펼치기 UI가 필요하다.
// 이 상태 계산을 분리해 두면 본문 길이 규칙이 바뀌어도 DOM 조작부를 건드리지 않고
// 여기서만 조정할 수 있다.
function getCollapsedPostTextState(text, maxLength) {
    const fullText = String(text || "").trim();
    const safeMaxLength = Math.max(0, Number(maxLength) || 0);
    const isExpandable = fullText.length > safeMaxLength;
    const truncatedText = isExpandable
        ? `${fullText.slice(0, safeMaxLength).trimEnd()}...`
        : fullText;

    return {
        fullText,
        isExpandable,
        truncatedText,
    };
}

function buildInitialAvatarDataUri(label) {
    const safeLabel = escapeHtml((label || "?").slice(0, 2));
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect width="40" height="40" rx="20" fill="#1d9bf0"></rect><text x="50%" y="50%" dominant-baseline="central" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" font-weight="700" fill="#ffffff">${safeLabel}</text></svg>`;
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function buildFileFromDataUrl(dataUrl, fileName, fileType, lastModified) {
    const [header, base64Payload = ""] = String(dataUrl || "").split(",");
    const mimeType =
        fileType ||
        header.match(/data:([^;]+)/)?.[1] ||
        "application/octet-stream";
    const binary = window.atob(base64Payload);
    const length = binary.length;
    const bytes = new Uint8Array(length);

    for (let index = 0; index < length; index += 1) {
        bytes[index] = binary.charCodeAt(index);
    }

    return new File([bytes], fileName, {
        type: mimeType,
        lastModified: lastModified || Date.now(),
    });
}

function getTextContent(element) {
    return element?.textContent?.trim() ?? "";
}

function cloneUsers(users) {
    return users.map((user) => ({ ...user }));
}

function getTaggedUserSummary(users) {
    return users.length === 0
        ? "사용자 태그하기"
        : users.map((user) => user.name).join(", ");
}

function filterUsersByQuery(users, query, limit = 6) {
    const normalizedQuery = String(query || "")
        .trim()
        .toLowerCase();
    if (!normalizedQuery) {
        return [];
    }
    return users
        .filter((user) =>
            `${user.name} ${user.handle}`
                .toLowerCase()
                .includes(normalizedQuery),
        )
        .slice(0, limit);
}

function buildTagChipMarkup(user) {
    const avatarMarkup = user.avatar
        ? `<span class="tweet-modal__tag-chip-avatar"><img src="${escapeHtml(user.avatar)}" alt="${escapeHtml(user.name)}" /></span>`
        : '<span class="tweet-modal__tag-chip-avatar"></span>';
    return `<button type="button" class="tweet-modal__tag-chip" data-tag-remove-id="${escapeHtml(user.id)}">${avatarMarkup}<span class="tweet-modal__tag-chip-name">${escapeHtml(user.name)}</span><svg viewBox="0 0 24 24" aria-hidden="true" class="tweet-modal__tag-chip-icon"><g><path d="M10.59 12 4.54 5.96l1.42-1.42L12 10.59l6.04-6.05 1.42 1.42L13.41 12l6.05 6.04-1.42 1.42L12 13.41l-6.04 6.05-1.42-1.42L10.59 12z"></path></g></svg></button>`;
}

function buildTagResultMarkup(user, isSelected) {
    const subtitle = isSelected ? `${user.handle} 이미 태그됨` : user.handle;
    const avatarMarkup = user.avatar
        ? `<span class="tweet-modal__tag-avatar"><img src="${escapeHtml(user.avatar)}" alt="${escapeHtml(user.name)}" /></span>`
        : '<span class="tweet-modal__tag-avatar"></span>';
    return `<div role="option" class="tweet-modal__tag-option" data-testid="typeaheadResult"><div role="checkbox" aria-checked="${String(isSelected)}" aria-disabled="${String(isSelected)}" class="tweet-modal__tag-checkbox"><button type="button" class="tweet-modal__tag-user" data-tag-user-id="${escapeHtml(user.id)}" ${isSelected ? "disabled" : ""}>${avatarMarkup}<span class="tweet-modal__tag-user-body"><span class="tweet-modal__tag-user-name">${escapeHtml(user.name)}</span><span class="tweet-modal__tag-user-handle">${escapeHtml(subtitle)}</span></span></button></div></div>`;
}

function renderTagResultsPanel({
    input,
    resultsElement,
    users,
    selectedUsers,
    resultId,
}) {
    if (!input || !resultsElement) {
        return;
    }

    if (!input.value.trim()) {
        input.setAttribute("aria-expanded", "false");
        input.removeAttribute("aria-controls");
        resultsElement.removeAttribute("role");
        resultsElement.removeAttribute("id");
        resultsElement.innerHTML = "";
        return;
    }

    input.setAttribute("aria-expanded", "true");
    input.setAttribute("aria-controls", resultId);
    resultsElement.setAttribute("role", "listbox");
    resultsElement.id = resultId;

    if (users.length === 0) {
        resultsElement.innerHTML =
            '<p class="tweet-modal__tag-empty">일치하는 사용자를 찾지 못했습니다.</p>';
        return;
    }

    resultsElement.innerHTML = users
        .map((user) =>
            buildTagResultMarkup(
                user,
                selectedUsers.some((entry) => entry.id === user.id),
            ),
        )
        .join("");
}

function renderLocationOptions(listElement, locations, selectedLocation) {
    if (!listElement) {
        return;
    }

    if (locations.length === 0) {
        listElement.innerHTML =
            '<p class="tweet-modal__location-empty">일치하는 위치를 찾지 못했습니다.</p>';
        return;
    }

    listElement.innerHTML = locations
        .map((location) => {
            const isSelected = selectedLocation === location;
            return `<button type="button" class="tweet-modal__location-item" role="menuitem"><span class="tweet-modal__location-item-label">${escapeHtml(location)}</span><span class="tweet-modal__location-item-check">${isSelected ? '<svg viewBox="0 0 24 24" aria-hidden="true"><g><path d="M9.64 18.952l-5.55-4.861 1.317-1.504 3.951 3.459 8.459-10.948L19.4 6.32 9.64 18.952z"></path></g></svg>' : ""}</span></button>`;
        })
        .join("");
}

// 메인 타임라인에서 태그 가능한 사용자는 현재 계정과 `.postCard` 작성자를 합쳐 만든다.
// 작성 모달과 답글 모달이 같은 데이터 원본을 쓰도록 여기서 한 번만 만든다.
function getMainPageTagUsers() {
    const seenHandles = new Set();
    const users = [];
    const accountName = getTextContent(document.getElementById("accountName"));
    const accountHandle = getTextContent(
        document.getElementById("accountHandle"),
    );
    const accountAvatarLabel =
        getTextContent(document.getElementById("accountAvatar")) ||
        accountName.charAt(0) ||
        "나";

    if (accountName && accountHandle) {
        seenHandles.add(accountHandle);
        users.push({
            id: accountHandle.replace("@", "") || "current-user",
            name: accountName,
            handle: accountHandle,
            avatar: buildInitialAvatarDataUri(accountAvatarLabel),
        });
    }

    document.querySelectorAll(".postCard").forEach((postCard, index) => {
        const name = getTextContent(postCard.querySelector(".postName"));
        const handle = getTextContent(postCard.querySelector(".postHandle"));
        const avatar =
            postCard.querySelector(".postAvatarImage")?.getAttribute("src") ??
            "";

        if (!name || !handle || seenHandles.has(handle)) {
            return;
        }

        seenHandles.add(handle);
        users.push({
            id: `${handle.replace("@", "") || "user"}-${index}`,
            name,
            handle,
            avatar,
        });
    });

    return users;
}

// 작성/답글 첨부 미리보기는 같은 마크업 규칙을 써서 공통 helper로 합친다.
const attachmentGridLayouts = {
    1: {
        aspectClassName: "media-aspect-ratio media-aspect-ratio--single",
        columns: [[{ index: 0, className: "media-cell--single" }]],
    },
    2: {
        aspectClassName: "media-aspect-ratio",
        columns: [
            [{ index: 0, className: "media-cell--left" }],
            [{ index: 1, className: "media-cell--right" }],
        ],
    },
    3: {
        aspectClassName: "media-aspect-ratio",
        columns: [
            [{ index: 0, className: "media-cell--left-tall" }],
            [
                { index: 1, className: "media-cell--right-top" },
                { index: 2, className: "media-cell--right-bottom" },
            ],
        ],
    },
    4: {
        aspectClassName: "media-aspect-ratio",
        columns: [
            [
                { index: 0, className: "media-cell--top-left" },
                { index: 2, className: "media-cell--bottom-left" },
            ],
            [
                { index: 1, className: "media-cell--top-right" },
                { index: 3, className: "media-cell--bottom-right" },
            ],
        ],
    },
};

function buildAttachmentActionMarkup({
    index,
    deleteLabel,
    removeAttribute,
    includeEdit = true,
    editAttribute = "data-attachment-edit-index",
}) {
    const editButtonMarkup = includeEdit
        ? `<div class="media-btn-row"><button type="button" class="media-btn" ${editAttribute}="${index}"><span>수정</span></button></div>`
        : "";

    return `${editButtonMarkup}<button type="button" class="media-btn-delete" aria-label="${escapeHtml(deleteLabel)}" ${removeAttribute}="${index}"><svg viewBox="0 0 24 24" aria-hidden="true"><g><path d="M10.59 12L4.54 5.96l1.42-1.42L12 10.59l6.04-6.05 1.42 1.42L13.41 12l6.05 6.04-1.42 1.42L12 13.41l-6.04 6.05-1.42-1.42L10.59 12z"></path></g></svg></button>`;
}

function buildAttachmentMediaCellMarkup({
    className,
    mediaMarkup,
    actionMarkup,
}) {
    return `<div class="media-cell ${className}"><div class="media-cell-inner">${mediaMarkup}${actionMarkup}</div></div>`;
}

function buildAttachmentImageCellMarkup({
    index,
    url,
    className,
    alt,
    actionMarkup,
}) {
    const mediaMarkup = `<div class="media-img-container" aria-label="미디어" role="group"><div class="media-bg" style="background-image: url('${url}');"></div><img alt="${escapeHtml(alt)}" draggable="false" src="${url}" class="media-img"></div>`;
    return buildAttachmentMediaCellMarkup({
        className,
        mediaMarkup,
        actionMarkup,
    });
}

function buildAttachmentGridMarkup({
    count,
    urls,
    getAlt,
    getActionMarkup,
}) {
    const layout = attachmentGridLayouts[count] || attachmentGridLayouts[4];
    const columnsMarkup = layout.columns
        .map((column) => {
            const cellsMarkup = column
                .map(({ index, className }) =>
                    buildAttachmentImageCellMarkup({
                        index,
                        url: urls[index],
                        className,
                        alt: getAlt(index),
                        actionMarkup: getActionMarkup(index),
                    }),
                )
                .join("");

            return `<div class="media-col">${cellsMarkup}</div>`;
        })
        .join("");

    if (layout.columns.length === 1) {
        return `<div class="${layout.aspectClassName}"></div><div class="media-absolute-layer">${columnsMarkup}</div>`;
    }

    return `<div class="${layout.aspectClassName}"></div><div class="media-absolute-layer"><div class="media-row">${columnsMarkup}</div></div>`;
}

function buildAttachmentVideoMarkup({
    index = 0,
    url,
    fileType,
    actionMarkup,
}) {
    const mediaMarkup = `<div class="media-img-container" aria-label="미디어" role="group"><video class="tweet-modal__attachment-video" controls preload="metadata"><source src="${url}" type="${escapeHtml(fileType)}"></video></div>`;
    const cellMarkup = buildAttachmentMediaCellMarkup({
        className: "media-cell--single",
        mediaMarkup,
        actionMarkup,
    });

    return `<div class="media-aspect-ratio media-aspect-ratio--single"></div><div class="media-absolute-layer">${cellMarkup}</div>`;
}

function buildAttachmentFileCardMarkup({
    file,
    index,
    objectUrl = "",
    actionMarkup,
}) {
    if (file.type.startsWith("video/")) {
        return buildAttachmentMediaCellMarkup({
            className: "media-cell--single",
            mediaMarkup: `<div class="media-img-container" aria-label="미디어" role="group"><video class="tweet-modal__attachment-video" controls preload="metadata"><source src="${objectUrl}" type="${escapeHtml(file.type)}"></video></div>`,
            actionMarkup,
        });
    }

    return `<div class="tweet-modal__attachment-file"><svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><g><path d="M14 2H7.75C5.68 2 4 3.68 4 5.75v12.5C4 20.32 5.68 22 7.75 22h8.5C18.32 22 20 20.32 20 18.25V8l-6-6zm0 2.12L17.88 8H14V4.12zm2.25 15.88h-8.5c-.97 0-1.75-.78-1.75-1.75V5.75C6 4.78 6.78 4 7.75 4H12v5.25c0 .41.34.75.75.75H18v8.25c0 .97-.78 1.75-1.75 1.75z"></path></g></svg><span class="tweet-modal__attachment-file-name">${escapeHtml(file.name)}</span>${actionMarkup}</div>`;
}

function getSharedDraftEmptyCopy() {
    return {
        title: "잠시 생각을 정리합니다",
        body: "아직 게시할 준비가 되지 않았나요? 임시저장해 두고 나중에 이어서 작성하세요.",
    };
}

function getSharedDraftConfirmCopy() {
    return {
        title: "전송하지 않은 게시물 삭제하기",
        body: "이 작업은 취소할 수 없으며 선택한 전송하지 않은 게시물이 삭제됩니다.",
    };
}

function buildSharedDraftCheckboxMarkup(selected) {
    return `<span class="draft-panel__checkbox${selected ? " draft-panel__checkbox--checked" : ""}" aria-hidden="true"><svg viewBox="0 0 24 24"><g><path d="M9.86 18a1 1 0 01-.73-.31l-3.9-4.11 1.45-1.38 3.2 3.38 7.46-8.1 1.47 1.36-8.19 8.9A1 1 0 019.86 18z"></path></g></svg></span>`;
}

function hasSelectedDraftItems(draftPanelState) {
    return draftPanelState.selectedItems.size > 0;
}

function areAllDraftIdsSelected(draftPanelState, draftIds) {
    return (
        draftIds.length > 0 &&
        draftIds.every((draftId) => draftPanelState.selectedItems.has(draftId))
    );
}

function toggleDraftSelectionState(draftPanelState, draftId) {
    if (!draftId) {
        return;
    }

    if (draftPanelState.selectedItems.has(draftId)) {
        draftPanelState.selectedItems.delete(draftId);
    } else {
        draftPanelState.selectedItems.add(draftId);
    }
    draftPanelState.confirmOpen = false;
}

function toggleDraftSelectAllState(draftPanelState, draftIds) {
    if (draftIds.length === 0) {
        return;
    }

    if (areAllDraftIdsSelected(draftPanelState, draftIds)) {
        draftPanelState.selectedItems.clear();
    } else {
        draftPanelState.selectedItems = new Set(draftIds);
    }
    draftPanelState.confirmOpen = false;
}

function resetSharedDraftPanelState(draftPanelState) {
    draftPanelState.isEditMode = false;
    draftPanelState.confirmOpen = false;
    draftPanelState.selectedItems.clear();
}

function renderDraftPanelChrome({
    draftPanelState,
    itemCount,
    allSelected,
    actionButton,
    empty,
    emptyTitle,
    emptyBody,
    footer,
    selectAllButton,
    deleteButton,
    confirmOverlay,
    confirmTitle,
    confirmDesc,
}) {
    const hasItems = itemCount > 0;
    const emptyCopy = getSharedDraftEmptyCopy();
    const confirmCopy = getSharedDraftConfirmCopy();

    if (actionButton) {
        actionButton.textContent = draftPanelState.isEditMode ? "완료" : "수정";
        actionButton.disabled = !hasItems;
        actionButton.classList.toggle(
            "draft-panel__action--done",
            draftPanelState.isEditMode,
        );
    }
    if (empty) {
        empty.hidden = hasItems;
    }
    if (emptyTitle) {
        emptyTitle.textContent = emptyCopy.title;
    }
    if (emptyBody) {
        emptyBody.textContent = emptyCopy.body;
    }
    if (footer) {
        footer.hidden = !draftPanelState.isEditMode;
    }
    if (selectAllButton) {
        selectAllButton.textContent = allSelected
            ? "모두 선택 해제"
            : "모두 선택";
    }
    if (deleteButton) {
        deleteButton.disabled = !hasSelectedDraftItems(draftPanelState);
    }
    if (confirmOverlay) {
        confirmOverlay.hidden = !draftPanelState.confirmOpen;
    }
    if (confirmTitle) {
        confirmTitle.textContent = confirmCopy.title;
    }
    if (confirmDesc) {
        confirmDesc.textContent = confirmCopy.body;
    }
}

function renderMediaAltEditorPanel({
    edits,
    activeIndex,
    previewImage,
    altInput,
    altCount,
    titleElement,
    prevButton,
    nextButton,
    imageUrls,
    maxLength,
}) {
    if (!previewImage || !altInput || !altCount) {
        return;
    }

    if (edits.length === 0) {
        altInput.value = "";
        altCount.textContent = `0 / ${maxLength.toLocaleString("ko-KR")}`;
        previewImage.src = "";
        previewImage.alt = "";
        if (titleElement) {
            titleElement.textContent = "이미지 설명 수정";
        }
        if (prevButton) {
            prevButton.disabled = true;
        }
        if (nextButton) {
            nextButton.disabled = true;
        }
        return;
    }

    const edit = edits[activeIndex] || { alt: "" };
    const alt = edit.alt ?? "";
    altInput.value = alt;
    altCount.textContent = `${alt.length} / ${maxLength.toLocaleString("ko-KR")}`;
    previewImage.src = imageUrls[activeIndex] ?? "";
    previewImage.alt = alt;

    if (titleElement) {
        titleElement.textContent = `이미지 설명 수정 (${activeIndex + 1}/${edits.length || 1})`;
    }
    if (prevButton) {
        prevButton.disabled = activeIndex <= 0;
    }
    if (nextButton) {
        nextButton.disabled = activeIndex >= edits.length - 1;
    }
}

// 작성 모달에서 공통으로 재사용하는 임시저장/서식 설정 값들이다.
const composerDraftsStorageKey = "main_composer_saved_drafts";
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

const moreMenuIconPaths = {
    lists: "M3 4.5C3 3.12 4.12 2 5.5 2h13C19.88 2 21 3.12 21 4.5v15c0 1.38-1.12 2.5-2.5 2.5h-13C4.12 22 3 20.88 3 19.5v-15zM5.5 4c-.28 0-.5.22-.5.5v15c0 .28.22.5.5.5h13c.28 0 .5-.22.5-.5v-15c0-.28-.22-.5-.5-.5h-13zM16 10H8V8h8v2zm-8 2h8v2H8v-2z",
    communities:
        "M7.501 19.917L7.471 21H.472l.029-1.027c.184-6.618 3.736-8.977 7-8.977.963 0 1.95.212 2.87.672-.444.478-.851 1.03-1.212 1.656-.507-.204-1.054-.329-1.658-.329-2.767 0-4.57 2.223-4.938 6.004H7.56c-.023.302-.05.599-.059.917zm15.998.056L23.528 21H9.472l.029-1.027c.184-6.618 3.736-8.977 7-8.977s6.816 2.358 7 8.977zM21.437 19c-.367-3.781-2.17-6.004-4.938-6.004s-4.57 2.223-4.938 6.004h9.875zm-4.938-9c-.799 0-1.527-.279-2.116-.73-.836-.64-1.384-1.638-1.384-2.77 0-1.93 1.567-3.5 3.5-3.5s3.5 1.57 3.5 3.5c0 1.132-.548 2.13-1.384 2.77-.589.451-1.317.73-2.116.73zm-1.5-3.5c0 .827.673 1.5 1.5 1.5s1.5-.673 1.5-1.5-.673-1.5-1.5-1.5-1.5.673-1.5 1.5zM7.5 3C9.433 3 11 4.57 11 6.5S9.433 10 7.5 10 4 8.43 4 6.5 5.567 3 7.5 3zm0 2C6.673 5 6 5.673 6 6.5S6.673 8 7.5 8 9 7.327 9 6.5 8.327 5 7.5 5z",
    bookmarks:
        "M4 4.5C4 3.12 5.119 2 6.5 2h11C18.881 2 20 3.12 20 4.5v18.44l-8-5.71-8 5.71V4.5zM6.5 4c-.276 0-.5.22-.5.5v14.56l6-4.29 6 4.29V4.5c0-.28-.224-.5-.5-.5h-11z",
    studio: "M7 6h10v2h-1v2.7l3.316 4.97c.446.67.684 1.46.684 2.26 0 2.25-1.822 4.07-4.07 4.07H8.07C5.822 22 4 20.18 4 17.93c0-.8.238-1.59.684-2.26L8 10.7V8H7V6zm9.742 9.42c-.227-.04-.531-.08-.873-.12-.757-.08-1.62-.13-2.25-.06-.572.07-.983.15-1.424.24h-.005c-.445.09-.92.19-1.571.26-.869.11-1.922.03-2.707-.05-.288-.04-.55-.07-.769-.1l-.795 1.19c-.227.34-.348.74-.348 1.15C6 19.07 6.927 20 8.07 20h7.86c1.143 0 2.07-.93 2.07-2.07 0-.41-.121-.81-.348-1.15l-.91-1.36zM10 3c-.552 0-1 .45-1 1s.448 1 1 1 1-.45 1-1-.448-1-1-1zm3.5-2c-.828 0-1.5.67-1.5 1.5S12.672 4 13.5 4 15 3.33 15 2.5 14.328 1 13.5 1z",
    business:
        "M7.323 2h11.443l-3 5h6.648L6.586 22.83 7.847 14H2.523l4.8-12zm1.354 2l-3.2 8h4.676l-.739 5.17L17.586 9h-5.352l3-5H8.677z",
    ads: "M1.996 5.5c0-1.38 1.119-2.5 2.5-2.5h15c1.38 0 2.5 1.12 2.5 2.5v13c0 1.38-1.12 2.5-2.5 2.5h-15c-1.381 0-2.5-1.12-2.5-2.5v-13zm2.5-.5c-.277 0-.5.22-.5.5v13c0 .28.223.5.5.5h15c.276 0 .5-.22.5-.5v-13c0-.28-.224-.5-.5-.5h-15zm8.085 5H8.996V8h7v7h-2v-3.59l-5.293 5.3-1.415-1.42L12.581 10z",
    spaces: "M12 22.25c-4.99 0-9.18-3.393-10.39-7.994l1.93-.512c.99 3.746 4.4 6.506 8.46 6.506s7.47-2.76 8.46-6.506l1.93.512c-1.21 4.601-5.4 7.994-10.39 7.994zM5 11.5c0 3.866 3.13 7 7 7s7-3.134 7-7V8.75c0-3.866-3.13-7-7-7s-7 3.134-7 7v2.75zm12-2.75v2.75c0 2.761-2.24 5-5 5s-5-2.239-5-5V8.75c0-2.761 2.24-5 5-5s5 2.239 5 5zM11.25 8v4.25c0 .414.34.75.75.75s.75-.336.75-.75V8c0-.414-.34-.75-.75-.75s-.75.336-.75.75zm-3 1v2.25c0 .414.34.75.75.75s.75-.336.75-.75V9c0-.414-.34-.75-.75-.75s-.75.336-.75.75zm7.5 0c0-.414-.34-.75-.75-.75s-.75.336-.75.75v2.25c0 .414.34.75.75.75s.75-.336.75-.75V9z",
    settings:
        "M10.54 1.75h2.92l1.57 2.36c.11.17.32.25.53.21l2.53-.59 2.17 2.17-.58 2.54c-.05.2.04.41.21.53l2.36 1.57v2.92l-2.36 1.57c-.17.12-.26.33-.21.53l.58 2.54-2.17 2.17-2.53-.59c-.21-.04-.42.04-.53.21l-1.57 2.36h-2.92l-1.58-2.36c-.11-.17-.32-.25-.52-.21l-2.54.59-2.17-2.17.58-2.54c.05-.2-.03-.41-.21-.53l-2.35-1.57v-2.92L4.1 8.97c.18-.12.26-.33.21-.53L3.73 5.9 5.9 3.73l2.54.59c.2.04.41-.04.52-.21l1.58-2.36zm1.07 2l-.98 1.47C10.05 6.08 9 6.5 7.99 6.27l-1.46-.34-.6.6.33 1.46c.24 1.01-.18 2.07-1.05 2.64l-1.46.98v.78l1.46.98c.87.57 1.29 1.63 1.05 2.64l-.33 1.46.6.6 1.46-.34c1.01-.23 2.06.19 2.64 1.05l.98 1.47h.78l.97-1.47c.58-.86 1.63-1.28 2.65-1.05l1.45.34.61-.6-.34-1.46c-.23-1.01.18-2.07 1.05-2.64l1.47-.98v-.78l-1.47-.98c-.87-.57-1.28-1.63-1.05-2.64l.34-1.46-.61-.6-1.45.34c-1.02.23-2.07-.19-2.65-1.05l-.97-1.47h-.78zM12 10.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5c.82 0 1.5-.67 1.5-1.5s-.68-1.5-1.5-1.5zM8.5 12c0-1.93 1.56-3.5 3.5-3.5 1.93 0 3.5 1.57 3.5 3.5s-1.57 3.5-3.5 3.5c-1.94 0-3.5-1.57-3.5-3.5z",
};

function syncComposerSubviewState({
    composerSection,
    composeView,
    activeView = null,
    subviews = [],
}) {
    if (composeView) {
        composeView.hidden = Boolean(activeView);
    }

    subviews.forEach(({ element, className }) => {
        const isActive = Boolean(activeView) && element === activeView;

        if (element) {
            element.hidden = !isActive;
        }

        if (composerSection?.classList && className) {
            composerSection.classList.toggle(className, isActive);
        }
    });
}

// 좌측 사이드바의 `더 보기` 메뉴를 생성한다.
// 사용 위치: `main.html`의 `#navMore` 버튼.
// 주요 역할: 레이어 생성, 버튼 기준 위치 계산, 바깥 클릭/ESC 닫기, 메뉴 항목 마크업 렌더링.
function setupMoreMenu() {
    const moreButton = document.getElementById("navMore");
    // HTML의 `#layers` 아래에 미리 넣어둔 `#navMoreLayer`를 재사용한다.
    // 더보기 메뉴는 더 이상 JS에서 append/remove 하지 않고 `hidden`만 토글한다.
    const moreLayer = document.getElementById("navMoreLayer");
    const morePopover = document.getElementById("navMorePopover");
    if (!moreButton || !moreLayer || !morePopover) {
        return;
    }

    const menuLinks = Array.from(
        moreLayer.querySelectorAll("[data-nav-more-item]"),
    );

    // 열린 상태는 클래스와 aria를 같이 맞춘다.
    function setMoreMenuOpen(isOpen) {
        moreButton.setAttribute("aria-expanded", String(isOpen));
        moreButton.classList.toggle("isOpen", isOpen);
    }

    // 열려 있는 팝오버만 현재 화면 기준으로 다시 배치한다.
    function refreshActiveMoreMenuPosition() {
        if (moreLayer.hidden) {
            return;
        }
        const { left, top } = calculateMoreMenuPosition({
            windowWidth: window.innerWidth,
            windowHeight: window.innerHeight,
            buttonRect: moreButton.getBoundingClientRect(),
            menuWidth: morePopover.offsetWidth || 318,
            menuHeight: morePopover.offsetHeight || 0,
        });

        morePopover.style.left = `${left}px`;
        morePopover.style.top = `${top}px`;
    }

    // front 전용 화면이라 href 라우팅은 HTML의 빈 링크를 유지하고,
    // JS는 아이콘 path만 동기화한다.
    function syncMoreMenuIcons() {
        menuLinks.forEach((link) => {
            const key = link.getAttribute("data-nav-more-item") || "";
            link
                .querySelector("[data-nav-more-icon]")
                ?.setAttribute("d", moreMenuIconPaths[key] || "");
        });
    }

    function closeMoreMenu() {
        if (moreLayer.hidden) {
            return;
        }
        moreLayer.hidden = true;
        setMoreMenuOpen(false);
    }

    function openMoreMenu() {
        syncMoreMenuIcons();
        moreLayer.hidden = false;
        setMoreMenuOpen(true);
        refreshActiveMoreMenuPosition();
    }

    function toggleMoreMenu(event) {
        event.preventDefault();
        if (!moreLayer.hidden) {
            closeMoreMenu();
            return;
        }
        openMoreMenu();
    }

    moreButton.addEventListener("click", toggleMoreMenu);
    moreLayer
        .querySelector("[data-nav-more-close='true']")
        ?.addEventListener("click", closeMoreMenu);
    menuLinks.forEach((link) => link.addEventListener("click", closeMoreMenu));

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && !moreLayer.hidden) {
            closeMoreMenu();
            moreButton.focus();
        }
    });

    window.addEventListener("resize", refreshActiveMoreMenuPosition, {
        passive: true,
    });

    window.addEventListener("scroll", refreshActiveMoreMenuPosition, {
        passive: true,
    });
}

// 좌측 하단 계정 카드 드롭다운을 제어한다.
// 사용 위치: `main.html`의 `#accountCard`, `#accountMenuPopup`.
// 주요 역할: 현재 핸들로 로그아웃 문구 동기화, 카드 위 고정 팝업 위치 계산, 바깥 클릭/ESC 닫기.
function setupAccountMenu() {
    const accountCard = document.getElementById("accountCard");
    const accountHandle = document.getElementById("accountHandle");
    const accountMenuPopup = document.getElementById("accountMenuPopup");
    const accountLogoutButton = document.getElementById("accountLogoutButton");
    const accountMoreButton = document.getElementById("accountMoreButton");

    if (
        !accountCard ||
        !accountMenuPopup ||
        !accountLogoutButton
    ) {
        return;
    }

    // 열린 상태는 hidden과 aria를 같이 맞춘다.
    function setAccountMenuOpen(isExpanded) {
        accountMenuPopup.hidden = !isExpanded;
        accountCard.setAttribute("aria-expanded", String(isExpanded));
        if (isExpanded) {
            accountLogoutButton.textContent = `${accountHandle?.textContent?.trim() || "@CodeKim1218"} 계정에서 로그아웃`;
            refreshAccountMenuPosition();
        }
    }

    function refreshAccountMenuPosition() {
        if (accountMenuPopup.hidden) {
            return;
        }

        const rect = accountCard.getBoundingClientRect();
        const viewportPadding = 16;
        const popupWidth = Math.min(
            216,
            window.innerWidth - viewportPadding * 2,
        );
        const popupHeight = accountMenuPopup.offsetHeight || 56;
        const left = Math.min(
            Math.max(viewportPadding, rect.right - popupWidth + 10),
            window.innerWidth - popupWidth - viewportPadding,
        );
        const top = Math.max(viewportPadding, rect.top - popupHeight - 12);

        accountMenuPopup.style.width = `${popupWidth}px`;
        accountMenuPopup.style.left = `${left}px`;
        accountMenuPopup.style.top = `${top}px`;
    }

    function toggleAccountMenu() {
        setAccountMenuOpen(accountMenuPopup.hidden);
    }

    function handleAccountMenuToggleIntent(event) {
        event.preventDefault();
        toggleAccountMenu();
    }

    function handleAccountMenuKeydown(event) {
        if (event.key !== "Enter" && event.key !== " ") {
            return;
        }
        handleAccountMenuToggleIntent(event);
    }

    accountCard.addEventListener("click", handleAccountMenuToggleIntent);
    accountCard.addEventListener("keydown", handleAccountMenuKeydown);

    accountMoreButton?.addEventListener("click", (event) => {
        event.stopPropagation();
        handleAccountMenuToggleIntent(event);
    });

    accountLogoutButton.addEventListener("click", (event) => {
        event.preventDefault();
        setAccountMenuOpen(false);
    });

    document.addEventListener("click", (event) => {
        if (
            accountMenuPopup.hidden ||
            accountCard.contains(event.target) ||
            accountMenuPopup.contains(event.target)
        ) {
            return;
        }
        setAccountMenuOpen(false);
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && !accountMenuPopup.hidden) {
            setAccountMenuOpen(false);
            accountCard.focus();
        }
    });

    window.addEventListener("resize", refreshAccountMenuPosition, {
        passive: true,
    });
    window.addEventListener("scroll", refreshAccountMenuPosition, {
        passive: true,
    });

    accountLogoutButton.textContent = `${accountHandle?.textContent?.trim() || "@CodeKim1218"} 계정에서 로그아웃`;
}

// 피드 카드 우측 상단 `...` 메뉴를 제어한다.
// 사용 위치: 각 `.postCard` 내부의 `.postMoreButton`.
// 주요 역할: 버튼별 메타 추출, 팔로우/차단/신고 후속 모달, 토스트, 공용 액션 레이어 닫기.
function setupPostMoreMenus() {
    const moreButtons = Array.from(
        document.querySelectorAll(".postMoreButton"),
    );
    const postMoreFollowState = new Map();
    const postMoreIcons = {
        follow: '<svg viewBox="0 0 24 24" aria-hidden="true" class="post-more-menu__icon"><g><path d="M10 4c-1.105 0-2 .9-2 2s.895 2 2 2 2-.9 2-2-.895-2-2-2zM6 6c0-2.21 1.791-4 4-4s4 1.79 4 4-1.791 4-4 4-4-1.79-4-4zm4 7c-3.053 0-5.563 1.193-7.443 3.596l1.548 1.207C5.573 15.922 7.541 15 10 15s4.427.922 5.895 2.803l1.548-1.207C15.563 14.193 13.053 13 10 13zm8-6V5h-3V3h-2v2h-3v2h3v3h2V7h3z"></path></g></svg>',
        unfollow:
            '<svg viewBox="0 0 24 24" aria-hidden="true" class="post-more-menu__icon"><g><path d="M10 4c-1.105 0-2 .9-2 2s.895 2 2 2 2-.9 2-2-.895-2-2-2zM6 6c0-2.21 1.791-4 4-4s4 1.79 4 4-1.791 4-4 4-4-1.79-4-4zm12.586 3l-2.043-2.04 1.414-1.42L20 7.59l2.043-2.05 1.414 1.42L21.414 9l2.043 2.04-1.414 1.42L20 10.41l-2.043 2.05-1.414-1.42L18.586 9zM3.651 19h12.698c-.337-1.8-1.023-3.21-1.945-4.19C13.318 13.65 11.838 13 10 13s-3.317.65-4.404 1.81c-.922.98-1.608 2.39-1.945 4.19zm.486-5.56C5.627 11.85 7.648 11 10 11s4.373.85 5.863 2.44c1.477 1.58 2.366 3.8 2.632 6.46l.11 1.1H1.395l.11-1.1c.266-2.66 1.155-4.88 2.632-6.46z"></path></g></svg>',
        block: '<svg viewBox="0 0 24 24" aria-hidden="true" class="post-more-menu__icon"><g><path d="M12 3.75c-4.55 0-8.25 3.69-8.25 8.25 0 1.92.66 3.68 1.75 5.08L17.09 5.5C15.68 4.4 13.92 3.75 12 3.75zm6.5 3.17L6.92 18.5c1.4 1.1 3.16 1.75 5.08 1.75 4.56 0 8.25-3.69 8.25-8.25 0-1.92-.65-3.68-1.75-5.08zM1.75 12C1.75 6.34 6.34 1.75 12 1.75S22.25 6.34 22.25 12 17.66 22.25 12 22.25 1.75 17.66 1.75 12z"></path></g></svg>',
        report: '<svg viewBox="0 0 24 24" aria-hidden="true" class="post-more-menu__icon"><g><path d="M3 2h18.61l-3.5 7 3.5 7H5v6H3V2zm2 12h13.38l-2.5-5 2.5-5H5v10z"></path></g></svg>',
    };
    let activeButton = null;
    let activeMenu = null;
    let activePostMoreToastTimer = null;
    const notificationToast = document.getElementById("mainNotificationToast");
    // 차단/신고 모달은 body 하단에 고정된 HTML을 재사용한다.
    const blockDialog = document.getElementById("mainPostBlockDialog");
    const blockHandleTargets = Array.from(
        document.querySelectorAll("[data-post-block-handle]"),
    );
    const reportDialog = document.getElementById("mainPostReportDialog");

    if (moreButtons.length === 0) {
        return;
    }

    function getPostMoreText(element) {
        return element?.textContent?.trim() ?? "";
    }

    // 드롭다운 문구와 후속 모달 메시지는 클릭된 카드의 작성자/핸들 정보를 읽어서 만든다.
    function getPostMoreMeta(button) {
        const postCard = button.closest(".postCard");
        const handle =
            getPostMoreText(postCard?.querySelector(".postHandle")) || "@user";
        return { postCard, handle };
    }

    function setPostMoreMenuItem(item, action, label, iconMarkup) {
        item.dataset.postMoreAction = action;
        item.innerHTML = `${iconMarkup}<span>${escapeHtml(label)}</span>`;
    }

    function getPostMoreMenuDefinitions(handle, isFollowed, items) {
        const reportLabel =
            getPostMoreText(items[2]?.querySelector("span")) ||
            getPostMoreText(items[1]?.querySelector("span")) ||
            "게시물 신고하기";
        const definitions = [
            {
                action: "follow-toggle",
                label: isFollowed
                    ? `${handle} 님 언팔로우하기`
                    : `${handle} 님 팔로우하기`,
                iconMarkup: isFollowed
                    ? postMoreIcons.unfollow
                    : postMoreIcons.follow,
            },
            {
                action: "block",
                label: `${handle} 님 차단하기`,
                iconMarkup: postMoreIcons.block,
            },
            {
                action: "report",
                label: reportLabel,
                iconMarkup: postMoreIcons.report,
            },
        ];

        return items.length >= 3 ? definitions : definitions.slice(1);
    }

    // 현재 팔로우 상태에 맞게 메뉴 문구와 아이콘을 매번 다시 맞춘다.
    function syncPostMoreMenu(button, menu) {
        const items = Array.from(
            menu.querySelectorAll(".post-more-menu__item"),
        );
        const { handle } = getPostMoreMeta(button);
        const isFollowed = postMoreFollowState.get(handle) ?? false;
        getPostMoreMenuDefinitions(handle, isFollowed, items).forEach(
            ({ action, label, iconMarkup }, index) => {
                setPostMoreMenuItem(items[index], action, label, iconMarkup);
            },
        );
    }

    // 팔로우 토글처럼 가벼운 액션은 별도 모달 대신 짧은 토스트로 피드백을 준다.
    function showPostMoreToast(message) {
        showTimedToast({
            toastElement: notificationToast,
            message,
            activeTimer: activePostMoreToastTimer,
            setActiveTimer(nextTimer) {
                activePostMoreToastTimer = nextTimer;
            },
        });
    }

    function closePostMoreModal() {
        if (blockDialog) {
            blockDialog.hidden = true;
        }
        if (reportDialog) {
            reportDialog.hidden = true;
        }
        document.body.classList.remove("modal-open");
    }

    function openStaticPostMoreModal(modal) {
        if (!modal) {
            return;
        }
        document.body.classList.add("modal-open");
        modal.hidden = false;
    }

    // 차단은 즉시 실행하지 않고 확인 모달을 한 단계 더 띄워 오동작을 막는다.
    function openPostMoreBlockModal(button) {
        const { handle } = getPostMoreMeta(button);
        closePostMoreMenu();
        closePostMoreModal();
        blockHandleTargets.forEach((target) => {
            target.textContent = handle;
        });
        openStaticPostMoreModal(blockDialog);
    }

    // 신고는 사유 선택이 필요하므로 별도 사유 모달을 구성한다.
    function openPostMoreReportModal(button) {
        closePostMoreMenu();
        closePostMoreModal();
        openStaticPostMoreModal(reportDialog);
    }

    // 실제 메뉴 항목 클릭 시 어떤 후속 UI로 갈지 분기하는 중심 라우터 역할을 한다.
    function handlePostMoreMenuAction(button, menu, item) {
        const action = item.dataset.postMoreAction;
        const { handle } = getPostMoreMeta(button);

        if (action === "follow-toggle") {
            const isFollowed = postMoreFollowState.get(handle) ?? false;
            postMoreFollowState.set(handle, !isFollowed);
            syncPostMoreMenu(button, menu);
            closePostMoreMenu();
            if (!isFollowed) {
                showPostMoreToast(`${handle} 님을 팔로우함`);
            }
            return;
        }

        if (action === "block") {
            openPostMoreBlockModal(button);
            return;
        }

        if (action === "report") {
            openPostMoreReportModal(button);
            return;
        }

        closePostMoreMenu();
    }

    function closePostMoreMenu() {
        if (!activeMenu || !activeButton) {
            return;
        }

        activeMenu.hidden = true;
        activeButton.setAttribute("aria-expanded", "false");
        activeButton = null;
        activeMenu = null;
    }

    // 드롭다운은 공유 메뉴와 동시에 열리면 안 되므로 공용 close 이벤트를 먼저 보낸다.
    function openPostMoreMenu(button, menu) {
        if (!button || !menu) {
            return;
        }

        document.dispatchEvent(
            new CustomEvent("main:close-post-action-layers"),
        );

        syncPostMoreMenu(button, menu);

        if (activeMenu && activeMenu !== menu) {
            closePostMoreMenu();
        }

        menu.hidden = false;
        button.setAttribute("aria-expanded", "true");
        activeButton = button;
        activeMenu = menu;
    }

    moreButtons.forEach((button) => {
        const postHeader = button.closest(".postHeader");
        const menu = postHeader?.querySelector(".post-more-menu");
        if (!postHeader || !menu) {
            return;
        }

        button.addEventListener("click", (event) => {
            event.preventDefault();
            event.stopPropagation();

            if (
                activeButton === button &&
                activeMenu === menu &&
                !menu.hidden
            ) {
                closePostMoreMenu();
                return;
            }

            openPostMoreMenu(button, menu);
        });

        menu.addEventListener("click", (event) => {
            const item = event.target.closest(".post-more-menu__item");
            if (!item) {
                return;
            }

            event.preventDefault();
            event.stopPropagation();
            handlePostMoreMenuAction(button, menu, item);
        });
    });

    document.addEventListener("click", (event) => {
        if (!activeMenu || !activeButton) {
            return;
        }

        const activeHeader = activeButton.closest(".postHeader");
        if (activeHeader?.contains(event.target)) {
            return;
        }

        closePostMoreMenu();
    });

    blockDialog?.addEventListener("click", (event) => {
        if (event.target.closest("[data-post-block-close='true']")) {
            event.preventDefault();
            closePostMoreModal();
            return;
        }

        if (event.target.closest("[data-post-block-confirm='true']")) {
            event.preventDefault();
            closePostMoreModal();
        }
    });

    reportDialog?.addEventListener("click", (event) => {
        if (
            event.target.closest("[data-post-report-close='true']") ||
            event.target.closest(".notification-report__item")
        ) {
            event.preventDefault();
            closePostMoreModal();
        }
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            closePostMoreModal();
            closePostMoreMenu();
        }
    });

    document.addEventListener("main:close-post-action-layers", () => {
        closePostMoreMenu();
    });
}

// Manage the shared composer card when it switches between inline and modal mode.
// 게시글 작성 본문의 기본 상태를 관리한다.
// 사용 위치: `#composerSection` 내부 본문 입력창과 제출 버튼.
// 주요 역할: 글자 수 게이지, 본문 상태 동기화, 내용이 없을 때 접힘 상태 복원.
function setupComposerState() {
    const composerSection = document.getElementById("composerSection");
    const composerTextarea = document.getElementById("postContent");
    const composerGauge = document.getElementById("composerGauge");
    const composerGaugeText = document.getElementById("composerGaugeText");
    const submitButton = document.getElementById("postSubmitButton");
    const maxLength = 500;

    if (!composerSection || !composerTextarea) {
        return;
    }

    // contenteditable 내부 텍스트를 공백 정규화 후 읽는다.
    function getComposerText() {
        return (
            composerTextarea.textContent?.replace(/\u00a0/g, " ").trim() || ""
        );
    }

    function expandComposer() {
        composerSection.classList.add("isExpanded");
    }

    // 내용이 비었을 때 불필요한 `<br>`나 nbsp 잔여물을 지워 placeholder가 다시 보이게 만든다.
    function normalizeComposerContent() {
        const text =
            composerTextarea.textContent?.replace(/\u00a0/g, " ") || "";
        if (text.trim() === "") {
            composerTextarea.innerHTML = "";
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

    composerSection.__getComposerContent = getComposerText;
    composerSection.__getComposerRichContent = () => composerTextarea.innerHTML;
    composerSection.__setComposerContent = (nextContent = "") => {
        composerTextarea.textContent = String(nextContent);
        updateComposerGauge();
    };
    composerSection.__setComposerRichContent = (nextRichContent = "") => {
        const richContent = String(nextRichContent || "").trim();
        composerTextarea.innerHTML = richContent;
        updateComposerGauge();
    };
    composerSection.__syncComposerState = updateComposerGauge;

    // 500자 기준 원형 게이지와 남은 글자 수를 동시에 갱신한다.
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

// 게시글 작성 모달의 열기/닫기 흐름을 제어한다.
// 사용 위치: 좌측 사이드바 `#createPostButton`, 모달 헤더 `#composerModalClose`.
// 주요 역할: 모달 표시, 포커스 트랩, ESC 우선순위, 닫기 전 임시 상태 정리.
function setupComposerModal() {
    const createPostButton = document.getElementById("createPostButton");
    const composerModalOverlay = document.getElementById(
        "composerModalOverlay",
    );
    const composerModalClose = document.getElementById("composerModalClose");
    const composerSection = document.getElementById("composerSection");
    const composeView = document.getElementById("composerComposeView");
    const composerTextarea = document.getElementById("postContent");
    const boardMenu = document.getElementById("boardMenu");
    const audienceButton = document.getElementById("audienceButton");
    const locationView = document.getElementById("composerLocationView");
    const draftView = document.getElementById("composerDraftView");
    const tagView = document.getElementById("composerTagView");
    const mediaView = document.getElementById("composerMediaView");

    if (
        !createPostButton ||
        !composerModalOverlay ||
        !composerSection ||
        !composeView
    ) {
        return;
    }

    const composerSubviews = [
        { element: locationView, className: "isLocationViewOpen" },
        { element: mediaView, className: "isMediaViewOpen" },
        { element: tagView, className: "isTagViewOpen" },
        { element: draftView, className: "isDraftViewOpen" },
    ];

    function syncComposerModalSubviews(activeView = null) {
        syncComposerSubviewState({
            composerSection,
            composeView,
            activeView,
            subviews: composerSubviews,
        });
    }

    composerSection.__syncComposerSubviewState = syncComposerModalSubviews;

    // 작성 버튼 클릭 시 기본 작성 뷰만 보이게 정리하고 본문으로 포커스를 보낸다.
    function openComposerModal({ focusEditor = true } = {}) {
        composerSection.hidden = false;
        composerModalOverlay.hidden = false;
        composerSection.classList.add("isExpanded");
        composerSection.classList.add("isModalOpen");
        syncComposerModalSubviews();
        window.requestAnimationFrame(() => {
            composerSection.__refreshCategoryTagsLayout?.();
            composerSection.__refreshCategoryTags?.();
        });
        if (focusEditor) {
            window.setTimeout(() => {
                composerTextarea?.focus();
            }, 0);
        }
    }

    // 본문, 태그, 첨부, 위치 중 하나라도 있으면 닫기 전에 삭제 확인이 필요하다.
    function shouldConfirmComposerDiscard() {
        const content = composerSection.__getComposerContent?.() || "";
        const attachments = Array.isArray(
            composerSection.__getComposerAttachmentFiles?.(),
        )
            ? composerSection.__getComposerAttachmentFiles()
            : [];
        const tags = Array.isArray(composerSection.__getComposerTags?.())
            ? composerSection.__getComposerTags()
            : [];
        const location = composerSection.__getComposerLocation?.() || "";

        return (
            content.trim().length > 0 ||
            attachments.length > 0 ||
            tags.length > 0 ||
            location.trim().length > 0
        );
    }

    // 삭제 확인 후에는 본문뿐 아니라 태그/첨부/위치/게시판 선택까지 초기 상태로 되돌린다.
    function resetComposerAfterDiscard() {
        composerSection.__setComposerContent?.("");
        composerSection.__clearComposerTags?.();
        composerSection.__setComposerLocation?.("");
        composerSection.__setComposerTaggedUsers?.([]);
        composerSection.__setComposerBoard?.({
            label: "일반",
            boardValue: "general",
            communityValue: "",
        });
        composerSection.__setComposerAttachmentsFromDraft?.([]);
    }

    // 닫기 시 서브뷰와 보조 팝업을 먼저 정리한 뒤 모달 상태 클래스를 제거한다.
    function closeComposerModal() {
        if (shouldConfirmComposerDiscard()) {
            if (!window.confirm("게시물을 삭제하시겠어요?")) {
                return;
            }

            resetComposerAfterDiscard();
        }

        composerModalOverlay.hidden = true;
        if (typeof composerSection.__closeDraftConfirm === "function") {
            composerSection.__closeDraftConfirm();
            composerSection.__renderDraftPanel?.();
        }
        if (typeof composerSection.__closeDraftPanel === "function") {
            composerSection.__closeDraftPanel({ restoreFocus: false });
        } else if (draftView) {
            draftView.hidden = true;
        }
        if (typeof composerSection.__closeTagPanel === "function") {
            composerSection.__closeTagPanel({ restoreFocus: false });
        } else if (tagView) {
            tagView.hidden = true;
        }
        if (typeof composerSection.__closeComposerMediaEditor === "function") {
            composerSection.__closeComposerMediaEditor({
                restoreFocus: false,
                discardChanges: true,
            });
        } else if (mediaView) {
            mediaView.hidden = true;
        }
        if (
            typeof composerSection.__closeComposerLocationModal === "function"
        ) {
            composerSection.__closeComposerLocationModal({
                restoreFocus: false,
            });
        }
        syncComposerModalSubviews();
        composerSection.classList.remove("isModalOpen");
        if (boardMenu) {
            boardMenu.hidden = true;
        }
        if (audienceButton) {
            audienceButton.setAttribute("aria-expanded", "false");
        }
        composerSection.hidden = true;
        createPostButton.focus();
    }

    // 모달이 열린 동안 탭 이동이 바깥 페이지로 새지 않도록 포커스를 모달 내부에 가둔다.
    function trapComposerFocus(event) {
        if (event.key !== "Tab" || composerModalOverlay.hidden) {
            return;
        }

        const focusable = Array.from(
            composerSection.querySelectorAll(
                'button:not([disabled]), input:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
            ),
        ).filter(
            (element) =>
                !element.hasAttribute("hidden") &&
                element.offsetParent !== null,
        );

        if (focusable.length === 0) {
            return;
        }

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
        }
    }

    createPostButton.addEventListener("click", (event) => {
        event.preventDefault();
        openComposerModal();
    });

    composerModalClose?.addEventListener("click", closeComposerModal);

    document.addEventListener("keydown", (event) => {
        if (composerModalOverlay.hidden) {
            return;
        }

        if (event.key === "Tab") {
            trapComposerFocus(event);
            return;
        }

        if (event.key !== "Escape") {
            return;
        }

        if (tagView && !tagView.hidden) {
            if (typeof composerSection.__closeTagPanel === "function") {
                composerSection.__closeTagPanel();
            } else {
                tagView.hidden = true;
            }
            return;
        }
        if (mediaView && !mediaView.hidden) {
            composerSection.__closeComposerMediaEditor?.();
            return;
        }
        if (typeof composerSection.__isDraftConfirmOpen === "function") {
            if (composerSection.__isDraftConfirmOpen()) {
                composerSection.__closeDraftConfirm?.();
                composerSection.__renderDraftPanel?.();
                return;
            }
        }
        if (draftView && !draftView.hidden) {
            if (typeof composerSection.__closeDraftPanel === "function") {
                composerSection.__closeDraftPanel();
            } else {
                draftView.hidden = true;
            }
            return;
        }
        if (locationView && !locationView.hidden) {
            composerSection.__closeComposerLocationModal?.();
            return;
        }

        closeComposerModal();
    });
}

// 게시글 작성 모달의 수동 태그 입력을 담당한다.
// 사용 위치: `태그 추가` 버튼으로 열리는 작은 입력창과 상단 태그 칩 영역.
// 주요 역할: Enter 생성, 특수문자/중복 방지, 태그 칩 삭제.
function setupComposerTagInput() {
    const composerSection = document.getElementById("composerSection");
    const tagToggle = document.getElementById("composerTagToggle");
    const addTag = document.querySelector("#devTags");
    const tagEditor = document.getElementById("composerTagEditor");
    const inputTag = document.getElementById("composerTagInput");
    const regExp = /[\{\}\[\]\?.,;:|\)*~`!^\-_+<>@\#$%&\\=\(\'\"]/;
    let isTagEditorOpen = false;

    if (!composerSection || !tagToggle || !addTag || !tagEditor || !inputTag) {
        return;
    }

    function getTagDivs() {
        return Array.from(document.querySelectorAll(".tagDiv"));
    }

    // `태그 추가` 버튼과 실제 입력창은 동시에 보이지 않도록 상태를 맞춘다.
    function syncTagInputVisibility({ focus = false } = {}) {
        const hasTags = getTagDivs().length > 0;
        inputTag.hidden = !hasTags;
        tagEditor.hidden = !isTagEditorOpen;
        tagToggle.hidden = isTagEditorOpen;
        tagToggle.setAttribute("aria-expanded", String(isTagEditorOpen));

        if (!isTagEditorOpen) {
            addTag.value = "";
            return;
        }

        if (focus) {
            window.requestAnimationFrame(() => {
                addTag.focus();
            });
        }
    }

    // 수동 입력 태그와 카테고리 태그가 같은 렌더링/검증 경로를 타도록 공용 추가 함수로 묶는다.
    function addComposerTag(rawTag, { silent = false } = {}) {
        const tag = String(rawTag || "").trim();
        const tagDivs = getTagDivs();

        if (!tag) {
            addTag.value = "";
            return false;
        }

        if (regExp.test(tag)) {
            if (!silent) {
                window.alert("특수문자는 입력 못해요");
            }
            addTag.value = "";
            return false;
        }

        if (tagDivs.some((tagDiv) => tagDiv.textContent === `#${tag}`)) {
            if (!silent) {
                window.alert("중복된 태그가 있어요");
            }
            addTag.value = "";
            return false;
        }

        // 수동 태그 칩은 `#composerTagInput` 내부 끝에 span.tagDiv로 추가하고,
        // 삭제 시에는 click 핸들러에서 해당 노드만 바로 remove 한다.
        const span = document.createElement("span");
        span.className = "tagDiv";
        span.textContent = `#${tag}`;
        inputTag.appendChild(span);

        addTag.value = "";
        isTagEditorOpen = false;
        syncTagInputVisibility();
        return true;
    }

    tagToggle.addEventListener("click", () => {
        isTagEditorOpen = true;
        syncTagInputVisibility({ focus: true });
    });

    addTag.addEventListener("keyup", (event) => {
        const tag = addTag.value;

        if (event.key === "Enter" && tag) {
            event.preventDefault();
            addComposerTag(tag);
        }

        if (event.key === "Escape") {
            isTagEditorOpen = false;
            syncTagInputVisibility();
            tagToggle.focus();
        }
    });

    addTag.addEventListener("focus", () => {
        isTagEditorOpen = true;
        syncTagInputVisibility();
    });

    addTag.addEventListener("blur", () => {
        window.setTimeout(() => {
            if (!addTag.value.trim()) {
                isTagEditorOpen = false;
            }
            syncTagInputVisibility();
        }, 0);
    });

    inputTag.addEventListener("click", (event) => {
        if (event.target.classList.contains("tagDiv")) {
            event.target.remove();
            syncTagInputVisibility();
        }
    });

    composerSection.__addComposerTag = addComposerTag;
    composerSection.__adjustComposerTagInput = syncTagInputVisibility;
    composerSection.__getComposerTags = () =>
        getTagDivs().map((tagDiv) => tagDiv.textContent);
    composerSection.__clearComposerTags = () => {
        getTagDivs().forEach((tagDiv) => tagDiv.remove());
        isTagEditorOpen = false;
        syncTagInputVisibility();
    };
    composerSection.__setComposerTags = (tags = []) => {
        composerSection.__clearComposerTags?.();
        tags.forEach((tag) => {
            const normalizedTag = String(tag || "")
                .trim()
                .replace(/^#/, "");
            if (normalizedTag) {
                addComposerTag(normalizedTag, { silent: true });
            }
        });
        isTagEditorOpen = false;
        syncTagInputVisibility();
    };
    composerSection.__openComposerTagInput = () => {
        isTagEditorOpen = true;
        syncTagInputVisibility({ focus: true });
    };
    syncTagInputVisibility();
}

// Friends 스타일 카테고리 배너를 게시글 작성 모달 안에서 동작시키는 초기화다.
// 사용 위치: 작성 모달의 카테고리 배너.
// 주요 역할: 좌우 스크롤, 대/소분류 전환, 클릭 시 태그 입력 로직으로 연결.
function setupComposerCategoryTags() {
    const scrollEl = document.getElementById("categoryScroll");
    const btnLeft = document.getElementById("scrollLeft");
    const btnRight = document.getElementById("scrollRight");
    const composerSection = document.getElementById("composerSection");

    if (!scrollEl || !btnLeft || !btnRight) {
        return;
    }

    const originalChipsHTML = scrollEl ? scrollEl.innerHTML : "";
    const addComposerTag = (tag) =>
        composerSection?.__addComposerTag?.(tag) ?? false;

    function checkScroll() {
        if (!scrollEl) {
            return;
        }
        btnLeft.style.display = scrollEl.scrollLeft > 0 ? "flex" : "none";
        btnRight.style.display =
            scrollEl.scrollLeft <
            scrollEl.scrollWidth - scrollEl.clientWidth - 1
                ? "flex"
                : "none";
    }

    scrollEl.addEventListener("scroll", checkScroll);
    window.addEventListener("resize", checkScroll);
    checkScroll();

    btnLeft.addEventListener("click", () => {
        scrollEl.scrollBy({ left: -200, behavior: "smooth" });
    });
    btnRight.addEventListener("click", () => {
        scrollEl.scrollBy({ left: 200, behavior: "smooth" });
    });

    scrollEl.addEventListener("click", (event) => {
        const chip = event.target.closest(".cat-chip");
        const backBtn = event.target.closest(".cat-back-btn");

        if (backBtn) {
            scrollEl.innerHTML = originalChipsHTML;
            scrollEl.scrollLeft = 0;
            window.setTimeout(checkScroll, 50);
            return;
        }

        if (!chip) {
            return;
        }

        if (chip.classList.contains("has-subs")) {
            const catName = chip.dataset.cat;
            const subs = chip.dataset.subs.split(",");

            let html =
                '<button class="cat-back-btn" title="대카테고리로 돌아가기" type="button"><svg viewBox="0 0 24 24"><path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" transform="rotate(270 12 12)"/></svg></button>';
            html += `<button class="cat-chip parent-highlight" type="button">${catName}</button>`;
            subs.forEach((subCategory) => {
                html += `<button class="cat-chip" data-cat="${subCategory}" data-is-sub="true" type="button">${subCategory}</button>`;
            });

            scrollEl.innerHTML = html;
            scrollEl.scrollLeft = 0;
            window.setTimeout(checkScroll, 50);
            return;
        }

        if (!addComposerTag(chip.dataset.cat)) {
            return;
        }

        const allChips = scrollEl.querySelectorAll(
            ".cat-chip:not(.parent-highlight)",
        );
        allChips.forEach((categoryChip) => {
            categoryChip.classList.remove("active", "sub-active");
        });

        if (chip.dataset.isSub) {
            chip.classList.add("sub-active");
        } else {
            chip.classList.add("active");
        }
    });

    if (composerSection) {
        composerSection.__refreshCategoryTags = checkScroll;
        composerSection.__refreshCategoryTagsLayout = () => {
            checkScroll();
            composerSection.__adjustComposerTagInput?.();
        };
    }
}

// 게시판/커뮤니티 선택 드롭다운을 제어한다.
// 사용 위치: 작성 모달 상단 `#audienceButton`.
// 주요 역할: 버튼 바로 아래 위치 계산, 일반 보드/커뮤니티 선택 상태 반영.
function setupBoardSelector() {
    const composerSection = document.getElementById("composerSection");
    const audienceButton = document.getElementById("audienceButton");
    const boardMenu = document.getElementById("boardMenu");
    const boardOptions = Array.from(
        document.querySelectorAll(".boardMenuOption"),
    );
    const communityOptions = Array.from(
        document.querySelectorAll(".communityMenuItem"),
    );

    if (!audienceButton || !boardMenu || boardOptions.length === 0) {
        return;
    }

    let selectedBoard = {
        label: "일반",
        boardValue: "general",
        communityValue: "",
    };

    function updateBoardMenuPosition() {
        if (boardMenu.hidden) {
            return;
        }

        const viewportPadding = 16;
        const offset = 8;
        const rect = audienceButton.getBoundingClientRect();
        const menuWidth = Math.min(
            320,
            window.innerWidth - viewportPadding * 2,
        );
        const maxLeft = window.innerWidth - menuWidth - viewportPadding;
        const left = Math.min(Math.max(viewportPadding, rect.left), maxLeft);
        const top = rect.bottom + offset;
        const availableHeight = window.innerHeight - top - viewportPadding;
        const maxHeight = Math.max(220, Math.min(520, availableHeight));

        boardMenu.style.width = `${menuWidth}px`;
        boardMenu.style.left = `${left}px`;
        boardMenu.style.top = `${top}px`;
        boardMenu.style.maxHeight = `${maxHeight}px`;
    }

    function closeBoardMenu() {
        boardMenu.hidden = true;
        audienceButton.setAttribute("aria-expanded", "false");
    }

    function openBoardMenu() {
        boardMenu.hidden = false;
        audienceButton.setAttribute("aria-expanded", "true");
        updateBoardMenuPosition();
    }

    function selectBoard(option) {
        const boardLabel = option.dataset.boardLabel || "일반";
        const boardValue = option.dataset.boardValue || "general";

        selectedBoard = {
            label: boardLabel,
            boardValue,
            communityValue: "",
        };
        audienceButton.textContent = boardLabel;

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

        selectedBoard = {
            label: communityLabel,
            boardValue: "community",
            communityValue,
        };
        audienceButton.textContent = communityLabel;

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
            !audienceButton.contains(event.target)
        ) {
            closeBoardMenu();
        }
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && !boardMenu.hidden) {
            closeBoardMenu();
        }
    });

    window.addEventListener("resize", updateBoardMenuPosition, {
        passive: true,
    });
    window.addEventListener(
        "scroll",
        () => {
            if (!boardMenu.hidden) {
                updateBoardMenuPosition();
            }
        },
        { passive: true },
    );

    if (composerSection) {
        composerSection.__getComposerBoard = () => ({ ...selectedBoard });
        composerSection.__setComposerBoard = ({
            label = "일반",
            boardValue = "general",
            communityValue = "",
        } = {}) => {
            if (boardValue === "community" && communityValue) {
                const matchedCommunity = communityOptions.find(
                    (option) => option.dataset.communityId === communityValue,
                );
                if (matchedCommunity) {
                    selectCommunity(matchedCommunity);
                    return;
                }
            }

            const matchedBoard = boardOptions.find(
                (option) =>
                    (option.dataset.boardValue || "general") === boardValue,
            );

            if (matchedBoard) {
                selectBoard(matchedBoard);
                return;
            }

            audienceButton.textContent = label;
            selectedBoard = {
                label,
                boardValue,
                communityValue,
            };
        };
        composerSection.__closeBoardMenu = closeBoardMenu;
    }
}

// Toolbar logic keeps attachments, formatting, and tag selection in sync.
// 게시글 작성 모달의 핵심 툴바 로직이다.
// 사용 위치: 본문 아래 툴바, 첨부 미리보기, 위치/사용자 태그/미디어 설명 서브뷰.
// 주요 역할:
// - 굵게/기울임꼴 서식 적용
// - 파일 첨부와 미리보기 렌더링
// - 위치 선택 서브뷰와 사용자 태그 서브뷰 제어
// - 미디어 ALT 편집 서브뷰 제어
function setupComposerToolbar() {
    const composerSection = document.getElementById("composerSection");
    const composeView = document.getElementById("composerComposeView");
    const tagView = document.getElementById("composerTagView");
    const composerTextarea = document.getElementById("postContent");
    const mediaUploadButton = document.querySelector(
        "[data-testid='mediaUploadButton']",
    );
    const fileInput = document.querySelector("[data-testid='fileInput']");
    const formatButtons = document.querySelectorAll("[data-format]");
    const geoButton = document.querySelector("[data-testid='geoButton']");
    const geoButtonPath = geoButton?.querySelector("path");
    const locationButton = document.getElementById("composerLocation");
    const locationName = document.getElementById("composerLocationName");
    const attachmentPreview = document.getElementById(
        "composerAttachmentPreview",
    );
    const attachmentList = document.getElementById("composerAttachmentList");
    const locationView = document.getElementById("composerLocationView");
    const locationModalClose = document.getElementById("composerLocationBack");
    const locationModalDelete = document.getElementById(
        "composerLocationDelete",
    );
    const locationModalApply = document.getElementById("composerLocationApply");
    const locationModalSearchInput = document.getElementById(
        "composerLocationSearchInput",
    );
    const locationModalList = document.getElementById("composerLocationList");
    const userTagTrigger = document.querySelector("[data-user-tag-trigger]");
    const userTagLabel = document.querySelector("[data-user-tag-label]");
    const tagModalClose = document.getElementById("tagModalClose");
    const tagModalComplete = document.getElementById("tagModalComplete");
    const tagSearchForm = document.getElementById("tagSearchForm");
    const tagSearchInput = document.getElementById("tagSearchInput");
    const tagChipList = document.getElementById("tagChipList");
    const tagResults = document.getElementById("tagResults");
    const mediaAltTrigger = document.getElementById("composerMediaAltTrigger");
    const mediaAltLabel = document.getElementById("composerMediaAltLabel");
    const mediaView = document.getElementById("composerMediaView");
    const mediaBackButton = document.getElementById("composerMediaBack");
    const mediaPrevButton = document.getElementById("composerMediaPrev");
    const mediaNextButton = document.getElementById("composerMediaNext");
    const mediaSaveButton = document.getElementById("composerMediaSave");
    const mediaTitle = document.getElementById("composerMediaTitle");
    const mediaPreviewImage = document.getElementById(
        "composerMediaPreviewImage",
    );
    const mediaAltInput = document.getElementById("composerMediaAltInput");
    const mediaAltCount = document.getElementById("composerMediaAltCount");
    const maxAttachments = 4;
    const maxComposerMediaAltLength = 1000;
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
    let selectedLocation = null;
    let pendingLocation = null;
    let cachedLocationNames = [];
    let savedComposerSelection = null;
    let pendingComposerFormats = new Set();
    let attachedComposerFiles = [];
    let pendingAttachmentEditIndex = null;
    let selectedTaggedUsers = [];
    let pendingTaggedUsers = [];
    let currentTagResults = [];
    let composerMediaEdits = [];
    let pendingComposerMediaEdits = [];
    let activeComposerMediaIndex = 0;

    if (!composerSection || !composerTextarea) {
        return;
    }

    // 서식 적용이나 서브뷰 전환 뒤에도 입력 지점을 복원하려고 현재 커서를 저장한다.
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

    // 본문이 비어 있을 때 누른 서식은 임시 상태로 저장했다가 첫 입력에 적용한다.
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

    // 서식 버튼은 현재 선택 영역이 있으면 즉시 적용하고, 없으면 pending 상태로 저장한다.
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

    function isMediaEditorOpen() {
        return Boolean(mediaView && !mediaView.hidden);
    }

    function cloneComposerMediaEdits(edits) {
        return edits.map((entry) => ({ ...entry }));
    }

    function syncComposerMediaEditsToAttachments() {
        if (!isComposerImageSet()) {
            composerMediaEdits = [];
            pendingComposerMediaEdits = [];
            syncMediaAltTrigger();
            syncUserTagTrigger();
            return;
        }

        composerMediaEdits = attachedComposerFiles.map((file, index) => ({
            id: `${file.name}-${file.size}-${index}`,
            alt: composerMediaEdits[index]?.alt ?? "",
        }));
        pendingComposerMediaEdits = cloneComposerMediaEdits(composerMediaEdits);
        syncMediaAltTrigger();
        syncUserTagTrigger();
    }

    function getComposerMediaImageAlt(index) {
        return composerMediaEdits[index]?.alt ?? "";
    }

    function getComposerMediaTriggerLabel() {
        return composerMediaEdits.some((entry) => entry.alt.trim().length > 0)
            ? "설명 수정"
            : "설명 추가";
    }

    function syncMediaAltTrigger() {
        const canEditMediaAlt = isComposerImageSet();
        const label = getComposerMediaTriggerLabel();

        if (mediaAltTrigger) {
            mediaAltTrigger.hidden = !canEditMediaAlt;
            mediaAltTrigger.disabled = !canEditMediaAlt;
            mediaAltTrigger.setAttribute("aria-label", label);
        }

        if (mediaAltLabel) {
            mediaAltLabel.textContent = label;
        }

        if (!canEditMediaAlt && isMediaEditorOpen()) {
            closeMediaEditor({ restoreFocus: false, discardChanges: true });
        }
    }

    // ALT 편집기는 현재 선택된 첨부 이미지를 기준으로 제목, 본문, 이전/다음 버튼 상태를 다시 그린다.
    function renderMediaEditor() {
        renderMediaAltEditorPanel({
            edits: pendingComposerMediaEdits,
            activeIndex: activeComposerMediaIndex,
            previewImage: mediaPreviewImage,
            altInput: mediaAltInput,
            altCount: mediaAltCount,
            titleElement: mediaTitle,
            prevButton: mediaPrevButton,
            nextButton: mediaNextButton,
            imageUrls: attachmentUrls,
            maxLength: maxComposerMediaAltLength,
        });
    }

    // 미디어 설명 편집은 이미지 첨부가 있을 때만 열 수 있고, 열리면 기본 작성 뷰를 숨긴다.
    function openMediaEditor() {
        if (!composeView || !mediaView || !isComposerImageSet()) {
            return;
        }

        activeComposerMediaIndex = Math.min(
            activeComposerMediaIndex,
            Math.max(0, attachedComposerFiles.length - 1),
        );
        pendingComposerMediaEdits = cloneComposerMediaEdits(composerMediaEdits);
        composerSection.__syncComposerSubviewState?.(mediaView);
        renderMediaEditor();
        window.requestAnimationFrame(() => {
            mediaAltInput?.focus();
        });
    }

    function closeMediaEditor({
        restoreFocus = true,
        discardChanges = true,
    } = {}) {
        if (!composeView || !mediaView || mediaView.hidden) {
            return;
        }

        if (discardChanges) {
            pendingComposerMediaEdits =
                cloneComposerMediaEdits(composerMediaEdits);
        }

        composerSection.__syncComposerSubviewState?.();

        if (restoreFocus) {
            window.requestAnimationFrame(() => {
                if (mediaAltTrigger && !mediaAltTrigger.hidden) {
                    mediaAltTrigger.focus();
                    return;
                }

                composerTextarea.focus();
            });
        }
    }

    function saveComposerMediaEdits() {
        composerMediaEdits = cloneComposerMediaEdits(pendingComposerMediaEdits);
        renderAttachments(attachedComposerFiles);
        syncMediaAltTrigger();
        closeMediaEditor({ discardChanges: false });
    }

    // User tagging is only available when every attached file is an image.
    function isComposerImageSet() {
        return (
            attachedComposerFiles.length > 0 &&
            attachedComposerFiles.every((file) =>
                file.type.startsWith("image/"),
            )
        );
    }

    function isTagModalOpen() {
        return Boolean(tagView && !tagView.hidden);
    }

    function getTagSearchTerm() {
        return tagSearchInput?.value.trim() ?? "";
    }

    // 사용자 태그 버튼은 "이미지 첨부가 있을 때만" 의미가 있으므로 조건부 노출/비활성화를 함께 처리한다.
    function syncUserTagTrigger() {
        const canTagUsers = isComposerImageSet();
        const label = getTaggedUserSummary(selectedTaggedUsers);

        if (userTagTrigger) {
            userTagTrigger.hidden = !canTagUsers;
            userTagTrigger.disabled = !canTagUsers;
            userTagTrigger.setAttribute("aria-label", label);
        }

        if (userTagLabel) {
            userTagLabel.textContent = label;
        }

        if (!canTagUsers) {
            selectedTaggedUsers = [];
            pendingTaggedUsers = [];
            currentTagResults = [];
            if (isTagModalOpen()) {
                closeTagPanel({ restoreFocus: false });
            }
        }
    }

    function renderTagChipList() {
        if (!tagChipList) {
            return;
        }
        tagChipList.innerHTML = pendingTaggedUsers.map(buildTagChipMarkup).join("");
    }

    // 사용자 검색 결과는 현재 페이지의 계정/게시글 작성자를 기반으로 만든 가상 목록을 보여준다.
    function renderTagResults(users) {
        currentTagResults = users;
        renderTagResultsPanel({
            input: tagSearchInput,
            resultsElement: tagResults,
            users,
            selectedUsers: pendingTaggedUsers,
            resultId: "main-tag-results",
        });
    }

    function runTagSearch() {
        const query = getTagSearchTerm();
        if (!query) {
            renderTagResults([]);
            return;
        }

        renderTagResults(filterUsersByQuery(getMainPageTagUsers(), query));
    }

    // Switch the shared composer from the write view to the tag-selection view.
    // 사용자 태그 서브뷰는 기본 작성 화면을 덮는 독립 상태를 쓰고, 완료 시점에만 확정 상태를 반영한다.
    function openTagPanel() {
        if (!composeView || !tagView || !isComposerImageSet()) {
            return;
        }

        pendingTaggedUsers = cloneTaggedUsers(selectedTaggedUsers);
        composerSection.__syncComposerSubviewState?.(tagView);

        if (tagSearchInput) {
            tagSearchInput.value = "";
        }

        renderTagChipList();
        renderTagResults([]);

        window.requestAnimationFrame(() => {
            tagSearchInput?.focus();
        });
    }

    function closeTagPanel({ restoreFocus = true } = {}) {
        if (!composeView || !tagView || tagView.hidden) {
            return;
        }

        composerSection.__syncComposerSubviewState?.();
        pendingTaggedUsers = cloneTaggedUsers(selectedTaggedUsers);

        if (tagSearchInput) {
            tagSearchInput.value = "";
        }

        renderTagChipList();
        renderTagResults([]);

        if (restoreFocus) {
            window.requestAnimationFrame(() => {
                if (userTagTrigger && !userTagTrigger.hidden) {
                    userTagTrigger.focus();
                    return;
                }

                composerTextarea.focus();
            });
        }
    }

    function applyPendingTaggedUsers() {
        selectedTaggedUsers = cloneTaggedUsers(pendingTaggedUsers);
        syncUserTagTrigger();
    }

    composerSection.__closeTagPanel = closeTagPanel;

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
    document.addEventListener("selectionchange", () => {
        if (document.activeElement === composerTextarea) {
            saveComposerSelection();
            syncFormatButtons();
        }
    });

    geoButton?.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        openLocationModal();
    });
    locationButton?.addEventListener("click", (event) => {
        event.preventDefault();
        openLocationModal();
    });

    userTagTrigger?.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        openTagPanel();
    });

    mediaAltTrigger?.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        openMediaEditor();
    });

    tagModalClose?.addEventListener("click", () => {
        closeTagPanel();
    });

    tagModalComplete?.addEventListener("click", () => {
        applyPendingTaggedUsers();
        closeTagPanel();
    });

    tagSearchForm?.addEventListener("submit", (event) => {
        event.preventDefault();
        runTagSearch();
    });

    tagSearchInput?.addEventListener("input", () => {
        runTagSearch();
    });

    tagChipList?.addEventListener("click", (event) => {
        const chipButton = event.target.closest("[data-tag-remove-id]");
        if (!chipButton) {
            return;
        }

        const userId = chipButton.getAttribute("data-tag-remove-id");
        pendingTaggedUsers = pendingTaggedUsers.filter(
            (user) => user.id !== userId,
        );
        renderTagChipList();
        runTagSearch();
    });

    tagResults?.addEventListener("click", (event) => {
        const userButton = event.target.closest("[data-tag-user-id]");
        if (!userButton) {
            return;
        }

        const userId = userButton.getAttribute("data-tag-user-id");
        const user = currentTagResults.find((entry) => entry.id === userId);
        if (!user || pendingTaggedUsers.some((entry) => entry.id === user.id)) {
            return;
        }

        pendingTaggedUsers = [...pendingTaggedUsers, { ...user }];
        renderTagChipList();
        runTagSearch();
    });

    mediaBackButton?.addEventListener("click", () => {
        closeMediaEditor();
    });

    mediaSaveButton?.addEventListener("click", () => {
        saveComposerMediaEdits();
    });

    mediaPrevButton?.addEventListener("click", () => {
        if (activeComposerMediaIndex === 0) {
            return;
        }

        activeComposerMediaIndex -= 1;
        renderMediaEditor();
        mediaAltInput?.focus();
    });

    mediaNextButton?.addEventListener("click", () => {
        if (activeComposerMediaIndex >= pendingComposerMediaEdits.length - 1) {
            return;
        }

        activeComposerMediaIndex += 1;
        renderMediaEditor();
        mediaAltInput?.focus();
    });

    mediaAltInput?.addEventListener("input", () => {
        const entry = pendingComposerMediaEdits[activeComposerMediaIndex];
        if (!entry) {
            return;
        }

        entry.alt = mediaAltInput.value.slice(0, maxComposerMediaAltLength);
        renderMediaEditor();
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
            const editButton = event.target.closest(
                "[data-attachment-edit-index]",
            );
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

    locationModalClose?.addEventListener("click", closeLocationModal);
    locationModalDelete?.addEventListener("click", () => {
        resetLocationState();
        closeLocationModal();
    });
    locationModalApply?.addEventListener("click", () => {
        if (pendingLocation) {
            applyLocation(pendingLocation);
            closeLocationModal();
        }
    });
    locationModalSearchInput?.addEventListener("input", renderLocationList);
    locationModalList?.addEventListener("click", (event) => {
        const locationItem = event.target.closest(
            ".tweet-modal__location-item",
        );
        const location = locationItem
            ?.querySelector(".tweet-modal__location-item-label")
            ?.textContent?.trim();
        if (!location) {
            return;
        }
        applyLocation(location);
        closeLocationModal();
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && isTagModalOpen()) {
            closeTagPanel();
        }
    });

    syncUserTagTrigger();
    syncFormatButtons();

    // Rebuild the preview area whenever the attachment set changes.
    // 첨부 미리보기는 파일 개수와 타입에 따라 이미지 그리드/비디오/파일 카드로 분기 렌더링한다.
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
            selectedTaggedUsers = [];
            pendingTaggedUsers = [];
            currentTagResults = [];
            composerMediaEdits = [];
            pendingComposerMediaEdits = [];
            activeComposerMediaIndex = 0;
            syncMediaAltTrigger();
            syncUserTagTrigger();
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

        // 첨부 미리보기는 `#composerAttachmentList` 전체를 매번 다시 그려
        // HTML에 고정된 미리보기 슬롯 안에서만 내용이 바뀌게 유지한다.
        if (limitedFiles.every((file) => file.type.startsWith("image/"))) {
            syncComposerMediaEditsToAttachments();
            attachmentList.innerHTML = buildAttachmentGridMarkup({
                count: objectUrls.length,
                urls: objectUrls,
                getAlt: getComposerMediaImageAlt,
                getActionMarkup(index) {
                    return buildAttachmentActionMarkup({
                        index,
                        deleteLabel: "미디어 삭제하기",
                        removeAttribute: "data-remove-attachment",
                    });
                },
            });
            return;
        }

        if (
            limitedFiles.length === 1 &&
            limitedFiles[0].type.startsWith("video/")
        ) {
            syncComposerMediaEditsToAttachments();
            attachmentList.innerHTML = buildAttachmentVideoMarkup({
                url: objectUrls[0],
                fileType: limitedFiles[0].type,
                actionMarkup: buildAttachmentActionMarkup({
                    index: 0,
                    deleteLabel: "미디어 삭제하기",
                    removeAttribute: "data-remove-attachment",
                }),
            });
            return;
        }
        syncComposerMediaEditsToAttachments();
        attachmentList.innerHTML = limitedFiles
            .map((file, index) =>
                buildAttachmentFileCardMarkup({
                    file,
                    index,
                    objectUrl: objectUrls[index],
                    actionMarkup: buildAttachmentActionMarkup({
                        index,
                        deleteLabel: file.type.startsWith("video/")
                            ? "미디어 삭제하기"
                            : "파일 삭제하기",
                        removeAttribute: "data-remove-attachment",
                        includeEdit: file.type.startsWith("video/"),
                    }),
                }),
            )
            .join("");
    }

    async function restoreComposerAttachmentsFromDraft(attachments = []) {
        const serializedAttachments = Array.isArray(attachments)
            ? attachments
            : [];

        if (serializedAttachments.length === 0) {
            renderAttachments([]);
            return;
        }

        const files = [];
        for (const attachment of serializedAttachments.slice(
            0,
            maxAttachments,
        )) {
            if (!attachment?.dataUrl) {
                continue;
            }

            try {
                files.push(
                    buildFileFromDataUrl(
                        attachment.dataUrl,
                        attachment.name ||
                            `draft-attachment-${files.length + 1}`,
                        attachment.type || "",
                        attachment.lastModified,
                    ),
                );
            } catch {
                continue;
            }
        }

        composerMediaEdits = files.map((file, index) => ({
            id: `${file.name}-${file.size}-${index}`,
            alt: String(serializedAttachments[index]?.alt || ""),
        }));
        pendingComposerMediaEdits = cloneComposerMediaEdits(composerMediaEdits);
        activeComposerMediaIndex = 0;
        renderAttachments(files);
    }

    function getLocationSearchTerm() {
        return locationModalSearchInput?.value.trim() ?? "";
    }

    function getFilteredLocations() {
        const searchTerm = getLocationSearchTerm();

        if (cachedLocationNames.length === 0 && locationModalList) {
            cachedLocationNames = Array.from(
                locationModalList.querySelectorAll(
                    ".tweet-modal__location-item-label",
                ),
            )
                .map((element) => element.textContent?.trim() ?? "")
                .filter(Boolean);
        }

        if (cachedLocationNames.length === 0) {
            cachedLocationNames = [...availableLocations];
        }

        return searchTerm
            ? cachedLocationNames.filter((location) =>
                  location.includes(searchTerm),
              )
            : cachedLocationNames;
    }

    // 위치 선택 결과는 툴바 버튼, 하단 위치 버튼, 삭제/완료 버튼 상태에 동시에 반영된다.
    function syncLocationUI() {
        const has = Boolean(selectedLocation);

        if (locationName) {
            locationName.textContent = selectedLocation ?? "";
        }
        if (locationButton) {
            locationButton.hidden = !has;
            locationButton.setAttribute(
                "aria-label",
                has ? `위치 ${selectedLocation}` : "위치 태그하기",
            );
        }
        if (geoButton) {
            geoButton.hidden = false;
            geoButton.setAttribute(
                "aria-label",
                has ? `위치 태그하기, ${selectedLocation}` : "위치 태그하기",
            );
        }
        if (geoButtonPath) {
            const nextPath = has
                ? geoButtonPath.dataset.pathActive
                : geoButtonPath.dataset.pathInactive;
            if (nextPath) {
                geoButtonPath.setAttribute("d", nextPath);
            }
        }
        if (locationModalDelete) {
            locationModalDelete.hidden = !has;
        }
        if (locationModalApply) {
            locationModalApply.disabled = !pendingLocation;
        }
    }

    function renderLocationList() {
        renderLocationOptions(
            locationModalList,
            getFilteredLocations(),
            pendingLocation,
        );
    }

    function applyLocation(location) {
        selectedLocation = location;
        pendingLocation = location;
        syncLocationUI();
    }

    function resetLocationState() {
        selectedLocation = null;
        pendingLocation = null;
        if (locationModalSearchInput) {
            locationModalSearchInput.value = "";
        }
        renderLocationList();
        syncLocationUI();
    }

    // 위치 선택은 작성 모달 내부 서브뷰로 열리며, 현재 선택값을 pending 상태로 복사해 편집한다.
    function openLocationModal() {
        if (!composeView || !locationView) {
            return;
        }

        pendingLocation = selectedLocation;
        composerSection.__syncComposerSubviewState?.(locationView);
        if (locationModalSearchInput) {
            locationModalSearchInput.value = "";
        }
        renderLocationList();
        syncLocationUI();
        window.requestAnimationFrame(() => {
            locationModalSearchInput?.focus();
        });
    }

    function closeLocationModal({ restoreFocus = true } = {}) {
        if (!composeView || !locationView || locationView.hidden) {
            return;
        }

        composerSection.__syncComposerSubviewState?.();
        pendingLocation = selectedLocation;
        if (locationModalSearchInput) {
            locationModalSearchInput.value = "";
        }
        renderLocationList();
        syncLocationUI();
        if (restoreFocus) {
            window.requestAnimationFrame(() => {
                composerTextarea.focus();
            });
        }
    }

    renderLocationList();
    syncLocationUI();

    composerSection.__getComposerLocation = () => selectedLocation ?? "";
    composerSection.__setComposerLocation = (nextLocation = "") => {
        selectedLocation = String(nextLocation || "").trim() || null;
        pendingLocation = selectedLocation;
        renderLocationList();
        syncLocationUI();
    };
    composerSection.__getComposerTaggedUsers = () =>
        cloneTaggedUsers(selectedTaggedUsers);
    composerSection.__setComposerTaggedUsers = (users = []) => {
        const nextUsers = Array.isArray(users) ? cloneTaggedUsers(users) : [];

        if (!isComposerImageSet()) {
            selectedTaggedUsers = [];
            pendingTaggedUsers = [];
            syncUserTagTrigger();
            return;
        }

        selectedTaggedUsers = nextUsers;
        pendingTaggedUsers = cloneTaggedUsers(nextUsers);
        syncUserTagTrigger();
    };
    composerSection.__getComposerAttachmentFiles = () => [
        ...attachedComposerFiles,
    ];
    composerSection.__getComposerMediaEdits = () =>
        cloneComposerMediaEdits(composerMediaEdits);
    composerSection.__setComposerAttachmentsFromDraft =
        restoreComposerAttachmentsFromDraft;
    composerSection.__closeComposerMediaEditor = closeMediaEditor;
    composerSection.__closeComposerLocationModal = closeLocationModal;
}

// 게시글 작성 모달의 임시저장 패널을 담당한다.
// 사용 위치: 헤더의 `임시저장` 버튼으로 진입하는 드래프트 서브뷰.
// 주요 역할:
// - 현재 작성 상태를 localStorage에 저장
// - 임시저장 목록 렌더링
// - 전체 선택/삭제/불러오기
// - 본문, 태그, 위치, 첨부, ALT까지 다시 복원
function setupComposerDraftPanel() {
    const composerSection = document.getElementById("composerSection");
    const composerForm = document.getElementById("postComposerForm");
    const composeView = document.getElementById("composerComposeView");
    const draftView = document.getElementById("composerDraftView");
    const draftButton = document.getElementById("composerModalGhost");
    const composerTextarea = document.getElementById("postContent");
    const composerAvatar = document.getElementById("composerAvatar");
    const draftBackButton = document.getElementById("draftPanelBack");
    const draftActionButton = document.getElementById("draftPanelAction");
    const draftList = document.getElementById("draftPanelList");
    const draftEmpty = document.getElementById("draftPanelEmpty");
    const draftEmptyTitle = document.getElementById("draftPanelEmptyTitle");
    const draftEmptyBody = document.getElementById("draftPanelEmptyBody");
    const draftFooter = document.getElementById("draftPanelFooter");
    const draftSelectAllButton = document.getElementById("draftPanelSelectAll");
    const draftDeleteButton = document.getElementById("draftPanelDelete");
    const draftConfirmOverlay = document.getElementById(
        "draftPanelConfirmOverlay",
    );
    const draftConfirmTitle = document.getElementById("draftConfirmTitle");
    const draftConfirmDesc = document.getElementById("draftConfirmDesc");
    const draftConfirmDeleteButton = document.getElementById(
        "draftPanelConfirmDelete",
    );
    const draftConfirmCancelButton = document.getElementById(
        "draftPanelConfirmCancel",
    );

    if (
        !composerSection ||
        !composeView ||
        !draftView ||
        !draftButton ||
        !draftList
    ) {
        return;
    }

    const draftPanelState = {
        isEditMode: false,
        confirmOpen: false,
        selectedItems: new Set(),
    };
    let currentComposerDraftId = null;

    // 저장소가 깨져 있어도 UI가 죽지 않도록 항상 배열 형태로 정규화해 읽는다.
    function getStoredComposerDrafts() {
        try {
            const saved = localStorage.getItem(composerDraftsStorageKey);
            const parsed = saved ? JSON.parse(saved) : [];
            if (!Array.isArray(parsed)) {
                return [];
            }

            return parsed
                .filter((item) => item && typeof item === "object")
                .map((item) => ({
                    id: String(item.id || ""),
                    content: String(item.content || ""),
                    richContent: String(item.richContent || ""),
                    tags: Array.isArray(item.tags)
                        ? item.tags
                              .map((tag) => String(tag || "").trim())
                              .filter(Boolean)
                        : [],
                    attachments: Array.isArray(item.attachments)
                        ? item.attachments
                              .filter(
                                  (attachment) =>
                                      attachment &&
                                      typeof attachment === "object",
                              )
                              .map((attachment) => ({
                                  name: String(attachment.name || ""),
                                  type: String(attachment.type || ""),
                                  size: Number(attachment.size || 0),
                                  lastModified: Number(
                                      attachment.lastModified || 0,
                                  ),
                                  dataUrl: String(attachment.dataUrl || ""),
                                  alt: String(attachment.alt || ""),
                              }))
                        : [],
                    taggedUsers: Array.isArray(item.taggedUsers)
                        ? item.taggedUsers
                              .filter(
                                  (user) => user && typeof user === "object",
                              )
                              .map((user) => ({
                                  id: String(user.id || ""),
                                  name: String(user.name || ""),
                                  handle: String(user.handle || ""),
                                  avatar: String(user.avatar || ""),
                              }))
                              .filter((user) => user.id && user.name)
                        : [],
                    location: String(item.location || ""),
                    boardLabel: String(item.boardLabel || "일반"),
                    boardValue: String(item.boardValue || "general"),
                    communityValue: String(item.communityValue || ""),
                    avatarText: String(item.avatarText || "나"),
                    savedAt:
                        typeof item.savedAt === "string" && item.savedAt
                            ? item.savedAt
                            : new Date().toISOString(),
                }))
                .filter((item) => item.id !== "")
                .sort(
                    (left, right) =>
                        new Date(right.savedAt).getTime() -
                        new Date(left.savedAt).getTime(),
                );
        } catch {
            return [];
        }
    }

    function saveStoredComposerDrafts(drafts) {
        try {
            localStorage.setItem(
                composerDraftsStorageKey,
                JSON.stringify(drafts),
            );
        } catch {
            return;
        }
    }

    // 첨부 파일은 localStorage에 직접 넣을 수 없어서 Data URL로 직렬화한다.
    function readFileAsDataUrl(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(String(reader.result || ""));
            reader.onerror = () =>
                reject(reader.error || new Error("file-read-failed"));
            reader.readAsDataURL(file);
        });
    }

    async function serializeComposerAttachmentsForDraft(
        files = [],
        mediaEdits = [],
    ) {
        const attachmentFiles = Array.isArray(files) ? files : [];
        const limitedFiles = attachmentFiles.slice(0, 4);

        return Promise.all(
            limitedFiles.map(async (file, index) => ({
                name: file.name,
                type: file.type,
                size: file.size,
                lastModified: file.lastModified,
                dataUrl: await readFileAsDataUrl(file),
                alt: String(mediaEdits[index]?.alt || ""),
            })),
        );
    }

    async function restoreComposerDraftAttachments(attachments = []) {
        await composerSection.__setComposerAttachmentsFromDraft?.(attachments);
    }

    async function buildComposerSnapshot() {
        const content =
            composerSection.__getComposerContent?.() ||
            composerTextarea?.textContent?.replace(/\u00a0/g, " ").trim() ||
            "";
        const richContent =
            composerSection.__getComposerRichContent?.() ||
            composerTextarea?.innerHTML ||
            "";
        const tags = Array.isArray(composerSection.__getComposerTags?.())
            ? composerSection.__getComposerTags()
            : [];
        const attachmentFiles = Array.isArray(
            composerSection.__getComposerAttachmentFiles?.(),
        )
            ? composerSection.__getComposerAttachmentFiles()
            : [];
        const mediaEdits = Array.isArray(
            composerSection.__getComposerMediaEdits?.(),
        )
            ? composerSection.__getComposerMediaEdits()
            : [];
        const attachments = await serializeComposerAttachmentsForDraft(
            attachmentFiles,
            mediaEdits,
        );
        const taggedUsers = Array.isArray(
            composerSection.__getComposerTaggedUsers?.(),
        )
            ? composerSection.__getComposerTaggedUsers()
            : [];
        const location = composerSection.__getComposerLocation?.() || "";
        const board = composerSection.__getComposerBoard?.() || {
            label: "일반",
            boardValue: "general",
            communityValue: "",
        };
        const avatarText = composerAvatar?.textContent?.trim() || "나";

        return {
            content,
            richContent,
            tags,
            attachments,
            taggedUsers,
            location,
            boardLabel: String(board.label || "일반"),
            boardValue: String(board.boardValue || "general"),
            communityValue: String(board.communityValue || ""),
            avatarText,
        };
    }

    // 텍스트/첨부/태그/위치 중 하나라도 있어야 저장할 가치가 있는 초안으로 본다.
    function hasDraftableComposerState(snapshot) {
        return Boolean(
            snapshot.content ||
            snapshot.richContent ||
            snapshot.tags.length > 0 ||
            snapshot.attachments.length > 0 ||
            snapshot.taggedUsers.length > 0 ||
            snapshot.location ||
            snapshot.boardValue !== "general" ||
            snapshot.communityValue,
        );
    }

    function getDraftPreviewText(draft) {
        if (draft.content) {
            return draft.content;
        }

        const fragments = [];
        if (draft.tags.length > 0) {
            fragments.push(draft.tags.join(" "));
        }
        if (draft.location) {
            fragments.push(draft.location);
        }
        if (draft.attachments.length > 0) {
            fragments.push(`첨부 ${draft.attachments.length}개`);
        }

        return fragments.join(" · ") || `${draft.boardLabel} 게시글 초안`;
    }

    function formatDraftDate(savedAt) {
        const date = new Date(savedAt);
        if (Number.isNaN(date.getTime())) {
            return "";
        }

        return date.toLocaleString("ko-KR", {
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
        });
    }

    function getStoredDraftById(draftId) {
        return getStoredComposerDrafts().find((draft) => draft.id === draftId);
    }

    function getDraftIds() {
        return getStoredComposerDrafts().map((draft) => draft.id);
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
        if (getDraftIds().length === 0) {
            return;
        }

        draftPanelState.isEditMode = true;
        draftPanelState.confirmOpen = false;
    }

    function openDraftConfirm() {
        if (
            draftPanelState.isEditMode &&
            hasSelectedDraftItems(draftPanelState)
        ) {
            draftPanelState.confirmOpen = true;
        }
    }

    function closeDraftConfirm() {
        draftPanelState.confirmOpen = false;
    }

    function toggleDraftSelection(draftId) {
        if (!draftPanelState.isEditMode || !draftId) {
            return;
        }
        toggleDraftSelectionState(draftPanelState, draftId);
    }

    function toggleDraftSelectAll() {
        if (!draftPanelState.isEditMode) {
            return;
        }
        toggleDraftSelectAllState(draftPanelState, getDraftIds());
    }

    function buildDraftItemMarkup(draft) {
        const isSelected = draftPanelState.selectedItems.has(draft.id);
        const itemClassNames = [
            "draft-panel__item",
            draftPanelState.isEditMode ? "draft-panel__item--selectable" : "",
            isSelected ? "draft-panel__item--selected" : "",
        ]
            .filter(Boolean)
            .join(" ");
        const avatarText = escapeHtml(
            (draft.avatarText || draft.boardLabel || "나").trim().charAt(0) ||
                "나",
        );
        const previewText = escapeHtml(getDraftPreviewText(draft));
        const savedAt = escapeHtml(formatDraftDate(draft.savedAt));
        const metaText = escapeHtml(`${draft.boardLabel} 게시글 초안`);

        return `
            <button
                type="button"
                class="${itemClassNames}"
                data-draft-id="${escapeHtml(draft.id)}"
                aria-pressed="${draftPanelState.isEditMode ? String(isSelected) : "false"}"
            >
                ${draftPanelState.isEditMode ? buildSharedDraftCheckboxMarkup(isSelected) : ""}
                <span class="draft-panel__avatar">${avatarText}</span>
                <span class="draft-panel__item-body">
                    <span class="draft-panel__meta">${metaText}</span>
                    <span class="draft-panel__text">${previewText}</span>
                    <span class="draft-panel__date">${savedAt}</span>
                </span>
            </button>
        `;
    }

    // 패널은 목록 유무, 편집 모드, 선택 상태에 따라 헤더와 빈 상태 문구가 함께 바뀐다.
    function renderDraftPanel() {
        const drafts = getStoredComposerDrafts();
        const draftIds = new Set(drafts.map((draft) => draft.id));
        draftPanelState.selectedItems = new Set(
            Array.from(draftPanelState.selectedItems).filter((draftId) =>
                draftIds.has(draftId),
            ),
        );

        if (draftList) {
            draftList.innerHTML = drafts.map(buildDraftItemMarkup).join("");
        }

        renderDraftPanelChrome({
            draftPanelState,
            itemCount: drafts.length,
            allSelected: areAllDraftIdsSelected(draftPanelState, getDraftIds()),
            actionButton: draftActionButton,
            empty: draftEmpty,
            emptyTitle: draftEmptyTitle,
            emptyBody: draftEmptyBody,
            footer: draftFooter,
            selectAllButton: draftSelectAllButton,
            deleteButton: draftDeleteButton,
            confirmOverlay: draftConfirmOverlay,
            confirmTitle: draftConfirmTitle,
            confirmDesc: draftConfirmDesc,
        });
    }

    function removeComposerDraftById(draftId) {
        if (!draftId) {
            return;
        }

        const nextDrafts = getStoredComposerDrafts().filter(
            (draft) => draft.id !== draftId,
        );
        saveStoredComposerDrafts(nextDrafts);
        if (currentComposerDraftId === draftId) {
            currentComposerDraftId = null;
        }
    }

    async function persistCurrentComposerDraft() {
        const snapshot = await buildComposerSnapshot();
        const drafts = getStoredComposerDrafts();

        if (!hasDraftableComposerState(snapshot)) {
            if (currentComposerDraftId) {
                removeComposerDraftById(currentComposerDraftId);
            }
            renderDraftPanel();
            return null;
        }

        const nextDraft = {
            id:
                currentComposerDraftId ||
                `draft-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            savedAt: new Date().toISOString(),
            ...snapshot,
        };

        const nextDrafts = [
            nextDraft,
            ...drafts.filter((draft) => draft.id !== nextDraft.id),
        ];

        currentComposerDraftId = nextDraft.id;
        saveStoredComposerDrafts(nextDrafts);
        renderDraftPanel();
        return nextDraft;
    }

    function deleteSelectedDrafts() {
        if (!hasSelectedDraftItems(draftPanelState)) {
            return;
        }

        const selectedIds = new Set(draftPanelState.selectedItems);
        const nextDrafts = getStoredComposerDrafts().filter(
            (draft) => !selectedIds.has(draft.id),
        );

        if (currentComposerDraftId && selectedIds.has(currentComposerDraftId)) {
            currentComposerDraftId = null;
        }

        saveStoredComposerDrafts(nextDrafts);
        exitDraftEditMode();
        renderDraftPanel();
    }

    async function openDraftPanel() {
        composerSection.__closeBoardMenu?.();
        composerSection.__closeComposerMediaEditor?.({
            restoreFocus: false,
            discardChanges: true,
        });
        composerSection.__closeComposerLocationModal?.();
        exitDraftEditMode();
        closeDraftConfirm();
        await persistCurrentComposerDraft();
        composerSection.__syncComposerSubviewState?.(draftView);
        renderDraftPanel();
    }

    // 드래프트 패널을 닫을 때는 선택 상태와 편집 모드를 정리한 뒤 작성 화면 포커스를 복원한다.
    function closeDraftPanel({ restoreFocus = true } = {}) {
        exitDraftEditMode();
        closeDraftConfirm();
        composerSection.__syncComposerSubviewState?.();
        renderDraftPanel();

        if (restoreFocus) {
            draftButton.focus();
        }
    }

    function getDraftItemByElement(target) {
        return target instanceof Element
            ? target.closest("[data-draft-id]")
            : null;
    }

    async function loadDraftIntoComposer(source) {
        const draftId =
            typeof source === "string"
                ? source
                : source?.getAttribute("data-draft-id") || "";
        const draft = getStoredDraftById(draftId);

        if (!draft) {
            return;
        }

        currentComposerDraftId = draft.id;
        composerSection.__setComposerBoard?.({
            label: draft.boardLabel,
            boardValue: draft.boardValue,
            communityValue: draft.communityValue,
        });
        composerSection.__setComposerTags?.(draft.tags);
        composerSection.__setComposerLocation?.(draft.location);
        if (draft.richContent) {
            composerSection.__setComposerRichContent?.(draft.richContent);
        } else {
            composerSection.__setComposerContent?.(draft.content);
        }
        await restoreComposerDraftAttachments(draft.attachments);
        composerSection.__setComposerTaggedUsers?.(draft.taggedUsers);
        closeDraftPanel({ restoreFocus: false });

        window.requestAnimationFrame(() => {
            composerSection.__refreshCategoryTagsLayout?.();
            composerTextarea?.focus();
            if (composerTextarea) {
                placeCaretAtEnd(composerTextarea);
            }
        });
    }

    function isDraftPanelOpen() {
        return !draftView.hidden;
    }

    function isDraftConfirmOpen() {
        return draftPanelState.confirmOpen;
    }

    composerSection.__closeDraftPanel = closeDraftPanel;
    composerSection.__closeDraftConfirm = closeDraftConfirm;
    composerSection.__renderDraftPanel = renderDraftPanel;
    composerSection.__isDraftPanelOpen = isDraftPanelOpen;
    composerSection.__isDraftConfirmOpen = isDraftConfirmOpen;
    composerSection.__persistCurrentComposerDraft = persistCurrentComposerDraft;

    draftButton.addEventListener("click", async (event) => {
        event.preventDefault();
        await openDraftPanel();
    });

    draftBackButton?.addEventListener("click", (event) => {
        event.preventDefault();
        closeDraftPanel();
    });

    draftActionButton?.addEventListener("click", (event) => {
        event.preventDefault();
        if (draftPanelState.isEditMode) {
            exitDraftEditMode();
        } else {
            enterDraftEditMode();
        }
        renderDraftPanel();
    });

    draftSelectAllButton?.addEventListener("click", (event) => {
        event.preventDefault();
        toggleDraftSelectAll();
        renderDraftPanel();
    });

    draftDeleteButton?.addEventListener("click", (event) => {
        event.preventDefault();
        openDraftConfirm();
        renderDraftPanel();
    });

    draftConfirmDeleteButton?.addEventListener("click", (event) => {
        event.preventDefault();
        deleteSelectedDrafts();
    });

    draftConfirmCancelButton?.addEventListener("click", (event) => {
        event.preventDefault();
        closeDraftConfirm();
        renderDraftPanel();
    });

    draftConfirmOverlay?.addEventListener("click", (event) => {
        if (
            event.target === draftConfirmOverlay ||
            event.target.closest(".draft-panel__confirm-backdrop")
        ) {
            closeDraftConfirm();
            renderDraftPanel();
        }
    });

    draftList.addEventListener("click", async (event) => {
        const item = getDraftItemByElement(event.target);
        const draftId = item?.getAttribute("data-draft-id") || "";

        if (!draftId) {
            return;
        }

        if (draftPanelState.isEditMode) {
            toggleDraftSelection(draftId);
            renderDraftPanel();
            return;
        }

        await loadDraftIntoComposer(draftId);
    });

    composerForm?.addEventListener("submit", () => {
        if (currentComposerDraftId) {
            removeComposerDraftById(currentComposerDraftId);
            renderDraftPanel();
        }
    });

    renderDraftPanel();
}

// contenteditable에 공통으로 쓰는 커서 이동 유틸이다.
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

// 우측 검색 패널 열기/닫기 상태를 입력 포커스 기준으로 제어한다.
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

// 우측 환율 피드는 HTML의 `#exchangeRateFeedContent` 내부만 다시 그린다.
// 외부 요청 없이 화면 확인용 샘플 수치만 정적으로 렌더링한다.
function setupExchangeRates() {
    const exchangeRateFeedContent = document.getElementById(
        "exchangeRateFeedContent",
    );
    const exchangeRateFeedSubtitle = document.getElementById(
        "exchangeRateFeedSubtitle",
    );

    if (!exchangeRateFeedContent) {
        return;
    }

    const currencies = ["KRW", "EUR", "JPY", "CNY", "GBP"];
    const currencyLabels = {
        KRW: "대한민국 원",
        EUR: "유로",
        JPY: "일본 엔",
        CNY: "중국 위안",
        GBP: "영국 파운드",
    };

    function formatExchangeDate(value) {
        if (!value) {
            return "";
        }

        const date = new Date(value);
        if (Number.isNaN(date.getTime())) {
            return value;
        }

        return new Intl.DateTimeFormat("ko-KR", {
            month: "long",
            day: "numeric",
        }).format(date);
    }

    function formatExchangeValue(code, value) {
        const fractionDigits = code === "JPY" ? 2 : 4;
        return new Intl.NumberFormat("ko-KR", {
            minimumFractionDigits: fractionDigits,
            maximumFractionDigits: fractionDigits,
        }).format(value);
    }

    const sampleRates = {
        date: "2026-03-13",
        rates: {
            KRW: 1456.42,
            EUR: 0.9184,
            JPY: 148.27,
            CNY: 7.2318,
            GBP: 0.7813,
        },
    };
    const updatedText = formatExchangeDate(sampleRates.date);

    if (exchangeRateFeedSubtitle) {
        exchangeRateFeedSubtitle.textContent = updatedText
            ? `USD 기준 주요 통화 · 샘플 기준일 ${updatedText}`
            : "USD 기준 주요 통화";
    }

    exchangeRateFeedContent.innerHTML = currencies
        .map((code) => {
            const value = sampleRates.rates?.[code];
            const label = currencyLabels[code] || code;
            return `<div class="exchangeRateRow"><div class="exchangeRateMain"><div class="exchangeRateCurrencyLine"><span class="exchangeRateCurrency">${code}</span><span class="exchangeRateCurrencyName">${label}</span></div><span class="exchangeRateMeta">1 USD</span></div><div class="exchangeRateValueWrap"><span class="exchangeRateValue">${formatExchangeValue(code, value)}</span></div></div>`;
        })
        .join("");
}

// 중앙 상단 탭이 피드/Experts 화면을 전환할 때 active 상태와 섹션 표시를 맞춘다.
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
        composerSection.hidden = true;
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

// 추천 카드의 연결 버튼은 현재 상태에 따라 `연결됨/연결 해제` UI와 확인 모달을 전환한다.
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

// 댓글 작성 모달 전체를 담당한다.
// 사용 위치: 각 게시글 카드의 reply 아이콘.
// 주요 역할:
// - 클릭된 원본 게시글 정보를 읽어 모달 상단 컨텍스트 채우기
// - 본문/서식/첨부/위치/사용자 태그/미디어 ALT 편집
// - 임시저장 패널과 삭제 확인
// - ESC와 포커스 트랩 우선순위 관리
function setupReplyModal() {
    const replyModalOverlay = document.querySelector("[data-reply-modal]");
    if (!replyModalOverlay) {
        return;
    }

    const q = (selector) => replyModalOverlay.querySelector(selector);
    const qAll = (selector) =>
        Array.from(replyModalOverlay.querySelectorAll(selector));
    const replyModal = q(".tweet-modal");
    const replyCloseButton = q(".tweet-modal__close");
    const replyEditor = q(".tweet-modal__editor");
    const replySubmitButton = q(".tweet-modal__submit");
    const replyGauge = q("#replyGauge");
    const replyGaugeText = q("#replyGaugeText");
    const replyFooterMeta = q(".tweet-modal__footer-meta");
    const replyContextButton = q(".tweet-modal__context-button");
    const replySourceAvatar = q(".tweet-modal__source-avatar");
    const replySourceName = q(".tweet-modal__source-name");
    const replySourceHandle = q(".tweet-modal__source-handle");
    const replySourceTime = q(".tweet-modal__source-time");
    const replySourceText = q(".tweet-modal__source-text");
    const replyAvatarImage = q("[data-reply-avatar]");
    const draftAvatarImages = qAll("[data-reply-draft-avatar]");
    const composeView = q(".tweet-modal__compose-view");
    const replyLocationView = q(".tweet-modal__location-view");
    const replyTagView = q(".tweet-modal__tag-view");
    const replyMediaView = q(".tweet-modal__media-view");
    const draftView = q(".tweet-modal__draft-view");
    const replyFormatButtons = qAll("[data-format]");
    const replyMediaUploadButton = q("[data-testid='mediaUploadButton']");
    const replyFileInput = q("[data-testid='fileInput']");
    const replyAttachmentPreview = q("[data-attachment-preview]");
    const replyAttachmentMedia = q("[data-attachment-media]");
    const replyGeoButton = q("[data-testid='geoButton']");
    const replyGeoButtonPath = replyGeoButton?.querySelector("path");
    const replyLocationDisplayButton = q("[data-location-display]");
    const replyLocationName = q("[data-location-name]");
    const replyLocationCloseButton = q(".tweet-modal__location-close");
    const replyLocationDeleteButton = q("[data-location-delete]");
    const replyLocationCompleteButton = q("[data-location-complete]");
    const replyLocationSearchInput = q("[data-location-search]");
    const replyLocationList = q("[data-location-list]");
    const replyUserTagTrigger = q("[data-user-tag-trigger]");
    const replyUserTagLabel = q("[data-user-tag-label]");
    const replyTagCloseButton = q("[data-testid='tag-back']");
    const replyTagCompleteButton = q("[data-tag-complete]");
    const replyTagSearchForm = q("[data-tag-search-form]");
    const replyTagSearchInput = q("[data-tag-search]");
    const replyTagChipList = q("[data-tag-chip-list]");
    const replyTagResults = q("[data-tag-results]");
    const replyMediaAltTrigger = q("[data-media-alt-trigger]");
    const replyMediaAltLabel = q("[data-media-alt-label]");
    const replyMediaBackButton = q("[data-testid='media-back']");
    const replyMediaPrevButton = q("[data-media-prev]");
    const replyMediaNextButton = q("[data-media-next]");
    const replyMediaSaveButton = q("[data-media-save]");
    const replyMediaTitle = q("[data-media-title]");
    const replyMediaPreviewImage = q("[data-media-preview-image]");
    const replyMediaAltInput = q("[data-media-alt-input]");
    const replyMediaAltCount = q("[data-media-alt-count]");
    const draftButton = q("[data-testid='unsentButton']");
    const draftBackButton = q(".draft-panel__back");
    const draftActionButton = q(".draft-panel__action");
    const draftList = q(".draft-panel__list");
    const draftEmpty = q(".draft-panel__empty");
    const draftEmptyTitle = q(".draft-panel__empty-title");
    const draftEmptyBody = q(".draft-panel__empty-body");
    const draftFooter = q(".draft-panel__footer");
    const draftSelectAllButton = q(".draft-panel__select-all");
    const draftDeleteButton = q(".draft-panel__footer-delete");
    const draftConfirmOverlay = q(".draft-panel__confirm-overlay");
    const draftConfirmTitle = q(".draft-panel__confirm-title");
    const draftConfirmDesc = q(".draft-panel__confirm-desc");
    const draftConfirmDeleteButton = q(".draft-panel__confirm-primary");
    const draftConfirmCancelButton = q(".draft-panel__confirm-secondary");
    const draftConfirmBackdrop = q(".draft-panel__confirm-backdrop");

    let activeReplyTrigger = null;
    let savedReplySelection = null;
    let pendingReplyFormats = new Set();
    let selectedLocation = null;
    let pendingLocation = null;
    let selectedTaggedUsers = [];
    let pendingTaggedUsers = [];
    let currentTagResults = [];
    let cachedLocationNames = [];
    let attachedReplyFiles = [];
    let attachedReplyFileUrls = [];
    let replyMediaEdits = [];
    let pendingReplyMediaEdits = [];
    let activeReplyMediaIndex = 0;
    let pendingAttachmentEditIndex = null;
    const maxReplyImages = 4;
    const maxReplyMediaAltLength = 1000;
    const replyMaxLength = 500;
    const draftPanelState = {
        isEditMode: false,
        confirmOpen: false,
        selectedItems: new Set(),
    };
    const replyModalSubviews = [
        replyLocationView,
        replyTagView,
        replyMediaView,
        draftView,
    ];

    function syncReplyModalSubviewState(activeView = null) {
        if (composeView) {
            composeView.hidden = Boolean(activeView);
        }

        replyModalSubviews.forEach((view) => {
            if (view) {
                view.hidden = view !== activeView;
            }
        });
    }

    replyModalOverlay.__syncReplyModalSubviewState = syncReplyModalSubviewState;

    function getCurrentAccountAvatar() {
        const avatarText =
            document.getElementById("accountAvatar")?.textContent?.trim() ||
            document
                .getElementById("accountName")
                ?.textContent?.trim()
                ?.charAt(0) ||
            "나";
        return buildInitialAvatarDataUri(avatarText);
    }

    // 현재 로그인 사용자 아바타와 원본 게시글 아바타를 각각 적절한 위치에 채워 넣는다.
    function syncReplyAvatars() {
        const avatar = getCurrentAccountAvatar();
        if (replyAvatarImage) {
            replyAvatarImage.src = avatar;
        }
        draftAvatarImages.forEach((image) => {
            image.src = avatar;
        });
    }

    function saveReplySelection() {
        if (!replyEditor) {
            return;
        }
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) {
            return;
        }
        const range = selection.getRangeAt(0);
        if (replyEditor.contains(range.commonAncestorContainer)) {
            savedReplySelection = range.cloneRange();
        }
    }

    function restoreReplySelection() {
        if (!savedReplySelection) {
            return false;
        }
        const selection = window.getSelection();
        if (!selection) {
            return false;
        }
        selection.removeAllRanges();
        selection.addRange(savedReplySelection);
        return true;
    }

    function hasReplyEditorText() {
        return (
            replyEditor?.textContent.replace(/\u00a0/g, " ").trim().length > 0
        );
    }

    function applyPendingReplyFormatsToContent() {
        if (
            !replyEditor ||
            pendingReplyFormats.size === 0 ||
            !hasReplyEditorText()
        ) {
            return;
        }
        let span = null;
        if (
            replyEditor.childNodes.length === 1 &&
            replyEditor.firstElementChild?.tagName === "SPAN"
        ) {
            span = replyEditor.firstElementChild;
        } else {
            span = document.createElement("span");
            while (replyEditor.firstChild) {
                span.appendChild(replyEditor.firstChild);
            }
            replyEditor.appendChild(span);
        }
        span.style.fontWeight = pendingReplyFormats.has("bold") ? "bold" : "";
        span.style.fontStyle = pendingReplyFormats.has("italic")
            ? "italic"
            : "";
        const range = document.createRange();
        range.selectNodeContents(span);
        range.collapse(false);
        const selection = window.getSelection();
        selection?.removeAllRanges();
        selection?.addRange(range);
        saveReplySelection();
    }

    function syncReplyFormatButtons() {
        replyFormatButtons.forEach((button) => {
            const format = button.getAttribute("data-format");
            if (!format) {
                return;
            }
            let isActive = false;
            try {
                isActive = hasReplyEditorText()
                    ? document.queryCommandState(format)
                    : pendingReplyFormats.has(format);
            } catch {
                isActive = pendingReplyFormats.has(format);
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

    function applyReplyFormat(format) {
        if (!replyEditor) {
            return;
        }
        replyEditor.focus();
        if (!hasReplyEditorText()) {
            if (pendingReplyFormats.has(format)) {
                pendingReplyFormats.delete(format);
            } else {
                pendingReplyFormats.add(format);
            }
            syncReplyFormatButtons();
            return;
        }
        if (!restoreReplySelection()) {
            placeCaretAtEnd(replyEditor);
        }
        document.execCommand(format, false);
        saveReplySelection();
        syncReplySubmitState();
        syncReplyFormatButtons();
    }

    function isReplyImageSet() {
        return (
            attachedReplyFiles.length > 0 &&
            attachedReplyFiles.every((file) => file.type.startsWith("image/"))
        );
    }

    function isReplyVideoSet() {
        return (
            attachedReplyFiles.length === 1 &&
            attachedReplyFiles[0].type.startsWith("video/")
        );
    }

    function hasReplyAttachment() {
        return attachedReplyFiles.length > 0;
    }

    function clearAttachedReplyFileUrls() {
        attachedReplyFileUrls.forEach((url) => URL.revokeObjectURL(url));
        attachedReplyFileUrls = [];
    }

    function cloneReplyMediaEdits(edits) {
        return edits.map((entry) => ({ ...entry }));
    }

    function resetTaggedUsers() {
        selectedTaggedUsers = [];
        pendingTaggedUsers = [];
        currentTagResults = [];
    }

    function syncReplyMediaEditsToAttachments() {
        if (!isReplyImageSet()) {
            replyMediaEdits = [];
            pendingReplyMediaEdits = [];
            syncMediaAltTrigger();
            syncUserTagTrigger();
            return;
        }
        replyMediaEdits = attachedReplyFiles.map((file, index) => ({
            id: `${file.name}-${file.size}-${index}`,
            alt: replyMediaEdits[index]?.alt ?? "",
        }));
        pendingReplyMediaEdits = cloneReplyMediaEdits(replyMediaEdits);
        syncMediaAltTrigger();
        syncUserTagTrigger();
    }

    function getReplyMediaImageAlt(index) {
        return replyMediaEdits[index]?.alt ?? "";
    }

    function getReplyMediaTriggerLabel() {
        return replyMediaEdits.some((entry) => entry.alt.trim().length > 0)
            ? "설명 수정"
            : "설명 추가";
    }

    function syncMediaAltTrigger() {
        const can = isReplyImageSet();
        const label = getReplyMediaTriggerLabel();
        if (replyMediaAltTrigger) {
            replyMediaAltTrigger.hidden = !can;
            replyMediaAltTrigger.disabled = !can;
            replyMediaAltTrigger.setAttribute("aria-label", label);
        }
        if (replyMediaAltLabel) {
            replyMediaAltLabel.textContent = label;
        }
        // 답글 모달은 작성 모달과 스코프가 분리돼 있어서 작성 모달 전용 helper를
        // 참조하면 즉시 ReferenceError가 난다. 현재 답글 미디어 서브뷰가 실제로
        // 열려 있는지만 이 함수 안에서 직접 판단해 안전하게 닫는다.
        if (!can && replyMediaView && !replyMediaView.hidden) {
            closeMediaEditor({ restoreFocus: false, discardChanges: true });
        }
    }

    function syncUserTagTrigger() {
        const canTag = isReplyImageSet();
        const label =
            selectedTaggedUsers.length === 0
                ? "사용자 태그하기"
                : selectedTaggedUsers.map((user) => user.name).join(", ");
        if (replyUserTagTrigger) {
            replyUserTagTrigger.hidden = !canTag;
            replyUserTagTrigger.disabled = !canTag;
            replyUserTagTrigger.setAttribute("aria-label", label);
        }
        if (replyUserTagLabel) {
            replyUserTagLabel.textContent = label;
        }
        if (!canTag) {
            resetTaggedUsers();
        }
    }

    function createReplyAttachmentUrls() {
        clearAttachedReplyFileUrls();
        attachedReplyFileUrls = attachedReplyFiles.map((file) =>
            URL.createObjectURL(file),
        );
    }

    function syncReplyFileInputState() {
        if (!replyFileInput) {
            return;
        }

        // 답글 첨부 미리보기 역시 `[data-attachment-media]` 내부만 교체하고
        // 별도 노드를 body에 추가하지 않는다.
        if (attachedReplyFiles.length === 0) {
            replyFileInput.value = "";
            return;
        }

        const dataTransfer = new DataTransfer();
        attachedReplyFiles.forEach((file) => dataTransfer.items.add(file));
        replyFileInput.files = dataTransfer.files;
    }

    // 댓글 첨부 상태는 별도 배열과 input.files를 같이 맞춰야 삭제/복원이 안정적으로 동작한다.
    function setReplyAttachments(files) {
        attachedReplyFiles = [...files];
        pendingAttachmentEditIndex = null;
        renderReplyAttachment();
        syncReplySubmitState();
    }

    function syncReplyAttachmentDerivedState({ keepTaggedUsers = false } = {}) {
        if (!keepTaggedUsers) {
            resetTaggedUsers();
        }
        syncReplyMediaEditsToAttachments();
    }

    // 댓글 첨부 미리보기도 게시글 작성 모달과 같은 규칙으로 이미지/비디오/파일을 분기한다.
    function renderReplyAttachment() {
        if (
            !replyAttachmentPreview ||
            !replyAttachmentMedia ||
            !replyFileInput
        ) {
            return;
        }
        if (attachedReplyFiles.length === 0) {
            replyAttachmentPreview.hidden = true;
            replyAttachmentMedia.innerHTML = "";
            clearAttachedReplyFileUrls();
            replyFileInput.value = "";
            syncReplyAttachmentDerivedState();
            if (replyMediaUploadButton) {
                replyMediaUploadButton.disabled = false;
            }
            return;
        }
        replyAttachmentPreview.hidden = false;
        syncReplyFileInputState();
        if (replyMediaUploadButton) {
            replyMediaUploadButton.disabled =
                attachedReplyFiles.length >= maxReplyImages &&
                !isReplyVideoSet();
        }
        createReplyAttachmentUrls();
        if (isReplyImageSet()) {
            syncReplyAttachmentDerivedState({ keepTaggedUsers: true });
            replyAttachmentMedia.innerHTML = buildAttachmentGridMarkup({
                count: attachedReplyFileUrls.length,
                urls: attachedReplyFileUrls,
                getAlt: getReplyMediaImageAlt,
                getActionMarkup(index) {
                    return buildAttachmentActionMarkup({
                        index,
                        deleteLabel: "미디어 삭제하기",
                        removeAttribute: "data-attachment-remove-index",
                    });
                },
            });
            return;
        }
        syncReplyAttachmentDerivedState();
        if (isReplyVideoSet()) {
            replyAttachmentMedia.innerHTML = buildAttachmentVideoMarkup({
                url: attachedReplyFileUrls[0],
                fileType: attachedReplyFiles[0].type,
                actionMarkup: buildAttachmentActionMarkup({
                    index: 0,
                    deleteLabel: "미디어 삭제하기",
                    removeAttribute: "data-attachment-remove-index",
                }),
            });
            return;
        }
        replyAttachmentMedia.innerHTML = attachedReplyFiles
            .map((file, index) =>
                buildAttachmentFileCardMarkup({
                    file,
                    index,
                    objectUrl: attachedReplyFileUrls[index],
                    actionMarkup: buildAttachmentActionMarkup({
                        index,
                        deleteLabel: file.type.startsWith("video/")
                            ? "미디어 삭제하기"
                            : "파일 삭제하기",
                        removeAttribute: "data-attachment-remove-index",
                        includeEdit: false,
                    }),
                }),
            )
            .join("");
    }

    function resetReplyAttachment() {
        clearAttachedReplyFileUrls();
        setReplyAttachments([]);
    }

    function removeReplyAttachment(index) {
        setReplyAttachments(
            attachedReplyFiles.filter((_, fileIndex) => fileIndex !== index),
        );
    }

    function handleReplyFileChange(event) {
        const nextFiles = Array.from(event.target.files ?? []);
        if (nextFiles.length === 0) {
            pendingAttachmentEditIndex = null;
            syncReplySubmitState();
            return;
        }
        const replacement = nextFiles[0];
        const video = nextFiles.find((file) => file.type.startsWith("video/"));
        const images = nextFiles.filter((file) =>
            file.type.startsWith("image/"),
        );
        if (pendingAttachmentEditIndex !== null) {
            if (replacement.type.startsWith("video/")) {
                setReplyAttachments([replacement]);
            } else {
                const editable = isReplyVideoSet()
                    ? []
                    : [...attachedReplyFiles];
                const nextAttachedFiles =
                    editable.length === 0
                        ? [replacement]
                        : ((editable[pendingAttachmentEditIndex] = replacement),
                          editable.slice(0, maxReplyImages));
                setReplyAttachments(nextAttachedFiles);
            }
            return;
        }
        if (video) {
            setReplyAttachments([video]);
        } else if (images.length > 0) {
            setReplyAttachments(
                [
                    ...(isReplyImageSet() ? [...attachedReplyFiles] : []),
                    ...images,
                ].slice(0, maxReplyImages),
            );
        } else {
            setReplyAttachments([replacement]);
        }
    }

    function renderTagChipList() {
        if (!replyTagChipList) {
            return;
        }
        replyTagChipList.innerHTML = pendingTaggedUsers.map(buildTagChipMarkup).join("");
    }

    function renderTagResults(users) {
        currentTagResults = users;
        renderTagResultsPanel({
            input: replyTagSearchInput,
            resultsElement: replyTagResults,
            users,
            selectedUsers: pendingTaggedUsers,
            resultId: "main-reply-tag-results",
        });
    }

    function runTagSearch() {
        const query = replyTagSearchInput?.value.trim().toLowerCase() ?? "";
        if (!query) {
            renderTagResults([]);
            return;
        }
        renderTagResults(filterUsersByQuery(getMainPageTagUsers(), query));
    }

    function openTagPanel() {
        if (!composeView || !replyTagView || !isReplyImageSet()) {
            return;
        }
        pendingTaggedUsers = cloneTaggedUsers(selectedTaggedUsers);
        renderTagChipList();
        runTagSearch();
        replyModalOverlay.__syncReplyModalSubviewState?.(replyTagView);
        window.requestAnimationFrame(() => {
            replyTagSearchInput?.focus();
        });
    }

    function closeTagPanel({ restoreFocus = true } = {}) {
        if (!composeView || !replyTagView || replyTagView.hidden) {
            return;
        }
        if (replyTagSearchInput) {
            replyTagSearchInput.value = "";
        }
        renderTagResults([]);
        replyModalOverlay.__syncReplyModalSubviewState?.();
        if (restoreFocus) {
            window.requestAnimationFrame(() => {
                replyEditor?.focus();
            });
        }
    }

    function applyPendingTaggedUsers() {
        selectedTaggedUsers = cloneTaggedUsers(pendingTaggedUsers);
        syncUserTagTrigger();
    }

    // 위치 선택 결과는 툴바 geo 버튼과 하단 위치 표시 버튼에 동시에 반영된다.
    function syncLocationUI() {
        const has = Boolean(selectedLocation);
        if (replyFooterMeta) {
            replyFooterMeta.hidden = !has;
        }
        if (replyLocationName) {
            replyLocationName.textContent = selectedLocation ?? "";
        }
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
            const nextPath = has
                ? replyGeoButtonPath.dataset.pathActive
                : replyGeoButtonPath.dataset.pathInactive;
            if (nextPath) {
                replyGeoButtonPath.setAttribute("d", nextPath);
            }
        }
        if (replyLocationDeleteButton) {
            replyLocationDeleteButton.hidden = !has;
        }
        if (replyLocationCompleteButton) {
            replyLocationCompleteButton.disabled = !pendingLocation;
        }
    }

    function renderLocationList() {
        if (!replyLocationList) {
            return;
        }
        if (cachedLocationNames.length === 0) {
            cachedLocationNames = qAll(".tweet-modal__location-item-label")
                .map((element) => getTextContent(element))
                .filter(Boolean);
        }
        const query = replyLocationSearchInput?.value.trim() ?? "";
        const locations = query
            ? cachedLocationNames.filter((location) => location.includes(query))
            : cachedLocationNames;
        renderLocationOptions(replyLocationList, locations, pendingLocation);
    }

    function applyLocation(location) {
        selectedLocation = location;
        pendingLocation = location;
        syncLocationUI();
    }

    function resetLocationState() {
        selectedLocation = null;
        pendingLocation = null;
        if (replyLocationSearchInput) {
            replyLocationSearchInput.value = "";
        }
        renderLocationList();
        syncLocationUI();
    }

    function openLocationPanel() {
        if (!composeView || !replyLocationView) {
            return;
        }
        pendingLocation = selectedLocation;
        replyModalOverlay.__syncReplyModalSubviewState?.(replyLocationView);
        if (replyLocationSearchInput) {
            replyLocationSearchInput.value = "";
        }
        renderLocationList();
        syncLocationUI();
        window.requestAnimationFrame(() => {
            replyLocationSearchInput?.focus();
        });
    }

    function closeLocationPanel({ restoreFocus = true } = {}) {
        if (!composeView || !replyLocationView || replyLocationView.hidden) {
            return;
        }
        replyModalOverlay.__syncReplyModalSubviewState?.();
        pendingLocation = selectedLocation;
        if (replyLocationSearchInput) {
            replyLocationSearchInput.value = "";
        }
        renderLocationList();
        syncLocationUI();
        if (restoreFocus) {
            window.requestAnimationFrame(() => {
                replyEditor?.focus();
            });
        }
    }

    function renderMediaEditor() {
        renderMediaAltEditorPanel({
            edits: pendingReplyMediaEdits,
            activeIndex: activeReplyMediaIndex,
            previewImage: replyMediaPreviewImage,
            altInput: replyMediaAltInput,
            altCount: replyMediaAltCount,
            titleElement: replyMediaTitle,
            prevButton: replyMediaPrevButton,
            nextButton: replyMediaNextButton,
            imageUrls: attachedReplyFileUrls,
            maxLength: maxReplyMediaAltLength,
        });
    }

    function openMediaEditor() {
        if (!composeView || !replyMediaView || !isReplyImageSet()) {
            return;
        }
        pendingReplyMediaEdits = cloneReplyMediaEdits(replyMediaEdits);
        activeReplyMediaIndex = 0;
        replyModalOverlay.__syncReplyModalSubviewState?.(replyMediaView);
        renderMediaEditor();
        window.requestAnimationFrame(() => {
            replyMediaAltInput?.focus();
        });
    }

    function closeMediaEditor({
        restoreFocus = true,
        discardChanges = true,
    } = {}) {
        if (!composeView || !replyMediaView || replyMediaView.hidden) {
            return;
        }
        if (discardChanges) {
            pendingReplyMediaEdits = cloneReplyMediaEdits(replyMediaEdits);
        }
        replyModalOverlay.__syncReplyModalSubviewState?.();
        if (restoreFocus) {
            window.requestAnimationFrame(() => {
                replyEditor?.focus();
            });
        }
    }

    function saveReplyMediaEdits() {
        replyMediaEdits = cloneReplyMediaEdits(pendingReplyMediaEdits);
        renderReplyAttachment();
        syncMediaAltTrigger();
        closeMediaEditor({ discardChanges: false });
    }

    function syncReplySubmitState() {
        if (!replyEditor) {
            return;
        }
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
        if (replySubmitButton) {
            replySubmitButton.disabled = !canSubmit;
        }
        if (replyGauge) {
            replyGauge.style.setProperty("--gauge-progress", progress);
            replyGauge.setAttribute("aria-valuenow", String(currentLength));
        }
        if (replyGaugeText) {
            replyGaugeText.textContent = String(remaining);
        }
    }

    function updateReplyCount(button) {
        const countElement = button.querySelector(".tweet-action-count");
        if (!countElement) {
            return;
        }
        const nextCount =
            (Number.parseInt(countElement.textContent || "0", 10) || 0) + 1;
        countElement.textContent = String(nextCount);
        button.setAttribute("aria-label", `답글 ${nextCount}`);
    }

    function getReplyContextText(postCard) {
        return (
            getTextContent(
                postCard?.querySelector(
                    ".tweet-reply-to, .postReplyTo, [data-reply-context]",
                ),
            ) ||
            (() => {
                const handle =
                    getTextContent(postCard?.querySelector(".postHandle")) ||
                    "@user";
                return `${handle} 님에게 보내는 답글`;
            })()
        );
    }

    // 클릭된 게시글 카드에서 이름, 핸들, 시간, 본문, 아바타를 읽어 댓글 모달 상단 문맥을 구성한다.
    function populateReplyModal(button) {
        const postCard = button.closest(".postCard");
        if (!postCard) {
            return;
        }
        const name =
            getTextContent(postCard.querySelector(".postName")) || "사용자";
        const handle =
            getTextContent(postCard.querySelector(".postHandle")) || "@user";
        const time =
            getTextContent(postCard.querySelector(".postTime")) || "방금 전";
        const text =
            getTextContent(postCard.querySelector(".postText")) ||
            "본문이 없습니다.";
        const avatar =
            postCard.querySelector(".postAvatarImage")?.getAttribute("src") ||
            buildInitialAvatarDataUri(
                getTextContent(postCard.querySelector(".postAvatar")) ||
                    name.charAt(0) ||
                    "?",
            );
        if (replyContextButton) {
            replyContextButton.textContent = getReplyContextText(postCard);
        }
        if (replySourceAvatar) {
            replySourceAvatar.src = avatar;
            replySourceAvatar.alt = name;
        }
        if (replySourceName) {
            replySourceName.textContent = name;
        }
        if (replySourceHandle) {
            replySourceHandle.textContent = handle;
        }
        if (replySourceTime) {
            replySourceTime.textContent = time;
        }
        if (replySourceText) {
            replySourceText.textContent = text;
        }
    }

    function canCloseReplyModal() {
        return (
            (!hasReplyEditorText() && !hasReplyAttachment()) ||
            window.confirm("게시물을 삭제하시겠어요?")
        );
    }

    function getDraftItems() {
        return qAll(".draft-panel__item");
    }

    function getDraftItemId(item, index) {
        if (!item.dataset.replyDraftId) {
            item.dataset.replyDraftId = `reply-draft-${index}`;
        }
        return item.dataset.replyDraftId;
    }

    function renderDraftItems() {
        getDraftItems().forEach((item, index) => {
            const draftId = getDraftItemId(item, index);
            const isSelected = draftPanelState.selectedItems.has(draftId);
            item.querySelector(".draft-panel__checkbox")?.remove();
            item.classList.toggle(
                "draft-panel__item--selectable",
                draftPanelState.isEditMode,
            );
            item.classList.toggle("draft-panel__item--selected", isSelected);
            item.setAttribute(
                "aria-pressed",
                draftPanelState.isEditMode ? String(isSelected) : "false",
            );
            if (draftPanelState.isEditMode) {
                // 체크박스는 기존 `.draft-panel__item` 시작 부분에만 추가되고,
                // 편집 모드를 끄거나 다시 렌더링하면 먼저 remove 된다.
                item.insertAdjacentHTML(
                    "afterbegin",
                    buildSharedDraftCheckboxMarkup(isSelected),
                );
            }
        });
    }

    function renderDraftPanel() {
        const items = getDraftItems();
        const draftIds = items.map((item, index) => getDraftItemId(item, index));
        renderDraftItems();

        renderDraftPanelChrome({
            draftPanelState,
            itemCount: items.length,
            allSelected: areAllDraftIdsSelected(draftPanelState, draftIds),
            actionButton: draftActionButton,
            empty: draftEmpty,
            emptyTitle: draftEmptyTitle,
            emptyBody: draftEmptyBody,
            footer: draftFooter,
            selectAllButton: draftSelectAllButton,
            deleteButton: draftDeleteButton,
            confirmOverlay: draftConfirmOverlay,
            confirmTitle: draftConfirmTitle,
            confirmDesc: draftConfirmDesc,
        });
    }

    function resetDraftPanel() {
        resetSharedDraftPanelState(draftPanelState);
    }

    function openDraftPanel() {
        if (!composeView || !draftView) {
            return;
        }
        renderDraftPanel();
        replyModalOverlay.__syncReplyModalSubviewState?.(draftView);
    }

    function closeDraftPanel({ restoreFocus = true } = {}) {
        if (!composeView || !draftView) {
            return;
        }
        resetDraftPanel();
        renderDraftPanel();
        replyModalOverlay.__syncReplyModalSubviewState?.();
        if (restoreFocus) {
            draftButton?.focus();
        }
    }

    function toggleDraftSelection(item) {
        const draftId = getDraftItemId(item, getDraftItems().indexOf(item));
        toggleDraftSelectionState(draftPanelState, draftId);
    }

    function toggleDraftSelectAll() {
        toggleDraftSelectAllState(
            draftPanelState,
            getDraftItems().map((item, index) => getDraftItemId(item, index)),
        );
    }

    function deleteSelectedDrafts() {
        getDraftItems().forEach((item, index) => {
            const draftId = getDraftItemId(item, index);
            if (draftPanelState.selectedItems.has(draftId)) {
                item.remove();
            }
        });
        resetDraftPanel();
        renderDraftPanel();
    }

    function loadDraftIntoComposer(item) {
        if (!replyEditor) {
            return;
        }
        replyEditor.textContent = getTextContent(
            item.querySelector(".draft-panel__text"),
        );
        closeDraftPanel({ restoreFocus: false });
        syncReplySubmitState();
        saveReplySelection();
        window.requestAnimationFrame(() => {
            replyEditor.focus();
            placeCaretAtEnd(replyEditor);
        });
    }

    function isReplySubviewOpen(view) {
        return Boolean(view && !view.hidden);
    }

    function handleReplyModalEscape() {
        if (isReplySubviewOpen(replyMediaView)) {
            closeMediaEditor();
            return;
        }
        if (isReplySubviewOpen(replyTagView)) {
            closeTagPanel();
            return;
        }
        if (isReplySubviewOpen(replyLocationView)) {
            closeLocationPanel();
            return;
        }
        if (draftPanelState.confirmOpen) {
            draftPanelState.confirmOpen = false;
            renderDraftPanel();
            return;
        }
        if (isReplySubviewOpen(draftView)) {
            closeDraftPanel();
            return;
        }
        closeReplyModal();
    }

    function resetReplySearchInputs() {
        if (replyLocationSearchInput) replyLocationSearchInput.value = "";
        if (replyTagSearchInput) replyTagSearchInput.value = "";
    }

    function resetReplyModalState() {
        if (replyEditor) {
            replyEditor.textContent = "";
        }
        savedReplySelection = null;
        pendingReplyFormats = new Set();
        selectedLocation = null;
        pendingLocation = null;
        resetReplyAttachment();
        resetReplySearchInputs();
        renderLocationList();
        syncLocationUI();
        syncReplyFormatButtons();
    }

    // 댓글 모달을 열 때는 더보기/공유 드롭다운 같은 다른 액션 레이어를 먼저 닫고 시작한다.
    function openReplyModal(button) {
        if (!replyEditor) {
            return;
        }
        activeReplyTrigger = button;
        document.body.classList.add("modal-open");
        replyModalOverlay.hidden = false;
        syncReplyAvatars();
        populateReplyModal(button);
        resetReplyModalState();
        closeDraftPanel({ restoreFocus: false });
        window.requestAnimationFrame(() => {
            replyEditor.focus();
        });
    }

    // 닫기 시에는 서브뷰, 피커, 임시저장 확인창을 순서대로 정리하고 필요 시 상태 초기화까지 수행한다.
    function closeReplyModal(options = {}) {
        const { skipConfirm = false, restoreFocus = true } = options;
        if (replyModalOverlay.hidden) {
            return;
        }
        if (!skipConfirm && !canCloseReplyModal()) {
            return;
        }
        replyModalOverlay.hidden = true;
        document.body.classList.remove("modal-open");
        closeLocationPanel({ restoreFocus: false });
        closeTagPanel({ restoreFocus: false });
        closeMediaEditor({ restoreFocus: false, discardChanges: true });
        closeDraftPanel({ restoreFocus: false });
        resetReplyModalState();
        if (restoreFocus) {
            activeReplyTrigger?.focus();
        }
        activeReplyTrigger = null;
    }

    // 댓글 모달도 작성 모달과 동일하게 탭 포커스가 바깥 페이지로 빠지지 않도록 가둔다.
    function trapFocus(event) {
        if (event.key !== "Tab" || !replyModal) {
            return;
        }
        const focusable = qAll(
            'button:not([disabled]), input:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ).filter(
            (element) =>
                !element.hasAttribute("hidden") &&
                element.offsetParent !== null,
        );
        if (focusable.length === 0) {
            return;
        }
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
        }
    }

    renderLocationList();
    syncLocationUI();
    syncReplyAvatars();
    renderDraftPanel();
    syncMediaAltTrigger();
    syncUserTagTrigger();

    document.querySelectorAll("[data-testid='reply']").forEach((button) => {
        button.addEventListener("click", (event) => {
            event.preventDefault();
            event.stopPropagation();
            document.dispatchEvent(
                new CustomEvent("main:close-post-action-layers"),
            );
            openReplyModal(button);
        });
    });

    replyCloseButton?.addEventListener("click", () => closeReplyModal());
    replyModalOverlay.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            event.preventDefault();
            handleReplyModalEscape();
            return;
        }
        trapFocus(event);
    });

    replyEditor?.addEventListener("input", () => {
        applyPendingReplyFormatsToContent();
        if (!hasReplyEditorText()) {
            pendingReplyFormats = new Set();
        }
        syncReplySubmitState();
        syncReplyFormatButtons();
    });
    replyEditor?.addEventListener("keyup", saveReplySelection);
    replyEditor?.addEventListener("mouseup", saveReplySelection);
    replyEditor?.addEventListener("focus", saveReplySelection);
    replyEditor?.addEventListener("keyup", syncReplyFormatButtons);
    replyEditor?.addEventListener("mouseup", syncReplyFormatButtons);
    replyEditor?.addEventListener("click", syncReplyFormatButtons);
    replyEditor?.addEventListener("keydown", (event) => {
        if (!event.ctrlKey) {
            return;
        }
        const key = event.key.toLowerCase();
        if (key !== "b" && key !== "i") {
            return;
        }
        event.preventDefault();
        applyReplyFormat(key === "b" ? "bold" : "italic");
    });

    document.addEventListener("selectionchange", () => {
        if (replyModalOverlay.hidden || !replyEditor) {
            return;
        }
        saveReplySelection();
        syncReplyFormatButtons();
    });

    replyFormatButtons.forEach((button) => {
        button.addEventListener("mousedown", (event) => event.preventDefault());
        button.addEventListener("click", (event) => {
            event.preventDefault();
            const format = button.getAttribute("data-format");
            if (format) {
                applyReplyFormat(format);
            }
        });
    });

    replyMediaUploadButton?.addEventListener("click", (event) => {
        event.preventDefault();
        pendingAttachmentEditIndex = null;
        if (replyFileInput) {
            replyFileInput.value = "";
        }
        replyFileInput?.click();
    });
    replyFileInput?.addEventListener("change", handleReplyFileChange);
    replyAttachmentMedia?.addEventListener("click", (event) => {
        const removeButton = event.target.closest(
            "[data-attachment-remove-index]",
        );
        if (removeButton) {
            removeReplyAttachment(
                Number.parseInt(
                    removeButton.getAttribute("data-attachment-remove-index") ??
                        "-1",
                    10,
                ),
            );
            syncReplySubmitState();
            return;
        }
        const editButton = event.target.closest("[data-attachment-edit-index]");
        if (editButton) {
            pendingAttachmentEditIndex = Number.parseInt(
                editButton.getAttribute("data-attachment-edit-index") ?? "-1",
                10,
            );
            if (replyFileInput) {
                replyFileInput.value = "";
            }
            replyFileInput?.click();
        }
    });

    replyGeoButton?.addEventListener("click", (event) => {
        event.preventDefault();
        openLocationPanel();
    });
    replyLocationDisplayButton?.addEventListener("click", (event) => {
        event.preventDefault();
        openLocationPanel();
    });
    replyLocationCloseButton?.addEventListener("click", () =>
        closeLocationPanel(),
    );
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
    replyLocationSearchInput?.addEventListener("input", renderLocationList);
    replyLocationList?.addEventListener("click", (event) => {
        const locationButton = event.target.closest(
            ".tweet-modal__location-item",
        );
        const location = getTextContent(
            locationButton?.querySelector(".tweet-modal__location-item-label"),
        );
        if (!location) {
            return;
        }
        applyLocation(location);
        closeLocationPanel();
    });

    replyUserTagTrigger?.addEventListener("click", (event) => {
        event.preventDefault();
        openTagPanel();
    });
    replyTagCloseButton?.addEventListener("click", () => closeTagPanel());
    replyTagCompleteButton?.addEventListener("click", () => {
        applyPendingTaggedUsers();
        closeTagPanel();
    });
    replyTagSearchForm?.addEventListener("submit", (event) =>
        event.preventDefault(),
    );
    replyTagSearchInput?.addEventListener("input", runTagSearch);
    replyTagChipList?.addEventListener("click", (event) => {
        const chip = event.target.closest("[data-tag-remove-id]");
        const userId = chip?.getAttribute("data-tag-remove-id");
        if (!userId) {
            return;
        }
        pendingTaggedUsers = pendingTaggedUsers.filter(
            (user) => user.id !== userId,
        );
        renderTagChipList();
        runTagSearch();
        replyTagSearchInput?.focus();
    });
    replyTagResults?.addEventListener("click", (event) => {
        const userButton = event.target.closest("[data-tag-user-id]");
        const userId = userButton?.getAttribute("data-tag-user-id");
        if (!userId || userButton.hasAttribute("disabled")) {
            return;
        }
        const user = currentTagResults.find((entry) => entry.id === userId);
        if (!user) {
            return;
        }
        pendingTaggedUsers = [...pendingTaggedUsers, { ...user }];
        renderTagChipList();
        if (replyTagSearchInput) {
            replyTagSearchInput.value = "";
        }
        renderTagResults([]);
        replyTagSearchInput?.focus();
    });

    replyMediaAltTrigger?.addEventListener("click", (event) => {
        event.preventDefault();
        openMediaEditor();
    });
    replyMediaBackButton?.addEventListener("click", () => closeMediaEditor());
    replyMediaSaveButton?.addEventListener("click", saveReplyMediaEdits);
    replyMediaPrevButton?.addEventListener("click", () => {
        if (activeReplyMediaIndex <= 0) {
            return;
        }
        activeReplyMediaIndex -= 1;
        renderMediaEditor();
    });
    replyMediaNextButton?.addEventListener("click", () => {
        if (activeReplyMediaIndex >= pendingReplyMediaEdits.length - 1) {
            return;
        }
        activeReplyMediaIndex += 1;
        renderMediaEditor();
    });
    replyMediaAltInput?.addEventListener("input", () => {
        const entry = pendingReplyMediaEdits[activeReplyMediaIndex];
        if (!entry) {
            return;
        }
        entry.alt = replyMediaAltInput.value.slice(0, maxReplyMediaAltLength);
        renderMediaEditor();
    });

    draftButton?.addEventListener("click", (event) => {
        event.preventDefault();
        openDraftPanel();
    });
    draftBackButton?.addEventListener("click", (event) => {
        event.preventDefault();
        closeDraftPanel();
    });
    draftActionButton?.addEventListener("click", (event) => {
        event.preventDefault();
        draftPanelState.isEditMode = !draftPanelState.isEditMode;
        if (!draftPanelState.isEditMode) {
            draftPanelState.selectedItems.clear();
            draftPanelState.confirmOpen = false;
        }
        renderDraftPanel();
    });
    draftSelectAllButton?.addEventListener("click", (event) => {
        event.preventDefault();
        toggleDraftSelectAll();
        renderDraftPanel();
    });
    draftDeleteButton?.addEventListener("click", (event) => {
        event.preventDefault();
        draftPanelState.confirmOpen = true;
        renderDraftPanel();
    });
    draftConfirmDeleteButton?.addEventListener("click", (event) => {
        event.preventDefault();
        deleteSelectedDrafts();
    });
    draftConfirmCancelButton?.addEventListener("click", (event) => {
        event.preventDefault();
        draftPanelState.confirmOpen = false;
        renderDraftPanel();
    });
    draftConfirmBackdrop?.addEventListener("click", (event) => {
        event.preventDefault();
        draftPanelState.confirmOpen = false;
        renderDraftPanel();
    });
    draftList?.addEventListener("click", (event) => {
        const item = event.target.closest(".draft-panel__item");
        if (!item) {
            return;
        }
        if (draftPanelState.isEditMode) {
            toggleDraftSelection(item);
            renderDraftPanel();
            return;
        }
        loadDraftIntoComposer(item);
    });

    replySubmitButton?.addEventListener("click", () => {
        if (!activeReplyTrigger || replySubmitButton.disabled) {
            return;
        }
        updateReplyCount(activeReplyTrigger);
        closeReplyModal({ skipConfirm: true });
    });

}

// 피드 카드 하단 액션 바를 제어한다.
// 사용 위치: 좋아요/북마크/공유 아이콘이 있는 `.tweet-action-bar`.
// 주요 역할: 좋아요/북마크 토글, 공유 드롭다운/공유 모달, 채팅 공유, 링크 복사.
function setupTweetActions() {
    const layersRoot = document.getElementById("layers");
    // 공유 드롭다운은 `main.html`의 `#mainShareDropdown`을 `#layers`에서 재사용한다.
    const shareDropdown = document.getElementById("mainShareDropdown");
    const shareDropdownMenu = document.getElementById("mainShareDropdownMenu");
    // 공유 바텀시트/토스트는 body 하단의 고정 노드만 토글한다.
    const shareToast = document.getElementById("mainShareToast");
    const shareChatSheet = document.getElementById("mainShareChatSheet");
    const shareChatSearch = document.getElementById("mainShareChatSearch");
    const shareChatUserList = document.getElementById("mainShareChatUserList");
    const shareBookmarkSheet = document.getElementById("mainShareBookmarkSheet");
    const shareBookmarkFolder = document.getElementById(
        "mainShareBookmarkFolder",
    );
    const shareBookmarkCheck = document.getElementById(
        "mainShareBookmarkCheck",
    );
    const shareBookmarkCreateFolder = document.getElementById(
        "mainShareBookmarkCreateFolder",
    );
    let activeShareButton = null;
    let activeShareToastTimer = null;
    let activeShareBookmarkButton = null;

    if (!layersRoot || !shareDropdown || !shareDropdownMenu) {
        return;
    }

    function getShareUsers() {
        const users = [];
        const seenHandles = new Set();

        document.querySelectorAll(".postCard").forEach((card, index) => {
            const handle =
                card.querySelector(".postHandle")?.textContent?.trim() || "";
            const name =
                card.querySelector(".postName")?.textContent?.trim() ||
                `사용자 ${index + 1}`;
            if (!handle || seenHandles.has(handle)) {
                return;
            }

            seenHandles.add(handle);
            const avatarImage = card.querySelector(".postAvatarImage");
            const avatarText =
                card.querySelector(".postAvatar")?.textContent?.trim() ||
                name.charAt(0) ||
                "?";

            users.push({
                id: `post-${card.dataset.postId || index}`,
                name,
                handle,
                avatar:
                    avatarImage?.getAttribute("src") ||
                    buildInitialAvatarDataUri(avatarText),
            });
        });

        document.querySelectorAll(".user-card").forEach((card, index) => {
            const handle =
                card.dataset.handle ||
                card.querySelector(".user-handle")?.textContent?.trim() ||
                "";
            const name =
                card.querySelector(".user-name")?.textContent?.trim() ||
                `추천 사용자 ${index + 1}`;
            if (!handle || seenHandles.has(handle)) {
                return;
            }

            seenHandles.add(handle);
            const avatarText =
                card.querySelector(".user-avatar")?.textContent?.trim() ||
                name.charAt(0) ||
                "?";

            users.push({
                id: `friend-${index}`,
                name,
                handle,
                avatar: buildInitialAvatarDataUri(avatarText),
            });
        });

        return users.slice(0, 20);
    }

    // 공유 메뉴 문구와 채팅 공유 타이틀은 클릭된 게시글의 메타 정보를 읽어서 만든다.
    function getSharePostMeta(button) {
        const postCard = button.closest(".postCard");
        const handle =
            postCard?.querySelector(".postHandle")?.textContent?.trim() ||
            "@user";
        const postId =
            postCard?.dataset.postId ||
            button.id.replace("sharePost", "") ||
            "1";
        const bookmarkButton =
            postCard?.querySelector(".tweet-action-btn--bookmark") ?? null;
        const permalink = `#post-${postId}`;

        return {
            handle,
            postCard,
            postId,
            permalink,
            bookmarkButton,
        };
    }

    function showShareToast(message) {
        showTimedToast({
            toastElement: shareToast,
            message,
            activeTimer: activeShareToastTimer,
            setActiveTimer(nextTimer) {
                activeShareToastTimer = nextTimer;
            },
        });
    }

    function setBookmarkButtonState(button, isActive) {
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
    }

    function closeShareModal() {
        if (shareChatSheet) {
            shareChatSheet.hidden = true;
        }
        if (shareBookmarkSheet) {
            shareBookmarkSheet.hidden = true;
        }
        document.body.classList.remove("modal-open");
        activeShareBookmarkButton = null;
    }

    // 공유 드롭다운은 더보기 드롭다운과 동시에 남지 않도록 공용 레이어 정리 대상에 포함된다.
    function closeShareDropdown() {
        if (shareDropdown.hidden) {
            return;
        }
        shareDropdown.hidden = true;
        if (activeShareButton) {
            activeShareButton.setAttribute("aria-expanded", "false");
            activeShareButton = null;
        }
    }

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

    function getShareUserRows(users) {
        if (users.length === 0) {
            return '<div class="share-sheet__empty"><p>전송할 수 있는 사용자가 없습니다.</p></div>';
        }

        return users.map(buildShareUserRowMarkup).join("");
    }

    function buildShareUserRowMarkup(user) {
        return `
            <button type="button" class="share-sheet__user" data-share-user-id="${escapeHtml(user.id)}" data-share-user-name="${escapeHtml(user.name)}">
                <span class="share-sheet__user-avatar">
                    <img src="${escapeHtml(user.avatar)}" alt="${escapeHtml(user.name)}" />
                </span>
                <span class="share-sheet__user-body">
                    <span class="share-sheet__user-name">${escapeHtml(user.name)}</span>
                    <span class="share-sheet__user-handle">${escapeHtml(user.handle)}</span>
                </span>
            </button>
        `;
    }

    function filterShareUsers(users, query) {
        const normalizedQuery = String(query || "")
            .trim()
            .toLowerCase();
        if (!normalizedQuery) {
            return users;
        }

        return users.filter((user) => {
            return (
                user.name.toLowerCase().includes(normalizedQuery) ||
                user.handle.toLowerCase().includes(normalizedQuery)
            );
        });
    }

    // 채팅 공유 사용자 목록은 고정 시트 내부 `#mainShareChatUserList`만 다시 그린다.
    function renderShareUsers(users) {
        if (!shareChatUserList) {
            return;
        }
        shareChatUserList.innerHTML = getShareUserRows(users);
    }

    function openShareChatModal(button) {
        closeShareDropdown();
        closeShareModal();

        const users = getShareUsers();
        renderShareUsers(users);
        if (shareChatSearch) {
            shareChatSearch.value = "";
            shareChatSearch.oninput = () => {
                renderShareUsers(filterShareUsers(users, shareChatSearch.value));
            };
        }
        if (shareChatSheet) {
            shareChatSheet.hidden = false;
        }
        document.body.classList.add("modal-open");
    }

    function openShareBookmarkModal(button) {
        const { bookmarkButton } = getSharePostMeta(button);
        closeShareDropdown();
        closeShareModal();

        const isBookmarked =
            bookmarkButton?.classList.contains("active") ?? false;
        activeShareBookmarkButton = bookmarkButton;
        shareBookmarkCheck?.classList.toggle(
            "share-sheet__folder-check--active",
            isBookmarked,
        );
        if (shareBookmarkSheet) {
            shareBookmarkSheet.hidden = false;
        }
        document.body.classList.add("modal-open");
    }

    function handleShareDropdownAction(actionButton) {
        if (!actionButton || !activeShareButton) {
            return;
        }

        const action = actionButton.getAttribute("data-share-action");
        if (action === "copy") {
            copyShareLink(activeShareButton);
            return;
        }
        if (action === "chat") {
            openShareChatModal(activeShareButton);
            return;
        }
        if (action === "bookmark") {
            openShareBookmarkModal(activeShareButton);
        }
    }

    // 공유 드롭다운은 클릭된 버튼 근처 fixed 위치에 띄우고, 다른 포스트 액션 메뉴는 먼저 닫는다.
    function openShareDropdown(button) {
        if (!layersRoot) {
            return;
        }

        document.dispatchEvent(
            new CustomEvent("main:close-post-action-layers"),
        );

        closeShareDropdown();
        const rect = button.getBoundingClientRect();
        shareDropdownMenu.style.top = `${rect.bottom + window.scrollY + 8}px`;
        shareDropdownMenu.style.right = `${Math.max(6, window.innerWidth - rect.right - 10)}px`;
        shareDropdown.hidden = false;
        activeShareButton = button;
        activeShareButton.setAttribute("aria-expanded", "true");
    }

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

    shareDropdown.addEventListener("click", (event) => {
        if (event.target.closest("[data-share-dropdown-close='true']")) {
            closeShareDropdown();
            return;
        }

        const actionButton = event.target.closest(".share-menu-item");
        if (!actionButton) {
            return;
        }

        event.preventDefault();
        event.stopPropagation();
        handleShareDropdownAction(actionButton);
    });

    shareChatSheet?.addEventListener("click", (event) => {
        if (event.target.closest("[data-share-chat-close='true']")) {
            event.preventDefault();
            closeShareModal();
            return;
        }

        const userButton = event.target.closest(".share-sheet__user");
        if (!userButton) {
            return;
        }

        event.preventDefault();
        closeShareModal();
        showShareToast(
            `${userButton.getAttribute("data-share-user-name") || "선택한 사용자"}에게 전송함`,
        );
    });

    shareBookmarkSheet?.addEventListener("click", (event) => {
        if (event.target.closest("[data-share-bookmark-close='true']")) {
            event.preventDefault();
            closeShareModal();
            return;
        }

        if (event.target === shareBookmarkCreateFolder) {
            event.preventDefault();
            closeShareModal();
            showShareToast("새 북마크 폴더 만들기는 준비 중입니다");
            return;
        }

        if (
            event.target.closest("[data-share-folder='all-bookmarks']") &&
            activeShareBookmarkButton
        ) {
            event.preventDefault();
            setBookmarkButtonState(
                activeShareBookmarkButton,
                !activeShareBookmarkButton.classList.contains("active"),
            );
            closeShareModal();
        }
    });

    document.addEventListener("click", (event) => {
        if (
            !shareDropdown.hidden &&
            !shareDropdown.contains(event.target) &&
            !activeShareButton?.contains(event.target)
        ) {
            closeShareDropdown();
        }
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            closeShareModal();
            closeShareDropdown();
        }
    });

    document.addEventListener("main:close-post-action-layers", () => {
        closeShareModal();
        closeShareDropdown();
    });
}

// 긴 게시글 본문은 피드에서 기본 높이를 유지하기 위해 접기/펼치기 버튼을 동적으로 붙인다.
// 버튼과 텍스트 span은 각 `.postText` 내부에 append 되고, 펼친 뒤 버튼만 remove 된다.
function setupExpandablePostText() {
    const maxLength = 200;

    document.querySelectorAll(".postText").forEach((element, index) => {
        const { fullText, isExpandable, truncatedText } =
            getCollapsedPostTextState(element.textContent, maxLength);
        if (!isExpandable) {
            return;
        }

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

// 피드 카드 안 미디어를 눌렀을 때 전체 미리보기 오버레이를 여는 기능이다.
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

    document.querySelectorAll("img.postMediaImage").forEach((image) => {
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
