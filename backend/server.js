const path = require('path')
const http = require('http')
const express = require('express')
const cors = require('cors');
const xml2js = require('xml2js')
const fs = require('fs')
const expressWinston = require('express-winston');
const winston = require('winston');
require('dotenv').config()

const app = express()
const parser = new xml2js.Parser();

const port = process.env.PORT
const PREFIX = "[ETALan]"
const version = "1.0.0"
const host = process.env.HOST

app.use(express.static('settings'))
app.use(express.json())
app.use(cors())
app.use(expressWinston.logger({
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: "logs/latest.log" })
    ],
    format: winston.format.combine(
        winston.format.colorize(),
        winston.format.json()
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
    http.get(`http://${host}:8080/user/var` + uid, (resp) => {
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
    var req = http.request(options, (resp) => {
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

//#endregion

//#region GET

app.get('/api', (req, res) => {
    var api = {
        version: version
    }
    res.send(api)
})

app.get('/settings/modules', (req, res) => {
    res.sendFile(path.join(__dirname, "/settings", 'modules.json'))
})

app.get('/settings/config', (req, res) => {
    res.sendFile(path.join(__dirname, "/settings", 'config.json'))
})

app.get('/settings/quick', (req, res) => {
    res.sendFile(path.join(__dirname, "/settings", 'quick.json'))
})

app.get('/var/get', (req, res) => {
    var id = req.query.id
    getVariable(id, (data) => {
        res.writeHead(200, { "Content-Type": "application/json" })
        parser.parseString(data, (err, result) => {
            if (err != null) console.log(err)
            try {
                let json = result['eta']['value']
                res.write(JSON.stringify(json[0]['$']))
                res.end()
            } catch (ex) {
                console.log(ex)
            }
        })
    })
})

app.get("/var/save", (req, res) => {
    var id = req.query.id
    var saved = JSON.parse(fs.readFileSync(path.resolve("settings", "saved.json")).toString())
    if (saved[id]) {
        res.status = 200
        res.send({
            value: saved[id]
        })
    } else {
        res.status = 500
        res.end()
    }
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
        fs.writeFile("settings/config.json", strValue, () => {
            res.status = 200;
            res.write(JSON.stringify(successAnswer));
            res.end();
            console.log("Successfully set value and sent answer.")
        });
    } catch (ex) {
        console.log(ex);
        res.status = 500;
        res.end();
    }
})

app.post("/settings/quick", (req, res) => {
    var name = req.body.name
    var scripts = req.body.scripts

    var quicks = JSON.parse(fs.readFileSync(path.resolve("settings", "quick.json")))
    quicks.push({
        name: name,
        scripts: scripts
    })
    fs.writeFile(path.resolve("settings", "quick.json"), JSON.stringify(quicks), () => {
        res.status = 200
        res.write(JSON.stringify(successAnswer))
        res.end()
    })
})

app.post("/settings/quick/delete", (req, res) => {
    var toRemove = req.body
    var quicks = JSON.parse(fs.readFileSync(path.resolve("settings", "quick.json")))
    toRemove.forEach(element => {
        var match = quicks.find(quick => quick.name == element)
        var index = quicks.indexOf(match)
        quicks.splice(index, 1)
    });
    fs.writeFile(path.resolve("settings", "quick.json"), JSON.stringify(quicks), () => {
        res.status = 200
        res.write(JSON.stringify(successAnswer))
        res.end()
    })
})

app.post("/var/set", (req, res) => {
    var id = req.body.id;
    var value = req.body.value;

    setVariable(id, value, data => {
        if (data.includes("success")) {
            res.status = 200
            res.write(JSON.stringify(successAnswer))
            res.end()
        } else {
            console.log("Error")
            res.status = 500;
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
                var saved = JSON.parse(fs.readFileSync(path.resolve("settings", "saved.json")).toString())
                saved[id] = value
                fs.writeFileSync(path.resolve("settings", "saved.json"), JSON.stringify(saved))
                res.status = 200
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