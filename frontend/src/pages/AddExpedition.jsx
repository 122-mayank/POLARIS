import { useState } from "react";
import axios from "axios";

const API_URL = (
    import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");

const API_EXP = `${API_URL}/api/expeditions`;

function AddExpedition() {

    const [formData, setFormData] = useState({
        name: "",
        year: "",
        region: "",
        description: "",
        researchers: "",
        stations: "",
        status: "ongoing"
    });


    const handleChange = (e) => {

        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });

    };


    const handleSubmit = async (e) => {

        e.preventDefault();

        try {

            const expedition = {
                ...formData,

                year: Number(formData.year),

                researchers:
                    formData.researchers
                        .split(",")
                        .map(item => item.trim()),

                stations:
                    formData.stations
                        .split(",")
                        .map(item => item.trim())
            };


            await axios.post(
                API_EXP,
                expedition
            );


            alert("Expedition added successfully!");

            setFormData({
                name: "",
                year: "",
                region: "",
                description: "",
                researchers: "",
                stations: "",
                status: "ongoing"
            });


        } catch (error) {

            console.error(error);

            alert("Failed to add expedition.");

        }

    };


    return (

        <div className="page-container">

            <h1 className="page-title">
                Add Polar Expedition
            </h1>

            <p className="page-description">
                Add a new scientific expedition to the
                POLARIS knowledge repository.
            </p>


            <div className="form-card">

                <form onSubmit={handleSubmit}>

                    <div className="form-group">

                        <label>
                            Expedition Name
                        </label>

                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="e.g. Indian Antarctic Expedition 2025"
                            required
                        />

                    </div>


                    <div className="form-group">

                        <label>
                            Year
                        </label>

                        <input
                            type="number"
                            name="year"
                            value={formData.year}
                            onChange={handleChange}
                            placeholder="2025"
                            required
                        />

                    </div>


                    <div className="form-group">

                        <label>
                            Region
                        </label>

                        <select
                            name="region"
                            value={formData.region}
                            onChange={handleChange}
                            required
                        >

                            <option value="">
                                Select Region
                            </option>

                            <option value="Antarctica">
                                Antarctica
                            </option>

                            <option value="Arctic">
                                Arctic
                            </option>

                            <option value="Southern Ocean">
                                Southern Ocean
                            </option>

                        </select>

                    </div>


                    <div className="form-group">

                        <label>
                            Description
                        </label>

                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Describe the expedition..."
                            required
                        />

                    </div>


                    <div className="form-group">

                        <label>
                            Researchers
                        </label>

                        <input
                            type="text"
                            name="researchers"
                            value={formData.researchers}
                            onChange={handleChange}
                            placeholder="Researcher A, Researcher B"
                        />

                    </div>


                    <div className="form-group">

                        <label>
                            Research Stations
                        </label>

                        <input
                            type="text"
                            name="stations"
                            value={formData.stations}
                            onChange={handleChange}
                            placeholder="Maitri, Bharati"
                        />

                    </div>


                    <div className="form-group">

                        <label>
                            Status
                        </label>

                        <select
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                        >

                            <option value="ongoing">
                                Ongoing
                            </option>

                            <option value="completed">
                                Completed
                            </option>

                            <option value="planned">
                                Planned
                            </option>

                        </select>

                    </div>


                    <button
                        type="submit"
                        className="submit-btn"
                    >
                        Add Expedition
                    </button>

                </form>

            </div>

        </div>

    );
}

export default AddExpedition;