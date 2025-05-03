import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

function SummaryPage() {
    const { suite_id } = useParams();
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
    const [successMessage, setSuccessMessage] = useState("");
  
    // Fetch suite data from flask-server
    useEffect(() => {
        fetch(`http://localhost:8000/api/summary/${suite_id}`, { credentials: "include" })
          .then(res => res.json())
          .then(data => {
            setSuite(data.suite);
            setReviews(data.reviews);
            setFormData(prev => ({ ...prev, user_id: data.id }))
            setIsSaved(data.suite.is_saved);
          });
      }, []);
    
    // Convert rating (0–5) to a pastel color on red-to-green HSL gradient
    const getRatingColor = (rating) => {
      if (rating == null) return "#ddd"; 
      const hue = (rating / 5) * 120; 
      return `hsl(${hue}, 65%, 75%)`;
    };
      
    const handleSubmitReview = async (e) => {
      e.preventDefault();
  
      await fetch(`http://localhost:8000/api/reviews`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(formData)
      });
  
      // Re-fetch summary data so new review is included and averages are updated
      const res = await fetch(`http://localhost:8000/api/summary/${suite_id}`, {
          credentials: "include"
      });
      const data = await res.json();
      
      setSuite(data.suite);           // <- ✅ Also update the suite object
      setReviews(data.reviews);       // <- Keep updating reviews as before
      setSuccessMessage("Submitted!");
  
      // Optionally clear the form:
      setFormData(prev => ({
          ...prev,
          accessibility: "",
          space: "",
          overall: "",
          review: "",
      }));
  };
  
    
    const handleSaveSuite = async () => {
        const method = isSaved ? "DELETE" : "POST"
    
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
        <div className="px-6 max-w-5xl mx-auto">
            <link
              rel="stylesheet"
              href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"
            />
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-3xl font-bold">Suite Summary</h1>
              <button
              onClick={handleSaveSuite}
              className={`text-white px-4 py-2 rounded-md ${isSaved ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"}`}
              >
                {isSaved ? "Unsave Room" : "Save Room"}
              </button>
            </div>
            <div className="overflow-hidden rounded-xl shadow-md border border-gray-300">
              <table className="min-w-full">
                  <thead className="bg-[#00356B] text-white">
                  <tr>
                      <th className="px-4 py-2 text-left">Name</th>
                      <th className="px-4 py-2 text-left">Residential College</th>
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
                      <td className="px-4 py-2">{suite.capacity}</td>
                      <td className="px-4 py-2">{suite.singles}</td>
                      <td className="px-4 py-2">{suite.doubles}</td>
                      <td className="px-4 py-2">{suite.year === 2 ? "Sophomore" : "Junior/Senior"}</td>
                  </tr>
                  </tbody>
              </table>
            </div>
            

        <img src={floorPlans} alt="Suite Floorplan" className="w-full h-auto mt-6 mb-6 rounded-md shadow-md" />
        <div className="mb-6">
          <h2 className="text-2xl font-semibold mb-2">Reviews</h2>
          {suite && (
            <div className="flex justify-between space-x-4 my-4">
              {[
                ["Overall", suite.overall],
                ["Accessibility", suite.accessibility],
                ["Space", suite.space],
              ].map(([label, val]) => (
                <div
                  key={label}
                  className="flex-1 text-center p-6 rounded-xl shadow-md"
                  style={{
                    backgroundColor: getRatingColor(val),
                    color: 'black',
                    fontWeight: 'bold',
                    fontSize: '1.2rem',
                  }}
                >
                  {label} Average | {val != null ? val.toFixed(2) : "N/A"}
                </div>
              ))}
            </div>
          )}

          {reviews.length ? (
            reviews.map((r, i) => (
              <div
                key={i}
                className="border border-gray-300 rounded-md p-4 mb-4 bg-gray-50 shadow-sm"
              >
                <div className="mb-2">
                  <strong className="mr-2">Overall </strong>
                  {[1, 2, 3, 4, 5].map((val) => (
                    <span
                      key={val}
                      className={`fa-star fa text-yellow-400 ${
                        r.overall_rating >= val ? "fas" : "far text-gray-300"
                      }`}
                    ></span>
                  ))}
                </div>
                <div className="mb-2">
                  <strong className="mr-2">Accessibility </strong>
                  {[1, 2, 3, 4, 5].map((val) => (
                    <span
                      key={val}
                      className={`fa-star fa text-yellow-400 ${
                        r.accessibility_rating >= val ? "fas" : "far text-gray-300"
                      }`}
                    ></span>
                  ))}
                </div>
                <div className="mb-6">
                  <strong className="mr-2">Space </strong>
                  {[1, 2, 3, 4, 5].map((val) => (
                    <span
                      key={val}
                      className={`fa-star fa text-yellow-400 ${
                        r.space_rating >= val ? "fas" : "far text-gray-300"
                      }`}
                    ></span>
                  ))}
                </div>
                <p>{r.review_text || "N/A"}</p>
              </div>
            ))
          ) : (
            <p className="text-gray-500">No reviews.</p>
          )}
        </div>

      
      <div className="p-6 max-w-6xl mx-auto bg-white shadow-lg rounded-lg">
        <h1 className="text-2xl font-bold mb-4">Submit a Review</h1>
        <form onSubmit={handleSubmitReview} className="space-y-4">
        {['overall', 'accessibility', 'space'].map((field) => (
          <div className="rating-group mb-4 flex items-center" key={field}>
            <label className="block font-medium mb-1 mr-6">
              {field.charAt(0).toUpperCase() + field.slice(1)}
            </label>
            <div className="flex space-x-1">
              {[1, 2, 3, 4, 5].map((val) => (
                <label key={val} className="cursor-pointer">
                  <input
                    type="radio"
                    name={field}
                    value={val}
                    checked={formData[field] === String(val)}
                    onChange={handleChange}
                    className="hidden"
                  />
                  <span
                    className={`fa-star fa text-xl ${
                      Number(formData[field]) >= val ? "fas text-yellow-400" : "far text-gray-300"
                    }`}
                  ></span>
                </label>
              ))}
            </div>
          </div>
          ))}
          <div>
          <textarea
            name="review"
            value={formData.review}
            onChange={handleChange}
            rows="4"
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            placeholder="Write your review here..."
          />
          </div>

          <button type="submit" className="search-button">
            Submit Review
          </button>
          
        </form>
        {successMessage && (
          <div className="mt-6 text-green-600 font-semibold mb-2">{successMessage}</div>
        )}
      </div>
    </div>
  );
}

export default SummaryPage;