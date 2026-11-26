function ExpeditionCard({ expedition }) {
    return (
        <div>
            <h2>{expedition.name}</h2>

            <p>Year: {expedition.year}</p>

            <p>Region: {expedition.region}</p>

            <p>Status: {expedition.status}</p>

            <p>{expedition.description}</p>

            <hr />
        </div>
    );
}

export default ExpeditionCard;