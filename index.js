const http = require('./app')
const peer = require('./p2p')
const port = process.env.PORT || 5000
const peerPort = process.env.PORT2 || 5050
const host = process.env.HOST || 'localhost'

http.listen(port, host, () => console.log(`Server has been started on ${host}:${port}`))
peer.listen(peerPort, host, () => console.log(`Peer Server has been started on ${host}:${peerPort}`))
