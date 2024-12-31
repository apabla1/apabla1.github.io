let questions = [];
let currentQuestion = null;

function populateQuestionSelector() {
    const selector = document.getElementById("question-selector");
    questions.forEach((question, index) => {
        const option = document.createElement("option");
        option.value = index;
        option.textContent = question.title;
        selector.appendChild(option);
    });
    loadQuestion(0); // load first question
}

// load question
fetch("questions.json")
    .then(response => response.json())
    .then(data => {
        questions = data;
        populateQuestionSelector();
    });


document.getElementById("question-selector").addEventListener("change", (e) => {
    const questionIndex = e.target.value;
    loadQuestion(questionIndex);
});

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

document.getElementById("run-tests").addEventListener("click", () => {
    if (!currentQuestion) return;

    const regexInput = document.getElementById("regex-input").value;
    const regex = new RegExp(regexInput);

    let results = `<h3>Results:</h3>`;
    results += `<h4>Public Tests:</h4>`;
    currentQuestion.publicTests.forEach((test, index) => {
        const passed = regex.test(test.input) === test.expected;
        results += `<p>Test ${index + 1}: ${passed ? '✅ Passed' : '❌ Failed'}</p>`;
    });

    results += `<h4>Secret Tests:</h4>`;
    currentQuestion.secretTests.forEach((test, index) => {
        const passed = regex.test(test.input) === test.expected;
        results += `<p>Test ${index + 1}: ${passed ? '✅ Passed' : '❌ Failed'}</p>`;
    });

    document.getElementById("results").innerHTML = results;
});
