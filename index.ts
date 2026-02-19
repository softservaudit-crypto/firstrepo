interface PersonalData {
    name: string;
    email: string;
    age: number;
    gender: string;
}

function validateFormData(data: PersonalData): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!data.name || !data.email || !data.age || !data.gender) {
        return false;
    }
    if (!emailRegex.test(data.email)) {
        return false;
    }
    if (data.age < 1 || data.age > 150) {
        return false;
    }
    if (!["male", "female", "other"].includes(data.gender)) {
        return false;
    }
    return true;
}

function handleSubmit(event: Event): void {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const formData: PersonalData = {
        name: (form.querySelector("#name") as HTMLInputElement).value.trim(),
        email: (form.querySelector("#email") as HTMLInputElement).value.trim(),
        age: parseInt((form.querySelector("#age") as HTMLInputElement).value, 10),
        gender: (form.querySelector("#gender") as HTMLSelectElement).value,
    };
    if (validateFormData(formData)) {
        fetch("/api/submit", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData),
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.success) {
                    console.log("Form submitted successfully:", formData);
                } else {
                    console.error("Submission failed:", data.error);
                }
            })
            .catch((err) => {
                console.error("Network error:", err);
            });
    } else {
        console.error("Validation failed. Please check your input.");
    }
}

export { PersonalData, validateFormData, handleSubmit };
