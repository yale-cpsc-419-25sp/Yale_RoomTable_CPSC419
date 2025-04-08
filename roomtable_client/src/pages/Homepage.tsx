import { useEffect, useState } from "react";

function Homepage() {
    const [suites, setSuites] = useState([]);

    useEffect(() => {
        fetch("http://localhost:8000/api/homepage", {
            credentials: "include"
        })
            .then(res => res.json())
            .then(data => setSuites(data));
    }, []);

    return (
        <div>
            <div className="banner">
                <a href="/homepage" className="nav-link">My Saved Rooms</a>
                <a href="/friends" className="nav-link">Add Friends</a>
                <a href="/search" className="nav-link">Search Rooms</a>
                <a href="/review" className="nav-link">Reviews</a>
                <form action="http://localhost:8000/logout" method="get">
                    <button type="submit" className="logout">Log Out</button>
                </form>
            </div>

            <h2>Your Saved Rooms:</h2>
            <div className="room-table">
                <table>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Residential College</th>
                            <th>Entryway</th>
                            <th>Capacity</th>
                            <th>Number of Singles</th>
                            <th>Number of Doubles</th>
                            <th>Class Year</th>
                        </tr>
                    </thead>
                    <tbody>
                        {suites.map((suite) => (
                            <tr key={suite.id}>
                                <td>{suite.name}</td>
                                <td>{suite.resco}</td>
                                <td>{suite.entryway}</td>
                                <td>{suite.capacity}</td>
                                <td>{suite.singles}</td>
                                <td>{suite.doubles}</td>
                                <td>{suite.year}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default Homepage;
