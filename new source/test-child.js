import {module as TestTop, report, waitForChildren, statusMessage, signalReady} from "./test-top.js";
let instanceCount = 0;

const module = class TestChild extends TestTop {
static get is () {return "test-child";}

constructor () {
super();
instanceCount += 1;
this.id = `${module.name}-${instanceCount}`;
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
