document.addEventListener("DOMContentLoaded", () => {
    changeTabs();
});

function changeTabs() {
    const tabs = document.querySelectorAll('[role = "tab"]');
    console.log(tabs);

    tabs.forEach((tab, i) => {
        tab.addEventListener("click", function () {
            // active 제거
            tabs.forEach((t) => {
                t.setAttribute("aria-selected", "false");
                t.setAttribute("tabindex", "-1");
                // 언더바 제거
                const underbar = t.querySelector(".tab-content-underbar");
                if (underbar) {
                    underbar.remove();
                }

                const textWrap = t.querySelector(".tab-content-wrap");
                if (textWrap) {
                    textWrap.style.color = "rgb(83, 100, 113)";
                }
            });

            // Add active state to clicked tab
            this.setAttribute("aria-selected", "true");
            this.setAttribute("tabindex", "0");

            // Change text color to black
            const activeTextWrap = this.querySelector(".tab-content-wrap");
            if (activeTextWrap) {
                activeTextWrap.style.color = "rgb(15, 20, 25)";

                // Add underbar
                const existingUnderbar = activeTextWrap.querySelector(
                    ".tab-content-underbar",
                );
                if (!existingUnderbar) {
                    const underbar = document.createElement("div");
                    underbar.className = "tab-content-underbar";
                    underbar.style.backgroundColor = "rgb(29, 155, 240)";
                    activeTextWrap.appendChild(underbar);
                }
            }

            // Show notification (optional)
            const tabName = this.querySelector(".tab-content").textContent;
            console.log(`Switched to ${tabName} tab`);

            // You can add content switching logic here
            switchTabContent(index);
        });
    });
}

function switchTabContent(tabIndex) {
    // Add your content switching logic here
    if (tabIndex === 0) {
        console.log("Showing Feed content");
        // Show feed content
    } else if (tabIndex === 1) {
        console.log("Showing Friends content");
        // Show friends content
    }
}
