import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getContestById } from "../../api/contestApi";


function ContestDetails() {
    const {id} = useParams();
    const [contest, setContest] = useState(null);

    useEffect(() => {
        fetchContest();
    }, []);

    const fetchContest = async ()=>{
        try{
            const res = await getContestById(id);
            setContest(res.data||res);
        } catch(error){
            console.error(error);
        }
    }



    return (
        <div>
            <h1>{contest.title}</h1>
            <p>{contest.description}</p>
            <p>
                Status: {contest.status}
            </p>
            <p>
                Participants:
                {" "}
                {contest.participantCount}
            </p>
            <p>
                Start:
                {" "}
                {new Date(
                    contest.startTime
                ).toLocaleString()}
            </p>
            <p>
                End:
                {" "}
                {new Date(
                    contest.endTIme
                ).toLocaleString()}
            </p> 
        </div>
    );
}

export default ContestDetails;