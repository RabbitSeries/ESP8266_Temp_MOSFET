import { useEffect, useRef, useState } from "react"
import {
    LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer
} from "recharts"
import "./App.css"
type TemperatureInfo = {
    time: string
    temp: number
};

type TemperatureChartProps = {
    fetchTemperature: () => Promise<number>
    intervalMs?: number
    dataToKeep?: number
};

export default function TemperatureChart({
    fetchTemperature,
    intervalMs = 1000,
    dataToKeep = 50
}: TemperatureChartProps) {
    const [data, setData] = useState<TemperatureInfo[]>([])
    const [syncing, setSyncing] = useState(true)
    const intervalRef = useRef<NodeJS.Timeout | null>(null)

    const updateTemperature = async () => {
        const temp = await fetchTemperature()
        const time = new Date().toLocaleTimeString()
        setData((prev) => [...prev.slice(-(dataToKeep - 1)), { time, temp }])
    }

    useEffect(() => {
        if (syncing) {
            updateTemperature(); // fetch immediately
            intervalRef.current = setInterval(updateTemperature, intervalMs)
        } else if (intervalRef.current) {
            clearInterval(intervalRef.current)
        }
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current)
        };
    })

    return (
        <div className="input-col">
            <div style={{ fontWeight: "bold" }}>Real-time Temperature</div>
            <ResponsiveContainer width={400} height={300} >
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="4 5" />
                    <XAxis dataKey="time" tick={{ fontSize: 12 }} />
                    <YAxis domain={["auto", "auto"]} />
                    <Tooltip />
                    <Line type="step" dataKey="temp" stroke="#8884d8" dot={false} />
                </LineChart>
            </ResponsiveContainer>
            <button onClick={() => setSyncing(!syncing)}>
                {syncing ? "Stop Sync" : "Start Sync"}
            </button>
        </div>
    );
}
