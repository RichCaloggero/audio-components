import {module as TestRoot, report, waitForChildren, statusMessage, signalReady} from "./test-root.js";
let instanceCount = 0;

const module = class TestLeaf extends TestRoot {
static get is () {return "test-leaf";}

constructor () {
super();
instanceCount += 1;
this._id = `${module.name}-${instanceCount}`;
this.name = module.name;
this.module = module;

//report (this.id, "constructor", module.name, this.children.length);
} // constructor

connectedCallback () {
super.connectedCallback();

statusMessage(`${this.id} ready: ${this.children.length} children connected`, "append");
this.isReady = true;
} // connectedCallback

} // class TestChild
customElements.define(module.is, module);
