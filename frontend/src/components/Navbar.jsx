import { Link } from "react-router-dom";

function Navbar() {
    return (
        <nav>
            <h2>POLARIS</h2>

            <Link to="/">Home</Link>
            {" | "}
            <Link to="/expeditions">Expeditions</Link>
            {" | "}
            <Link to="/expeditions/add">Add Expedition</Link>
        </nav>
    );
}

export default Navbar;