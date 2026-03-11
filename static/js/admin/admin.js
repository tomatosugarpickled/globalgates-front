// 변수
const portals = document.querySelectorAll(".each-menu");
const pages = document.querySelectorAll(".page");

const memberTbody = document.querySelector("#memberTbody");
const newsTbody = document.querySelector("#newsTbody");
const postTbody = document.querySelector("#postTbody");
const reportMemberTbody = document.querySelector("#reportMemberTbody");
const reportPostTbody = document.querySelector("#reportPostTbody");
const expertApplyTbody = document.querySelector("#expertApplyTbody");

const modalMemberDetail = document.querySelector("#modalMemberDetail");
const modalNewsDetail = document.querySelector("#modalNewsDetail");
const modalPostEdit = document.querySelector("#modalPostEdit");
const modalReportDetail = document.querySelector("#modalReportDetail");
const modalExpertDetail = document.querySelector("#modalExpertDetail");

const filterExpertApply = document.querySelector("#filterExpertApply");

const newsWriteBtn = document.querySelector("#newsWriteBtn");
const newsCancelBtn = document.querySelector("#newsCancelBtn");
const newsSubmitBtn = document.querySelector("#newsSubmitBtn");
const aiBtn = document.querySelector("#aiBtn");

const filterMemberType   = document.querySelector("#filterMemberType");
const filterMemberStatus = document.querySelector("#filterMemberStatus");

const filterPostType     = document.querySelector("#filterPostType");
const filterPostCategory = document.querySelector("#filterPostCategory");

const filterNewsCategory = document.querySelector("#filterNewsCategory");
const newsHideBtn   = document.querySelector("#newsHideBtn");
const newsShowBtn   = document.querySelector("#newsShowBtn");
const newsDeleteBtn = document.querySelector("#newsDeleteBtn");

const filterReportMember = document.querySelector("#filterReportMember");
const filterReportPost = document.querySelector("#filterReportPost");

const reportMemberDoneBtn   = document.querySelector("#reportMemberDoneBtn");
const reportMemberRejectBtn = document.querySelector("#reportMemberRejectBtn");
const reportMemberDeleteBtn = document.querySelector("#reportMemberDeleteBtn");

const reportPostDoneBtn   = document.querySelector("#reportPostDoneBtn");
const reportPostRejectBtn = document.querySelector("#reportPostRejectBtn");
const reportPostDeleteBtn = document.querySelector("#reportPostDeleteBtn");

const expertListApproveBtn = document.querySelector("#expertListApproveBtn");
const expertListRejectBtn  = document.querySelector("#expertListRejectBtn");
const expertListDeleteBtn  = document.querySelector("#expertListDeleteBtn");

const memberTypeSelect = document.querySelector("#memberTypeSelect");

let postOriginal = {};
let newsOriginal = {};

const previewTitle    = document.querySelector("#previewTitle");
const previewCategory = document.querySelector("#previewCategory");
const previewContent  = document.querySelector("#previewContent");
const previewSource   = document.querySelector("#previewSource");
const previewDate     = document.querySelector("#previewDate");

const modalImageViewer = document.querySelector("#modalImageViewer");


const badgeToStatus = (badge) => {
    switch (badge) {
        case "badge-pending": 
            return "pending";
        case "badge-done":    
            return "done";
        case "badge-reject":  
            return "rejected";
    }
};


// 뉴스 더미데이터
const aiNews = {
    title:   "[속보] 코스피 8% 폭락…3거래일 만에 서킷브레이커 발동",
    summary: "유가증권시장에 서킷브레이커가 발동됐다고 공시했다. 당시 코스피 지수는 전 거래일보다 8.1% 하락한 5132.07이었다.이란 사태 장기화 가능성이 부각되면서 특히 반도체주가 급락 중이다. 유가 상승은 달러 수요를 늘리는 ‘페트로달러’ 효과를 통해 원화값 하락(환율 상승) 압력으로 이어질 수 있다. 이날 원·달러 환율은 급등하며 1500원 선을 위협하고 있다. 오전 10시 45분 현재 달러에 대한 원화가치는 전 거래일보다 12원(0.81%) 내린(환율 상승) 1497.00원을 나타내고 있다.",
    source:  "JoongAng News"
};


