import AbstractView from "./AbstractView.js";
import { getJson, postJson, backend } from "./GlobalFunctions.js"
import { navigateTo } from "./index.js";

export default class extends AbstractView {
    constructor() {
        super();
        this.setTitle("ETALan - Schnellbedienung - neu");
    }

    async getHtml() {
        var inputName = document.createElement("input")
        inputName.placeholder = "Name"
        inputName.id = "inputName"
        inputName.className = "input"
        var scriptsDiv = document.createElement("div")
        scriptsDiv.className = "scriptsDiv"
        scriptsDiv.id = "scriptsDiv"
        var scriptLine = await this.newScriptLine()
        scriptsDiv.appendChild(scriptLine)

        var addBtn = document.createElement("button")
        addBtn.innerHTML = "<i class=\"fa-solid fa-plus\"></i>"
        addBtn.id = "addScriptLine"

        scriptsDiv.appendChild(addBtn)

        var btnSave = document.createElement("button")
        btnSave.id = "btnSave"
        btnSave.innerHTML = "Speichern <i class=\"fa-solid fa-check\"></i>"

        return inputName.outerHTML + scriptsDiv.outerHTML + btnSave.outerHTML;
    }

    async newScriptLine() {
        var scriptLine = document.createElement("div")
        scriptLine.className = "scriptLine"
        var scriptModule = await this.newModuleSelector()
        scriptModule.className = "input"
        scriptModule.id = "moduleSelect"
        var scriptModuleLabel = document.createElement("label")
        scriptModuleLabel.textContent = "Modul: "
        scriptModuleLabel.className = "addLabel"
        var modeSelector = document.createElement("select")
        modeSelector.name = "modeSelector"
        modeSelector.className = "input"
        var modeSelectorLabel = document.createElement("label")
        modeSelectorLabel.textContent = "Typ: "
        modeSelectorLabel.className = "addLabel"
        var optionStaticValue = document.createElement("option")
        optionStaticValue.text = "Festwert"
        optionStaticValue.value = "static"
        var optionDynamicValue = document.createElement("option")
        optionDynamicValue.text = "Dynamisch"
        optionDynamicValue.value = "dynamic"
        modeSelector.appendChild(optionDynamicValue)
        modeSelector.appendChild(optionStaticValue)
        modeSelector.selectedIndex = 0
        var inputDiv = document.createElement("div")
        inputDiv.id = "inputDiv"

        
        scriptLine.appendChild(scriptModuleLabel)
        scriptLine.appendChild(scriptModule)
        scriptLine.appendChild(modeSelectorLabel)
        scriptLine.appendChild(modeSelector)
        scriptLine.appendChild(inputDiv)

        return scriptLine
    }

    async newModuleSelector() {
        var scriptModule = document.createElement("select")
        scriptModule.className = "input"
        var config = await getJson(backend + "/settings/config")
        config.forEach(entry => {
            var option = document.createElement("option")
            option.value = entry.id
            option.text = entry.name
            scriptModule.appendChild(option)
        })
        return scriptModule
    }

    async register() {
        document.getElementById("addScriptLine").onclick = async e => {
            document.getElementById(e.target.id).insertAdjacentElement("beforebegin", await this.newScriptLine())
            this.register()
        }
        document.getElementsByName("modeSelector").forEach(elem => {
            elem.onchange = async e => {
                var inputDiv = elem.parentElement.querySelector("#inputDiv")
                inputDiv.innerHTML = ""
                if (elem.value == "static") {
                    var inputBox = document.createElement("input")
                    inputBox.placeholder = "Wert"
                    inputBox.className = "input"
                    inputBox.id = "value"
                    inputDiv.appendChild(inputBox)
                } else {
                    var relativeModuleSelector = await this.newModuleSelector()
                    relativeModuleSelector.id = "relativeModuleSelector"
                    inputDiv.appendChild(relativeModuleSelector)
                    var operationSelector = document.createElement("select")
                    operationSelector.className = "input"
                    operationSelector.id = "operation"
                    var optionAdd = document.createElement("option")
                    var optionDiff = document.createElement("option")
                    var optionMult = document.createElement("option")
                    var optionDiv = document.createElement("option")
                    optionAdd.value = "+"
                    optionAdd.text = "+"
                    optionDiff.value = "-"
                    optionDiff.text = "-"
                    optionMult.value = "*"
                    optionMult.text = "*"
                    optionDiv.value = "/"
                    optionDiv.text = "/"
                    operationSelector.appendChild(optionAdd)
                    operationSelector.appendChild(optionDiff)
                    operationSelector.appendChild(optionMult)
                    operationSelector.appendChild(optionDiv)
                    inputDiv.appendChild(operationSelector)
                    var inputBox = document.createElement("input")
                    inputBox.id = "value"
                    inputBox.placeholder = "Wert"
                    inputBox.className = "input"
                    inputDiv.appendChild(inputBox)
                }
            }
            elem.dispatchEvent(new Event("change"))
        })
        var btnSave = document.getElementById("btnSave")
        btnSave.onclick = async e => {
            var name = document.getElementById("inputName").value
            var scripts = []
            var scriptLines = document.getElementsByClassName("scriptLine")
            for (var i = 0; i < scriptLines.length; i++) {
                var sl = scriptLines[i]
                var id = sl.querySelector("#moduleSelect").value
                var value = sl.querySelector("#value").value
                if (sl.querySelector("#relativeModuleSelector")) {
                    var relativeId = sl.querySelector("#relativeModuleSelector").value
                    var operation = sl.querySelector("#operation").value
                    var relVal = sl.querySelector("#value").value
                    value = `$${relativeId}$${operation}${relVal}`
                }
                scripts.push({
                    id: id,
                    value: value
                })
            }
            var body = {
                name: name,
                scripts: scripts
            }
            var resp = await postJson(backend + "/settings/quick", body)
            if (resp.code == 200) alert("Erfolg!"); else alert("Error!");
            navigateTo("/quick")
        }
    }
}