
import ResearchPaper from "../models/ResearchPaper.js";

const PYTHON_AI_URL =
  process.env.PYTHON_AI_URL || "http://127.0.0.1:8000";

// Extract research text from available MongoDB fields
const getPaperContent = (paper) => {
  const candidates = [
    paper.extractedText,
    paper.pages?.map((page) => page.text).join("\n"),
    paper.chunks?.map((chunk) => chunk.text).join("\n"),
    paper.abstract,
  ];

  return (
    candidates.find(
      (content) =>
        typeof content === "string" && content.trim().length > 0
    ) || ""
  );
};

const askResearchAssistant = async (req, res) => {
  try {
    const { question } = req.body;

    // 1. Validate question
    if (typeof question !== "string" || !question.trim()) {
      return res.status(400).json({
        success: false,
        message: "Please enter a research question.",
      });
    }

    // 2. Retrieve processed research papers
    const papers = await ResearchPaper.find({
      processingStatus: "processed",
    }).limit(20);

    console.log("Processed papers found:", papers.length);

    if (!papers.length) {
      return res.status(404).json({
        success: false,
        message: "No processed research papers found.",
      });
    }

    // 3. Extract actual research content
    const relevantPapers = papers
      .map((paper) => {
        const content = getPaperContent(paper);

        return {
          title: paper.title,
          authors: paper.authors,
          year: paper.publicationYear,
          content: content.trim().slice(0, 7000),
        };
      })
      .filter((paper) => paper.content.length > 0)
      .slice(0, 5);

    console.log(
      "Papers with research content:",
      relevantPapers.length
    );

    if (!relevantPapers.length) {
      return res.status(400).json({
        success: false,
        message:
          "No extracted research text found. Please process your PDF files first.",
      });
    }

    // 4. Build research context
    const researchContext = relevantPapers
      .map(
        (paper, index) => `
SOURCE ${index + 1}
Title: ${paper.title}
Authors: ${
          Array.isArray(paper.authors)
            ? paper.authors.join(", ")
            : paper.authors || "Unknown"
        }
Year: ${paper.year || "Unknown"}

Research content:
${paper.content}
`
      )
      .join("\n");

    console.log(
      "Research context length:",
      researchContext.length
    );

    // 5. Connect to Python AI service
    const pythonResponse = await fetch(
      `${PYTHON_AI_URL}/ask`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: question.trim(),
          research_context: researchContext,
        }),
      }
    );

    // 6. Read Python response
    const responseText = await pythonResponse.text();

    let data;

    try {
      data = JSON.parse(responseText);
    } catch {
      console.error("Invalid Python response:", responseText);

      throw new Error(
        "Python AI service returned an invalid response."
      );
    }

    if (!pythonResponse.ok) {
      throw new Error(
        data.detail || "Python AI service failed."
      );
    }

    // 7. Send answer to React frontend
    return res.status(200).json({
      success: true,
      question: question.trim(),
      answer: data.answer,
      sources: relevantPapers.map((paper) => ({
        title: paper.title,
        authors: paper.authors,
        year: paper.year,
      })),
    });

  } catch (error) {
    console.error(
      "AI Research Assistant error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message || "Unable to answer the research question.",
    });
  }
};

export { askResearchAssistant };
