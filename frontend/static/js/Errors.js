import AbstractView from "./AbstractView.js";
import { getJson, backend } from "./GlobalFunctions.js";

export default class extends AbstractView {
    constructor() {
        super();
        this.setTitle("ETALan - Fehler");
    }

    async getHtml() {
        var container = document.createElement("div")
        container.className = "container"
        var errors = await getJson(backend + "/errors")
        if (errors.length <= 0) {
            var text = document.createElement("span")
            text.textContent = "Keine Fehler im System."
            container.appendChild(text)
        }
        var i = 1
        errors.forEach(error => {
            var childcontainer = document.createElement("div")
            childcontainer.className = "childcontainer"
            var text = document.createElement("span")
            text.textContent = `Fehler Nummer ${i}`
            var content = document.createElement("textarea")
            content.textContent = JSON.stringify(error)
            childcontainer.appendChild(text)
            childcontainer.appendChild(content)
            container.appendChild(childcontainer)
        })
        return container.outerHTML
    }

    async register() {

    }
}