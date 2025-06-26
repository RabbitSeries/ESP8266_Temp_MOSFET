import { useEffect, useRef, useState } from 'react'
import './App.css'
import axios from "axios"
import viteLogo from "./assets/vite.svg"
import reactLogo from "./assets/react.svg"
import espressifLogo from "./assets/espressif.svg"
import TemperatureChart from './TemperatureChart.tsx'
interface DataType {
	controller: "TimerController" | "TemperatureController",
	request_type: "get" | "set"
}
interface TimerJson extends DataType {
	controller: "TimerController",
	syncTime?: number,
	startTime?: number,
	duration?: number,
}
interface TemperatureJson extends DataType {
	controller: "TemperatureController",
	lowerTemp?: number,
	upperTemp?: number
}
function App() {
	const refs = {
		timePane: useRef<HTMLDivElement>(null),
		tempPane: useRef<HTMLDivElement>(null),
		selectedPane: useRef<HTMLDivElement>(null),
		stampInterval: useRef<NodeJS.Timeout>(null),
		durationInterval: useRef<NodeJS.Timeout>(null)
	}
	const [statusMessage, setSatusMessage] = useState(`Configured to Temperature Controller (not saved)`)
	const [syncTime, setSyncTime] = useState("")
	const [startTime, setStartTime] = useState("")
	const [duration, setDuration] = useState("")
	const [lowerTemp, setLower] = useState("")
	const [upperTemp, setUpper] = useState("")
	const [intervalStatus, setIntervalStatus] = useState(true)
	const [durationIntervalStatus, setDurationIntervalStatus] = useState(true)
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
	function readCurrentTime(setter: (val: string) => void) {
		const request: TimerJson = {
			controller: 'TimerController',
			request_type: 'get'
		}
		axios.post("/data", request)
			.then(res => {
				setter('currentTime' in res.data ? `currentTime: ${res.data.currentTime}` : "Invaild time")
			})
			.catch(err => setter(`Error reading current temperature: ${err}`))
	}
	async function readCurrentTemperature(setter?: (val: string) => void) {
		const request: TemperatureJson = {
			controller: 'TemperatureController',
			request_type: 'get'
		}
		let response = -127.0
		try {
			const res = await axios.post("/proxy/data", request)
				// const res = await axios.post("/data", request)
				.then(res => res.data)
			setSatusMessage(`Received: ${JSON.stringify(res)}`)
			if (setter) {
				setter('currentTemp' in res ? res.currentTemp : "Invaild temp")
			}
			response = +res.currentTemp
		} catch (err) {
			setSatusMessage(`Error reading current temperature: ${err}`)
		}
		return response
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
		const temp_request: TemperatureJson = {
			controller: 'TemperatureController',
			request_type: 'set',
			lowerTemp: +lowerTemp,
			upperTemp: +upperTemp
		}
		const timer_request: TimerJson = {
			controller: 'TimerController',
			request_type: 'set',
			syncTime: +syncTime.replaceAll(":", ""),
			startTime: +startTime.replaceAll(":", ""),
			duration: +duration.replaceAll(":", "")
		}
		axios.post("/set", data.controller === "TimerController" ? timer_request : temp_request)
			.then(res => setSatusMessage(`Saved with response: ${JSON.stringify(res.data)}`))
			.catch(err => setSatusMessage(`Error submitting value: ${err}`));
	}
	function sendCommand(cmd: string) {
		axios.post("/" + cmd)
			.then(res => setSatusMessage(JSON.stringify(res.data)))
			.catch(err => setSatusMessage(`${err} post: ${"/" + cmd}`));
	}
	useEffect(() => {
		if (intervalStatus) {
			refs.stampInterval.current = setInterval(() => setSyncTime(formatTime(new Date())), 1000);
		}
		if (durationIntervalStatus) {
			refs.durationInterval.current = setInterval(() => {
				const durationDate = new Date()
				setStartTime(formatTime(durationDate))
				durationDate.setHours(6, 0, 0);
				setDuration(formatTime(durationDate))
			}, 1000)
		}
		return () => {
			clearInterval(refs.stampInterval.current ?? undefined);
			refs.stampInterval.current = null;
			clearInterval(refs.durationInterval.current ?? undefined);
			refs.durationInterval.current = null;
		}
	})
	return (
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

			<div className='input-row'>
				<div className="selective">
					<div ref={refs.timePane} className="input-row activatePane deactivate" onClick={e => switchActivate(e.currentTarget)}>
						<div className="input-col">
							<div className="input-row">
								<div>Synchronize time</div>
								<input type="text" title="Seperator ':' is allowed" placeholder="HHMMSS"
									onMouseDown={() => {
										if (intervalStatus) {
											setIntervalStatus(false)
											clearInterval(refs.stampInterval.current ?? undefined)
										}
									}} value={syncTime} onChange={(e) => setSyncTime(e.currentTarget.value)} />
							</div>
							<div className="input-row">
								<div>Start</div>
								<input type="text" title="Seperator ':' is allowed" placeholder="HHMMSS"
									onMouseDown={() => {
										if (setDurationIntervalStatus) {
											setDurationIntervalStatus(false)
											clearInterval(refs.durationInterval.current ?? undefined)
										}
									}} value={startTime} onChange={(e) => { setStartTime(e.currentTarget.value) }} />
								<div>Duration</div>
								<input type="text" title="Seperator ':' is allowed" placeholder="HHMMSS" defaultValue={duration} />
							</div>
						</div>
						<button type="button" onClick={() => {
							submitData({ controller: "TimerController", request_type: "set" });
							readCurrentTime(setSatusMessage)
						}} >Submit</button>
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
									<input type="text" value={val} placeholder="℃" onChange={(e) => setter(e.currentTarget.value)} />
									< button type="button" onClick={() => {
										readCurrentTemperature(setter)
									}}>Use current</button>
								</div>
							))}
							<button type="button" onClick={() => {
								submitData({ controller: "TemperatureController", request_type: "set" })
							}}>Submit</button>
						</div>
					</div>
				</div>
				<TemperatureChart intervalMs={2000} dataToKeep={30} fetchTemperature={async () => {
					return await readCurrentTemperature()
				}}></TemperatureChart>
			</div>
			<div className="status" >{statusMessage}</div>
		</div >
	)
}

export default App