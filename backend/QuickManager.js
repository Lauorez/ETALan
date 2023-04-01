const fs = require("fs");
const path = require("path");

class QuickManager {
    quicks = []
    constructor() {
        this.quicks = this.getSavedQuicks()
    }
    getSavedQuicks() {
        return JSON.parse(fs.readFileSync(path.resolve("settings", "quicks.json")))
    }
    saveQuicks() {
        fs.writeFileSync(path.resolve("settings", "quicks.json"), JSON.stringify(this.quicks))
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
}
module.exports = QuickManager;