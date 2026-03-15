const LANGUAGES = [
    "영어 - English",
    "한국어",
    "구자라트어 - ગુજરાતી",
    "그리스어 - Ελληνικά",
    "네덜란드어 - Nederlands",
    "네팔어 - नेपाली",
    "노르웨이어 - norsk",
    "덴마크어 - dansk",
    "독일어 - Deutsch",
    "디베히어 - Divehi",
    "라오어 - ລາວ",
    "라트비아어 - latviešu",
    "러시아어 - русский",
    "루마니아어 - română",
    "리투아니아어 - lietuvių",
    "마라티어 - मराठी",
    "말라얄람어 - മലയാളം",
    "말레이어 - Melayu",
    "바스크어 - euskara",
    "버마어 - မြန်မာ",
    "베트남어 - Tiếng Việt",
    "벵골어 - বাংলা",
    "불가리아어 - български",
    "세르비아어 - српски",
    "소라니 쿠르드어 - کوردیی ناوەندی",
    "스리랑카어 - සිංහල",
    "스웨덴어 - svenska",
    "스페인어 - español",
    "슬로베니아어 - slovenščina",
    "신디어 - سنڌي",
    "아랍어 - العربية",
    "아르메니아어 - հայերեն",
    "아이슬란드어 - íslenska",
    "아이티어 - Haitian Creole",
    "암하라어 - አማርኛ",
    "에스토니아어 - eesti",
    "에스페란토어 - esperanto",
    "오리야어 - ଓଡ଼ିଆ",
    "우르두어 - اردو",
    "우크라이나어 - українська",
    "웨일스어 - Cymraeg",
    "위구르어 - ئۇيغۇرچە",
    "이탈리아어 - italiano",
    "인도네시아어 - Indonesia",
    "일본어 - 日本語",
    "조지아어 - ქართული",
    "중국어 - 中文",
    "체코어 - čeština",
    "카탈로니아어 - català",
    "칸나다어 - ಕನ್ನಡ",
    "크메르어 - ខ្មែរ",
    "타갈로그어 - Tagalog",
    "타밀어 - தமிழ்",
    "태국어 - ไทย",
    "터키어 - Türkçe",
    "텔루구어 - తెలుగు",
    "티베트어 - བོད་སྐད་",
    "파슈토어 - پښتو",
    "펀잡어 - ਪੰਜਾਬੀ",
    "페르시아어 - فارسی",
    "포르투갈어 - português",
    "폴란드어 - polski",
    "프랑스어 - français",
    "핀란드어 - suomi",
    "헝가리어 - magyar",
    "히브리어 - עברית",
    "힌디어 - हिन्दी",
    "기타"
];

document.addEventListener("DOMContentLoaded", () => {
    const list = document.querySelector(".language-list");
    if (!list) {
        return;
    }

    let isExpanded = false;

    const fragment = document.createDocumentFragment();

    LANGUAGES.forEach((label, index) => {
        const item = document.createElement("button");
        item.type = "button";
        item.className = "language-item js-lang-item";
        item.dataset.index = String(index);
        item.setAttribute("aria-selected", "false");

        if (index >= 2) {
            item.classList.add("is-hidden");
        }

        const text = document.createElement("span");
        text.textContent = label;

        const box = document.createElement("span");
        box.className = "check-box";
        box.setAttribute("aria-hidden", "true");

        item.appendChild(text);
        item.appendChild(box);
        fragment.appendChild(item);
    });

    const moreButton = document.createElement("button");
    moreButton.type = "button";
    moreButton.className = "language-more js-language-more";
    moreButton.textContent = "더보기";

    fragment.appendChild(moreButton);
    list.appendChild(fragment);

    list.addEventListener("click", (event) => {
        const target = event.target;
        if (!(target instanceof Element)) {
            return;
        }

        const more = target.closest(".js-language-more");
        if (more instanceof HTMLButtonElement) {
            isExpanded = !isExpanded;
            list.querySelectorAll(".js-lang-item").forEach((langItem, idx) => {
                langItem.classList.toggle("is-hidden", !isExpanded && idx >= 2);
            });
            more.textContent = isExpanded ? "접기" : "더보기";
            return;
        }

        const item = target.closest(".js-lang-item");
        if (!(item instanceof HTMLButtonElement)) {
            return;
        }

        const willCheck = !item.classList.contains("is-checked");
        item.classList.toggle("is-checked", willCheck);
        item.setAttribute("aria-selected", willCheck ? "true" : "false");
    });
});
