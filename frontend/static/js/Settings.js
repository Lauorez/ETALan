import AbstractView from "./AbstractView.js";
import { getJson, postJson, backend } from "./GlobalFunctions.js";
import { navigateTo } from "./index.js";

export default class extends AbstractView {
    constructor() {
        super();
        this.setTitle("ETALan - Einstellungen");
    }

    async getHtml() {
        var config = await getJson(backend + "/settings/config");
        var modules = await getJson(backend + "/settings/modules");
        var maincontainer = document.createElement("div");
        maincontainer.className = "container";
        modules.map(module => {
            var container = document.createElement('div');
            container.className = "childcontainer";
            var label = document.createElement('label');
            var cb = document.createElement('input');
            cb.type = "checkbox";
            cb.className = "cbValue";
            cb.id = module.id;
            if (config.some(mod => mod.id === module.id)) cb.setAttribute("checked", "checked");
            label.htmlFor = module.id;
            label.textContent = module.name;
            container.appendChild(cb);
            container.appendChild(label);
            maincontainer.appendChild(container);
        })
        var submitBtn = document.createElement("button");
        submitBtn.innerHTML = "Speichern <i class=\"fa-solid fa-check\"></i>";
        submitBtn.id = "submit";
        maincontainer.appendChild(submitBtn)

        return maincontainer.outerHTML;
    }

    async register() {
        document.getElementById("submit").onclick = async e => {
            var modules = await getJson(backend + "/settings/modules")
            var checked = [];
            var elems = document.querySelectorAll("[type='checkbox']");
            elems.forEach(cb => {
                if (cb.checked) {
                    checked.push(modules.find(mod => mod.id === cb.id))
                }
            })
            var resp = await postJson(backend + "/settings/config", checked)
            if (resp.code === 200) {
                alert("Speichern erfolgreich!");
                navigateTo("/")
            } else {
                alert(resp.json.message)
            }
        }
    }
}