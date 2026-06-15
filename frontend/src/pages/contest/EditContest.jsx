import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    getContestById,
    updateContest
} from "../../api/contestApi";

function EditContest() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        startTime: "",
        endTime: ""
    });

    useEffect(() => {
        loadContest();
    }, []);
    const loadContest = async () => {
        const res = await getContestById(id);
        const contest = res.data || res;
        setFormData({
            title: contest.title,
            description: contest.description,
            startTime: contest.startTime,
            endTime: contest.endTime
        });
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preveentDefault();
        await updateContest(
            id, formData
        );
        navigate("/contests");
    };

    return (
        <form onSubmit={handleSubmit}>
            <input
                name="title"
                value={formData.title}
                onChange={handleChange}
            />
            <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
            />
            <input
                type="datetime-local"
                name="startTime"
                value={formData.startTime}
                onchange={handleChange}
            />
            <input
                type="datetime-local"
                name="endTime"
                value={formData.endTime}
                onchange={handleChange}
            />
            <button type="submit">Update</button>


        </form>
    )
}

export default EditContest;