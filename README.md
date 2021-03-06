# react-motor 🏍

A React router for navigation between arbitrary states. You create a motor with a custom state-to-path encoder/decoder and use it to navigate around your application.

## Contents

- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Example](#example)
- [More Examples](#more-examples)

## Features

* Synchronizes state with browser URL through the browser history
* Custom URL encoding/decoding logic defined in a single location
* Navigate to desired state with the `navigate` function
* Features a declarative `Link` component (`<a>` with `href`)
* Supports major browsers including IE11
* Written in **TypeScript** (type definitions included)
* Requires React 16.8 or higher with Hooks and Context API
* Functional, lightweight and zero dependencies

## Installation

* NPM: `npm install react-motor`
* Yarn: `yarn add react-motor`

## Usage

1. Call `createMotor` to build a motor with your `stateToPath` and `pathToState` functions.
2. Wrap your application with the returned `MotorProvider`.
3. Use the `useMotor` hook when you want to inspect state or navigate imperatively.
4. Render the `Link` component when you want to navigate declaratively.

## Example

This example shows how to use motor to encode javascript objects into base64 url.

- State: `{ page: "post", id: 124 }`
- Resulting url: `http://yourapp/eyJwYWdlIjoicG9zdCIsImlkIjoxMjR9`

Start with creating a motor with a json and base64 encoder:

```javascript
import { createMotor, RedirectMotor, b64encode, b64decode } from "react-motor";

// Define an arbitrary state shape
const defaultState = { page: "home" };

// Define custom path encoding/decoding (e.g. json+base64)
const options = {
  stateToPath: state => b64encode(JSON.stringify(state)),
  pathToState: path => {
    if (path === "") {
      // Redirect to home on root url
      throw new RedirectMotor(defaultState);
    }

    try {
      return JSON.parse(b64decode(path));
    } catch (err) {
      return { page: "error" };
    }
  }
};

// Create motor objects
const { MotorProvider, useMotor, Link } = createMotor(defaultState, options);
```

Wrap your app contents with the MotorProvider:
```javascript
import React from "react";

function App() {
  return (
    <MotorProvider>
      <AppContent />
    </MotorProvider>
  );
}
```

Use useMotor hook or Link component anywhere:
```javascript
function Tabs() {
  const { state, navigate } = useMotor();

  const className = active => (active ? "tab active" : "tab");

  return (
    <div className="tabs">
      <div
        onClick={() => navigate({ page: "home" })}
        className={className(state.page === "home")}
        style={{ cursor: "pointer" }}
      >
        Home
      </div>

      <Link to={{ page: "library" }}>
        <div className={className(state.page === "library")}>Library</div>
      </Link>
    </div>
  );
}
```

## More Examples

* [Flat routing](https://codesandbox.io/s/rloy1jxlmp)
* [Base64 encoding](https://codesandbox.io/s/015y8non70)
* [Advanced routing and validation with typescript](https://codesandbox.io/s/r0ljzqqp8n)
