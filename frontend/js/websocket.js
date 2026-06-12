// ==========================================
// WEBSOCKET CONFIGURATION
// ==========================================

// Automatically works for:
// http://localhost:8080
// https://yourdomain.com
// OBS Browser Source
// VPS + Nginx + SSL

const protocol =
    window.location.protocol === "https:"
        ? "wss:"
        : "ws:";

const WS_URL =
    `${protocol}//${window.location.host}`;

let socket = null;
let reconnectAttempts = 0;
let reconnectTimer = null;

const MAX_RECONNECT_ATTEMPTS = 999999;

// ==========================================
// CONNECTION STATUS UI
// ==========================================

function updateConnectionStatus(status) {

    const element =
        document.getElementById(
            "connectionStatus"
        );

    if (!element) return;

    element.classList.remove(
        "connected",
        "connecting",
        "disconnected"
    );

    switch (status) {

        case "connected":

            element.classList.add(
                "connected"
            );

            element.innerHTML =
                "🟢 Connected";

            break;

        case "connecting":

            element.classList.add(
                "connecting"
            );

            element.innerHTML =
                "🟡 Connecting...";

            break;

        case "disconnected":

            element.classList.add(
                "disconnected"
            );

            element.innerHTML =
                "🔴 Disconnected";

            break;
    }
}

// ==========================================
// CONNECT
// ==========================================

function connectWebSocket() {

    updateConnectionStatus(
        "connecting"
    );

    console.log(
        "Connecting To:",
        WS_URL
    );

    socket = new WebSocket(
        WS_URL
    );

    socket.onopen = () => {

        console.log(
            "WebSocket Connected"
        );

        reconnectAttempts = 0;

        updateConnectionStatus(
            "connected"
        );

        requestLatestState();
    };

    socket.onmessage = (event) => {

        try {

            const packet =
                JSON.parse(
                    event.data
                );

            handleServerPacket(
                packet
            );

        } catch (error) {

            console.error(
                "Packet Parse Error",
                error
            );
        }
    };

    socket.onerror = (error) => {

        console.error(
            "WebSocket Error",
            error
        );
    };

    socket.onclose = () => {

        console.warn(
            "WebSocket Closed"
        );

        updateConnectionStatus(
            "disconnected"
        );

        attemptReconnect();
    };
}

// ==========================================
// RECONNECT
// ==========================================

function attemptReconnect() {

    if (
        reconnectAttempts >=
        MAX_RECONNECT_ATTEMPTS
    ) {
        return;
    }

    reconnectAttempts++;

    clearTimeout(
        reconnectTimer
    );

    reconnectTimer =
        setTimeout(() => {

            console.log(
                `Reconnect Attempt ${reconnectAttempts}`
            );

            connectWebSocket();

        }, 3000);
}

// ==========================================
// SEND PACKET
// ==========================================

function sendPacket(packet) {

    if (!socket) return;

    if (
        socket.readyState !==
        WebSocket.OPEN
    ) {
        return;
    }

    socket.send(
        JSON.stringify(packet)
    );
}

// ==========================================
// UPDATE MATCH STATE
// ==========================================

function dispatchStateUpdate() {

    if (
        typeof state ===
        "undefined"
    ) {
        return;
    }

    sendPacket({
        type: "UPDATE_STATE",
        data: state
    });
}

// ==========================================
// REQUEST CURRENT STATE
// ==========================================

function requestLatestState() {

    sendPacket({
        type: "GET_STATE"
    });
}

// ==========================================
// RESET MATCH
// ==========================================

function dispatchReset() {

    sendPacket({
        type: "RESET_MATCH"
    });
}

// ==========================================
// HANDLE SERVER PACKETS
// ==========================================

function handleServerPacket(packet) {

    switch (packet.type) {

        case "SYNC":

            if (
                packet.data
            ) {

                state =
                    packet.data;

                if (
                    typeof syncUI ===
                    "function"
                ) {

                    syncUI();
                }

                if (
                    typeof updateOverlay ===
                    "function"
                ) {

                    updateOverlay(
                        packet.data
                    );
                }
            }

            break;

        case "MATCH_RESET":

            if (
                packet.data
            ) {

                state =
                    packet.data;

                if (
                    typeof syncUI ===
                    "function"
                ) {

                    syncUI();
                }

                if (
                    typeof updateOverlay ===
                    "function"
                ) {

                    updateOverlay(
                        packet.data
                    );
                }
            }

            break;

        case "PONG":

            console.log(
                "Heartbeat OK"
            );

            break;

        default:

            console.log(
                "Unknown Packet:",
                packet
            );
    }
}

// ==========================================
// HEARTBEAT
// ==========================================

setInterval(() => {

    if (
        socket &&
        socket.readyState ===
        WebSocket.OPEN
    ) {

        sendPacket({
            type: "PING"
        });
    }

}, 15000);

// ==========================================
// PUBLIC METHODS
// ==========================================

window.sendPacket =
    sendPacket;

window.dispatchReset =
    dispatchReset;

window.dispatchStateUpdate =
    dispatchStateUpdate;

// ==========================================
// START
// ==========================================

connectWebSocket();