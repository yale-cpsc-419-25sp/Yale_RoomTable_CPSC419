import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

function Summary() {
    const { suite_id } = useParams();
    const navigate = useNavigate();
    const [suite, setSuite] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [formData, setFormData] = useState({
        accessibility: "",
        space: "",
        rating: "",
        review: "",
    });

    useEffect(() => {
        fetch(`http://localhost:8000/api/summary/${suite_id}`, {
            credentials: "include"
        })
            .then(res => res.json())
            .then(data => {
                setSuite(data.suite);
                setReviews(data.reviews);
            });
    }, [suite_id]);

    const handleSubmitReview = async (e) => {
        e.preventDefault();
        await fetch(`http://localhost:8000/api/review/${suite_id}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(formData)
        });
        window.location.reload();
    };

    const handleSaveSuite = async () => {
        await fetch(`http://localhost:8000/api/save_suite/${suite_id}`, {
            method: "POST",
            credentials: "include"
        });
        navigate("/");
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    if (!suite) return <div>Loading...</div>;

    return (
        <div>
            <h1>Suite Summary</h1>
            <h2>Name</h2>
            <p>{suite.name}</p>
            <h2>Residential College</h2>
            <p>{suite.resco}</p>
            <h2>Entryway</h2>
            <p>{suite.entryway}</p>
            <h2>Capacity</h2>
            <p>{suite.capacity}</p>
            <h2>Number of Singles</h2>
            <p>{suite.singles}</p>
            <h2>Number of Doubles</h2>
            <p>{suite.doubles}</p>
            <h2>Class Year</h2>
            <p>{suite.year}</p>

            <h1>Reviews</h1>
            {reviews.length ? reviews.map((r, i) => (
                <div key={i}>
                    <h2>Overall Rating</h2>
                    <p>{r.overall_rating}</p>
                    <h2>Accessibility Rating</h2>
                    <p>{r.accessibility_rating}</p>
                    <h2>Space Rating</h2>
                    <p>{r.space_rating}</p>
                    <h2>Text</h2>
                    <p>{r.review_text || "N/A"}</p>
                </div>
            )) : <p>No reviews.</p>}

            <form onSubmit={handleSubmitReview}>
                <label>Accessibility:</label>
                <input type="number" name="accessibility" min="1" max="5" required onChange={handleChange} />
                <label>Space:</label>
                <input type="number" name="space" min="1" max="5" required onChange={handleChange} />
                <label>Overall Rating:</label>
                <input type="number" name="rating" min="1" max="5" required onChange={handleChange} />
                <label>Review:</label>
                <textarea name="review" onChange={handleChange}></textarea>
                <button type="submit">Submit Review</button>
            </form>

            <button onClick={handleSaveSuite}>Save Room</button>
            <button onClick={() => navigate("/search")}>Back to Search</button>
        </div>
    );
}

export default Summary;
