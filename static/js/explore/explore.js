// 1. 탭 요소
const tabProducts = document.getElementById("tabProducts");
const tabTrending = document.getElementById("tabTrending");
const tabNews = document.getElementById("tabNews");

// 2. 섹션 요소
const productsSection = document.getElementById("productsSection");
const trendingSection = document.getElementById("trendingSection");
const newsSection = document.getElementById("newsSection");

if (tabProducts && tabTrending && tabNews && productsSection && trendingSection && newsSection) {

    // 3. 탭 전환 함수
    function showProductsTab() {
        tabProducts.classList.add("isActive");
        tabProducts.setAttribute("aria-current", "page");
        tabTrending.classList.remove("isActive");
        tabTrending.removeAttribute("aria-current");
        tabNews.classList.remove("isActive");
        tabNews.removeAttribute("aria-current");

        productsSection.hidden = false;
        trendingSection.hidden = true;
        newsSection.hidden = true;
    }

    function showTrendingTab() {
        tabTrending.classList.add("isActive");
        tabTrending.setAttribute("aria-current", "page");
        tabProducts.classList.remove("isActive");
        tabProducts.removeAttribute("aria-current");
        tabNews.classList.remove("isActive");
        tabNews.removeAttribute("aria-current");

        productsSection.hidden = true;
        trendingSection.hidden = false;
        newsSection.hidden = true;
    }

    function showNewsTab() {
        tabNews.classList.add("isActive");
        tabNews.setAttribute("aria-current", "page");
        tabProducts.classList.remove("isActive");
        tabProducts.removeAttribute("aria-current");
        tabTrending.classList.remove("isActive");
        tabTrending.removeAttribute("aria-current");

        productsSection.hidden = true;
        trendingSection.hidden = true;
        newsSection.hidden = false;
    }

    // 4. 이벤트 바인딩
    tabProducts.addEventListener("click", (e) => { showProductsTab(); });
    tabTrending.addEventListener("click", (e) => { showTrendingTab(); });
    tabNews.addEventListener("click", (e) => { showNewsTab(); });
}

// 5. Trending 서브탭
const trendingSubtabs = document.querySelectorAll("#trendingSubtabs .trending-subtab");
if (trendingSubtabs.length > 0) {
    trendingSubtabs.forEach((tab) => {
        tab.addEventListener("click", (e) => {
            e.preventDefault();
            trendingSubtabs.forEach((t) => { t.classList.remove("isActive"); });
            tab.classList.add("isActive");
        });
    });
}

// 6. 트렌딩 더보기 메뉴
const trendReportMenu = document.getElementById("trendReportMenu");

if (trendReportMenu) {
    let activeBtn = null;

    document.querySelectorAll(".trending-more-btn").forEach((btn) => {
        btn.addEventListener("click", (e) => {
            e.stopPropagation();

            // 같은 버튼 다시 누르면 닫기
            if (activeBtn === btn && !trendReportMenu.hidden) {
                trendReportMenu.hidden = true;
                activeBtn = null;
                return;
            }

            activeBtn = btn;
            const rect = btn.getBoundingClientRect();

            trendReportMenu.style.top  = rect.bottom + "px";
            trendReportMenu.style.left = (rect.right - 284) + "px";
            trendReportMenu.hidden = false;

            const menuH = trendReportMenu.offsetHeight;
            if (rect.bottom + menuH > window.innerHeight) {
                trendReportMenu.style.top = (rect.top - menuH) + "px";
            }
        });
    });

    // 메뉴 아이템 클릭 시 해당 트렌딩 아이템 → dismissed 상태로 교체
    trendReportMenu.querySelectorAll(".more-menu").forEach((item) => {
        item.addEventListener("click", (e) => {
            if (activeBtn) {
                const trendingItem = activeBtn.closest(".trending-item");
                if (trendingItem) {
                    const dismissed = document.createElement("article");
                    dismissed.className = "trend-dismissed";
                    dismissed.setAttribute("role", "article");
                    dismissed.innerHTML =
                        '<div class="trend-dismissed__wrapper">' +
                            '<div class="trend-dismissed__spacer"></div>' +
                            '<div class="trend-dismissed__body">' +
                                '<div class="trend-dismissed__box">' +
                                    '<div class="trend-dismissed__text">' +
                                        '<span>감사합니다. 이 트렌드를 업데이트하려면 페이지를 새로고침해 주세요.</span>' +
                                    '</div>' +
                                '</div>' +
                            '</div>' +
                        '</div>';
                    trendingItem.replaceWith(dismissed);
                }
            }
            trendReportMenu.hidden = true;
            activeBtn = null;
        });
    });

    // 외부 클릭 시 닫기
    document.addEventListener("click", (e) => {
        if (!trendReportMenu.hidden && !trendReportMenu.contains(e.target)) {
            trendReportMenu.hidden = true;
            activeBtn = null;
        }
    });

    // 스크롤 시 닫기
    window.addEventListener("scroll", (e) => {
        if (!trendReportMenu.hidden) {
            trendReportMenu.hidden = true;
            activeBtn = null;
        }
    }, { passive: true });
}

