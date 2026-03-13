import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const template = readFileSync(
  new URL("../../../templates/post-detailed/post-detailed.html", import.meta.url),
  "utf8",
);
const css = readFileSync(
  new URL("../../../static/css/post-detailed/post-detailed.css", import.meta.url),
  "utf8",
);
const js = readFileSync(
  new URL("../../../static/js/post-detailed/event.js", import.meta.url),
  "utf8",
);

function getHeroActionBarMarkup(source) {
  const match = source.match(
    /<div\s+class="post-detail-actions tweet-action-bar"[\s\S]*?<\/div>\s*<\/div>\s*<section class="post-detail-reply-box">/,
  );
  assert.ok(match, "hero action bar should exist");
  return match[0];
}

const heroActionBar = getHeroActionBarMarkup(template);

const checks = [
  {
    name: "post detail hero action bar uses four equal action slots",
    run() {
      const slotMatches = heroActionBar.match(
        /class="post-detail-action-slot"/g,
      );

      assert.equal(slotMatches?.length ?? 0, 4);
      assert.match(
        heroActionBar,
        /post-detail-action-slot"[\s\S]*?data-testid="reply"/,
      );
      assert.match(
        heroActionBar,
        /post-detail-action-slot"[\s\S]*?data-testid="like"/,
      );
      assert.match(
        heroActionBar,
        /post-detail-action-slot"[\s\S]*?tweet-action-btn--bookmark[\s\S]*?data-testid="bookmark"[\s\S]*?aria-label="북마크"[\s\S]*?data-path-inactive=[\s\S]*?data-path-active=/,
      );
      const heroBookmarkPath = heroActionBar.match(
        /tweet-action-btn--bookmark[\s\S]*?<path[^>]*data-path-inactive="([^"]+)"[^>]*d="([^"]+)"/,
      );
      assert.ok(heroBookmarkPath, "hero bookmark path metadata should exist");
      assert.equal(heroBookmarkPath[1], heroBookmarkPath[2]);
      assert.match(heroActionBar, /post-detail-action-slot"[\s\S]*?id="heroShareButton"/);
      assert.doesNotMatch(heroActionBar, /tweet-action-right/);
    },
  },
  {
    name: "post detail action bar styles use a four-column detail layout",
    run() {
      assert.match(
        css,
        /\.post-detail-actions\.tweet-action-bar\s*\{[\s\S]*display:\s*grid;[\s\S]*grid-template-columns:\s*repeat\(4,\s*minmax\(0,\s*1fr\)\);/,
      );
      assert.match(
        css,
        /\.post-detail-action-slot\s*\{[\s\S]*display:\s*flex;[\s\S]*justify-content:\s*center;/,
      );
      assert.match(
        css,
        /\.post-detail-actions\.tweet-action-bar\s+\.post-detail-action-button,\s*[\s\S]*\.post-detail-actions\.tweet-action-bar\s+\.tweet-action-btn\s*\{[\s\S]*justify-content:\s*center;/,
      );
    },
  },
  {
    name: "reply cards use the mypage-style five-action layout with a trailing utility group",
    run() {
      const replySectionMatch = template.match(
        /<section class="post-detail-replies"[\s\S]*?<\/section>/,
      );
      assert.ok(replySectionMatch, "reply section should exist");
      const replySection = replySectionMatch[0];
      const replyBarMatches = template.match(
        /class="post-detail-actions post-detail-actions--reply"/g,
      );
      const replyUtilityMatches = replySection.match(
        /class="post-detail-action-right"/g,
      );

      assert.equal(replyBarMatches?.length ?? 0, 5);
      assert.equal(replyUtilityMatches?.length ?? 0, 5);
      assert.doesNotMatch(
        template,
        /<div class="post-detail-reply-actions">\s*<button type="button"><span>\d+<\/span><\/button>\s*<button type="button"><span>\d+<\/span><\/button>\s*<button type="button"><span>\d+<\/span><\/button>\s*<\/div>/,
      );
      assert.match(
        replySection,
        /post-detail-actions--reply[\s\S]*?post-detail-action-button[\s\S]*?aria-label="답글[\s\S]*?post-detail-action-button[\s\S]*?tweet-action-btn--like[\s\S]*?post-detail-action-button[\s\S]*?aria-label="조회수[\s\S]*?post-detail-action-right[\s\S]*?tweet-action-btn--bookmark[\s\S]*?tweet-action-btn--share/,
      );
      assert.doesNotMatch(replySection, /post-detail-action-slot/);
    },
  },
  {
    name: "reply action bars use the mypage-style flex layout",
    run() {
      assert.match(
        css,
        /\.post-detail-actions--reply\s*\{[\s\S]*margin-top:\s*8px;/,
      );
      assert.match(
        css,
        /\.post-detail-actions--reply\s*\{[\s\S]*display:\s*flex;[\s\S]*align-items:\s*center;[\s\S]*gap:\s*4px;[\s\S]*width:\s*100%;/,
      );
      assert.match(
        css,
        /\.post-detail-action-right\s*\{[\s\S]*display:\s*flex;[\s\S]*align-items:\s*center;[\s\S]*gap:\s*4px;[\s\S]*margin-left:\s*auto;/,
      );
      assert.match(
        css,
        /\.post-detail-actions--reply\s+\.post-detail-action-button,\s*[\s\S]*\.post-detail-actions--reply\s+\.tweet-action-btn\s*\{[\s\S]*height:\s*34px;[\s\S]*padding:\s*0 6px;/,
      );
    },
  },
  {
    name: "reply thread uses a group rail that stretches across multiple replies and media",
    run() {
      assert.match(
        template,
        /class="post-detail-thread-group"/,
      );
      assert.match(
        template,
        /class="post-detail-thread-item post-detail-reply-card postCard"/,
      );
      assert.match(
        template,
        /class="post-detail-thread-item post-detail-reply-card postCard post-detail-thread-item--media"/,
      );
      assert.match(
        template,
        /class="post-detail-thread-media"/,
      );
      assert.doesNotMatch(template, /post-detail-child-replies/);
      assert.match(
        css,
        /\.post-detail-thread-group\s*\{[\s\S]*position:\s*relative;/,
      );
      assert.match(
        css,
        /\.post-detail-thread-group::before\s*\{[\s\S]*content:\s*"";[\s\S]*position:\s*absolute;[\s\S]*left:\s*35px;[\s\S]*top:\s*48px;[\s\S]*bottom:\s*\d+px;[\s\S]*width:\s*2px;[\s\S]*background:\s*rgb\(207,\s*217,\s*222\);/,
      );
      assert.match(
        css,
        /\.post-detail-thread-media\s*\{[\s\S]*display:\s*block;[\s\S]*width:\s*100%;[\s\S]*border-radius:\s*16px;/,
      );
      assert.match(
        css,
        /\.post-detail-thread-item\s+\.post-detail-avatar\s*\{[\s\S]*position:\s*relative;[\s\S]*z-index:\s*1;/,
      );
    },
  },
  {
    name: "reply composer uses the main reply footer-bottom and emoji picker structure",
    run() {
      const replyBoxMatch = template.match(
        /<section class="post-detail-reply-box"[\s\S]*?<\/section>[\s\S]*?<section class="post-detail-replies"/,
      );
      assert.ok(replyBoxMatch, "reply composer section should exist");
      const replyBox = replyBoxMatch[0];

      assert.match(
        replyBox,
        /class="post-detail-inline-reply"/,
      );
      assert.match(
        replyBox,
        /class="post-detail-inline-reply-card"/,
      );
      assert.match(
        replyBox,
        /class="post-detail-inline-reply-context"[\s\S]*@Semicon_player[\s\S]*hidden/,
      );
      assert.match(
        replyBox,
        /class="post-detail-inline-reply-body tweet-modal__input-wrap"/,
      );
      assert.match(
        replyBox,
        /class="composerField"[\s\S]*class="post-detail-inline-reply-editor"/,
      );
      assert.match(
        replyBox,
        /class="tweet-modal__attachment post-detail-inline-reply-attachments attachments"[\s\S]*data-attachment-preview/,
      );
      assert.match(
        replyBox,
        /class="tweet-modal__footer"[\s\S]*class="tweet-modal__footer-meta"[\s\S]*class="tweet-modal__footer-meta-slot tweet-modal__footer-meta-slot--end"/,
      );
      assert.match(
        replyBox,
        /class="tweet-modal__footer-bottom"[\s\S]*hidden/,
      );
      assert.match(
        replyBox,
        /class="tweet-modal__footer-bottom"[\s\S]*class="tweet-modal__toolbar"[\s\S]*data-testid="toolBar"/,
      );
      assert.match(
        replyBox,
        /class="tweet-modal__toolbar"[\s\S]*data-testid="mediaUploadButton"[\s\S]*data-testid="gifSearchButton"[\s\S]*data-testid="emojiButton"[\s\S]*data-testid="geoButton"/,
      );
      assert.match(
        replyBox,
        /data-testid="mediaUploadButton"/,
      );
      assert.match(
        replyBox,
        /data-testid="gifSearchButton"/,
      );
      assert.match(
        replyBox,
        /data-testid="emojiButton"/,
      );
      assert.match(
        replyBox,
        /data-testid="geoButton"/,
      );
      assert.match(
        replyBox,
        /class="tweet-modal__tool-btn tweet-modal__tool-btn--format"[\s\S]*aria-label="굵게, \(CTRL\+B\) 님"[\s\S]*data-format="bold"/,
      );
      assert.match(
        replyBox,
        /class="tweet-modal__tool-btn tweet-modal__tool-btn--format"[\s\S]*aria-label="기울임꼴, \(CTRL\+I\) 님"[\s\S]*data-format="italic"/,
      );
      assert.match(
        replyBox,
        /class="tweet-modal__emoji-picker"[\s\S]*class="tweet-modal__emoji-search"[\s\S]*class="tweet-modal__emoji-tabs"[\s\S]*class="tweet-modal__emoji-content"[\s\S]*data-testid="emojiPickerContent"/,
      );
      assert.match(
        replyBox,
        /data-emoji-category="recent"[\s\S]*data-emoji-category="smileys"[\s\S]*data-emoji-category="animals"[\s\S]*data-emoji-category="food"[\s\S]*data-emoji-category="activities"[\s\S]*data-emoji-category="travel"[\s\S]*data-emoji-category="objects"[\s\S]*data-emoji-category="symbols"[\s\S]*data-emoji-category="flags"/,
      );
      assert.match(
        replyBox,
        /class="composerActions"[\s\S]*class="composerGauge"[\s\S]*id="replyGauge"[\s\S]*class="composerGaugeText"[\s\S]*id="replyGaugeText"[\s\S]*class="tweet-modal__submit"[\s\S]*data-testid="tweetButton"/,
      );
      assert.match(
        replyBox,
        /class="tweet-modal__location-view"[\s\S]*data-testid="location-back"/,
      );
      assert.match(
        replyBox,
        /class="tweet-modal__location-item-label">대한민국 강남구</,
      );
      assert.match(
        replyBox,
        /class="tweet-modal__location-item-label">대한민국 서초구</,
      );
      assert.match(
        css,
        /\.tweet-modal__footer-bottom\[hidden\],\s*[\s\S]*\.post-detail-inline-reply-context\[hidden\]\s*\{[\s\S]*display:\s*none/,
      );
      assert.match(
        css,
        /\.post-detail-inline-reply\.is-focused\s+\.tweet-modal__footer-bottom,\s*[\s\S]*\.post-detail-inline-reply\.is-focused\s+\.post-detail-inline-reply-context\s*\{[\s\S]*display:\s*flex/,
      );
      assert.match(
        css,
        /\.post-detail-inline-reply-card\s*\{[\s\S]*display:\s*flex;[\s\S]*gap:\s*12px;[\s\S]*padding:\s*4px 0 0;/,
      );
      assert.match(
        css,
        /\.post-detail-inline-reply-body\.tweet-modal__input-wrap\s*\{[\s\S]*display:\s*flex;[\s\S]*flex-direction:\s*column;[\s\S]*gap:\s*12px;/,
      );
      assert.match(
        css,
        /\.post-detail-inline-reply-editor\s*\{[\s\S]*min-height:\s*24px;[\s\S]*font-size:\s*20px;[\s\S]*line-height:\s*24px;/,
      );
      assert.match(
        css,
        /\.tweet-modal__footer-bottom\s*\{[\s\S]*position:\s*relative;[\s\S]*display:\s*flex;[\s\S]*align-items:\s*center;[\s\S]*justify-content:\s*space-between;/,
      );
      assert.match(
        css,
        /\.tweet-modal__emoji-picker\s*\{[\s\S]*position:\s*fixed;[\s\S]*width:\s*min\(565px,\s*calc\(100vw - 32px\)\);/,
      );
      assert.match(
        css,
        /\.tweet-modal__emoji-tabs\s*\{[\s\S]*grid-template-columns:\s*repeat\(9,\s*1fr\);/,
      );
      assert.match(
        css,
        /\.tweet-modal__emoji-grid\s*\{[\s\S]*grid-template-columns:\s*repeat\(9,\s*minmax\(0,\s*1fr\)\);/,
      );
      assert.match(
        css,
        /\.tweet-modal__location-view\s*\{[\s\S]*position:\s*fixed;[\s\S]*inset:\s*0;/,
      );
      assert.match(
        css,
        /\.composerActions\s*\{[\s\S]*display:\s*flex;[\s\S]*align-items:\s*center;/,
      );
      assert.match(
        js,
        /function setupInlineReplyComposer\(\)/,
      );
      assert.match(
        js,
        /const composer = document\.querySelector\("\.post-detail-inline-reply"\);/,
      );
      assert.match(
        js,
        /const q = \(selector\) => composer\.querySelector\(selector\);/,
      );
      assert.match(
        js,
        /const qAll = \(selector\) => Array\.from\(composer\.querySelectorAll\(selector\)\);/,
      );
      assert.match(
        js,
        /const footerBottom = composer\.querySelector\("\.tweet-modal__footer-bottom"\);/,
      );
      assert.match(
        js,
        /composer\.classList\.toggle\("is-focused"/,
      );
      assert.match(
        js,
        /data-testid='emojiButton'|data-testid=\"emojiButton\"/,
      );
      assert.match(
        js,
        /data-testid='geoButton'|data-testid=\"geoButton\"/,
      );
      assert.match(
        js,
        /data-testid='mediaUploadButton'|data-testid=\"mediaUploadButton\"/,
      );
      assert.match(
        js,
        /syncInlineReplySubmitState|syncLocationUI|renderInlineReplyEmojiPicker/,
      );
      assert.match(
        js,
        /footerBottom\.hidden = !nextFocused;/,
      );
      assert.match(
        js,
        /composerEmojiCategoryMeta/,
      );
      assert.match(
        js,
        /composerEmojiCategoryData/,
      );
      assert.match(
        js,
        /parseTwemoji/,
      );
      assert.match(
        js,
        /\.tweet-modal__location-view/,
      );
      assert.match(
        js,
        /\.tweet-modal__location-item/,
      );
      assert.doesNotMatch(
        js,
        /post-detail-inline-reply-location-item"\s*data-location-value="\$\{location\}/,
      );
    },
  },
  {
    name: "post detail script keeps only the main action-bar behaviors with comments",
    run() {
      assert.match(
        js,
        /게시물 상세 화면의 액션 바 초기화만 연결한다\.\s*\nfunction setupPostDetailPage\(\)/,
      );
      assert.match(
        js,
        /setupInlineReplyComposer\(\);/,
      );
      assert.match(
        js,
        /메인 피드의 게시글 액션 중 상세 화면에 필요한 최소 동작만 옮긴다\.\s*\nfunction setupPostDetailActions\(\)/,
      );
      assert.match(js, /window\.addEventListener\("DOMContentLoaded", setupPostDetailPage\);/);
      assert.match(js, /document\.querySelectorAll\("\.tweet-action-btn--like"\)\.forEach/);
      assert.match(js, /button\.classList\.toggle\("active"\)/);
      assert.match(js, /countElement\.textContent = String\(/);
      assert.match(js, /document\s*\n\s*\.querySelectorAll\("\.tweet-action-btn--bookmark"\)\s*\n\s*\.forEach\(\(button\) => \{/);
      assert.match(js, /const path = button\.querySelector\("path"\);/);
      assert.match(js, /const isActive = button\.classList\.toggle\("active"\);/);
      assert.match(js, /path\.setAttribute\(\s*"d",\s*isActive/);
      assert.match(js, /button\.setAttribute\(\s*"data-testid",\s*isActive \? "removeBookmark" : "bookmark"/);
      assert.match(js, /button\.setAttribute\(\s*"aria-label",\s*isActive \? "북마크에 추가됨" : "북마크"/);
      assert.match(js, /navigator\.clipboard\?\.writeText/);
      assert.doesNotMatch(js, /function buildShareDropdownMarkup\(top, right\)/);
      assert.match(js, /function openShareDropdown\(button\) \{/);
      assert.match(js, /function openShareChatModal\(\) \{/);
      assert.match(js, /const shareMenuIcons = \{/);
      assert.match(js, /function createShareMenuItemMarkup\(type, label\) \{/);
      assert.match(js, /function openShareModal\(markup, onClick\) \{/);
      assert.match(js, /const lc = document\.createElement\("div"\);/);
      assert.match(js, /lc\.className = "layers-dropdown-container";/);
      assert.match(js, /const top = rect\.bottom \+ 8;/);
      assert.doesNotMatch(js, /const top = rect\.bottom \+ window\.scrollY \+ 8;/);
      assert.match(js, /lc\.innerHTML = `[\s\S]*class="dropdown-menu"[\s\S]*\$\{createShareMenuItemMarkup\("copy", "링크 복사하기"\)\}[\s\S]*\$\{createShareMenuItemMarkup\("chat", "Chat으로 전송하기"\)\}[\s\S]*\$\{createShareMenuItemMarkup\("bookmark", "폴더에 북마크 추가하기"\)\}[\s\S]*`;/);
      assert.match(js, /const menu = lc\.querySelector\("\.dropdown-menu"\);/);
      assert.match(js, /const menuWidth = menu\.offsetWidth \|\| 0;/);
      assert.match(js, /const left = Math\.min\(/);
      assert.match(js, /rect\.right - menuWidth \+ 20/);
      assert.match(js, /menu\.style\.top = `\$\{top\}px`;/);
      assert.match(js, /menu\.style\.left = `\$\{left\}px`;/);
      assert.match(js, /menu\.style\.right = "auto";/);
      assert.match(js, /lc\.addEventListener\("click", \(e\) => \{/);
      assert.match(js, /const ab = e\.target\.closest\("\.share-menu-item"\);/);
      assert.match(js, /if \(ab\.classList\.contains\("share-menu-item--chat"\)\) \{[\s\S]*openShareChatModal\(\);[\s\S]*return;[\s\S]*\}/);
      assert.match(js, /class="share-sheet__search"[\s\S]*class="share-sheet__search-input"[\s\S]*class="share-sheet__list"/);
      assert.match(js, /share-sheet__user/);
      assert.match(js, /document\.querySelectorAll\("\.tweet-action-btn--share"\)\.forEach/);
      assert.match(js, /button\.closest\("\.postCard, \[data-post-card\]"\)/);
      assert.match(js, /window\.addEventListener\([\s\S]*"scroll"[\s\S]*closeShareDropdown\(\);[\s\S]*passive:\s*true[\s\S]*\)/);
      assert.match(js, /document\.addEventListener\("keydown", \(event\) => \{/);
      assert.match(js, /let attachmentPreviewUrls = \[\];/);
      assert.match(js, /function revokeAttachmentPreviewUrls\(\) \{/);
      assert.match(js, /URL\.revokeObjectURL\(url\);/);
      assert.match(js, /attachmentPreviewUrls = attachedFiles\.map\(\s*\(file\) =>[\s\S]*URL\.createObjectURL\(file\),?[\s\S]*\);/);
      assert.doesNotMatch(js, /document\.execCommand/);
    },
  },
];

checks.forEach(({ name, run }) => {
  run();
  console.log(`PASS ${name}`);
});
