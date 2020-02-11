import {module as TestTop, report, waitForChildren} from "./test-top.js";
const moduleName = "test-second-level";
let instanceCount = 0;

class TestSecondLevel extends TestTop {
static get is () {return "test-second-level";}

constructor () {
super();
instanceCount += 1;
this.id = `${TestSecondLevel.is}-${instanceCount}`;

report (this.id, "constructor", moduleName, this.children.length);
} // constructor

connectedCallback () {
super.connectedCallback();
waitForChildren(this, () => {
report (this.id, "connectedCallback", moduleName, this.children.length);
}); // waitForChildren
} // connectedCallback

} // class TestSecondLevel
customElements.define(TestSecondLevel.is, TestSecondLevel);
