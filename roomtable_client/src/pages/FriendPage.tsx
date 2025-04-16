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
            <h2 className="px-4 py-2">Saved Rooms for {friendId}:</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {/* <div className="room-table">
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
            </div> */}
            <table className="min-w-full border border-gray-300 shadow-sm rounded-md overflow-hidden">
                <thead className="bg - [#00356B] text-white uppercase text-sm">
                    <tr>
                        <th className="px-4 py-2 text-left text-black">Suite</th>
                        <th className="px-4 py-2 text-left text-black">Residential College</th>
                        <th className="px-4 py-2 text-left text-black">Entryway</th>
                        <th className="px-4 py-2 text-left text-black">Capacity</th>
                        <th className="px-4 py-2 text-left text-black">Number of Singles</th>
                        <th className="px-4 py-2 text-left text-black">Number of Doubles</th>
                        <th className="px-4 py-2 text-left text-black">Class Year</th>
                    </tr>
                </thead>
                {/* <tbody>
                    {results.map((suite, index) => (
                    <tr 
                    key={suite.id}
                    className={index % 2 === 0 ? "bg-gray-100" : "bg-gray-200"}>
                        <td className = "px-4 py-2">
                        <a href={`/summary/${suite.id}`}
                        className = "text-blue-700 underline hover:text-blue-900"
                        >
                            {suite.name}
                            </a>
                        </td>
                        <td className="px-4 py-2">{suite.resco}</td>
                        <td className="px-4 py-2">{suite.entryway}</td>
                        <td className="px-4 py-2">{suite.capacity}</td>
                        <td className="px-4 py-2">{suite.singles}</td>
                        <td className="px-4 py-2">{suite.doubles}</td>
                        <td className="px-4 py-2">{suite.year}</td>
                    </tr>
                    ))}
                </tbody> */}
                <tbody>
                    {suites.map((suite) => (
                        <tr 
                        key={suite.id}>
                        {/* className={index % 2 === 0 ? "bg-gray-100" : "bg-gray-200"}> */}
                            {/* <td className="px-4 py-2">{suite.name}</td> */}
                            <td className="px-4 py-2">
                                <a href={`/summary/${suite.id}`}
                                className = "text-blue-700 underline hover:text-blue-9000"
                                >
                                    {suite.name}
                                    </a>
                            </td>
                            <td className="px-4 py-2">{suite.resco}</td>
                            <td className="px-4 py-2">{suite.entryway}</td>
                            <td className="px-4 py-2">{suite.capacity}</td>
                            <td className="px-4 py-2">{suite.singles}</td>
                            <td className="px-4 py-2">{suite.doubles}</td>
                            <td className="px-4 py-2">{suite.year}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default FriendPage;
