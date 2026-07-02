import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

function Layout({ children }) {
    return (
        <>
            <Navbar />

            <div
                className="app-body"
                style={{
                    display: "flex"
                }}
            >
                <Sidebar />

                <main
                    className="app-main"
                    style={{
                        flex: 1,
                        padding: "1rem"
                    }}
                >
                    {children}
                </main>
            </div>
        </>
    );
}

export default Layout;