import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

function SummaryPage() {
    const { suite_id } = useParams();
    const navigate = useNavigate();
    const [suite, setSuite] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [formData, setFormData] = useState({
        suite: suite_id,
        accessibility: null,
        space: null,
        rating: null,
        review: "",
        user_id: '',
    });
    const [isSaved, setIsSaved] = useState(false);
  
    useEffect(() => {
        fetch(`http://localhost:8000/api/summary/${suite_id}`, { credentials: "include" })
          .then(res => res.json())
          .then(data => {
            setSuite(data.suite);
            setReviews(data.reviews);
            setFormData(prev => ({ ...prev, user_id: data.id }))
            setIsSaved(data.is_saved);
          });
      }, []);


    const handleSubmitReview = async (e) => {
        e.preventDefault();
        await fetch(`http://localhost:8000/api/reviews`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(formData)
        });
    
        // Re-fetch reviews to show the newly added one
        const res = await fetch(`http://localhost:8000/api/summary/${suite_id}`, { credentials: "include" });
        const data = await res.json();
        setReviews(data.reviews);
    
        // Optionally clear the form:
        setFormData(prev => ({
            ...prev,
            accessibility: "",
            space: "",
            rating: "",
            review: "",
        }));
    };
    

      
    const handleSaveSuite = async () => {
        const method = isSaved ? "DELETE" : "POST"
        // ? `http://localhost:8000/api/unsave/${suite_id}`
        // : `http://localhost:8000/api/summary/${suite_id}`;
        // ? `http://localhost:8000/api/summary/${suite_id}`
        // : `http://localhost:8000/api/unsave/${suite_id}`;
    
        await fetch(`http://localhost:8000/api/summary/${suite_id}`, {
          method: method,
          credentials: "include"
        });
        
        setIsSaved(!isSaved);
    };

    const handleChange = (e) => {
        
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    if (!suite) return;

    // Todo: account for the two floor suite
    let floorPlans = "/floorplans/MY";
    // Check for A Lower and B Lower suites
    if (suite.name.charAt(1) == " "){
        floorPlans += " Basement_2.jpg"
    }
    else {
        floorPlans += "_Floor_" + suite.name.charAt(1) + ".jpg";
    }

    return (
        <div className="p-6 max-w-5xl mx-auto">
            <h1 className="text-3xl font-bold mb-4">Suite Summary</h1>
            <table className="min-w-full border border-gray-300 rounded-mb mb-6 shadow-sm">
                <thead className="bg-[#00356B] text-white">
                <tr>
                    <th className="px-4 py-2 text-left">Name</th>
                    <th className="px-4 py-2 text-left">Residential College</th>
                    <th className="px-4 py-2 text-left">Entryway</th>
                    <th className="px-4 py-2 text-left">Capacity</th>
                    <th className="px-4 py-2 text-left">Singles</th>
                    <th className="px-4 py-2 text-left">Doubles</th>
                    <th className="px-4 py-2 text-left">Class Year</th>
                </tr>
                </thead>
                <tbody>
                <tr className="bg-gray-100">
                    <td className="px-4 py-2">{suite.name}</td>
                    <td className="px-4 py-2">{suite.resco}</td>
                    <td className="px-4 py-2">{suite.entryway}</td>
                    <td className="px-4 py-2">{suite.capacity}</td>
                    <td className="px-4 py-2">{suite.singles}</td>
                    <td className="px-4 py-2">{suite.doubles}</td>
                    <td className="px-4 py-2">{suite.year}</td>
                </tr>
                </tbody>
            </table>

        <img src={floorPlans} alt="Suite Floorplan" className="w-full h-auto mb-6 rounded-md shadow-md" />
        <div className="mb-6">
            <h2 className="text-2xl font-semibold mb-2">Reviews</h2>
                {reviews.length ? (
                    reviews.map((r, i) => (
                        <div
                        key={i}
                        className="border border-gray-300 rounded-md p-4 mb-4 bg-gray-50 shadow-sm"
                        >
                            <p><strong>overall Rating:</strong>{r.overall_rating}</p>
                            <p><strong>Accessibility Rating:</strong>{r.accessibility_rating}</p>
                            <p><strong>Space Rating:</strong>{r.space_rating}</p>
                            <p><strong>Review:</strong>{r.review_text || "N/A"}</p>
                        </div>
                    )) 
                ) : (

                    <p className="text-gray-500">No reviews.</p>
                 )}
        </div>
        <div className="bg-white p-6 rounded-md shadow-md border border-gray-300">
        <h2 className="text-xl font-semibold mb-4">Add a Review</h2>
        <form onSubmit={handleSubmitReview} className="space-y-4">
          <div>
            <label className="block font-medium">Accessibility (1–5)</label>
            <input
              type="number"
              name="accessibility"
              min="1"
              max="5"
              required
              value={formData.accessibility ?? ""}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded-md"
            />
          </div>
          <div>
            <label className="block font-medium">Space (1–5)</label>
            <input
              type="number"
              name="space"
              min="1"
              max="5"
              required
              value={formData.space ?? ""}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded-md"
            />
          </div>
          <div>
            <label className="block font-medium">Overall Rating (1–5)</label>
            <input
              type="number"
              name="rating"
              min="1"
              max="5"
              required
              value={formData.rating ?? ""}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded-md"
            />
          </div>
          <div>
            <label className="block font-medium">Review Text</label>
            <textarea
              name="review"
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded-md"
            />
          </div>
          <button
            type="submit"
            className="bg-[#00356B] text-white px-4 py-2 rounded-md hover:bg-[#002955]"
          >
            Submit Review
          </button>
        </form>
      </div>

      <div className="mt-6 flex gap-4">
            <button
              onClick={handleSaveSuite}
              className={`text-white px-4 py-2 rounded-md ${isSaved ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"}`}
            >
              {isSaved ? "Unsave Room" : "Save Room"}
            </button>
        <button
          onClick={() => navigate("/search")}
          className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
        >
          Back to Search
        </button>
      </div>
    </div>
  );
}

export default SummaryPage;