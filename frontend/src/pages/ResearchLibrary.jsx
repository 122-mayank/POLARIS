
import { useCallback, useEffect, useState } from "react";

const API_URL = (
    import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");

const RESEARCH_API = `${API_URL}/api/research`;

export default function ResearchLibrary() {
    const [papers, setPapers] = useState([]);
    const [query, setQuery] = useState("");
    const [title, setTitle] = useState("");
    const [authors, setAuthors] = useState("");
    const [year, setYear] = useState("");
    const [abstract, setAbstract] = useState("");
    const [keywords, setKeywords] = useState("");
    const [pdf, setPdf] = useState(null);

    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [extractingId, setExtractingId] = useState(null);

    const [extractionResults, setExtractionResults] = useState({});

  
const loadPapers = useCallback(async (search = "") => {
    setLoading(true);
    setError("");

    try {
        const url = search.trim()
            ? `${RESEARCH_API}?q=${encodeURIComponent(search.trim())}`
            : RESEARCH_API;

        const response = await fetch(url);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.message || "Unable to load papers."
            );
        }

        setPapers(data.papers || []);
    } catch (err) {
        setError(
            err.message || "Could not connect to the backend."
        );
    } finally {
        setLoading(false);
    }
}, []);

useEffect(() => {
    loadPapers();
}, [loadPapers]);


    async function handleUpload(event) {
        event.preventDefault();

        if (!pdf) {
            setError("Please select a PDF file.");
            return;
        }

        const formData = new FormData();

        formData.append("title", title);
        formData.append("authors", authors);
        formData.append("publicationYear", year);
        formData.append("abstract", abstract);
        formData.append("keywords", keywords);
        formData.append("pdf", pdf);

        setUploading(true);
        setError("");
        setMessage("");

        try {
            const response = await fetch(RESEARCH_API, {
                method: "POST",
                body: formData
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Upload failed.");
            }

            setMessage("Research paper uploaded successfully!");

            setTitle("");
            setAuthors("");
            setYear("");
            setAbstract("");
            setKeywords("");
            setPdf(null);

            event.target.reset();

            await loadPapers(query);
        } catch (err) {
            setError(err.message || "Unable to upload the PDF.");
        } finally {
            setUploading(false);
        }
    }

    function handleSearch(event) {
        event.preventDefault();
        loadPapers(query);
    }

    
async function handleExtract(paperId) {
    setExtractingId(paperId);
    setError("");
    setMessage("");

    try {
        const response = await fetch(
            `${RESEARCH_API}/${paperId}/extract`,
            {
                method: "POST"
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.message || "PDF text extraction failed."
            );
        }

        setExtractionResults((previous) => ({
            ...previous,
            [paperId]: data
        }));

        setMessage(
            `Text extracted successfully from ${data.totalPages} pages.`
        );

        // Refresh the existing research collection.
        await loadPapers(query);

    } catch (err) {
        // Refresh the processing status even if extraction fails.
        await loadPapers(query);

        setError(
            err.message || "Unable to extract PDF text."
        );

    } finally {
        setExtractingId(null);
    }
}


    return (
        <main className="page-container research-page">
            <div className="section-label">
                POLARIS KNOWLEDGE HUB
            </div>

            <h1 className="page-title">
                Polar Research Library
            </h1>

            <p className="page-description">
                Upload, discover, and explore scientific papers
                about Arctic and Antarctic research.
            </p>

            {error && (
                <div className="error" role="alert">
                    {error}
                </div>
            )}

            {message && (
                <p className="research-notice" role="status">
                    {message}
                </p>
            )}

            <div className="research-layout">
                {/* Upload form */}
                <section className="form-card research-form-card">
                    <h2>Add Research Paper</h2>

                    <form onSubmit={handleUpload}>
                        <div className="form-group">
                            <label htmlFor="paper-title">
                                Paper Title *
                            </label>

                            <input
                                id="paper-title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                maxLength={250}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="paper-authors">
                                Authors
                            </label>

                            <input
                                id="paper-authors"
                                value={authors}
                                onChange={(e) => setAuthors(e.target.value)}
                                placeholder="Author One, Author Two"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="paper-year">
                                Publication Year
                            </label>

                            <input
                                id="paper-year"
                                type="number"
                                min="1900"
                                max={new Date().getFullYear() + 1}
                                value={year}
                                onChange={(e) => setYear(e.target.value)}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="paper-keywords">
                                Keywords
                            </label>

                            <input
                                id="paper-keywords"
                                value={keywords}
                                onChange={(e) => setKeywords(e.target.value)}
                                placeholder="Antarctica, ice, climate"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="paper-abstract">
                                Abstract
                            </label>

                            <textarea
                                id="paper-abstract"
                                value={abstract}
                                maxLength={10000}
                                onChange={(e) => setAbstract(e.target.value)}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="paper-pdf">
                                Research PDF *
                            </label>

                            <input
                                id="paper-pdf"
                                type="file"
                                accept=".pdf,application/pdf"
                                onChange={(e) =>
                                    setPdf(e.target.files?.[0] || null)
                                }
                                required
                            />
                        </div>

                        <button
                            className="submit-btn"
                            type="submit"
                            disabled={uploading}
                        >
                            {uploading ? "Uploading..." : "Upload Paper"}
                        </button>
                    </form>
                </section>

                {/* Research collection */}
                <section className="research-results">
                    <h2 className="page-title">
                        Research Collection
                    </h2>

                    <form className="search-bar" onSubmit={handleSearch}>
                        <input
                            type="search"
                            placeholder="Search papers or keywords..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />

                        <button
                            className="primary-btn"
                            type="submit"
                            disabled={loading}
                        >
                            Search
                        </button>
                    </form>

                    {loading ? (
                        <p className="loading">Loading papers...</p>
                    ) : papers.length === 0 ? (
                        <div className="empty-state">
                            <h2>No research papers found</h2>
                            <p>Upload your first paper or try another search.</p>
                        </div>
                    ) : (
                        <div className="expedition-grid research-grid">
                            {papers.map((paper) => (
                                <article
                                    className="expedition-card"
                                    key={paper._id}
                                >
                                    <span className="research-type">
                                        PDF · RESEARCH PAPER
                                    </span>

                                    <h2>{paper.title}</h2>

                                    <p>
                                        <strong>Authors:</strong>{" "}
                                        {paper.authors?.length
                                            ? paper.authors.join(", ")
                                            : "Not specified"}
                                    </p>

                                    <p>
                                        <strong>Year:</strong>{" "}
                                        {paper.publicationYear || "Not specified"}
                                    </p>

                                    {paper.abstract && (
                                        <p>{paper.abstract}</p>
                                    )}

                                    {paper.keywords?.length > 0 && (
                                        <p>
                                            <strong>Keywords:</strong>{" "}
                                            {paper.keywords.join(", ")}
                                        </p>
                                    )}

                                    <span className="status">
                                        {paper.processingStatus}
                                    </span>

                                    
<button
    type="button"
    className="secondary-btn research-extract-btn"
    onClick={() => handleExtract(paper._id)}
    disabled={extractingId === paper._id}
>
    {extractingId === paper._id
        ? "Extracting Text..."
        : paper.processingStatus === "processed"
            ? "Extract Text Again"
            : "Extract PDF Text"}
</button>

{extractionResults[paper._id] && (
    <div className="research-extraction-result">
        <h3>
            Extraction Preview
        </h3>

        <p>
            Pages processed:{" "}
            {extractionResults[paper._id].totalPages}
        </p>

        {extractionResults[paper._id].pages
            ?.slice(0, 5)
            .map((page) => (
                <div
                    className="research-page-preview"
                    key={page.pageNumber}
                >
                    <strong>
                        Page {page.pageNumber}
                    </strong>

                    <p>
                        {page.preview || "No selectable text on this page."}
                    </p>

                    <small>
                        {page.characterCount} characters
                    </small>
                </div>
            ))}

        {extractionResults[paper._id].totalPages > 5 && (
            <p className="research-help">
                Showing the first 5 pages as a preview.
            </p>
        )}
    </div>
)}


                                    <a
                                        className="primary-btn research-open-link"
                                        href={paper.pdfUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        Open Original PDF ↗
                                    </a>
                                </article>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </main>
    );
}
