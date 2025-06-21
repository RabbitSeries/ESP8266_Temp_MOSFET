import { useEffect, useRef } from 'react'
import './App.css'
import axios from "axios"
import viteLogo from "./assets/vite.svg"
import reactLogo from "./assets/react.svg"
import espressifLogo from "./assets/espressif.svg"
function sendCommand(StatusMessage: HTMLDivElement, cmd: string) {
	axios.post("/" + cmd)
		.then(res => StatusMessage.textContent = res.data)
		.catch(err => StatusMessage.textContent = `${err} post: ${"/" + cmd}`);
}

interface data {
	type: "Request" | "Post"
}

interface RequestJson extends data {
	type: "Request",
	requestTime: number,
}

interface PostJson extends data {
	type: "Post",
	syncTime: number,
	startTime: number,
	duration: number
}

function submitData(StatusMessage: HTMLDivElement, data: PostJson | RequestJson) {
	axios.post("/set/time", data)
		.then(res => StatusMessage.textContent = res.data)
		.catch(err => StatusMessage.textContent = "Error submitting value" + err);
}

function switchActivate(SelectedPane: HTMLDivElement, TimePane: HTMLDivElement, TemperaturePane: HTMLDivElement, StatusMessage: HTMLDivElement) {
	if (SelectedPane.textContent?.startsWith("Time")) {
		SelectedPane.textContent = "Temperature Controller"
		TimePane.classList.replace("activate", "deactivate")
		TemperaturePane.classList.replace("deactivate", "activate")
	} else {
		SelectedPane.textContent = "Time Controller"
		TemperaturePane.classList.replace("activate", "deactivate")
		TimePane.classList.replace("deactivate", "activate")
	}
	StatusMessage.textContent = "Configured to" + SelectedPane.textContent + " (not saved)"
}
function readCurrentTemperature(replace: HTMLInputElement) {
	const request: RequestJson = {
		type: 'Request',
		requestTime: 0
	}
	axios.post("/get/Temp", request).then(res => replace.textContent = res.data)
}

function App() {
	const TimeStamp = useRef<HTMLInputElement>(null)
	const StartTime = useRef<HTMLInputElement>(null)
	const Duration = useRef<HTMLInputElement>(null)
	const StatusMessage = useRef<HTMLDivElement>(null)
	const TimePane = useRef<HTMLDivElement>(null), TemperaturePane = useRef<HTMLDivElement>(null), SelectedPane = useRef<HTMLDivElement>(null)
	let TimeStampInterval = useRef(0), TimeZoneInterval = useRef(0)
	const lowerBoundTemp = useRef<HTMLInputElement>(null), upperBoundTemp = useRef<HTMLInputElement>(null)
	useEffect(() => {
		TimeStampInterval.current = setInterval(() => {
			const utc_now = new Date(Date.now())
			TimeStamp.current!.value = utc_now.toLocaleString('en-GB', {
				hour: '2-digit',
				minute: '2-digit',
				second: '2-digit',
				hour12: false,
			})
		}, 1000);
		TimeZoneInterval.current = setInterval(() => {
			const durationDate = new Date()
			StartTime.current!.value = durationDate.toLocaleString('en-GB', {
				hour: '2-digit',
				minute: '2-digit',
				second: '2-digit',
				hour12: false,
			})
			durationDate.setHours(6, 0, 0);
			Duration.current!.value = durationDate.toLocaleString('en-GB', {
				hour: '2-digit',
				minute: '2-digit',
				second: '2-digit',
				hour12: false,
			})
		}, 1000);
	}, [TimeStampInterval, TimeZoneInterval, TimeStamp, StartTime, Duration])
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
					<img src={espressifLogo} className="logo espressifL" alt="Espressif logo" />
				</a>
			</div>
			<h2>Vite + React + ESP8266 + TypeScript</h2>

			<h1>Fan Controller</h1>

			<div className="input-row">
				<button onClick={() => sendCommand(StatusMessage.current!, 'on')}>Turn ON</button>
				<button onClick={() => sendCommand(StatusMessage.current!, 'off')}>Turn OFF</button>
			</div>

			<div className="selective">
				<div ref={TimePane} className="activatePane deactivate">
					<div className="input-row">
						<div className="input-col">
							<div className="input-row">
								<div>SynchronizeTime</div>
								<input type="text" ref={TimeStamp} title="Seperator ':' is allowed" placeholder="HHMMSS"
									onClick={() => clearInterval(TimeStampInterval.current)} />
							</div>
							<div className="input-row">
								<div>Start</div>
								<input type="text" ref={StartTime} title="Seperator ':' is allowed" placeholder="HHMM"
									onClick={() => clearInterval(TimeZoneInterval.current)} />
								<div>Duration</div>
								<input type="text" ref={Duration} title="Seperator ':' is allowed" placeholder="HHMM" />

							</div>
						</div>
						<button type="button" onClick={() => submitData(StatusMessage.current!, {
							type: 'Request',
							requestTime: 0
						})}>Submit</button>
					</div>
				</div>

				<div className="button" onClick={() => { switchActivate(SelectedPane.current!, TimePane.current!, TemperaturePane.current!, StatusMessage.current!) }}>
					↑↓
					<div ref={SelectedPane} hidden={true}>Temperature Contoller</div>
				</div>

				<div ref={TemperaturePane} className="activatePane activate">
					<div className="input-row">
						Temperature bounds
					</div>
					<div className="input-row">
						<div className="input-col">
							<div>Lower</div>
							<input type="text" ref={lowerBoundTemp} placeholder="℃" />
							<button type="button" onClick={() => readCurrentTemperature(lowerBoundTemp.current!)}>Use current</button>
						</div>
						<div className="input-col">
							<div>Upper</div>
							<input type="text" ref={upperBoundTemp} placeholder="℃" />
							<button type="button" onClick={() => readCurrentTemperature(upperBoundTemp.current!)}>Use current</button>
						</div>
						<button type="button" onClick={() => submitData(StatusMessage.current!, {
							type: "Request",
							requestTime: 0
						})}>Submit</button>
					</div>
				</div>
			</div>
			<div className="status" ref={StatusMessage}>Configured to Temperature Controller (not saved)</div>
		</div>
	)
}

export default App