// 7. Post-Card 인터랙션 (Like / Bookmark / 이미지 프리뷰)
(function () {
    // Like 토글
    function handleLike(btn) {
        var isLiked = btn.classList.contains("liked");
        btn.classList.toggle("liked", !isLiked);
        var path = btn.querySelector("svg path");
        if (path) {
            path.setAttribute("d", isLiked ? path.getAttribute("data-path-inactive") : path.getAttribute("data-path-active"));
        }
        var countEl = btn.querySelector(".Post-Action-Count");
        if (countEl) {
            var cur = parseInt(countEl.textContent.replace(/[^0-9]/g, ""), 10) || 0;
            countEl.textContent = isLiked ? cur - 1 : cur + 1;
        }
    }

    // Bookmark 토글
    function handleBookmark(btn) {
        var isBookmarked = btn.classList.contains("bookmarked");
        btn.classList.toggle("bookmarked", !isBookmarked);
        var path = btn.querySelector("svg path");
        if (path) {
            path.setAttribute("d", isBookmarked ? path.getAttribute("data-path-inactive") : path.getAttribute("data-path-active"));
        }
    }

    // 이미지 프리뷰
    var previewOverlay = document.getElementById("postMediaPreviewOverlay");
    var previewImg = document.getElementById("postMediaPreviewImage");
    var previewClose = document.getElementById("postMediaPreviewClose");

    function openPreview(src, alt) {
        if (!previewOverlay || !src) return;
        previewImg.src = src;
        previewImg.alt = alt || "";
        previewOverlay.classList.remove("off");
        document.body.style.overflow = "hidden";
    }
    
    function closePreview() {
        if (!previewOverlay) return;
        previewOverlay.classList.add("off");
        previewImg.src = "";
        document.body.style.overflow = "";
    }

    if (previewClose) previewClose.addEventListener("click", (e) => { closePreview(); });
    if (previewOverlay) {
        previewOverlay.addEventListener("click", (e) => {
            if (e.target === previewOverlay) closePreview();
        });
    }
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && previewOverlay && !previewOverlay.classList.contains("off")) {
            closePreview();
        }
    });

    // 이벤트 위임 (productsSection)
    var productsSection = document.getElementById("productsSection");
    if (productsSection) {
        productsSection.addEventListener("click", (e) => {
            var likeBtn     = e.target.closest(".Post-Action-Btn.Like");
            var bookmarkBtn = e.target.closest(".Post-Action-Btn.Bookmark");
            var mediaImg    = e.target.closest(".Post-Media-Img");

            if (likeBtn)     { handleLike(likeBtn); return; }
            if (bookmarkBtn) { handleBookmark(bookmarkBtn); return; }
            if (mediaImg)    { openPreview(mediaImg.src, mediaImg.alt); return; }
        });
    }
})();

