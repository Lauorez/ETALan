const fs = require("fs");
const path = require("path");
const cron = require("node-cron");

class Scheduler {
    schedules = [];
    constructor() {
        schedules = this.getSavedSchedules();
    } 
    getSavedSchedules() {
        return JSON.parse(fs.readFileSync(path.resolve("settings", "schedules.json")));
    }
    saveSchedules() {
        fs.writeFileSync(path.resolve("settings", "schedules.json"), JSON.stringify(this.schedules))
    }
    addSchedule(name, description = "", cronString, quickCommand) {
        if (this.schedules.find(sched => sched.name == name)) return;
        this.schedules.push({
            name: name,
            description: description,
            cronString: cronString,
            quickCommand: quickCommand
        });
        this.saveSchedules();
    }
    removeSchedule(name) {
        if (!this.schedules.find(sched => sched.name == name)) return;
        delete this.schedules.find(sched => sched.name == name);
        this.saveSchedules();
    }
    scheduleJob(job) {
        cron.schedule(job.cronString, () => {
            job.quickCommand
        });
    }
}
module.exports = Scheduler;