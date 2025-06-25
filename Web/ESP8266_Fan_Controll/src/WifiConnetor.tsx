import { useState } from "react"
import "./App.css"
import axios from "axios"
export default function WifiConnector() {
    const [SSID, setSSID] = useState(""), [Password, setPassword] = useState("")
    function submitWifiInfo(data: { ssid?: string, password?: string }) {
        axios.post("/connection", data).then(res => res.data)
            .then(JSON.stringify)
            .then(console.log)
            .catch(console.log)
    }
    return (
        <div style={{ position: "absolute", left: "100%", transform: "translateX(-100%)" }}>
            <div className="input-col">
                <div className="input-row">
                    <div className="input-col">
                        <label>SSID</label>
                        <input type="text" value={SSID} onChange={(e) => setSSID(e.currentTarget.value)}></input>
                        <button type="button" onClick={() => submitWifiInfo({
                            ssid: SSID,
                            password: Password
                        })}>Connect</button>
                    </div>
                    <div className="input-col">
                        <label>Password</label>
                        <input type="password" value={Password} onChange={(e) => setPassword(e.currentTarget.value)}></input>
                        <button type="button" onClick={() => submitWifiInfo({})}>Log</button>
                    </div>
                </div>
            </div>
        </div>
    )
}