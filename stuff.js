const gridContainer = document.querySelector(".grid-container");
const submitBtn = document.querySelector("#submitButton");
const colorPicker = new iro.ColorPicker("#colorPicker");
const randomModeBtn = document.querySelector("#randomMode");
const trailingEffectBtn = document.querySelector("#trailingEffect");
const form = document.querySelector("form");
const header = document.querySelector(".header");

let isDragging = false;
let toggleRandomMode = false;
let toggleTrailingEffect = false;
let opacityValue = 0;

randomModeBtn.addEventListener("click", (event) => {
  event.preventDefault();

  if (toggleRandomMode == false) {
    toggleRandomMode = true;
    randomModeBtn.style.backgroundColor = "#f2e9e1";
    randomModeBtn.textContent = "Random Mode Enabled";
  } else {
    toggleRandomMode = false;
    randomModeBtn.style.backgroundColor = "#e0def4";
    randomModeBtn.textContent = "Enable Random Mode";
  }
});

trailingEffectBtn.addEventListener("click", (event) => {
  event.preventDefault();

  if (toggleTrailingEffect == false) {
    toggleTrailingEffect = true;
    trailingEffectBtn.style.backgroundColor = "#f2e9e1";
    trailingEffectBtn.textContent = "Trailing Effect Enabled";
  } else {
    toggleTrailingEffect = false;
    trailingEffectBtn.style.backgroundColor = "#e0def4";
    trailingEffectBtn.textContent = "Enable Trailing Effect";
  }
});

submitBtn.addEventListener("click", (event) => {
  const inputBox = document.querySelector("#grid-size");
  const gridSize = +inputBox.value;

  gridContainer.innerHTML = "";
  inputBox.value = "";

  form.classList.toggle("hidden");
  header.classList.toggle("hidden");

  if (gridSize >= 0 && gridSize <= 100) createGrid(gridSize);
  event.preventDefault();
});

function createGrid(gridSize) {
  gridContainer.removeEventListener("mousedown", handleMouseDown); //
  gridContainer.removeEventListener("mouseover", handleMouseOver); //   To make sure event listeners dont accumulate after new grid creation
  window.removeEventListener("mouseup", handleMouseUp); //

  for (let i = 0; i < gridSize ** 2; i++) {
    var square = document.createElement("div");
    square.classList.add("grid-squares");
    square.style.setProperty("--grid-rows-columns", gridSize);
    gridContainer.appendChild(square);
  }

  gridContainer.addEventListener("mousedown", handleMouseDown);
  gridContainer.addEventListener("mouseover", handleMouseOver);
  window.addEventListener("mouseup", handleMouseUp);
}

function generateRandomRgbColor() {
  const r = Math.floor(Math.random() * 256);
  const g = Math.floor(Math.random() * 256);
  const b = Math.floor(Math.random() * 256);
  return `rgb(${r}, ${g}, ${b})`;
}

function generateTrailingEffect() {
  if (opacityValue >= 0 && opacityValue < 100) {
    let currentValue = opacityValue;
    // Used a second variable to seamlessly increment opacity value from 0 to 100, if we dont then it will increment weirdly like it will start from 10 instead of 0 but when currentValue variable is used to store opacity value and then we increment the opacity value, returning the currentValue it works. lets say opacity value is 0, its then stored inside currentValue variable and then incremented now being 10, we return currentValue which is 0, the opacity value we wanted, so when mouse enters next square the value 10 is returned and the process continues.
    opacityValue += 10;
    return `${currentValue}%`;
  } else {
    opacityValue = 0;
  }
}

function handleMouseDown(event) {
  event.preventDefault();
  // Using prevent default make sure it doesnt try to grab and drag text or anything else causing weird behaviour
  if (event.target.classList.contains("grid-squares")) {
    if (toggleRandomMode == false) {
      isDragging = true;
      event.target.style.backgroundColor = colorPicker.color.hexString;
      // using event.target to access current square on which the event was fired upon (using event delegation)
    } else if (toggleRandomMode == true) {
      isDragging = true;
      event.target.style.backgroundColor = generateRandomRgbColor();
    }

    if (toggleTrailingEffect == true)
      event.target.style.opacity = generateTrailingEffect();
  }
}

function handleMouseOver(event) {
  if (isDragging == true) {
    if (toggleRandomMode == false) {
      event.target.style.backgroundColor = colorPicker.color.hexString;
    } else if (toggleRandomMode == true) {
      event.target.style.backgroundColor = generateRandomRgbColor();
    }

    if (toggleTrailingEffect == true)
      event.target.style.opacity = generateTrailingEffect();
  }
}

function handleMouseUp() {
  isDragging = false;
  opacityValue = 0;
}
