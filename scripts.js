let problems = [];
let currentProblem = null;
let solvedProblems = new Set();

// load problems
fetch("problems.json")
    .then(response => response.json())
    .then(data => {
        problems = data;
        document.getElementById("total-problems").textContent = problems.length;
        populateProblemDropdown();
        document.getElementById("sample-answer").style.display = "none";
        document.getElementById("run-tests").style.display = "none";
        document.getElementById("complete").style.display = "none";
        document.getElementById("incomplete").style.display = "none";
        document.getElementById("input").style.display = "none";
        document.getElementById("carat").style.display = "none";
        document.getElementById("dollar").style.display = "none";
    })
    .catch(error => {
        console.error(error);
        alert("Failed to load problems. Please check the console for more details.");
    });

// populate problem dropdown
function populateProblemDropdown() {
    const problemDropdown = document.getElementById("problem-bank");
    problemDropdown.innerHTML = "";
    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = "Problem List";
    problemDropdown.appendChild(defaultOption);

    problems.forEach((problem, index) => {
        const option = document.createElement("option");
        option.value = index;
        option.textContent = `Problem ${problem.id} - ${problem.title}`;
        problemDropdown.appendChild(option);
    });
}

function repopulateProblemDropdown() {
    const problemDropdown = document.getElementById("problem-bank");
    for (let i = 1; i < problemDropdown.options.length; i++) {
        const idx = parseInt(problemDropdown.options[i].value, 10);
        if (solvedProblems.has(idx)) {
            problemDropdown.options[i].textContent = "✔ Problem " + problems[idx].id + " - " + problems[idx].title;
        } else {
            problemDropdown.options[i].textContent = "Problem " + problems[idx].id + " - " + problems[idx].title;
        }
    }
}

// change event
document.getElementById("problem-bank").addEventListener("change", (event) => {
    if (event.target.value === "") {
        currentProblem = null;
        document.getElementById("info").textContent = "Click 'Random Unsolved Problem' or choose one from the bank to start";
        document.getElementById("run-tests").style.display = "none";
        document.getElementById("complete").style.display = "none";
        document.getElementById("incomplete").style.display = "none";
        document.getElementById("input").style.display = "none";
        document.getElementById("carat").style.display = "none";
        document.getElementById("dollar").style.display = "none";
        document.getElementById("feedback").innerHTML = "";
        document.getElementById("input").value = "";
        document.getElementById("public-tests").innerHTML = "";
        document.getElementById("secret-tests").innerHTML = "";
        document.getElementById("detailed-output").innerHTML = "";
        document.getElementById("sample-answer").style.display = "none";
        return;
    }
    loadProblem(event.target.value);
    document.getElementById("feedback").textContent = "";
});

