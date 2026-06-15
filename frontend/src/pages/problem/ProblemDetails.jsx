import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getProblemById } from "../../api/problemApi";

function ProblemDetails() {
    const { id } = useParams();
    const [problem, setProblem] = useState(null);

    useEffect(() => {
        loadProblem();
    }, []);

    const loadProblem = async () => {
        const res = await getProblemById(id);
        setProblem(res.data.data);

    };

    if (!problem) {
        return <h2>Loading...</h2>
    }

    return (
        <div>
            <h1>{problem.title}</h1>
            <p>problem.description</p>
            <p>
                Difficulty : {problem.difficulty}
            </p>
        </div>
    )
}

export default ProblemDetails;