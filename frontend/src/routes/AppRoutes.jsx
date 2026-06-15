import { Routes, Route } from "react-router-dom";
import ContestList from "../pages/contest/ContestList";
import ContestDetails from "../pages/contest/ContestDetails";
import EditContest from "../pages/contest/EditContest";


function AppRoutes() {
    return (
        <Routes>
            <Route path="/contests" element={<ContestList />} />
            <Route path="/contests/create" element={<CreateContest />} />
            <Route path="/contests/:id" element={<ContestDetails />} />
            <Route path="/contests/edit/:id" element={<EditContest />} />

            <Route path="/problems/:id" element={<ProblemDetails />} />
            <Route path="/problems" element={<ProblemList />} />
            <Route path="/problems/create" element={<CreateProblem />} />
            <Route path="/problems/edit/:id" element={<EditProblem />} />

            <Route path="/submissions" element={<SubmissionList />} />
            <Route path="/submissions/:id" element={<SubmissionDetails />} />
            <Route path="/submit/:id" element={<SubmitSolution />} />
        </Routes>
    )
}

export default AppRoutes;