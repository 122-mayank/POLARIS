
import express from "express";
import multer from "multer";
import mongoose from "mongoose";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { fileURLToPath } from "node:url";
import { mkdirSync } from "node:fs";
import { PDFParse } from "pdf-parse";
import {
    open,
    unlink,
    readFile
} from "node:fs/promises";

import ResearchPaper from "../models/ResearchPaper.js";

const router = express.Router();

const currentFile = fileURLToPath(import.meta.url);
const currentDirectory = path.dirname(currentFile);

const uploadDirectory = path.resolve(
    currentDirectory,
    "../uploads/research"
);

mkdirSync(uploadDirectory, { recursive: true });

/* ---------- PDF UPLOAD CONFIGURATION ---------- */

const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, uploadDirectory);
    },

    filename: (req, file, callback) => {
        callback(null, `${randomUUID()}.pdf`);
    }
});

const upload = multer({
    storage,

    limits: {
        fileSize: 15 * 1024 * 1024,
        files: 1,
        fields: 8
    },

    fileFilter: (req, file, callback) => {
        if (path.extname(file.originalname).toLowerCase() !== ".pdf") {
            return callback(new Error("Please upload a PDF file."));
        }

        callback(null, true);
    }
});

/* ---------- HELPER FUNCTIONS ---------- */

async function deleteUploadedFile(filePath) {
    if (!filePath) return;

    try {
        await unlink(filePath);
    } catch {
        // Ignore cleanup errors.
    }
}

function parseList(value, maxItems) {
    if (typeof value !== "string") return [];

    return value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
        .slice(0, maxItems);
}

