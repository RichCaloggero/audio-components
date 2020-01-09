import {PolymerElement, html} from "./@polymer/polymer/polymer-element.js";
let count = 0;

class Parent extends PolymerElement {
static get is () {return "x-parent";}
static get properties () {return {id: {type: String, value: ${Parent.is}-${count}`;}};
static get template () {return html`<p>{{id}}</p>`;}

connectedCallback () {
super.connectedCallback();

} // class Parent

class Child extends Parent {
static get is () {return "x-child";}
static get properties () {return {id: {type: String, value: ${Child.is}-${count}`;}};
static get template () {return html`<p>{{id}}</p>`;}

} // class Child

