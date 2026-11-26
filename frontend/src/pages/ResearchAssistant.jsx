
import { useState } from "react";
import "./ResearchAssistant.css";

const API_URL = (
    import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");

const API_RES = `${API_URL}/api/ai-research`;

const suggestedQuestions = [
  "What are the main findings of the available research papers?",
  "Summarize the research on Antarctic climate.",
  "What research gaps are mentioned in these papers?",
];

function ResearchAssistant() {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const askQuestion = async (questionText = question) => {
    const trimmedQuestion = questionText.trim();

    if (!trimmedQuestion || loading) return;

    setQuestion("");
    setError("");

    setMessages((previous) => [
      ...previous,
      {
        role: "user",
        content: trimmedQuestion,
      },
    ]);

    setLoading(true);

    try {
      const response = await fetch(API_RES, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: trimmedQuestion,
        }),
      });

      
const contentType = response.headers.get("content-type") || "";

if (!contentType.includes("application/json")) {
  const responseText = await response.text();

  console.error(
    "Expected JSON but received:",
    responseText.slice(0, 500)
  );

  throw new Error(
    `The API returned HTML or another non-JSON response (HTTP ${response.status}). Check the backend URL and route registration.`
  );
}

const data = await response.json();

if (!response.ok) {
  throw new Error(
    data.message || `Request failed with HTTP ${response.status}`
  );
}


      if (!response.ok) {
        throw new Error(
          data.message || "Unable to get an answer."
        );
      }

      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          content: data.answer,
          sources: data.sources || [],
        },
      ]);
    } catch (err) {
      setError(
        err.message ||
          "Unable to connect to the Research Assistant."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    askQuestion();
  };

  const clearChat = () => {
    if (loading) return;

    setMessages([]);
    setError("");
    setQuestion("");
  };

  return (
    <div className="research-assistant-page">
      <div className="assistant-container">
        <header className="assistant-header">
          <div className="assistant-heading">
            <div className="assistant-icon">✦</div>

            <div>
              <p className="assistant-eyebrow">
                POLARIS INTELLIGENCE
              </p>

              <h1>Research Assistant</h1>

              <p className="assistant-subtitle">
                Explore polar research with your local AI assistant.
              </p>
            </div>
          </div>

          <div className="ollama-status">
            <span className="status-dot" />
            Local AI · Ollama
          </div>
        </header>

        <main className="assistant-chat">
          {messages.length === 0 ? (
            <section className="assistant-welcome">
              <div className="welcome-symbol">❄</div>

              <h2>What would you like to discover?</h2>

              <p>
                Ask questions about your uploaded research papers.
                Answers are generated using the research content
                available in POLARIS.
              </p>

              <div className="suggested-questions">
                {suggestedQuestions.map((item) => (
                  <button
                    key={item}
                    type="button"
                    className="suggestion-card"
                    onClick={() => askQuestion(item)}
                    disabled={loading}
                  >
                    <span>{item}</span>
                    <span className="suggestion-arrow">↗</span>
                  </button>
                ))}
              </div>
            </section>
          ) : (
            <section className="message-list">
              {messages.map((message, index) => (
                <article
                  key={`${message.role}-${index}`}
                  className={`chat-message ${message.role}`}
                >
                  <div className="message-avatar">
                    {message.role === "user" ? "You" : "✦"}
                  </div>

                  <div className="message-body">
                    <p className="message-role">
                      {message.role === "user"
                        ? "You"
                        : "POLARIS Assistant"}
                    </p>

                    <div className="message-content">
                      {message.content}
                    </div>

                    {message.sources?.length > 0 && (
                      <div className="source-list">
                        <h3>Research sources</h3>

                        {message.sources.map((source, sourceIndex) => (
                          <div
                            className="source-item"
                            key={`${source.title}-${sourceIndex}`}
                          >
                            <span className="source-number">
                              {sourceIndex + 1}
                            </span>

                            <div>
                              <p className="source-title">
                                {source.title}
                              </p>

                              <p className="source-meta">
                                {Array.isArray(source.authors)
                                  ? source.authors.join(", ")
                                  : source.authors || "Unknown authors"}
                                {" · "}
                                {source.year || "Year unknown"}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </article>
              ))}

              {loading && (
                <div className="chat-message assistant">
                  <div className="message-avatar">✦</div>

                  <div className="message-body">
                    <p className="message-role">
                      POLARIS Assistant
                    </p>

                    <div className="typing-indicator">
                      <span />
                      <span />
                      <span />
                      <p>Analyzing research papers...</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="chat-bottom-space" />
            </section>
          )}

          {error && (
            <div className="assistant-error" role="alert">
              <strong>Something went wrong</strong>
              <p>{error}</p>
              <p>
                Check that the backend is running and Ollama
                is available.
              </p>
            </div>
          )}
        </main>

        <footer className="assistant-footer">
          <form
            className="chat-input-form"
            onSubmit={handleSubmit}
          >
            <textarea
              value={question}
              onChange={(event) =>
                setQuestion(event.target.value)
              }
              onKeyDown={(event) => {
                if (
                  event.key === "Enter" &&
                  !event.shiftKey &&
                  !event.nativeEvent.isComposing
                ) {
                  event.preventDefault();
                  handleSubmit(event);
                }
              }}
              placeholder="Ask about polar research..."
              rows={1}
              aria-label="Research question"
              disabled={loading}
            />

            <button
              type="submit"
              className="send-button"
              disabled={loading || !question.trim()}
              aria-label="Send question"
            >
              {loading ? "..." : "↑"}
            </button>
          </form>

          <div className="footer-info">
            <span>
              Answers are based on the research content retrieved
              by your backend.
            </span>

            {messages.length > 0 && (
              <button
                type="button"
                className="clear-chat-button"
                onClick={clearChat}
                disabled={loading}
              >
                Clear chat
              </button>
            )}
          </div>
        </footer>
      </div>
    </div>
  );
}

export default ResearchAssistant;
