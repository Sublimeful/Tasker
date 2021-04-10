const taskListElement = document.getElementById("task-list")
const taskLblInput = document.getElementById("task-label-input")
const taskImgInput = document.getElementById("task-image-input")
const taskMsgInput = document.getElementById("task-message-input")
const taskIntervalInput = document.getElementById("task-interval-input")
const taskAddBtn = document.getElementById("task-add-btn")
const timer = setInterval(countDown, 1000);

const taskList = [];

var isCompletingTask = false;

taskAddBtn.onclick = () => {
  if(taskLblInput.value == "") return;
  const label = taskLblInput.value;
  const interval = Number.isInteger(parseInt(taskIntervalInput.value)) ? taskIntervalInput.value : 60;
  const message = taskMsgInput.value;
  const image = taskImgInput.value;
  taskLblInput.value = "";
  taskIntervalInput.value = "";
  taskMsgInput.value = "";
  taskImgInput.value = "";
  addTask(label, message, interval, image);
}

function completeTask(task)
{
  task.barElement.style.width = "0%";
  isCompletingTask = false;
  document.getElementById("current-task-container").remove();
}

function showTask(task)
{
  const container = document.createElement("div");
  const markDoneButton = document.createElement("button");
  const label = document.createElement("h1");
  const message = document.createElement("h2");
  const separator = document.createElement("hr");
  container.id = "current-task-container"
  markDoneButton.id = "current-task-done-btn"
  label.id = "current-task-label"
  message.id = "current-task-msg"
  container.className = "box is-primary"
  markDoneButton.className= "button is-success"

  label.textContent = task.label;
  message.textContent = task.message;
  markDoneButton.onclick = () => completeTask(task);
  markDoneButton.textContent = "DONE";
  separator.style.margin = "0.5rem 0";

  document.body.appendChild(container);
  container.appendChild(label);
  container.appendChild(message);
  container.appendChild(separator);
  container.appendChild(markDoneButton);
  //play ding
  const dingAudio = document.createElement("audio");
  dingAudio.src = "ding.mp3";
  dingAudio.play();
}

function countDown()
{
  if(isCompletingTask) return;
  for(var i = 0; i < taskList.length; i++)
  {
    const task = taskList[i];
    if(task.timeLeft > 0)
    {
      task.timeLeft--;
      const percentage = (task.interval-task.timeLeft)/task.interval * 100 + "%";
      task.barElement.style.width = percentage;
      console.log(percentage);
    }
    else //task is completed
    {
      task.barElement.style.width = "100%";
      task.timeLeft = task.interval;
      isCompletingTask = true;
      showTask(task);
      break;
    }
  }
}

function addTaskElement(task)  //task object
{
  const container = document.createElement("div");
  const label = document.createElement("h1");
  const message = document.createElement("h2");
  const barOuter = document.createElement("div");
  const barInner = document.createElement("div");
  const timeLeftLabel = document.createElement("h1");
  const removeTaskButton = document.createElement("button");
  container.className = "task-container box";
  label.className = "task-label";
  message.className = "task-message";
  barOuter.className = "task-barOuter";
  barInner.className = "task-barInner";
  timeLeftLabel.className = "task-timeLeftLabel";
  removeTaskButton.className = "delete task-remove";

  label.textContent = task.label;
  message.textContent = task.message;
  barInner.style.width = "0%";
  removeTaskButton.textContent = "x";
  removeTaskButton.onclick = () => removeTask(task);

  taskListElement.appendChild(container);
  container.appendChild(removeTaskButton);
  container.appendChild(barOuter);
  barOuter.appendChild(barInner);
  container.appendChild(label);
  container.appendChild(message);
  barOuter.appendChild(timeLeftLabel);

  task.barElement = barInner;
  task.containerElement = container;
}

function removeTask(task)
{
  taskList.splice(taskList.indexOf(task), 1);
  task.containerElement.remove();
}

function addTask(label, message, interval, image)
{
  const task = {        //task object
    label: label,
    interval: interval,
    timeLeft: interval,
    message: message,
    image: image,
    barElement: null,
    containerElement: null,
  }
  taskList.push(task);
  addTaskElement(task);
}