// 1. 사이드바 메뉴 눌렀을때 탭 전환
portals.forEach((portal, i) => {
    portal.addEventListener("click", (e) => {

        pages.forEach((page) => {
            page.classList.remove("active");
        });

        portals.forEach((eachPortal) => {
            eachPortal.classList.remove("active");
        });

        e.target.classList.add("active");
        pages[i].classList.add("active");
    });
});


// 2. 뉴스 목록에서 뉴스 등록 버튼 눌렀을때 (portals[3] = 뉴스 등록)
newsWriteBtn.addEventListener("click", (e) => {

    pages.forEach((page) => {
        page.classList.remove("active");
    });

    portals.forEach((eachPortal) => {
        eachPortal.classList.remove("active");
    });

    portals[3].classList.add("active");
    pages[3].classList.add("active");
});


// 3. 뉴스 등록 취소 눌렀을때 (portals[2] = 뉴스 목록임.)
newsCancelBtn.addEventListener("click", (e) => {

    pages.forEach((page) => {
        page.classList.remove("active");
    });

    portals.forEach((eachPortal) => {
        eachPortal.classList.remove("active");
    });

    portals[2].classList.add("active");
    pages[2].classList.add("active");
});


// 4. 뉴스 전체선택 체크박스
document.querySelector("#newsCheckAll").addEventListener("change", (e) => {
    newsTbody.querySelectorAll("input[type='checkbox']").forEach((cb) => {
        cb.checked = e.target.checked;
    });
});

// 4-1. 뉴스 비활성화 버튼
newsHideBtn.addEventListener("click", () => {
    const checked = [...newsTbody.querySelectorAll(".div-tr")].filter(tr =>
        tr.querySelector("input[type='checkbox']").checked
    );
    if (!checked.length) { alert("선택된 뉴스가 없습니다."); return; }
    if (!confirm(`선택한 ${checked.length}개 뉴스를 숨기시겠습니까?`)) return;
    checked.forEach(tr => tr.classList.add("row-hidden"));
});

// 4-2. 뉴스 보이기 버튼
newsShowBtn.addEventListener("click", () => {
    const checked = [...newsTbody.querySelectorAll(".div-tr")].filter(tr =>
        tr.querySelector("input[type='checkbox']").checked
    );
    if (!checked.length) { alert("선택된 뉴스가 없습니다."); return; }
    if (!confirm(`선택한 ${checked.length}개 뉴스를 다시 표시하시겠습니까?`)) return;
    checked.forEach(tr => tr.classList.remove("row-hidden"));
});

// 4-3. 뉴스 삭제 버튼
newsDeleteBtn.addEventListener("click", () => {
    const checked = [...newsTbody.querySelectorAll(".div-tr")].filter(tr =>
        tr.querySelector("input[type='checkbox']").checked
    );
    if (!checked.length) { alert("선택된 뉴스가 없습니다."); return; }
    if (!confirm(`선택한 ${checked.length}개 뉴스를 삭제하시겠습니까?`)) return;
    checked.forEach(tr => tr.remove());
});

// 4-4. 뉴스 카테고리 필터
const applyNewsFilter = () => {
    const categoryVal = filterNewsCategory.value;
    newsTbody.querySelectorAll(".div-tr").forEach((tr) => {
        const tds     = tr.querySelectorAll(".div-td");
        const category = tds[4].textContent.trim();
        if (categoryVal === "all" || category === categoryVal) {
            tr.classList.remove("off");
        } else {
            tr.classList.add("off");
        }
    });
};
filterNewsCategory.addEventListener("change", applyNewsFilter);

