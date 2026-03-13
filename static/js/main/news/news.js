// ============ 전역 유틸리티 ============

function formatCount(num) {
    if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    return num.toString();
}

function showToast(message) {
    var existing = document.querySelector('.toast');
    if (existing) existing.remove();
    var toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(function() { toast.remove(); }, 3000);
}

function closeAllDropdowns() {
    document.querySelectorAll('.dropdown-menu.show').forEach(function(d) {
        d.classList.remove('show');
    });
}

document.addEventListener('click', function() {
    closeAllDropdowns();
});

document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeAllDropdowns();
        document.querySelectorAll('.modal-overlay.show, .dialog-overlay.show').forEach(function(m) {
            m.classList.remove('show');
            document.body.style.overflow = '';
        });
    }
});

// ============ 1. 헤더 Save 버튼 ============
var saveBtn = document.querySelector('.header-save-btn');
if (saveBtn) {
    var isSaved = false;
    var savePath = saveBtn.querySelector('svg path');
    var SAVE_OUTLINE = 'M4 4.5C4 3.12 5.119 2 6.5 2h11C18.881 2 20 3.12 20 4.5v18.44l-8-5.71-8 5.71V4.5zM6.5 4c-.276 0-.5.22-.5.5v14.56l6-4.29 6 4.29V4.5c0-.28-.224-.5-.5-.5h-11z';
    var SAVE_FILLED = 'M4 4.5C4 3.12 5.119 2 6.5 2h11C18.881 2 20 3.12 20 4.5v18.44l-8-5.71-8 5.71V4.5z';
    saveBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        isSaved = !isSaved;
        saveBtn.setAttribute('aria-label', isSaved ? '저장 취소' : '저장');
        savePath.setAttribute('d', isSaved ? SAVE_FILLED : SAVE_OUTLINE);
        showToast(isSaved ? '저장되었습니다.' : '저장이 취소되었습니다.');
    });
}

// ============ 2. 헤더 Share 드롭다운 ============
var headerShareBtn = document.querySelector('.header-share-btn');
var shareDropdown = document.querySelector('.share-dropdown');
if (headerShareBtn && shareDropdown) {
    headerShareBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        closeAllDropdowns();
        var rect = headerShareBtn.getBoundingClientRect();
        shareDropdown.style.top = rect.bottom + 4 + 'px';
        shareDropdown.style.right = (window.innerWidth - rect.right) + 'px';
        shareDropdown.classList.toggle('show');
    });
    var copyLinkHeader = shareDropdown.querySelector('.copy-link-header');
    if (copyLinkHeader) {
        copyLinkHeader.addEventListener('click', function(e) {
            e.stopPropagation();
            navigator.clipboard.writeText(window.location.href).then(function() {
                showToast('링크가 복사되었습니다.');
            });
            shareDropdown.classList.remove('show');
        });
    }
}

// ============ 3. 헤더 More 드롭다운 ============
var headerMoreBtn = document.querySelector('.header-more-btn');
var moreDropdown = document.querySelector('.more-dropdown');
if (headerMoreBtn && moreDropdown) {
    headerMoreBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        closeAllDropdowns();
        var rect = headerMoreBtn.getBoundingClientRect();
        moreDropdown.style.top = rect.bottom + 4 + 'px';
        moreDropdown.style.right = (window.innerWidth - rect.right) + 'px';
        moreDropdown.classList.toggle('show');
    });
}

// ============ 4. 신고 다이얼로그 ============
var reportBtn = document.querySelector('.report-trend-btn');
var reportDialog = document.querySelector('.report-dialog-overlay');
if (reportBtn && reportDialog) {
    reportBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        reportDialog.classList.add('show');
        document.body.style.overflow = 'hidden';
    });
    reportDialog.querySelector('.btn-yes').addEventListener('click', function(e) {
        reportDialog.classList.remove('show');
        document.body.style.overflow = '';
        showToast('트렌드가 신고되었습니다.');
    });
    reportDialog.querySelector('.btn-cancel').addEventListener('click', function(e) {
        reportDialog.classList.remove('show');
        document.body.style.overflow = '';
    });
    reportDialog.addEventListener('click', function(e) {
        if (e.target === reportDialog) {
            reportDialog.classList.remove('show');
            document.body.style.overflow = '';
        }
    });
}

// ============ 5. 탭 전환 ============
var tabs = document.querySelectorAll('.tab-item');
var tabContents = document.querySelectorAll('.tab-content');
tabs.forEach(function(tab) {
    tab.addEventListener('click', function(e) {
        tabs.forEach(function(t) {
            t.classList.remove('active');
            t.setAttribute('aria-selected', 'false');
        });
        tab.classList.add('active');
        tab.setAttribute('aria-selected', 'true');
        var target = tab.dataset.timeline;
        tabContents.forEach(function(c) {
            c.style.display = c.dataset.timeline === target ? 'block' : 'none';
        });
    });
});

