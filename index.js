const API_URL = "https://683d1a9f199a0039e9e436df.mockapi.io/Wins-Loses-Ties";
const rockButton = document.getElementById("rock-button");
const paperButton = document.getElementById("paper-button");
const scissorsButton = document.getElementById("scissors-button");
const displayResult = document.getElementById("displayResult");
const resetResult = document.getElementById("resetResult");
const displayHistory = document.getElementById("displayHistory");

const scoreElement = document.querySelector(".scoreElement");
const resultText = document.querySelector(".text");
const choicePlay = document.querySelector(".choicePlay");

let score = JSON.parse(localStorage.getItem("score")) || {
  wins: 0,
  loses: 0,
  ties: 0,
};

// Events
rockButton.addEventListener("click", () => {
  playGame("rock");
  display();
  addHistory();
});

paperButton.addEventListener("click", () => {
  playGame("paper");
  display();
  addHistory();
});

scissorsButton.addEventListener("click", () => {
  playGame("scissors");
  display();
  addHistory();
});

resetResult.addEventListener("click", () => {
  score.wins = 0;
  score.loses = 0;
  score.ties = 0;
  localStorage.removeItem("score");
  displayNone();
});

// Computer choices one of Rock-Paper-Scissors
function pickComputerMove() {
  const randomNumber = Math.random();

  let computerChoice = "";

  if (randomNumber < 1 / 3) {
    computerChoice = "rock";
  } else if (randomNumber < 2 / 3) {
    computerChoice = "paper";
  } else if (randomNumber < 1) {
    computerChoice = "scissors";
  }
  return computerChoice;
}

// user choices one of Rock-Paper_Scissors
function playGame(playMove) {
  const computerMove = pickComputerMove();

  let result = "";

  if (playMove === "rock") {
    if (computerMove === "rock") {
      result = "Tie.";
    } else if (computerMove === "paper") {
      result = "You lose.";
    } else if (computerMove === "scissors") {
      result = "You win.";
    }
  }

  if (playMove === "paper") {
    if (computerMove === "paper") {
      result = "Tie.";
    } else if (computerMove === "scissors") {
      result = "You lose.";
    } else if (computerMove === "rock") {
      result = "You win.";
    }
  }

  if (playMove === "scissors") {
    if (computerMove === "scissors") {
      result = "Tie.";
    } else if (computerMove === "rock") {
      result = "You lose.";
    } else if (computerMove === "paper") {
      result = "You win.";
    }
  }

  if (result === "You win.") {
    score.wins++;
  } else if (result === "You lose.") {
    score.loses++;
  } else {
    score.ties++;
  }

  localStorage.setItem("score", JSON.stringify(score));
  // localStorage.removeItem('score');

  updateResult(result);

  updateScore();

  updateUserAndComputerChoice(playMove, computerMove);
}

// Update score
function updateScore() {
  scoreElement.innerHTML = `Wins: ${score.wins} Loses: ${score.loses} Ties: ${score.ties}`;
}

function updateResult(result) {
  resultText.innerHTML = result;
}

function updateUserAndComputerChoice(user, computer) {
  choicePlay.innerHTML = ` <div class="userPlay">
            <h2>You</h2>
            <img src="./image/${user}-emoji.png" alt="rock" class="move-icon-result">
          </div>
          <div class="computerPlay">
            <h2>Computer</h2>
            <img src="./image/${computer}-emoji.png" alt="paper" class="move-icon-result">
          </div>
      `;
}

// Display section-2 and section-3
function display() {
  displayResult.style.display = "block";
  displayHistory.style.display = "block";
}

// Display = none section-2 and section-3
function displayNone() {
  displayResult.style.display = "none";
  displayHistory.style.display = "none";
}

//-------------------------------------- API ---------------------------

document.addEventListener("DOMContentLoaded", getHistory);

// GET FUNCTION
async function getHistory() {
  try {
    const response = await axios.get(API_URL);

    const ul = document.querySelector(".list");
    ul.innerHTML = "";

    // Sort Date
    response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    response.data.forEach((item) => {
      // Gắn giá trị từ localStorage vào
      item.wins = score.wins;
      item.loses = score.loses;
      item.ties = score.ties;

      // Format Date
      const date = new Date(item.createdAt);
      const formatDate = `${date.toLocaleDateString()} - ${date.toLocaleTimeString()}`;

      // Tạo li
      const li = document.createElement("li");

      // Gắn class item
      li.className = "item";

      // Gắn thằng con vào li
      li.innerHTML = ` <div class="content">
          <p>${item.content}</p>
          <p>Created: ${formatDate}</p>
        </div>
        <div class="todo-actions">
          <i class="fa-solid fa-pen" onclick="handleUpdate(${item.id},'${item.content}')"></i>
         <i class="fa-solid fa-trash" onclick="handleDelete(${item.id})"></i>
        </div>
      `;

      // Gắn li vào ul
      ul.appendChild(li);

    });
  } catch (error) {
    console.log("Lỗi rồi" + error);
  }
}

// POST FUNCTION
async function addHistory() {
  const newItem = {
    createdAt: new Date().toISOString(),
    content: `Wins:${score.wins} ; Loses:${score.loses} ; Ties:${score.ties}`,
    wins: score.wins,
    loses: score.loses,
    ties: score.ties,
  };

  try {
    await axios.post(API_URL, newItem);
    getHistory();
  } catch (error) {
    console.log("THất bại" + error);
  }
}

// PUT FUNCTION
async function handleUpdate(id, content) {
  Swal.fire({
    title: "Edit Your Score",
    input: "text",
    inputAttributes: {
      autocapitalize: "off",
    },
    inputValue: content,
    showCancelButton: true,
    confirmButtonText: "Save",
    showLoaderOnConfirm: true,
    preConfirm: async (dataInput) => {
      await axios.put(`${API_URL}/${id}`, {
        content: dataInput,
      });
      getHistory();
      showNOtification("Save successfully");
    },
  });
}

// DELETE FUNCTION
function handleDelete(id) {
  const swalWithBootstrapButtons = Swal.mixin({
    customClass: {
      confirmButton: "btn btn-success",
      cancelButton: "btn btn-danger mr-3",
    },
    buttonsStyling: false,
  });
  swalWithBootstrapButtons
    .fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "No, cancel!",
      reverseButtons: true,
    })
    .then(async (result) => {
      if (result.isConfirmed) {
        await axios.delete(`${API_URL}/${id}`);
        getHistory();
        showNOtification("Deleted successfully");
      } else if (
        /* Read more about handling dismissals below */
        result.dismiss === Swal.DismissReason.cancel
      ) {
        swalWithBootstrapButtons.fire({
          title: "Cancelled",
          text: "Your imaginary file is safe :)",
          icon: "error",
        });
      }
    });
}

// Hàm show result message
function showNOtification(message) {
  Swal.fire({
    title: message,
    icon: "success",
    draggable: true,
  });
}
