import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

function ExpeditionDetails() {

    const { id } = useParams();

    const [expedition, setExpedition] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {

        axios
            .get(`http://localhost:5000/api/expeditions/${id}`)
            .then((response) => {

                setExpedition(response.data.data);

                setLoading(false);

            })
            .catch((error) => {

                console.error(error);

                setError("Unable to fetch expedition details.");

                setLoading(false);

            });

    }, [id]);


    if (loading) {
        return (
            <div className="loading">
                Loading expedition details...
            </div>
        );
    }


    if (error) {
        return (
            <div className="page-container">
                <div className="error">
                    {error}
                </div>
            </div>
        );
    }


    return (

        <div className="page-container">

            <h1 className="page-title">
                {expedition.name}
            </h1>

            <p className="page-description">
                Detailed information about this polar expedition.
            </p>


            <div className="form-card">

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

        </div>

    );
}

export default ExpeditionDetails;