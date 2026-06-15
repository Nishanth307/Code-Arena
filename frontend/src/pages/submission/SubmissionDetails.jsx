import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getSubmissionById } from "../../api/submissionApi";

function SubmissionDetails() {
    const { id } = useParams();

    const [submission, setSubmission] = useState(null);

    useEffect(() => {
        fetchSubmission();
    }, []);

    const fetchSubmission = async () => {
        try {
            const response = await getSubmissionById(id);
            setSubmission(response.data?.data || response.data);
        } catch (error) {
            console.error(error);
        }
    };

    if (!submission) {
        return <h2>Loading...</h2>;
    }

    return (
        <div>
            <h1>Submission Details</h1>
            <p>
                Problem:
                {" "}
                {submission.problemId?.title}
            </p>

            <p>
                Language:
                {" "}
                {submission.language}
            </p>
            <p>
                Status:
                {" "}
                {submission.status}
            </p>
            <p>
                Submitted By:
                {" "}
                {submission.userId?.name}
            </p>
            <h3>Code</h3>
            <pre>
                {submission.code}
            </pre>
        </div>
    );
}

export default SubmissionDetails;