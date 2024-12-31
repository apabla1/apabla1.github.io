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

// Load a specific question by index
function loadQuestion(index) {
    currentQuestion = questions[index];
    document.getElementById("problem-container").innerHTML = `
        <h2>${currentQuestion.title}</h2>
        <p>${currentQuestion.prompt}</p>
        <h3>Examples:</h3>
        <ul>
            ${currentQuestion.publicTests.map(test => `<li>${test.input}</li>`).join('')}
        </ul>
    `;
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
            alert("✅ All tests passed! Question solved!");
        }
    } else {
        alert("❌ Some tests failed. Try again!");
    }
});
