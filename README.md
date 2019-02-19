# react-motor 🏍

## Introduction

A React router for navigation between arbitrary states. You create a motor with a custom state-to-path encoder/decoder and use it to imperatively navigate around your application.

* URL encoding/decoding logic is defined in a single location
* Features a (declarative) Link component with browser features
* Supports major browsers including IE11
* Written in TypeScript (type definitions are included in package)
* Requires React 16.8 or higher with Hooks support
* Light weight and zero dependencies 

## Installation

* NPM: `npm install react-motor`
* Yarn: `yarn add react-motor`

## Usage

```javascript
// Define an arbitrary state shape
const defaultState = { page: "home" };

// Define custom path encoding/decoding (e.g. json+base64)
const options = {
  stateToPath: state => b64encode(JSON.stringify(state)),
  pathToState: path => {
    if (path === "") {
      throw new RedirectMotor(defaultState);
    }

    try {
      return JSON.parse(b64decode(path));
    } catch (err) {
      return undefined;
    }
  }
};

// Create motor objects
const { MotorProvider, useMotor, Link } = createMotor(defaultState, options);
```

```javascript
// Wrap your app with the MotorProvider
function App() {
  return (
    <MotorProvider>
      <AppContent />
    </MotorProvider>
  );
}
```

TODO: useMotor and Link

## Examples

* [Simple routing example](https://codesandbox.io/s/rloy1jxlmp)
* Advanced typescript example (TODO)

## API

TODO