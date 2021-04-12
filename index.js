const taskListElement = document.getElementById("task-list")
const taskPopupListElement = document.getElementById("task-popup-list")
const taskLblInput = document.getElementById("task-label-input")
const taskAlertInput = document.getElementById("task-alert-input")
const taskMsgInput = document.getElementById("task-message-input")
const taskIntervalInput = document.getElementById("task-interval-input")
const taskAddBtn = document.getElementById("task-add-btn")
const taskPersistent = document.getElementById("task-persistent")
const taskBlockable = document.getElementById("task-blockable")

const taskList = [];
const taskPopupList = [];

var isCompletingTask = false;
//constantly update timers at 60fps
requestAnimationFrame(update);



taskAddBtn.onclick = () => {
  // a label is required (otherwise the showtask gui will look messed up)
  if(taskLblInput.value.trim() == "") return;

  //extract inputs
  const label = taskLblInput.value;
  const interval = Number.isInteger(parseInt(taskIntervalInput.value)) ? taskIntervalInput.value : 60;
  const message = taskMsgInput.value;
  const alertAudio = taskAlertInput.value;

  //add the task to the list
  addTask(label, message, interval, alertAudio);
}

function completeTask(task)
{
  //remove the task from the popup list
  //if there are no popups left in list
  //then user does not have anymore tasks to complete
  taskPopupList.splice(taskPopupList.indexOf(task), 1);
  if(taskPopupList.length == 0) isCompletingTask = false;

  //remove the popup container
  document.getElementById("task-popup-container").remove();
}

function showTask(task)
{
  const container = document.createElement("div");
  const markDoneButton = document.createElement("button");
  const label = document.createElement("h1");
  const message = document.createElement("h2");
  const separator = document.createElement("hr");
  container.id = "task-popup-container"
  markDoneButton.id = "task-popup-done-btn"
  label.id = "task-popup-label"
  message.id = "task-popup-msg"
  container.className = "box is-primary"
  markDoneButton.className= "button is-success"

  label.textContent = task.label;
  message.textContent = task.message;
  markDoneButton.onclick = () => completeTask(task);
  markDoneButton.textContent = "DONE";
  separator.style.margin = "0.5rem 0";

  taskPopupListElement.appendChild(container);
  container.appendChild(label);
  container.appendChild(message);
  container.appendChild(separator);
  container.appendChild(markDoneButton);
  //play alert audio
  const alertAudio = document.createElement("audio");
  alertAudio.src = task.alertAudio;
  const promise = alertAudio.play();

  //if audio cannot be played, then default to ding.mp3
  promise.catch(() => {
    alertAudio.src = "ding.mp3";
    alertAudio.play();
  })

  //remove audio element
  alertAudio.remove();
}

function update()
{
  for(var i = 0; i < taskList.length; i++)
  {
    const task = taskList[i];
    //if task can be blocked and it is not paused
    if(isCompletingTask && task.isBlockable)
    {
      if(!task.pause) task.pause = Date.now();
      continue;
    }

    if(task.timeLeft > 0)
    {
      if(task.pause)
      {
        //get the diff between now and time paused
        //and add it to start time, effectively offsetting
        //start time by moving it closer to current time
        //and removing the time that was paused
        task.start = task.start + (Date.now() - task.pause);
        task.pause = null;
      }
      //calculate time left
      const delta = Date.now() - task.start;
      task.timeLeft = task.interval - Math.floor(delta/1000);

      //calculate percentage and change the bar accordingly
      const percentage = (task.interval-task.timeLeft)/task.interval * 100 + "%";
      task.timeLeftLabel.textContent = (task.timeLeft).toString().toHHMMSS();
      task.barElement.style.width = percentage;
    }
    else //task is completed
    {
      //reset the clock
      task.start = Date.now();
      task.timeLeft = task.interval;

      //set the bar accordingly
      task.timeLeftLabel.textContent = (task.timeLeft).toString().toHHMMSS();
      task.barElement.style.width = "0%";

      //show the task
      isCompletingTask = true;
      taskPopupList.push(task);
      showTask(task);

      //if task is not persistent, remove task
      if(!task.isPersistent) removeTask(task);

      break;
    }
  }
  //constantly update timers at 60fps
  requestAnimationFrame(update);
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
  removeTaskButton.onclick = () => removeTask(task);
  timeLeftLabel.textContent = (task.timeLeft).toString().toHHMMSS();

  taskListElement.appendChild(container);
  container.appendChild(removeTaskButton);
  container.appendChild(barOuter);
  barOuter.appendChild(timeLeftLabel);
  barOuter.appendChild(barInner);
  container.appendChild(label);
  container.appendChild(message);

  task.barElement = barInner;
  task.containerElement = container;
  task.timeLeftLabel = timeLeftLabel;
}

function removeTask(task)
{
  taskList.splice(taskList.indexOf(task), 1);
  task.containerElement.remove();
}

function addTask(label, message, interval, alertAudio)
{
  const task = {        //task object
    label: label,
    interval: interval,
    timeLeft: interval,
    message: message,
    alertAudio: "ding.mp3",
    barElement: null,
    containerElement: null,
    timeLeftLabel: null,
    isPersistent: taskPersistent.checked,
    isBlockable: taskBlockable.checked,
    start: Date.now(),
    pause: null
  }
  //check if alertAudio is valid
  if(alertAudio == "") {
      taskList.push(task);
      addTaskElement(task);
      return;
  }
  fetch(alertAudio)
    .then(res => res.blob())
    .then(blob => {
      if(blob && 
        (alertAudio.endsWith("wav") || 
         alertAudio.endsWith("mp3")))
      {
        task.alertAudio = alertAudio;
      }
    })
    .catch(() => console.log("Task Alert URL is not correct!"))
    .finally(() => {
      taskList.push(task);
      addTaskElement(task);
    })
}

String.prototype.toHHMMSS = function () {
    var sec_num = parseInt(this, 10); // don't forget the second param
    var hours   = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    var seconds = sec_num - (hours * 3600) - (minutes * 60);

    if (hours   < 10) {hours   = "0"+hours;}
    if (minutes < 10) {minutes = "0"+minutes;}
    if (seconds < 10) {seconds = "0"+seconds;}
    return hours+':'+minutes+':'+seconds;
}
