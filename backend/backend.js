import { resolve } from 'path';
import { get, request } from 'http';
import express from 'express';
import cors from 'cors';
import { Parser } from 'xml2js';
import { readFileSync, writeFile, writeFileSync } from 'fs';
import { logger } from 'express-winston';
import { transports as _transports, format as _format } from 'winston';
import { getTasks, schedule } from "node-cron";
import dotenv from 'dotenv';

dotenv.config();

import ModulesConfigManager from './ModulesConfigManager.js';
import VarManager from './VarManager.js';
import QuickManager from './QuickManager.js';


const app = express()
const parser = new Parser();

const port = process.env.PORT
const PREFIX = "[ETALan]"
const version = "1.0.0"
const host = process.env.HOST

app.use(express.static('settings'))
app.use(express.json())
app.use(cors())
app.use(logger({
    transports: [
        new _transports.Console(),
        new _transports.File({ filename: "logs/latest.log" })
    ],
    format: _format.combine(
        _format.colorize(),
        _format.json()
    ),
    meta: false,
    msg: "HTTP  ",
    expressFormat: true,
    colorize: false,
    ignoreRoute: function (req, res) { return false; }
}))

//#region Functions

function myXOR(a, b) {
    return (a || b) && !(a && b);
}

function getVariable(uid, callback) {
    get(`http://${host}:8080/user/var` + uid, (resp) => {
        resp.setEncoding("utf-8")
        var data = ''
        resp.on('data', (chunk) => {
            data += chunk
        })
        resp.on('end', () => {
            callback(data)
        })
    }).on("error", (err) => {
        console.log("Error: " + err.message)
    })
}

function setVariable(uid, value, callback) {
    var options = {
        hostname: host,
        port: 8080,
        path: '/user/var' + uid,
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
    };
    var req = request(options, (resp) => {
        resp.setEncoding("utf-8")
        var data = ''
        resp.on('data', (chunk) => {
            data += chunk
        })
        resp.on('end', () => {
            callback(data)
        })
    }).on("error", (err) => {
        console.log("Error: " + err.message)
    })
    req.write("value=" + value, (error) => {
        if (myXOR(error != null, error != undefined)) console.log(error)
        req.end()
    })
}

function getErrors(callback) {
    get(`http://${host}:8080/user/errors`, (resp) => {
        resp.setEncoding("utf-8")
        var data = ''
        resp.on('data', (chunk) => {
            data += chunk
        })
        resp.on('end', () => {
            callback(data)
        })
    }).on("error", (err) => {
        console.log("Error: " + err.message)
    })
}

//SCHEDULE HANDLING

function getSchedules() {
    var schedules = JSON.parse(readFileSync(resolve("settings", "schedules.json")))
    
}

//#endregion

//#region GET

app.get('/api', (req, res) => {
    res.charset = "utf-8"
    res.set({'Content-Type': 'application/json; charset=utf-8'})
    var api = {
        version: version
    }
    res.send(api)
})

app.get('/settings/modules', (req, res) => {
    res.charset = "utf-8"
    res.set({'Content-Type': 'application/json; charset=utf-8'})
    var mcm = new ModulesConfigManager(host);
    res.send(mcm.getModules());
})

app.get('/settings/config', (req, res) => {
    res.charset = "utf-8"
    res.set({'Content-Type': 'application/json; charset=utf-8'})
    var mcm = new ModulesConfigManager(host);
    res.send(mcm.getConfig())
})

app.get('/settings/quick', (req, res) => {
    res.charset = "utf-8"
    res.set({'Content-Type': 'application/json; charset=utf-8'})
    var qm = new QuickManager(host);
    res.send(qm.getSavedQuicks());
})

app.get('/var/get', async (req, res) => {
    var id = req.query.id
    var vm = new VarManager(host);
    var data = await vm.getVariable(id);
    // TODO: parser in varmanager & dementsprechende anpassungen, /var/save bearbeiten bzw get post löschen
    res.send(data);
})

app.get("/var/save", (req, res) => {
    var id = req.query.id
    var saved = JSON.parse(readFileSync(resolve("settings", "saved.json")).toString())
    if (saved[id]) {
        res.status(200)
        res.send({
            value: saved[id]
        })
    } else {
        res.status(500)
        res.end()
    }
})

