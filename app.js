// ======= User Data & Containers =======
const users = JSON.parse(localStorage.getItem("users")) || [];
let currentUser = null;

const signupContainer = document.getElementById("signup-container");
const loginContainer = document.getElementById("login-container");
const quizContainer = document.getElementById("quiz-container");

const signupName = document.getElementById("signup-name");
const signupUsername = document.getElementById("signup-username");
const signupEmail = document.getElementById("signup-email");
const signupPassword = document.getElementById("signup-password");

const loginUsername = document.getElementById("login-username");
const loginPassword = document.getElementById("login-password");

const questionElement = document.getElementById("question");
const answerButtons = document.getElementById("answer-buttons");
const nextButton = document.getElementById("next-btn");
const skipButton = document.getElementById("skip-btn");
const toast = document.getElementById("toast");
const logoutButton = document.getElementById("logout-btn");
const timerDisplay = document.getElementById("timer");

let currentQuestionIndex = 0;
let score = 0;
let timeLeft = 600;
let timerInterval;
let quizInterval;
let totalTimeTaken = 0;

// ======= Show Sections =======
function showSignup() {
  signupContainer.classList.remove("hidden");
  loginContainer.classList.add("hidden");
  quizContainer.classList.add("hidden");
}

function showLogin() {
  signupContainer.classList.add("hidden");
  loginContainer.classList.remove("hidden");
  quizContainer.classList.add("hidden");
  document.getElementById('forgot-password-container').classList.add('hidden');
}

function showQuiz() {
  signupContainer.classList.add("hidden");
  loginContainer.classList.add("hidden");
  quizContainer.classList.remove("hidden");
  logoutButton.style.display = "block";
  startQuiz();
  startAutoLogout();
}

// ======= Signup Logic =======
function handleSignup() {
  const name = signupName.value.trim();
  const username = signupUsername.value.trim();
  const email = signupEmail.value.trim();
  const password = signupPassword.value.trim();

  if (name && username && email && password) {
    const exists = users.find(
      (u) => u.username === username || u.email === email
    );
    if (exists) {
      showToast("❗ Username or Email already exists. Please login.");
      showLogin();
      return;
    }

    users.push({ name, username, email, password });
    localStorage.setItem("users", JSON.stringify(users));
    showToast("✅ Signup successful! Please login.");
    signupName.value = "";
    signupUsername.value = "";
    signupEmail.value = "";
    signupPassword.value = "";
    showLogin();
  } else {
    showToast("❗ All fields are required.");
  }
}

// ======= Login Logic =======
function handleLogin() {
  const username = loginUsername.value.trim();
  const password = loginPassword.value.trim();

  const user = users.find(
    (u) => u.username === username && u.password === password
  );
  if (user) {
    currentUser = user;
    showToast(`✅ Welcome ${user.name || user.username}!`);
    loginUsername.value = "";
    loginPassword.value = "";
    showQuiz();
  } else {
    showToast("❌ Invalid credentials.");
  }
}

// ======= Logout Logic =======
function handleLogout() {
  currentUser = null;
  logoutButton.style.display = "none";
  clearInterval(timerInterval);
  clearInterval(quizInterval);
  clearTimeout(autoLogoutTimeout);
  showLogin();
  showToast("✅ Logged out successfully!", "#17a2b8");
}

// ======= Auto Logout =======
let autoLogoutTimeout;
function startAutoLogout() {
  clearTimeout(autoLogoutTimeout);
  autoLogoutTimeout = setTimeout(() => {
    handleLogout();
    showToast("⏰ Auto-Logged Out after 10 minutes!", "#dc3545");
  }, 10 * 60 * 1000);
}

// ======= Quiz Data =======
const questions = [
  {
    question: "Which is largest animal in the world?",
    answer: [
      { text: "Shark", correct: false },
      { text: "Blue Whale", correct: true },
      { text: "Elephant", correct: false },
      { text: "Giraffe", correct: false },
    ],
  },
  {
    question: "Which is the smallest country in the world?",
    answer: [
      { text: "Vatican City", correct: true },
      { text: "Bhutan", correct: false },
      { text: "Nepal", correct: false },
      { text: "Sri Lanka", correct: false },
    ],
  },
  {
    question: "Which is largest desert in the world?",
    answer: [
      { text: "Kalahari", correct: false },
      { text: "Gobi", correct: false },
      { text: "Sahara", correct: false },
      { text: "Antarctica", correct: true },
    ],
  },
  {
    question: "Which is the smallest continent in the world?",
    answer: [
      { text: "Asia", correct: false },
      { text: "Australia", correct: true },
      { text: "Arctic", correct: false },
      { text: "Africa", correct: false },
    ],
  },
];

// ======= Timer =======
function startTimer() {
  clearInterval(timerInterval);
  timeLeft = 600;
  updateTimerDisplay();

  timerInterval = setInterval(() => {
    timeLeft--;
    totalTimeTaken++;
    updateTimerDisplay();
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      handleSkip();
      showToast("⏰ Time's Up! Skipped!", "#dc3545");
    }
  }, 1000);
}

function updateTimerDisplay() {
  const minutes = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const seconds = String(timeLeft % 60).padStart(2, "0");
  timerDisplay.innerText = `Time Left : ${minutes}:${seconds}`;
}

// ======= Quiz Flow =======
function startQuiz() {
  currentQuestionIndex = 0;
  score = 0;
  totalTimeTaken = 0;
  nextButton.innerHTML = "Next";
  nextButton.style.display = "none";
  skipButton.style.display = "inline-block";
  showQuestion();

  clearInterval(quizInterval);
  quizInterval = setInterval(() => {
    totalTimeTaken++;
  }, 1000);
}