// 4-5. 뉴스 행 클릭 → 수정 모달 열기
// 컬럼: 선택(0)-번호(1)-출처(2)-제목(3)-카테고리(4)-조회수(5)-작성일(6)
newsTbody.addEventListener("click", (e) => {
    if (e.target.type === "checkbox") return;

    const tr = e.target.closest(".div-tr");
    if (!tr) return;
    const tds = tr.querySelectorAll(".div-td");

    document.querySelector("#newsDetailTitle").value    = tds[3].textContent;
    document.querySelector("#newsDetailSource").value   = tds[2].textContent;
    document.querySelector("#newsDetailCategory").value = tds[4].textContent;
    document.querySelector("#newsDetailContent").value  = aiNews.summary;

    newsOriginal = {
        title:    tds[3].textContent,
        source:   tds[2].textContent,
        category: tds[4].textContent,
        content:  aiNews.summary
    };

    document.querySelector("#modalNewsSave").disabled = true;
    modalNewsDetail.classList.remove("off");
});

// 4-3. 뉴스 수정 모달 닫기
document.querySelector("#modalNewsClose").addEventListener("click", (e) => {
    modalNewsDetail.classList.add("off");
});

document.querySelector("#modalNewsCancel").addEventListener("click", (e) => {
    modalNewsDetail.classList.add("off");
});

modalNewsDetail.addEventListener("click", (e) => {
    if (e.target === modalNewsDetail) {
        modalNewsDetail.classList.add("off");
    }
});

// 4-4. 뉴스 수정 저장
document.querySelector("#modalNewsSave").addEventListener("click", (e) => {
    let result = confirm("수정한 내용을 저장하시겠습니까?");

    if (result) {
        alert("저장되었습니다.");
        modalNewsDetail.classList.add("off");
    }
});

// 4-5. 뉴스 모달 변경 감지 → 수정 버튼 활성화
const checkNewsChanged = () => {
    const changed =
        document.querySelector("#newsDetailTitle").value    !== newsOriginal.title    ||
        document.querySelector("#newsDetailSource").value   !== newsOriginal.source   ||
        document.querySelector("#newsDetailCategory").value !== newsOriginal.category ||
        document.querySelector("#newsDetailContent").value  !== newsOriginal.content;
    document.querySelector("#modalNewsSave").disabled = !changed;
};
document.querySelector("#newsDetailTitle").addEventListener("input", checkNewsChanged);
document.querySelector("#newsDetailSource").addEventListener("input", checkNewsChanged);
document.querySelector("#newsDetailCategory").addEventListener("change", checkNewsChanged);
document.querySelector("#newsDetailContent").addEventListener("input", checkNewsChanged);


// 5. 회원 목록 행 눌렀을때 상세 모달 열기
memberTbody.querySelectorAll(".div-tr").forEach((tr) => {
    tr.addEventListener("click", (e) => {
        document.querySelector("#name").textContent     = "김민중";
        document.querySelector("#age").textContent      = "29";
        document.querySelector("#email").textContent    = "sokkomann@gmail.com";
        document.querySelector("#phone").textContent    = "010-1234-5678";
        document.querySelector("#company").textContent  = "GlobalGates";
        document.querySelector("#joinDate").textContent = "2025-01-15";
        document.querySelector("#statusSelect").value   = "active";
        memberTypeSelect.value                          = "normal";

        modalMemberDetail.classList.remove("off");
    });
});

// 4-2. 회원 상세 모달 닫기
document.querySelector("#modalMemberClose").addEventListener("click", (e) => {
    modalMemberDetail.classList.add("off");
});

document.querySelector("#modalMemberCancel").addEventListener("click", (e) => {
    modalMemberDetail.classList.add("off");
});

modalMemberDetail.addEventListener("click", (e) => {
    if (e.target === modalMemberDetail) {
        modalMemberDetail.classList.add("off");
    }
});

// 4-3. 회원 상세 모달 저장
document.querySelector("#modalMemberSave").addEventListener("click", (e) => {
    let result = confirm("수정한 내용을 저장하시겠습니까?");

    if (result) {
        alert("저장되었습니다.");
        modalMemberDetail.classList.add("off");
    }
});


