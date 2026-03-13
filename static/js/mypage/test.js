window.onload = () => {
    // ================================================================
    // 유틸 함수
    // ================================================================

    function escapeHtml(value = "") {
        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function getTextContent(el) {
        return el ? el.textContent.trim() : "";
    }

    // ================================================================
    // 모달 공통 열기 / 닫기
    // ================================================================

    const modalBackDrop = document.querySelector(".Modal-BackDrop");

    // 모달 열기
    function openModal(overlayEl) {
        overlayEl?.classList.remove("off");
        modalBackDrop?.classList.remove("off");
        document.body.classList.add("modal-open");
    }

    // 모달 닫기
    function closeModal(overlayEl) {
        overlayEl?.classList.add("off");
        modalBackDrop?.classList.add("off");
        document.body.classList.remove("modal-open");
    }

    // 백드롭 클릭 시 열려있는 모달 닫기
    modalBackDrop?.addEventListener("click", () => {
        const openModals = document.querySelectorAll(
            ".Profile-Edit-Modal-Overlay:not(.off), .Product-Write-Modal:not(.off)",
        );
        if (openModals.length > 0) {
            if (
                document.querySelector(".Profile-Edit-Modal-Overlay:not(.off)")
            ) {
                resetProfileEditModal();
            }
            if (document.querySelector(".Product-Write-Modal:not(.off)")) {
                resetProductModal();
            }
            openModals.forEach((m) => m.classList.add("off"));
            modalBackDrop.classList.add("off");
            document.body.classList.remove("modal-open");
        }
    });

    // ================================================================
    // 상단 헤더 - 커버 배너 / 프로필 아바타 이미지 프리뷰
    // ================================================================

    const mediaPreviewOverlay = document.querySelector(
        ".Post-Media-Preview-Overlay",
    );
    const mediaPreviewImage = document.querySelector(
        ".Post-Media-Preview-Image",
    );
    const mediaPreviewClose = document.querySelector(
        ".Post-Media-Preview-Close",
    );

    function openMediaPreview(src, alt = "") {
        if (!src || !mediaPreviewOverlay) return;
        mediaPreviewImage.src = src;
        mediaPreviewImage.alt = alt;
        mediaPreviewOverlay.classList.remove("off");
        document.body.classList.add("modal-open");
    }

    function closeMediaPreview() {
        mediaPreviewOverlay?.classList.add("off");
        mediaPreviewImage.src = "";
        document.body.classList.remove("modal-open");
    }

    mediaPreviewClose?.addEventListener("click", closeMediaPreview);
    mediaPreviewOverlay?.addEventListener("click", (e) => {
        if (e.target === mediaPreviewOverlay) closeMediaPreview();
    });

    // 커버 배너 클릭 → 프리뷰
    document
        .querySelector(".Profile-Banner img")
        ?.addEventListener("click", (e) => {
            const src = e.currentTarget.src;
            if (src) openMediaPreview(src, "커버 배너");
        });

    // 프로필 아바타 클릭 → 프리뷰
    document
        .querySelector(".Profile-Avatar-Img")
        ?.addEventListener("click", (e) => {
            const src = e.currentTarget.src;
            if (src) openMediaPreview(src, "프로필 이미지");
        });

    // ================================================================
    // 프로필 수정 버튼 → 프로필 수정 모달
    // ================================================================

    const profileEditModalOverlay = document.querySelector(
        ".Profile-Edit-Modal-Overlay",
    );
    const profileEditCloseBtn = document.querySelector(
        ".Profile-Edit-Close-Button",
    );
    const profileEditSaveBtn = document.querySelector(
        ".Profile-Edit-Save-Button",
    );

    document
        .querySelector(".Profile-Edit-Btn.Edit")
        ?.addEventListener("click", () => {
            openModal(profileEditModalOverlay);
        });

    profileEditCloseBtn?.addEventListener("click", () => {
        resetProfileEditModal();
        closeModal(profileEditModalOverlay);
    });

    // 프로필 수정 모달 - 각 입력란 focus 테두리 색 변경
    profileEditModalOverlay
        ?.querySelectorAll(
            ".Profile-Edit-Name-Input, .Profile-Edit-Bio-Textarea, .Profile-Edit-Location-Input, .Profile-Edit-Website-Input",
        )
        .forEach((input) => {
            const fieldInner = input.closest(".Profile-Edit-Field-Inner");

            input.addEventListener("focus", () => {
                fieldInner?.style.setProperty("border-color", "#1d9bf0");
            });
            input.addEventListener("blur", () => {
                fieldInner?.style.removeProperty("border-color");
            });

            // 입력 수 카운터 업데이트
            const counter = input
                .closest(".Profile-Edit-Field-Inner")
                ?.querySelector(".Profile-Edit-Field-Counter");
            if (counter) {
                const max = parseInt(
                    input.getAttribute("maxlength") || "0",
                    10,
                );
                input.addEventListener("input", () => {
                    counter.textContent = `${input.value.length} / ${max}`;
                });
            }
        });

    // 프로필 수정 모달 - 저장 버튼
    profileEditSaveBtn?.addEventListener("click", () => {
        const name = profileEditModalOverlay
            .querySelector(".Profile-Edit-Name-Input")
            ?.value.trim();
        const bio = profileEditModalOverlay
            .querySelector(".Profile-Edit-Bio-Textarea")
            ?.value.trim();
        const loc = profileEditModalOverlay
            .querySelector(".Profile-Edit-Location-Input")
            ?.value.trim();
        const website = profileEditModalOverlay
            .querySelector(".Profile-Edit-Website-Input")
            ?.value.trim();

        if (!name) {
            alert("이름을 입력해주세요.");
            return;
        }

        // TODO: REST API - 프로필 수정 submit
        // PATCH /api/profile  body: FormData { displayName, description, location, url, bannerFile, avatarFile }
        console.log("프로필 수정 submit:", { name, bio, loc, website });
        resetProfileEditModal();
        closeModal(profileEditModalOverlay);
    });

    // 프로필 수정 모달 - 배너/아바타 파일 인풋 연결
    const bannerFileInput = document.querySelector(
        ".Profile-Edit-Banner-FileInput",
    );
    const avatarFileInput = document.querySelector(
        ".Profile-Edit-Avatar-FileInput",
    );

    document
        .querySelector(".Profile-Edit-Banner-Button")
        ?.addEventListener("click", () => {
            bannerFileInput?.click();
        });
    document
        .querySelector(".Profile-Edit-Avatar-Button")
        ?.addEventListener("click", () => {
            avatarFileInput?.click();
        });

    // 배너 파일 선택 → 모달 내 배너 영역 배경만 변경
    bannerFileInput?.addEventListener("change", (e) => {
        const file = e.target.files?.[0];
        if (!file || !file.type.startsWith("image/")) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            const bannerArea = document.querySelector(
                ".Profile-Edit-Banner-Area",
            );
            if (bannerArea)
                bannerArea.style.backgroundImage = `url(${ev.target.result})`;
        };
        reader.readAsDataURL(file);
    });

    // 아바타 파일 선택 → 모달 내 아바타 영역 배경만 변경
    avatarFileInput?.addEventListener("change", (e) => {
        const file = e.target.files?.[0];
        if (!file || !file.type.startsWith("image/")) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            const avatarArea = document.querySelector(
                ".Profile-Edit-Avatar-Image",
            );
            if (avatarArea)
                avatarArea.style.backgroundImage = `url(${ev.target.result})`;
        };
        reader.readAsDataURL(file);
    });

    // 모달 닫기(취소) 시 모달 미리보기 원복
    function resetProfileEditModal() {
        if (bannerFileInput) bannerFileInput.value = "";
        if (avatarFileInput) avatarFileInput.value = "";
        const bannerArea = document.querySelector(".Profile-Edit-Banner-Area");
        if (bannerArea) bannerArea.style.removeProperty("background-image");
        const avatarArea = document.querySelector(".Profile-Edit-Avatar-Image");
        if (avatarArea) avatarArea.style.removeProperty("background-image");
    }

    // ================================================================
    // 네비게이션 바
    // ================================================================

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

            // TODO: REST API - 탭별 게시글/답글/상품/좋아요 목록 불러오기
            // const tabName = nav.classList[1]; // Posts | Replies | MyProducts | Likes
            // GET /api/profile/{userId}/{tabName}?page=0&size=20
        });
    });

    // ================================================================
    // 게시글 피드 공통 - 좋아요 / 북마크 / 더보기 / 공유
    // ================================================================

    // --- 좋아요 ---
    function handleLikeClick(btn) {
        const isLiked = btn.classList.contains("liked");
        btn.classList.toggle("liked", !isLiked);

        // 첫 번째 svg = 빈 하트, 두 번째 svg = 찬 하트
        const [emptyHeart, fullHeart] = btn.querySelectorAll("svg");
        emptyHeart?.classList.toggle("off", !isLiked); // 좋아요 시 빈하트 off
        fullHeart?.classList.toggle("off", isLiked); // 좋아요 시 찬하트 on

        // 카운트 업데이트
        const countEl = btn.querySelector(".Post-Action-Count");
        if (countEl) {
            const cur =
                parseInt(countEl.textContent.replace(/[^0-9]/g, ""), 10) || 0;
            countEl.textContent = isLiked ? cur - 1 : cur + 1;
        }

        // 팝 애니메이션
        btn.classList.remove("pop");
        void btn.offsetWidth;
        btn.classList.add("pop");
        btn.addEventListener(
            "animationend",
            () => btn.classList.remove("pop"),
            { once: true },
        );

        // TODO: REST API - 좋아요 toggle
        // isLiked ? DELETE /api/posts/{postId}/like : POST /api/posts/{postId}/like
    }

    // --- 북마크 ---
    function handleBookmarkClick(btn) {
        const isBookmarked = btn.classList.contains("bookmarked");
        btn.classList.toggle("bookmarked", !isBookmarked);

        // 첫 번째 svg = 빈 북마크, 두 번째 svg = 찬 북마크
        const [emptyBk, fullBk] = btn.querySelectorAll("svg");
        emptyBk?.classList.toggle("off", !isBookmarked); // 북마크 시 빈북마크 off
        fullBk?.classList.toggle("off", isBookmarked); // 북마크 시 찬북마크 on

        // 팝 애니메이션
        btn.classList.remove("pop");
        void btn.offsetWidth;
        btn.classList.add("pop");
        btn.addEventListener(
            "animationend",
            () => btn.classList.remove("pop"),
            { once: true },
        );

        // TODO: REST API - 북마크 toggle
        // isBookmarked ? DELETE /api/posts/{postId}/bookmark : POST /api/posts/{postId}/bookmark
    }

    // --- 더보기 메뉴 ---
    let activeMoreMenu = null; // 기준 버튼 엘리먼트
    let activeMenuEl = null; // 현재 열린 메뉴 엘리먼트
    let menuTrackRaf = null; // requestAnimationFrame ID

    const postMoreMenuPost = document.querySelector(".Post-More-Menu.Post");
    const postMoreMenuProduct = document.querySelector(
        ".Post-More-Menu.Product",
    );
    const postMoreMenuShare = document.querySelector(".Post-More-Menu.Share");

    function closeAllMoreMenus() {
        [postMoreMenuPost, postMoreMenuProduct, postMoreMenuShare].forEach(
            (m) => {
                m?.classList.add("off");
            },
        );
        activeMoreMenu = null;
        activeMenuEl = null;
        if (menuTrackRaf) {
            cancelAnimationFrame(menuTrackRaf);
            menuTrackRaf = null;
        }
    }

    // 버튼 위치를 매 프레임 추적해서 메뉴에 반영
    function trackMenuPosition() {
        if (!activeMoreMenu || !activeMenuEl) return;
        const rect = activeMoreMenu.getBoundingClientRect();

        // 메뉴 너비를 먼저 읽어서 화면 밖으로 나가면 오른쪽 정렬
        const menuW = activeMenuEl.offsetWidth;
        let left = rect.left;
        if (left + menuW > window.innerWidth - 8) {
            left = rect.right - menuW;
        }
        activeMenuEl.style.top = `${rect.bottom + 4}px`;
        activeMenuEl.style.left = `${left}px`;

        menuTrackRaf = requestAnimationFrame(trackMenuPosition);
    }

    // 더보기 버튼 아래로 메뉴 위치 이동 + 추적 시작
    function positionMenuUnderBtn(menuEl, btnEl) {
        if (menuTrackRaf) cancelAnimationFrame(menuTrackRaf);
        menuEl.style.position = "fixed";
        menuEl.style.zIndex = "9999";
        activeMenuEl = menuEl;
        activeMoreMenu = btnEl;
        trackMenuPosition(); // 즉시 1회 위치 반영 후 루프 시작
    }

    // 문서 클릭 시 더보기 메뉴 닫기
    document.addEventListener("click", (e) => {
        if (
            !e.target.closest(".Post-More-Menu") &&
            !e.target.closest(".Post-More-Button") &&
            !e.target.closest(".Post-Action-Btn.Share")
        ) {
            closeAllMoreMenus();
        }
    });

    // Escape 키
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            closeAllMoreMenus();
            closeShareModal();
            closeMediaPreview();
        }
    });

    // --- 공유 버튼 클릭 ---
    function handleShareBtnClick(btn) {
        // 이미 열려있으면 닫기
        if (
            !postMoreMenuShare.classList.contains("off") &&
            activeMoreMenu === btn
        ) {
            closeAllMoreMenus();
            return;
        }
        closeAllMoreMenus();
        positionMenuUnderBtn(postMoreMenuShare, btn);
        postMoreMenuShare.classList.remove("off");
    }

    // ================================================================
    // 피드 영역 이벤트 위임 (게시글 / 답글 / 좋아요 공통)
    // ================================================================

    document
        .querySelector(".Primary-Column")
        ?.addEventListener("click", (e) => {
            // 좋아요
            const likeBtn = e.target.closest(".Post-Action-Btn.Like");
            if (likeBtn) {
                e.preventDefault();
                handleLikeClick(likeBtn);
                return;
            }

            // 북마크
            const bookmarkBtn = e.target.closest(".Post-Action-Btn.Bookmark");
            if (bookmarkBtn) {
                e.preventDefault();
                handleBookmarkClick(bookmarkBtn);
                return;
            }

            // 더보기 버튼 (게시글/답글 - .Post-More-Menu.Post)
            const moreBtn = e.target.closest(".Post-Card .Post-More-Button");
            if (moreBtn) {
                e.preventDefault();
                e.stopPropagation();
                // 내 상품 탭의 상품 카드 더보기는 Product 메뉴 사용
                const card = moreBtn.closest(".Post-Card");
                const isProductTab = card?.closest(
                    ".Profile-Content.MyProducts",
                );
                const targetMenu = isProductTab
                    ? postMoreMenuProduct
                    : postMoreMenuPost;
                const otherMenu = isProductTab
                    ? postMoreMenuPost
                    : postMoreMenuProduct;

                if (
                    !targetMenu.classList.contains("off") &&
                    activeMoreMenu === moreBtn
                ) {
                    closeAllMoreMenus();
                    return;
                }
                closeAllMoreMenus();
                positionMenuUnderBtn(targetMenu, moreBtn);
                targetMenu.classList.remove("off");
                otherMenu?.classList.add("off");
                activeMoreMenu = moreBtn;
                return;
            }

            // 공유 버튼
            const shareBtn = e.target.closest(".Post-Action-Btn.Share");
            if (shareBtn) {
                e.preventDefault();
                e.stopPropagation();
                handleShareBtnClick(shareBtn);
                return;
            }

            // 이미지 클릭 → 미디어 프리뷰
            const imgEl = e.target.closest(".Post-Media-Img");
            if (imgEl) {
                e.preventDefault();
                openMediaPreview(imgEl.src, imgEl.alt);
                return;
            }
        });

    // ================================================================
    // 내 상품 피드 - 상품 등록 버튼
    // ================================================================

    const productWriteModal = document.querySelector(".Product-Write-Modal");
    const productModalClose = document.querySelector(
        ".Product-Write-Modal .Modal-Close-Button",
    );
    const productCancelBtn = document.querySelector(
        ".Input-Footer-Button.cancel",
    );
    const productSubmitBtn = document.querySelector(
        ".Input-Footer-Button.submit",
    );

    document
        .querySelector(".Content-Header-Button")
        ?.addEventListener("click", () => {
            openModal(productWriteModal);
        });

    productModalClose?.addEventListener("click", () => {
        resetProductModal();
        closeModal(productWriteModal);
    });
    productCancelBtn?.addEventListener("click", () => {
        resetProductModal();
        closeModal(productWriteModal);
    });

    function resetProductModal() {
        selectedTags = [];
        renderTags();
        showTopChips();
        // 입력값 초기화
        productWriteModal
            ?.querySelectorAll(".Content-Input, .Content-Textarea")
            .forEach((i) => (i.value = ""));
        composerTagEditor?.classList.add("off");
        composerTagToggle?.classList.remove("off");
        // 이미지 초기화
        resetProductImages();
    }

    // ================================================================
    // 상품 등록 모달 - 이미지 업로드 (최대 4장)
    // ================================================================

    const productImageInput = document.getElementById("productImageInput");
    const productImageArea = document.querySelector(
        ".Product-Image-Upload-Area",
    );
    const productImageGrid = document.querySelector(
        ".Product-Image-Preview-Grid",
    );
    const productImagePlaceholder = document.querySelector(
        ".Product-Image-Upload-Placeholder",
    );
    const productImageResetBtn = document.querySelector(
        ".Product-Image-Reset-Btn",
    );
    const productImageHidden = document.getElementById("productImageHidden");

    const MAX_IMAGES = 4;
    let productImages = []; // [{ file, dataUrl }]

    // 업로드 영역 클릭 → file input 트리거
    productImageArea?.addEventListener("click", (e) => {
        if (e.target.closest(".Product-Image-Reset-Btn")) return;
        if (productImages.length >= MAX_IMAGES) return;
        productImageInput?.click();
    });

    // 파일 선택
    productImageInput?.addEventListener("change", (e) => {
        const files = Array.from(e.target.files || []);
        const remaining = MAX_IMAGES - productImages.length;
        const toAdd = files.slice(0, remaining);

        toAdd.forEach((file) => {
            if (!file.type.startsWith("image/")) return;
            const reader = new FileReader();
            reader.onload = (ev) => {
                productImages.push({ file, dataUrl: ev.target.result });
                renderProductImageGrid();
            };
            reader.readAsDataURL(file);
        });

        // input 초기화 (같은 파일 재선택 가능하도록)
        e.target.value = "";
    });

    // 초기화 버튼
    productImageResetBtn?.addEventListener("click", (e) => {
        e.stopPropagation();
        resetProductImages();
    });

    function resetProductImages() {
        productImages = [];
        if (productImageInput) productImageInput.value = "";
        if (productImageHidden) productImageHidden.value = "";
        renderProductImageGrid();
    }

    function renderProductImageGrid() {
        if (
            !productImageGrid ||
            !productImagePlaceholder ||
            !productImageResetBtn
        )
            return;

        const count = productImages.length;

        // 초기화 버튼 활성/비활성
        productImageResetBtn.disabled = count === 0;
        productImageResetBtn.classList.toggle("off", count === 0);

        // 이미지 없으면 placeholder 표시
        if (count === 0) {
            productImagePlaceholder.classList.remove("off");
            productImageGrid.classList.add("off");
            productImageGrid.innerHTML = "";
            return;
        }

        productImagePlaceholder.classList.add("off");
        productImageGrid.classList.remove("off");
        productImageGrid.innerHTML = "";

        if (productImageHidden) {
            productImageHidden.value = productImages
                .map((i) => i.file.name)
                .join(",");
        }

        // flex 기반 그리드 컨테이너
        const grid = document.createElement("div");
        grid.className = "Product-Img-Grid";
        grid.dataset.count = count;

        productImages.forEach((img, index) => {
            const item = document.createElement("div");
            item.className = "Product-Img-Item";

            const imgEl = document.createElement("img");
            imgEl.src = img.dataUrl;
            imgEl.alt = "상품 이미지";
            imgEl.draggable = false;

            const removeBtn = document.createElement("button");
            removeBtn.type = "button";
            removeBtn.className = "Product-Image-Remove-Btn";
            removeBtn.setAttribute("aria-label", "이미지 삭제");
            removeBtn.innerHTML = `<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M10.59 12L4.54 5.96l1.42-1.42L12 10.59l6.04-6.05 1.42 1.42L13.41 12l6.05 6.04-1.42 1.42L12 13.41l-6.04 6.05-1.42-1.42L10.59 12z"/></svg>`;
            removeBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                productImages.splice(index, 1);
                renderProductImageGrid();
            });

            item.appendChild(imgEl);
            item.appendChild(removeBtn);
            grid.appendChild(item);
        });

        productImageGrid.appendChild(grid);
    }

    // 상품 등록 모달 - 입력란 focus 테두리 색
    productWriteModal
        ?.querySelectorAll(".Content-Input, .Content-Textarea")
        .forEach((input) => {
            const wrapper = input.closest(
                ".Content-Input-Wrapper, .Form-Input-Content",
            );
            input.addEventListener("focus", () => {
                input.style.setProperty("outline-color", "#1d9bf0");
                input.style.setProperty("border-color", "#1d9bf0");
            });
            input.addEventListener("blur", () => {
                input.style.removeProperty("outline-color");
                input.style.removeProperty("border-color");
            });
        });

    // 상품 등록 - 등록하기 submit
    productSubmitBtn?.addEventListener("click", (e) => {
        e.preventDefault();
        const inputs = productWriteModal.querySelectorAll(
            ".Content-Input, .Content-Textarea",
        );
        for (const inp of inputs) {
            if (!inp.value.trim()) {
                alert("모든 항목을 입력해주세요.");
                inp.focus();
                return;
            }
        }
        // TODO: REST API - 상품 등록 submit
        // POST /api/products  body: FormData { postName, postPrice, postStock, postContent, postTag }
        console.log("상품 등록 submit");
        closeModal(productWriteModal);
    });

    // ================================================================
    // 상품 등록 모달 - 카테고리 칩 스크롤
    // ================================================================

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

    scrollLeftBtn?.addEventListener("click", () => {
        categoryScroll.scrollBy({ left: -160, behavior: "smooth" });
    });
    scrollRightBtn?.addEventListener("click", () => {
        categoryScroll.scrollBy({ left: 160, behavior: "smooth" });
    });

    // ================================================================
    // 상품 등록 모달 - 카테고리 칩 선택 + 서브카테고리 + 태그 추가
    // ================================================================

    const tagList = document.getElementById("tagList");
    const postTagsInput = document.querySelector("input[name='postTag']");
    const composerTagToggle = document.getElementById("composerTagToggle");
    const composerTagEditor = document.getElementById("composerTagEditor");
    const productTagInput = document.getElementById("productTag");

    // 원본 대카테고리 칩 목록 저장 (DOM에서 한 번만 읽음)
    const originalChips = categoryScroll
        ? Array.from(categoryScroll.querySelectorAll(".Cat-Chip"))
        : [];

    // 현재 뷰 상태: "top" = 대카테고리 목록, "sub" = 서브카테고리 뷰
    let chipViewState = "top";
    // 현재 열린 서브카테고리의 부모 칩 정보
    let activeParentChip = null; // { name, subs: [...] }
    // 선택된 태그 목록 { tagLabel: string (표시용, 최종 이름), chipKey: string (칩 식별용) }
    let selectedTags = []; // [{ label, chipKey }]

    // ── 태그 렌더링 ──
    function renderTags() {
        if (!tagList) return;
        if (selectedTags.length === 0) {
            tagList.classList.add("off");
            tagList.innerHTML = "";
            if (postTagsInput) postTagsInput.value = "";
            return;
        }
        tagList.classList.remove("off");
        tagList.innerHTML = selectedTags
            .map(
                ({ label }) =>
                    `<span class="Category-Tag" data-tag="${escapeHtml(label)}">
                ${escapeHtml(label)}
                <button type="button" class="Tag-Remove-Btn" aria-label="태그 삭제">✕</button>
            </span>`,
            )
            .join("");
        if (postTagsInput)
            postTagsInput.value = selectedTags.map((t) => t.label).join(",");
    }

    // ── 태그 추가 (label: 표시 이름, chipKey: 칩 식별 키) ──
    function addTag(label, chipKey) {
        const trimmed = label.trim();
        if (!trimmed) return;
        if (selectedTags.some((t) => t.chipKey === chipKey)) return; // 중복 방지
        selectedTags.push({ label: trimmed, chipKey });
        renderTags();
    }

    // ── 태그 제거 + 해당 칩 색상 원복 ──
    function removeTagByKey(chipKey) {
        selectedTags = selectedTags.filter((t) => t.chipKey !== chipKey);
        renderTags();
        // 현재 보이는 칩 중 해당 키를 가진 칩 원복
        categoryScroll
            ?.querySelectorAll(".Cat-Chip--Sub-Active, .Cat-Chip--Active")
            .forEach((chip) => {
                const key = chip.dataset.chipKey || chip.dataset.cat;
                if (key === chipKey) {
                    chip.classList.remove(
                        "Cat-Chip--Sub-Active",
                        "Cat-Chip--Active",
                    );
                }
            });
    }

    // ── 태그 삭제 버튼 이벤트 위임 ──
    tagList?.addEventListener("click", (e) => {
        const removeBtn = e.target.closest(".Tag-Remove-Btn");
        if (!removeBtn) return;
        const tagEl = removeBtn.closest(".Category-Tag");
        const label = tagEl?.dataset.tag;
        if (!label) return;
        const found = selectedTags.find((t) => t.label === label);
        if (found) removeTagByKey(found.chipKey);
    });

    // ── 대카테고리 뷰 렌더링 ──
    function showTopChips() {
        if (!categoryScroll) return;
        chipViewState = "top";
        activeParentChip = null;
        categoryScroll.innerHTML = "";
        originalChips.forEach((chip) => {
            // 선택 상태 복원
            const chipKey = chip.dataset.cat;
            const isSelected = selectedTags.some((t) => t.chipKey === chipKey);
            chip.classList.toggle("Cat-Chip--Active", isSelected);
            chip.classList.remove("Cat-Chip--Parent-Highlight");
            categoryScroll.appendChild(chip);
        });
        categoryScroll.scrollLeft = 0;
        updateScrollArrows();
    }

    // ── 서브카테고리 뷰 렌더링 ──
    function showSubChips(parentName, subsArray) {
        if (!categoryScroll) return;
        chipViewState = "sub";
        activeParentChip = { name: parentName, subs: subsArray };
        categoryScroll.innerHTML = "";

        // 맨 앞에 "← 대카테고리" 복귀 버튼
        const backChip = document.createElement("button");
        backChip.type = "button";
        backChip.className = "Cat-Chip Cat-Chip--Back";
        backChip.textContent = `‹ ${parentName}`;
        backChip.dataset.action = "back";
        categoryScroll.appendChild(backChip);

        // 서브 칩들
        subsArray.forEach((sub) => {
            const subChip = document.createElement("button");
            subChip.type = "button";
            subChip.className = "Cat-Chip";
            subChip.dataset.cat = sub;
            subChip.dataset.parent = parentName;
            subChip.dataset.chipKey = sub; // 태그 식별 키 = 최종 이름
            subChip.textContent = sub;
            // 선택 상태 복원
            const isSelected = selectedTags.some((t) => t.chipKey === sub);
            if (isSelected) subChip.classList.add("Cat-Chip--Sub-Active");
            categoryScroll.appendChild(subChip);
        });

        categoryScroll.scrollLeft = 0;
        updateScrollArrows();
    }

    // ── 카테고리 스크롤 영역 클릭 이벤트 위임 ──
    categoryScroll?.addEventListener("click", (e) => {
        const chip = e.target.closest(".Cat-Chip");
        if (!chip) return;
        e.preventDefault();

        // ① 복귀 버튼 클릭 → 대카테고리 뷰로
        if (chip.dataset.action === "back") {
            showTopChips();
            return;
        }

        const hasSubs = chip.classList.contains("Cat-Chip--Has-Subs");

        // ② 서브카테고리가 있는 대카테고리 칩 클릭 → 서브 뷰 전환
        if (hasSubs && chipViewState === "top") {
            const parentName = chip.dataset.cat;
            const subs = (chip.dataset.subs || "")
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean);
            showSubChips(parentName, subs);
            return;
        }

        // ③ 서브카테고리 칩 클릭 → 선택/해제 (태그는 최종 이름만)
        if (chipViewState === "sub") {
            const chipKey = chip.dataset.chipKey || chip.dataset.cat;
            const isActive = chip.classList.contains("Cat-Chip--Sub-Active");
            chip.classList.toggle("Cat-Chip--Sub-Active", !isActive);
            if (isActive) {
                removeTagByKey(chipKey);
            } else {
                addTag(chipKey, chipKey); // label = chipKey = 최종 이름
            }
            return;
        }

        // ④ 서브 없는 대카테고리 칩 클릭 → 선택/해제
        const chipKey = chip.dataset.cat;
        const isActive = chip.classList.contains("Cat-Chip--Active");
        chip.classList.toggle("Cat-Chip--Active", !isActive);
        if (isActive) {
            removeTagByKey(chipKey);
        } else {
            addTag(chipKey, chipKey);
        }
        updateScrollArrows();
    });

    // 태그 추가 버튼 ↔ input 토글
    composerTagToggle?.addEventListener("click", () => {
        composerTagToggle.classList.add("off");
        composerTagEditor?.classList.remove("off");
        productTagInput?.focus();
    });

    // input Enter → 태그 추가
    productTagInput?.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            const val = productTagInput.value.trim();
            if (val) addTag(val, `manual:${val}`);
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

    // input blur → 태그 추가
    productTagInput?.addEventListener("blur", () => {
        const val = productTagInput.value.trim();
        if (val) addTag(val, `manual:${val}`);
        productTagInput.value = "";
        composerTagEditor?.classList.add("off");
        composerTagToggle?.classList.remove("off");
    });

    // ================================================================
    // Share / 공유하기 기능
    // ================================================================

    let activeShareModal = null;
    let activeShareToast = null;

    function pushSharePath(p) {
        try {
            window.history.pushState({}, "", p);
        } catch {
            return;
        }
    }

    function getSharePostMeta(triggerEl) {
        const card = triggerEl.closest(".Post-Card");
        const handle =
            getTextContent(card?.querySelector(".Post-Handle")) || "@user";
        const bk = card?.querySelector(".Post-Action-Btn.Bookmark") ?? null;
        const allCards = Array.from(document.querySelectorAll(".Post-Card"));
        const idx = Math.max(allCards.indexOf(card), 0) + 1;
        const url = new URL(window.location.href);
        url.pathname = `/${handle.replace("@", "") || "user"}/status/${idx}`;
        url.hash = "";
        url.search = "";
        return {
            handle,
            postCard: card,
            postId: String(idx),
            permalink: url.toString(),
            bookmarkButton: bk,
        };
    }

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

    function setBookmarkButtonState(button, isActive) {
        if (!button) return;
        button.classList.toggle("bookmarked", isActive);
        const [emptyBk, fullBk] = button.querySelectorAll("svg");
        if (emptyBk) emptyBk.style.display = isActive ? "none" : "";
        if (fullBk) fullBk.style.display = isActive ? "" : "none";
    }

    function closeShareModal({ restorePath = true } = {}) {
        if (!activeShareModal) return;
        activeShareModal.remove();
        activeShareModal = null;
        document.body.classList.remove("modal-open");
        if (restorePath)
            pushSharePath(
                window.location.pathname.replace(/\/status\/\d+$/, ""),
            );
    }

    function closeShareMenu(menuEl) {
        menuEl?.classList.add("off");
    }

    // 링크 복사하기
    function copyShareLink(triggerEl) {
        const { permalink } = getSharePostMeta(triggerEl);
        closeShareMenu(postMoreMenuShare);
        if (!navigator.clipboard?.writeText) {
            showShareToast("링크를 복사하지 못했습니다");
            return;
        }
        navigator.clipboard
            .writeText(permalink)
            .then(() => showShareToast("클립보드로 복사함"))
            .catch(() => showShareToast("링크를 복사하지 못했습니다"));
    }

    // Chat으로 전송하기
    function openShareChatModal(triggerEl) {
        closeShareMenu(postMoreMenuShare);
        closeShareModal({ restorePath: false });
        pushSharePath("/messages/compose");

        // 현재 페이지에 팔로우한 사용자 목록 수집
        const users = [];
        document.querySelectorAll(".Sidebar-User-Cell").forEach((cell, i) => {
            const name = getTextContent(
                cell.querySelector(".Sidebar-User-Name"),
            );
            const handle = getTextContent(
                cell.querySelector(".Sidebar-User-Handle"),
            );
            const avatar =
                cell.querySelector(".Sidebar-User-Avatar-Img")?.src || "";
            if (name || handle)
                users.push({ id: `user-${i}`, name, handle, avatar });
        });

        const userRowsHtml =
            users.length === 0
                ? `<div class="Share-Sheet-Empty"><p>전송할 수 있는 사용자가 없습니다.</p></div>`
                : users
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
                <div class="Share-Sheet-List">${userRowsHtml}</div>
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
            if (e.target.closest(".Share-Sheet-User")) {
                e.preventDefault();
                // TODO: REST API - Chat으로 게시글 전송
                // POST /api/messages  body: { toUserId, postId }
                closeShareModal();
            }
        });

        document.body.appendChild(modal);
        document.body.classList.add("modal-open");
        activeShareModal = modal;
    }

    // 폴더에 북마크 추가하기
    function openShareBookmarkModal(triggerEl) {
        const { bookmarkButton } = getSharePostMeta(triggerEl);
        closeShareMenu(postMoreMenuShare);
        closeShareModal({ restorePath: false });
        pushSharePath("/i/bookmarks/add");

        const isBookmarked =
            bookmarkButton?.classList.contains("bookmarked") ?? false;
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
                // TODO: REST API - 새 북마크 폴더 만들기
                // POST /api/bookmarks/folders  body: { name }
                closeShareModal();
                return;
            }
            if (e.target.closest("[data-share-folder='all-bookmarks']")) {
                e.preventDefault();
                setBookmarkButtonState(bookmarkButton, !isBookmarked);
                // TODO: REST API - 북마크 폴더에 추가
                // POST /api/bookmarks/folders/all/posts/{postId}
                closeShareModal();
            }
        });

        document.body.appendChild(modal);
        document.body.classList.add("modal-open");
        activeShareModal = modal;
    }

    // 공유 메뉴 버튼 클릭 이벤트
    // activeMoreMenu는 공유 버튼(.Post-Action-Btn.Share)이므로 triggerEl로 전달
    postMoreMenuShare?.addEventListener("click", (e) => {
        const btn = e.target.closest(".Menu-Button");
        if (!btn) return;
        e.preventDefault();
        e.stopPropagation();

        const text = btn.querySelector(".Button-Text")?.textContent.trim();
        const triggerEl = activeMoreMenu; // 공유 버튼 참조

        if (text === "링크 복사하기") {
            copyShareLink(triggerEl);
        } else if (text === "Chat으로 전송하기") {
            openShareChatModal(triggerEl);
        } else if (text === "폴더에 북마크 추가하기") {
            openShareBookmarkModal(triggerEl);
        }
    });

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") closeShareModal();
    });

    // ================================================================
    // 사이드바 - 팔로우 버튼 hover (Approved ↔ Disapprove)
    // ================================================================

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
        btn.addEventListener("click", () => {
            // TODO: REST API - 팔로우/언팔로우
            // DELETE /api/follow/{userId}
            console.log("팔로우 취소:", btn);
        });
    });

    // ================================================================
    // 초기 실행 - 첫 번째 탭(게시물) 클릭
    // ================================================================

    // Like / Bookmark 버튼 SVG 초기화
    // 서버에서 받아온 데이터 기준으로 실제로는 서버가 liked/bookmarked 상태를 내려줘야 하지만,
    // 현재는 HTML 구조를 통일하고 .off 클래스로 초기 표시 상태만 맞춰준다.

    const EMPTY_HEART_SVG = `<svg viewBox="0 0 24 24" class="Post-Action-Icon" aria-hidden="true"><g><path d="M16.697 5.5c-1.222-.06-2.679.51-3.89 2.16l-.805 1.09-.806-1.09C9.984 6.01 8.526 5.44 7.304 5.5c-1.243.07-2.349.78-2.91 1.91-.552 1.12-.633 2.78.479 4.82 1.074 1.97 3.257 4.27 7.129 6.61 3.87-2.34 6.052-4.64 7.126-6.61 1.111-2.04 1.03-3.7.477-4.82-.561-1.13-1.666-1.84-2.908-1.91zm4.187 7.69c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z"></path></g></svg>`;
    const FULL_HEART_SVG = `<svg viewBox="0 0 24 24" class="Post-Action-Icon" aria-hidden="true"><g><path d="M20.884 13.19c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z"></path></g></svg>`;
    const EMPTY_BK_SVG = `<svg viewBox="0 0 24 24" class="Post-Action-Icon" aria-hidden="true"><g><path d="M4 4.5C4 3.12 5.119 2 6.5 2h11C18.881 2 20 3.12 20 4.5v18.44l-8-5.71-8 5.71V4.5zM6.5 4c-.276 0-.5.22-.5.5v14.56l6-4.29 6 4.29V4.5c0-.28-.224-.5-.5-.5h-11z"></path></g></svg>`;
    const FULL_BK_SVG = `<svg viewBox="0 0 24 24" class="Post-Action-Icon" aria-hidden="true"><g><path d="M4 4.5C4 3.12 5.119 2 6.5 2h11C18.881 2 20 3.12 20 4.5v18.44l-8-5.71-8 5.71V4.5z"></path></g></svg>`;

    function initLikeBookmarkBtns() {
        document.querySelectorAll(".Post-Action-Btn.Like").forEach((btn) => {
            // 이 버튼이 Likes 탭 안에 있는지 확인
            const inLikesTab = !!btn.closest(".Profile-Content.Likes");

            // 기존 SVG 모두 제거, count span은 유지
            const countSpan = btn.querySelector(".Post-Action-Count");
            btn.querySelectorAll("svg").forEach((s) => s.remove());

            // 빈하트 (Likes 탭이면 off, 아니면 표시)
            const emptyEl = document.createElement("span");
            emptyEl.innerHTML = EMPTY_HEART_SVG;
            const emptySvg = emptyEl.firstChild;
            if (inLikesTab) emptySvg.classList.add("off");

            // 찬하트 (Likes 탭이면 표시, 아니면 off)
            const fullEl = document.createElement("span");
            fullEl.innerHTML = FULL_HEART_SVG;
            const fullSvg = fullEl.firstChild;
            if (!inLikesTab) fullSvg.classList.add("off");

            // count span 앞에 삽입
            if (countSpan) {
                btn.insertBefore(emptySvg, countSpan);
                btn.insertBefore(fullSvg, countSpan);
            } else {
                btn.appendChild(emptySvg);
                btn.appendChild(fullSvg);
            }

            // Likes 탭은 이미 liked 상태로 표시
            if (inLikesTab) btn.classList.add("liked");
        });

        document
            .querySelectorAll(".Post-Action-Btn.Bookmark")
            .forEach((btn) => {
                const countSpan = btn.querySelector(".Post-Action-Count");
                btn.querySelectorAll("svg").forEach((s) => s.remove());

                // 빈북마크 (항상 표시)
                const emptyEl = document.createElement("span");
                emptyEl.innerHTML = EMPTY_BK_SVG;
                const emptySvg = emptyEl.firstChild;

                // 찬북마크 (항상 off)
                const fullEl = document.createElement("span");
                fullEl.innerHTML = FULL_BK_SVG;
                const fullSvg = fullEl.firstChild;
                fullSvg.classList.add("off");

                if (countSpan) {
                    btn.insertBefore(emptySvg, countSpan);
                    btn.insertBefore(fullSvg, countSpan);
                } else {
                    btn.appendChild(emptySvg);
                    btn.appendChild(fullSvg);
                }
            });
    }

    initLikeBookmarkBtns();

    document.querySelector(".Profile-Tab-Item.Posts")?.click();
};
