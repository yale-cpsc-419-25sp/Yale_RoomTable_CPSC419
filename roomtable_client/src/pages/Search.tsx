import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const DEFAULT_FILTERS = {
  college: "murray",
  capacity: "Any",
  floor: "Any",
  class_year: "2",
};

const SearchPage = () => {
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const location = useLocation();
  const navigate = useNavigate();

  // Redirect to default filters on first load if none are present
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    if (!queryParams.toString()) {
      const defaultParams = new URLSearchParams({
        college: DEFAULT_FILTERS.college,
        capacity: DEFAULT_FILTERS.capacity,
        floor: DEFAULT_FILTERS.floor,
        class_year: DEFAULT_FILTERS.class_year,
      });
      navigate({ search: defaultParams.toString() }, { replace: true });
    }
  }, [location.search, navigate]);

  // Sync filters from URL
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const capacity = queryParams.get("capacity") || "Any";
    const floor = queryParams.get("floor") || "Any";
    const class_year = queryParams.get("class_year") || "2";
    const college = queryParams.get("college") || "murray";

    setFilters({ capacity, floor, class_year, college });
  }, [location.search]);

  // Fetch filtered rooms based on filters
  useEffect(() => {
    const fetchFilteredRooms = async () => {
      try {
        const searchParams = new URLSearchParams({
          college: filters.college,
          capacity: filters.capacity,
          floor: filters.floor,
          class_year: filters.class_year,
        });

        const url = `http://localhost:8000/api/results?${searchParams.toString()}`;
        const response = await fetch(url);
        const data = await response.json();
        setFilteredRooms(data.suites || []);
      } catch (error) {
        console.error("Error fetching rooms:", error);
      }
    };

    fetchFilteredRooms();
  }, [filters]);

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    const updatedFilters = { ...filters, [name]: value };

    const searchParams = new URLSearchParams();
    searchParams.set("college", updatedFilters.college);
    searchParams.set("capacity", updatedFilters.capacity);
    searchParams.set("floor", updatedFilters.floor);
    searchParams.set("class_year", updatedFilters.class_year);

    navigate({ search: searchParams.toString() });
    setFilters(updatedFilters);
  };


  return (
    <div className="px-6 max-w-8xl mx-auto">
      {/* Filter Bar */}
      <div className="flex flex-wrap gap-4 mb-6 bg-[#00356B] shadow-md rounded-xl p-4">
        <select name="college" onChange={handleFilterChange} value={filters.college} className="border p-2 rounded">
          <option value="murray">Pauli Murray</option>
        </select>

        <select name="capacity" onChange={handleFilterChange} value={filters.capacity} className="border p-2 rounded">
          <option value="Any">Any Capacity</option>
          <option value="Single">1</option>
          <option value="Double">2</option>
          <option value="Triple">3</option>
          <option value="Quad">4</option>
          <option value="Quint">5</option>
          <option value="Sextet">6</option>
          <option value="Septet">7</option>
          <option value="Octet">8</option>
        </select>

        <select name="floor" onChange={handleFilterChange} value={filters.floor} className="border p-2 rounded">
          <option value="Any">Any Floor</option>
          {["Lower", 1, 2, 3, 4, 5, 6, 7, 8].map(f => (
            <option key={f} value={f}>{f}</option>
          ))}
        </select>

        <select name="class_year" onChange={handleFilterChange} value={filters.class_year} className="border p-2 rounded">
          <option value="2">Sophomore</option>
          <option value="3">Junior/Senior</option>
        </select>
      </div>

      {/* Results */}
      <div className="overflow-hidden rounded-xl shadow-md border border-gray-300">
        {filteredRooms.length > 0 ? (
          <table className="min-w-full">
            <thead className="bg-[#00356B] text-white">
              <tr>
                <th className="px-4 py-2 text-left">Suite</th>
                {/* <th className="px-4 py-2 text-left">Entryway</th> */}
                <th className="px-4 py-2 text-left">Capacity</th>
                <th className="px-4 py-2 text-left">Singles</th>
                <th className="px-4 py-2 text-left">Doubles</th>
                {/* <th className="px-4 py-2 text-left">Class Year</th> */}
                <th className="px-4 py-2 text-left">Residential College</th>
              </tr>
            </thead>
            <tbody>
              {filteredRooms.map((suite, index) => (
                <tr key={suite.id} className={index % 2 === 0 ? "bg-gray-100" : "bg-gray-200"}>
                  <td className="px-4 py-2">
                    <a href={`/summary/${suite.id}`} className="text-blue-700 underline hover:text-blue-900">
                      {suite.name}
                    </a>
                  </td>
                  {/* <td className="px-4 py-2">{suite.entryway}</td> */}
                  <td className="px-4 py-2">{suite.capacity}</td>
                  <td className="px-4 py-2">{suite.singles}</td>
                  <td className="px-4 py-2">{suite.doubles}</td>
                  {/* <td className="px-4 py-2">{suite.year === 2 ? "Sophomore" : "Junior/Senior"}</td> */}
                  <td className="px-4 py-2">{suite.resco?.name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No suites match the selected filters.</p>
        )}
      </div>
    </div>
  );
};

export default SearchPage;