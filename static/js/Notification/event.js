/**
 * ============================================================
 * Notification/event.js — 알림 페이지 하단 네비게이션 스크립트
 * ============================================================
 *
 * 이 파일은 X(Twitter) 모바일 앱의 하단 탭 바(BottomBar) 동작을
 * 순수 JavaScript로 구현한 파일입니다.
 *
 * [전체 동작 요약]
 *   1. 페이지 로드 시 → 알림(notifications) 탭을 활성 상태로 초기화
 *   2. 탭 클릭 시     → 클릭한 탭만 활성화, 나머지는 비활성화
 *   3. 스크롤 아래   → 하단바가 화면 아래로 숨겨짐
 *   4. 스크롤 위     → 하단바가 다시 올라와 표시됨
 *
 * [활성/비활성 표현 방식 — X(Twitter) 방식 그대로]
 *   X는 탭 상태 변경 시 CSS 클래스나 색상을 바꾸지 않습니다.
 *   대신 SVG 아이콘 안의 <path d="..."> 값(아이콘 모양 데이터)만 교체합니다.
 *   - 비활성: HTML에 data-inactive="..." 로 저장된 외곽선(outline) 모양
 *   - 활성:   HTML에 data-active="..."   로 저장된 채워진(filled) 모양
 *
 *   추가로 CSS opacity를 사용해 시각적 차이를 강화합니다.
 *   - 비활성 탭: opacity 0.5 (반투명, 흐리게)
 *   - 활성 탭:   opacity 1.0 (불투명, 진하게)
 * ============================================================
 */

