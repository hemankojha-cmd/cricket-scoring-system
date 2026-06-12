// ==========================================
// MATCH STATE
// ==========================================

let state = {
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
// HELPERS
// ==========================================

function calculateOvers() {
    return `${Math.floor(state.balls / 6)}.${state.balls % 6}`;
}

function calculateCRR() {

    if (state.balls === 0) {
        return "0.00";
    }

    return (
        (state.runs / state.balls) * 6
    ).toFixed(2);
}

function updateBowlerOvers() {

    const overBalls =
        state.thisOverTimeline.filter(
            x => x !== "WD" && x !== "NB"
        ).length;

    state.bowlerOvers =
        `${Math.floor(overBalls / 6)}.${overBalls % 6}`;
}

function legalBall() {

    state.balls++;

    updateBowlerOvers();

    const legalDeliveries =
        state.thisOverTimeline.filter(
            ball => ball !== "WD" && ball !== "NB"
        ).length;

    if (legalDeliveries >= 6) {

        const newBowler =
            prompt(
                "Over Complete!\nEnter New Bowler Name"
            );

        if (
            newBowler &&
            newBowler.trim() !== ""
        ) {

            state.bowlerName =
                newBowler.trim();

            state.bowlerOvers = "0.0";

            state.bowlerRuns = 0;

            state.bowlerWickets = 0;
        }

        state.thisOverTimeline = [];

        swapStrike();
    }
}// ==========================================
// RUNS
// ==========================================
function addRuns(runs) {

    state.runs += runs;

    state.p1Runs += runs;

    state.bowlerRuns += runs;

    legalBall();

    state.thisOverTimeline.push(runs);

    if (runs === 1 || runs === 3) {
        swapStrike();
    }

    syncUI();
    dispatchStateUpdate();
}

// ==========================================
// WICKET
// ==========================================

function wicket() {

    if (state.wickets >= 10) return;

    state.wickets++;

    state.bowlerWickets++;

   state.thisOverTimeline.push("W");

legalBall();

    const newBatsman =
        prompt(
            "Enter New Batsman Name"
        );

    state.p1Name =
        newBatsman ||
        "New Batsman";

    state.p1Runs = 0;

    syncUI();

    dispatchStateUpdate();
}
// ==========================================
// EXTRAS
// ==========================================

function addWide() {

    state.runs++;

    state.bowlerRuns++;

    state.thisOverTimeline.push("WD");

    syncUI();

    dispatchStateUpdate();
}

function addNoBall() {

    state.runs++;

    state.bowlerRuns++;

    state.thisOverTimeline.push("NB");

    syncUI();

    dispatchStateUpdate();
}

function addBye() {

    const byeRuns = parseInt(
        prompt("Enter Bye Runs", "1")
    );

    if (
        isNaN(byeRuns) ||
        byeRuns < 0
    ) {
        return;
    }

    state.runs += byeRuns;

    legalBall();

    state.thisOverTimeline.push(
        `B${byeRuns}`
    );

    syncUI();

    dispatchStateUpdate();
}
// ==========================================
// STRIKE ROTATION
// ==========================================

function swapStrike() {

    const tempName = state.p1Name;
    const tempRuns = state.p1Runs;

    state.p1Name = state.p2Name;
    state.p1Runs = state.p2Runs;

    state.p2Name = tempName;
    state.p2Runs = tempRuns;

    syncUI();

    dispatchStateUpdate();
}
// ==========================================
// SAVE / LOAD
// ==========================================

function saveState() {

    localStorage.setItem(
        "cricket_match_state",
        JSON.stringify(state)
    );

    alert("Match Saved");
}

function loadState() {

    const saved =
        localStorage.getItem(
            "cricket_match_state"
        );

    if (!saved) return;

    state = JSON.parse(saved);

    syncUI();

    dispatchStateUpdate();
}

// ==========================================
// RESET
// ==========================================

function resetMatch() {

    if (
        !confirm(
            "Reset entire match?"
        )
    ) {
        return;
    }

    state = {
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

    syncUI();

    dispatchReset();
}

// ==========================================
// THIS OVER CHIPS
// ==========================================

function renderThisOver() {

    const container =
        document.getElementById(
            "thisOver"
        );

    if (!container) return;

    container.innerHTML = "";

    state.thisOverTimeline.forEach(
        (ball) => {

            const chip =
                document.createElement("div");

            chip.classList.add(
                "ball-chip"
            );

            if (ball === "W") {

                chip.classList.add(
                    "ball-wicket"
                );

            } else if (
                ball === "WD" ||
                ball === "NB"
            ) {

                chip.classList.add(
                    "ball-extra"
                );

            } else if (ball === 4) {

                chip.classList.add(
                    "ball-four"
                );

            } else if (ball === 6) {

                chip.classList.add(
                    "ball-six"
                );

            } else {

                chip.classList.add(
                    "ball-run"
                );
            }

            chip.innerText = ball;

            container.appendChild(chip);
        }
    );
}

// ==========================================
// SYNC UI
// ==========================================

function syncUI() {

    // Team
    const teamInput =
        document.getElementById(
            "teamInput"
        );

    if (teamInput)
        teamInput.value =
            state.team;

    // Runs
    const runsInput =
        document.getElementById(
            "runsInput"
        );

    if (runsInput)
        runsInput.value =
            state.runs;

    // Wickets
    const wicketsInput =
        document.getElementById(
            "wicketsInput"
        );

    if (wicketsInput)
        wicketsInput.value =
            state.wickets;

    // Overs
    const oversInput =
        document.getElementById(
            "oversInput"
        );

    if (oversInput)
        oversInput.value =
            calculateOvers();

    // Batsmen
    const p1Name =
        document.getElementById(
            "p1Name"
        );

    const p1Runs =
        document.getElementById(
            "p1Runs"
        );

    const p2Name =
        document.getElementById(
            "p2Name"
        );

    const p2Runs =
        document.getElementById(
            "p2Runs"
        );

    if (p1Name)
        p1Name.value =
            state.p1Name;

    if (p1Runs)
        p1Runs.value =
            state.p1Runs;

    if (p2Name)
        p2Name.value =
            state.p2Name;

    if (p2Runs)
        p2Runs.value =
            state.p2Runs;

    // Bowler
    const bowlerName =
        document.getElementById(
            "bowlerName"
        );

    const bowlerOvers =
        document.getElementById(
            "bowlerOvers"
        );

    const bowlerRuns =
        document.getElementById(
            "bowlerRuns"
        );

    const bowlerWickets =
        document.getElementById(
            "bowlerWickets"
        );

    if (bowlerName)
        bowlerName.value =
            state.bowlerName;

    if (bowlerOvers)
        bowlerOvers.value =
            state.bowlerOvers;

    if (bowlerRuns)
        bowlerRuns.value =
            state.bowlerRuns;

    if (bowlerWickets)
        bowlerWickets.value =
            state.bowlerWickets;

    // Summary
    const summaryScore =
        document.getElementById(
            "summaryScore"
        );

    const summaryOvers =
        document.getElementById(
            "summaryOvers"
        );

    const summaryCRR =
        document.getElementById(
            "summaryCRR"
        );

    if (summaryScore)
        summaryScore.innerText =
            `${state.runs}/${state.wickets}`;

    if (summaryOvers)
        summaryOvers.innerText =
            calculateOvers();

    if (summaryCRR)
        summaryCRR.innerText =
            calculateCRR();

    renderThisOver();
}

if (bowlerWickets)
    bowlerWickets.value =
        state.bowlerWickets;

// Overlay Bowler

const overlayBowlerName =
    document.getElementById(
        "overlayBowlerName"
    );

if (overlayBowlerName) {

    overlayBowlerName.innerText =
        state.bowlerName;
}

const overlayBowlerFigures =
    document.getElementById(
        "overlayBowlerFigures"
    );

if (overlayBowlerFigures) {

    overlayBowlerFigures.innerText =
        `${state.bowlerWickets}-${state.bowlerRuns} (${state.bowlerOvers})`;
}
// ==========================================
// INPUT LISTENERS
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        syncUI();

        // Team

        const teamInput =
            document.getElementById(
                "teamInput"
            );

        if (teamInput) {

            teamInput.addEventListener(
                "input",
                (e) => {

                    state.team =
                        e.target.value;

                    dispatchStateUpdate();
                }
            );
        }

        // Striker

        const p1Input =
            document.getElementById(
                "p1Name"
            );

        if (p1Input) {

            p1Input.addEventListener(
                "input",
                (e) => {

                    state.p1Name =
                        e.target.value;

                    dispatchStateUpdate();
                }
            );
        }

        // Non Striker

        const p2Input =
            document.getElementById(
                "p2Name"
            );

        if (p2Input) {

            p2Input.addEventListener(
                "input",
                (e) => {

                    state.p2Name =
                        e.target.value;

                    dispatchStateUpdate();
                }
            );
        }

        // Bowler

        const bowlerInput =
            document.getElementById(
                "bowlerName"
            );

        if (bowlerInput) {

            bowlerInput.addEventListener(
                "input",
                (e) => {

                    state.bowlerName =
                        e.target.value;

                    dispatchStateUpdate();
                }
            );
        }
    }
);
// ==========================================
// EXPORTS
// ==========================================

window.addRuns = addRuns;
window.wicket = wicket;

window.addWide = addWide;
window.addNoBall = addNoBall;
window.addBye = addBye;

window.swapStrike = swapStrike;

window.saveState = saveState;
window.loadState = loadState;
window.resetMatch = resetMatch;

window.syncUI = syncUI;
window.state = state;