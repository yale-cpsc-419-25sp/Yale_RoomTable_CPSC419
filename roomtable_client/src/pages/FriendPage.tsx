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
        <div className="p-6 max-w-8xl mx-auto">
            <h2 className="text-3xl font-bold mb-6">{friendId}'s Saved Rooms:</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <div className="overflow-hidden rounded-xl shadow-md border border-gray-300">
            <table className="min-w-full">
                <thead className="bg-[#00356B] text-white">
                    <tr>
                        <th className="px-4 py-2 text-left">Suite</th>
                        {/* <th className="px-4 py-2 text-left">Entryway</th> */}
                        <th className="px-4 py-2 text-left">Capacity</th>
                        <th className="px-4 py-2 text-left">Singles</th>
                        <th className="px-4 py-2 text-left">Doubles</th>
                        <th className="px-4 py-2 text-left">Class Year</th>
                        <th className="px-4 py-2 text-left">Residential College</th>
                    </tr>
                </thead>
                <tbody>
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
                            {/* <td className="px-4 py-2">{suite.entryway}</td> */}
                            <td className="px-4 py-2">{suite.capacity}</td>
                            <td className="px-4 py-2">{suite.singles}</td>
                            <td className="px-4 py-2">{suite.doubles}</td>
                            <td className="px-4 py-2">{suite.year === 2 ? "Sophomore" : "Junior/Senior"}</td>
                            <td className="px-4 py-2">{suite.resco}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            </div>
        </div>
    );
}

export default FriendPage;
