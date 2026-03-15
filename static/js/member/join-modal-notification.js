document.addEventListener("DOMContentLoaded", () => {
    const buttons = document.querySelectorAll(".js-bounce-btn");

    buttons.forEach((button) => {
        button.addEventListener("click", () => {
            button.classList.remove("is-bouncing");
            void button.offsetWidth;
            button.classList.add("is-bouncing");
        });
    });
});
