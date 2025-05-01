import { useEffect, useState } from 'react';

function ReviewForm() {
  const [suites, setSuites] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [formData, setFormData] = useState({
    suite: '',
    accessibility: '',
    space: '',
    overall: '',
    review: '',
    user_id: '', // fill this in from session/context if needed
  });
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    fetch('/api/suites')
      .then((res) => res.json())
      .then((data) => setSuites(data.suites));

    fetch('/api/reviews')
      .then((res) => res.json())
      .then((data) => setReviews(data.reviews));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    await fetch('/api/reviews', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });

    const updatedReviews = await fetch('/api/reviews').then((res) => res.json());
    setReviews(updatedReviews.reviews);
    setSuccessMessage("Submitted!");
    setFormData({
      suite: "",
      overall: "",
      accessibility: "",
      space: "",
      review: "",
      user_id: "",
    });

  };

  // Convert rating (0–5) to a pastel color on red-to-green HSL gradient
  const getRatingColor = (rating) => {
    if (rating == null) return "#ddd"; 
    const hue = (rating / 5) * 120; 
    return `hsl(${hue}, 65%, 75%)`;
  };

  return (
    <div >
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"
      />
      <div className="p-6 max-w-6xl mx-auto bg-white shadow-lg rounded-lg">
        <h1 className="text-2xl font-bold mb-4">Submit a Review</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className = "flex items-center">
            <label className="block font-medium mr-6">Suite </label>
            <select
              name="suite"
              value={formData.suite}
              onChange={handleChange}
              required
              className="mt-1 block p-2 border border-gray-300 rounded-md"
            >
              <option value="">Select Suite</option>
              {suites.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
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
          
        </div>
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
        
      <div className="p-6 max-w-6xl mx-auto bg-white shadow-lg rounded-lg mt-10">
        <h1 className="text-2xl font-bold mb-4">All Reviews</h1>
        <div className="overflow-hidden rounded-xl shadow-md border border-gray-300">
          <table className="min-w-full border-collapse">
            <thead className="bg-[#00356B] text-white">
              <tr>
                <th className="px-4 py-2 text-left">Suite</th>
                <th className="px-4 py-2 text-left">Overall Rating</th>
                <th className="px-4 py-2 text-left">Accessibility Rating</th>
                <th className="px-4 py-2 text-left">Space Rating</th>
                <th className="px-4 py-2 text-left">Review</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map((r, i) => (
                <tr key={i} className="border-t">
                  <td className="px-4 py-2">
                    <a href={`/summary/${r.suite_id}`} className="text-blue-700 underline hover:text-blue-900">
                      {r.suite_name}
                    </a>
                  </td>
                  {/* <td className="px-4 py-2">{r.accessibility_rating}</td> */}
                  <td className="px-4 py-2">
                    <span
                      className="inline-block text-white text-sm font-semibold px-2 py-1 rounded-full"
                      style={{ backgroundColor: getRatingColor(r.overall_rating), minWidth: "2.5rem", textAlign: "center", color: 'black'}}
                    >
                      {r.overall_rating != null ? r.overall_rating.toFixed(1) : "N/A"}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    <span
                        className="inline-block text-white text-sm font-semibold px-2 py-1 rounded-full"
                        style={{ backgroundColor: getRatingColor(r.accessibility_rating), minWidth: "2.5rem", textAlign: "center", color: 'black'}}
                      >
                        {r.accessibility_rating != null ? r.accessibility_rating.toFixed(1) : "N/A"}
                      </span>
                  </td>
                  <td className="px-4 py-2">
                  <span
                        className="inline-block text-white text-sm font-semibold px-2 py-1 rounded-full"
                        style={{ backgroundColor: getRatingColor(r.space_rating), minWidth: "2.5rem", textAlign: "center", color: 'black'}}
                      >
                        {r.space_rating != null ? r.space_rating.toFixed(1) : "N/A"}
                      </span>
                  </td>
                  <td className="px-4 py-2 max-w-xs truncate">
                    {r.review_text != null && r.review_text.trim() !== "" ? (
                      <span title={r.review_text}>{r.review_text}</span>
                    ) : (
                      <span className="text-gray-400">N/A</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
    
  );
}

export default ReviewForm;
