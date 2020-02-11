import {module as TestTop, report, signalReady} from "./test-top.js";
let instanceCount = 0;

const module = class TestChild extends TestTop {
static get is () {return "test-child";}

constructor () {
super();
instanceCount += 1;
this.id = `${module.is}-${instanceCount}`;

report (this.id, "constructor", module.name, this.children.length);
} // constructor

connectedCallback () {
super.connectedCallback();

report (this.id, "connectedCallback", module.name, this.children.length);
signalReady(this);
} // connectedCallback

} // class TestChild
customElements.define(module.is, module);
