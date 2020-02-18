import {module as TestRoot, report, statusMessage, waitForChildren} from "./test-root.js";
let instanceCount = 0;

export const module = class TestBranch extends TestRoot {
static get is () {return "test-branch";}

constructor () {
super();
instanceCount += 1;
this._id = `${module.name}-${instanceCount}`;
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
