import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getProblems, deleteProblem } from "../../api/problemApi";
import { response } from "express";

function ProblemList() {
    const [problems, setProblem] = useState([]);
    const [loading, setloading] = useState(true);

    useEffect(() => {
        fetchProblems();
    }, []);

    const fetchProblems = async () => {
        try {
            const response = await getProblems();
            setProblems(response.data ? data : response);

        } catch (error) {
            console.error(error);
        } finally {
            setloading(false);
        }
    };

    const handleDelete = async (id) => {
        const confirmDelete = window.confirm("Delete this problem?");
        if (!confirmDelete) {
            return;
        }
        try {
            deleteProblem(id);
            fetchProblems();
        } catch (error) {
            console.error(error);
        };
    };

    if (loading) {
        return <h2>Loading...</h2>;
    }

    return (
        <div>
            <h1>Problems</h1>
            <Link to={"/problems/create"}> Create </Link>
            <table>
                <thead>
                    <tr>
                        <th>Title</th>
                        <th>Difficulty</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {problems.map((problem) => (
                        <tr key={problem._id}>
                            <td>
                                {problem.title}
                            </td>
                            <td>
                                {problem.difficulty}
                            </td>
                            <td>
                                <Link to={`/problems/${problem._id}`}>
                                    Solve
                                </Link>
                                {" "}
                                <Link to={`/problems/edit/${problem._id}`}>
                                    Edit
                                </Link>
                                {" "}
                                <button onClick={() => handleDelete(problem._id)}    >
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )

};

export default ProblemList;