// ============ 6. 좋아요 토글 ============
var LIKE_OUTLINE = 'M16.697 5.5c-1.222-.06-2.679.51-3.89 2.16l-.805 1.09-.806-1.09C9.984 6.01 8.526 5.44 7.304 5.5c-1.243.07-2.349.78-2.91 1.91-.552 1.12-.633 2.78.479 4.82 1.074 1.97 3.257 4.27 7.129 6.61 3.87-2.34 6.052-4.64 7.126-6.61 1.111-2.04 1.03-3.7.477-4.82-.561-1.13-1.666-1.84-2.908-1.91zm4.187 7.69c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z';
var LIKE_FILLED = 'M20.884 13.19c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z';

document.querySelectorAll('.tweet-action--like').forEach(function(likeBtn) {
    var isLiked = false;
    var count = parseInt(likeBtn.dataset.count);
    likeBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        isLiked = !isLiked;
        count += isLiked ? 1 : -1;
        likeBtn.dataset.count = count;
        var path = likeBtn.querySelector('svg path');
        var countEl = likeBtn.querySelector('.tweet-action-count');
        if (isLiked) {
            likeBtn.classList.add('active');
            path.setAttribute('d', LIKE_FILLED);
            likeBtn.querySelector('svg').style.color = 'rgb(249, 24, 128)';
            countEl.style.color = 'rgb(249, 24, 128)';
        } else {
            likeBtn.classList.remove('active');
            path.setAttribute('d', LIKE_OUTLINE);
            likeBtn.querySelector('svg').style.color = '';
            countEl.style.color = '';
        }
        countEl.textContent = formatCount(count);
    });
});

// ============ 7. 리포스트 드롭다운 ============
document.querySelectorAll('.tweet-action--repost').forEach(function(repostBtn) {
    var dropdown = repostBtn.querySelector('.repost-dropdown');
    if (!dropdown) return;
    repostBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        closeAllDropdowns();
        var rect = repostBtn.getBoundingClientRect();
        dropdown.style.top = rect.bottom + 4 + 'px';
        dropdown.style.left = rect.left + 'px';
        dropdown.classList.toggle('show');
    });
    var repostOpt = dropdown.querySelector('.repost-option');
    if (repostOpt) {
        repostOpt.addEventListener('click', function(e) {
            e.stopPropagation();
            var isReposted = repostBtn.classList.toggle('active');
            var countEl = repostBtn.querySelector('.tweet-action-count');
            var count = parseInt(repostBtn.dataset.count);
            count += isReposted ? 1 : -1;
            repostBtn.dataset.count = count;
            countEl.textContent = formatCount(count);
            repostBtn.querySelector('svg').style.color = isReposted ? 'rgb(0, 186, 124)' : '';
            countEl.style.color = isReposted ? 'rgb(0, 186, 124)' : '';
            dropdown.classList.remove('show');
        });
    }
    var quoteOpt = dropdown.querySelector('.quote-option');
    if (quoteOpt) {
        quoteOpt.addEventListener('click', function(e) {
            e.stopPropagation();
            dropdown.classList.remove('show');
            showToast('인용하기 기능은 준비 중입니다.');
        });
    }
});

// ============ 8. 북마크 토글 ============
var BM_OUTLINE = 'M4 4.5C4 3.12 5.119 2 6.5 2h11C18.881 2 20 3.12 20 4.5v18.44l-8-5.71-8 5.71V4.5zM6.5 4c-.276 0-.5.22-.5.5v14.56l6-4.29 6 4.29V4.5c0-.28-.224-.5-.5-.5h-11z';
var BM_FILLED = 'M4 4.5C4 3.12 5.119 2 6.5 2h11C18.881 2 20 3.12 20 4.5v18.44l-8-5.71-8 5.71V4.5z';

document.querySelectorAll('.tweet-action--bookmark').forEach(function(bmBtn) {
    var isBookmarked = false;
    bmBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        isBookmarked = !isBookmarked;
        var path = bmBtn.querySelector('svg path');
        if (isBookmarked) {
            bmBtn.classList.add('active');
            path.setAttribute('d', BM_FILLED);
            bmBtn.querySelector('svg').style.color = 'rgb(29, 155, 240)';
            showToast('북마크에 저장되었습니다.');
        } else {
            bmBtn.classList.remove('active');
            path.setAttribute('d', BM_OUTLINE);
            bmBtn.querySelector('svg').style.color = '';
        }
    });
});

// ============ 9. 포스트 공유 드롭다운 ============
document.querySelectorAll('.tweet-action--share').forEach(function(shareBtn) {
    var dropdown = shareBtn.querySelector('.share-post-dropdown');
    if (!dropdown) return;
    shareBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        closeAllDropdowns();
        var rect = shareBtn.getBoundingClientRect();
        dropdown.style.top = rect.bottom + 4 + 'px';
        dropdown.style.right = (window.innerWidth - rect.right) + 'px';
        dropdown.classList.toggle('show');
    });
    var copyLink = dropdown.querySelector('.copy-link');
    if (copyLink) {
        copyLink.addEventListener('click', function(e) {
            e.stopPropagation();
            navigator.clipboard.writeText(window.location.href).then(function() {
                showToast('링크가 복사되었습니다.');
            });
            dropdown.classList.remove('show');
        });
    }
});