// 8. 검색창 포커스 드롭다운 + 최근검색 삭제
// main event.js(window.onload) 이후에 등록해야 label 덮어쓰기 충돌 방지
window.addEventListener("load", function () {

    var searchForm        = document.getElementById("searchForm");
    var searchInput       = document.getElementById("searchInput");
    var searchPanel       = document.getElementById("searchPanel");
    var searchPanelEmpty  = document.getElementById("searchPanelEmpty");
    var searchRecentSec   = document.getElementById("searchRecentSection");
    var searchResultsEl   = document.getElementById("searchResults");
    var searchResultTopic = document.getElementById("searchResultTopic");
    var searchResultLabel = document.getElementById("searchResultLabel");

    if (searchForm && searchInput && searchPanel) {

        function hasRecentItems() {
            return searchRecentSec &&
                searchRecentSec.querySelectorAll(".searchResultItem").length > 0;
        }

        // 케이스 1: 입력 없음 + 최근검색 없음
        function showEmpty() {
            if (searchPanelEmpty) searchPanelEmpty.hidden = false;
            if (searchRecentSec)  searchRecentSec.hidden  = true;
            if (searchResultsEl)  searchResultsEl.hidden  = true;
        }

        // 케이스 2: 입력 없음 + 최근검색 있음
        function showRecent() {
            if (searchPanelEmpty) searchPanelEmpty.hidden = true;
            if (searchRecentSec)  searchRecentSec.hidden  = false;
            if (searchResultsEl)  searchResultsEl.hidden  = true;
        }

        // 케이스 3: 입력 있음
        function showResults(val) {
            if (searchResultLabel) searchResultLabel.textContent = val;
            if (searchPanelEmpty) searchPanelEmpty.hidden = true;
            if (searchRecentSec)  searchRecentSec.hidden  = true;
            if (searchResultsEl)  searchResultsEl.hidden  = false;
        }

        function updatePanel() {
            var val = searchInput.value.trim();
            if (val.length > 0) {
                showResults(val);
            } else if (hasRecentItems()) {
                showRecent();
            } else {
                showEmpty();
            }
        }

        searchPanel.addEventListener("mousedown", function (e) {
            e.preventDefault();
        });

        searchInput.addEventListener("focus", function (e) {
            searchForm.classList.add("isFocused");
            searchPanel.hidden = false;
            updatePanel();
        });

        // main event.js 이후에 등록 → 마지막으로 실행되어 # 없는 텍스트로 덮어씀
        searchInput.addEventListener("input", function (e) {
            updatePanel();
        });

        searchInput.addEventListener("blur", function (e) {
            if (!document.hasFocus()) { return; }
            searchForm.classList.remove("isFocused");
            searchPanel.hidden = true;
        });

        searchInput.addEventListener("keydown", function (e) {
            if (e.key === "Escape") {
                searchForm.classList.remove("isFocused");
                searchPanel.hidden = true;
                searchInput.blur();
            }
        });

        if (searchResultTopic) {
            searchResultTopic.addEventListener("click", function (e) {
                searchForm.classList.remove("isFocused");
                searchPanel.hidden = true;
            });
        }
    }

    // 개별 삭제 버튼
    if (searchRecentSec) {
        searchRecentSec.addEventListener("click", function (e) {
            var deleteBtn = e.target.closest(".searchRecentDeleteBtn");
            if (deleteBtn) {
                e.stopPropagation();
                deleteBtn.closest(".searchResultItem").remove();
                if (!hasRecentItems()) {
                    showEmpty();
                }
            }
        });

        // 모두 지우기
        var clearAllBtn = searchRecentSec.querySelector(".searchRecentClearAll");
        if (clearAllBtn) {
            clearAllBtn.addEventListener("click", function (e) {
                e.stopPropagation();
                searchRecentSec.querySelectorAll(".searchResultItem").forEach(function (item) {
                    item.remove();
                });
                showEmpty();
            });
        }
    }
});