function safePaperResponse(paper, req) {
    const result =
        typeof paper.toObject === "function"
            ? paper.toObject()
            : { ...paper };

    delete result.storedFileName;
    delete result.extractedText;
    delete result.pages;
    delete result.chunks;

    // Generate the complete PDF URL
    result.pdfUrl =
        `${req.protocol}://${req.get("host")}` +
        `/api/research/${result._id}/pdf`;

    return result;
}
function escapeRegex(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function uploadPdf(req, res, next) {
    upload.single("pdf")(req, res, (error) => {
        if (error) {
            const status =
                error.code === "LIMIT_FILE_SIZE" ? 413 : 400;

            return res.status(status).json({
                message: error.message || "PDF upload failed."
            });
        }

        next();
    });
}

async function hasPdfHeader(filePath) {
    const fileHandle = await open(filePath, "r");

    try {
        const header = Buffer.alloc(5);

        const { bytesRead } = await fileHandle.read(
            header,
            0,
            5,
            0
        );

        return (
            bytesRead === 5 &&
            header.toString("ascii") === "%PDF-"
        );
    } finally {
        await fileHandle.close();
    }
}


function splitIntoChunks(pages, chunkSize = 1200, overlap = 150) {
    const chunks = [];

    for (const page of pages || []) {
        const text = String(page.text || "")
            .replace(/\s+/g, " ")
            .trim();

        if (!text) continue;

        let start = 0;

        while (start < text.length) {
            let end = Math.min(
                start + chunkSize,
                text.length
            );

            // Prefer breaking at a word boundary.
            if (end < text.length) {
                const boundary = text.lastIndexOf(" ", end);

                if (boundary > start + chunkSize * 0.6) {
                    end = boundary;
                }
            }

            const chunkText = text.slice(start, end).trim();

            if (chunkText) {
                chunks.push({
                    chunkIndex: chunks.length,
                    pageNumber: Number(page.pageNumber),
                    text: chunkText
                });
            }

            if (end >= text.length) break;

            start = Math.max(end - overlap, start + 1);
        }
    }

    return chunks;
}


/* ---------- POST: ADD RESEARCH PAPER ---------- */

router.post("/", uploadPdf, async (req, res) => {
    const file = req.file;

    if (!file) {
        return res.status(400).json({
            message: "Please select a PDF file."
        });
    }

    try {
        // Checking the PDF header helps reject renamed non-PDF files.
        if (!(await hasPdfHeader(file.path))) {
            await deleteUploadedFile(file.path);

            return res.status(400).json({
                message: "The uploaded file is not a valid PDF."
            });
        }

        const title =
            typeof req.body.title === "string"
                ? req.body.title.trim()
                : "";

        if (!title) {
            await deleteUploadedFile(file.path);

            return res.status(400).json({
                message: "Paper title is required."
            });
        }

        if (title.length > 250) {
            await deleteUploadedFile(file.path);

            return res.status(400).json({
                message: "Title cannot exceed 250 characters."
            });
        }

        const yearInput = String(
            req.body.publicationYear ?? ""
        ).trim();

        let publicationYear;

        if (yearInput) {
            publicationYear = Number(yearInput);

            if (
                !Number.isInteger(publicationYear) ||
                publicationYear < 1900 ||
                publicationYear > new Date().getFullYear() + 1
            ) {
                await deleteUploadedFile(file.path);

                return res.status(400).json({
                    message: "Enter a valid publication year."
                });
            }
        }

        const abstract = String(req.body.abstract ?? "").trim();

        if (abstract.length > 10000) {
            await deleteUploadedFile(file.path);

            return res.status(400).json({
                message: "Abstract cannot exceed 10,000 characters."
            });
        }

        const paper = await ResearchPaper.create({
            title,

            authors: parseList(req.body.authors, 20),

            abstract,

            publicationYear,

            keywords: parseList(req.body.keywords, 30),

            originalFileName: path
                .basename(file.originalname)
                .replace(/[\r\n"]/g, "_")
                .slice(0, 200),

            storedFileName: file.filename,

            fileSize: file.size,

            processingStatus: "uploaded"
        });

        return res.status(201).json({
            message: "Research paper uploaded successfully.",
            paper: safePaperResponse(paper,req)
        });
    } catch (error) {
        await deleteUploadedFile(file.path);

        console.error("Research upload error:", error);

        if (error.name === "ValidationError") {
            return res.status(400).json({
                message: error.message
            });
        }

        return res.status(500).json({
            message: "Unable to save research paper."
        });
    }
});

/* ---------- GET: LIST OR SEARCH PAPERS ---------- */

router.get("/", async (req, res) => {
    try {
        const query =
            typeof req.query.q === "string"
                ? req.query.q.trim().slice(0, 100)
                : "";

        const filter = query
            ? {
                $or: [
                    {
                        title: {
                            $regex: escapeRegex(query),
                            $options: "i"
                        }
                    },
                    {
                        authors: {
                            $regex: escapeRegex(query),
                            $options: "i"
                        }
                    },
                    {
                        abstract: {
                            $regex: escapeRegex(query),
                            $options: "i"
                        }
                    },
                    {
                        keywords: {
                            $regex: escapeRegex(query),
                            $options: "i"
                        }
                    }
                ]
            }
            : {};

        const papers = await ResearchPaper.find(filter)
            .select("-storedFileName")
            .sort({ createdAt: -1 })
            .limit(50)
            .lean();

        return res.status(200).json({
            count: papers.length,
            papers: papers.map((paper) =>
    safePaperResponse(paper, req)
)
        });
    } catch (error) {
        console.error("Research listing error:", error);

        return res.status(500).json({
            message: "Unable to load research papers."
        });
    }
});

/* ---------- GET: OPEN ORIGINAL PDF ---------- */


/* ---------- POST: EXTRACT TEXT FROM PDF ---------- */

router.post("/:id/extract", async (req, res) => {
    let paper = null;
    let parser = null;

    try {
        // Validate the research paper ID
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({
                message: "Invalid research paper ID."
            });
        }

        // Find the existing paper
        paper = await ResearchPaper.findById(req.params.id);

        if (!paper) {
            return res.status(404).json({
                message: "Research paper not found."
            });
        }

        // Locate the already-uploaded PDF
        const filePath = path.join(
            uploadDirectory,
            paper.storedFileName
        );

        const pdfBuffer = await readFile(filePath);

        // Mark the paper as processing
        paper.processingStatus = "processing";
        await paper.save();

        // Extract PDF text
        parser = new PDFParse({
            data: pdfBuffer
        });

        const result = await parser.getText();

        const pages = (result.pages || []).map((page, index) => ({
            pageNumber: Number(page.num) || index + 1,
            text: String(page.text || "").trim()
        }));

        const extractedText = pages
            .map(
                (page) =>
                    `--- Page ${page.pageNumber} ---\n${page.text}`
            )
            .join("\n\n");

        const totalPages = pages.length || Number(result.total) || 0;

        // Save extracted content to MongoDB
        paper.pages = pages;
        paper.totalPages = totalPages;
        paper.extractedText = extractedText;

        if (!extractedText.trim()) {
            paper.processingStatus = "failed";
            paper.processedAt = null;

            await paper.save();

            return res.status(422).json({
                message:
                    "No selectable text found. OCR may be needed for this PDF.",
                totalPages
            });
        }

        paper.processingStatus = "processed";
        paper.processedAt = new Date();

        await paper.save();

        // Return a preview instead of the entire document
        return res.status(200).json({
            message: "PDF text extracted successfully.",
            paperId: paper._id,
            title: paper.title,
            processingStatus: paper.processingStatus,
            totalPages,
            extractedCharacterCount: extractedText.length,

            pages: pages.map((page) => ({
                pageNumber: page.pageNumber,
                characterCount: page.text.length,
                preview: page.text.slice(0, 180)
            }))
        });

    } catch (error) {
        console.error("PDF extraction error:", error);

        if (paper) {
            paper.processingStatus = "failed";

            try {
                await paper.save();
            } catch (saveError) {
                console.error("Could not update paper status:", saveError);
            }
        }

        if (error.code === "ENOENT") {
            return res.status(404).json({
                message: "The uploaded PDF file could not be found."
            });
        }

        return res.status(500).json({
            message: "Unable to extract text from the PDF."
        });

    } finally {
        if (parser) {
            try {
                await parser.destroy();
            } catch (cleanupError) {
                console.error("PDF parser cleanup error:", cleanupError);
            }
        }
    }
});


router.get("/:id/pdf", async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({
                message: "Invalid research paper ID."
            });
        }

        const paper = await ResearchPaper.findById(req.params.id);

        if (!paper) {
            return res.status(404).json({
                message: "Research paper not found."
            });
        }

        // storedFileName is generated by our server.
        const filePath = path.join(
            uploadDirectory,
            paper.storedFileName
        );

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("X-Content-Type-Options", "nosniff");

        return res.sendFile(filePath, (error) => {
            if (error && !res.headersSent) {
                console.error("PDF access error:", error);

                res.status(error.statusCode === 404 ? 404 : 500).json({
                    message: "Unable to open the original PDF."
                });
            }
        });
    } catch (error) {
        console.error("PDF retrieval error:", error);

        return res.status(500).json({
            message: "Unable to retrieve the PDF."
        });
    }
});


