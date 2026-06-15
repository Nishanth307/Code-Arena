import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { getProblemById, updateProblem } from "../../api/problemApi";

function EditProblem() {

    const { id } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        difficulty: ""
    });

    useEffect(() => {
        fetchProblem();
    }, []);

    const fetchProblem = async () => {
        try {
            const response = await getProblemById(id);
            const problem = response.data?.data || response.data;

            setFormData({
                title: problem.title,
                description: problem.description,
                difficulty: problem.difficulty
            });
        } catch (error) {
            console.error(error);
        }
    };

    const handleChange = (e) => {

        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await updateProblem(id, formData);
            navigate("/problems");
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div>
            <h1>Edit Problem</h1>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Title"
                />

                <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Description"
                />

                <select name="difficulty" value={formData.difficulty} onChange={handleChange}>
                    <option value="">Select Difficulty</option>
                    <option value="EASY">EASY</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HARD">HARD</option>
                </select>
                <button type="submit">Update Problem</button>
            </form>
        </div>
    );
}

export default EditProblem;