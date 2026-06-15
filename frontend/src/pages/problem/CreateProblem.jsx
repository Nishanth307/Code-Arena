import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getProblems } from "../../api/problemApi";

function ProblemList() {
    const [problems, setProblems] = useState([]);

    useEffect(() => {
        loadProblems();
    }, []);

    const loadProblems = async () => {
        const res = await getProblems();
        setProblems(res.data.data);
    };

    return (
        <div>
            <h1>Problems</h1>
            <Link to="/problems/create"> Create Problem </Link>
            {problems.map((problem) => (
                <div key={problem._id}>
                    <h3>{problem.title}</h3>
                    <p>{problem.difficulty}</p>
                    <Link to={`/problems/${problem._id}`}> Solve </Link>
                </div>
            ))}
        </div>
    );
}

export default ProblemList;