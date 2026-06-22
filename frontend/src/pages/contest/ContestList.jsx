import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getContests, deleteContest } from "../../api/contestApi";

function ContestList() {
    const [contests, setContests] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchContests();
    }, []);

    const fetchContests = async () => {
        try {
            const data = await getContests();
            setContests(data.data || data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };
    const handleDelete = async (id) => {
        try {
            await deleteContest(id);
            fetchContests();
        } catch (error) {
            console.error(error);
        }
    };

    if (loading) {
        return <h2>Loading...</h2>;
    }

    return (
        <div>
            <h1>Contests</h1>

            <Link to="/contests/create">
                Create Contest
            </Link>

            {contests.map((contest) => (
                <div key={contest._id}>
                    <h3>{contest.title}</h3>

                    <p>{contest.description}</p>

                    <p>Status: {contest.status}</p>

                    <Link to={`/contests/${contest._id}`}>
                        View
                    </Link>

                    {" | "}

                    <Link to={`/contests/edit/${contest._id}`}>
                        Edit
                    </Link>

                    {" | "}

                    <button
                        onClick={() =>
                            handleDelete(contest._id)
                        }
                    >
                        Delete
                    </button>
                </div>
            ))}
        </div>
    );
}

export default ContestList;