import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { useEffect, useState, ReactNode } from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import SearchPage from "./pages/Search";
import ResultsPage from "./pages/Results";
import SummaryPage from "./pages/Summary";
import Homepage from "./pages/Homepage";
import Friends from "./pages/Friends";
import FriendPage from "./pages/FriendPage";
import ReviewForm from "./pages/Reviews";
import Timeline from "./pages/Timeline";

// Protect routes that require authentication
// Redirects to the login page if not logged in, otherwise renders the page
function PrivateRoute({ user, children }: { user: string | null; children: ReactNode }) {
    if (!user) {
        return <Navigate to="/" />;
    }
    return <>{children}</>;
}

function App() {
    // Set default states for user and loading
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Fetch user data from flask-server
    useEffect(() => {
        fetch("http://localhost:8000/api/user", {
            method: "GET",
            credentials: "include",
        })
        .then(response => {
            if (response.ok) return response.json();
            throw new Error("Not logged in.");
        })
        // Set fetched data
        .then(data => {
            setUser(data.net_id);
        })
        .catch(() => {
            setUser(null);
        })
        // Set loading to false, signifying that the app can be safely rendered
        .finally(() => {
            setLoading(false);
        });
    }, []);

    // If not done fetching user info, do not render
    if (loading) return;

    // Render page
    return (
        <Router>
            { /* See components/Navbar.tsx for more details */ }
            <Navbar user={user} />
            <Routes>
                <Route
                    path="/"
                    element={
                        // If user is logged in, redirect to search page instead of login
                        // Otherwise, render the pretty landing page
                        user ? <Navigate to="/search"> </Navigate>: <Hero />
                    }
                />
                { /* All routes below are protected as private routes (login-only pages) */ }
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
                <Route
                    path="/homepage"
                    element={
                        <PrivateRoute user={user}>
                            <Homepage />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/friends"
                    element={
                        <PrivateRoute user={user}>
                            <Friends />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/friends/:friendId"
                    element={
                        <PrivateRoute user={user}>
                            <FriendPage />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/review"
                    element={
                        <PrivateRoute user={user}>
                            <ReviewForm />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/timeline"
                    element={
                        <PrivateRoute user={user}>
                            <Timeline />
                        </PrivateRoute>
                    }
                />
            </Routes>
        </Router>
    );
}

export default App;
