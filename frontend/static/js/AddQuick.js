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

        var actionLabel = document.createElement("label")
        actionLabel.textContent = "Aktion: "
        actionLabel.className = "addLabel"
        var actionSelector = document.createElement("select")
        actionSelector.name = "actionSelector"
        actionSelector.id = "actionSelector"
        actionSelector.className = "input"
        var saveValueOption = document.createElement("option")
        saveValueOption.value = "save"
        saveValueOption.text = "Wert speichern"
        var moduleOption = document.createElement("option")
        moduleOption.value = "module"
        moduleOption.text = "Modul"
        actionSelector.appendChild(moduleOption)
        actionSelector.appendChild(saveValueOption)
        var content = await this.moduleContent()

        scriptLine.appendChild(actionLabel)
        scriptLine.appendChild(actionSelector)
        scriptLine.appendChild(content)

        return scriptLine
    }

    async moduleContent() {
        var moduleContent = document.createElement("div")
        moduleContent.className = "scriptLineContent"
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
        var inputDiv = document.createElement("div")
        inputDiv.id = "inputDiv"

        moduleContent.appendChild(scriptModuleLabel)
        moduleContent.appendChild(scriptModule)
        moduleContent.appendChild(modeSelectorLabel)
        moduleContent.appendChild(modeSelector)
        moduleContent.appendChild(inputDiv)

        return moduleContent
    }

    async saveContent() {
        var saveContent = document.createElement("div")
        saveContent.className = "scriptLineContent"
        var scriptModule = await this.newModuleSelector()
        scriptModule.className = "input"
        scriptModule.id = "moduleSelect"
        var scriptModuleLabel = document.createElement("label")
        scriptModuleLabel.textContent = "Modul: "
        scriptModuleLabel.className = "addLabel"

        saveContent.appendChild(scriptModuleLabel)
        saveContent.appendChild(scriptModule)

        return saveContent
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

    async dynamicInputDiv() {
        var inputDiv = document.createElement("div")
        var relativeModuleSelector = await this.newModuleSelector()
        relativeModuleSelector.id = "relativeModuleSelector"
        inputDiv.appendChild(relativeModuleSelector)
        var relativeModuleType = document.createElement("select")
        relativeModuleType.className = "input"
        relativeModuleType.id = "relativeModuleType"
        var optionNow = document.createElement("option")
        var optionSaved = document.createElement("option")
        optionNow.value = "now"
        optionNow.text = "aktuell"
        optionSaved.value = "saved"
        optionSaved.text = "gespeichert"
        relativeModuleType.appendChild(optionNow)
        relativeModuleType.appendChild(optionSaved)
        inputDiv.appendChild(relativeModuleType)
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

        return inputDiv
    }

    async modeSelectorEvent(elem) {
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
                inputDiv.innerHTML = (await this.dynamicInputDiv()).innerHTML
            }
        }
    }

    async register() {
        document.getElementsByName("actionSelector").forEach(elem => {
            elem.onchange = async e => {
                if (elem.value == "module") {
                    var content = elem.parentElement.querySelector(".scriptLineContent")
                    content.innerHTML = (await this.moduleContent()).innerHTML
                    document.getElementsByName("modeSelector").forEach(elem => {
                        this.modeSelectorEvent(elem)
                        elem.dispatchEvent(new Event("change"))
                    })
                } else {
                    var content = elem.parentElement.querySelector(".scriptLineContent")
                    content.innerHTML = (await this.saveContent()).innerHTML
                }
            }
        })
        document.getElementById("addScriptLine").onclick = async e => {
            document.getElementById(e.target.id).insertAdjacentElement("beforebegin", await this.newScriptLine())
            this.register()
        }
        document.getElementsByName("modeSelector").forEach(elem => {
            this.modeSelectorEvent(elem)
            elem.dispatchEvent(new Event("change"))
        })
        var btnSave = document.getElementById("btnSave")
        btnSave.onclick = async e => {
            var name = document.getElementById("inputName").value
            var scripts = []
            var scriptLines = document.getElementsByClassName("scriptLine")
            for (var i = 0; i < scriptLines.length; i++) {
                var sl = scriptLines[i]
                var action = sl.querySelector("#actionSelector").value
                if (action == "save") {
                    var moduleId = sl.querySelector("#moduleSelect").value
                    scripts.push({
                        action: action,
                        id: moduleId
                    })
                    continue
                }
                var id = sl.querySelector("#moduleSelect").value
                var value = sl.querySelector("#value").value
                if (sl.querySelector("#relativeModuleSelector")) {
                    var relativeId = sl.querySelector("#relativeModuleSelector").value
                    var operation = sl.querySelector("#operation").value
                    var relVal = sl.querySelector("#value").value
                    value = `$${relativeId}$${operation}${relVal}`
                    var relativeModuleType = sl.querySelector("#relativeModuleType")
                    if (relativeModuleType.value == "saved") {
                        value = value.replaceAll("$", "%")
                    }
                }
                scripts.push({
                    action: action,
                    id: id,
                    value: value
                })
            }
            var body = {
                name: name,
                scripts: scripts
            }
            var resp = await postJson(backend + "/settings/quick", body)
            if (resp.code == 200) navigateTo("/quick"); else alert("Error!")
        }
    }
}