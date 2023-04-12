import fs from 'fs';
import path from 'path';

import SaveManager from "./SaveManager.js";
import VarManager from "./VarManager.js";
import ModulesConfigManager from "./ModulesConfigManager.js";

export default class QuickManager {
    quicks = []
    host;
    constructor(host) {
        this.quicks = this.getSavedQuicks()
        this.host = host;
    }
    getSavedQuicks() {
        return JSON.parse(fs.readFileSync(path.resolve("settings", "quick.json")))
    }
    saveQuicks() {
        fs.writeFileSync(path.resolve("settings", "quick.json"), JSON.stringify(this.quicks))
    }
    addQuick(name, scripts) {
        if (this.quicks.find(q => q.name == name)) return;
        this.quicks.push({
            name: name,
            scripts: scripts
        });
        this.saveQuicks();
    }
    removeQuick(name) {
        if (!this.quicks.find(q => q.name == name)) return;
        delete this.quicks.find(q => q.name == name);
        this.saveQuicks();
    }
    async runQuick(name) {
        var quick = this.quicks.find(q => q.name == name);
        quick.scripts.forEach(async script => {
            var id = script.id
            if (script.action == "save") {
                var sm = new SaveManager(this.host);
                await sm.setSave(id);
            }
            var value = script.value
            if (script.value.includes("$")) {
                var vm = new VarManager(this.host)
                var first = script.value.indexOf("$")
                var last = script.value.lastIndexOf("$")
                var insertId = script.value.substr(first, last).replace("$", "")
                var moduleValue = vm.getVariable(insertId);
                value = parseFloat(eval(script.value.replace(`$${insertId}$`, moduleValue).replace(",", ".")))
            } else if (script.value.includes("%")) {
                var first = script.value.indexOf("%")
                var last = script.value.lastIndexOf("%")
                var insertId = script.value.substr(first, last).replace("%", "")
                var sm = new SaveManager(this.host);
                var moduleValue = sm.getSave(insertId);
                value = parseFloat(eval(script.value.replace(`%${insertId}%`, moduleValue).replace(",", ".")))
            }
            var mcm = new ModulesConfigManager(this.host);
            var config = mcm.getConfig();
            var module = config.find(mod => mod.id === id)
            var scaleFactor = module.scaleFactor
            value = (value * scaleFactor).toString();
            var vm = new VarManager(this.host);
            await vm.setVariable(id, value);
        });

    }
}