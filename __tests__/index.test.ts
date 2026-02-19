import { validateFormData, handleSubmit } from "../index";

describe("validateFormData", () => {
    const validData = {
        name: "John Doe",
        email: "john@example.com",
        age: 30,
        gender: "male",
    };

    it("should return true for valid data", () => {
        expect(validateFormData(validData)).toBe(true);
    });

    it("should return false when name is empty", () => {
        expect(validateFormData({ ...validData, name: "" })).toBe(false);
    });

    it("should return false when email is empty", () => {
        expect(validateFormData({ ...validData, email: "" })).toBe(false);
    });

    it("should return false for invalid email format", () => {
        expect(validateFormData({ ...validData, email: "not-an-email" })).toBe(false);
    });

    it("should return false when age is 0", () => {
        expect(validateFormData({ ...validData, age: 0 })).toBe(false);
    });

    it("should return false when age is negative", () => {
        expect(validateFormData({ ...validData, age: -5 })).toBe(false);
    });

    it("should return false when age exceeds 150", () => {
        expect(validateFormData({ ...validData, age: 151 })).toBe(false);
    });

    it("should return false for invalid gender", () => {
        expect(validateFormData({ ...validData, gender: "invalid" })).toBe(false);
    });

    it("should return true for gender 'female'", () => {
        expect(validateFormData({ ...validData, gender: "female" })).toBe(true);
    });

    it("should return true for gender 'other'", () => {
        expect(validateFormData({ ...validData, gender: "other" })).toBe(true);
    });

    it("should return false when gender is empty", () => {
        expect(validateFormData({ ...validData, gender: "" })).toBe(false);
    });
});

describe("handleSubmit", () => {
    let mockPreventDefault: jest.Mock;
    let mockEvent: Partial<Event>;
    let mockForm: Partial<HTMLFormElement>;

    beforeEach(() => {
        mockPreventDefault = jest.fn();
        jest.spyOn(console, "log").mockImplementation();
        jest.spyOn(console, "error").mockImplementation();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    function createMockForm(values: { name: string; email: string; age: string; gender: string }) {
        const elements: Record<string, { value: string }> = {
            "#name": { value: values.name },
            "#email": { value: values.email },
            "#age": { value: values.age },
            "#gender": { value: values.gender },
        };
        mockForm = {
            querySelector: jest.fn((selector: string) => elements[selector] || null),
        } as unknown as Partial<HTMLFormElement>;
        mockEvent = {
            preventDefault: mockPreventDefault,
            target: mockForm as EventTarget,
        };
    }

    it("should call preventDefault", () => {
        createMockForm({ name: "John", email: "john@example.com", age: "30", gender: "male" });
        global.fetch = jest.fn().mockResolvedValue({
            json: () => Promise.resolve({ success: true }),
        });
        handleSubmit(mockEvent as Event);
        expect(mockPreventDefault).toHaveBeenCalled();
    });

    it("should call fetch with valid data", () => {
        createMockForm({ name: "John", email: "john@example.com", age: "30", gender: "male" });
        global.fetch = jest.fn().mockResolvedValue({
            json: () => Promise.resolve({ success: true }),
        });
        handleSubmit(mockEvent as Event);
        expect(global.fetch).toHaveBeenCalledWith("/api/submit", expect.objectContaining({
            method: "POST",
            headers: { "Content-Type": "application/json" },
        }));
    });

    it("should log error for invalid form data", () => {
        createMockForm({ name: "", email: "invalid", age: "0", gender: "invalid" });
        handleSubmit(mockEvent as Event);
        expect(console.error).toHaveBeenCalledWith("Validation failed. Please check your input.");
    });

    it("should log success on successful submission", async () => {
        createMockForm({ name: "Jane", email: "jane@example.com", age: "25", gender: "female" });
        global.fetch = jest.fn().mockResolvedValue({
            json: () => Promise.resolve({ success: true }),
        });
        handleSubmit(mockEvent as Event);
        await new Promise(process.nextTick);
        expect(console.log).toHaveBeenCalledWith("Form submitted successfully:", expect.any(Object));
    });

    it("should log error on failed submission", async () => {
        createMockForm({ name: "Jane", email: "jane@example.com", age: "25", gender: "female" });
        global.fetch = jest.fn().mockResolvedValue({
            json: () => Promise.resolve({ success: false, error: "Server error" }),
        });
        handleSubmit(mockEvent as Event);
        await new Promise(process.nextTick);
        expect(console.error).toHaveBeenCalledWith("Submission failed:", "Server error");
    });

    it("should log network error on fetch failure", async () => {
        createMockForm({ name: "Jane", email: "jane@example.com", age: "25", gender: "female" });
        global.fetch = jest.fn().mockRejectedValue(new Error("Network failure"));
        handleSubmit(mockEvent as Event);
        await new Promise(process.nextTick);
        expect(console.error).toHaveBeenCalledWith("Network error:", expect.any(Error));
    });
});