// ============ 10. 트윗 더보기 드롭다운 ============
document.querySelectorAll('.more-btn').forEach(function(moreBtn) {
    var dropdown = moreBtn.querySelector('.tweet-more-dropdown');
    if (!dropdown) return;
    moreBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        closeAllDropdowns();
        var rect = moreBtn.getBoundingClientRect();
        var spaceBelow = window.innerHeight - rect.bottom;
        dropdown.style.left = rect.left + 'px';
        if (spaceBelow < 250) {
            dropdown.style.top = (rect.top - 200) + 'px';
        } else {
            dropdown.style.top = rect.bottom + 4 + 'px';
        }
        dropdown.classList.toggle('show');
    });
});

// ============ 11. Follow 버튼 ============
document.querySelectorAll('.follow-btn').forEach(function(followBtn) {
    var isFollowing = false;
    followBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        isFollowing = !isFollowing;
        if (isFollowing) {
            followBtn.textContent = '팔로잉';
            followBtn.style.backgroundColor = 'transparent';
            followBtn.style.color = 'rgb(15, 20, 25)';
            followBtn.style.border = '1px solid rgb(207, 217, 222)';
        } else {
            followBtn.textContent = '팔로우';
            followBtn.style.backgroundColor = 'rgb(15, 20, 25)';
            followBtn.style.color = '#fff';
            followBtn.style.border = '1px solid transparent';
        }
    });
    followBtn.addEventListener('mouseenter', function() {
        if (isFollowing) {
            followBtn.textContent = '언팔로우';
            followBtn.style.borderColor = 'rgb(244, 33, 46)';
            followBtn.style.color = 'rgb(244, 33, 46)';
            followBtn.style.backgroundColor = 'rgba(244, 33, 46, 0.1)';
        }
    });
    followBtn.addEventListener('mouseleave', function() {
        if (isFollowing) {
            followBtn.textContent = '팔로잉';
            followBtn.style.borderColor = 'rgb(207, 217, 222)';
            followBtn.style.color = 'rgb(15, 20, 25)';
            followBtn.style.backgroundColor = 'transparent';
        }
    });
});

// ============ 12. 답글 모달 ============
var replyModalOverlay = document.querySelector('.reply-modal-overlay');
var composeInput = replyModalOverlay ? replyModalOverlay.querySelector('.compose-input') : null;
var replySubmitBtn = replyModalOverlay ? replyModalOverlay.querySelector('.reply-btn') : null;

document.querySelectorAll('.tweet-action--reply').forEach(function(replyBtn) {
    replyBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        if (!replyModalOverlay) return;
        var tweet = replyBtn.closest('.tweet');
        var authorName = tweet.querySelector('.tweet-author-name').textContent;
        var handle = tweet.querySelector('.tweet-handle').textContent;
        var tweetText = tweet.querySelector('.tweet-text').textContent;
        replyModalOverlay.querySelector('.quoted-author').textContent = authorName;
        replyModalOverlay.querySelector('.quoted-handle').textContent = handle;
        replyModalOverlay.querySelector('.quoted-text').textContent = tweetText.slice(0, 80) + (tweetText.length > 80 ? '...' : '');
        replyModalOverlay.querySelector('.replying-to a').textContent = handle;
        replyModalOverlay.classList.add('show');
        document.body.style.overflow = 'hidden';
        setTimeout(function() { if (composeInput) composeInput.focus(); }, 100);
    });
});

if (composeInput && replySubmitBtn) {
    composeInput.addEventListener('input', function() {
        if (composeInput.value.trim().length > 0) {
            replySubmitBtn.classList.add('enabled');
        } else {
            replySubmitBtn.classList.remove('enabled');
        }
    });
}

var replyCloseBtn = replyModalOverlay ? replyModalOverlay.querySelector('.close-btn') : null;
if (replyCloseBtn) {
    replyCloseBtn.addEventListener('click', function() {
        replyModalOverlay.classList.remove('show');
        document.body.style.overflow = '';
        if (composeInput) composeInput.value = '';
        if (replySubmitBtn) replySubmitBtn.classList.remove('enabled');
    });
}
if (replyModalOverlay) {
    replyModalOverlay.addEventListener('click', function(e) {
        if (e.target === replyModalOverlay) {
            replyModalOverlay.classList.remove('show');
            document.body.style.overflow = '';
        }
    });
}

// ============ 13. 포스트 행 클릭 → 상세 이동 (더미) ============
document.querySelectorAll('.tweet').forEach(function(tweet) {
    tweet.addEventListener('click', function(e) {
        // 버튼/액션 클릭은 전파 방지됐으므로 여기선 무시
    });
});
