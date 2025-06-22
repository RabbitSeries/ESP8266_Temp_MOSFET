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
	function switchActivate(switchTo?: HTMLDivElement) {
		const SelectedPane = refs.selectedPane.current!, TimePane = refs.timePane.current!, TemperaturePane = refs.tempPane.current!
		let switchRes: string | null = null
		if (switchTo === TemperaturePane || (switchTo === undefined && SelectedPane.textContent!.startsWith("Time"))) {
			switchRes = SelectedPane.textContent = "Temperature Controller"
			TimePane.classList.replace("activate", "deactivate")
			TemperaturePane.classList.replace("deactivate", "activate")
		} else if (switchTo === TimePane || (switchTo === undefined && SelectedPane.textContent!.startsWith("Temp"))) {
			switchRes = SelectedPane.textContent = "Time Controller"
			TemperaturePane.classList.replace("activate", "deactivate")
			TimePane.classList.replace("deactivate", "activate")
		}
		setSatusMessage(`${switchRes ? `Configured to ${switchRes}` : "Invaild"} (not saved)`)
	}
	function readCurrentTemperature(setter: (val: string) => void) {
		const request: TemperatureJson = {
			dataType: 'TemperatureController',
			requestType: 'get'
		}
		axios.post("/get", request)
			.then(res => setter(res.data.current))
			.catch(err => setSatusMessage(`Error reading current temperature: ${err}`))
	}
	function formatTime(date: Date) {
		return date.toLocaleString('en-GB', {
			hour: '2-digit',
			minute: '2-digit',
			second: '2-digit',
			hour12: false,
		})
	}
	function submitData(data: DataType) {
		axios.post("/set", data.dataType === "TimerController" ?
			Object.assign(data, {
				timeStamp: timeStamp.replaceAll(":", ""),
				startStamp: startStamp.replaceAll(":", ""),
				duration: duration.replaceAll(":", "")
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
	})
	return (
		<>
			<div className="input-col" >
				<div className='input-row'>
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
				<h2 className="input-row">Vite + React + ESP8266 + TypeScript</h2>

				<h1 className="input-row">Fan Controller</h1>

				<div className="input-row">
					<button onClick={() => sendCommand('on')}>Turn ON</button>
					<button onClick={() => sendCommand('off')}>Turn OFF</button>
				</div>

				<div className="selective">
					<div ref={refs.timePane} className="input-row activatePane deactivate" onClick={e => switchActivate(e.currentTarget)}>
						<div className="input-col">
							<div className="input-row">
								<div>Synchronize time</div>
								<input type="text" title="Seperator ':' is allowed" placeholder="HHMMSS"
									onMouseDown={() => clearInterval(refs.stampInterval.current)} defaultValue={timeStamp} />
							</div>
							<div className="input-row">
								<div>Start</div>
								<input type="text" title="Seperator ':' is allowed" placeholder="HHMM"
									onMouseDown={() => clearInterval(refs.durationInterval.current)} defaultValue={startStamp} />
								<div>Duration</div>
								<input type="text" title="Seperator ':' is allowed" placeholder="HHMM" defaultValue={duration} />
							</div>
						</div>
						<button type="button" onClick={() => submitData({ dataType: "TimerController", requestType: "set" })} >Submit</button>
					</div>

					<div className="button" onClick={() => switchActivate()}>
						↑↓
						<div ref={refs.selectedPane} hidden={true}>Temperature Contoller</div>
					</div>

					<div ref={refs.tempPane} className="input-col activatePane activate" onClick={e => switchActivate(e.currentTarget)}>
						<div className="input-row">
							Temperature bounds
						</div>
						<div className="input-row">
							{[{ label: 'Lower', val: lowerTemp, setter: setLower }, { label: 'Upper', val: upperTemp, setter: setUpper }].map(({ label, val, setter }, i) => (
								<div className="input-col" key={i}>
									<div>{label}</div>
									<input type="text" defaultValue={val} placeholder="℃" />
									<button type="button" onClick={() => {
										readCurrentTemperature(setter)
									}}>Use current</button>
								</div>
							))}
							<button type="button" onClick={() => {
								submitData({ dataType: "TemperatureController", requestType: "set" })
							}}>Submit</button>
						</div>
					</div>
				</div>
				<div className="status" >{statusMessage}</div>
			</div>
		</>
	)
}

export default App