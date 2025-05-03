import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

function FriendPage() {
    const { friendId } = useParams();
    const [suites, setSuites] = useState([]);
    const [error, setError] = useState('');

    // Fetch the friend's suites from flask-server using friendId
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

    // Convert rating (0–5) to a pastel color on red-to-green HSL gradient
    const getRatingColor = (rating) => {
        if (rating == null) return "#ddd"; 
        const hue = (rating - 1) * 30; 
        return `hsl(${hue}, 75%, 75%)`;
    };

    return (
        <div className="p-6 max-w-8xl mx-auto">
            <h2 className="text-3xl font-bold mb-6">{friendId}'s Saved Rooms:</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <div className="overflow-hidden rounded-xl shadow-md border border-gray-300">
            <table className="min-w-full">
                <thead className="bg-[#00356B] text-white">
                    <tr>
                        <th className="px-4 py-2 text-left">Suite</th>
                        <th className="px-4 py-2 text-left">Capacity</th>
                        <th className="px-4 py-2 text-left">Singles</th>
                        <th className="px-4 py-2 text-left">Doubles</th>
                        <th className="px-4 py-2 text-left">Class Year</th>
                        <th className="px-4 py-2 text-left">Residential College</th>
                        <th className="px-4 py-2 text-left">Overall Rating</th>
                        <th className="px-4 py-2 text-left">Accessibility Rating</th>
                        <th className="px-4 py-2 text-left">Space Rating</th>
                    </tr>
                </thead>
                <tbody>
                    { /* Display the friend's saved suites */}
                    {suites.map((suite, index) => (
                        <tr 
                        key={suite.id}
                        className={index % 2 === 0 ? "bg-gray-100" : "bg-gray-200"}>
                            <td className="px-4 py-2">
                                <a href={`/summary/${suite.id}`}
                                className = "text-blue-700 underline hover:text-blue-9000"
                                >
                                    {suite.name}
                                    </a>
                            </td>
                            <td className="px-4 py-2">{suite.capacity}</td>
                            <td className="px-4 py-2">{suite.singles}</td>
                            <td className="px-4 py-2">{suite.doubles}</td>
                            <td className="px-4 py-2">{suite.year === 2 ? "Sophomore" : "Junior/Senior"}</td>
                            <td className="px-4 py-2">{suite.resco}</td>
                            <td className="px-4 py-2">
                                <span
                                className="inline-block text-white text-sm font-semibold px-2 py-1 rounded-full"
                                style={{ backgroundColor: getRatingColor(suite.overall), minWidth: "2.5rem", textAlign: "center", color: 'black'}}
                                >
                                {suite.overall != null ? suite.overall.toFixed(1) : "N/A"}
                                </span>
                            </td>
                            <td className="px-4 py-2">
                                <span
                                className="inline-block text-white text-sm font-semibold px-2 py-1 rounded-full"
                                style={{ backgroundColor: getRatingColor(suite.accessibility), minWidth: "2.5rem", textAlign: "center", color: 'black'}}
                                >
                                {suite.accessibility != null ? suite.accessibility.toFixed(1) : "N/A"}
                                </span>
                            </td>
                            <td className="px-4 py-2">
                                <span
                                className="inline-block text-white text-sm font-semibold px-2 py-1 rounded-full"
                                style={{ backgroundColor: getRatingColor(suite.space), minWidth: "2.5rem", textAlign: "center", color: 'black'}}
                                >
                                {suite.space != null ? suite.space.toFixed(1) : "N/A"}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            </div>
        </div>
    );
}

export default FriendPage;
