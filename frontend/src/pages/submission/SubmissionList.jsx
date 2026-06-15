import { useEffect, useState } from "react";
import { getSubmissions } from "../../api/submissionApi";

function SubmissionList() {

    const [submissions, setSubmissions] = useState([]);

    useEffect(() => {
        loadSubmissions();
    }, []);

    const loadSubmissions = async () => {
        const res = await getSubmissions();
        setSubmissions(res.data.data);
    };

    return (
        <table>

            <thead>
                <tr>
                    <th>Problem</th>
                    <th>Language</th>
                    <th>Verdict</th>
                </tr>
            </thead>

            <tbody>
                {submissions.map((submission) => (
                    <tr key={submission._id}>
                        <td>{submission.problemId?.title}</td>
                        <td>{submission.language}</td>
                        <td>{submission.status}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}

export default SubmissionList;