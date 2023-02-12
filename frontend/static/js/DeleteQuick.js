import AbstractView from "./AbstractView.js"
import { getJson, postJson, backend } from "./GlobalFunctions.js";
import { navigateTo } from "./index.js";

export default class extends AbstractView {
    constructor() {
        super()
        this.setTitle("ETALan - Schnellbedienung - löschen");
    }
    
    async getHtml() {
        var container = document.createElement("div")
        container.className = "container"
        var quicks = await getJson(backend + "/settings/quick")
        quicks.forEach(quick => {
            var name = quick.name
            var checkbox = document.createElement("input")
            checkbox.type = "checkbox"
            checkbox.value = name
            checkbox.id = name
            var labelName = document.createElement("label")
            labelName.textContent = name
            labelName.htmlFor = name
            var childcontainer = document.createElement("div")
            childcontainer.className = "childcontainer"
            childcontainer.appendChild(checkbox)
            childcontainer.appendChild(labelName)
            container.appendChild(childcontainer)
        });
        var deleteBtn = document.createElement("button")
        deleteBtn.innerHTML = "Löschen <i class=\"fa-solid fa-trash\"></i>"
        deleteBtn.id = "deleteBtn"
        container.appendChild(deleteBtn)
        return container.outerHTML
    }

    async register() {
        document.getElementById("deleteBtn").onclick = async e => {
            var checked = [];
            var elems = document.querySelectorAll("[type='checkbox']");
            elems.forEach(cb => {
                if (cb.checked) {
                    checked.push(cb.id)
                }
            })
            var resp = await postJson(backend + "/settings/quick/delete", checked)
            if (resp.code === 200) navigateTo("/quick"); else alert(resp.json.message);
        }
    }
}