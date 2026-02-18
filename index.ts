// index.ts

// Type definitions for the personal data form
interface PersonalData {
    name: string;
    email: string;
    phone: string;
}

// Function to validate the form data
function validateFormData(data: PersonalData): boolean {
    // Basic validation for empty fields and email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!data.name || !data.email || !data.phone) {
        return false;
    }
    if (!emailRegex.test(data.email)) {
        return false;
    }
    return true;
}

// Function to handle form submission
function handleSubmit(event: Event): void {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const formData: PersonalData = {
        name: (form.querySelector('#name') as HTMLInputElement).value,
        email: (form.querySelector('#email') as HTMLInputElement).value,
        phone: (form.querySelector('#phone') as HTMLInputElement).value,
    };
    if (validateFormData(formData)) {
        console.log('Form submitted successfully:', formData);
        // Proceed with form submission (API call, etc.)
    } else {
        console.error('Validation failed. Please check your input.');
    }
}

// Sample HTML form
const formHTML = `
<form id='personal-data-form' onsubmit='handleSubmit(event)'>
    <label for='name'>Name:</label>
    <input type='text' id='name' required />
    <label for='email'>Email:</label>
    <input type='email' id='email' required />
    <label for='phone'>Phone:</label>
    <input type='tel' id='phone' required />
    <button type='submit'>Submit</button>
</form>
`;

document.body.innerHTML += formHTML;