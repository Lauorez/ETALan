import fs from 'fs';
import path from 'path';

import VarManager from './VarManager.js';

export default class SaveManager {
    
    saves = [];
    host;

    constructor(host) {
        this.saves = this.getSavedSaves()
        this.host = host;
    }

    getSavedSaves() {
        return JSON.parse(fs.readFileSync(path.resolve("settings", "saved.json")))
    }
    saveSaves() {
        fs.writeFileSync(path.resolve("settings", "saved.json"), JSON.stringify(this.saves))
    }
    async setSave(id) {
        var vm = new VarManager(this.host);
        var value = await vm.getVariable(id);
        this.saves[id] = value;
        this.saveSaves();
    }
    getSave(id) {
        return saves[id];
    }
}