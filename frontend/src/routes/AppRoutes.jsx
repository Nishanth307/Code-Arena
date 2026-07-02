import { Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";
import AuthContext from "../context/AuthContext";
import ProtectedRoute from "../components/common/ProtectedRoute";
import ContestList from "../pages/contest/ContestList";
import ContestDetails from "../pages/contest/ContestDetails";
import EditContest from "../pages/contest/EditContest";
import CreateContest from "../pages/contest/CreateContest";
import ProblemDetails from "../pages/problem/ProblemDetails";
import ProblemList from "../pages/problem/ProblemList";
import CreateProblem from "../pages/problem/CreateProblem";
import EditProblem from "../pages/problem/EditProblem";
import SubmissionList from "../pages/submission/SubmissionList";
import SubmissionDetails from "../pages/submission/SubmissionDetails";
import SubmitSolution from "../pages/submission/SubmitSoultion";
import Leaderboard from "../pages/leaderboard/Leaderboard";
import UserStats from "../pages/leaderboard/UserStats";
import Profile from "../pages/profile/Profile";

function AdminRoute({ children }) {
    const { user, loading } = useContext(AuthContext);
    
    if (loading) {
        return <div style={{ padding: "2rem", textAlign: "center" }}><h2>Loading authorization...</h2></div>;
    }
    
    if (!user || user.role !== "ADMIN") {
        return <Navigate to="/problems" replace />;
    }
    
    return children;
}

function AppRoutes() {
    return (
        <Routes>
            <Route path="/contests" element={<ContestList />} />
            <Route path="/contests/create" element={<AdminRoute><CreateContest /></AdminRoute>} />
            <Route path="/contests/:id" element={<ContestDetails />} />
            <Route path="/contests/edit/:id" element={<AdminRoute><EditContest /></AdminRoute>} />

            <Route path="/problems/:id" element={<ProblemDetails />} />
            <Route path="/problems" element={<ProblemList />} />
            <Route path="/problems/create" element={<AdminRoute><CreateProblem /></AdminRoute>} />
            <Route path="/problems/edit/:id" element={<AdminRoute><EditProblem /></AdminRoute>} />

            <Route path="/submissions" element={<ProtectedRoute><SubmissionList /></ProtectedRoute>} />
            <Route path="/submissions/:id" element={<SubmissionDetails />} />
            <Route path="/submit/:id" element={<SubmitSolution />} />

            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/leaderboard/user/:id" element={<UserStats />} />
            
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        </Routes>
    )
}

export default AppRoutes;