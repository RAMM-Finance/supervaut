import React from "react";
import { render } from "react-dom";
import App from "./modules/App";
import * as comps from "@augurproject/comps";
const { windowRef } = comps;
console.log(comps);
windowRef.appStatus = {};
windowRef.data = {};
windowRef.user = {};
windowRef.simplified = {};

render(<App />, document.getElementById("root"));
