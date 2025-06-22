import { type ReactNode } from "react";
import "./FullPage.css"
export default function FullPage({ children }: { children?: ReactNode }) {
    return (
        <div className="justify_row">
            <div></div>
            <div className="justify_col">
                <div></div>
                {children}
                <div></div>
            </div>
            <div></div>
        </div>
    )
}