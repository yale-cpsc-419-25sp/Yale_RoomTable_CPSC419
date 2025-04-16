import { useEffect, useState } from "react";

function Homepage() {
    const [suites, setSuites] = useState([]);

    useEffect(() => {
        fetch("http://localhost:8000/api/homepage", {
            credentials: "include"
        })
            .then(res => res.json())
            .then(data => setSuites(data.suites));
    }, []);

    const rescoMapping = {
        1: "Franklin",
        2: "Berkeley",
        3: "Branford",
        4: "Davenport",
        9: "Pauli Murray"
    }

    return (
        <div className="p-6 max-w-6xl mx-auto">
            {/* <div className="banner">
                <a href="/homepage" className="nav-link">My Saved Rooms</a>
                <a href="/friends" className="nav-link">Add Friends</a>
                <a href="/search" className="nav-link">Search Rooms</a>
                <a href="/review" className="nav-link">Reviews</a>
                <form action="http://localhost:8000/logout" method="get">
                    <button type="submit" className="logout">Log Out</button>
                </form>
            </div> */}

            <h2 className="text-3xl font-bold mb-6">Your Saved Rooms</h2>
            <div className="room-table">
                <table className="min-w-full border border-gray-300 rounded-md shadow-sm">

                    <thead className="bg-[#00356B] text-white"> 
                        <tr>
                            <th className="px-4 py-2 text-left">Name</th>
                            <th className="px-4 py-2 text-left">Residential College</th>
                            <th className="px-4 py-2 text-left">Entryway</th>
                            <th className="px-4 py-2 text-left">Capacity</th>
                            <th className="px-4 py-2 text-left">Number of Singles</th>
                            <th className="px-4 py-2 text-left">Number of Doubles</th>
                            <th className="px-4 py-2 text-left">Class Year</th>
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
            {/* </div> */}
        </div>
    );
}

export default Homepage;
