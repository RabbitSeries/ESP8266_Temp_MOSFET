import { useEffect, useRef, useState } from 'react'
import './App.css'
import axios from "axios"
import viteLogo from "./assets/vite.svg"
import reactLogo from "./assets/react.svg"
import espressifLogo from "./assets/espressif.svg"

interface DataType {
	dataType: "TimerController" | "TemperatureController",
	requestType: "get" | "set"
}
// interface TimerJson extends DataType {
// 	dataType: "TimerController",
// 	timeStamp?: string | number,
// 	startStamp?: string | number,
// 	duration?: string | number,
// }
interface TemperatureJson extends DataType {
	dataType: "TemperatureController",
	lowerTemp?: string | number,
	upperTemp?: string | number
}
function switchActivate(SelectedPane: HTMLDivElement, TimePane: HTMLDivElement, TemperaturePane: HTMLDivElement, callback: (info: string) => void) {
	if (SelectedPane.textContent?.startsWith("Time")) {
		SelectedPane.textContent = "Temperature Controller"
		TimePane.classList.replace("activate", "deactivate")
		TemperaturePane.classList.replace("deactivate", "activate")
	} else {
		SelectedPane.textContent = "Time Controller"
		TemperaturePane.classList.replace("activate", "deactivate")
		TimePane.classList.replace("deactivate", "activate")
	}
	callback(`Configured to ${SelectedPane.textContent} (not saved)`)
}
function readCurrentTemperature(setter: (val: string) => void) {
	const request: TemperatureJson = {
		dataType: 'TemperatureController',
		requestType: 'get'
	}
	axios.post("/get", request).then(res => setter(res.data.current))
}
function formatTime(date: Date) {
	return date.toLocaleString('en-GB', {
		hour: '2-digit',
		minute: '2-digit',
		second: '2-digit',
		hour12: false,
	})
}
function App() {
	const refs = {
		timePane: useRef<HTMLDivElement>(null),
		tempPane: useRef<HTMLDivElement>(null),
		selectedPane: useRef<HTMLDivElement>(null),
		stampInterval: useRef(0),
		durationInterval: useRef(0)
	}
	const [statusMessage, setSatusMessage] = useState(`Configured to Temperature Controller (not saved)`)
	const [timeStamp, setTimeStamp] = useState("")
	const [startStamp, setStartStamp] = useState("")
	const [duration, setDuration] = useState("")
	const [lowerTemp, setLower] = useState("")
	const [upperTemp, setUpper] = useState("")
	function submitData(data: DataType) {
		axios.post("/set", data.dataType === "TimerController" ?
			Object.assign(data, {
				timeStamp,
				startStamp,
				duration
			}) :
			Object.assign(data, {
				lowerTemp,
				upperTemp
			}))
			.then(res => setSatusMessage(`Saved with response: ${res.data}`))
			.catch(err => setSatusMessage("Error submitting value: " + err));
	}
	function sendCommand(cmd: string) {
		axios.post("/" + cmd)
			.then(res => setSatusMessage(res.data))
			.catch(err => setSatusMessage(`${err} post: ${"/" + cmd}`));
	}
	useEffect(() => {
		refs.stampInterval.current = setInterval(() => setTimeStamp(formatTime(new Date())), 1000);
		refs.durationInterval.current = setInterval(() => {
			const durationDate = new Date()
			setStartStamp(formatTime(durationDate))
			durationDate.setHours(6, 0, 0);
			setDuration(formatTime(durationDate))
		}, 1000)
		return () => {
			clearInterval(refs.stampInterval.current);
			clearInterval(refs.durationInterval.current);
		}
	}, [])
	return (
		<div className="input-col" >
			<div>
				<a href="https://vite.dev" target="_blank">
					<img src={viteLogo} className="logo" alt="Vite logo" />
				</a>
				<a href="https://react.dev" target="_blank">
					<img src={reactLogo} className="logo react" alt="React logo" />
				</a>
				<a href="https://www.espressif.com" target="_blank">
					<img src={espressifLogo} className="logo espressif" alt="Espressif logo" />
				</a>
			</div>
			<h2>Vite + React + ESP8266 + TypeScript</h2>

			<h1>Fan Controller</h1>

			<div className="input-row">
				<button onClick={() => sendCommand('on')}>Turn ON</button>
				<button onClick={() => sendCommand('off')}>Turn OFF</button>
			</div>

			<div className="selective">
				<div ref={refs.timePane} className="input-row activatePane deactivate">
					<div className="input-row">
						<div className="input-col">
							<div className="input-row">
								<div>SynchronizeTime</div>
								<input type="text" title="Seperator ':' is allowed" placeholder="HHMMSS"
									onClick={() => clearInterval(refs.stampInterval.current)} value={timeStamp} />
							</div>
							<div className="input-row">
								<div>Start</div>
								<input type="text" title="Seperator ':' is allowed" placeholder="HHMM"
									onClick={() => clearInterval(refs.durationInterval.current)} value={startStamp} />
								<div>Duration</div>
								<input type="text" title="Seperator ':' is allowed" placeholder="HHMM" value={duration} />
							</div>
						</div>
						<button type="button" onClick={() => submitData({ dataType: "TimerController", requestType: "set" })} className="input-col">Submit</button>
					</div>
				</div>

				<div className="button" onClick={() => { switchActivate(refs.selectedPane.current!, refs.timePane.current!, refs.tempPane.current!, setSatusMessage) }}>
					↑↓
					<div ref={refs.selectedPane} hidden={true}>Temperature Contoller</div>
				</div>

				<div ref={refs.tempPane} className="input-col activatePane activate">
					<div className="input-row">
						Temperature bounds
					</div>
					<div className="input-row">
						{[{ label: 'Lower', val: lowerTemp, setter: setLower }, { label: 'Upper', val: upperTemp, setter: setUpper }].map(({ label, val, setter }, i) => (
							<div className="input-col" key={i}>
								<div>{label}</div>
								<input type="text" value={val} placeholder="℃" />
								<button type="button" onClick={() => {
									readCurrentTemperature(setter)
								}}>Use current</button>
							</div>
						))}
						<button type="button" onClick={() => submitData({ dataType: "TemperatureController", requestType: "set" })}>
							Submit
						</button>
					</div>
				</div>
			</div>
			<div className="status" >{statusMessage}</div>
		</div>
	)
}

export default App