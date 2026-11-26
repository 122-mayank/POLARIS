import { useEffect, useState } from "react";
import axios from "axios";

const API_URL = (
    import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");

const API_EXP = `${API_URL}/api/expeditions`;

function Expeditions() {

    const [expeditions, setExpeditions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");


    useEffect(() => {

        axios
            .get(API_EXP)
            .then((response) => {

                setExpeditions(response.data.data);

                setLoading(false);

            })
            .catch((error) => {

                console.error(error);

                setError("Unable to fetch expeditions.");

                setLoading(false);

            });

    }, []);


    if (loading) {
        return (
            <div className="loading">
                Loading expeditions...
            </div>
        );
    }


    return (

        <div className="page-container">

            <h1 className="page-title">
                Polar Expeditions
            </h1>

            <p className="page-description">
                Explore scientific expeditions conducted in
                India's polar research program.
            </p>


            {error && (
                <div className="error">
                    {error}
                </div>
            )}


            <div className="expedition-grid">

                {expeditions.map((expedition) => (

                    <div
                        className="expedition-card"
                        key={expedition._id}
                    >

                        <h2>
                            {expedition.name}
                        </h2>

                        <p>
                            <strong>Year:</strong>{" "}
                            {expedition.year}
                        </p>

                        <p>
                            <strong>Region:</strong>{" "}
                            {expedition.region}
                        </p>

                        <p>
                            <strong>Description:</strong>{" "}
                            {expedition.description}
                        </p>

                        <p>
                            <strong>Researchers:</strong>{" "}
                            {expedition.researchers?.join(", ")}
                        </p>

                        <p>
                            <strong>Stations:</strong>{" "}
                            {expedition.stations?.join(", ")}
                        </p>

                        <span className="status">
                            {expedition.status}
                        </span>

                    </div>

                ))}

            </div>

        </div>

    );
}

export default Expeditions;