// 회원 필터 공통 함수
// 컬럼: 번호(0)-이름(1)-이메일(2)-회사(3)-회원종류(4)-상태(5)-가입일(6)
const applyMemberFilter = () => {
    const typeVal   = filterMemberType.value;
    const statusVal = filterMemberStatus.value;

    memberTbody.querySelectorAll(".div-tr").forEach((tr) => {
        const tds        = tr.querySelectorAll(".div-td");
        const memberType = tds[4].querySelector(".badge") ? tds[4].querySelector(".badge").textContent.trim() : "";
        const status     = tds[5].querySelector(".badge") ? tds[5].querySelector(".badge").textContent.trim() : "";

        const typeMatch   = typeVal   === "all" || memberType === typeVal;
        const statusMatch = statusVal === "all" || status     === statusVal;

        if (typeMatch && statusMatch) {
            tr.classList.remove("off");
        } else {
            tr.classList.add("off");
        }
    });
};

filterMemberType.addEventListener("change", applyMemberFilter);
filterMemberStatus.addEventListener("change", applyMemberFilter);

// 감추기 버튼
document.querySelector("#postHideBtn").addEventListener("click", () => {
    const checked = [...postTbody.querySelectorAll(".div-tr")].filter(tr =>
        tr.querySelector("input[type='checkbox']").checked
    );
    if (!checked.length) { alert("선택된 게시물이 없습니다."); return; }
    if (!confirm(`선택한 ${checked.length}개 게시물을 숨기시겠습니까?`)) return;
    checked.forEach(tr => tr.classList.add("row-hidden"));
});

// 보이기 버튼
document.querySelector("#postShowBtn").addEventListener("click", () => {
    const checked = [...postTbody.querySelectorAll(".div-tr")].filter(tr =>
        tr.querySelector("input[type='checkbox']").checked
    );
    if (!checked.length) { alert("선택된 게시물이 없습니다."); return; }
    if (!confirm(`선택한 ${checked.length}개 게시물을 다시 표시하시겠습니까?`)) return;
    checked.forEach(tr => tr.classList.remove("row-hidden"));
});

// 삭제 버튼
document.querySelector("#postDeleteBtn").addEventListener("click", () => {
    const checked = [...postTbody.querySelectorAll(".div-tr")].filter(tr =>
        tr.querySelector("input[type='checkbox']").checked
    );
    if (!checked.length) { alert("선택된 게시물이 없습니다."); return; }
    if (!confirm(`선택한 ${checked.length}개 게시물을 삭제하시겠습니까?`)) return;
    checked.forEach(tr => tr.remove());
});

// 5-0. 게시물 필터 공통 함수
const applyPostFilter = () => {
    const typeVal     = filterPostType.value;
    const categoryVal = filterPostCategory.value;

    postTbody.querySelectorAll(".div-tr").forEach((tr) => {
        const tds       = tr.querySelectorAll(".div-td");
        const type      = tds[4].querySelector(".badge") ? tds[4].querySelector(".badge").textContent.trim() : "";
        const category  = tds[5].textContent.trim();

        const typeMatch     = typeVal === "all"     || type === typeVal;
        const categoryMatch = categoryVal === "all" || category === categoryVal;

        if (typeMatch && categoryMatch) {
            tr.classList.remove("off");
        } else {
            tr.classList.add("off");
        }
    });
};

filterPostType.addEventListener("change", applyPostFilter);
filterPostCategory.addEventListener("change", applyPostFilter);

// 5. 게시물 전체선택 체크박스
document.querySelector("#checkAll").addEventListener("change", (e) => {
    postTbody.querySelectorAll("input[type='checkbox']").forEach((cb) => {
        cb.checked = e.target.checked;
    });
});

