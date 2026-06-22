import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createContest } from "../../api/contestApi";

function CreateContest() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        startTime: "",
        endTime: "",

    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await createContest(formData);
            navigate("/contests");
        } catch (error) {
            console.error("error creating contest", error);
            alert("error ");
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <input
                name="title"
                placeholder="Title"
                onChange={handleChange}
            />
            <textarea
                name="description"
                placeholder="Description"
                onChange={handleChange}
            />
            <input
                type="datetime-local"
                name="startTime"
                placeholder="start time"
                onChange={handleChange}
            />

            <input
                type="datetime-local"
                name="endTime"
                placeholder="End time"
                onChange={handleChange}
            />

            <button type="submit">
                Create
            </button>

        </form>
    );
}

export default CreateContest;
