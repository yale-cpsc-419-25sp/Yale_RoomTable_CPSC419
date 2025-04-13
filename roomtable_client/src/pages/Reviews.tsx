import React, { useEffect, useState } from 'react';

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
    <div className="review-form">
      <h1>Submit a Review</h1>
      <form onSubmit={handleSubmit}>
        <label>Suite:</label>
        <select name="suite" value={formData.suite} onChange={handleChange} required>
          <option value="">Select Suite</option>
          {suites.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>

        {['accessibility', 'space', 'rating'].map((field) => (
          <div className="rating-group" key={field}>
            <label>{field.charAt(0).toUpperCase() + field.slice(1)}:</label>
            {[1, 2, 3, 4, 5].map((val) => (
              <label key={val}>
                <input
                  type="radio"
                  name={field}
                  value={val}
                  checked={formData[field] === String(val)}
                  onChange={handleChange}
                />
                <span className="fa fa-star icon"></span>
              </label>
            ))}
          </div>
        ))}

        <label>Review:</label>
        <textarea name="review" value={formData.review} onChange={handleChange}></textarea>

        <button type="submit">Submit Review</button>
      </form>

      <h2>Reviews</h2>
      <table className="review-table">
        <thead>
          <tr>
            <th>Suite</th>
            <th>Accessibility</th>
            <th>Space</th>
            <th>Overall</th>
            <th>Review</th>
          </tr>
        </thead>
        <tbody>
          {reviews.map((r, i) => (
            <tr key={i}>
              <td>{r.suite_name}</td>
              <td>{r.accessibility_rating}</td>
              <td>{r.space_rating}</td>
              <td>{r.overall_rating}</td>
              <td>{r.review_text}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ReviewForm;
