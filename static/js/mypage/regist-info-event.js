window.onload = () => {
    const regionButton = document.querySelector(".Info-Tab-Info-Button");
    const subcribeButton = document.querySelector(".Info-Tab-Item.Subscribe");

    const backdrop = document.querySelector(".Modal-BackDrop");
    const regionModal = document.querySelector(".Small-Modal.Region");
    const subcribeModal = document.querySelector(".Small-Modal.Pro");

    regionButton.addEventListener("click", (e) => {
        backdrop.classList.remove("off");
        regionModal.classList.remove("off");
    });

    subcribeButton.addEventListener("click", (e) => {
        backdrop.classList.remove("off");
        subcribeModal.classList.remove("off");
    });

    regionModal.addEventListener("click", (e) => {
        if (e.target.closest(".Small-Button.Confirm")) {
            backdrop.classList.add("off");
            regionModal.classList.add("off");
        }
    });

    subcribeModal.addEventListener("click", (e) => {
        // [수정] "clikc" → "click"
        if (e.target.closest(".Small-Button.Confirm")) {
            backdrop.classList.add("off");
            subcribeModal.classList.add("off");
        }
    });
};
