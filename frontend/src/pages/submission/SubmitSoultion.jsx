import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createSubmission } from "../../api/submissionApi";

function SubmitSolution() {
    const { problemId } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        language: "python",
        code: ""
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await createSubmission({ problemId, language: formData.language, code: formData.code });
            const submissionId = response.data?.data?._id || response.data?._id;
            navigate(`/submissions/${submissionId}`);
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div>
            <h1>Submit Solution</h1>
            <form onSubmit={handleSubmit}>
                <select value={formData.language} onChange={(e) => setFormData({ ...formData, language: e.target.value })}>
                    <option value="python">Python</option>
                    <option value="cpp">C++</option>
                    <option value="java">Java</option>
                    <option value="javascript">JavaScript</option>

                </select>
                <textarea
                    rows={20}
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="Write code..."
                />
                <button type="submit">Submit</button>
            </form>
        </div>
    );
}

export default SubmitSolution;