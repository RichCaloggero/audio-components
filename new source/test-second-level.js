import {module as TestTop, report, statusMessage, waitForChildren} from "./test-top.js";
let instanceCount = 0;

export const module = class TestSecondLevel extends TestTop {
static get is () {return "test-second-level";}

constructor () {
super();
instanceCount += 1;
this.id = `${module.name}-${instanceCount}`;
this.name = module.name;
this.module = module;

//report (this.id, "constructor", moduleName, this.children.length);
} // constructor

connectedCallback () {
super.connectedCallback();
waitForChildren(this, (children) => {
//report (this.id, "connectedCallback", moduleName, this.children.length);
statusMessage(`${this.id} ready: ${children.length} children connected`, "append");
}); // waitForChildren
} // connectedCallback

} // class TestSecondLevel
customElements.define(module.is, module);