(function () {
    "use strict";

    /**
     * [함수] setActiveTab(tabName)
     * ─────────────────────────────────────────────────────────
     * 특정 탭을 활성 상태로 전환하고, 나머지 탭은 비활성으로 되돌립니다.
     *
     * @param {string} tabName - 활성화할 탭 이름
     *   사용 가능한 값: 'home' | 'explore' | 'grok' | 'notifications' | 'dm'
     *   (HTML의 각 탭 링크에 설정된 data-tab 속성 값과 일치해야 합니다)
     *
     * [처리 흐름]
     *   모든 .tab-link 요소를 순회하면서:
     *
     *   ① 현재 탭이 tabName과 일치하는 경우 (활성화 대상)
     *      - SVG path의 d 속성을 data-active 값으로 교체 → 채워진 아이콘으로 변경
     *      - tab-link--active 클래스 추가 → CSS에서 opacity 1 적용 + hover 억제
     *
     *   ② 현재 탭이 tabName과 일치하지 않는 경우 (비활성화 대상)
     *      - SVG path의 d 속성을 data-inactive 값으로 교체 → 외곽선 아이콘으로 변경
     *      - tab-link--active 클래스 제거 → CSS에서 opacity 0.5 적용
     *
     * [CSS tab-link--active 클래스의 역할]
     *   1. 활성 탭 아이콘을 진하게 표시: `.tab-link--active .tab-icon { opacity: 1 }`
     *   2. 활성 탭에서 마우스 hover 배경 효과 차단:
     *      `.tab-link--active:hover .tab-icon-wrap { background-color: transparent }`
     */
    function setActiveTab(tabName) {
        // 페이지 안의 모든 탭 링크(.tab-link)를 가져와 하나씩 처리
        document.querySelectorAll(".tab-link").forEach((link) => {
            // 각 탭 안의 SVG <path> 요소를 찾음 (아이콘 모양을 담고 있음)
            const path = link.querySelector("path");
            if (!path) return; // path가 없으면 해당 탭은 건너뜀

            // 현재 탭이 활성화 대상인지 확인 (data-tab 속성과 tabName 비교)
            const isActive = link.dataset.tab === tabName;

            // SVG 아이콘 모양 교체
            // - 활성:   data-active에 저장된 채워진 아이콘 path 사용
            // - 비활성: data-inactive에 저장된 외곽선 아이콘 path 사용
            path.setAttribute(
                "d",
                isActive ? path.dataset.active : path.dataset.inactive,
            );

            // tab-link--active 클래스 추가/제거
            // classList.toggle(className, force)에서 force가 true면 추가, false면 제거
            link.classList.toggle("tab-link--active", isActive);
        });
    }

    /**
     * [함수] initActiveTab()
     * ─────────────────────────────────────────────────────────
     * 페이지 로드 시 초기 활성 탭을 설정합니다.
     *
     * 이 파일은 알림(Notification) 페이지 전용이므로,
     * 항상 'notifications' 탭이 활성 상태로 시작합니다.
     *
     * 다른 페이지에서 재사용한다면 setActiveTab에 전달하는
     * 탭 이름을 해당 페이지에 맞게 변경하면 됩니다.
     *   예) 홈 페이지: setActiveTab("home")
     *       탐색 페이지: setActiveTab("explore")
     */
    function initActiveTab() {
        setActiveTab("notifications");
    }

    /**
     * [이벤트 등록] 탭 클릭 시 탭 전환
     * ─────────────────────────────────────────────────────────
     * 모든 탭 링크에 클릭 이벤트를 등록합니다.
     *
     * e.preventDefault()를 호출해 <a> 태그의 기본 페이지 이동을 막고,
     * 대신 setActiveTab()으로 탭 아이콘 상태만 전환합니다.
     *
     * 실제 페이지 이동이 필요한 경우에는 아래 주석을 해제하세요:
     *   history.pushState({}, '', link.href);
     */
    document.querySelectorAll(".tab-link").forEach((link) => {
        link.addEventListener("click", (e) => {
            e.preventDefault(); // 링크 기본 동작(페이지 이동) 차단
            setActiveTab(link.dataset.tab); // 클릭된 탭의 data-tab 값으로 전환
        });
    });

    /**
     * [이벤트 등록] 스크롤 시 하단바 숨김/표시
     * ─────────────────────────────────────────────────────────
     * 스크롤 방향을 감지해 하단 네비게이션 바를 숨기거나 표시합니다.
     *
     * [동작 조건]
     *   - 스크롤을 아래로 내리고 + 페이지 상단에서 100px 이상 내려간 경우
     *     → translateY(100%) : 하단바를 화면 아래로 밀어 숨김
     *   - 스크롤을 위로 올리는 경우
     *     → translateY(0)    : 하단바를 원래 위치로 되돌려 표시
     *
     * CSS .bottombar-slide에 transition이 설정되어 있어 200ms 애니메이션으로 전환됩니다.
     *
     * { passive: true } 옵션:
     *   브라우저에게 "이 이벤트에서 preventDefault()를 호출하지 않겠다"고 알려줍니다.
     *   브라우저가 스크롤 성능을 최적화할 수 있도록 도와주는 설정입니다.
     */
    let lastScrollY = 0; // 이전 스크롤 위치를 기억하는 변수 (스크롤 방향 판단용)

    window.addEventListener(
        "scroll",
        () => {
            // 하단바 슬라이드 애니메이션 래퍼 요소를 가져옴
            const slide = document.querySelector(".bottombar-slide");
            if (!slide) return; // 요소가 없으면 아무 것도 하지 않음

            const currentY = window.scrollY; // 현재 스크롤 위치 (픽셀)

            if (currentY > lastScrollY && currentY > 100) {
                // 스크롤 다운 + 상단에서 100px 초과: 하단바 숨김
                slide.style.transform = "translateY(100%)";
            } else {
                // 스크롤 업 또는 상단 근처: 하단바 표시
                slide.style.transform = "translateY(0)";
            }

            lastScrollY = currentY; // 다음 스크롤 이벤트를 위해 현재 위치 저장
        },
        { passive: true },
    );

    /* ===== 상단 탭 (전체/멘션) 클릭 처리 ===================
     * .notif-tab 요소들 중 클릭된 탭만 활성화합니다.
     * - notif-tab--active 클래스 이동
     * - aria-selected 속성 갱신
     * - indicator는 CSS transition(opacity)으로 부드럽게 전환
     ====================================================== */
    document.querySelectorAll(".notif-tab").forEach((tab) => {
        tab.addEventListener("click", (e) => {
            e.preventDefault();

            // 모든 탭 비활성화
            document.querySelectorAll(".notif-tab").forEach((t) => {
                t.classList.remove("notif-tab--active");
                t.setAttribute("aria-selected", "false");
            });

            // 클릭된 탭 활성화
            tab.classList.add("notif-tab--active");
            tab.setAttribute("aria-selected", "true");
        });
    });

    /* ===== 초기화 실행 ===================================== */
    // 스크립트 로드 완료 시 notifications 탭을 활성 상태로 초기화
    initActiveTab();

    console.log("[Notification] 페이지 로드 완료.");
})();

const bookmarkButton = document.querySelector(
    ".tweet-action-right",
).firstElementChild;

bookmarkButton.addEventListener("click", (e) => {});