// 5. 게시물 행 클릭 → 수정 모달 열기
postTbody.addEventListener("click", (e) => {
    if (e.target.type === "checkbox") return;

    // 5-3. 행 클릭 → 수정 모달 열기
    const tr = e.target.closest(".div-tr");
    if (!tr) return;
    const tds = tr.querySelectorAll(".div-td");

    // 컬럼: 선택(0)-번호(1)-작성자(2)-제목(3)-글종류(4)-물품종류(5)-작성일(6)
    document.querySelector("#peAuthor").textContent  = tds[2].textContent;
    document.querySelector("#peTitle").textContent   = tds[3].textContent;
    document.querySelector("#peContent").textContent = "안녕하세요. 철강 원자재 수입 관련하여 파트너 업체를 찾고 있습니다.안녕하세요. 철강 원자재 수입 관련하여 파트너 업체를 찾고 있습니다.";
    document.querySelector("#peType").value          = tds[4].querySelector(".badge").textContent.trim();
    document.querySelector("#peCategory").value      = tds[5].textContent;
    document.querySelector("#peDate").textContent    = tds[6].textContent;

    postOriginal = {
        type:     document.querySelector("#peType").value,
        category: document.querySelector("#peCategory").value
    };

    document.querySelector("#modalPostSave").disabled = true;
    modalPostEdit.classList.remove("off");
});

// 5-3. 게시물 수정 모달 닫기
document.querySelector("#modalPostClose").addEventListener("click", (e) => {
    modalPostEdit.classList.add("off");
});

document.querySelector("#modalPostCancel").addEventListener("click", (e) => {
    modalPostEdit.classList.add("off");
});

modalPostEdit.addEventListener("click", (e) => {
    if (e.target === modalPostEdit) {
        modalPostEdit.classList.add("off");
    }
});

// 5-4. 게시물 수정 저장
document.querySelector("#modalPostSave").addEventListener("click", (e) => {
    let result = confirm("수정한 내용을 저장하시겠습니까?");

    if (result) {
        alert("저장되었습니다.");
        modalPostEdit.classList.add("off");
    }
});

// 5-5. 게시물 모달 변경 감지 → 수정 버튼 활성화
const checkPostChanged = () => {
    const changed =
        document.querySelector("#peType").value     !== postOriginal.type     ||
        document.querySelector("#peCategory").value !== postOriginal.category;
    document.querySelector("#modalPostSave").disabled = !changed;
};
document.querySelector("#peType").addEventListener("change", checkPostChanged);
document.querySelector("#peCategory").addEventListener("change", checkPostChanged);


// 6. AI 요약 버튼 눌렀을때
aiBtn.addEventListener("click", (e) => {
    const url = document.querySelector("#newsUrl").value.trim();
    if (!url) {
        alert("뉴스 원문 URL을 입력해주세요.");
        return;
    }

    const aiBox    = document.querySelector("#aiBox");

    document.querySelector("#newsTitle").value              = aiNews.title;
    document.querySelector("#newsContent").value            = aiNews.summary;
    document.querySelector("#newsSource").value             = url;
    document.querySelector("#aiSummaryPreview").textContent = aiNews.summary;

    previewTitle.textContent   = aiNews.title;
    previewContent.textContent = aiNews.summary;
    previewSource.textContent  = aiNews.source;

    aiBox.classList.add("show");
    aiBtn.textContent = "AI 재요약";
});


// 7. 뉴스 등록 버튼 눌렀을때
newsSubmitBtn.addEventListener("click", (e) => {
    const title   = document.querySelector("#newsTitle").value.trim();
    const content = document.querySelector("#newsContent").value.trim();
    if (!title || !content) {
        alert("제목과 내용을 입력해주세요.");
        return;
    }

    let result = confirm("뉴스를 등록하시겠습니까?");
    if (!result) return;

    alert("뉴스가 등록되었습니다.");

    document.querySelector("#newsUrl").value              = "";
    document.querySelector("#newsTitle").value            = "";
    document.querySelector("#newsContent").value          = "";
    document.querySelector("#newsSource").value           = "";
    document.querySelector("#aiSummaryPreview").textContent = "";
    document.querySelector("#aiBox").classList.remove("show");
    aiBtn.textContent = "AI 요약 적용";

    pages.forEach((page) => {
        page.classList.remove("active");
    });
    portals.forEach((eachPortal) => {
        eachPortal.classList.remove("active");
    });
    portals[2].classList.add("active");
    pages[2].classList.add("active");
});


// 8. 회원 신고 전체선택
document.querySelector("#reportMemberCheckAll").addEventListener("change", (e) => {
    reportMemberTbody.querySelectorAll("input[type='checkbox']").forEach((cb) => {
        cb.checked = e.target.checked;
    });
});

