window.onload = () => {
    "use strict";

        // 자주 쓰는 단일/복수 DOM 조회를 짧은 헬퍼로 묶는다.
        const $ = (selector, scope = document) => scope.querySelector(selector);
        const $$ = (selector, scope = document) =>
            Array.from(scope.querySelectorAll(selector));

        // 광고 신청 기본 예산과 1000원당 예상 노출 수를 상수로 고정한다.
        const DEFAULT_BUDGET = 300000;
        const IMPRESSIONS_PER_THOUSAND_WON = 5;

        // 각 화면 전환 시 상단 헤더에 노출할 제목/설명 문구다.
        const viewMeta = {
            apply: {
                title: "광고 신청",
                description:
                    "커뮤니티 피드에 노출할 광고를 간단히 작성하고 결제 후 접수하세요.",
            },
            list: {
                title: "신청 광고 목록",
                description:
                    "접수된 광고 제목, 헤드라인, URL, 첨부파일, 상태를 한 번에 확인할 수 있습니다.",
            },
            detail: {
                title: "광고 상세",
                description:
                    "선택한 광고의 본문과 결제 접수 정보를 확인할 수 있습니다.",
            },
        };

        // 화면 전환, 모달, 드롭다운, 선택 광고, 첨부파일 상태를 한곳에서 관리한다.
        const state = {
            currentView: "apply",
            currentModal: null,
            currentDropdown: null,
            listStatusFilter: "all",
            selectedAdId: "ad-2026-101",
            attachments: [],
            toastTimer: null,
        };

        // 반복 접근하는 DOM 노드를 초기에 캐시해서 이후 로직을 단순하게 유지한다.
        // modal/dropdown/toast는 HTML에 이미 선언된 노드를 재사용하고, attachment/preview 영역만 내부 자식이 다시 렌더링된다.
        const root = {
            title: $("[data-view-title]"),
            description: $("[data-view-description]"),
            views: $$(".MarketplaceAdView"),
            // HTML의 [data-modal-overlay] 기존 오버레이다. event.js는 hidden만 토글한다.
            overlay: $("[data-modal-overlay]"),
            // HTML의 [data-modal] 목록이다. event.js는 append/remove 없이 hidden만 바꾼다.
            modals: $$("[data-modal]"),
            // HTML의 [data-dropdown] 목록이다. event.js는 위치 계산과 hidden 토글만 수행한다.
            dropdowns: $$("[data-dropdown]"),
            accountTrigger: $(".AccountTriggerButton"),
            profileTrigger: $(".ProfileTriggerButton"),
            headerGuideButton: $('[data-header-action="guide"]'),
            headerPaymentButton: $('[data-header-action="payment"]'),
            listSearch: $("[data-list-search]"),
            listStatusFilter: $("[data-list-status-filter]"),
            uploadInput: $("[data-upload-input]"),
            uploadClearButton: $("[data-upload-clear]"),
            attachmentPreview: $("[data-attachment-preview]"),
            // HTML의 [data-attachment-list] 내부는 renderAttachmentGallery()가 replaceChildren()으로 매번 다시 그린다.
            attachmentList: $("[data-attachment-list]"),
            previewAttachmentPlaceholder: $('[data-preview-field="attachmentPlaceholder"]'),
            // HTML의 attachmentGallery 내부는 renderPreviewGallery()가 타일을 지우고 다시 추가하는 마운트 지점이다.
            previewAttachmentGallery: $('[data-preview-field="attachmentGallery"]'),
            previewAttachmentImage: $('[data-preview-field="attachmentImage"]'),
            previewAttachmentVideo: $('[data-preview-field="attachmentVideo"]'),
            // HTML의 [data-toast]는 새 노드를 만들지 않고 텍스트/hidden만 바꿔 재사용한다.
            toast: $("[data-toast]"),
            navApplyItem: $(".AdNavigationApplyItem"),
            navListItem: $(".AdNavigationListItem"),
            navDetailItem: $(".AdNavigationDetailItem"),
        };

        // 통화 입력처럼 숫자 외 문자가 섞인 값에서 숫자만 안전하게 추출한다.
        function parseNumber(value) {
            return Number(String(value || "").replace(/[^\d]/g, "")) || 0;
        }

        // 내부 정수 값을 한국 원화 라벨로 변환한다.
        function formatCurrency(value) {
            return `₩${parseNumber(value).toLocaleString("ko-KR")}`;
        }

        // 노출 수 요약은 항상 "약 n회" 형식으로 맞춘다.
        function formatImpressions(value) {
            return `약 ${Math.max(0, Number(value) || 0).toLocaleString("ko-KR")}회`;
        }

        // 폼 필드 값은 공백을 제거한 문자열로 읽고, 비어 있으면 빈 문자열을 반환한다.
        function getFormValue(fieldName) {
            return (
                $(`[data-form-field="${fieldName}"]`)?.value?.trim() || ""
            );
        }

        // 예산 필드는 문자열 입력을 숫자 금액으로 정규화해서 사용한다.
        function getBudgetAmount() {
            // 예산 입력 원문을 숫자로 정리한 값이다.
            const rawValue = parseNumber(getFormValue("budget"));
            return rawValue || 0;
        }

        // 예산 기반 예상 노출 수를 계산하는 공통 함수다.
        function estimateImpressions(amount) {
            return Math.round(
                (parseNumber(amount) / 1000) * IMPRESSIONS_PER_THOUSAND_WON,
            );
        }

        // 미리보기 링크에는 전체 URL 대신 도메인만 보여 주기 위해 호스트를 추출한다.
        function getLinkHost(url) {
            try {
                // 스킴이 빠진 주소도 URL 파싱이 가능하도록 https를 보정한다.
                const normalized = /^https?:\/\//i.test(url) ? url : `https://${url}`;
                return new URL(normalized).hostname.replace(/^www\./i, "");
            } catch (error) {
                return "globalgates.com";
            }
        }

        // 첨부파일 요약 라벨은 1개/여러 개 상황에 맞춰 사람 친화적으로 만든다.
        function getAttachmentLabel() {
            if (!state.attachments.length) {
                return "선택된 파일이 없습니다.";
            }

            if (state.attachments.length === 1) {
                return state.attachments[0].name;
            }

            return `${state.attachments[0].name} 외 ${state.attachments.length - 1}개`;
        }

        // 폼 입력값을 미리보기/결제/목록 갱신에 바로 쓸 수 있는 구조로 모은다.
        function getFormState() {
            return {
                adTitle: getFormValue("adTitle") || "광고 제목을 입력해 주세요",
                headline: getFormValue("headline") || "헤드라인을 입력해 주세요",
                landingUrl: getFormValue("landingUrl") || "https://globalgates.com",
                adBody:
                    getFormValue("adBody") ||
                    "광고 내용을 입력하면 여기에 바로 반영됩니다.",
                budget: getBudgetAmount(),
                attachment: getAttachmentLabel(),
            };
        }

        // 텍스트만 바꾸는 반복 코드를 줄이기 위한 작은 헬퍼다.
        function setText(target, value) {
            if (target) {
                target.textContent = value;
            }
        }

        // 이미지 파일은 Data URL로 읽어야 즉시 미리보기에 반영할 수 있다.
        function readFileAsDataUrl(file) {
            return new Promise((resolve) => {
                // 브라우저 파일 읽기 작업을 담당하는 FileReader 인스턴스다.
                const reader = new FileReader();
                reader.addEventListener("load", (event) => {
                    resolve(typeof event.target?.result === "string" ? event.target.result : "");
                });
                reader.addEventListener("error", () => resolve(""));
                reader.readAsDataURL(file);
            });
        }

        // state.attachments와 실제 file input의 files 컬렉션을 같은 상태로 유지한다.
        function syncUploadInputFiles() {
            if (!root.uploadInput || typeof DataTransfer === "undefined") return;

            // 현재 첨부 상태를 file input 형식으로 다시 조립하기 위한 전송 버퍼다.
            const transfer = new DataTransfer();
            state.attachments.forEach((attachment) => {
                if (attachment.file) {
                    transfer.items.add(attachment.file);
                }
            });
            root.uploadInput.files = transfer.files;
        }

        // 동영상 Object URL은 제거 시 직접 해제해야 메모리 누수를 막을 수 있다.
        function releaseAttachmentResources(attachments) {
            attachments.forEach((attachment) => {
                if (attachment?.objectUrl) {
                    URL.revokeObjectURL(attachment.objectUrl);
                }
            });
        }

        // 개별 첨부 삭제 후 입력 상태와 요약 UI를 함께 다시 맞춘다.
        function handleAttachmentRemove(index) {
            // URL 해제가 필요한 삭제 대상만 먼저 추려낸다.
            const removed = state.attachments.filter((_, itemIndex) => itemIndex === index);
            releaseAttachmentResources(removed);
            state.attachments = state.attachments.filter((_, itemIndex) => itemIndex !== index);
            syncUploadInputFiles();
            syncApplySummary();
        }

        // 첨부 목록/미리보기에서 재사용하는 카드 DOM을 만든다.
        function createAttachmentCard(attachment, compact = false, index = 0) {
            // 첨부 카드 전체 컨테이너다.
            const item = document.createElement("div");
            item.className = `MarketplaceAdAttachmentCard${compact ? " is-compact" : ""}`;

            // 파일 타입에 따라 이미지 썸네일 또는 FILE/VIDEO 텍스트를 담는 영역이다.
            const thumb = document.createElement("div");
            thumb.className = "MarketplaceAdAttachmentCardThumb";
            thumb.dataset.fileKind = attachment.kind;

            if (attachment.kind === "image" && attachment.previewUrl) {
                thumb.style.backgroundImage = `url("${attachment.previewUrl}")`;
            } else {
                thumb.textContent = attachment.kind === "video" ? "VIDEO" : "FILE";
            }

            // 업로드 파일명을 표시하는 텍스트 노드다.
            const name = document.createElement("span");
            name.className = "MarketplaceAdAttachmentCardName";
            name.textContent = attachment.name;

            if (!compact) {
                // 일반 카드에서만 보이는 개별 삭제 버튼이다.
                const removeButton = document.createElement("button");
                removeButton.className = "MarketplaceAdAttachmentRemoveButton";
                removeButton.type = "button";
                removeButton.dataset.attachmentRemove = String(index);
                removeButton.setAttribute("aria-label", `${attachment.name} 제거`);
                removeButton.textContent = "×";
                item.append(removeButton);
            }

            item.append(thumb, name);
            return item;
        }

        // 현재 첨부 상태를 HTML의 기존 [data-attachment-list] 안에 다시 그린다.
        // 이전 카드들은 replaceChildren()으로 제거되고, 새 카드만 appendChild() 된다.
        function renderAttachmentGallery(container, compact = false) {
            if (!container) return;
            container.replaceChildren();
            state.attachments.forEach((attachment, index) => {
                container.appendChild(createAttachmentCard(attachment, compact, index));
            });
        }

        // 광고 미리보기 영역의 기존 [data-preview-field="attachmentGallery"] 안에 이미지 타일을 다시 렌더링한다.
        // 이 컨테이너도 replaceChildren()으로 비운 뒤 새 타일만 appendChild() 된다.
        function renderPreviewGallery() {
            if (!root.previewAttachmentGallery) return;

            root.previewAttachmentGallery.replaceChildren();
            state.attachments
                .filter((attachment) => attachment.kind === "image" && attachment.previewUrl)
                .slice(0, 4)
                .forEach((attachment) => {
                    // 미리보기 갤러리 한 칸을 담당하는 타일 요소다.
                    const tile = document.createElement("div");
                    tile.className = "AdCreativePreviewMediaTile";
                    tile.style.backgroundImage = `url("${attachment.previewUrl}")`;
                    root.previewAttachmentGallery.appendChild(tile);
                });
        }

        // 첨부 상태에 따라 이미지/영상/갤러리/플레이스홀더 중 어떤 UI를 노출할지 결정한다.
        function syncAttachmentPreview() {
            // 첨부 존재 여부에 따라 제어 버튼과 미리보기 블록 노출이 갈린다.
            const hasAttachments = state.attachments.length > 0;
            // 첫 번째 첨부는 단일 이미지/동영상 미리보기의 대표 자원으로 사용한다.
            const primaryAttachment = state.attachments[0] || null;
            // 대표 첨부가 단일 이미지 프리뷰 조건을 만족하는지 나타낸다.
            const isImage =
                primaryAttachment?.kind === "image" && Boolean(primaryAttachment.previewUrl);
            // 대표 첨부가 동영상 프리뷰 조건을 만족하는지 나타낸다.
            const isVideo =
                primaryAttachment?.kind === "video" && Boolean(primaryAttachment.objectUrl);
            // 갤러리 전환 여부를 판단하기 위한 실제 이미지 개수다.
            const imageCount = state.attachments.filter(
                (attachment) => attachment.kind === "image" && attachment.previewUrl,
            ).length;
            // 이미지가 여러 장이면 단일 프리뷰 대신 갤러리 레이아웃을 쓴다.
            const useGallery = imageCount > 1;

            // 첨부가 있을 때만 초기화 버튼과 첨부 미리보기 블록을 드러낸다.
            if (root.uploadClearButton) {
                root.uploadClearButton.hidden = !hasAttachments;
            }

            if (root.attachmentPreview) {
                root.attachmentPreview.hidden = !hasAttachments;
            }

            if (root.attachmentList) {
                renderAttachmentGallery(root.attachmentList);
            }

            // 이미지가 2장 이상이면 단일 이미지 대신 갤러리 레이아웃으로 전환한다.
            if (root.previewAttachmentGallery) {
                root.previewAttachmentGallery.hidden = !useGallery;
                renderPreviewGallery();
            }

            // 단일 이미지일 때만 대표 이미지 프리뷰를 노출한다.
            if (root.previewAttachmentImage) {
                root.previewAttachmentImage.hidden = !isImage || useGallery;
                root.previewAttachmentImage.src = isImage
                    ? primaryAttachment.previewUrl
                    : "";
            }

            // 동영상은 Object URL을 직접 연결하고, 보일 때만 재생을 시도한다.
            if (root.previewAttachmentVideo) {
                root.previewAttachmentVideo.hidden = !isVideo;
                root.previewAttachmentVideo.src = isVideo
                    ? primaryAttachment.objectUrl
                    : "";
                if (isVideo) {
                    root.previewAttachmentVideo.load();
                    root.previewAttachmentVideo.play().catch(() => {});
                } else {
                    root.previewAttachmentVideo.pause();
                }
            }

            // 아무 미디어도 없으면 파일 종류만 담는 플레이스홀더 상태를 유지한다.
            if (root.previewAttachmentPlaceholder) {
                root.previewAttachmentPlaceholder.hidden =
                    isImage || isVideo || useGallery;
                root.previewAttachmentPlaceholder.dataset.fileKind =
                    primaryAttachment?.kind || "empty";

                if (!primaryAttachment) {
                    root.previewAttachmentPlaceholder.textContent = "";
                } else {
                    root.previewAttachmentPlaceholder.textContent = "";
                }
            }
        }

        // 첨부 정책은 이미지/영상 타입과 개수 제한만 허용하도록 단일 함수에서 검증한다.
        function validateAttachments(files) {
            if (!files.length) {
                return { valid: true };
            }

            // 이미지/영상 외 타입이 섞여 있는지 먼저 검사한다.
            const hasUnsupported = files.some(
                (file) =>
                    !file.type.startsWith("image/") &&
                    !file.type.startsWith("video/"),
            );

            if (hasUnsupported) {
                return {
                    valid: false,
                    message: "이미지 또는 동영상 파일만 첨부할 수 있습니다.",
                };
            }

            // 이미지 파일만 따로 모아서 장수 제한을 검사한다.
            const imageFiles = files.filter((file) => file.type.startsWith("image/"));
            // 동영상 파일만 따로 모아서 단일 업로드 규칙을 검사한다.
            const videoFiles = files.filter((file) => file.type.startsWith("video/"));

            if (imageFiles.length && videoFiles.length) {
                return {
                    valid: false,
                    message: "이미지와 동영상은 함께 업로드할 수 없습니다.",
                };
            }

            if (videoFiles.length > 1 || (videoFiles.length === 1 && files.length > 1)) {
                return {
                    valid: false,
                    message: "동영상은 1개만 업로드할 수 있습니다.",
                };
            }

            if (!videoFiles.length && imageFiles.length > 4) {
                return {
                    valid: false,
                    message: "이미지는 최대 4장까지 업로드할 수 있습니다.",
                };
            }

            return { valid: true };
        }

        // file input에서 받은 파일 객체를 UI 렌더링용 attachment 구조로 변환한다.
        async function buildAttachments(files) {
            return Promise.all(
                files.map(async (file) => {
                    // 미리보기 렌더링 분기를 위해 파일 종류를 image/video/file로 정규화한다.
                    const kind = file.type.startsWith("image/")
                        ? "image"
                        : file.type.startsWith("video/")
                          ? "video"
                          : "file";

                    return {
                        name: file.name,
                        kind,
                        file,
                        previewUrl:
                            kind === "image" ? await readFileAsDataUrl(file) : "",
                        objectUrl:
                            kind === "video" ? URL.createObjectURL(file) : "",
                    };
                }),
            );
        }

        // 전체 첨부 상태를 비우고 관련 미리보기까지 한 번에 초기화한다.
        function clearAttachments() {
            releaseAttachmentResources(state.attachments);
            state.attachments = [];
            if (root.uploadInput) {
                root.uploadInput.value = "";
            }
            syncApplySummary();
        }

        // 현재 화면에 맞는 페이지 제목/설명을 상단 헤더에 반영한다.
        function syncViewMeta() {
            // 현재 view 키에 대응하는 헤더 메타데이터다.
            const meta = viewMeta[state.currentView];
            setText(root.title, meta.title);
            setText(root.description, meta.description);
        }

        // apply/list/detail 세 뷰 중 현재 화면만 노출한다.
        function syncViewVisibility() {
            root.views.forEach((view) => {
                // 반복 중인 view가 현재 활성 화면인지 계산한다.
                const isActive = view.dataset.view === state.currentView;
                view.hidden = !isActive;
                view.classList.toggle("is-active", isActive);
            });
        }

        // 좌측 네비게이션 선택 상태를 현재 화면과 동기화한다.
        function syncNavigationSelection() {
            root.navApplyItem?.classList.toggle(
                "is-selected",
                state.currentView === "apply",
            );
            root.navListItem?.classList.toggle(
                "is-selected",
                state.currentView === "list",
            );
            root.navDetailItem?.classList.toggle(
                "is-selected",
                state.currentView === "detail",
            );
        }

        // 헤더 액션 버튼은 화면 맥락에 맞는 것만 보여 준다.
        function syncHeaderActions() {
            if (root.headerGuideButton) {
                root.headerGuideButton.hidden = false;
            }
            if (root.headerPaymentButton) {
                root.headerPaymentButton.hidden = state.currentView !== "apply";
            }
        }

        // HTML에 이미 있는 [data-dropdown] 노드들 중 현재 대상만 보이게 한다.
        // 드롭다운 DOM을 새로 만들지 않고 hidden과 aria-expanded만 갱신한다.
        function syncDropdowns() {
            root.dropdowns.forEach((dropdown) => {
                dropdown.hidden = dropdown.dataset.dropdown !== state.currentDropdown;
            });

            [root.accountTrigger, root.profileTrigger].forEach((button) => {
                if (!button) return;
                button.setAttribute(
                    "aria-expanded",
                    String(button.dataset.dropdownTrigger === state.currentDropdown),
                );
            });
        }

        // HTML에 이미 있는 [data-modal-overlay] / [data-modal] 노드의 hidden만 토글한다.
        // 모달 DOM은 동적으로 추가/삭제하지 않고 같은 마크업을 계속 재사용한다.
        function syncModals() {
            // 모달 이름이 있으면 오버레이까지 함께 보여 준다.
            const isOpen = Boolean(state.currentModal);
            if (root.overlay) root.overlay.hidden = !isOpen;
            root.modals.forEach((modal) => {
                modal.hidden = modal.dataset.modal !== state.currentModal;
            });
        }

        // 신청 폼의 입력값을 요약 카드, 광고 미리보기, 결제 확인 영역에 동시에 반영한다.
        function syncApplySummary() {
            // 요약 계산과 미리보기에 재사용할 현재 폼 스냅샷이다.
            const formState = getFormState();
            // 결제/요약 카드에 공통으로 쓰는 금액 표시 문자열이다.
            const amountLabel = formatCurrency(formState.budget);
            // 예산 기준 예상 노출 수를 사람이 읽기 쉬운 문자열로 만든 값이다.
            const impressionLabel = formatImpressions(
                estimateImpressions(formState.budget),
            );
            // 포맷팅된 예산 값을 다시 넣어 줄 입력 노드다.
            const budgetInput = $('[data-form-field="budget"]');
            // 광고 본문 미리보기 영역은 placeholder 토글도 같이 처리해야 한다.
            const previewBody = $('[data-preview-field="adBody"]');

            // 사용자가 예산 필드를 직접 입력 중이 아닐 때만 포맷팅된 금액으로 되돌린다.
            if (budgetInput && document.activeElement !== budgetInput) {
                budgetInput.value = formState.budget
                    ? formState.budget.toLocaleString("ko-KR")
                    : "";
            }

            setText($('[data-summary-field="amountLabel"]'), amountLabel);
            setText($('[data-summary-field="impressionLabel"]'), impressionLabel);
            setText($('[data-summary-field="impressionHelper"]'), `예상 노출 ${impressionLabel.replace("약 ", "")}`);
            setText($('[data-summary-field="linkLabel"]'), formState.landingUrl);
            setText($('[data-summary-field="attachmentLabel"]'), formState.attachment);
            setText($('[data-summary-field="attachmentSummary"]'), formState.attachment);

            setText($('[data-preview-field="headline"]'), formState.headline);
            if (previewBody) {
                previewBody.textContent = formState.adBody;
                previewBody.classList.toggle("is-placeholder", !getFormValue("adBody"));
            }
            setText($('[data-preview-field="landingUrl"]'), getLinkHost(formState.landingUrl));

            setText($('[data-payment-field="adTitle"]'), formState.adTitle);
            setText($('[data-payment-field="headline"]'), formState.headline);
            setText($('[data-payment-field="linkLabel"]'), formState.landingUrl);
            setText($('[data-payment-field="attachmentLabel"]'), formState.attachment);
            setText($('[data-payment-field="amountLabel"]'), amountLabel);
            setText($('[data-payment-field="impressionLabel"]'), impressionLabel);
            syncAttachmentPreview();
        }

        // 목록 화면의 실제 광고 행만 가져온다.
        function getRows() {
            return $$(".MarketplaceAdListRow");
        }

        // 숨김용 드래프트 슬롯을 제외한 실제 운영 행만 별도로 반환한다.
        function getVisibleOperationalRows() {
            return getRows().filter((row) => !row.classList.contains("is-hidden-row"));
        }

        // 광고 ID로 목록 행을 직접 조회한다.
        function getRowById(adId) {
            return $(`.MarketplaceAdListRow[data-ad-id="${adId}"]`);
        }

        // 상세 화면은 선택 광고가 없으면 첫 번째 운영 행을 기본값으로 사용한다.
        function getActiveRow() {
            return getRowById(state.selectedAdId) || getVisibleOperationalRows()[0] || null;
        }

        // 목록/상세 공용 상태 뱃지 노드를 같은 규칙으로 갱신한다.
        function setStatusBadge(node, status, label) {
            if (!node) return;
            node.className = `MarketplaceAdStatusBadge is-${status}`;
            node.textContent = label;
        }

        // 검색어와 상태 드롭다운 조건을 동시에 적용해 목록 가시성을 제어한다.
        function syncListFilters() {
            // 검색 input의 현재 문자열을 소문자로 정규화한 값이다.
            const query = root.listSearch?.value.trim().toLowerCase() || "";
            // 선택된 상태 필터 값이다.
            const status = state.listStatusFilter;
            // 결과가 한 건도 없을 때 empty 상태를 보여 주기 위한 카운터다.
            let visibleCount = 0;

            getRows().forEach((row) => {
                // 드래프트 슬롯처럼 기본 숨김 행은 필터 대상에서 제외한다.
                if (row.classList.contains("is-hidden-row")) {
                    return;
                }

                // 행 전체 텍스트를 소문자로 만든 검색 대상 원문이다.
                const rowText = row.textContent.toLowerCase();
                // 검색어가 없거나 행 텍스트 안에 포함되면 통과한다.
                const matchQuery = !query || rowText.includes(query);
                // 상태 필터가 전체이거나 행 상태가 선택값과 같으면 통과한다.
                const matchStatus = status === "all" || row.dataset.status === status;
                row.hidden = !(matchQuery && matchStatus);

                if (!row.hidden) {
                    visibleCount += 1;
                }
            });

            // 모든 행이 숨겨졌을 때 비어 있음 안내를 띄우는 노드다.
            const empty = $("[data-list-empty]");
            if (empty) {
                empty.hidden = visibleCount > 0;
            }

            if (root.listStatusFilter) {
                root.listStatusFilter.value = state.listStatusFilter;
            }
        }

        // 현재 선택된 광고 행의 dataset 값을 상세 화면 필드로 복사한다.
        function syncDetailView() {
            // 상세 패널의 기준이 되는 현재 선택 행이다.
            const row = getActiveRow();
            if (!row) return;

            // 상세 영역으로 옮겨 쓸 dataset 묶음이다.
            const data = row.dataset;

            setStatusBadge(
                $('[data-detail-field="statusLabelBadge"]'),
                data.status,
                data.statusLabel,
            );

            // dataset 키와 상세 필드 key를 한 번에 매핑하기 위한 객체다.
            const mapping = {
                title: data.title,
                headline: data.headline,
                headlineSecondary: data.headline,
                link: data.link,
                attachment: data.attachment,
                copy: data.copy,
                statusLabel: data.statusLabel,
                createdAt: data.createdAt,
            };

            Object.entries(mapping).forEach(([key, value]) => {
                $$(`[data-detail-field="${key}"]`).forEach((node) => {
                    node.textContent = value;
                });
            });
        }

        // 화면 전체를 다시 그려야 할 때 호출하는 중앙 동기화 진입점이다.
        function syncAll() {
            syncViewMeta();
            syncViewVisibility();
            syncNavigationSelection();
            syncHeaderActions();
            syncDropdowns();
            syncModals();
            syncApplySummary();
            syncListFilters();
            syncDetailView();
        }

        // 짧은 안내 메시지는 HTML의 기존 [data-toast] 노드를 재사용하면서 타이머만 초기화한다.
        function showToast(message) {
            if (!root.toast) return;
            root.toast.textContent = message;
            root.toast.hidden = false;
            clearTimeout(state.toastTimer);
            state.toastTimer = window.setTimeout(() => {
                root.toast.hidden = true;
            }, 2200);
        }

        // 화면 전환 시 필요한 모든 UI 반영을 한 번에 처리한다.
        function setView(viewName) {
            state.currentView = viewName;
            syncAll();
        }

        // 모달은 이름 하나만 상태에 기록하고, 실제로는 HTML의 [data-modal-overlay] / [data-modal] hidden 토글만 일어난다.
        function openModal(name) {
            state.currentModal = name;
            syncModals();
        }

        // 열린 모달 상태를 비우면 syncModals()가 기존 HTML modal/overlay를 다시 숨긴다.
        function closeModal() {
            state.currentModal = null;
            syncModals();
        }

        // 드롭다운은 트리거 버튼 기준으로 우측 정렬되도록 좌표를 계산한다.
        function positionDropdown(name, trigger) {
            // 위치를 계산할 실제 드롭다운 DOM이다.
            const dropdown = $(`[data-dropdown="${name}"]`);
            if (!dropdown || !trigger) return;

            // 트리거 버튼의 현재 뷰포트 좌표다.
            const rect = trigger.getBoundingClientRect();
            dropdown.style.top = `${rect.bottom + 8}px`;
            dropdown.style.left = `${Math.max(16, rect.right - 180)}px`;
        }

        // 같은 드롭다운을 다시 누르면 닫히고, 새로 열리면 HTML의 기존 [data-dropdown] 위치를 다시 계산한다.
        function toggleDropdown(name, trigger) {
            state.currentDropdown = state.currentDropdown === name ? null : name;
            if (state.currentDropdown) {
                positionDropdown(name, trigger);
            }
            syncDropdowns();
        }

        // 문서 바깥 클릭이나 ESC 입력 시 HTML의 기존 [data-dropdown]들을 다시 hidden 처리한다.
        function closeDropdowns() {
            state.currentDropdown = null;
            syncDropdowns();
        }

        // 결제 후에는 숨겨 둔 드래프트 행을 실제 신청 건처럼 채워 목록/상세에 재사용한다.
        function updateDraftRowFromForm(paymentText, receiptId) {
            // 새 신청 결과를 덮어쓸 숨김용 드래프트 행이다.
            const row = getRowById("draft-slot");
            if (!row) return;

            // 목록/상세 동기화에 재사용할 현재 신청 폼 값이다.
            const formState = getFormState();
            // 접수 시각을 기록하기 위한 현재 시간 객체다.
            const createdAt = new Date();
            // 목록 표시 형식에 맞춘 생성 일시 문자열이다.
            const createdText = `${createdAt.getFullYear()}-${String(
                createdAt.getMonth() + 1,
            ).padStart(2, "0")}-${String(createdAt.getDate()).padStart(
                2,
                "0",
            )} ${String(createdAt.getHours()).padStart(2, "0")}:${String(
                createdAt.getMinutes(),
            ).padStart(2, "0")}`;

            row.classList.remove("is-hidden-row");
            row.dataset.title = formState.adTitle;
            row.dataset.headline = formState.headline;
            row.dataset.link = formState.landingUrl;
            row.dataset.attachment = formState.attachment;
            row.dataset.copy = formState.adBody;
            row.dataset.status = "active";
            row.dataset.statusLabel = "게시중";
            row.dataset.payment = paymentText;
            row.dataset.amount = String(formState.budget);
            row.dataset.createdAt = createdText;
            row.dataset.receiptId = receiptId;

            setText($('[data-cell="title"]', row), formState.adTitle);
            setText($('[data-cell="headline"]', row), formState.headline);
            setText($('[data-cell="link"]', row), formState.landingUrl);
            setText($('[data-cell="attachment"]', row), formState.attachment);
            setText($('[data-cell="createdAt"]', row), createdText);
            setStatusBadge($('[data-cell="statusLabel"]', row), "active", "게시중");
        }

        // 결제 버튼 진입점으로, 예산 검증부터 Bootpay 연동/데모 폴백까지 모두 담당한다.
        async function submitPayment() {
            // 결제 요청 직전의 폼 스냅샷이다.
            const formState = getFormState();
            // 실제 PG 결제 금액으로 넘길 숫자 예산 값이다.
            const budgetAmount = parseNumber(formState.budget);
            // 데모 모드와 완료 처리에서 공통으로 쓰는 내부 접수 번호다.
            const receiptId = `GG-${Date.now()}`;
            // 결제 상태 문구를 보여 주는 모달 내 텍스트 노드다.
            const paymentStatus = $("[data-payment-status]");

            // 금액이 없으면 결제창을 띄우지 않고 즉시 입력 유도 메시지를 보여 준다.
            if (budgetAmount <= 0) {
                setText(paymentStatus, "광고 예산을 입력한 뒤 결제를 진행해 주세요.");
                showToast("광고 예산을 입력해 주세요.");
                return;
            }

            setText(paymentStatus, "결제창을 준비 중입니다...");

            // 로컬/테스트 환경에서 SDK가 없을 때도 신청 흐름을 확인할 수 있게 데모로 처리한다.
            if (typeof Bootpay === "undefined") {
                updateDraftRowFromForm("데모 접수 완료", receiptId);
                setText(paymentStatus, "부트페이 SDK가 없어 데모 접수로 반영했습니다.");
                closeModal();
                state.selectedAdId = "draft-slot";
                setView("detail");
                showToast("광고 신청이 접수되었습니다.");
                return;
            }

            try {
                // 실제 결제창에 넘길 주문 메타데이터를 여기서 조합한다.
                // 실제 결제창 호출 결과를 담는 응답 객체다.
                const response = await Bootpay.requestPayment({
                    application_id: "697868f4fc55d934885c2420",
                    price: budgetAmount,
                    order_name: `${formState.adTitle} 광고 신청`,
                    order_id: `AD_${Date.now()}`,
                    pg: "라이트페이",
                    tax_free: 0,
                    user: {
                        id: "advertiser",
                        username: "광고주",
                        phone: "01000000000",
                        email: "advertiser@globalgates.com",
                    },
                    items: [
                        {
                            id: "community-ad",
                            name: `커뮤니티 피드 광고 - ${formState.adTitle}`,
                            qty: 1,
                            price: budgetAmount,
                        },
                    ],
                    extra: {
                        open_type: "iframe",
                        card_quota: "0,2,3",
                        escrow: false,
                    },
                });

                // confirm 이벤트를 주는 PG는 한 번 더 승인 API를 호출해 최종 완료를 확정한다.
                if (response?.event === "confirm") {
                    // confirm 후 최종 승인 결과를 담는 응답 객체다.
                    const confirmed = await Bootpay.confirm();
                    if (confirmed?.event === "done") {
                        updateDraftRowFromForm(
                            "부트페이 결제 완료",
                            confirmed.receipt_id || receiptId,
                        );
                    }
                } else {
                    updateDraftRowFromForm(
                        "부트페이 결제 완료",
                        response?.receipt_id || receiptId,
                    );
                }

                setText(paymentStatus, "결제가 완료되어 광고가 접수되었습니다.");
                closeModal();
                state.selectedAdId = "draft-slot";
                setView("detail");
                showToast("광고 신청이 접수되었습니다.");
            } catch (error) {
                // 사용자 취소와 일반 오류를 구분해 안내 문구를 다르게 보여 준다.
                // 사용자에게 보여 줄 최종 실패 메시지다.
                const message =
                    error?.event === "cancel"
                        ? "결제가 취소되었습니다."
                        : "결제 중 오류가 발생했습니다.";
                setText(paymentStatus, message);
                showToast(message);
            }
        }

        // 클릭 이벤트는 이벤트 위임으로 한 곳에서 처리해 동적 요소도 별도 바인딩 없이 대응한다.
        document.addEventListener("click", (event) => {
            // 클릭된 요소가 드롭다운 트리거인지 먼저 확인한다.
            const dropdownTrigger = event.target.closest("[data-dropdown-trigger]");
            if (dropdownTrigger) {
                toggleDropdown(dropdownTrigger.dataset.dropdownTrigger, dropdownTrigger);
                return;
            }

            // 드롭다운 바깥 클릭이면 열린 메뉴를 닫는다.
            if (!event.target.closest(".MarketplaceAdDropdown")) {
                closeDropdowns();
            }

            // 좌측/상단 네비게이션 버튼으로 화면을 전환한다.
            // 클릭 요소가 화면 전환 버튼이면 대상 view 이름을 읽는다.
            const viewButton = event.target.closest("[data-view-target]");
            if (viewButton) {
                setView(viewButton.dataset.viewTarget);
                return;
            }

            // 헤더 액션은 운영 가이드 또는 결제 모달로 연결된다.
            // 헤더 버튼이 눌렸는지 판별하기 위한 가장 가까운 액션 요소다.
            const headerAction = event.target.closest("[data-header-action]");
            if (headerAction) {
                openModal(headerAction.dataset.headerAction === "guide" ? "guide" : "payment");
                return;
            }

            // 일반 모달 오픈 버튼도 data 속성만으로 연결한다.
            // 모달 직접 오픈 버튼이면 목표 모달 이름을 읽는다.
            const modalButton = event.target.closest("[data-modal-target]");
            if (modalButton) {
                openModal(modalButton.dataset.modalTarget);
                return;
            }

            // 닫기 버튼과 오버레이 배경 클릭은 동일하게 모달 종료로 처리한다.
            if (event.target.closest("[data-modal-close]") || event.target === root.overlay) {
                closeModal();
                return;
            }

            // 파일 업로드 트리거는 숨겨진 file input 클릭으로 연결한다.
            if (event.target.closest("[data-upload-trigger]")) {
                root.uploadInput?.click();
                return;
            }

            // 첨부 전체 비우기 버튼이다.
            if (event.target.closest("[data-upload-clear]")) {
                clearAttachments();
                return;
            }

            // 첨부 카드의 개별 삭제 버튼이다.
            // 클릭 위치가 첨부 삭제 버튼이면 삭제 index를 읽는다.
            const attachmentRemoveButton = event.target.closest("[data-attachment-remove]");
            if (attachmentRemoveButton) {
                handleAttachmentRemove(Number(attachmentRemoveButton.dataset.attachmentRemove));
                return;
            }

            // 목록의 상세 버튼은 해당 행을 선택하고 상세 화면으로 이동시킨다.
            // 상세 화면 이동을 유발한 버튼인지 확인한다.
            const detailButton = event.target.closest(".AdListDetailButton");
            if (detailButton) {
                // 상세 버튼이 속한 광고 목록 행이다.
                const row = detailButton.closest(".MarketplaceAdListRow");
                if (row) {
                    state.selectedAdId = row.dataset.adId;
                    setView("detail");
                }
                return;
            }

            // 결제 확인 버튼에서 실제 결제/데모 접수 로직을 시작한다.
            if (event.target.closest("[data-payment-confirm]")) {
                submitPayment();
            }
        });

        // 실시간 입력은 폼 요약/예산 포맷/목록 검색에 즉시 반영한다.
        document.addEventListener("input", (event) => {
            if (event.target.matches("[data-form-field]")) {
                // 예산 필드는 입력 중에도 숫자만 남기고 천 단위 콤마를 유지한다.
                if (event.target.dataset.formField === "budget") {
                    // 사용자가 방금 입력한 예산 문자열을 숫자로 정리한 값이다.
                    const numericValue = parseNumber(event.target.value);
                    event.target.value = numericValue
                        ? numericValue.toLocaleString("ko-KR")
                        : "";
                }
                syncApplySummary();
                return;
            }

            if (event.target.matches("[data-list-search]")) {
                syncListFilters();
            }
        });

        // change 이벤트는 드롭다운과 파일 업로드처럼 확정 입력이 필요한 요소를 담당한다.
        document.addEventListener("change", async (event) => {
            if (event.target.matches("[data-list-status-filter]")) {
                state.listStatusFilter = event.target.value || "all";
                syncListFilters();
                return;
            }

            // 파일 업로드 시점에 먼저 정책 검증을 통과한 파일만 attachment 상태로 변환한다.
            if (event.target === root.uploadInput) {
                // 업로드 input에서 선택된 파일 목록을 배열로 변환한 값이다.
                const files = Array.from(event.target.files || []);
                // 업로드 정책 검사를 수행한 결과 객체다.
                const validation = validateAttachments(files);

                if (!validation.valid) {
                    event.target.value = "";
                    showToast(validation.message);
                    return;
                }

                releaseAttachmentResources(state.attachments);
                state.attachments = await buildAttachments(files);
                syncApplySummary();
            }
        });

        // ESC는 드롭다운과 모달을 빠르게 닫는 공통 단축키다.
        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape") {
                closeDropdowns();
                closeModal();
            }
        });

        // 첫 진입 시 현재 state 기준으로 전체 화면을 한 번 렌더링한다.
        syncAll();
};
