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

const expertRejectedBtn = document.querySelector("#expertRejectedBtn");
const expertApproveBtn = document.querySelector("#expertApproveBtn");
const filterExpertApply = document.querySelector("#filterExpertApply");

const newsWriteBtn = document.querySelector("#newsWriteBtn");
const newsCancelBtn = document.querySelector("#newsCancelBtn");
const newsSubmitBtn = document.querySelector("#newsSubmitBtn");
const aiBtn = document.querySelector("#aiBtn");

const filterReportMember = document.querySelector("#filterReportMember");
const filterReportPost = document.querySelector("#filterReportPost");

const reportRejectedBtn = document.querySelector("#reportRejectedBtn");
const reportDoneBtn = document.querySelector("#reportDoneBtn");

const memberTypeSelect = document.querySelector("#memberTypeSelect");

let postOriginal = {};
let newsOriginal = {};

const previewTitle    = document.querySelector("#previewTitle");
const previewCategory = document.querySelector("#previewCategory");
const previewContent  = document.querySelector("#previewContent");
const previewSource   = document.querySelector("#previewSource");
const previewDate     = document.querySelector("#previewDate");

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


// 4. 뉴스 목록 관련들
newsTbody.addEventListener("click", (e) => {
    const toggleBtn = e.target.closest(".btn-toggle-news");
    const delBtn    = e.target.closest(".btn-del-news");

    // 4-1. 활성/비활성 버튼
    if (toggleBtn) {
        e.stopPropagation();
        const isActive = toggleBtn.textContent.trim() === "비활성화";
        const msg = isActive ? "해당 뉴스를 비활성화하시겠습니까?" : "해당 뉴스를 활성화하시겠습니까?";
        let result = confirm(msg);
        if (!result) return;
        toggleBtn.textContent = isActive ? "활성화" : "비활성화";
        return;
    }

    // 4-2. 삭제 버튼
    if (delBtn) {
        e.stopPropagation();
        let result = confirm("뉴스를 삭제하시겠습니까?");
        if (!result) return;
        delBtn.closest("tr").remove();
        return;
    }

    // 4-3. 행 클릭 → 수정 모달 열기
    const tr = e.target.closest("tr");
    if (!tr) return;
    const tds = tr.querySelectorAll("td");

    document.querySelector("#newsDetailTitle").value    = tds[1].textContent;
    document.querySelector("#newsDetailSource").value   = tds[2].textContent;
    document.querySelector("#newsDetailCategory").value = tds[3].textContent;
    document.querySelector("#newsDetailContent").value  = aiNews.summary;

    newsOriginal = {
        title:    tds[1].textContent,
        source:   tds[2].textContent,
        category: tds[3].textContent,
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
memberTbody.querySelectorAll("tr").forEach((tr) => {
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


// 5. 게시물 행 클릭/비활성화/삭제
postTbody.addEventListener("click", (e) => {
    const toggleBtn = e.target.closest(".btn-toggle-post");
    const delBtn    = e.target.closest(".btn-del-post");

    // 5-1. 활성/비활성 버튼
    if (toggleBtn) {
        e.stopPropagation();
        const isActive = toggleBtn.textContent.trim() === "비활성화";
        const msg = isActive ? "해당 게시물을 비활성화하시겠습니까?" : "해당 게시물을 활성화하시겠습니까?";
        let result = confirm(msg);
        if (!result) return;
        toggleBtn.textContent = isActive ? "활성화" : "비활성화";
        return;
    }

    // 5-2. 삭제 버튼
    if (delBtn) {
        e.stopPropagation();
        let result = confirm("게시물을 삭제하시겠습니까?");
        if (!result) return;
        delBtn.closest("tr").remove();
        return;
    }

    // 5-3. 행 클릭 → 수정 모달 열기
    const tr = e.target.closest("tr");
    if (!tr) return;
    const tds = tr.querySelectorAll("td");

    document.querySelector("#peTitle").textContent   = tds[2].textContent;
    document.querySelector("#peType").value          = tds[3].querySelector(".badge").textContent.trim();
    document.querySelector("#peCategory").value      = tds[4].textContent;
    document.querySelector("#peContent").textContent = "안녕하세요. 철강 원자재 수입 관련하여 파트너 업체를 찾고 있습니다.";

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


// 8. 회원 신고 상태 필터
filterReportMember.addEventListener("change", (e) => {
    const val = e.target.value;

    reportMemberTbody.querySelectorAll("tr").forEach((tr) => {
        const badge    = tr.querySelector("td:nth-child(5) .badge");
        const badgeCls = badge ? badge.className.split(" ")[1] : "";
        const status   = badgeToStatus(badgeCls) || "";

        if (val === "all" || status === val) {
            tr.classList.remove("off");
        } else {
            tr.classList.add("off");
        }
    });
});

// 8-2. 글 신고 상태 필터
filterReportPost.addEventListener("change", (e) => {
    const val = e.target.value;

    reportPostTbody.querySelectorAll("tr").forEach((tr) => {
        const badge    = tr.querySelector("td:nth-child(5) .badge");
        const badgeCls = badge ? badge.className.split(" ")[1] : "";
        const status   = badgeToStatus(badgeCls) || "";

        if (val === "all" || status === val) {
            tr.classList.remove("off");
        } else {
            tr.classList.add("off");
        }
    });
});


// 9. 회원 신고 행 클릭 → 심사 모달
// 컬럼: 번호(0)-신고자(1)-신고대상(2)-신고사유(3)-상태(4)-신고일(5)
reportMemberTbody.addEventListener("click", (e) => {
    const tr = e.target.closest("tr");
    if (!tr) return;
    const tds = tr.querySelectorAll("td");
    const badgeCls = tds[4].querySelector(".badge").className.split(" ")[1];
    const isPending = badgeCls === "badge-pending";

    document.querySelector("#modalReportTitle").textContent  = "회원 신고 심사";
    document.querySelector("#reportReporter").textContent    = tds[1].textContent;
    document.querySelector("#reportDate").textContent        = tds[5].textContent;
    document.querySelector("#reportTargetLabel").textContent = "피신고자";
    document.querySelector("#reportTarget").textContent      = tds[2].textContent;
    document.querySelector("#reportReason").textContent      = tds[3].textContent;
    document.querySelector("#reportStatusBadge").innerHTML   = tds[4].innerHTML;

    if (isPending) {
        reportRejectedBtn.classList.remove("off");
        reportDoneBtn.classList.remove("off");
    } else {
        reportRejectedBtn.classList.add("off");
        reportDoneBtn.classList.add("off");
    }

    modalReportDetail.classList.remove("off");
});

// 9-2. 글 신고 행 클릭 → 심사 모달
// 컬럼: 번호(0)-신고자(1)-신고대상(2)-신고사유(3)-상태(4)-신고일(5)
reportPostTbody.addEventListener("click", (e) => {
    const tr = e.target.closest("tr");
    if (!tr) return;
    const tds = tr.querySelectorAll("td");
    const badgeCls = tds[4].querySelector(".badge").className.split(" ")[1];
    const isPending = badgeCls === "badge-pending";

    document.querySelector("#modalReportTitle").textContent  = "글 신고 심사";
    document.querySelector("#reportReporter").textContent    = tds[1].textContent;
    document.querySelector("#reportDate").textContent        = tds[5].textContent;
    document.querySelector("#reportTargetLabel").textContent = "신고 게시물";
    document.querySelector("#reportTarget").textContent      = tds[2].textContent;
    document.querySelector("#reportReason").textContent      = tds[3].textContent;
    document.querySelector("#reportStatusBadge").innerHTML   = tds[4].innerHTML;

    if (isPending) {
        reportRejectedBtn.classList.remove("off");
        reportDoneBtn.classList.remove("off");
    } else {
        reportRejectedBtn.classList.add("off");
        reportDoneBtn.classList.add("off");
    }

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

// 9-4. 반려 버튼
reportRejectedBtn.addEventListener("click", (e) => {
    let result = confirm("해당 신고를 반려하시겠습니까?");

    if (result) {
        alert("반려 처리되었습니다.");
        modalReportDetail.classList.add("off");
    }
});

// 9-5. 처리완료 버튼
reportDoneBtn.addEventListener("click", (e) => {
    let result = confirm("해당 신고를 처리 완료하시겠습니까?");

    if (result) {
        alert("처리 완료되었습니다.");
        modalReportDetail.classList.add("off");
    }
});


// 10. 전문가 신청 행 클릭 → 심사 모달
// 컬럼: 번호(0)-이름(1)-이메일(2)-소속(3)-상태(4)
expertApplyTbody.addEventListener("click", (e) => {
    const tr = e.target.closest("tr");
    if (!tr) return;
    const tds = tr.querySelectorAll("td");
    const badgeCls = tds[4].querySelector(".badge").className.split(" ")[1];
    const isPending = badgeCls === "badge-pending";

    document.querySelector("#expertApplicant").textContent = tds[1].textContent;
    document.querySelector("#expertEmail").textContent     = tds[2].textContent;
    document.querySelector("#expertCompany").textContent   = tds[3].textContent;
    document.querySelector("#expertDate").textContent      = tds[5].textContent;
    document.querySelector("#expertReason").textContent    = "무역 분야 10년 경력 보유, 관련 자격증 취득 완료. 전문가로서 양질의 정보를 제공하고자 신청합니다.";
    document.querySelector("#expertStatusBadge").innerHTML = tds[4].innerHTML;

    if (isPending) {
        expertRejectedBtn.classList.remove("off");
        expertApproveBtn.classList.remove("off");
    } else {
        expertRejectedBtn.classList.add("off");
        expertApproveBtn.classList.add("off");
    }

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

// 10-3. 전문가 반려 버튼
expertRejectedBtn.addEventListener("click", (e) => {
    let result = confirm("전문가 신청을 반려하시겠습니까?");
    if (result) {
        alert("반려 처리되었습니다.");
        modalExpertDetail.classList.add("off");
    }
});

// 10-4. 전문가 승인 버튼
expertApproveBtn.addEventListener("click", (e) => {
    let result = confirm("전문가 신청을 승인하시겠습니까?");
    if (result) {
        alert("승인 처리되었습니다.");
        modalExpertDetail.classList.add("off");
    }
});

// 10-5. 전문가 신청 상태 필터
filterExpertApply.addEventListener("change", (e) => {
    const val = e.target.value;

    expertApplyTbody.querySelectorAll("tr").forEach((tr) => {
        const badge    = tr.querySelector("td:nth-child(5) .badge");
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

previewDate.textContent = new Date().toISOString().slice(0, 10);

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
    previewSource.textContent = e.target.value || "—";
});
