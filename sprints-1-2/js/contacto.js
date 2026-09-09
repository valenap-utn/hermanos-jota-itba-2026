document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("contactForm");
    const successModalEl = document.getElementById("successModal");

    if (form && successModalEl) {
        const successModal = new bootstrap.Modal(successModalEl);

        form.addEventListener("submit", (event) => {
            event.preventDefault();
            event.stopPropagation();

            if (form.checkValidity()) {
                // Form is valid! Show success modal.
                successModal.show();

                // Reset form fields
                form.reset();
                form.classList.remove("was-validated");
            } else {
                form.classList.add("was-validated");
            }
        }, false);
    }
});
