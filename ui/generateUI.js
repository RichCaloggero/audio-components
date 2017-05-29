static generateUI (element, template) {
let doc = element.ownerDocument;
let elementName = element.constructor.is;
let properties = element.constructor.properties;

if (! template) {
alert ("generateUI: invalid template given");
return;
} // if

let root = `<div class="${elementName}" role="region" aria-label$="{{label}}">\n`;
for (let name in properties) {
let p = properties[name];
if (p.ui) {
let id = `${element._id}-${name}`;

let field = `<div class="field" data-name="${name}">
<label for="${id}">${p.label || name}</label>
<br><input id=${id} type="${getType(p.type)}" value="\{\{${name}::change\}\}"
min=${p.min || -1.0} max=${p.max || 1.0} step=${p.step || 0.1}>
</div>
`;
//console.log ("html: ", field.outerHTML);

root += field;
} // if

} // for
root += "</div>\n";
template.innerHTML = root;
console.log (`${elementName} template:\n${template.outerHTML}\n`);

function getType (type) {
if (type === Number) return "number";
if (type === Boolean) return "checkbox";

return "text";
} // getType

} // generateUI
