
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";

import Expeditions from "./pages/Expeditions";
import AddExpedition from "./pages/AddExpedition";
import ExpeditionDetails from "./pages/ExpeditionDetails";
import ResearchLibrary from "./pages/ResearchLibrary.jsx";
import ResearchAssistant from "./pages/ResearchAssistant";

import "./App.css";

function App() {
    return (
        <BrowserRouter>
            {/* NAVBAR */}
            <nav className="navbar">
                <Link to="/" className="logo">
                    POLARIS<span>.</span>
                </Link>

                <div className="nav-links">
                    <Link to="/">
                        Home
                    </Link>

                    <Link to="/expeditions">
                        Expeditions
                    </Link>

                    <Link to="/add-expedition">
                        Add Expedition
                    </Link>

                    {/* NEW: Research Library navigation */}
                    <Link to="/research">
                        Research Library
                    </Link>
                    <Link to="/research-assistant">
                        AI Assistant
                    </Link>
                </div>
            </nav>

            {/* ROUTES */}
            <Routes>
                <Route
                    path="/"
                    element={
                        <div className="home">
                            <div className="hero">
                                <h1>
                                    POLARIS
                                    <span> | </span>
                                    Polar Research Intelligence
                                </h1>

                                <p>
                                    An integrated platform for discovering,
                                    managing and sharing India's polar
                                    research, expeditions, scientific
                                    knowledge and media resources.
                                </p>

                                <div className="hero-buttons">
                                    <Link
                                        to="/expeditions"
                                        className="primary-btn"
                                    >
                                        Explore Expeditions
                                    </Link>

                                    <Link
                                        to="/add-expedition"
                                        className="secondary-btn"
                                    >
                                        Add Expedition
                                    </Link>

                                    {/* NEW: Styled Research Library button */}
                                    <Link
                                        to="/research"
                                        className="secondary-btn"
                                    >
                                        Research Library
                                    </Link>
                                </div>
                            </div>
                        </div>
                    }
                />

                <Route
                    path="/expeditions"
                    element={<Expeditions />}
                />

                <Route
                    path="/add-expedition"
                    element={<AddExpedition />}
                />

                <Route
                    path="/expeditions/:id"
                    element={<ExpeditionDetails />}
                />

                {/* Research Library page */}
                <Route
                    path="/research"
                    element={<ResearchLibrary />}
                />

                <Route
                   path="/research-assistant"
                   element={<ResearchAssistant />}
                />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
