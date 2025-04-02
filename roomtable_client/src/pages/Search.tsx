import React from "react";

const SearchPage = () => {
  return (
    <div>
      <div className="banner">
        <a href="/homepage" className="nav-link">My Saved Rooms</a>
        <a href="/friends" className="nav-link">Add Friends</a>
        <a href="/search" className="nav-link">Search Rooms</a>
        <a href="/review" className="nav-link">Reviews</a>
        <form action="/" method="get">
          <button type="submit" className="logout">Log Out</button>
        </form>
      </div>

      <h1>Search for a Room</h1>
      <p>Search for rooms in your residential college.</p>

      <div className="search-box">
        <form action="/results" method="GET">
          <label htmlFor="college">Residential College:</label>
          <select name="college" id="college">
            <option value="murray">Pauli Murray</option>
          </select>
          <br />

          <label htmlFor="capacity">Capacity:</label>
          <select name="capacity" id="capacity">
            <option value="Single">1</option>
            <option value="Double">2</option>
            <option value="Triple">3</option>
            <option value="Quad">4</option>
            <option value="Quint">5</option>
            <option value="Septet">6</option>
            <option value="Sextet">7</option>
            <option value="Octet">8</option>
          </select>
          <br />

          <label htmlFor="floor">Floor:</label>
          <select name="floor" id="floor">
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="5">5</option>
            <option value="6">6</option>
          </select>
          <br />

          <label htmlFor="class">Class Year:</label>
          <select name="class" id="class">
            <option value="2026">2026</option>
            <option value="2027">2027</option>
            <option value="2028">2028</option>
          </select>
          <br />

          <input type="submit" value="Search" />
        </form>
      </div>
    </div>
  );
};

export default SearchPage;
