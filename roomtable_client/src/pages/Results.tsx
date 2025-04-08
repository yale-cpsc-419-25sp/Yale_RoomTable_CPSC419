import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const ResultsPage = () => {
  const [results, setResults] = useState([]);
  const [filters, setFilters] = useState({});
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const capacity = queryParams.get("capacity");
    const floor = queryParams.get("floor");
    const classYear = queryParams.get("class");

    setFilters({ capacity, floor, classYear });

    const fetchResults = async () => {
      try {
        const response = await fetch(
          `http://localhost:8000/api/results?capacity=${capacity}&floor=${floor}&class_year=${classYear}`
        );
        const data = await response.json();
        setResults(data.suites || []);
      } catch (error) {
        console.error("Error fetching results:", error);
      }
    };

    fetchResults();
  }, [location.search]);

  return (
    <div>
      <h1>Suite Search Results</h1>

      <h2>Filters Applied:</h2>
      <ul>
        {filters.capacity && <li><strong>Capacity:</strong> {filters.capacity}</li>}
        {filters.floor && <li><strong>Floor:</strong> {filters.floor}</li>}
        {filters.classYear && <li><strong>Class Year:</strong> {filters.classYear}</li>}
      </ul>

      <h2>Matching Suites</h2>
      {results.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>Suite Name</th>
              <th>Entryway</th>
              <th>Capacity</th>
              <th>Residential College</th>
            </tr>
          </thead>
          <tbody>
            {results.map((suite) => (
              <tr key={suite.id}>
                <td>
                  <a href={`/summary/${suite.id}`}>{suite.name}</a>
                </td>
                <td>{suite.entryway}</td>
                <td>{suite.capacity}</td>
                <td>{suite.resco?.name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No suites match the search criteria.</p>
      )}

      <button onClick={() => navigate("/search")} className="nav-button">
        Back to Search
      </button>
    </div>
  );
};

export default ResultsPage;
