import http from 'http';
import { Parser } from 'xml2js';

const parser = new Parser();

export default class VarManager {
    host;
    constructor(host) {
        this.host = host;
    }

    myXOR(a, b) {
        return (a || b) && !(a && b);
    }

    getVariable(uid) {
        return new Promise((resolve, reject) => {
            http.get(`http://${this.host}:8080/user/var` + uid, (resp) => {
                resp.setEncoding("utf-8")
                var data = ''
                resp.on('data', (chunk) => {
                    data += chunk
                })
                resp.on('end', () => {
                    parser.parseString(data, (err, result) => {
                        if (err != null) console.log(err)
                        try {
                            let json = result['eta']['value'][0]['$']
                            resolve(json)
                        } catch (ex) {
                            console.log(ex)
                        }
                    })
                })
            }).on("error", (err) => {
                reject(err)
            })
        });
    }

    setVariable(uid, value) {
        return new Promise((resolve, reject) => {
            var options = {
                hostname: this.host,
                port: 8080,
                path: '/user/var' + uid,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
            };
            var req = http.request(options, (resp) => {
                resp.setEncoding("utf-8")
                var data = ''
                resp.on('data', (chunk) => {
                    data += chunk
                })
                resp.on('end', () => {
                    resolve(data)
                })
            }).on("error", (err) => {
                reject(err)
            })
            req.write("value=" + value, (error) => {
                if (myXOR(error != null, error != undefined)) console.log(error)
                req.end()
            })
        });
    }
}