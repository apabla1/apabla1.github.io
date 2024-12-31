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

    // change event
    questionDropdown.addEventListener("change", (event) => {
        if (event.target.value === "") {
            currentQuestion = null;
            document.getElementById("info").textContent = "Click 'Random Question' or choose one from the bank to start";
            document.getElementById("results").innerHTML = "";
            document.getElementById("feedback").innerHTML = "";
            return;
        }
        loadQuestion(event.target.value);
        document.getElementById("feedback").textContent = "";
    });
}

// load a specific question by index
function loadQuestion(index) {
    currentQuestion = questions[index];
    document.getElementById("info").innerHTML = "<u><strong>Question " + currentQuestion.id + "</strong> - " + currentQuestion.title + "</u><br /><br />" +
    "<i>" + currentQuestion.prompt + "</i><br /><br />" +
    "<strong>Valid Examples:</strong>" + currentQuestion.valid_examples.map(example => `<li style="font-family: Consolas, monospace;">${example}</li>`).join("\n") + "</ul><br />" +
    "<strong>Invalid Examples:</strong>" + currentQuestion.invalid_examples.map(example => `<li style="font-family: Consolas, monospace;">${example}</li>`).join("\n") + "</ul>";
    document.getElementById("results").innerHTML = "";
    document.getElementById("feedback").textContent = "";
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
});

// run tests and check the solution
document.getElementById("run-tests").addEventListener("click", () => {
    if (!currentQuestion) {
        document.getElementById("feedback").textContent = "Choose a question to get started!";
        return;
    }
    const regexInput = document.getElementById("input").value.trim();
    const regex = new RegExp(regexInput);

    let allTestsPassed = true;
    let results = `<br /><h3>Results:</h3>`;
    results += `<h4>Public Tests:</h4>`;

    // table headers
    const table = document.getElementById("detailed-output");
    table.innerHTML = `
        <tr>
            <th>Public Test #</th>
            <th>Input</th>
            <th>Result</th>
        </tr>
    `;

    // public tests
    currentQuestion.publicTests.forEach((test, i) => {
        const passed = regex.test(test.input) === test.expected;
        results += `<p>Test ${i + 1}: ${passed ? '✅ Passed' : '❌ Failed'}</p>`;
        if (!passed) allTestsPassed = false;

        // add row to table
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${i + 1}</td>
            <td style="font-family: Consolas, monospace;">${test.input}</td>
            <td>${passed ? '✅' : '❌'}</td>
        `;
        table.appendChild(row);
    });

    // secret tests
    results += `<h4>Secret Tests:</h4>`;
    currentQuestion.secretTests.forEach((test, i) => {
        const passed = regex.test(test.input) === test.expected;
        results += `<p>Test ${i + 1}: ${passed ? '✅ Passed' : '❌ Failed'}</p>`;
        if (!passed) allTestsPassed = false;
    });

    document.getElementById("results").innerHTML = results;

    if (allTestsPassed) {
        const questionIndex = questions.indexOf(currentQuestion);
        if (!solvedQuestions.has(questionIndex)) {
            solvedQuestions.add(questionIndex);
            document.getElementById("solved-count").textContent = solvedQuestions.size;
            document.getElementById("feedback").textContent = "✅ All tests passed!";
        }
    } else {
        document.getElementById("feedback").textContent = "❌ Some tests failed.";
    }
});

// show sample answer
document.getElementById("sample-answer").addEventListener("click", () => {
    if (!currentQuestion) {
        document.getElementById("feedback").textContent = "Choose a question to get started!";
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
        popup.style.left = rect.left + "px";
        popup.style.top = (rect.top - popup.offsetHeight) + "px";
        popup.style.display = "block";

        document.getElementById("popup-close").addEventListener("click", () => {
            popup.style.display = "none";
        });
    }
});