// 8-1. 회원 신고 처리완료 버튼
reportMemberDoneBtn.addEventListener("click", () => {
    const checked = [...reportMemberTbody.querySelectorAll(".div-tr")].filter(tr =>
        tr.querySelector("input[type='checkbox']").checked
    );
    if (!checked.length) { alert("선택된 항목이 없습니다."); return; }
    if (!confirm(`선택한 ${checked.length}개 신고를 승인하시겠습니까?`)) return;
    alert("승인 처리되었습니다.");
});

// 8-2. 회원 신고 반려 버튼
reportMemberRejectBtn.addEventListener("click", () => {
    const checked = [...reportMemberTbody.querySelectorAll(".div-tr")].filter(tr =>
        tr.querySelector("input[type='checkbox']").checked
    );
    if (!checked.length) { alert("선택된 항목이 없습니다."); return; }
    if (!confirm(`선택한 ${checked.length}개 신고를 반려하시겠습니까?`)) return;
    alert("반려 처리되었습니다.");
});

// 8-3. 회원 신고 삭제 버튼
reportMemberDeleteBtn.addEventListener("click", () => {
    const checked = [...reportMemberTbody.querySelectorAll(".div-tr")].filter(tr =>
        tr.querySelector("input[type='checkbox']").checked
    );
    if (!checked.length) { alert("선택된 항목이 없습니다."); return; }
    if (!confirm(`선택한 ${checked.length}개 신고를 삭제하시겠습니까?`)) return;
    checked.forEach(tr => tr.remove());
});

// 8-4. 회원 신고 상태 필터
filterReportMember.addEventListener("change", (e) => {
    const val = e.target.value;
    reportMemberTbody.querySelectorAll(".div-tr").forEach((tr) => {
        const badge    = tr.querySelector(".div-td:nth-child(6) .badge");
        const badgeCls = badge ? badge.className.split(" ")[1] : "";
        const status   = badgeToStatus(badgeCls) || "";
        if (val === "all" || status === val) {
            tr.classList.remove("off");
        } else {
            tr.classList.add("off");
        }
    });
});

// 8-5. 글 신고 전체선택
document.querySelector("#reportPostCheckAll").addEventListener("change", (e) => {
    reportPostTbody.querySelectorAll("input[type='checkbox']").forEach((cb) => {
        cb.checked = e.target.checked;
    });
});

// 8-6. 글 신고 처리완료 버튼
reportPostDoneBtn.addEventListener("click", () => {
    const checked = [...reportPostTbody.querySelectorAll(".div-tr")].filter(tr =>
        tr.querySelector("input[type='checkbox']").checked
    );
    if (!checked.length) { alert("선택된 항목이 없습니다."); return; }
    if (!confirm(`선택한 ${checked.length}개 신고를 승인하시겠습니까?`)) return;
    alert("승인 처리되었습니다.");
});

// 8-7. 글 신고 반려 버튼
reportPostRejectBtn.addEventListener("click", () => {
    const checked = [...reportPostTbody.querySelectorAll(".div-tr")].filter(tr =>
        tr.querySelector("input[type='checkbox']").checked
    );
    if (!checked.length) { alert("선택된 항목이 없습니다."); return; }
    if (!confirm(`선택한 ${checked.length}개 신고를 반려하시겠습니까?`)) return;
    alert("반려 처리되었습니다.");
});

// 8-8. 글 신고 삭제 버튼
reportPostDeleteBtn.addEventListener("click", () => {
    const checked = [...reportPostTbody.querySelectorAll(".div-tr")].filter(tr =>
        tr.querySelector("input[type='checkbox']").checked
    );
    if (!checked.length) { alert("선택된 항목이 없습니다."); return; }
    if (!confirm(`선택한 ${checked.length}개 신고를 삭제하시겠습니까?`)) return;
    checked.forEach(tr => tr.remove());
});

