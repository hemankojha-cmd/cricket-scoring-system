// ==========================================
// ADVANCED MATCH DATA
// ==========================================

let historyStack = [];

let matchStats = {
    target: 0,
    partnershipRuns: 0,
    partnershipBalls: 0,
    inningsStartTime: Date.now()
};

// ==========================================
// SAVE SNAPSHOT
// ==========================================

function saveSnapshot() {

    historyStack.push(
        JSON.parse(JSON.stringify(state))
    );

    if (historyStack.length > 300) {
        historyStack.shift();
    }
}

// ==========================================
// OVERRIDE SCORING FUNCTIONS
// ==========================================

const originalAddRuns = window.addRuns;
const originalWicket = window.wicket;
const originalWide = window.addWide;
const originalNoBall = window.addNoBall;
const originalBye = window.addBye;

window.addRuns = function(runs) {

    saveSnapshot();

    matchStats.partnershipRuns += runs;
    matchStats.partnershipBalls++;

    originalAddRuns(runs);

    updateAdvancedStats();
};

window.wicket = function() {

    saveSnapshot();

    matchStats.partnershipRuns = 0;
    matchStats.partnershipBalls = 0;

    originalWicket();

    updateAdvancedStats();
};

window.addWide = function() {

    saveSnapshot();

    originalWide();

    updateAdvancedStats();
};

window.addNoBall = function() {

    saveSnapshot();

    originalNoBall();

    updateAdvancedStats();
};

window.addBye = function() {

    saveSnapshot();

    matchStats.partnershipBalls++;

    originalBye();

    updateAdvancedStats();
};

// ==========================================
// UNDO LAST BALL
// ==========================================

function undoLastBall() {

    if (historyStack.length === 0) {

        alert("Nothing to undo");

        return;
    }

    state = historyStack.pop();

    syncUI();

    if (typeof dispatchStateUpdate === "function") {
        dispatchStateUpdate();
    }
}

window.undoLastBall = undoLastBall;

// ==========================================
// TARGET
// ==========================================

function setTarget(target) {

    matchStats.target = Number(target);

    updateAdvancedStats();
}

window.setTarget = setTarget;

// ==========================================
// REQUIRED RUN RATE
// ==========================================

function calculateRRR() {

    if (!matchStats.target) {

        return "0.00";
    }

    const runsNeeded =
        matchStats.target - state.runs;

    const ballsRemaining =
        120 - state.balls;

    if (ballsRemaining <= 0) {

        return "0.00";
    }

    return (
        (runsNeeded / ballsRemaining) * 6
    ).toFixed(2);
}

// ==========================================
// STRIKE RATE
// ==========================================

function calculateStrikeRate(
    runs,
    balls
) {

    if (balls === 0) {

        return "0.00";
    }

    return (
        (runs / balls) * 100
    ).toFixed(2);
}

// ==========================================
// BOWLER ECONOMY
// ==========================================

function calculateEconomy() {

    if (state.balls === 0) {

        return "0.00";
    }

    return (
        (state.bowlerRuns /
        (state.balls / 6))
    ).toFixed(2);
}

// ==========================================
// MATCH TIMER
// ==========================================

function getMatchDuration() {

    const diff =
        Date.now() -
        matchStats.inningsStartTime;

    const totalSeconds =
        Math.floor(diff / 1000);

    const hrs =
        Math.floor(totalSeconds / 3600);

    const mins =
        Math.floor(
            (totalSeconds % 3600) / 60
        );

    const secs =
        totalSeconds % 60;

    return (
        String(hrs).padStart(2, "0") +
        ":" +
        String(mins).padStart(2, "0") +
        ":" +
        String(secs).padStart(2, "0")
    );
}

// ==========================================
// BALL HISTORY
// ==========================================

function getBallHistory() {

    return [...state.thisOverTimeline];
}

window.getBallHistory =
    getBallHistory;

// ==========================================
// PARTNERSHIP
// ==========================================

function getPartnership() {

    return {
        runs:
            matchStats.partnershipRuns,

        balls:
            matchStats.partnershipBalls
    };
}

window.getPartnership =
    getPartnership;

// ==========================================
// AUTO SAVE
// ==========================================

function autoSaveMatch() {

    localStorage.setItem(
        "autosave_match",
        JSON.stringify({
            state,
            matchStats
        })
    );
}

setInterval(
    autoSaveMatch,
    10000
);

// ==========================================
// RESTORE AUTOSAVE
// ==========================================

function restoreAutosave() {

    const saved =
        localStorage.getItem(
            "autosave_match"
        );

    if (!saved) return;

    try {

        const parsed =
            JSON.parse(saved);

        if (parsed.state) {

            state = parsed.state;
        }

        if (parsed.matchStats) {

            matchStats =
                parsed.matchStats;
        }

        syncUI();

    } catch (err) {

        console.error(err);
    }
}

restoreAutosave();

// ==========================================
// ADVANCED DISPLAY UPDATER
// ==========================================

function updateAdvancedStats() {

    const partnershipEl =
        document.getElementById(
            "partnership"
        );

    if (partnershipEl) {

        partnershipEl.innerText =
            `${matchStats.partnershipRuns} (${matchStats.partnershipBalls})`;
    }

    const rrrEl =
        document.getElementById(
            "requiredRunRate"
        );

    if (rrrEl) {

        rrrEl.innerText =
            calculateRRR();
    }

    const ecoEl =
        document.getElementById(
            "economy"
        );

    if (ecoEl) {

        ecoEl.innerText =
            calculateEconomy();
    }
}

// ==========================================
// MATCH TIMER DISPLAY
// ==========================================

setInterval(() => {

    const timerEl =
        document.getElementById(
            "matchTimer"
        );

    if (timerEl) {

        timerEl.innerText =
            getMatchDuration();
    }

}, 1000);

// ==========================================
// HOTKEYS
// ==========================================

document.addEventListener(
    "keydown",
    (e) => {

        if (
            e.ctrlKey &&
            e.key === "z"
        ) {

            e.preventDefault();

            undoLastBall();
        }

        if (e.key === "1")
            addRuns(1);

        if (e.key === "2")
            addRuns(2);

        if (e.key === "3")
            addRuns(3);

        if (e.key === "4")
            addRuns(4);

        if (e.key === "6")
            addRuns(6);

        if (
            e.key.toLowerCase() === "w"
        ) {
            wicket();
        }
    }
);

// ==========================================
// INITIALIZE
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        updateAdvancedStats();

        console.log(
            "Cricket Engine Loaded"
        );
    }
);