app.get("/errors", (req, res) => {
    getErrors(data => {
        parser.parseString(data, (err, result) => {
            if (err != null) console.log(err)
            try {
                let json = result['eta']['errors'][0]['fub']
                let errors = []
                json.forEach(fub => {
                    if (!fub['error']) return;
                    fub['error'].forEach(err => {
                        errors.push(err)
                    })
                })
                res.charset = "utf-8"
                res.set({'Content-Type': 'application/json; charset=utf-8'})
                res.status(200)
                res.write(JSON.stringify(errors))
                res.end()
            } catch (ex) {
                console.log(ex)
            }
        })
    })
})

app.get("/schedules", (req, res) => {
    // var tasks = cron.getTasks();
    // tasks.forEach((value, key) => {
        
    // })
    console.log(getTasks())
    var task = schedule("0 * * * *", () => {
        console.log("test");
    }, {
        timezone: "Europe/Berlin"
    });
    console.log(JSON.stringify(task))
    
})

//#endregion

//#region POST

const successAnswer = {
    message: "Success!"
}

app.post("/settings/config", (req, res) => {
    try {
        var jsobj = req.body;
        if (jsobj == null || jsobj == undefined) return;
        var strValue = JSON.stringify(jsobj);
        writeFile("settings/config.json", strValue, () => {
            res.charset = "utf-8"
            res.set({'Content-Type': 'application/json; charset=utf-8'})
            res.status(200);
            res.write(JSON.stringify(successAnswer));
            res.end();
            console.log("Successfully set value and sent answer.")
        });
    } catch (ex) {
        console.log(ex);
        res.status(500);
        res.end();
    }
})

app.post("/settings/quick", (req, res) => {
    var name = req.body.name
    var scripts = req.body.scripts

    var quicks = JSON.parse(readFileSync(resolve("settings", "quick.json")))
    quicks.push({
        name: name,
        scripts: scripts
    })
    writeFile(resolve("settings", "quick.json"), JSON.stringify(quicks), () => {
        res.charset = "utf-8"
        res.set({'Content-Type': 'application/json; charset=utf-8'})
        res.status(200)
        res.write(JSON.stringify(successAnswer))
        res.end()
    })
})

app.post("/settings/quick/delete", (req, res) => {
    var toRemove = req.body
    var quicks = JSON.parse(readFileSync(resolve("settings", "quick.json")))
    toRemove.forEach(element => {
        var match = quicks.find(quick => quick.name == element)
        var index = quicks.indexOf(match)
        quicks.splice(index, 1)
    });
    writeFile(resolve("settings", "quick.json"), JSON.stringify(quicks), () => {
        res.charset = "utf-8"
        res.set({'Content-Type': 'application/json; charset=utf-8'})
        res.status(200)
        res.write(JSON.stringify(successAnswer))
        res.end()
    })
})

app.post("/quick/run", (req, res) => {
    var name = req.body.name;
    var qm = new QuickManager(host);
    qm.runQuick(name);
    res.send(JSON.stringify(successAnswer));
})

app.post("/var/set", (req, res) => {
    var id = req.body.id;
    var value = req.body.value;

    setVariable(id, value, data => {
        if (data.includes("success")) {
            res.charset = "utf-8"
            res.set({'Content-Type': 'application/json; charset=utf-8'})
            res.status(200)
            res.write(JSON.stringify(successAnswer))
            res.end()
        } else {
            console.log("Error")
            res.status(500);
            res.end()
        }
    })
})

app.post("/var/save", (req, res) => {
    var id = req.body.id;
    getVariable(id, (data) => {
        parser.parseString(data, (err, result) => {
            if (err != null) console.log(err)
            try {
                let json = result['eta']['value']
                var value = json[0]['$']['strValue']
                var saved = JSON.parse(readFileSync(resolve("settings", "saved.json")).toString())
                saved[id] = value
                writeFileSync(resolve("settings", "saved.json"), JSON.stringify(saved))
                res.status(200)
                res.write(JSON.stringify(successAnswer))
                res.end()
            } catch (ex) {
                console.log(ex)
            }
        })
    })
})

//#endregion

app.listen(port, () => console.log(`${PREFIX} listening on port ${port}!`))