function showQuestion() {
  resetState();
  const currentQuestion = questions[currentQuestionIndex];
  questionElement.innerHTML = `${currentQuestionIndex + 1}. ${
    currentQuestion.question
  }`;
  currentQuestion.answer.forEach((answer) => {
    const button = document.createElement("button");
    button.innerHTML = answer.text;
    button.classList.add("btn");
    button.addEventListener("click", () => selectAnswer(answer.correct));
    answerButtons.appendChild(button);
  });
  startTimer();
}

function resetState() {
  nextButton.style.display = "none";
  answerButtons.innerHTML = "";
}

function selectAnswer(correct) {
  clearInterval(timerInterval);
  const correctText = questions[currentQuestionIndex].answer.find(
    (a) => a.correct
  ).text;
  Array.from(answerButtons.children).forEach((button) => {
    if (button.innerHTML.includes(correctText)) {
      button.style.backgroundColor = "#d4edda";
      button.style.color = "#155724";
      button.innerHTML += " ✔️";
    } else {
      button.style.backgroundColor = "#f8d7da";
      button.style.color = "#721c24";
      button.innerHTML += " ❌";
    }
    button.disabled = true;
  });

  if (correct) {
    score++;
    showToast("✅ Correct!", "#28a745");
  } else {
    showToast("❌ Incorrect!", "#dc3545");
  }

  nextButton.style.display = "inline-block";
}

function handleNextButton() {
  clearInterval(timerInterval);
  currentQuestionIndex++;
  if (currentQuestionIndex < questions.length) {
    showQuestion();
  } else {
    showScore();
  }
}

function handleSkip() {
  clearInterval(timerInterval);
  currentQuestionIndex++;
  if (currentQuestionIndex < questions.length) {
    showQuestion();
  } else {
    showScore();
  }
  showToast("❌ Skipped!", "#dc3545");
}

function showScore() {
  clearInterval(timerInterval);
  clearInterval(quizInterval);

  resetState();
  const total = questions.length;
  const percentage = Math.round((score / total) * 100);

  const totalMinutes = Math.floor(totalTimeTaken / 60);
  const totalSeconds = totalTimeTaken % 60;
  const formattedTime = `${String(totalMinutes).padStart(2, "0")}:${String(
    totalSeconds
  ).padStart(2, "0")}`;

  const avgTime = totalTimeTaken / total;
  const avgMinutes = Math.floor(avgTime / 60);
  const avgSeconds = Math.round(avgTime % 60);
  const avgFormatted = `${String(avgMinutes).padStart(2, "0")}:${String(
    avgSeconds
  ).padStart(2, "0")}`;

  const name = currentUser?.name || "User";
  const username = currentUser?.username || "";

  questionElement.innerHTML = `
    <div style="text-align:center; padding:20px;">
      <h2 style="margin-bottom: 8px; color: #001e4d;">🌟 General Knowledge Quiz 🌟</h2>
      <p style="font-size: 15px; color: #444;">👤Player Name : ${name}<br>🆔Username : ${username}</p>
      <h3 style="font-size: 22px; margin: 15px 0 10px;">🎯 Score: ${score} / ${total}</h3>
      <p>🥉 Rank: ${percentage}%</p>
      <p>⏱️ Time: ${formattedTime}</p>
      <p>⏲️ Avg Time/Question: ${avgFormatted}</p>
      <button id="play-again-btn" style="
        background-color: #001e4d; color: white; padding: 10px 20px; border-radius: 8px; margin-top: 20px;">
        🔄 Play Again
      </button>
    </div>
  `;

  nextButton.style.display = "none";
  skipButton.style.display = "none";

  document.getElementById("play-again-btn").addEventListener("click", () => {
    startQuiz();
  });
}

// ======= Toast =======
function showToast(message, bgColor) {
  toast.innerText = message;
  toast.style.backgroundColor = bgColor;
  toast.className = "show";
  setTimeout(() => {
    toast.className = toast.className.replace("show", "");
  }, 1500);
}

// ======= Event Listeners =======
nextButton.addEventListener("click", () => {
  if (currentQuestionIndex < questions.length) {
    handleNextButton();
  } else {
    startQuiz();
  }
});

skipButton.addEventListener("click", handleSkip);
logoutButton.addEventListener("click", handleLogout);

// ======= Initial View =======
showSignup();


function handleForgotPassword() {
  const email = prompt("📧 Enter your registered email:");

  if (!email) {
    showToast("❗ Email is required.");
    return;
  }

  const user = users.find(u => u.email === email.trim());
  if (user) {
    alert(`✅ Your password is: ${user.password}`);
  } else {
    showToast("❌ Email not found. Please sign up.");
  }
}


function showForgotPassword() {
  document.getElementById('signup-container').classList.add('hidden');
  document.getElementById('login-container').classList.add('hidden');
  document.getElementById('quiz-container').classList.add('hidden');
  document.getElementById('forgot-password-container').classList.remove('hidden');
}

function handleForgotPassword() {
  const emailInput = document.getElementById('forgot-email').value.trim();
  const messageElement = document.getElementById('forgot-message');

  if (!emailInput) {
    messageElement.style.color = '#dc3545';
    messageElement.innerText = '❗ Please enter your registered email.';
    return;
  }

  const users = JSON.parse(localStorage.getItem('users')) || [];
  const user = users.find(u => u.email === emailInput);

  if (user) {
    messageElement.style.color = '#28a745';
    messageElement.innerHTML = `✅ Your password is: <strong>${user.password}</strong>`;
  } else {
    messageElement.style.color = '#dc3545';
    messageElement.innerText = '❌ Email not found. Please check or Sign Up.';
  }
}
