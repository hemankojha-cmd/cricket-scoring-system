const express = require("express");
const cors = require("cors");
const http = require("http");
const path = require("path");
const WebSocket = require("ws");

const app = express();

app.use(cors());
app.use(express.json());

// ==========================================
// MATCH STATE
// ==========================================

let matchState = {
    team: "IND",

    runs: 0,
    wickets: 0,
    balls: 0,

    p1Name: "Virat Kohli",
    p1Runs: 0,

    p2Name: "KL Rahul",
    p2Runs: 0,

    bowlerName: "Jasprit Bumrah",
    bowlerOvers: "0.0",
    bowlerRuns: 0,
    bowlerWickets: 0,

    thisOverTimeline: []
};

// ==========================================
// SERVE FRONTEND
// ==========================================

app.use(
    express.static(
        path.join(__dirname, "../frontend")
    )
);

// Default Route

app.get("/", (req, res) => {
    res.sendFile(
        path.join(
            __dirname,
            "../frontend/index.html"
        )
    );
});

// Overlay Route

app.get("/overlay", (req, res) => {
    res.sendFile(
        path.join(
            __dirname,
            "../frontend/overlay.html"
        )
    );
});

// ==========================================
// API ROUTES
// ==========================================

// Get Current State

app.get("/api/match", (req, res) => {
    res.json(matchState);
});

// Update State

app.post("/api/match/update", (req, res) => {

    matchState = {
        ...matchState,
        ...req.body
    };

    broadcast({
        type: "SYNC",
        data: matchState
    });

    res.json({
        success: true,
        state: matchState
    });
});

// Reset Match

app.post("/api/match/reset", (req, res) => {

    matchState = {
        team: "IND",

        runs: 0,
        wickets: 0,
        balls: 0,

        p1Name: "Virat Kohli",
        p1Runs: 0,

        p2Name: "KL Rahul",
        p2Runs: 0,

        bowlerName: "Jasprit Bumrah",
        bowlerOvers: "0.0",
        bowlerRuns: 0,
        bowlerWickets: 0,

        thisOverTimeline: []
    };

    broadcast({
        type: "MATCH_RESET",
        data: matchState
    });

    res.json({
        success: true
    });
});

// ==========================================
// HTTP SERVER
// ==========================================

const server = http.createServer(app);

// ==========================================
// WEBSOCKET SERVER
// ==========================================

const wss = new WebSocket.Server({
    server
});

// Broadcast Helper

function broadcast(data) {

    const payload =
        JSON.stringify(data);

    wss.clients.forEach(client => {

        if (
            client.readyState ===
            WebSocket.OPEN
        ) {
            client.send(payload);
        }

    });
}

// New Connection

wss.on("connection", socket => {

    console.log(
        "Client Connected"
    );

    // Send latest state

    socket.send(
        JSON.stringify({
            type: "SYNC",
            data: matchState
        })
    );

    socket.on(
        "message",
        message => {

            try {

                const packet =
                    JSON.parse(message);

                switch (
                    packet.type
                ) {

                    case "GET_STATE":

                        socket.send(
                            JSON.stringify({
                                type: "SYNC",
                                data: matchState
                            })
                        );

                        break;

                    case "UPDATE_STATE":

                        if (
                            packet.data
                        ) {

                            matchState =
                                packet.data;

                            broadcast({
                                type: "SYNC",
                                data: matchState
                            });
                        }

                        break;

                    case "RESET_MATCH":

                        matchState = {
                            team: "IND",

                            runs: 0,
                            wickets: 0,
                            balls: 0,

                            p1Name: "Virat Kohli",
                            p1Runs: 0,

                            p2Name: "KL Rahul",
                            p2Runs: 0,

                            bowlerName: "Jasprit Bumrah",
                            bowlerOvers: "0.0",
                            bowlerRuns: 0,
                            bowlerWickets: 0,

                            thisOverTimeline: []
                        };

                        broadcast({
                            type: "MATCH_RESET",
                            data: matchState
                        });

                        break;

                    case "PING":

                        socket.send(
                            JSON.stringify({
                                type: "PONG"
                            })
                        );

                        break;

                    default:

                        console.log(
                            "Unknown Packet:",
                            packet.type
                        );
                }

            } catch (error) {

                console.error(
                    error
                );
            }
        }
    );

    socket.on(
        "close",
        () => {

            console.log(
                "Client Disconnected"
            );
        }
    );
});

// ==========================================
// START SERVER
// ==========================================

const PORT =
    process.env.PORT || 8080;

server.listen(PORT, () => {

    console.log(`
==================================
CRICKET BROADCAST SERVER STARTED
==================================

Dashboard:
http://localhost:${PORT}

OBS Overlay:
http://localhost:${PORT}/overlay

API:
http://localhost:${PORT}/api/match

WebSocket:
ws://localhost:${PORT}

==================================
`);
});