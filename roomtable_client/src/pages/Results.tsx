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
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-2xl shadow-lg">
      <div className="mb-4">
        <button
          onClick={() => navigate("/search")}
          className="bg-[#00356B] hover:bg-[#00509E] text-white font-semibold py-2 px-4 rounded shadow transition"
        >
          ← Back to Search
        </button>
      </div>


      <h1 className="text-3xl font-bold mb-4 text-gray-800">Suite Search Results</h1>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-700 mb-2">Filters Applied:</h2>
        <ul  className="list-disc list-inside space-y-1 text-gray-600">
          {filters.capacity && <li><span className="font-semibold text-gray-800">Capacity:</span> {filters.capacity}</li>}
          {filters.floor && <li><span className="font-semibold text-gray-800">Floor:</span> {filters.floor}</li>}
          {filters.classYear && <li><span className="font-semibold text-gray-800">Class Year:</span> {filters.classYear}</li>}
        </ul>
      </div>
     

      <h2 className="text-xl font-semibold text-gray-700 mb-2">Matching Suites</h2>
      {results.length > 0 ? (
        <table className="min-w-full border border-gray-300 shadow-sm rounded-md overflow-hidden">
          <thead className="bg - [#00356B] text-white uppercase text-sm">
            <tr>
              <th className="px-4 py-2 text-left ">Suite Name</th>
              <th className="px-4 py-2 text-left ">Entryway</th>
              <th className="px-4 py-2 text-left ">Capacity</th>
              <th className="px-4 py-2 text-left ">Residential College</th>
            </tr>
          </thead>
          <tbody>
            {results.map((suite, index) => (
              <tr 
              key={suite.id}
              className={index % 2 === 0? "bg-gray 100" : "bg-gray-200"}>
                <td className = "px-4 py-2">
                  <a href={`/summary/${suite.id}`}
                  className = "text-blue-700 underline hover:text-blue-9000"
                  >
                    {suite.name}
                    </a>
                </td>
                <td className="px-4 py-2" >{suite.entryway}</td>
                <td className="px-4 py-2">{suite.capacity}</td>
                <td className="px-4 py-2">{suite.resco?.name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No suites match the search criteria.</p>
      )}

      <button onClick={() => navigate("/search")}   className="mt-6 bg-[#00356B] hover:bg-[#00509E] text-white font-bold py-2 px-6 rounded shadow-md transition-all"
      >
        Back to Search
      </button>
    </div>
  );
};

export default ResultsPage;
