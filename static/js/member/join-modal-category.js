document.addEventListener("DOMContentLoaded", () => {
    const items = Array.from(document.querySelectorAll(".js-category-item"));
    const status = document.querySelector(".js-category-status");
    const nextButton = document.querySelector(".js-next-button");

    if (!items.length || !status || !nextButton) {
        return;
    }

    const setState = (selectedCount) => {
        if (selectedCount > 0) {
            status.textContent = "잘하셨어요 🎉";
            nextButton.disabled = false;
            nextButton.classList.add("is-enabled");
            return;
        }

        status.textContent = "0 개/1 개 선택됨";
        nextButton.disabled = true;
        nextButton.classList.remove("is-enabled");
    };

    items.forEach((item) => {
        item.addEventListener("click", () => {
            const isAlreadySelected = item.classList.contains("is-selected");

            items.forEach((button) => {
                button.classList.remove("is-selected");
            });

            if (!isAlreadySelected) {
                item.classList.add("is-selected");
            }

            const selectedCount = document.querySelectorAll(".js-category-item.is-selected").length;
            setState(selectedCount);
        });
    });

    setState(0);
});
