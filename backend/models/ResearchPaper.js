
import mongoose from "mongoose";

const researchPaperSchema = new mongoose.Schema(
    {
        
chunks: [
    {
        _id: false,

        chunkIndex: {
            type: Number,
            required: true
        },

        pageNumber: {
            type: Number,
            required: true
        },

        text: {
            type: String,
            required: true
        }
    }
],

chunkCount: {
    type: Number,
    default: 0
}, 


        // Extracted text from the complete PDF
        extractedText: {
            type: String,
            default: ""
        },

        // Text and page number for each PDF page
        pages: [
            {
                _id: false,

                pageNumber: {
                    type: Number,
                    required: true
                },

                text: {
                    type: String,
                    default: ""
                }
            }
        ],

        // Total number of PDF pages
        totalPages: {
            type: Number,
            default: 0
        },

        // When PDF text extraction completed
        processedAt: {
            type: Date,
            default: null
        },

        title: {
            type: String,
            required: true,
            trim: true,
            maxlength: 250
        },

        authors: {
            type: [String],
            default: []
        },

        abstract: {
            type: String,
            default: "",
            maxlength: 10000
        },

        publicationYear: {
            type: Number,
            min: 1900,
            max: new Date().getFullYear() + 1
        },

        keywords: {
            type: [String],
            default: []
        },

        originalFileName: {
            type: String,
            required: true
        },

        storedFileName: {
            type: String,
            required: true
        },

        fileSize: {
            type: Number,
            required: true
        },

        processingStatus: {
            type: String,
            enum: ["uploaded", "processing", "processed", "failed"],
            default: "uploaded"
        }
    },
    {
        timestamps: true
    }
);

const ResearchPaper =
    mongoose.models.ResearchPaper ||
    mongoose.model("ResearchPaper", researchPaperSchema);

export default ResearchPaper;
