document.addEventListener("DOMContentLoaded", () => {
    // ===== 카테고리 스크롤 (탐색 탭) =====
    const scrollEl = document.getElementById("categoryScroll");
    const btnLeft  = document.getElementById("scrollLeft");
    const btnRight = document.getElementById("scrollRight");
    const initialMarkup = scrollEl?.innerHTML ?? "";

    const syncArrows = () => {
        if (!scrollEl || !btnLeft || !btnRight) return;
        btnLeft.style.display  = scrollEl.scrollLeft > 0 ? "flex" : "none";
        btnRight.style.display = scrollEl.scrollLeft < scrollEl.scrollWidth - scrollEl.clientWidth - 1 ? "flex" : "none";
    };

    const restoreCategories = () => {
        if (!scrollEl) return;
        scrollEl.innerHTML = initialMarkup;
        scrollEl.scrollLeft = 0;
        setTimeout(syncArrows, 30);
    };

    const renderSubCategories = (label, subs) => {
        if (!scrollEl) return;
        scrollEl.innerHTML =
            `<button class="cat-back-btn" type="button" aria-label="대카테고리로 돌아가기"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" transform="rotate(270 12 12)"></path></svg></button>` +
            `<button class="cat-chip parent-highlight" type="button">${label}</button>` +
            subs.map(s => `<button class="cat-chip" type="button" data-cat="${s}" data-is-sub="true">${s}</button>`).join("");
        scrollEl.scrollLeft = 0;
        setTimeout(syncArrows, 30);
    };

    const setActiveChip = (chip) => {
        scrollEl?.querySelectorAll(".cat-chip:not(.parent-highlight)").forEach(c => c.classList.remove("active", "sub-active"));
        chip.classList.add(chip.dataset.isSub ? "sub-active" : "active");
    };

    document.querySelector(".communityTopbar .communityIconButton")?.addEventListener("click", () => history.back());

    // ===== 새 커뮤니티 만들기 모달 =====
    const createCommunityModal   = document.querySelector("[data-create-community-modal]");
    const communityNameInput     = createCommunityModal?.querySelector("[data-community-name]");
    const communityNameCount     = createCommunityModal?.querySelector("[data-community-name-count]");
    const communitySubmitBtn     = createCommunityModal?.querySelector("[data-community-submit]");

    function openCreateCommunityModal() {
        if (!createCommunityModal) return;
        createCommunityModal.hidden = false;
        document.body.classList.add("modal-open");
        communityNameInput?.focus();
    }

    function closeCreateCommunityModal() {
        if (!createCommunityModal) return;
        createCommunityModal.hidden = true;
        document.body.classList.remove("modal-open");
        if (communityNameInput) communityNameInput.value = "";
        if (communityNameCount) communityNameCount.textContent = "0";
        if (communitySubmitBtn) communitySubmitBtn.disabled = true;
        createCommunityModal.querySelector("input[name='communityType']")?.click();
    }

    communityNameInput?.addEventListener("input", () => {
        const val = communityNameInput.value;
        if (communityNameCount) communityNameCount.textContent = val.length;
        if (communitySubmitBtn) communitySubmitBtn.disabled = val.length < 3 || /[#@]/.test(val);
    });

    createCommunityModal?.addEventListener("click", (e) => {
        if (e.target.closest("[data-community-close]")) { closeCreateCommunityModal(); return; }
        if (e.target.closest("[data-community-submit]") && !communitySubmitBtn?.disabled) { closeCreateCommunityModal(); }
    });

    document.querySelector("[data-create-community-btn]")?.addEventListener("click", openCreateCommunityModal);

    scrollEl?.addEventListener("click", (e) => {
        if (e.target.closest(".cat-back-btn")) { restoreCategories(); return; }
        const chip = e.target.closest(".cat-chip");
        if (!chip) return;
        chip.classList.contains("has-subs")
            ? renderSubCategories(chip.dataset.cat ?? "", (chip.dataset.subs ?? "").split(",").filter(Boolean))
            : setActiveChip(chip);
    });
    scrollEl?.addEventListener("scroll", syncArrows, { passive: true });
    btnLeft?.addEventListener("click",  () => scrollEl?.scrollBy({ left: -220, behavior: "smooth" }));
    btnRight?.addEventListener("click", () => scrollEl?.scrollBy({ left:  220, behavior: "smooth" }));
    window.addEventListener("resize", syncArrows);
    syncArrows();

    // ===== Toast =====
    const showToast = (msg) => {
        const el = Object.assign(document.createElement("div"), { className: "postToast", textContent: msg });
        document.body.appendChild(el);
        setTimeout(() => el.remove(), 2200);
    };

    // ===== 답글 모달 DOM =====
    const replyModalOverlay = document.querySelector("[data-reply-modal]");
    const q    = (sel) => replyModalOverlay?.querySelector(sel);
    const qAll = (sel) => replyModalOverlay?.querySelectorAll(sel) ?? [];

    const replyModal               = q(".tweet-modal");
    const replyCloseButton         = q(".tweet-modal__close");
    const replyEditor              = q(".tweet-modal__editor");
    const replySubmitButton        = q(".tweet-modal__submit");
    const replyGauge               = q("#replyGauge");
    const replyGaugeText           = q("#replyGaugeText");
    const replyProductButton       = q("[data-testid='productSelectButton']");
    const replyProductView         = q("[data-product-select-modal]");
    const productSelectClose       = replyProductView?.querySelector("[data-product-select-close]");
    const productSelectList        = replyProductView?.querySelector("[data-product-select-list]");
    const productSelectComplete    = replyProductView?.querySelector("[data-product-select-complete]");
    const productSelectEmpty       = replyProductView?.querySelector("[data-product-empty]");
    const replyContextButton       = q(".tweet-modal__context-button");
    const replyFooterMeta          = q(".tweet-modal__footer-meta");
    const replySourceAvatar        = q(".tweet-modal__source-avatar");
    const replySourceName          = q(".tweet-modal__source-name");
    const replySourceHandle        = q(".tweet-modal__source-handle");
    const replySourceTime          = q(".tweet-modal__source-time");
    const replySourceText          = q(".tweet-modal__source-text");
    const replyFormatButtons       = qAll("[data-format]");
    const replyEmojiButton         = q("[data-testid='emojiButton']");
    const replyMediaUploadButton   = q("[data-testid='mediaUploadButton']");
    const replyFileInput           = q("[data-testid='fileInput']");
    const replyAttachmentPreview   = q("[data-attachment-preview]");
    const replyAttachmentMedia     = q("[data-attachment-media]");
    const composeView              = q(".tweet-modal__compose-view");
    const replyGeoButton           = q("[data-testid='geoButton']");
    const replyGeoButtonPath       = replyGeoButton?.querySelector("path");
    const replyLocationDisplayButton = q("[data-location-display]");
    const replyLocationName        = q("[data-location-name]");
    const replyLocationView        = q(".tweet-modal__location-view");
    const replyLocationCloseButton = q(".tweet-modal__location-close");
    const replyLocationDeleteButton   = q("[data-location-delete]");
    const replyLocationCompleteButton = q("[data-location-complete]");
    const replyLocationSearchInput = q("[data-location-search]");
    const replyLocationList        = q("[data-location-list]");
    const replyUserTagTrigger      = q("[data-user-tag-trigger]");
    const replyUserTagLabel        = q("[data-user-tag-label]");
    const replyTagView             = q(".tweet-modal__tag-view");
    const replyTagCloseButton      = q("[data-testid='tag-back']");
    const replyTagCompleteButton   = q("[data-tag-complete]");
    const replyTagSearchForm       = q("[data-tag-search-form]");
    const replyTagSearchInput      = q("[data-tag-search]");
    const replyTagChipList         = q("[data-tag-chip-list]");
    const replyTagResults          = q("[data-tag-results]");
    const replyMediaAltTrigger     = q("[data-media-alt-trigger]");
    const replyMediaAltLabel       = q("[data-media-alt-label]");
    const replyMediaView           = q(".tweet-modal__media-view");
    const replyMediaBackButton     = q("[data-testid='media-back']");
    const replyMediaPrevButton     = q("[data-media-prev]");
    const replyMediaNextButton     = q("[data-media-next]");
    const replyMediaSaveButton     = q("[data-media-save]");
    const replyMediaTitle          = q("[data-media-title]");
    const replyMediaPreviewImages  = qAll("[data-media-preview-image]");
    const replyMediaAltInput       = q("[data-media-alt-input]");
    const replyMediaAltCount       = q("[data-media-alt-count]");

    // ===== State =====
    let activeReplyTrigger = null;
    let savedReplySelection = null, savedReplySelectionOffsets = null;
    let selectedLocation = null, pendingLocation = null;
    let selectedTaggedUsers = [], pendingTaggedUsers = [];
    let replyMediaEdits = [], pendingReplyMediaEdits = [], activeReplyMediaIndex = 0;
    let attachedReplyFiles = [], attachedReplyFileUrls = [];
    let pendingAttachmentEditIndex = null, currentTagResults = [], cachedLocationNames = [];
    let replyEmojiLibraryPicker = null;
    const pendingFormats = new Set();
    let shouldRestoreReplyEditorAfterEmojiInsert = false, isInsertingReplyEmoji = false;
    let activeMoreButton = null, activeMoreDropdown = null;
    let activeShareButton = null, activeShareDropdown = null;
    let activeShareModal = null, activeShareToast = null;
    let activeCommunityModal = null, activeCommunityToast = null;
    const layersRoot = document.getElementById("layers");
    const communityFollowState = new Map();
    let selectedProduct = null;

    const maxReplyImages = 4, maxReplyMediaAltLength = 1000, replyMaxLength = 500;

    // ===== Config =====
    const emojiRecentsKey = "community_reply_recent_emojis";
    const maxRecentEmojis = 18;

    const formatButtonLabels = {
        bold:   { inactive: "굵게, (CTRL+B) 님",           active: "굵게, 활성 상태, (CTRL+B) 님 님" },
        italic: { inactive: "기울임꼴, (CTRL+I) 님",       active: "기울임꼴, 활성 상태, (CTRL+I) 님 님" },
    };

    const communityReportReasons = [
        "다른 회사 제품 도용 신고",
        "실제 존재하지 않는 제품 등록 신고",
        "스펙·원산지 허위 표기 신고",
        "특허 제품 무단 판매 신고",
        "수출입 제한 품목 신고",
        "반복적인 동일 게시물 신고",
    ];


    // ===== Utils =====
    function getTextContent(el) { return el?.textContent.trim() ?? ""; }

    function escapeHtml(value) {
        return String(value).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] ?? c);
    }

    function getRecentEmojis() {
        try { const p = JSON.parse(window.localStorage.getItem(emojiRecentsKey) ?? "[]"); return Array.isArray(p) ? p : []; } catch { return []; }
    }
    function saveRecentEmoji(emoji) {
        const recent = getRecentEmojis().filter(i => i !== emoji); recent.unshift(emoji);
        try { window.localStorage.setItem(emojiRecentsKey, JSON.stringify(recent.slice(0, maxRecentEmojis))); } catch { return; }
    }

    // ===== User Tags =====
    function cloneTaggedUsers(users) { return users.map(u => ({ ...u })); }

    function getCurrentPageTagUsers() {
        const cards = document.querySelectorAll(".communityPostCard"), seen = new Set();
        return Array.from(cards).map((card, i) => {
            const name   = card.querySelector(".postName")?.textContent?.trim() ?? "";
            const handle = card.querySelector(".postHandle")?.textContent?.trim() ?? "";
            const avatar = card.querySelector(".postAvatar img")?.getAttribute("src") ?? "";
            if (!name || !handle || seen.has(handle)) return null;
            seen.add(handle);
            return { id: `${handle.replace("@", "") || "user"}-${i}`, name, handle, avatar };
        }).filter(Boolean);
    }

    function isTagModalOpen() { return Boolean(replyTagView && !replyTagView.hidden); }
    function getTagSearchTerm() { return replyTagSearchInput?.value.trim() ?? ""; }
    function getTaggedUserSummary(users) { return users.length === 0 ? "사용자 태그하기" : users.map(u => u.name).join(", "); }

    function syncUserTagTrigger() {
        const can = isReplyImageSet(), label = getTaggedUserSummary(selectedTaggedUsers);
        if (replyUserTagTrigger) { replyUserTagTrigger.hidden = !can; replyUserTagTrigger.disabled = !can; replyUserTagTrigger.setAttribute("aria-label", label); }
        if (replyUserTagLabel) replyUserTagLabel.textContent = label;
        if (!can && isTagModalOpen()) closeTagPanel({ restoreFocus: false });
    }

    function renderTagChipList() {
        if (!replyTagChipList) return;
        if (pendingTaggedUsers.length === 0) { replyTagChipList.innerHTML = ""; return; }
        replyTagChipList.innerHTML = pendingTaggedUsers.map(u => {
            const av = u.avatar ? `<span class="tweet-modal__tag-chip-avatar"><img src="${escapeHtml(u.avatar)}" alt="${escapeHtml(u.name)}" /></span>` : '<span class="tweet-modal__tag-chip-avatar"></span>';
            return `<button type="button" class="tweet-modal__tag-chip" data-tag-remove-id="${escapeHtml(u.id)}">${av}<span class="tweet-modal__tag-chip-name">${escapeHtml(u.name)}</span><svg viewBox="0 0 24 24" aria-hidden="true" class="tweet-modal__tag-chip-icon"><g><path d="M10.59 12 4.54 5.96l1.42-1.42L12 10.59l6.04-6.05 1.42 1.42L13.41 12l6.05 6.04-1.42 1.42L12 13.41l-6.04 6.05-1.42-1.42L10.59 12z"></path></g></svg></button>`;
        }).join("");
    }

    function getFilteredTagUsers(query) {
        const nq = query.trim().toLowerCase();
        if (!nq) return [];
        return getCurrentPageTagUsers().filter(u => `${u.name} ${u.handle}`.toLowerCase().includes(nq)).slice(0, 6);
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
        replyTagSearchInput.setAttribute("aria-controls", "community-tag-results");
        replyTagResults.setAttribute("role", "listbox");
        replyTagResults.id = "community-tag-results";
        if (users.length === 0) { replyTagResults.innerHTML = '<p class="tweet-modal__tag-empty">일치하는 사용자를 찾지 못했습니다.</p>'; return; }
        replyTagResults.innerHTML = users.map(u => {
            const sel = pendingTaggedUsers.some(t => t.id === u.id), sub = sel ? `${u.handle} 이미 태그됨` : u.handle;
            const av = u.avatar ? `<span class="tweet-modal__tag-avatar"><img src="${escapeHtml(u.avatar)}" alt="${escapeHtml(u.name)}" /></span>` : '<span class="tweet-modal__tag-avatar"></span>';
            return `<div role="option" class="tweet-modal__tag-option" data-testid="typeaheadResult"><div role="checkbox" aria-checked="${sel}" aria-disabled="${sel}" class="tweet-modal__tag-checkbox"><button type="button" class="tweet-modal__tag-user" data-tag-user-id="${escapeHtml(u.id)}" ${sel ? "disabled" : ""}>${av}<span class="tweet-modal__tag-user-body"><span class="tweet-modal__tag-user-name">${escapeHtml(u.name)}</span><span class="tweet-modal__tag-user-handle">${escapeHtml(sub)}</span></span></button></div></div>`;
        }).join("");
    }

    function runTagSearch() { const tq = getTagSearchTerm(); renderTagResults(tq ? getFilteredTagUsers(tq) : []); }

    function openTagPanel() {
        if (!composeView || !replyTagView || !isReplyImageSet()) return;
        closeEmojiPicker();
        pendingTaggedUsers = cloneTaggedUsers(selectedTaggedUsers);
        composeView.hidden = true; replyTagView.hidden = false;
        if (replyTagSearchInput) replyTagSearchInput.value = "";
        renderTagChipList(); renderTagResults([]);
        window.requestAnimationFrame(() => replyTagSearchInput?.focus());
    }

    function closeTagPanel({ restoreFocus = true } = {}) {
        if (!composeView || !replyTagView || replyTagView.hidden) return;
        replyTagView.hidden = true; composeView.hidden = false;
        pendingTaggedUsers = cloneTaggedUsers(selectedTaggedUsers);
        if (replyTagSearchInput) replyTagSearchInput.value = "";
        renderTagChipList(); renderTagResults([]);
        if (restoreFocus) window.requestAnimationFrame(() => { replyUserTagTrigger && !replyUserTagTrigger.hidden ? replyUserTagTrigger.focus() : replyEditor?.focus(); });
    }

    function applyPendingTaggedUsers() { selectedTaggedUsers = cloneTaggedUsers(pendingTaggedUsers); syncUserTagTrigger(); }

    function resetTaggedUsers() {
        selectedTaggedUsers = []; pendingTaggedUsers = [];
        if (replyTagSearchInput) replyTagSearchInput.value = "";
        renderTagChipList(); renderTagResults([]); syncUserTagTrigger();
    }

    // ===== Media Alt Editor =====
    function createDefaultReplyMediaEdit() { return { alt: "" }; }
    function cloneReplyMediaEdits(edits) { return edits.map(e => ({ alt: e.alt })); }
    function isMediaEditorOpen() { return Boolean(replyMediaView && !replyMediaView.hidden); }
    function getReplyMediaTriggerLabel() { return replyMediaEdits.some(e => e.alt.trim().length > 0) ? "설명 수정" : "설명 추가"; }

    function syncReplyMediaEditsToAttachments() {
        if (!isReplyImageSet()) {
            replyMediaEdits = []; pendingReplyMediaEdits = []; activeReplyMediaIndex = 0; syncMediaAltTrigger(); return;
        }
        replyMediaEdits = attachedReplyFiles.map((_, i) => { const ex = replyMediaEdits[i]; return ex ? { alt: ex.alt ?? "" } : createDefaultReplyMediaEdit(); });
        if (pendingReplyMediaEdits.length !== replyMediaEdits.length) pendingReplyMediaEdits = cloneReplyMediaEdits(replyMediaEdits);
        activeReplyMediaIndex = Math.min(activeReplyMediaIndex, Math.max(replyMediaEdits.length - 1, 0));
        syncMediaAltTrigger();
    }

    function getCurrentReplyMediaUrl() { return attachedReplyFileUrls[activeReplyMediaIndex] ?? ""; }
    function getReplyMediaImageAlt(index) { return replyMediaEdits[index]?.alt ?? ""; }
    function getCurrentPendingReplyMediaEdit() { return pendingReplyMediaEdits[activeReplyMediaIndex] ?? createDefaultReplyMediaEdit(); }

    function syncMediaAltTrigger() {
        const can = isReplyImageSet(), label = getReplyMediaTriggerLabel();
        if (replyMediaAltTrigger) { replyMediaAltTrigger.hidden = !can; replyMediaAltTrigger.disabled = !can; replyMediaAltTrigger.setAttribute("aria-label", label); }
        if (replyMediaAltLabel) replyMediaAltLabel.textContent = label;
        if (!can && isMediaEditorOpen()) closeMediaEditor({ restoreFocus: false, discardChanges: true });
    }

    function renderMediaEditor() {
        if (!replyMediaView || pendingReplyMediaEdits.length === 0) return;
        const edit = getCurrentPendingReplyMediaEdit(), url = getCurrentReplyMediaUrl(), alt = edit.alt ?? "";
        if (replyMediaTitle) replyMediaTitle.textContent = "이미지 설명 수정";
        if (replyMediaPrevButton) replyMediaPrevButton.disabled = activeReplyMediaIndex === 0;
        if (replyMediaNextButton) replyMediaNextButton.disabled = activeReplyMediaIndex >= pendingReplyMediaEdits.length - 1;
        replyMediaPreviewImages.forEach(img => { img.src = url; img.alt = alt; img.style.transform = ""; });
        if (replyMediaAltInput) replyMediaAltInput.value = alt;
        if (replyMediaAltCount) replyMediaAltCount.textContent = `${alt.length} / ${maxReplyMediaAltLength.toLocaleString()}`;
    }

    function openMediaEditor() {
        if (!composeView || !replyMediaView || !isReplyImageSet()) return;
        closeEmojiPicker();
        pendingReplyMediaEdits = cloneReplyMediaEdits(replyMediaEdits); activeReplyMediaIndex = 0;
        composeView.hidden = true; replyMediaView.hidden = false;
        renderMediaEditor();
        window.requestAnimationFrame(() => replyMediaAltInput?.focus());
    }

    function closeMediaEditor({ restoreFocus = true, discardChanges = true } = {}) {
        if (!composeView || !replyMediaView || replyMediaView.hidden) return;
        if (discardChanges) pendingReplyMediaEdits = cloneReplyMediaEdits(replyMediaEdits);
        replyMediaView.hidden = true; composeView.hidden = false;
        if (restoreFocus) window.requestAnimationFrame(() => { replyMediaAltTrigger && !replyMediaAltTrigger.hidden ? replyMediaAltTrigger.focus() : replyEditor?.focus(); });
    }

    function saveReplyMediaEdits() { replyMediaEdits = cloneReplyMediaEdits(pendingReplyMediaEdits); renderReplyAttachment(); syncMediaAltTrigger(); closeMediaEditor({ discardChanges: false }); }

    // ===== Location =====
    function isLocationModalOpen() { return Boolean(replyLocationView && !replyLocationView.hidden); }
    function getLocationSearchTerm() { return replyLocationSearchInput?.value.trim() ?? ""; }

    function getFilteredLocations() {
        const term = getLocationSearchTerm();
        if (cachedLocationNames.length === 0 && replyLocationList) {
            cachedLocationNames = Array.from(replyLocationList.querySelectorAll(".tweet-modal__location-item-label")).map(i => getTextContent(i)).filter(Boolean);
        }
        return term ? cachedLocationNames.filter(l => l.includes(term)) : cachedLocationNames;
    }

    function syncLocationUI() {
        const has = Boolean(selectedLocation);
        if (replyFooterMeta) replyFooterMeta.hidden = !has;
        if (replyLocationName) replyLocationName.textContent = selectedLocation ?? "";
        if (replyLocationDisplayButton) { replyLocationDisplayButton.hidden = !has; replyLocationDisplayButton.setAttribute("aria-label", has ? `위치 ${selectedLocation}` : "위치 태그하기"); }
        if (replyGeoButton) { replyGeoButton.hidden = false; replyGeoButton.setAttribute("aria-label", has ? `위치 태그하기, ${selectedLocation}` : "위치 태그하기"); }
        if (replyGeoButtonPath) { const np = has ? replyGeoButtonPath.dataset.pathActive : replyGeoButtonPath.dataset.pathInactive; if (np) replyGeoButtonPath.setAttribute("d", np); }
        if (replyLocationDeleteButton) replyLocationDeleteButton.hidden = !has;
        if (replyLocationCompleteButton) replyLocationCompleteButton.disabled = !pendingLocation;
    }

    function renderLocationList() {
        if (!replyLocationList) return;
        const locs = getFilteredLocations();
        if (locs.length === 0) { replyLocationList.innerHTML = '<p class="tweet-modal__location-empty">일치하는 위치를 찾지 못했습니다.</p>'; return; }
        replyLocationList.innerHTML = locs.map(loc => {
            const sel = pendingLocation === loc;
            return `<button type="button" class="tweet-modal__location-item" role="menuitem"><span class="tweet-modal__location-item-label">${loc}</span><span class="tweet-modal__location-item-check">${sel ? '<svg viewBox="0 0 24 24" aria-hidden="true"><g><path d="M9.64 18.952l-5.55-4.861 1.317-1.504 3.951 3.459 8.459-10.948L19.4 6.32 9.64 18.952z"></path></g></svg>' : ""}</span></button>`;
        }).join("");
    }

    function openLocationPanel() {
        if (!composeView || !replyLocationView) return;
        closeEmojiPicker(); pendingLocation = selectedLocation;
        composeView.hidden = true; replyLocationView.hidden = false;
        if (replyLocationSearchInput) replyLocationSearchInput.value = "";
        renderLocationList(); syncLocationUI();
        window.requestAnimationFrame(() => replyLocationSearchInput?.focus());
    }

    function closeLocationPanel({ restoreFocus = true } = {}) {
        if (!composeView || !replyLocationView || replyLocationView.hidden) return;
        replyLocationView.hidden = true; composeView.hidden = false;
        if (replyLocationSearchInput) replyLocationSearchInput.value = "";
        pendingLocation = selectedLocation; renderLocationList(); syncLocationUI();
        if (restoreFocus) window.requestAnimationFrame(() => replyEditor?.focus());
    }

    function applyLocation(loc) { selectedLocation = loc; pendingLocation = loc; syncLocationUI(); }

    function resetLocationState() {
        selectedLocation = null; pendingLocation = null;
        if (replyLocationSearchInput) replyLocationSearchInput.value = "";
        renderLocationList(); syncLocationUI();
    }

    // ===== Attachments =====
    function hasReplyAttachment() { return attachedReplyFiles.length > 0; }
    function clearAttachedReplyFileUrls() { if (attachedReplyFileUrls.length === 0) return; attachedReplyFileUrls.forEach(u => URL.revokeObjectURL(u)); attachedReplyFileUrls = []; }
    function isReplyImageSet() { return attachedReplyFiles.length > 0 && attachedReplyFiles.every(f => f.type.startsWith("image/")); }
    function isReplyVideoSet() { return attachedReplyFiles.length === 1 && attachedReplyFiles[0].type.startsWith("video/"); }

    function resetReplyAttachment() {
        clearAttachedReplyFileUrls(); attachedReplyFiles = []; pendingAttachmentEditIndex = null;
        resetTaggedUsers(); syncReplyMediaEditsToAttachments();
        if (replyFileInput) replyFileInput.value = "";
        if (replyAttachmentMedia) replyAttachmentMedia.innerHTML = "";
        if (replyAttachmentPreview) replyAttachmentPreview.hidden = true;
    }

    function createReplyAttachmentUrls() { clearAttachedReplyFileUrls(); attachedReplyFileUrls = attachedReplyFiles.map(f => URL.createObjectURL(f)); }

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
        if (attachedReplyFiles.length === 0) { replyAttachmentMedia.innerHTML = ""; replyAttachmentPreview.hidden = true; resetTaggedUsers(); syncReplyMediaEditsToAttachments(); return; }
        replyAttachmentPreview.hidden = false;
        createReplyAttachmentUrls();
        if (isReplyImageSet()) { syncReplyMediaEditsToAttachments(); syncUserTagTrigger(); renderReplyImageGrid(); return; }
        if (isReplyVideoSet()) { resetTaggedUsers(); syncReplyMediaEditsToAttachments(); renderReplyVideoAttachment(); return; }
        resetTaggedUsers(); syncReplyMediaEditsToAttachments();
        replyAttachmentMedia.innerHTML = "";
        const fp = document.createElement("div");
        const fi = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        const fg = document.createElementNS("http://www.w3.org/2000/svg", "g");
        const fpath = document.createElementNS("http://www.w3.org/2000/svg", "path");
        const fn = document.createElement("span");
        fp.className = "tweet-modal__attachment-file";
        fi.setAttribute("viewBox", "0 0 24 24"); fi.setAttribute("width", "22"); fi.setAttribute("height", "22"); fi.setAttribute("aria-hidden", "true");
        fpath.setAttribute("d", "M14 2H7.75C5.68 2 4 3.68 4 5.75v12.5C4 20.32 5.68 22 7.75 22h8.5C18.32 22 20 20.32 20 18.25V8l-6-6zm0 2.12L17.88 8H14V4.12zm2.25 15.88h-8.5c-.97 0-1.75-.78-1.75-1.75V5.75C6 4.78 6.78 4 7.75 4H12v5.25c0 .41.34.75.75.75H18v8.25c0 .97-.78 1.75-1.75 1.75z");
        fn.className = "tweet-modal__attachment-file-name"; fn.textContent = attachedReplyFiles[0]?.name ?? "";
        fg.appendChild(fpath); fi.appendChild(fg); fp.appendChild(fi); fp.appendChild(fn);
        replyAttachmentMedia.appendChild(fp);
    }

    function removeReplyAttachment(index) { attachedReplyFiles = attachedReplyFiles.filter((_, i) => i !== index); pendingAttachmentEditIndex = null; renderReplyAttachment(); }

    function handleReplyFileChange(e) {
        const next = Array.from(e.target.files ?? []);
        if (next.length === 0) { pendingAttachmentEditIndex = null; syncReplySubmitState(); return; }
        const rep = next[0], vid = next.find(f => f.type.startsWith("video/")), imgs = next.filter(f => f.type.startsWith("image/"));
        if (pendingAttachmentEditIndex !== null) {
            if (!rep) { pendingAttachmentEditIndex = null; return; }
            if (rep.type.startsWith("video/")) { attachedReplyFiles = [rep]; }
            else { const ed = isReplyVideoSet() ? [] : [...attachedReplyFiles]; attachedReplyFiles = ed.length === 0 ? [rep] : ((ed[pendingAttachmentEditIndex] = rep), ed.slice(0, maxReplyImages)); }
            pendingAttachmentEditIndex = null; renderReplyAttachment(); syncReplySubmitState(); return;
        }
        if (vid) { attachedReplyFiles = [vid]; renderReplyAttachment(); syncReplySubmitState(); return; }
        if (imgs.length > 0) { attachedReplyFiles = [...(isReplyImageSet() ? [...attachedReplyFiles] : []), ...imgs].slice(0, maxReplyImages); renderReplyAttachment(); syncReplySubmitState(); return; }
        attachedReplyFiles = [rep]; renderReplyAttachment(); syncReplySubmitState();
    }

    // ===== Format / Selection =====
    function hasReplyEditorText() { return replyEditor ? replyEditor.textContent.replace(/\u00a0/g, " ").trim().length > 0 : false; }
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
        const pre = range.cloneRange(); pre.selectNodeContents(replyEditor); pre.setEnd(range.startContainer, range.startOffset);
        const start = pre.toString().length;
        return { start, end: start + range.toString().length };
    }

    function resolveReplySelectionPosition(targetOffset) {
        if (!replyEditor) return null;
        const walker = document.createTreeWalker(replyEditor, NodeFilter.SHOW_TEXT);
        let node = walker.nextNode(), remaining = Math.max(0, targetOffset), lastTextNode = null;
        while (node) {
            lastTextNode = node; const length = node.textContent?.length ?? 0;
            if (remaining <= length) return { node, offset: remaining };
            remaining -= length; node = walker.nextNode();
        }
        if (lastTextNode) return { node: lastTextNode, offset: lastTextNode.textContent?.length ?? 0 };
        return { node: replyEditor, offset: replyEditor.childNodes.length };
    }

    function buildReplySelectionRangeFromOffsets(offsets) {
        if (!replyEditor || !offsets) return null;
        const startPos = resolveReplySelectionPosition(offsets.start), endPos = resolveReplySelectionPosition(offsets.end);
        if (!startPos || !endPos) return null;
        const range = document.createRange(); range.setStart(startPos.node, startPos.offset); range.setEnd(endPos.node, endPos.offset);
        return range;
    }

    function restoreReplySelection() {
        if (!replyEditor) return false;
        const sel = window.getSelection(); if (!sel) return false;
        const range = buildReplySelectionRangeFromOffsets(savedReplySelectionOffsets) ?? savedReplySelection;
        if (!range) return false;
        sel.removeAllRanges(); sel.addRange(range); return true;
    }

    // ===== Emoji =====
    function hasEmojiButtonLibrary() { return typeof window.EmojiButton === "function"; }

    function restoreReplyEditorAfterEmojiInsert() {
        if (!shouldRestoreReplyEditorAfterEmojiInsert || !replyEditor || replyModalOverlay?.hidden) return;
        shouldRestoreReplyEditorAfterEmojiInsert = false;
        window.requestAnimationFrame(() => {
            isInsertingReplyEmoji = true; replyEditor.focus(); isInsertingReplyEmoji = false;
            restoreReplySelection(); saveReplySelection(); syncReplyFormatButtons();
        });
    }

    function ensureReplyEmojiLibraryPicker() {
        if (!replyEmojiButton || !replyEditor || !hasEmojiButtonLibrary()) return null;
        if (replyEmojiLibraryPicker) return replyEmojiLibraryPicker;
        replyEmojiLibraryPicker = new window.EmojiButton({ position: "bottom-start", rootElement: replyModalOverlay ?? undefined, zIndex: 1400 });
        replyEmojiLibraryPicker.on("emoji", (selection) => {
            const emoji = typeof selection === "string" ? selection : selection?.emoji;
            if (!emoji) return;
            shouldRestoreReplyEditorAfterEmojiInsert = true; insertReplyEmoji(emoji); closeEmojiPicker(); restoreReplyEditorAfterEmojiInsert();
        });
        replyEmojiLibraryPicker.on("hidden", () => {
            replyEmojiButton?.setAttribute("aria-expanded", "false");
            if (shouldRestoreReplyEditorAfterEmojiInsert) { restoreReplyEditorAfterEmojiInsert(); return; }
            saveReplySelection();
        });
        return replyEmojiLibraryPicker;
    }

    function applyReplyFormat(format) {
        if (!replyEditor) return; replyEditor.focus();
        if (!hasReplyEditorText()) {
            pendingFormats.has(format) ? pendingFormats.delete(format) : pendingFormats.add(format);
            syncReplyFormatButtons(); return;
        }
        if (!restoreReplySelection()) { const range = document.createRange(); range.selectNodeContents(replyEditor); range.collapse(false); const sel = window.getSelection(); sel?.removeAllRanges(); sel?.addRange(range); }
        document.execCommand(format, false); saveReplySelection(); syncReplySubmitState(); syncReplyFormatButtons();
    }

    function applyPendingFormats() {
        if (pendingFormats.size === 0 || !hasReplyEditorText()) return;
        const range = document.createRange(); range.selectNodeContents(replyEditor);
        const sel = window.getSelection(); sel?.removeAllRanges(); sel?.addRange(range);
        pendingFormats.forEach(fmt => document.execCommand(fmt, false));
        pendingFormats.clear();
        range.collapse(false); sel?.removeAllRanges(); sel?.addRange(range);
        saveReplySelection();
    }

    function syncReplyFormatButtons() {
        if (!replyEditor) return;
        replyFormatButtons.forEach(btn => {
            const fmt = btn.getAttribute("data-format"); if (!fmt) return;
            const active = hasReplyEditorText() ? document.queryCommandState(fmt) : pendingFormats.has(fmt);
            const labels = formatButtonLabels[fmt];
            btn.classList.toggle("tweet-modal__tool-btn--active", active);
            if (labels) btn.setAttribute("aria-label", active ? labels.active : labels.inactive);
        });
    }

    function closeEmojiPicker() {
        if (!replyEmojiLibraryPicker) return;
        if (replyEmojiLibraryPicker.pickerVisible) replyEmojiLibraryPicker.hidePicker();
        replyEmojiButton?.setAttribute("aria-expanded", "false");
        restoreReplyEditorAfterEmojiInsert();
    }

    function openEmojiPicker() {
        const libraryPicker = ensureReplyEmojiLibraryPicker();
        if (!libraryPicker || !replyEmojiButton) return;
        saveReplySelection(); replyEmojiButton.setAttribute("aria-expanded", "true"); libraryPicker.showPicker(replyEmojiButton);
    }

    function toggleEmojiPicker() {
        const libraryPicker = ensureReplyEmojiLibraryPicker();
        if (!libraryPicker || !replyEmojiButton) return;
        saveReplySelection();
        if (libraryPicker.pickerVisible) { libraryPicker.hidePicker(); replyEmojiButton.setAttribute("aria-expanded", "false"); }
        else { replyEmojiButton.setAttribute("aria-expanded", "true"); libraryPicker.showPicker(replyEmojiButton); }
    }

    function insertReplyEmoji(emoji) {
        if (!replyEditor) return;
        isInsertingReplyEmoji = true; replyEditor.focus();
        if (!restoreReplySelection()) { const range = document.createRange(); range.selectNodeContents(replyEditor); range.collapse(false); const sel = window.getSelection(); sel?.removeAllRanges(); sel?.addRange(range); }
        const sel = window.getSelection(); if (!sel) { isInsertingReplyEmoji = false; return; }
        let range;
        if (sel.rangeCount === 0) { range = document.createRange(); range.selectNodeContents(replyEditor); range.collapse(false); sel.removeAllRanges(); sel.addRange(range); } else { range = sel.getRangeAt(0); }
        if (!replyEditor.contains(range.commonAncestorContainer)) { range = document.createRange(); range.selectNodeContents(replyEditor); range.collapse(false); sel.removeAllRanges(); sel.addRange(range); }
        const emojiNode = document.createTextNode(emoji); range.deleteContents(); range.insertNode(emojiNode);
        const nextRange = document.createRange(); nextRange.setStartAfter(emojiNode); nextRange.collapse(true); sel.removeAllRanges(); sel.addRange(nextRange);
        isInsertingReplyEmoji = false; saveRecentEmoji(emoji); saveReplySelection(); syncReplySubmitState(); syncReplyFormatButtons();
    }

    // ===== Submit State =====
    function syncReplySubmitState() {
        if (!replyEditor) return;
        let content = replyEditor.textContent?.replace(/\u00a0/g, " ") ?? "";
        if (content.length > replyMaxLength) { content = content.slice(0, replyMaxLength); replyEditor.textContent = content; placeCaretAtEnd(replyEditor); saveReplySelection(); }
        const currentLength = content.length, remaining = Math.max(replyMaxLength - currentLength, 0);
        const canSubmit = content.trim().length > 0 || hasReplyAttachment();
        const progress = `${Math.min(currentLength / replyMaxLength, 1) * 360}deg`;
        if (replySubmitButton) replySubmitButton.disabled = !canSubmit;
        if (replyGauge) { replyGauge.style.setProperty("--gauge-progress", progress); replyGauge.setAttribute("aria-valuenow", String(currentLength)); }
        if (replyGaugeText) replyGaugeText.textContent = String(remaining);
    }

    // ===== Reply Modal =====
    function populateReplyModal(button) {
        const card = button.closest(".communityPostCard");
        if (!card) return;
        const handle = card.querySelector(".postHandle")?.textContent?.trim() ?? "";
        if (replyContextButton) replyContextButton.textContent = handle ? `${handle} 님에게 보내는 답글` : "답글을 보낼 게시물을 찾지 못했습니다.";
        if (replySourceAvatar) replySourceAvatar.src = card.querySelector(".postAvatar img")?.getAttribute("src") ?? replySourceAvatar.src;
        if (replySourceName)   replySourceName.textContent   = card.querySelector(".postName")?.textContent?.trim() ?? "";
        if (replySourceHandle) replySourceHandle.textContent = handle;
        if (replySourceTime)   replySourceTime.textContent   = card.querySelector(".postTime")?.textContent?.trim() ?? "";
        if (replySourceText)   replySourceText.textContent   = card.querySelector(".postText")?.textContent?.trim() ?? "";
    }

    function openReplyModal(button) {
        if (!replyModalOverlay || !replyEditor) return;
        activeReplyTrigger = button;
        shouldRestoreReplyEditorAfterEmojiInsert = false;
        const isCompose = !button;
        replyModalOverlay.classList.toggle("tweet-modal-overlay--compose", isCompose);
        document.body.classList.add("modal-open");
        replyModalOverlay.hidden = false;
        if (!isCompose) populateReplyModal(button);
        closeEmojiPicker();
        replyEditor.textContent = ""; savedReplySelection = null; savedReplySelectionOffsets = null; pendingFormats.clear();
        selectedLocation = null; pendingLocation = null; selectedTaggedUsers = []; pendingTaggedUsers = [];
        selectedProduct = null;
        if (replyProductButton) replyProductButton.disabled = false;
        const existingProductCard = replyModalOverlay?.querySelector("[data-selected-product]");
        if (existingProductCard) existingProductCard.remove();
        resetReplyAttachment();
        if (replyEmojiSearchInput) replyEmojiSearchInput.value = "";
        if (replyLocationSearchInput) replyLocationSearchInput.value = "";
        if (composeView) composeView.hidden = false;
        if (replyLocationView) replyLocationView.hidden = true;
        if (replyTagView) replyTagView.hidden = true;
        if (replyMediaView) replyMediaView.hidden = true;
        if (replyProductView) replyProductView.hidden = true;
        closeDraftPanel({ restoreFocus: false }); renderDraftPanel();
        renderLocationList(); syncLocationUI(); syncUserTagTrigger();
        syncReplyMediaEditsToAttachments(); syncReplySubmitState(); syncReplyFormatButtons();
        window.requestAnimationFrame(() => replyEditor.focus());
    }

    function canCloseReplyModal() {
        if (!replyEditor) return !hasReplyAttachment() || window.confirm("게시물을 삭제하시겠어요?");
        const hasDraft = replyEditor.textContent.replace(/\u00a0/g, " ").trim().length > 0;
        return (!hasDraft && !hasReplyAttachment()) || window.confirm("게시물을 삭제하시겠어요?");
    }

    function closeReplyModal(options = {}) {
        const { skipConfirm = false, restoreFocus = true } = options;
        if (!replyModalOverlay || replyModalOverlay.hidden) return;
        if (!skipConfirm && !canCloseReplyModal()) return;
        shouldRestoreReplyEditorAfterEmojiInsert = false;
        replyModalOverlay.hidden = true;
        replyModalOverlay.classList.remove("tweet-modal-overlay--compose");
        document.body.classList.remove("modal-open");
        closeEmojiPicker(); closeLocationPanel({ restoreFocus: false }); closeTagPanel({ restoreFocus: false });
        closeMediaEditor({ restoreFocus: false, discardChanges: true }); closeDraftPanel({ restoreFocus: false });
        if (replyProductView) replyProductView.hidden = true;
        if (replyEditor) replyEditor.textContent = "";
        savedReplySelection = null; savedReplySelectionOffsets = null; pendingFormats.clear();
        selectedLocation = null; pendingLocation = null; selectedTaggedUsers = []; pendingTaggedUsers = [];
        selectedProduct = null;
        if (replyProductButton) replyProductButton.disabled = false;
        const existingProductCard = replyModalOverlay?.querySelector("[data-selected-product]");
        if (existingProductCard) existingProductCard.remove();
        resetReplyAttachment(); renderLocationList(); syncLocationUI();
        syncUserTagTrigger(); syncReplyMediaEditsToAttachments(); syncReplySubmitState(); syncReplyFormatButtons();
        if (restoreFocus) activeReplyTrigger?.focus();
        activeReplyTrigger = null;
    }

    function trapFocus(e) {
        if (!replyModal || e.key !== "Tab") return;
        const focusable = Array.from(replyModal.querySelectorAll('button:not([disabled]),[href],input:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])')).filter(el => !el.hasAttribute("hidden"));
        if (focusable.length === 0) return;
        const first = focusable[0], last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }

    function updateReplyCount(button) {
        const cnt = button.querySelector(".tweet-action-count");
        if (!cnt) return;
        const next = (Number.parseInt(cnt.textContent || "0", 10) || 0) + 1;
        cnt.textContent = String(next); button.setAttribute("aria-label", `${next} 답글`);
    }

    // ===== Draft Panel =====
    const draftView              = q(".tweet-modal__draft-view");
    const draftButton            = q(".tweet-modal__draft");
    const draftBackButton        = draftView?.querySelector(".draft-panel__back");
    const draftActionButton      = draftView?.querySelector(".draft-panel__action");
    const draftList              = draftView?.querySelector(".draft-panel__list");
    const draftEmpty             = draftView?.querySelector(".draft-panel__empty");
    const draftEmptyTitle        = draftView?.querySelector(".draft-panel__empty-title");
    const draftEmptyBody         = draftView?.querySelector(".draft-panel__empty-body");
    const draftFooter            = draftView?.querySelector(".draft-panel__footer");
    const draftSelectAllButton   = draftView?.querySelector(".draft-panel__select-all");
    const draftDeleteButton      = draftView?.querySelector(".draft-panel__footer-delete");
    const draftConfirmOverlay    = draftView?.querySelector(".draft-panel__confirm-overlay");
    const draftConfirmBackdrop   = draftView?.querySelector(".draft-panel__confirm-backdrop");
    const draftConfirmTitle      = draftView?.querySelector(".draft-panel__confirm-title");
    const draftConfirmDesc       = draftView?.querySelector(".draft-panel__confirm-desc");
    const draftConfirmDeleteButton = draftView?.querySelector(".draft-panel__confirm-primary");
    const draftConfirmCancelButton = draftView?.querySelector(".draft-panel__confirm-secondary");

    const draftPanelState = { isEditMode: false, confirmOpen: false, selectedItems: new Set() };

    function getDraftItems() { return draftList ? Array.from(draftList.querySelectorAll(".draft-panel__item")) : []; }
    function clearDraftSelection() { draftPanelState.selectedItems.clear(); draftPanelState.confirmOpen = false; }
    function exitDraftEditMode() { draftPanelState.isEditMode = false; clearDraftSelection(); }
    function enterDraftEditMode() { if (getDraftItems().length === 0) return; draftPanelState.isEditMode = true; draftPanelState.confirmOpen = false; }
    function hasDraftItem(item) { return item instanceof HTMLElement && getDraftItems().includes(item); }
    function toggleDraftSelection(item) { if (!draftPanelState.isEditMode || !hasDraftItem(item)) return; draftPanelState.selectedItems.has(item) ? draftPanelState.selectedItems.delete(item) : draftPanelState.selectedItems.add(item); draftPanelState.confirmOpen = false; }
    function areAllDraftItemsSelected() { const items = getDraftItems(); return items.length > 0 && items.every(i => draftPanelState.selectedItems.has(i)); }
    function toggleDraftSelectAll() { if (!draftPanelState.isEditMode) return; const items = getDraftItems(); if (items.length === 0) return; areAllDraftItemsSelected() ? draftPanelState.selectedItems.clear() : (draftPanelState.selectedItems = new Set(items)); draftPanelState.confirmOpen = false; }
    function hasDraftSelection() { return draftPanelState.selectedItems.size > 0; }
    function openDraftConfirm() { if (draftPanelState.isEditMode && hasDraftSelection()) draftPanelState.confirmOpen = true; }
    function closeDraftConfirm() { draftPanelState.confirmOpen = false; }
    function deleteSelectedDrafts() { if (!hasDraftSelection()) return; getDraftItems().forEach(i => { if (draftPanelState.selectedItems.has(i)) i.remove(); }); exitDraftEditMode(); }
    function resetDraftPanel() { exitDraftEditMode(); closeDraftConfirm(); }
    function isDraftPanelOpen() { return Boolean(draftView && !draftView.hidden); }
    function isDraftConfirmOpen() { return draftPanelState.confirmOpen; }

    function buildDraftCheckbox(sel) {
        const cb = document.createElement("span");
        cb.className = `draft-panel__checkbox${sel ? " draft-panel__checkbox--checked" : ""}`;
        cb.setAttribute("aria-hidden", "true");
        cb.innerHTML = '<svg viewBox="0 0 24 24"><g><path d="M9.86 18a1 1 0 01-.73-.31l-3.9-4.11 1.45-1.38 3.2 3.38 7.46-8.1 1.47 1.36-8.19 8.9A1 1 0 019.86 18z"></path></g></svg>';
        return cb;
    }

    function renderDraftItems() {
        if (!draftList) return;
        getDraftItems().forEach(item => {
            const sel = draftPanelState.selectedItems.has(item);
            const old = item.querySelector(".draft-panel__checkbox"); if (old) old.remove();
            item.className = ["draft-panel__item", draftPanelState.isEditMode ? "draft-panel__item--selectable" : "", sel ? "draft-panel__item--selected" : ""].filter(Boolean).join(" ");
            item.setAttribute("aria-pressed", draftPanelState.isEditMode ? String(sel) : "false");
            if (draftPanelState.isEditMode) item.prepend(buildDraftCheckbox(sel));
        });
    }

    function renderDraftPanel() {
        if (!draftView) return;
        const hasItems = getDraftItems().length > 0;
        if (draftActionButton) { draftActionButton.textContent = draftPanelState.isEditMode ? "완료" : "수정"; draftActionButton.disabled = !hasItems; draftActionButton.classList.toggle("draft-panel__action--done", draftPanelState.isEditMode); }
        renderDraftItems();
        if (draftEmpty) draftEmpty.hidden = hasItems;
        if (draftEmptyTitle) draftEmptyTitle.textContent = "잠시 생각을 정리합니다";
        if (draftEmptyBody)  draftEmptyBody.textContent  = "아직 게시할 준비가 되지 않았나요? 임시저장해 두고 나중에 이어서 작성하세요.";
        if (draftFooter) draftFooter.hidden = !draftPanelState.isEditMode;
        if (draftSelectAllButton) draftSelectAllButton.textContent = areAllDraftItemsSelected() ? "모두 선택 해제" : "모두 선택";
        if (draftDeleteButton) draftDeleteButton.disabled = !hasDraftSelection();
        if (draftConfirmOverlay) draftConfirmOverlay.hidden = !draftPanelState.confirmOpen;
        if (draftConfirmTitle) draftConfirmTitle.textContent = "전송하지 않은 게시물 삭제하기";
        if (draftConfirmDesc)  draftConfirmDesc.textContent  = "이 작업은 취소할 수 없으며 선택한 전송하지 않은 게시물이 삭제됩니다.";
    }

    function openDraftPanel() { if (!composeView || !draftView) return; renderDraftPanel(); composeView.hidden = true; draftView.hidden = false; }
    function closeDraftPanel({ restoreFocus = true } = {}) { if (!composeView || !draftView) return; resetDraftPanel(); renderDraftPanel(); draftView.hidden = true; composeView.hidden = false; if (restoreFocus) draftButton?.focus(); }
    function getDraftItemByElement(target) { return target.closest(".draft-panel__item"); }

    function loadDraftIntoComposer(item) {
        if (!item || !replyEditor) return;
        replyEditor.textContent = getTextContent(item.querySelector(".draft-panel__text"));
        closeDraftPanel({ restoreFocus: false }); syncReplySubmitState(); saveReplySelection();
        window.requestAnimationFrame(() => replyEditor.focus());
    }

    // ===== Product Panel =====
    function openProductSelectPanel() { if (!replyProductView) return; renderProductList(); if (composeView) composeView.hidden = true; replyProductView.hidden = false; }
    function closeProductSelectPanel() { if (!replyProductView) return; replyProductView.hidden = true; if (composeView) composeView.hidden = false; }

    function renderProductList() {
        if (!productSelectList) return;
        const sampleProducts = [
            { id: "1", name: "상품 이름 1", price: "₩50,000", stock: "100개", image: "../../static/images/main/global-gates-logo.png", tags: ["#부품", "#전자"] },
            { id: "2", name: "상품 이름 2", price: "₩30,000", stock: "50개",  image: "../../static/images/main/global-gates-logo.png", tags: ["#부품", "#기계"] },
            { id: "3", name: "상품 이름 3", price: "₩80,000", stock: "200개", image: "../../static/images/main/global-gates-logo.png", tags: ["#부품", "#소재"] },
        ];
        if (sampleProducts.length === 0) { productSelectList.innerHTML = ""; if (productSelectEmpty) productSelectEmpty.hidden = false; return; }
        if (productSelectEmpty) productSelectEmpty.hidden = true;
        productSelectList.innerHTML = sampleProducts.map(p => `
            <button type="button" class="draft-panel__item draft-panel__item--selectable" data-product-id="${p.id}" aria-pressed="false">
                <span class="draft-panel__checkbox"><svg viewBox="0 0 24 24" aria-hidden="true"><g><path d="M9 20c-.264 0-.518-.104-.707-.293l-4.785-4.785 1.414-1.414L9 17.586 19.072 7.5l1.42 1.416L9.708 19.7c-.188.19-.442.3-.708.3z"></path></g></svg></span>
                <img class="draft-panel__avatar" alt="" src="${p.image}">
                <span class="draft-panel__item-body"><span class="draft-panel__text">${p.name}</span><span class="draft-panel__meta">${p.tags.join(" ")}</span><span class="draft-panel__date">${p.price} · ${p.stock}</span></span>
            </button>`).join("");
    }

    function renderSelectedProduct() {
        const existing = replyModalOverlay?.querySelector("[data-selected-product]"); if (existing) existing.remove();
        if (!selectedProduct || !replyEditor) return;
        const card = document.createElement("div");
        card.setAttribute("data-selected-product", ""); card.className = "tweet-modal__selected-product";
        card.innerHTML = `<div class="selected-product__card"><img class="selected-product__image" src="${selectedProduct.image}" alt="${selectedProduct.name}"><div class="selected-product__info"><strong class="selected-product__name">${selectedProduct.name}</strong><span class="selected-product__price">${selectedProduct.price}</span></div><button type="button" class="selected-product__remove" aria-label="판매글 제거"><svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><g><path d="M10.59 12L4.54 5.96l1.42-1.42L12 10.59l6.04-6.05 1.42 1.42L13.41 12l6.05 6.04-1.42 1.42L12 13.41l-6.04 6.05-1.42-1.42L10.59 12z"></path></g></svg></button></div>`;
        card.querySelector(".selected-product__remove")?.addEventListener("click", () => { selectedProduct = null; card.remove(); if (replyProductButton) replyProductButton.disabled = false; });
        replyEditor.parentElement?.appendChild(card);
    }

    // ===== Init =====
    renderLocationList(); syncLocationUI(); syncUserTagTrigger();
    ensureReplyEmojiLibraryPicker();

    // ===== Modal Event Listeners =====
    replyCloseButton?.addEventListener("click", closeReplyModal);
    replyModalOverlay?.addEventListener("click", (e) => { if (e.target === replyModalOverlay) closeReplyModal(); });
    replyModalOverlay?.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            e.preventDefault();
            if (isMediaEditorOpen()) { closeMediaEditor(); return; }
            if (isTagModalOpen()) { closeTagPanel(); return; }
            if (isLocationModalOpen()) { closeLocationPanel(); return; }
            if (replyProductView && !replyProductView.hidden) { closeProductSelectPanel(); return; }
            if (isDraftConfirmOpen()) { closeDraftConfirm(); renderDraftPanel(); return; }
            if (isDraftPanelOpen()) { closeDraftPanel(); return; }
            closeReplyModal(); return;
        }
        trapFocus(e);
    });

    replyEditor?.addEventListener("input", () => { applyPendingFormats(); if (!hasReplyEditorText()) pendingFormats.clear(); syncReplySubmitState(); syncReplyFormatButtons(); });
    replyEditor?.addEventListener("keyup", saveReplySelection);
    replyEditor?.addEventListener("keyup", syncReplyFormatButtons);
    replyEditor?.addEventListener("mouseup", saveReplySelection);
    replyEditor?.addEventListener("mouseup", syncReplyFormatButtons);
    replyEditor?.addEventListener("focus", saveReplySelection);
    replyEditor?.addEventListener("focus", syncReplyFormatButtons);
    replyEditor?.addEventListener("click", syncReplyFormatButtons);
    replyEditor?.addEventListener("keydown", (e) => { if (!e.ctrlKey) return; const key = e.key.toLowerCase(); if (key !== "b" && key !== "i") return; e.preventDefault(); applyReplyFormat(key === "b" ? "bold" : "italic"); });

    replyMediaUploadButton?.addEventListener("click", (e) => { e.preventDefault(); pendingAttachmentEditIndex = null; if (replyFileInput) replyFileInput.value = ""; replyFileInput?.click(); });
    replyFileInput?.addEventListener("change", handleReplyFileChange);

    replyAttachmentMedia?.addEventListener("click", (e) => {
        const rm = e.target.closest("[data-attachment-remove-index]");
        if (rm) { const ri = Number.parseInt(rm.getAttribute("data-attachment-remove-index") ?? "-1", 10); if (ri >= 0) removeReplyAttachment(ri); syncReplySubmitState(); return; }
        const eb = e.target.closest("[data-attachment-edit-index]");
        if (eb) { pendingAttachmentEditIndex = Number.parseInt(eb.getAttribute("data-attachment-edit-index") ?? "-1", 10); if (replyFileInput) replyFileInput.value = ""; replyFileInput?.click(); }
    });

    document.addEventListener("selectionchange", () => { if (replyModalOverlay?.hidden || !replyEditor) return; saveReplySelection(); syncReplyFormatButtons(); });

    replyFormatButtons.forEach(btn => {
        btn.addEventListener("mousedown", (e) => e.preventDefault());
        btn.addEventListener("click", (e) => { e.preventDefault(); const fmt = btn.getAttribute("data-format"); if (fmt) { applyReplyFormat(fmt); syncReplyFormatButtons(); } });
    });

    replyEmojiButton?.addEventListener("mousedown", (e) => { e.preventDefault(); e.stopPropagation(); saveReplySelection(); });
    replyEmojiButton?.addEventListener("click", (e) => { e.preventDefault(); e.stopPropagation(); toggleEmojiPicker(); });
    replyGeoButton?.addEventListener("click", (e) => { e.preventDefault(); openLocationPanel(); });
    replyUserTagTrigger?.addEventListener("click", (e) => { e.preventDefault(); openTagPanel(); });
    replyMediaAltTrigger?.addEventListener("click", (e) => { e.preventDefault(); openMediaEditor(); });
    replyLocationDisplayButton?.addEventListener("click", (e) => { e.preventDefault(); openLocationPanel(); });
    replyLocationSearchInput?.addEventListener("input", () => renderLocationList());
    replyTagSearchForm?.addEventListener("submit", (e) => e.preventDefault());
    replyTagSearchInput?.addEventListener("input", () => runTagSearch());
    replyMediaBackButton?.addEventListener("click", () => closeMediaEditor());
    replyMediaSaveButton?.addEventListener("click", () => saveReplyMediaEdits());
    replyMediaPrevButton?.addEventListener("click", () => { if (activeReplyMediaIndex === 0) return; activeReplyMediaIndex -= 1; renderMediaEditor(); });
    replyMediaNextButton?.addEventListener("click", () => { if (activeReplyMediaIndex >= pendingReplyMediaEdits.length - 1) return; activeReplyMediaIndex += 1; renderMediaEditor(); });
    replyMediaAltInput?.addEventListener("input", () => { const edit = pendingReplyMediaEdits[activeReplyMediaIndex]; if (!edit) return; edit.alt = replyMediaAltInput.value.slice(0, maxReplyMediaAltLength); renderMediaEditor(); });

    replyLocationCloseButton?.addEventListener("click", () => closeLocationPanel());
    replyTagCloseButton?.addEventListener("click", () => closeTagPanel());
    replyTagCompleteButton?.addEventListener("click", () => { applyPendingTaggedUsers(); closeTagPanel(); });
    replyLocationDeleteButton?.addEventListener("click", () => { resetLocationState(); closeLocationPanel(); });
    replyLocationCompleteButton?.addEventListener("click", () => { if (pendingLocation) { applyLocation(pendingLocation); closeLocationPanel(); } });
    replyLocationList?.addEventListener("click", (e) => {
        const lb = e.target.closest(".tweet-modal__location-item"); if (!lb) return;
        const loc = getTextContent(lb.querySelector(".tweet-modal__location-item-label")); if (loc) { applyLocation(loc); closeLocationPanel(); }
    });
    replyTagChipList?.addEventListener("click", (e) => {
        const cb = e.target.closest("[data-tag-remove-id]"); if (!cb) return;
        const uid = cb.getAttribute("data-tag-remove-id");
        pendingTaggedUsers = pendingTaggedUsers.filter(u => u.id !== uid); renderTagChipList(); runTagSearch(); replyTagSearchInput?.focus();
    });
    replyTagResults?.addEventListener("click", (e) => {
        const ub = e.target.closest("[data-tag-user-id]"); if (!ub || ub.hasAttribute("disabled")) return;
        const uid = ub.getAttribute("data-tag-user-id"), user = currentTagResults.find(u => u.id === uid);
        if (!user || pendingTaggedUsers.some(u => u.id === user.id)) return;
        pendingTaggedUsers = [...pendingTaggedUsers, { ...user }]; renderTagChipList();
        if (replyTagSearchInput) replyTagSearchInput.value = ""; renderTagResults([]); replyTagSearchInput?.focus();
    });

    replySubmitButton?.addEventListener("click", () => {
        if (replySubmitButton.disabled) return;
        if (activeReplyTrigger) updateReplyCount(activeReplyTrigger);
        closeReplyModal({ skipConfirm: true });
    });

    // Draft panel events
    draftButton?.addEventListener("click", (e) => { e.preventDefault(); openDraftPanel(); });
    draftBackButton?.addEventListener("click", (e) => { e.preventDefault(); closeDraftPanel(); });
    draftActionButton?.addEventListener("click", (e) => { e.preventDefault(); draftPanelState.isEditMode ? exitDraftEditMode() : enterDraftEditMode(); renderDraftPanel(); });
    draftSelectAllButton?.addEventListener("click", (e) => { e.preventDefault(); toggleDraftSelectAll(); renderDraftPanel(); });
    draftDeleteButton?.addEventListener("click", (e) => { e.preventDefault(); openDraftConfirm(); renderDraftPanel(); });
    draftConfirmDeleteButton?.addEventListener("click", (e) => { e.preventDefault(); deleteSelectedDrafts(); renderDraftPanel(); });
    draftConfirmCancelButton?.addEventListener("click", (e) => { e.preventDefault(); closeDraftConfirm(); renderDraftPanel(); });
    draftConfirmBackdrop?.addEventListener("click", (e) => { e.preventDefault(); closeDraftConfirm(); renderDraftPanel(); });
    draftList?.addEventListener("click", (e) => {
        const item = getDraftItemByElement(e.target); if (!item) return;
        if (draftPanelState.isEditMode) { toggleDraftSelection(item); renderDraftPanel(); return; }
        loadDraftIntoComposer(item);
    });

    // Product panel events
    replyProductButton?.addEventListener("click", (e) => { e.preventDefault(); openProductSelectPanel(); });
    productSelectClose?.addEventListener("click", () => closeProductSelectPanel());
    productSelectComplete?.addEventListener("click", () => {
        const checkedItem = productSelectList?.querySelector(".draft-panel__item--selected");
        if (checkedItem) {
            selectedProduct = { name: checkedItem.querySelector(".draft-panel__text")?.textContent ?? "", price: checkedItem.querySelector(".draft-panel__date")?.textContent ?? "", image: checkedItem.querySelector(".draft-panel__avatar")?.src ?? "", id: checkedItem.dataset.productId ?? "" };
            renderSelectedProduct(); if (replyProductButton) replyProductButton.disabled = true;
        }
        closeProductSelectPanel();
    });
    productSelectList?.addEventListener("click", (e) => {
        const item = e.target.closest(".draft-panel__item"); if (!item) return;
        const wasSelected = item.classList.contains("draft-panel__item--selected");
        productSelectList.querySelectorAll(".draft-panel__item--selected").forEach(el => { el.classList.remove("draft-panel__item--selected"); el.setAttribute("aria-pressed", "false"); const cb = el.querySelector(".draft-panel__checkbox"); if (cb) cb.classList.remove("draft-panel__checkbox--checked"); });
        if (!wasSelected) { item.classList.add("draft-panel__item--selected"); item.setAttribute("aria-pressed", "true"); const cb = item.querySelector(".draft-panel__checkbox"); if (cb) cb.classList.add("draft-panel__checkbox--checked"); }
        if (productSelectComplete) productSelectComplete.disabled = !productSelectList.querySelector(".draft-panel__item--selected");
    });

    // ===== Global document events =====
    document.addEventListener("click", (e) => {

        // FAB (새 게시물)
        if (e.target.closest("[data-compose]")) { e.preventDefault(); openReplyModal(null); return; }

        // 답글
        const replyBtn = e.target.closest("[data-testid='reply']");
        if (replyBtn) { e.preventDefault(); e.stopPropagation(); openReplyModal(replyBtn); return; }

        // 좋아요
        const likeBtn = e.target.closest(".tweet-action-btn--like");
        if (likeBtn && !likeBtn.closest("[data-reply-modal]")) {
            e.stopPropagation();
            const on = likeBtn.classList.toggle("active");
            const cnt = likeBtn.querySelector(".tweet-action-count");
            if (cnt && /^\d+$/.test(cnt.textContent.trim())) cnt.textContent = Math.max(0, parseInt(cnt.textContent, 10) + (on ? 1 : -1));
            const likePath = likeBtn.querySelector("path");
            if (likePath) likePath.setAttribute("d", on
                ? "M20.884 13.19c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z"
                : "M16.697 5.5c-1.222-.06-2.679.51-3.89 2.16l-.805 1.09-.806-1.09C9.984 6.01 8.526 5.44 7.304 5.5c-1.243.07-2.349.78-2.91 1.91-.552 1.12-.633 2.78.479 4.82 1.074 1.97 3.257 4.27 7.129 6.61 3.87-2.34 6.052-4.64 7.126-6.61 1.111-2.04 1.03-3.7.477-4.82-.561-1.13-1.666-1.84-2.908-1.91zm4.187 7.69c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z"
            );
            return;
        }

        // 북마크
        const bookmarkBtn = e.target.closest(".tweet-action-btn--bookmark");
        if (bookmarkBtn && !bookmarkBtn.closest("[data-reply-modal]")) {
            e.stopPropagation();
            const on = bookmarkBtn.classList.toggle("active");
            const bkPath = bookmarkBtn.querySelector("path");
            if (bkPath) bkPath.setAttribute("d", on
                ? "M4 4.5C4 3.12 5.119 2 6.5 2h11C18.881 2 20 3.12 20 4.5v18.44l-8-5.71-8 5.71V4.5z"
                : "M4 4.5C4 3.12 5.119 2 6.5 2h11C18.881 2 20 3.12 20 4.5v18.44l-8-5.71-8 5.71V4.5zM6.5 4c-.276 0-.5.22-.5.5v14.56l6-4.29 6 4.29V4.5c0-.28-.224-.5-.5-.5h-11z"
            );
            return;
        }

        // 공유
        const shareBtn = e.target.closest(".tweet-action-btn--share");
        if (shareBtn && !shareBtn.closest("[data-reply-modal]")) {
            e.stopPropagation();
            activeShareButton === shareBtn ? closeShareDropdown() : openShareDropdown(shareBtn);
            return;
        }

        // 더보기
        const moreBtn = e.target.closest(".postMoreButton");
        if (moreBtn) {
            e.stopPropagation();
            activeMoreButton === moreBtn ? closeMoreDropdown() : openMoreDropdown(moreBtn);
            return;
        }

        if (!e.target.closest(".layers-dropdown-container")) { closeShareDropdown(); closeMoreDropdown(); }
    });

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") { closeShareDropdown(); closeMoreDropdown(); closeCommunityModal(); closeShareModal(); closeCreateCommunityModal(); }
    });

    // ===== 공유 드롭다운 =====
    function closeShareDropdown() {
        if (!activeShareDropdown) return;
        activeShareDropdown.remove(); activeShareDropdown = null;
        if (activeShareButton) { activeShareButton.setAttribute("aria-expanded", "false"); activeShareButton = null; }
    }

    function getSharePostMeta(button) {
        const card = button.closest(".communityPostCard");
        const all = Array.from(document.querySelectorAll(".communityPostCard"));
        const handle = getTextContent(card?.querySelector(".postHandle")) || "@user";
        const bk = card?.querySelector(".tweet-action-btn--bookmark") ?? null;
        const tid = String(Math.max(all.indexOf(card), 0) + 1);
        const url = new URL(window.location.href);
        url.pathname = `/${handle.replace("@", "") || "user"}/status/${tid}`;
        url.hash = ""; url.search = "";
        return { handle, permalink: url.toString(), bookmarkButton: bk };
    }

    function showShareToast(message) {
        activeShareToast?.remove();
        const toast = document.createElement("div");
        toast.className = "share-toast"; toast.setAttribute("role", "status"); toast.textContent = message;
        document.body.appendChild(toast); activeShareToast = toast;
        window.setTimeout(() => { if (activeShareToast === toast) activeShareToast = null; toast.remove(); }, 3000);
    }

    function closeShareModal() {
        if (!activeShareModal) return;
        activeShareModal.remove(); activeShareModal = null;
        document.body.classList.remove("modal-open");
    }

    function setBookmarkButtonState(button, isActive) {
        const path = button?.querySelector("path"); if (!button || !path) return;
        button.classList.toggle("active", isActive);
        button.setAttribute("data-testid", isActive ? "removeBookmark" : "bookmark");
        button.setAttribute("aria-label", isActive ? "북마크에 추가됨" : "북마크");
        path.setAttribute("d", isActive ? (path.dataset.pathActive ?? path.getAttribute("d")) : (path.dataset.pathInactive ?? path.getAttribute("d")));
    }

    function getShareUserRows() {
        const cards = document.querySelectorAll(".communityPostCard"), seen = new Set();
        const users = Array.from(cards).map((card, i) => {
            const name = card.querySelector(".postName")?.textContent?.trim() ?? "";
            const handle = card.querySelector(".postHandle")?.textContent?.trim() ?? "";
            const avatar = card.querySelector(".postAvatar img")?.getAttribute("src") ?? "";
            if (!name || !handle || seen.has(handle)) return null;
            seen.add(handle);
            return { id: `${handle.replace("@", "") || "user"}-${i}`, name, handle, avatar };
        }).filter(Boolean);
        if (users.length === 0) return `<div class="share-sheet__empty"><p>전송할 수 있는 사용자가 없습니다.</p></div>`;
        return users.map(u => `<button type="button" class="share-sheet__user" data-share-user-id="${escapeHtml(u.id)}"><span class="share-sheet__user-avatar"><img src="${escapeHtml(u.avatar)}" alt="${escapeHtml(u.name)}" /></span><span class="share-sheet__user-body"><span class="share-sheet__user-name">${escapeHtml(u.name)}</span><span class="share-sheet__user-handle">${escapeHtml(u.handle)}</span></span></button>`).join("");
    }

    function openShareChatModal(button) {
        closeShareDropdown(); closeShareModal();
        const modal = document.createElement("div");
        modal.className = "share-sheet";
        modal.innerHTML = `<div class="share-sheet__backdrop" data-share-close="true"></div><div class="share-sheet__card" role="dialog" aria-modal="true" aria-labelledby="share-chat-title"><div class="share-sheet__header"><button type="button" class="share-sheet__icon-btn" data-share-close="true" aria-label="돌아가기"><svg viewBox="0 0 24 24" aria-hidden="true"><g><path d="M7.414 13l5.043 5.04-1.414 1.42L3.586 12l7.457-7.46 1.414 1.42L7.414 11H21v2H7.414z"></path></g></svg></button><h2 id="share-chat-title" class="share-sheet__title">공유하기</h2><span class="share-sheet__header-spacer"></span></div><div class="share-sheet__search"><input type="text" class="share-sheet__search-input" placeholder="검색" aria-label="검색" /></div><div class="share-sheet__list">${getShareUserRows()}</div></div>`;
        modal.addEventListener("click", (e) => {
            if (e.target.closest("[data-share-close='true']") || e.target.classList.contains("share-sheet__backdrop")) { e.preventDefault(); closeShareModal(); return; }
            if (e.target.closest(".share-sheet__user")) {
                e.preventDefault();
                const userName = e.target.closest(".share-sheet__user")?.querySelector(".share-sheet__user-name")?.textContent || "사용자";
                showShareToast(`${userName}에게 전송함`); closeShareModal();
            }
        });
        document.body.appendChild(modal); document.body.classList.add("modal-open"); activeShareModal = modal;
    }

    function openShareBookmarkModal(button) {
        const { bookmarkButton } = getSharePostMeta(button);
        closeShareDropdown(); closeShareModal();
        const isBookmarked = bookmarkButton?.classList.contains("active") ?? false;
        const modal = document.createElement("div");
        modal.className = "share-sheet";
        modal.innerHTML = `<div class="share-sheet__backdrop" data-share-close="true"></div><div class="share-sheet__card share-sheet__card--bookmark" role="dialog" aria-modal="true" aria-labelledby="share-bookmark-title"><div class="share-sheet__header"><button type="button" class="share-sheet__icon-btn" data-share-close="true" aria-label="닫기"><svg viewBox="0 0 24 24" aria-hidden="true"><g><path d="M10.59 12 4.54 5.96l1.42-1.42L12 10.59l6.04-6.05 1.42 1.42L13.41 12l6.05 6.04-1.42 1.42L12 13.41l-6.04 6.05-1.42-1.42L10.59 12z"></path></g></svg></button><h2 id="share-bookmark-title" class="share-sheet__title">폴더에 추가</h2><span class="share-sheet__header-spacer"></span></div><button type="button" class="share-sheet__create-folder">새 북마크 폴더 만들기</button><button type="button" class="share-sheet__folder" data-share-folder="all-bookmarks"><span class="share-sheet__folder-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><g><path d="M2.998 8.5c0-1.38 1.119-2.5 2.5-2.5h9c1.381 0 2.5 1.12 2.5 2.5v14.12l-7-3.5-7 3.5V8.5zM18.5 2H8.998v2H18.5c.275 0 .5.224.5.5V15l2 1.4V4.5c0-1.38-1.119-2.5-2.5-2.5z"></path></g></svg></span><span class="share-sheet__folder-name">모든 북마크</span><span class="share-sheet__folder-check${isBookmarked ? " share-sheet__folder-check--active" : ""}"><svg viewBox="0 0 24 24" aria-hidden="true"><g><path d="M9.64 18.952l-5.55-4.861 1.317-1.504 3.951 3.459 8.459-10.948L19.4 6.32 9.64 18.952z"></path></g></svg></span></button></div>`;
        modal.addEventListener("click", (e) => {
            if (e.target.closest("[data-share-close='true']") || e.target.classList.contains("share-sheet__backdrop")) { e.preventDefault(); closeShareModal(); return; }
            if (e.target.closest(".share-sheet__create-folder")) { e.preventDefault(); showShareToast("새 폴더 만들기는 준비 중입니다"); closeShareModal(); return; }
            if (e.target.closest("[data-share-folder='all-bookmarks']")) { e.preventDefault(); setBookmarkButtonState(bookmarkButton, !isBookmarked); showShareToast(isBookmarked ? "북마크가 해제되었습니다" : "북마크에 추가되었습니다"); closeShareModal(); }
        });
        document.body.appendChild(modal); document.body.classList.add("modal-open"); activeShareModal = modal;
    }

    function copyShareLink(button) {
        const { permalink } = getSharePostMeta(button);
        closeShareDropdown();
        if (!navigator.clipboard?.writeText) { showShareToast("링크를 복사하지 못했습니다"); return; }
        navigator.clipboard.writeText(permalink).then(() => showShareToast("클립보드로 복사함")).catch(() => showShareToast("링크를 복사하지 못했습니다"));
    }

    function openShareDropdown(button) {
        if (!layersRoot) return;
        closeShareDropdown(); closeMoreDropdown();
        const rect = button.getBoundingClientRect();
        const top = rect.bottom + window.scrollY + 8;
        const right = Math.max(16, window.innerWidth - rect.right);
        const lc = document.createElement("div");
        lc.className = "layers-dropdown-container";
        lc.innerHTML = `<div class="layers-overlay"></div><div class="layers-dropdown-inner"><div role="menu" class="dropdown-menu" style="top:${top}px;right:${right}px;"><div class="dropdown-inner"><button type="button" role="menuitem" class="menu-item share-menu-item--copy"><span class="menu-item__icon"><svg viewBox="0 0 24 24" aria-hidden="true"><g><path d="M18.36 5.64c-1.95-1.96-5.11-1.96-7.07 0L9.88 7.05 8.46 5.64l1.42-1.42c2.73-2.73 7.16-2.73 9.9 0 2.73 2.74 2.73 7.17 0 9.9l-1.42 1.42-1.41-1.42 1.41-1.41c1.96-1.96 1.96-5.12 0-7.07zm-2.12 3.53l-7.07 7.07-1.41-1.41 7.07-7.07 1.41 1.41zm-12.02.71l1.42-1.42 1.41 1.42-1.41 1.41c-1.96 1.96-1.96 5.12 0 7.07 1.95 1.96 5.11 1.96 7.07 0l1.41-1.41 1.42 1.41-1.42 1.42c-2.73 2.73-7.16 2.73-9.9 0-2.73-2.74-2.73-7.17 0-9.9z"></path></g></svg></span><span class="menu-item__label">링크 복사하기</span></button><button type="button" role="menuitem" class="menu-item share-menu-item--chat"><span class="menu-item__icon"><svg viewBox="0 0 24 24" aria-hidden="true"><g><path d="M1.998 5.5c0-1.381 1.119-2.5 2.5-2.5h15c1.381 0 2.5 1.119 2.5 2.5v13c0 1.381-1.119 2.5-2.5 2.5h-15c-1.381 0-2.5-1.119-2.5-2.5v-13zm2.5-.5c-.276 0-.5.224-.5.5v2.764l8 3.638 8-3.636V5.5c0-.276-.224-.5-.5-.5h-15zm15.5 5.463l-8 3.636-8-3.638V18.5c0 .276.224.5.5.5h15c.276 0 .5-.224.5-.5v-8.037z"></path></g></svg></span><span class="menu-item__label">Chat으로 전송하기</span></button><button type="button" role="menuitem" class="menu-item share-menu-item--bookmark"><span class="menu-item__icon"><svg viewBox="0 0 24 24" aria-hidden="true"><g><path d="M18 3V0h2v3h3v2h-3v3h-2V5h-3V3zm-7.5 1a.5.5 0 00-.5.5V7h3.5A2.5 2.5 0 0116 9.5v3.48l3 2.1V11h2v7.92l-5-3.5v7.26l-6.5-3.54L3 22.68V9.5A2.5 2.5 0 015.5 7H8V4.5A2.5 2.5 0 0110.5 2H12v2zm-5 5a.5.5 0 00-.5.5v9.82l4.5-2.46 4.5 2.46V9.5a.5.5 0 00-.5-.5z"></path></g></svg></span><span class="menu-item__label">폴더에 북마크 추가하기</span></button></div></div></div>`;
        lc.addEventListener("click", (e) => {
            const item = e.target.closest(".menu-item");
            if (!item) { e.stopPropagation(); return; }
            e.preventDefault(); e.stopPropagation();
            if (item.classList.contains("share-menu-item--copy")) { copyShareLink(activeShareButton ?? button); return; }
            if (item.classList.contains("share-menu-item--chat")) { openShareChatModal(activeShareButton ?? button); return; }
            if (item.classList.contains("share-menu-item--bookmark")) { openShareBookmarkModal(activeShareButton ?? button); return; }
            closeShareDropdown();
        });
        layersRoot.appendChild(lc);
        activeShareDropdown = lc; activeShareButton = button;
        button.setAttribute("aria-expanded", "true");
    }

    // ===== 더보기 드롭다운 =====
    function closeMoreDropdown() {
        if (!activeMoreDropdown) return;
        activeMoreDropdown.remove(); activeMoreDropdown = null;
        if (activeMoreButton) { activeMoreButton.setAttribute("aria-expanded", "false"); activeMoreButton = null; }
    }

    function getCommunityUserMeta(button) {
        const card = button.closest(".communityPostCard");
        const handle = getTextContent(card?.querySelector(".postHandle")) || "@user";
        const displayName = getTextContent(card?.querySelector(".postName")) || "사용자";
        return { card, handle, displayName };
    }

    function showCommunityToast(message) {
        activeCommunityToast?.remove();
        const toast = document.createElement("div");
        toast.className = "notification-toast"; toast.setAttribute("role", "status"); toast.textContent = message;
        document.body.appendChild(toast); activeCommunityToast = toast;
        window.setTimeout(() => { if (activeCommunityToast === toast) activeCommunityToast = null; toast.remove(); }, 3000);
    }

    function closeCommunityModal() {
        if (!activeCommunityModal) return;
        activeCommunityModal.remove(); activeCommunityModal = null;
        document.body.classList.remove("modal-open");
    }

    function openCommunityBlockModal(button) {
        const { handle } = getCommunityUserMeta(button);
        closeMoreDropdown(); closeCommunityModal();
        const modal = document.createElement("div");
        modal.className = "notification-dialog notification-dialog--block";
        modal.innerHTML = `<div class="notification-dialog__backdrop"></div><div class="notification-dialog__card notification-dialog__card--small" role="alertdialog" aria-modal="true" aria-labelledby="community-block-title" aria-describedby="community-block-desc"><h2 id="community-block-title" class="notification-dialog__title">${escapeHtml(handle)} 님을 차단할까요?</h2><p id="community-block-desc" class="notification-dialog__description">내 공개 게시물을 볼 수 있지만 더 이상 게시물에 참여할 수 없습니다. 또한 ${escapeHtml(handle)} 님은 나를 팔로우하거나 쪽지를 보낼 수 없으며, 이 계정과 관련된 알림도 내게 표시되지 않습니다.</p><div class="notification-dialog__actions"><button type="button" class="notification-dialog__danger notification-dialog__confirm-block">차단</button><button type="button" class="notification-dialog__secondary notification-dialog__close">취소</button></div></div>`;
        modal.addEventListener("click", (e) => {
            if (e.target.classList.contains("notification-dialog__backdrop") || e.target.closest(".notification-dialog__close")) { e.preventDefault(); closeCommunityModal(); return; }
            if (e.target.closest(".notification-dialog__confirm-block")) { e.preventDefault(); showCommunityToast(`${handle} 님을 차단했습니다`); closeCommunityModal(); }
        });
        document.body.appendChild(modal); document.body.classList.add("modal-open"); activeCommunityModal = modal;
    }

    function openCommunityReportModal(button) {
        closeMoreDropdown(); closeCommunityModal();
        const modal = document.createElement("div");
        modal.className = "notification-dialog notification-dialog--report";
        modal.innerHTML = `<div class="notification-dialog__backdrop"></div><div class="notification-dialog__card notification-dialog__card--report" role="dialog" aria-modal="true" aria-labelledby="community-report-title"><div class="notification-dialog__header"><button type="button" class="notification-dialog__icon-btn notification-dialog__close" aria-label="돌아가기"><svg viewBox="0 0 24 24" aria-hidden="true"><g><path d="M7.414 13l5.043 5.04-1.414 1.42L3.586 12l7.457-7.46 1.414 1.42L7.414 11H21v2H7.414z"></path></g></svg></button><h2 id="community-report-title" class="notification-dialog__title">신고하기</h2></div><div class="notification-dialog__body"><p class="notification-dialog__question">이 게시물에 어떤 문제가 있나요?</p><ul class="notification-report__list">${communityReportReasons.map(r => `<li><button type="button" class="notification-report__item"><span>${escapeHtml(r)}</span><svg viewBox="0 0 24 24" aria-hidden="true"><g><path d="M9.293 6.293 10.707 4.88 17.828 12l-7.121 7.12-1.414-1.413L14.999 12z"></path></g></svg></button></li>`).join("")}</ul></div></div>`;
        modal.addEventListener("click", (e) => {
            if (e.target.classList.contains("notification-dialog__backdrop") || e.target.closest(".notification-dialog__close")) { e.preventDefault(); closeCommunityModal(); return; }
            if (e.target.closest(".notification-report__item")) { e.preventDefault(); showCommunityToast("신고가 접수되었습니다"); closeCommunityModal(); }
        });
        document.body.appendChild(modal); document.body.classList.add("modal-open"); activeCommunityModal = modal;
    }

    function handleMoreDropdownAction(button, actionClass) {
        const { handle } = getCommunityUserMeta(button);
        if (actionClass === "menu-item--follow-toggle") {
            const isF = communityFollowState.get(handle) ?? false;
            communityFollowState.set(handle, !isF);
            closeMoreDropdown();
            showCommunityToast(isF ? `${handle} 님 팔로우를 취소했습니다` : `${handle} 님을 팔로우했습니다`);
            return;
        }
        if (actionClass === "menu-item--block") { openCommunityBlockModal(button); return; }
        if (actionClass === "menu-item--report") { openCommunityReportModal(button); }
    }

    function getMoreDropdownItems(button) {
        const { handle } = getCommunityUserMeta(button);
        const isF = communityFollowState.get(handle) ?? false;
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
    }

    function openMoreDropdown(button) {
        if (!layersRoot) return;
        closeMoreDropdown(); closeShareDropdown();
        const rect = button.getBoundingClientRect();
        const top = rect.bottom + window.scrollY + 8;
        const right = Math.max(16, window.innerWidth - rect.right);
        const items = getMoreDropdownItems(button);
        const lc = document.createElement("div");
        lc.className = "layers-dropdown-container";
        lc.innerHTML = `<div class="layers-overlay"></div><div class="layers-dropdown-inner"><div role="menu" class="dropdown-menu" style="top:${top}px;right:${right}px;"><div class="dropdown-inner" data-testid="Dropdown">${items.map(it => `<button type="button" role="menuitem" class="menu-item ${it.actionClass}"><span class="menu-item__icon">${it.icon}</span><span class="menu-item__label">${escapeHtml(it.label)}</span></button>`).join("")}</div></div></div>`;
        lc.addEventListener("click", (e) => {
            const item = e.target.closest(".menu-item");
            if (item) {
                e.preventDefault(); e.stopPropagation();
                const ac = Array.from(item.classList).find(c => c.startsWith("menu-item--")) ?? "";
                if (activeMoreButton) handleMoreDropdownAction(activeMoreButton, ac);
                return;
            }
            e.stopPropagation();
        });
        layersRoot.appendChild(lc);
        activeMoreDropdown = lc; activeMoreButton = button;
        button.setAttribute("aria-expanded", "true");
    }

});

// contenteditable에 공통으로 쓰는 커서 이동 유틸이다.
function placeCaretAtEnd(element) {
    const selection = window.getSelection(); if (!selection) return;
    const range = document.createRange(); range.selectNodeContents(element); range.collapse(false);
    selection.removeAllRanges(); selection.addRange(range);
}
