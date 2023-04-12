import path from 'path'
import express from 'express'

const app = express()

app.use("/static", express.static(path.resolve('static')))

const port = 1400

app.get("/*", (req, res) => {
    res.sendFile(path.resolve("index.html"))
})

app.listen(port, () => console.log(`Frontend listening on port ${port}!`))
