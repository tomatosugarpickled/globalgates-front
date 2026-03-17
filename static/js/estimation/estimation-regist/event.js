window.addEventListener("load", () => {
    const createPostButton = document.getElementById("createPostButton");
    const submitButton = document.getElementById("postSubmitButton");
    const requiredFields = Array.from(
        document.querySelectorAll(
            'input[name="postName"], input[name="postPrice"], textarea[name="postContent"]',
        ),
    );

    const syncSubmitState = () => {
        if (!submitButton || requiredFields.length === 0) {
            return;
        }

        submitButton.disabled = requiredFields.some(
            (field) => !field.value.trim(),
        );
    };

    if (!createPostButton) {
        return;
    }

    requiredFields.forEach((field) => {
        field.addEventListener("input", syncSubmitState);
    });

    syncSubmitState();

    window.setTimeout(() => {
        createPostButton.click();
    }, 0);
});
