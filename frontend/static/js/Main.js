import AbstractView from "./AbstractView.js";
import { getJson, postJson, backend } from "./GlobalFunctions.js";
import { router } from "./index.js";

var ids = []

export default class extends AbstractView {
    constructor() {
        super();
        this.setTitle("ETALan");
    }

    async getHtml() {
        var config = await getJson(backend + "/settings/config")
        var table = document.createElement("table");
        var tbody = document.createElement("tbody");
        var headerRow = document.createElement("tr");
        var Modul = document.createElement("th");
        Modul.innerHTML = "<i class=\"fa-solid fa-dice-d6\"></i> Modul";
        var Wert = document.createElement("th");
        Wert.innerHTML = "<i class=\"fa-solid fa-hashtag\"></i> Wert";
        var Aendern = document.createElement("th");
        Aendern.innerHTML = "<i class=\"fa-solid fa-bolt\"></i> Aktionen";

        headerRow.appendChild(Modul);
        headerRow.appendChild(Wert);
        headerRow.appendChild(Aendern);

        tbody.appendChild(headerRow);

        for (var i = 0; i < config.length; i++) {
            var entry = config[i];

            var id = entry["id"];
            var name = entry["name"];
            var unit = entry["unit"];

            var body = {
                id: id
            }
            var value = await getJson(backend + "/var/get", body);
            value = value["strValue"]
            var row = document.createElement("tr");
            var cell1 = document.createElement("td");
            cell1.textContent = name;
            var cell2 = document.createElement("td");
            cell2.textContent = value + unit;
            var cell3 = document.createElement("td");
            var btn = document.createElement("button");
            btn.innerHTML = "<i class=\"fa-solid fa-pen\"></i>";
            btn.className = "btn-table";
            btn.id = id;
            ids.push(id)
            
            cell3.appendChild(btn);
            

            row.appendChild(cell1);
            row.appendChild(cell2);
            row.appendChild(cell3);

            tbody.appendChild(row)

        }
        
        table.appendChild(tbody)

        return `${table.outerHTML}`;
    }

    async register() {
        for (var i in ids) {
            document.getElementById(`${ids[i]}`).onclick = async e => {
                var config = await getJson(backend + "/settings/config")
                var configMatch = config.find(mod => mod.id === e.target.id)
                var scaleFactor = configMatch.scaleFactor
                var newValue = prompt("Neuer Wert: ");
                var body = {
                    id: e.target.id,
                    value: newValue * scaleFactor
                }
                var resp = await postJson(backend + "/var/set", body)
                if (resp.code != 200) alert(resp.json.message)
                router()
            }
        }
        
    }
}