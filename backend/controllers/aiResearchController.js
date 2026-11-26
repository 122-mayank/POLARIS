
import ResearchPaper from "../models/ResearchPaper.js";

const askResearchAssistant = async (req, res) => {
  try {
    const { question } = req.body;

    // 1. Validate the question
    if (typeof question !== "string" || !question.trim()) {
      return res.status(400).json({
        success: false,
        message: "Please enter a research question.",
      });
    }

    // 2. Retrieve processed research papers from MongoDB
    const papers = await ResearchPaper.find({
      processingStatus: "processed",
    }).limit(20);

    if (!papers.length) {
      return res.status(404).json({
        success: false,
        message: "No processed research papers found.",
      });
    }

    // 3. Prepare research content
    const relevantPapers = papers
      .map((paper) => {
        const content =
          paper.extractedText ||
          paper.fullText ||
          paper.text ||
          paper.abstract ||
          "";

        return {
          title: paper.title,
          authors: paper.authors,
          year: paper.year,
          content: String(content).slice(0, 7000),
        };
      })
      .filter((paper) => paper.content.trim().length > 0)
      .slice(0, 5);

    if (!relevantPapers.length) {
      return res.status(400).json({
        success: false,
        message:
          "No extracted research text is available. Extract PDF text first.",
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

    // 5. Send question and research context to Python AI service
    const pythonResponse = await fetch(
      "http://127.0.0.1:8000/ask",
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

    // 6. Read response from Python
    const responseText = await pythonResponse.text();

    let data;

    try {
      data = JSON.parse(responseText);
    } catch {
      console.error(
        "Invalid Python service response:",
        responseText.slice(0, 500)
      );

      throw new Error(
        "Python AI service returned an invalid response."
      );
    }

    if (!pythonResponse.ok) {
      throw new Error(
        data.detail || "Python AI service failed."
      );
    }

    // 7. Return AI answer to React frontend
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
      error.message
    );

    return res.status(500).json({
      success: false,
      message: error.message ||
        "Unable to answer the research question.",
    });
  }
};

export { askResearchAssistant };
