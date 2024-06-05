import { useState } from "react";
import Company_logo from "../assets/Company_logo.jpg";
import "./Homepage.css";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";


function Homepage() {
    const [username, setusername] = useState("");
    const [roomId, setroomId] = useState ("");
    const navigate = useNavigate();

    const handleCreateRoom = () => {
        const newRoomID = Math.random().toString(36).substring(2, 10);
        setroomId(newRoomID);
        toast.success("Created New Room");
    };

    const handleJoinRoom = () => {
        if (roomId && username) {
            navigate(`/editor/${roomId}?username=${username}`);
        } else if (!roomId || !username) {
            toast.error("Room Id & username is required");
        }
    };

    return (
        <div id="home">
            <div className="homepage">
                <div className="formWrapper">
                    <img src={Company_logo} className="logo" alt="Project logo" />
                    <h4 className="main-label">Collab-Editor</h4>
                    <div className="inputGroup">
                        <input
                            type="text"
                            className="inputBox"
                            placeholder="Room Id"
                            value={roomId}
                            onChange={(e) => setroomId(e.target.value)}
                        />
                        <input
                            type="text"
                            className="inputBox"
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setusername(e.target.value)}
                        />

                        <button className="btn joinBtn" onClick={handleJoinRoom}>
                            Join
                        </button>

                        <span className="createInfo">
                            No invitation code? Create &nbsp;
                            <a className="createNewBtn" onClick={handleCreateRoom}>
                                New Room
                            </a>
                        </span>
                    </div>
                </div>
                <footer>
                    <h4>
                        Develop By &nbsp;
                        <a href="https://github.com/Sandy712">Sandeep P.</a>
                    </h4>
                </footer>
            </div>
        </div>
    );

}

export default Homepage