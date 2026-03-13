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
            const menuHeight = 5 * 44;

            const top = (rect.bottom + menuHeight > window.innerHeight)
                ? rect.top - menuHeight
                : rect.bottom;

            trendReportMenu.style.top  = top + "px";
            trendReportMenu.style.left = (rect.right - 284) + "px";
            trendReportMenu.hidden = false;
        });
    });

    // 메뉴 아이템 클릭 시 해당 트렌딩 아이템 → dismissed 상태로 교체
    trendReportMenu.querySelectorAll(".menu-item").forEach((item) => {
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

// 7. 검색창 포커스 드롭다운
const searchForm        = document.getElementById("searchForm");
const searchInput       = document.getElementById("searchInput");
const searchPanel       = document.getElementById("searchPanel");
const searchPanelEmpty  = document.getElementById("searchPanelEmpty");
const searchRecentSec   = document.getElementById("searchRecentSection");
const searchResultsEl   = document.getElementById("searchResults");
const searchResultTopic = document.getElementById("searchResultTopic");
const searchResultLabel = document.getElementById("searchResultLabel");

if (searchForm && searchInput && searchPanel) {

    function showEmpty() {
        searchPanelEmpty.hidden = false;
        searchRecentSec.hidden  = true;
        searchResultsEl.hidden  = true;
    }

    function showRecent() {
        searchPanelEmpty.hidden = true;
        searchRecentSec.hidden  = false;
        searchResultsEl.hidden  = true;
    }

    function showResults(val) {
        searchResultLabel.textContent = "\u201C" + val + "\u201D \uAC80\uC0C9";
        searchPanelEmpty.hidden = true;
        searchRecentSec.hidden  = true;
        searchResultsEl.hidden  = false;
    }

    function updatePanel() {
        var val = searchInput.value.trim();
        if (val.length > 0) {
            showResults(val);
        } else {
            showRecent();
        }
    }

    // 패널 내부 mousedown 시 preventDefault → input blur 방지 (F12, devtools 클릭과 구분)
    searchPanel.addEventListener("mousedown", (e) => {
        e.preventDefault();
    });

    searchInput.addEventListener("focus", (e) => {
        searchForm.classList.add("isFocused");
        searchPanel.hidden = false;
        updatePanel();
    });

    searchInput.addEventListener("input", (e) => {
        updatePanel();
    });

    searchInput.addEventListener("blur", (e) => {
        // document.hasFocus()가 false면 devtools/OS로 이동한 것 → 닫지 않음
        if (!document.hasFocus()) { return; }
        searchForm.classList.remove("isFocused");
        searchPanel.hidden = true;
    });

    searchInput.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            searchForm.classList.remove("isFocused");
            searchPanel.hidden = true;
            searchInput.blur();
        }
    });

    searchResultTopic.addEventListener("click", (e) => {
        searchForm.classList.remove("isFocused");
        searchPanel.hidden = true;
    });
}
