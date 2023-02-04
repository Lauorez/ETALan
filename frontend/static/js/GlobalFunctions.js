export async function getJson(url, params = null) {
    const myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/json');
    try {
        const uri = new URL(url)
        uri.search = new URLSearchParams(params).toString();
        var req = await fetch(uri);
        var json = await req.json();
        return json;
    } catch (ex) {
        console.log(ex);
    }
}

export async function postJson(url, body) {
    const myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/json');
    const bodyString = JSON.stringify(body);
    const options = {
        method: 'POST',
        headers: myHeaders,
        body: bodyString
    };
    try {
        const myRequest = new Request(url, options);
        var req = await fetch(myRequest);
        var json = await req.json();
        var code = req.status;
        return {
            code: code,
            json: json
        };
    } catch (error) {
        console.log(error);

    }
}

export const backend = "http://192.168.178.42:3001"