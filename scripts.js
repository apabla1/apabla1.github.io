let questions = [];
let currentQuestion = null;
let solvedQuestions = new Set(); // Track solved questions

// Load questions
fetch("questions.json")
    .then(response => response.json())
    .then(data => {
        questions = data;
        document.getElementById("total-questions").textContent = questions.length;
    })
    .catch(error => {
        console.error("Error loading questions:", error);
        alert("Failed to load questions. Please check the console for more details.");
    });

// Populate question dropdown
// const questionDropdown = document.getElementById("question-dropdown");
// questions.forEach((question, index) => {
//     const option = document.createElement("option");
//     option.value = index;
//     option.textContent = `Question ${question.id} - ${question.title}`;
//     questionDropdown.appendChild(option);
// });
// questionDropdown.addEventListener("change", (event) => {
//     const selectedIndex = event.target.value;
//     loadQuestion(selectedIndex);
// });

// Load a specific question by index
function loadQuestion(index) {
    currentQuestion = questions[index];
    document.getElementById("info").innerHTML = "<u><strong>Question</strong> " + currentQuestion.id + " - " + currentQuestion.title + "</u><br /><br />" +
    "<i>" + currentQuestion.prompt + "</i><br /><br />" +
    "<strong>Valid Examples:</strong>" + currentQuestion.valid_examples.map(example => `<li>${example}</li>`).join("\n") + "</ul><br /><br />" +
    "<strong>Invalid Examples:</strong>" + currentQuestion.invalid_examples.map(example => `<li>${example}</li>`).join("\n") + "</ul>";
    document.getElementById("results").innerHTML = "";
}

// Pick a random unsolved question
document.getElementById("random-question").addEventListener("click", () => {
    const unsolvedQuestions = questions.filter((_, index) => !solvedQuestions.has(index));
    if (unsolvedQuestions.length === 0) {
        alert("Congratulations! You've solved all questions!");
        return;
    }
    const randomIndex = Math.floor(Math.random() * unsolvedQuestions.length);
    const questionIndex = questions.indexOf(unsolvedQuestions[randomIndex]);
    loadQuestion(questionIndex);
});

// Run tests and check the solution
document.getElementById("run-tests").addEventListener("click", () => {
    if (!currentQuestion) return;

    const regexInput = document.getElementById("regex-input").value;
    const regex = new RegExp(regexInput);

    let allTestsPassed = true;
    let results = `<h3>Results:</h3>`;
    results += `<h4>Public Tests:</h4>`;
    currentQuestion.publicTests.forEach((test, index) => {
        const passed = regex.test(test.input) === test.expected;
        results += `<p>Test ${index + 1}: ${passed ? '✅ Passed' : '❌ Failed'}</p>`;
        if (!passed) allTestsPassed = false;
    });

    results += `<h4>Secret Tests:</h4>`;
    currentQuestion.secretTests.forEach((test, index) => {
        const passed = regex.test(test.input) === test.expected;
        results += `<p>Test ${index + 1}: ${passed ? '✅ Passed' : '❌ Failed'}</p>`;
        if (!passed) allTestsPassed = false;
    });

    document.getElementById("results").innerHTML = results;

    // Mark question as solved if all tests passed
    if (allTestsPassed) {
        const questionIndex = questions.indexOf(currentQuestion);
        if (!solvedQuestions.has(questionIndex)) {
            solvedQuestions.add(questionIndex);
            document.getElementById("solved-count").textContent = solvedQuestions.size;
            alert("✅ All tests passed!");
        }
    } else {
        alert("❌ Some tests failed.");
    }
});
