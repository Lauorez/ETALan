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
        var table = document.createElement("table");
        var tbody = document.createElement("tbody");
        var headerRow = document.createElement("tr");
        var Nummer = document.createElement("th");
        Nummer.innerHTML = "Nummer";
        var Art = document.createElement("th");
        Art.innerHTML = "Art";
        var Zeit = document.createElement("th");
        Zeit.innerHTML = "Zeit";
        var Nachricht = document.createElement("th");
        Nachricht.innerHTML = "Nachricht";

        headerRow.appendChild(Nummer);
        headerRow.appendChild(Art);
        headerRow.appendChild(Zeit);
        headerRow.appendChild(Nachricht)

        tbody.appendChild(headerRow);
        errors.forEach(error => {
            error = error['$']
            var row = document.createElement("tr");
            var cell1 = document.createElement("td");
            cell1.textContent = i;
            var cell2 = document.createElement("td");
            cell2.textContent = error['priority'];
            var cell3 = document.createElement("td");
            cell3.textContent = error['time'];
            var cell4 = document.createElement("td");
            cell4.textContent = error['msg'];

            row.appendChild(cell1);
            row.appendChild(cell2);
            row.appendChild(cell3);
            row.appendChild(cell4);

            tbody.appendChild(row);
        })
        table.appendChild(tbody)

        container.appendChild(table)
        return container.outerHTML
    }

    async register() {

    }
}