/* ---------- POST: CHUNK EXTRACTED RESEARCH TEXT ---------- */

router.post("/:id/chunk", async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({
                message: "Invalid research paper ID."
            });
        }

        const paper = await ResearchPaper.findById(
            req.params.id
        );

        if (!paper) {
            return res.status(404).json({
                message: "Research paper not found."
            });
        }

        // PDF extraction must finish first.
        if (
            paper.processingStatus !== "processed" ||
            !paper.pages?.length
        ) {
            return res.status(409).json({
                message:
                    "Extract the PDF text successfully before chunking."
            });
        }

        const chunks = splitIntoChunks(paper.pages);

        if (chunks.length === 0) {
            return res.status(422).json({
                message: "No text was available to chunk."
            });
        }

        // Save chunks in the existing research document.
        paper.chunks = chunks;
        paper.chunkCount = chunks.length;

        await paper.save();

        return res.status(200).json({
            message: "Research text chunked successfully.",
            paperId: paper._id,
            title: paper.title,
            totalPages: paper.totalPages,
            chunkCount: chunks.length,

            preview: chunks.slice(0, 5).map((chunk) => ({
                chunkIndex: chunk.chunkIndex,
                pageNumber: chunk.pageNumber,
                characterCount: chunk.text.length,
                text: chunk.text.slice(0, 180)
            }))
        });
    } catch (error) {
        console.error("Research chunking error:", error);

        return res.status(500).json({
            message: "Unable to chunk research text."
        });
    }
});


export default router;
