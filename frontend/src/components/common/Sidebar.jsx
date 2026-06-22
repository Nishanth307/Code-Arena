import { Link } from "react-router-dom";

function Sidebar() {
    return (
        <aside
            style={{
                width: "220px",
                padding: "1rem",
                borderRight: "1px solid #ddd",
                minHeight: "100vh"
            }}
        >
            <h3>Menu</h3>

            <ul
                style={{
                    listStyle: "none",
                    padding: 0
                }}
            >
                <li>
                    <Link to="/dashboard">
                        Dashboard
                    </Link>
                </li>

                <li>
                    <Link to="/problems">
                        Problems
                    </Link>
                </li>

                <li>
                    <Link to="/contests">
                        Contests
                    </Link>
                </li>

                <li>
                    <Link to="/submissions">
                        Submissions
                    </Link>
                </li>

                <li>
                    <Link to="/profile">
                        Profile
                    </Link>
                </li>
            </ul>
        </aside>
    );
}

export default Sidebar;