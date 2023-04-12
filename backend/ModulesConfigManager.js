import fs from 'fs';
import path from 'path';

export default class ModulesConfigManager {
    host;
    constructor(host) {
        this.host = host;
    }
    getModules() {
        return JSON.parse(fs.readFileSync(path.resolve("settings", "modules.json")))
    }
    getConfig() {
        return JSON.parse(fs.readFileSync(path.resolve("settings", "config.json")))
    }
}