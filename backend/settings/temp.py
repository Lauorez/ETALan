import json, requests, xmltodict

# file = open("modules.json", "r", encoding="utf-8")
# newf = open("new.json", "x")

# newobj = list()

# content = file.read()

# js = json.loads(content)

# for obj in js:
#     response = requests.get("http://192.168.178.250:8080/user/var" + obj["id"])
#     o = xmltodict.parse(response.text)
#     jsob = json.loads(json.dumps(o))
#     unit = jsob["eta"]["value"]["@unit"]
#     decPlaces = jsob["eta"]["value"]["@decPlaces"]
#     scaleFactor = jsob["eta"]["value"]["@scaleFactor"]
#     newobj.append({
#         "id": f'{obj["id"]}',
#         "name": f'{obj["name"]}',
#         "unit": f'{unit}',
#         "decPlaces": f'{decPlaces}',
#         "scaleFactor": f'{scaleFactor}'
#     })

# newf.write(json.dumps(newobj))
# newf.close()
# file.close()

response = requests.post("http://192.168.178.250:8080/user/var/120/10251/0/0/12197", "value=101", headers={ "Content-Type": "application/x-www-form-urlencoded" })
print(response.text)