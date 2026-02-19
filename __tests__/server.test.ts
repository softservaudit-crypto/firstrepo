import request from "supertest";
import fs from "fs";
import path from "path";
import { app } from "../src/app";

const DATA_FILE = path.join(__dirname, "..", "data", "submissions.json");
const DATA_DIR = path.dirname(DATA_FILE);

function cleanup() {
    if (fs.existsSync(DATA_FILE)) {
        fs.unlinkSync(DATA_FILE);
    }
    if (fs.existsSync(DATA_DIR)) {
        fs.rmdirSync(DATA_DIR);
    }
}

beforeEach(() => {
    cleanup();
});

afterAll(() => {
    cleanup();
});

const validPayload = {
    name: "John Doe",
    email: "john@example.com",
    age: 30,
    gender: "male",
};

describe("POST /api/submit", () => {
    it("should accept valid submission", async () => {
        const res = await request(app)
            .post("/api/submit")
            .send(validPayload);
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
    });

    it("should persist submission to file", async () => {
        await request(app).post("/api/submit").send(validPayload);
        expect(fs.existsSync(DATA_FILE)).toBe(true);
        const data = JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
        expect(data).toHaveLength(1);
        expect(data[0].data.name).toBe("John Doe");
    });

    it("should trim name and email", async () => {
        await request(app)
            .post("/api/submit")
            .send({ ...validPayload, name: "  Jane  ", email: "jane@test.com" });
        const data = JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
        expect(data[0].data.name).toBe("Jane");
        expect(data[0].data.email).toBe("jane@test.com");
    });

    it("should add submittedAt timestamp", async () => {
        await request(app).post("/api/submit").send(validPayload);
        const data = JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
        expect(data[0].submittedAt).toBeDefined();
    });

    it("should reject empty body", async () => {
        const res = await request(app)
            .post("/api/submit")
            .send({});
        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
    });

    it("should reject missing name", async () => {
        const res = await request(app)
            .post("/api/submit")
            .send({ ...validPayload, name: "" });
        expect(res.status).toBe(400);
    });

    it("should reject whitespace-only name", async () => {
        const res = await request(app)
            .post("/api/submit")
            .send({ ...validPayload, name: "   " });
        expect(res.status).toBe(400);
    });

    it("should reject invalid email", async () => {
        const res = await request(app)
            .post("/api/submit")
            .send({ ...validPayload, email: "not-email" });
        expect(res.status).toBe(400);
    });

    it("should reject age below 1", async () => {
        const res = await request(app)
            .post("/api/submit")
            .send({ ...validPayload, age: 0 });
        expect(res.status).toBe(400);
    });

    it("should reject age above 150", async () => {
        const res = await request(app)
            .post("/api/submit")
            .send({ ...validPayload, age: 151 });
        expect(res.status).toBe(400);
    });

    it("should reject non-number age", async () => {
        const res = await request(app)
            .post("/api/submit")
            .send({ ...validPayload, age: "thirty" });
        expect(res.status).toBe(400);
    });

    it("should reject invalid gender", async () => {
        const res = await request(app)
            .post("/api/submit")
            .send({ ...validPayload, gender: "unknown" });
        expect(res.status).toBe(400);
    });

    it("should reject missing gender", async () => {
        const res = await request(app)
            .post("/api/submit")
            .send({ ...validPayload, gender: 123 });
        expect(res.status).toBe(400);
    });

    it("should accumulate multiple submissions", async () => {
        await request(app).post("/api/submit").send(validPayload);
        await request(app)
            .post("/api/submit")
            .send({ ...validPayload, name: "Jane Doe", gender: "female" });
        const data = JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
        expect(data).toHaveLength(2);
    });
});

describe("GET /api/submissions", () => {
    it("should return empty array when no submissions exist", async () => {
        const res = await request(app).get("/api/submissions");
        expect(res.status).toBe(200);
        expect(res.body).toEqual([]);
    });

    it("should return all submissions", async () => {
        await request(app).post("/api/submit").send(validPayload);
        await request(app)
            .post("/api/submit")
            .send({ ...validPayload, name: "Jane", gender: "other" });
        const res = await request(app).get("/api/submissions");
        expect(res.status).toBe(200);
        expect(res.body).toHaveLength(2);
    });
});
