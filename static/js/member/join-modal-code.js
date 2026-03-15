document.addEventListener("DOMContentLoaded", () => {
    const wraps = document.querySelectorAll(".name-placeholder-wrap, .phone-number-placeholder");

    wraps.forEach((wrap) => {
        const input = wrap.querySelector("input");
        const label = wrap.querySelector(".name-placeholder, .phone-placeholder");
        const labelText = wrap.querySelector(".name-text, .phone-text");

        if (!input || !label || !labelText) {
            return;
        }

        if (input.value.trim() !== "") {
            shrink(labelText);
        }

        input.addEventListener("focus", () => {
            label.style.borderColor = "rgb(29, 155, 240)";
            label.style.borderWidth = "2px";
            shrink(labelText);
        });

        input.addEventListener("input", () => {
            shrink(labelText);
        });

        input.addEventListener("blur", () => {
            label.style.borderColor = "rgb(207, 217, 222)";
            label.style.borderWidth = "1px";

            if (input.value.trim() === "" && !input.readOnly) {
                expand(labelText);
            }
        });
    });
});

function shrink(labelText) {
    labelText.style.fontSize = "12px";
    labelText.style.paddingTop = "8px";
    labelText.style.color = "rgb(29, 155, 240)";
}

function expand(labelText) {
    labelText.style.fontSize = "17px";
    labelText.style.paddingTop = "16px";
    labelText.style.color = "rgb(83, 100, 113)";
}
