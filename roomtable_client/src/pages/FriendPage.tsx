import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

function FriendPage() {
    const { friendId } = useParams();
    const [suites, setSuites] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        fetch(`http://localhost:8000/api/friends/${friendId}`, {
            credentials: 'include'
        })
            .then(res => res.json())
            .then(data => {
                if (data.error) setError(data.error);
                else setSuites(data.suites);
            });
    }, [friendId]);

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

            <h2>Saved Rooms for {friendId}:</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
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
                            <th>Rank</th>
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
                                <td>{suite.rank}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default FriendPage;
