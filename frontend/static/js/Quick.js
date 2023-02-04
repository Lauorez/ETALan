import AbstractView from "./AbstractView.js";
import { getJson, postJson, backend } from "./GlobalFunctions.js";
import { navigateTo } from "./index.js";


export default class extends AbstractView {
    constructor() {
        super();
        this.setTitle("ETALan - Schnellbedienung");
    }

    async getHtml() {
        var container = document.createElement("div")
        container.id = "quick"
        var quicks = await getJson(backend + "/settings/quick")
        quicks.forEach(quick => {
            var btn = document.createElement("button")
            btn.textContent = quick.name
            btn.id = quick.name
            container.appendChild(btn)
        })
        var controlDiv = document.createElement("div")
        controlDiv.className = "childcontainer"
        var addBtn = document.createElement("button")
        addBtn.innerHTML = "<i class=\"fa-solid fa-plus\"></i>"
        addBtn.id = "addBtn"
        addBtn.className = "controlBtn"
        controlDiv.appendChild(addBtn)
        var deleteBtn = document.createElement("button")
        deleteBtn.id = "deleteBtn"
        deleteBtn.className = "controlBtn"
        deleteBtn.innerHTML = "<i class=\"fa-solid fa-trash\"></i>"
        controlDiv.appendChild(deleteBtn)
        return container.outerHTML + controlDiv.outerHTML;
    }

    async register() {
        var quicks = await getJson(backend + "/settings/quick")
        quicks.forEach(quick => {
            document.getElementById(quick.name).onclick = async e => {
                quick.scripts.forEach(async script => {
                    var id = script.id
                    var value = script.value
                    if (script.value.includes("$")) {
                        var first = script.value.indexOf("$")
                        var last = script.value.lastIndexOf("$")
                        var insertId = script.value.substr(first, last).replace("$", "")
                        var getBody = {
                            id: insertId
                        }
                        var req = await getJson(backend + "/var/get", getBody)
                        var moduleValue = req["strValue"]
                        value = parseFloat(eval(script.value.replace(`$${insertId}$`, moduleValue).replace(",", ".")))
                    }
                    var config = await getJson(backend + "/settings/config")
                    var module = config.find(mod => mod.id === id)
                    var scaleFactor = module.scaleFactor
                    var body = {
                        id: id,
                        value: (value * scaleFactor).toString()
                    }
                    var resp = await postJson(backend + "/var/set", body)
                    if (resp.code === 200) alert("Erfolg!"); else alert("Error");
                });
            }
        })
        document.getElementById("addBtn").onclick = e => {
            e.preventDefault()
            navigateTo("/quick/add")
        }
        document.getElementById("deleteBtn").onclick = e => {
            e.preventDefault()
            navigateTo("/quick/delete")
        }
    }
}