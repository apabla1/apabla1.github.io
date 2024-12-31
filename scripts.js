let questions = [];
let currentQuestion = null;
let solvedQuestions = new Set();

// load questions
fetch("questions.json")
    .then(response => response.json())
    .then(data => {
        questions = data;
        document.getElementById("total-questions").textContent = questions.length;
        populateQuestionDropdown();
        document.getElementById("sample-answer").style.display = "none";
    })
    .catch(error => {
        console.error(error);
        alert("Failed to load questions. Please check the console for more details.");
    });

// populate question dropdown
function populateQuestionDropdown() {
    const questionDropdown = document.getElementById("question-bank");
    questionDropdown.innerHTML = "";
    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = "Question List";
    questionDropdown.appendChild(defaultOption);

    questions.forEach((question, index) => {
        const option = document.createElement("option");
        option.value = index;
        option.textContent = `Question ${question.id} - ${question.title}`;
        questionDropdown.appendChild(option);
    });
}

// change event
document.getElementById("question-bank").addEventListener("change", (event) => {
    if (event.target.value === "") {
        currentQuestion = null;
        document.getElementById("info").textContent = "Click 'Random Question' or choose one from the bank to start";
        document.getElementById("feedback").innerHTML = "";
        document.getElementById("input").value = "";
        document.getElementById("public-tests").innerHTML = "";
        document.getElementById("secret-tests").innerHTML = "";
        document.getElementById("detailed-output").innerHTML = "";
        document.getElementById("sample-answer").style.display = "none";
        return;
    }
    loadQuestion(event.target.value);
    document.getElementById("feedback").textContent = "";
});

// load a specific question by index
function loadQuestion(index) {
    currentQuestion = questions[index];
    document.getElementById("info").innerHTML = "<u><strong>Question " + currentQuestion.id + "</strong> - " + currentQuestion.title + "</u><br /><br />" +
    "<i>" + currentQuestion.prompt + "</i><br /><br />" +
    "<strong>Valid Examples:</strong>" + currentQuestion.valid_examples.map(example => `<li style="font-family: Consolas, monospace;">${example}</li>`).join("\n") + "</ul><br />" +
    "<strong>Invalid Examples:</strong>" + currentQuestion.invalid_examples.map(example => `<li style="font-family: Consolas, monospace;">${example}</li>`).join("\n") + "</ul>";
    document.getElementById("feedback").textContent = "";
    document.getElementById("sample-answer").style.display = "inline-block";
}

// pick a random unsolved question
document.getElementById("random-question").addEventListener("click", () => {
    document.getElementById("feedback").textContent = "";
    const unsolvedQuestions = questions.filter((_, index) => !solvedQuestions.has(index));
    if (unsolvedQuestions.length === 0) {
        document.getElementById("feedback").textContent = "Congratulations! You've solved all questions!";
        return;
    }
    const randomIndex = Math.floor(Math.random() * unsolvedQuestions.length);
    const questionIndex = questions.indexOf(unsolvedQuestions[randomIndex]);
    loadQuestion(questionIndex);

    document.getElementById("question-bank").value = questionIndex;
});

// run tests and check the solution
document.getElementById("run-tests").addEventListener("click", () => {
    if (!currentQuestion) {
        if (document.getElementById("input").value.trim() === "") {
            document.getElementById("feedback").textContent = "Choose a question and enter Regex!";
        } else {
            document.getElementById("feedback").textContent = "Choose a question!";
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
        document.getElementById("feedback").textContent = "Invalid regex pattern.";
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
    currentQuestion.publicTests.forEach((test, i) => {
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
    currentQuestion.secretTests.forEach((test, i) => {
        const passed = regex.test(test.input) === test.expected;
        secretlist += `<p>Test ${i + 1}: ${passed ? '✅ Passed' : '❌ Failed'}</p>`;
        if (!passed) allTestsPassed = false;
    });
    secr.innerHTML = secretlist;


    if (allTestsPassed) {
        const questionIndex = questions.indexOf(currentQuestion);
        if (!solvedQuestions.has(questionIndex)) {
            solvedQuestions.add(questionIndex);
            document.getElementById("solved-count").textContent = solvedQuestions.size;
            document.getElementById("feedback").textContent = "✅ All tests passed!";
        }
    } else {
        document.getElementById("feedback").textContent = "❌ Some tests failed. See detailed output below.";
    }
});

// show sample answer
document.getElementById("sample-answer").addEventListener("click", () => {
    if (!currentQuestion) {
        document.getElementById("feedback").textContent = "Choose a question!";
        return;
    }
    const popup = document.getElementById("sample-answer-popup");
    if (popup) {
        popup.innerHTML = `
            <button id="popup-close" style="float: right;">X</button>
            <div style="font-family: Consolas, monospace;">${currentQuestion.sampleAnswer}</div>
        `;

        const sampleAnswerBtn = document.getElementById("sample-answer");
        const rect = sampleAnswerBtn.getBoundingClientRect();

        popup.style.display = "block";
        popup.style.visibility = "hidden";
        const popupHeight = popup.offsetHeight;
        const popupWidth = popup.offsetWidth;

        const topPosition = rect.top + window.scrollY - popupHeight - 10;
        const leftPosition = rect.left + (rect.width / 2) - (popupWidth / 2);

        popup.style.left = `${leftPosition}px`;
        popup.style.top = `${topPosition}px`;

        popup.style.visibility = "visible";

        document.getElementById("popup-close").addEventListener("click", () => {
            popup.style.display = "none";
        });
    }
});