// load a specific problem by index
function loadProblem(index) {
    currentProblem = problems[index];
    var formattedPrompt = currentProblem.prompt.replace(/`([^`]+)`/g, "<span style='font-family:Consolas;'>$1</span>");
    document.getElementById("info").innerHTML = "<u><strong>Problem " + currentProblem.id + "</strong> - " + currentProblem.title + "</u><br /><br />" +
    "<i>" + formattedPrompt + "</i><br /><br />" +
    "<strong>Valid Examples:</strong>" + currentProblem.valid_examples.map(example => `<li style="font-family: Consolas, monospace;">${example}</li>`).join("\n") + "</ul><br />" +
    "<strong>Invalid Examples:</strong>" + currentProblem.invalid_examples.map(example => `<li><span style="font-family: Consolas, monospace;">${example.example}</span> (${example.reason})</li>`).join("\n") + "</ul>";
    document.getElementById("input").value = "";
    document.getElementById("feedback").textContent = "";
    document.getElementById("sample-answer").style.display = "inline-block";
    document.getElementById("run-tests").style.display = "inline-block";
    document.getElementById("complete").style.display = "inline-block";
    document.getElementById("incomplete").style.display = "inline-block";
    document.getElementById("input").style.display = "inline-block";
    document.getElementById("carat").style.display = "inline-block";
    document.getElementById("dollar").style.display = "inline-block";
    document.getElementById("sample-answer-popup").style.display = "none";
    document.getElementById("public-tests").innerHTML = "";
    document.getElementById("secret-tests").innerHTML = "";
    document.getElementById("detailed-output").innerHTML = "";
}

// pick a random unsolved problem
document.getElementById("random-problem").addEventListener("click", () => {
    document.getElementById("feedback").textContent = "";
    const currentProblemIndex = parseInt(document.getElementById("problem-bank").value, 10);
    const unsolvedProblems = problems.filter((_, index) => !solvedProblems.has(index) && index !== currentProblemIndex);
    if (unsolvedProblems.length === 0) { return; }
    const randomIndex = Math.floor(Math.random() * unsolvedProblems.length);
    const problemIndex = problems.indexOf(unsolvedProblems[randomIndex]);
    loadProblem(problemIndex);

    document.getElementById("problem-bank").value = problemIndex;
});

// run tests and check the solution
document.getElementById("run-tests").addEventListener("click", () => {
    if (!currentProblem) {
        if (document.getElementById("input").value.trim() === "") {
            document.getElementById("feedback").textContent = "Choose a problem and enter Regex!";
        } else {
            document.getElementById("feedback").textContent = "Choose a problem!";
        }
        return;
    }

    let rawInput = document.getElementById("input").value.trim();
    if (rawInput === "") {
        document.getElementById("feedback").textContent = "Enter Regex!";
        return;
    }

    let regexInput = '^' + rawInput + '$';

    let regex;
    try {
        regex = new RegExp(regexInput);
    } catch (e) {
        document.getElementById("feedback").textContent = e.message;
        return;
    }

    let allTestsPassed = true;
    let publist = ``;
    let pubtable = ``;
    let secretlist = ``;

    // table headers
    const table = document.getElementById("detailed-output");
    table.innerHTML = `
        <tr>
            <th>Public Test #</th>
            <th>Input</th>
            <th>Accepted?</th>
            <th>Your Result</th>
            <th>Passed?</th>
        </tr>
    `;

    // public tests
    const publ = document.getElementById("public-tests");
    publist += `<h4>Public Tests:</h4>`;
    currentProblem.publicTests.forEach((test, i) => {
        const passed = regex.test(test.input) === test.expected;
        publist += `<p>Test ${i + 1}: ${passed ? '✅ Passed' : '❌ Failed'}</p>`;
        if (!passed) allTestsPassed = false;

        // add row to table
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${i + 1}</td>
            <td style="font-family: Consolas, monospace;">${test.input}</td>
            <td>${test.expected}</td>
            <td>${regex.test(test.input)}</td>
            <td>${passed ? '✅' : '❌'}</td>
        `;
        table.appendChild(row);
    });
    publ.innerHTML = publist;

    // secret tests
    const secr = document.getElementById("secret-tests");
    secretlist += `<h4>Secret Tests:</h4>`;
    currentProblem.secretTests.forEach((test, i) => {
        const passed = regex.test(test.input) === test.expected;
        secretlist += `<p>Test ${i + 1}: ${passed ? '✅ Passed' : '❌ Failed'}</p>`;
        if (!passed) allTestsPassed = false;
    });
    secr.innerHTML = secretlist;


    if (allTestsPassed) {
        const problemIndex = problems.indexOf(currentProblem);
        if (!solvedProblems.has(problemIndex)) {
            solvedProblems.add(problemIndex);
        }
        document.getElementById("solved-count").textContent = solvedProblems.size;
        document.getElementById("feedback").textContent = "✅ All tests passed!";
        repopulateProblemDropdown();
    } else {
        document.getElementById("feedback").innerHTML = "❌ Some tests failed. Debug why your regex might've failed using the debugger at <a href='https://regex101.com/' target='_blank'>https://regex101.com/</a>. See detailed output below.";
    }
});

// show sample answer
document.getElementById("sample-answer").addEventListener("click", () => {
    if (!currentProblem) {
        document.getElementById("feedback").textContent = "Choose a problem!";
        return;
    }

    // special case for problem 2
    if (currentProblem.id === 2) {
        document.getElementById("feedback").innerHTML = currentProblem.sampleAnswer
            .replace(/`([^`]+)`/g, "<span style='font-family: Consolas;'>$1</span>")
            .replace(/\n/g, "<br>");
        return;
    }

    const popup = document.getElementById("sample-answer-popup");
    if (popup) {
        popup.innerHTML = `
            <button id="popup-close" style="float: right;">X</button>
            <br /><div style="font-family: Consolas, monospace;">${currentProblem.sampleAnswer}</div>
        `;

        const sampleAnswerBtn = document.getElementById("sample-answer");
        const rect = sampleAnswerBtn.getBoundingClientRect();

        popup.style.display = "block";
        popup.style.visibility = "hidden";
        const popupHeight = popup.offsetHeight;
        const popupWidth = popup.offsetWidth;

        const topPosition = rect.top + window.scrollY - popupHeight - 10;
        const leftPosition = rect.right - popup.offsetWidth;

        popup.style.left = `${leftPosition}px`;
        popup.style.top = `${topPosition}px`;
        popup.style.width = 'auto';

        popup.style.visibility = "visible";

        document.getElementById("popup-close").addEventListener("click", () => {
            popup.style.display = "none";
        });
    }
});

// marking problems
document.getElementById("complete").addEventListener("click", () => {
    const problemIndex = problems.indexOf(currentProblem);
    if (!solvedProblems.has(problemIndex)) {
        solvedProblems.add(problemIndex);
    }
    document.getElementById("solved-count").textContent = solvedProblems.size;
    document.getElementById("feedback").textContent = "Problem Marked as Complete";
    repopulateProblemDropdown();
});
document.getElementById("incomplete").addEventListener("click", () => {
    const problemIndex = problems.indexOf(currentProblem);
    if (solvedProblems.has(problemIndex)) {
        solvedProblems.delete(problemIndex);
    }
    document.getElementById("solved-count").textContent = solvedProblems.size;
    document.getElementById("feedback").textContent = "Problem Marked as Incomplete";
    repopulateProblemDropdown();
});

