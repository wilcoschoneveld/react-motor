import React, { useEffect, useLayoutEffect } from "react";

interface IMotorContext<T> {
    state: T;
    navigate: (state: T) => void;
}

const pathToJson = (path: string) => {
    let base64 = path.substr(1);

    base64 += Array(5 - (base64.length % 4)).join("=");

    base64 = base64
        .replace(/\-/g, "+") // Convert '-' to '+'
        .replace(/\_/g, "/"); // Convert '_' to '/'

    const rawString = window.atob(base64);

    const state = JSON.parse(rawString);

    return state;
};

const jsonToPath = (state: any) => {
    const rawString = JSON.stringify(state);

    const base64 = window
        .btoa(rawString)
        .replace(/\+/g, "-") // Convert '+' to '-'
        .replace(/\//g, "_") // Convert '/' to '_'
        .replace(/=+$/, "");

    return `/${base64}`;
};

export function createMotor<T>(defaultState: T) {
    const motorContext = React.createContext<IMotorContext<T>>({
        state: defaultState,
        navigate: () => null
    });

    const MotorProvider: React.FunctionComponent = ({ children }) => {
        const [state, setState] = React.useState<T>(defaultState);

        const syncRoute = () => {
            const path = window.location.pathname;

            if (path === "/") {
                window.history.replaceState(null, "", jsonToPath(state));
            } else {
                setState(pathToJson(path));
            }
        };

        useLayoutEffect(() => {
            syncRoute();
        }, []);

        useEffect(() => {
            window.addEventListener("popstate", syncRoute);

            return () => {
                window.removeEventListener("popstate", syncRoute);
            };
        }, []);

        const navigate = (newState: T) => {
            const path = jsonToPath(newState);

            window.history.pushState(null, "", path);
            setState(newState);
        };

        return (
            <motorContext.Provider
                value={{
                    state,
                    navigate
                }}
            >
                {children}
            </motorContext.Provider>
        );
    };

    const useMotor = () => React.useContext(motorContext);

    return { MotorProvider, useMotor };
}
