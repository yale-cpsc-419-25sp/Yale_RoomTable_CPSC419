import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import SearchPage from "./pages/Search";
import ResultsPage from "./pages/Results";
import SummaryPage from "./pages/Summary";
// import Homepage from "./pages/Homepage";

function PrivateRoute({ user, children }) {
    // console.log("user:", user);
    // console.log("child:", children);
    return user ? children : <Navigate to="/" />;
};

function App() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("http://localhost:8000/api/user", {
            method: "GET",
            credentials: "include",
        })
        .then(response => {
            if (response.ok) return response.json();
            throw new Error("Not logged in.");
        })
        .then(data => {
            setUser(data.net_id);
        })
        .catch(() => {
            setUser(null);
        })
        .finally(() => {
            setLoading(false);
        });
    }, []);

    if (loading) return;

    return (
        <Router>
            <Navbar user={user} />
            <Routes>
                <Route
                    path="/"
                    element={
                        user ? <Navigate to="/search"> </Navigate>: <Hero />
                    }
                />
                <Route
                    path="/search"
                    element={
                        <PrivateRoute user={user}>
                            <SearchPage />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/results"
                    element={
                        <PrivateRoute user={user}>
                            <ResultsPage />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/summary/:suite_id"
                    element={
                        <PrivateRoute user={user}>
                            <SummaryPage />
                        </PrivateRoute>
                    }
                />
                {/* <Route
                    path="/homepage"
                    element={
                        <PrivateRoute user={user}>
                            <Homepage />
                        </PrivateRoute>
                    }
                /> */}
            </Routes>
        </Router>
    );
}

export default App;
