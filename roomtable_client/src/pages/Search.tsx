import React from "react";
import "../../../static/search.css"

const SearchPage = () => {
  return (
    <div>
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
            <option value="Sextet">6</option>
            <option value="Septet">7</option>
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
            <option value="2">Sophomore</option>
            <option value="3">Junior/Senior</option>
          </select>
          <br />

          <div className="button-layout">
            <input type="submit" value="Search" className="search-button" />
          </div>
        </form>
      </div>
    </div>
  );
};

export default SearchPage;
