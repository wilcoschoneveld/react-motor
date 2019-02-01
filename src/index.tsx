import React, { useEffect, useLayoutEffect } from "react";

interface IMotorContext<T> {
    state: T;
    navigate: (state: T) => void;
}

interface IMotorOptions<T> {
    stateToPath: (state: T) => string;
    pathToState: (path: string) => T;
}

export const b64encode = (rawString: string) => {
    return window
        .btoa(rawString)
        .replace(/\+/g, "-") // Convert '+' to '-'
        .replace(/\//g, "_") // Convert '/' to '_'
        .replace(/=+$/, ""); // Remove trailing =
};

export const b64decode = (base64: string) => {
    while (base64.length % 4 > 0) {
        base64 += "=";
    }

    base64 = base64
        .replace(/\-/g, "+") // Convert '-' to '+'
        .replace(/\_/g, "/"); // Convert '_' to '/'

    return window.atob(base64);
};

const pathToState = (path: string) => {
    let base64 = path.substr(1);

    const rawString = b64decode(base64);
    const state = JSON.parse(rawString);

    return state;
};

const stateToPath = (state: any) => {
    const rawString = JSON.stringify(state);
    const base64 = b64encode(rawString);

    return `/${base64}`;
};

const shouldNavigate = (event: React.MouseEvent) =>
    !event.defaultPrevented &&
    event.button === 0 &&
    !(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey);

export function createMotor<T>(defaultState: T, options?: IMotorOptions<T>) {
    const motorContext = React.createContext<IMotorContext<T>>({
        state: defaultState,
        navigate: () => null
    });

    const motorOptions = options || {
        pathToState,
        stateToPath
    };

    const MotorProvider: React.FunctionComponent = ({ children }) => {
        const [state, setState] = React.useState<T>(defaultState);

        const syncRoute = () => {
            const path = window.location.pathname;

            if (path === "/") {
                window.history.replaceState(null, "", motorOptions.stateToPath(state));
            } else {
                setState(motorOptions.pathToState(path));
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
            const path = motorOptions.stateToPath(newState);

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

    const Link: React.FunctionComponent<{ to: T }> = ({ to, children }) => {
        const motor = useMotor();
        const href = motorOptions.stateToPath(to);

        const onClick = (event: React.MouseEvent) => {
            if (shouldNavigate(event)) {
                event.preventDefault();
                motor.navigate(to);
            }
        };

        return (
            <a href={href} onClick={onClick}>
                {children}
            </a>
        );
    };

    return { MotorProvider, useMotor, Link };
}