// 8-9. 글 신고 상태 필터
filterReportPost.addEventListener("change", (e) => {
    const val = e.target.value;
    reportPostTbody.querySelectorAll(".div-tr").forEach((tr) => {
        const badge    = tr.querySelector(".div-td:nth-child(6) .badge");
        const badgeCls = badge ? badge.className.split(" ")[1] : "";
        const status   = badgeToStatus(badgeCls) || "";
        if (val === "all" || status === val) {
            tr.classList.remove("off");
        } else {
            tr.classList.add("off");
        }
    });
});


// 9. 회원 신고 행 클릭 → 상세 모달
// 컬럼: 선택(0)-번호(1)-신고자(2)-신고대상(3)-신고사유(4)-상태(5)-신고일(6)
reportMemberTbody.addEventListener("click", (e) => {
    if (e.target.type === "checkbox") return;
    const tr = e.target.closest(".div-tr");
    if (!tr) return;
    const tds = tr.querySelectorAll(".div-td");

    document.querySelector("#modalReportTitle").textContent  = "회원 신고 상세";
    document.querySelector("#reportReporter").textContent    = tds[2].textContent;
    document.querySelector("#reportDate").textContent        = tds[6].textContent;
    document.querySelector("#reportTargetLabel").textContent = "피신고자";
    document.querySelector("#reportTarget").textContent      = tds[3].textContent;
    document.querySelector("#reportReason").textContent      = tds[4].textContent;
    document.querySelector("#reportStatusBadge").innerHTML   = tds[5].innerHTML;

    modalReportDetail.classList.remove("off");
});

// 9-2. 글 신고 행 클릭 → 상세 모달
// 컬럼: 선택(0)-번호(1)-신고자(2)-신고글(3)-신고사유(4)-상태(5)-신고일(6)
reportPostTbody.addEventListener("click", (e) => {
    if (e.target.type === "checkbox") return;
    const tr = e.target.closest(".div-tr");
    if (!tr) return;
    const tds = tr.querySelectorAll(".div-td");

    document.querySelector("#modalReportTitle").textContent  = "글 신고 상세";
    document.querySelector("#reportReporter").textContent    = tds[2].textContent;
    document.querySelector("#reportDate").textContent        = tds[6].textContent;
    document.querySelector("#reportTargetLabel").textContent = "신고 게시물";
    document.querySelector("#reportTarget").textContent      = tds[3].textContent;
    document.querySelector("#reportReason").textContent      = tds[4].textContent;
    document.querySelector("#reportStatusBadge").innerHTML   = tds[5].innerHTML;

    modalReportDetail.classList.remove("off");
});

// 9-3. 신고 심사 모달 닫기
document.querySelector("#modalReportClose").addEventListener("click", (e) => {
    modalReportDetail.classList.add("off");
});

document.querySelector("#modalReportCancel").addEventListener("click", (e) => {
    modalReportDetail.classList.add("off");
});

modalReportDetail.addEventListener("click", (e) => {
    if (e.target === modalReportDetail) {
        modalReportDetail.classList.add("off");
    }
});

// 9-3-1. 첨부 이미지 썸네일 클릭 → 이미지 뷰어
document.querySelector("#reportImages").addEventListener("click", (e) => {
    const thumb = e.target.closest(".report-attach-thumb");
    if (!thumb) return;
    document.querySelector("#imgViewerImg").src = thumb.src;
    modalImageViewer.classList.remove("off");
});

// 이미지 뷰어 닫기
document.querySelector("#imgViewerClose").addEventListener("click", (e) => {
    modalImageViewer.classList.add("off");
});

modalImageViewer.addEventListener("click", (e) => {
    if (e.target === modalImageViewer) {
        modalImageViewer.classList.add("off");
    }
});



// 10. 전문가 신청 전체선택
document.querySelector("#expertCheckAll").addEventListener("change", (e) => {
    expertApplyTbody.querySelectorAll("input[type='checkbox']").forEach((cb) => {
        cb.checked = e.target.checked;
    });
});

// 10-1. 전문가 신청 승인 버튼 (일괄)
expertListApproveBtn.addEventListener("click", () => {
    const checked = [...expertApplyTbody.querySelectorAll(".div-tr")].filter(tr =>
        tr.querySelector("input[type='checkbox']").checked
    );
    if (!checked.length) { alert("선택된 항목이 없습니다."); return; }
    if (!confirm(`선택한 ${checked.length}개 신청을 승인하시겠습니까?`)) return;
    alert("승인 처리되었습니다.");
});

