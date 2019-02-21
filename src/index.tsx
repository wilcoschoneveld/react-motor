import React, { useEffect, useLayoutEffect } from "react";

interface IMotorContext<T> {
    state: T;
    navigate: (state: T, replace?: boolean) => void;
}

interface IMotorOptions<T> {
    stateToPath: (state: T) => string;
    pathToState: (path: string) => T;
}

export class RedirectMotor<T> {
    readonly state: T;

    constructor(to: T) {
        this.state = to;
    }
}

const shouldNavigate = (event: React.MouseEvent) =>
    !event.defaultPrevented &&
    event.button === 0 &&
    !(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey);


export function createMotor<T>(defaultState: T, options: IMotorOptions<T>) {
    const motorContext = React.createContext<IMotorContext<T>>({
        state: defaultState,
        navigate: () => null
    });

    const MotorProvider: React.FunctionComponent = ({ children }) => {
        const [state, setState] = React.useState<T>(defaultState);

        const navigate = (newState: T, replace = false) => {
            const path = "/" + options.stateToPath(newState);

            if (replace) {
                window.history.replaceState(null, "", path);
            } else {
                window.history.pushState(null, "", path);
            }
            setState(newState);
        };

        const syncRoute = () => {
            const path = window.location.pathname.substr(1);

            try {
                const newState = options.pathToState(path);

                setState(newState);
            } catch (error) {
                if (error instanceof RedirectMotor) {
                    // Redirect to provided state
                    navigate(error.state, true);
                } else {
                    // Rethrow uncaught error
                    throw error;
                }
            }
        };

        useLayoutEffect(() => {
            // Sync route on mounting of component
            syncRoute();
        }, []);

        useEffect(() => {
            window.addEventListener("popstate", syncRoute);

            return () => {
                window.removeEventListener("popstate", syncRoute);
            };
        }, []);

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

    const Link: React.FunctionComponent<{ to: T; onClick?: (event: React.MouseEvent) => void }> = ({ to, onClick, children }) => {
        const motor = useMotor();
        const href = options.stateToPath(to);

        const onClickAnchor = (event: React.MouseEvent) => {
            if (shouldNavigate(event)) {
                event.preventDefault();

                if (onClick) {
                    onClick(event);
                } else {
                    motor.navigate(to);
                }
            }
        };

        return (
            <a href={href} onClick={onClickAnchor}>
                {children}
            </a>
        );
    };

    return { MotorProvider, useMotor, Link };
}


/** Utils */

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
