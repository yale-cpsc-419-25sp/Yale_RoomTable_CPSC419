import { useEffect, useState } from 'react';

function ReviewForm() {
  const [suites, setSuites] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [formData, setFormData] = useState({
    suite: '',
    accessibility: '',
    space: '',
    rating: '',
    review: '',
    user_id: '', // fill this in from session/context if needed
  });

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
  };

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white shadow-lg rounded-lg">
      <h1 className="text-2xl font-bold mb-4">Submit a Review</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium">Suite:</label>
          <select
            name="suite"
            value={formData.suite}
            onChange={handleChange}
            required
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
          >
            <option value="">Select Suite</option>
            {suites.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        {['accessibility', 'space', 'rating'].map((field) => (
          <div className="rating-group" key={field}>
            <label className="block font-medium">{field.charAt(0).toUpperCase() + field.slice(1)}:</label>
            <div className="flex space-x-2">
              {[1, 2, 3, 4, 5].map((val) => (
                <label key={val} className="flex items-center space-x-1">
                  <input
                    type="radio"
                    name={field}
                    value={val}
                    checked={formData[field] === String(val)}
                    onChange={handleChange}
                    className="text-yellow-400"
                  />
                  <span className="fa fa-star"></span>
                </label>
              ))}
            </div>
          </div>
        ))}

        <div>
          <label className="block font-medium">Review:</label>
          <textarea
            name="review"
            value={formData.review}
            onChange={handleChange}
            rows="4"
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
          />
        </div>

        <button type="submit" className="search-button">
          Submit Review
        </button>
      </form>

      <h2 className="text-xl font-semibold mt-8">Reviews</h2>
      <table className="min-w-full mt-4 border-collapse">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-2 text-left">Suite</th>
            <th className="px-4 py-2 text-left">Accessibility</th>
            <th className="px-4 py-2 text-left">Space</th>
            <th className="px-4 py-2 text-left">Overall</th>
            <th className="px-4 py-2 text-left">Review</th>
          </tr>
        </thead>
        <tbody>
          {reviews.map((r, i) => (
            <tr key={i} className="border-t">
              <td className="px-4 py-2">{r.suite_name}</td>
              <td className="px-4 py-2">{r.accessibility_rating}</td>
              <td className="px-4 py-2">{r.space_rating}</td>
              <td className="px-4 py-2">{r.overall_rating}</td>
              <td className="px-4 py-2">{r.review_text}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ReviewForm;