// 10-2. 전문가 신청 반려 버튼 (일괄)
expertListRejectBtn.addEventListener("click", () => {
    const checked = [...expertApplyTbody.querySelectorAll(".div-tr")].filter(tr =>
        tr.querySelector("input[type='checkbox']").checked
    );
    if (!checked.length) { alert("선택된 항목이 없습니다."); return; }
    if (!confirm(`선택한 ${checked.length}개 신청을 반려하시겠습니까?`)) return;
    alert("반려 처리되었습니다.");
});

// 10-3. 전문가 신청 삭제 버튼 (일괄)
expertListDeleteBtn.addEventListener("click", () => {
    const checked = [...expertApplyTbody.querySelectorAll(".div-tr")].filter(tr =>
        tr.querySelector("input[type='checkbox']").checked
    );
    if (!checked.length) { alert("선택된 항목이 없습니다."); return; }
    if (!confirm(`선택한 ${checked.length}개 신청을 삭제하시겠습니까?`)) return;
    checked.forEach(tr => tr.remove());
});

// 10-4. 전문가 신청 행 클릭 → 상세 모달
// 컬럼: 선택(0)-번호(1)-이름(2)-이메일(3)-소속(4)-상태(5)-신청일(6)
expertApplyTbody.addEventListener("click", (e) => {
    if (e.target.type === "checkbox") return;
    const tr = e.target.closest(".div-tr");
    if (!tr) return;
    const tds = tr.querySelectorAll(".div-td");

    document.querySelector("#expertApplicant").textContent = tds[2].textContent;
    document.querySelector("#expertEmail").textContent     = tds[3].textContent;
    document.querySelector("#expertCompany").textContent   = tds[4].textContent;
    document.querySelector("#expertDate").textContent      = tds[6].textContent;
    document.querySelector("#expertReason").textContent    = "무역 분야 10년 경력 보유, 관련 자격증 취득 완료. 전문가로서 양질의 정보를 제공하고자 신청합니다.";
    document.querySelector("#expertStatusBadge").innerHTML = tds[5].innerHTML;

    modalExpertDetail.classList.remove("off");
});

// 10-2. 전문가 신청 모달 닫기
document.querySelector("#modalExpertClose").addEventListener("click", (e) => {
    modalExpertDetail.classList.add("off");
});

document.querySelector("#modalExpertCancel").addEventListener("click", (e) => {
    modalExpertDetail.classList.add("off");
});

modalExpertDetail.addEventListener("click", (e) => {
    if (e.target === modalExpertDetail) {
        modalExpertDetail.classList.add("off");
    }
});

// 10-5. 전문가 신청 상태 필터
filterExpertApply.addEventListener("change", (e) => {
    const val = e.target.value;

    expertApplyTbody.querySelectorAll(".div-tr").forEach((tr) => {
        const badge    = tr.querySelector(".div-td:nth-child(6) .badge");
        const badgeCls = badge ? badge.className.split(" ")[1] : "";
        const status   = badgeToStatus(badgeCls) || "";

        if (val === "all" || status === val) {
            tr.classList.remove("off");
        } else {
            tr.classList.add("off");
        }
    });
});


// 11. 뉴스 등록 미리보기 초기화 및 실시간 업데이트

document.querySelector("#newsTitle").addEventListener("input", (e) => {
    previewTitle.textContent = e.target.value || "제목이 여기에 표시됩니다";
});

document.querySelector("#newsCategory").addEventListener("change", (e) => {
    previewCategory.textContent = e.target.value;
});

document.querySelector("#newsContent").addEventListener("input", (e) => {
    previewContent.textContent = e.target.value || "내용이 여기에 표시됩니다. AI 요약 또는 직접 입력하면 이곳에 미리보기가 나타납니다.";
});

document.querySelector("#newsSource").addEventListener("input", (e) => {
    previewSource.textContent = e.target.value || "출처";
});
