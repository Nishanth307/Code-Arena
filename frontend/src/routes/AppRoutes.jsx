import { Routes, Route } from "react-router-dom";
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