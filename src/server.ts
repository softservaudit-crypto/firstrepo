import express, { Request, Response } from "express";
import path from "path";
import fs from "fs";

interface PersonalData {
    name: string;
    email: string;
    age: number;
    gender: string;
}

interface Submission {
    data: PersonalData;
    submittedAt: string;
}

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, "..", "data", "submissions.json");

app.use(express.json());
app.use(express.static(path.join(__dirname, "..", "public")));

function readSubmissions(): Submission[] {
    if (!fs.existsSync(DATA_FILE)) {
        return [];
    }
    const raw = fs.readFileSync(DATA_FILE, "utf-8");
    return JSON.parse(raw);
}

function writeSubmissions(submissions: Submission[]): void {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(submissions, null, 2), "utf-8");
}

function validateSubmission(body: unknown): body is PersonalData {
    if (typeof body !== "object" || body === null) {
        return false;
    }
    const obj = body as Record<string, unknown>;
    if (typeof obj.name !== "string" || obj.name.trim().length === 0) {
        return false;
    }
    if (typeof obj.email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(obj.email)) {
        return false;
    }
    if (typeof obj.age !== "number" || obj.age < 1 || obj.age > 150) {
        return false;
    }
    if (typeof obj.gender !== "string" || !["male", "female", "other"].includes(obj.gender)) {
        return false;
    }
    return true;
}

app.post("/api/submit", (req: Request, res: Response) => {
    if (!validateSubmission(req.body)) {
        res.status(400).json({ success: false, error: "Invalid form data." });
        return;
    }

    const submission: Submission = {
        data: {
            name: req.body.name.trim(),
            email: req.body.email.trim(),
            age: req.body.age,
            gender: req.body.gender,
        },
        submittedAt: new Date().toISOString(),
    };

    const submissions = readSubmissions();
    submissions.push(submission);
    writeSubmissions(submissions);

    res.json({ success: true });
});

app.get("/api/submissions", (_req: Request, res: Response) => {
    const submissions = readSubmissions();
    res.json(submissions);
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
