import { useState, useRef, useEffect } from "react";
import { nanoid } from "nanoid";
import Todo from "./components/Todo";
import Form from "./components/Form";
import FilterButton from "./components/FilterButton";

const FILTER_MAP = {
  All: () => true,
  Active: (task) => !task.completed,
  Completed: (task) => task.completed,
};

const FILTER_NAMES = Object.keys(FILTER_MAP);

const ILLEGAL_WORDS = [
  "react"
]

function containsIllegalWord(text) {
  const words = text.split(" ");

  let found = false;

  words.forEach(word => {
    if (ILLEGAL_WORDS.includes(word.toLowerCase())) {
      found = true;
      return;
    }
  });

  return found;
}

function usePrevious(value) {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}

const initalTasks = JSON.parse(localStorage.getItem("tasks")) || [];

function App(props) {
  const [tasks, setTasks] = useState(initalTasks);
  const [filter, setFilter] = useState("All");

  const listHeadingRef = useRef(null);

  const prevTaskLength = usePrevious(tasks.length);

  useEffect(() => {
    if (tasks.length < prevTaskLength) {
      listHeadingRef.current.focus();
    }
  }, [tasks.length, prevTaskLength]);

  localStorage.setItem("tasks", JSON.stringify(tasks));
  console.log(JSON.stringify(tasks))

  function editTask(id, newName) {
    if (containsIllegalWord(newName)) {
      alert("Illegális szóhasználat!");
      return;
    }

    const editedTaskList = tasks.map((task) => {
      if (id === task.id) {
        return { ...task, name: newName };
      }
      return task;
    });
    setTasks(editedTaskList);
  }

  function addTask(name) {
    if (containsIllegalWord(name)) {
      alert("Illegális szóhasználat!");
      return;
    }

    const newTask = { id: `todo-${nanoid()}`, name, completed: false, prio: 0 };
    setTasks([...tasks, newTask]);
  }

  function toggleTaskCompleted(id) {
    const updatedTasks = tasks.map((task) => {
      if (id === task.id) {
        return { ...task, completed: !task.completed, prio: task.prio };
      }
      return task;
    });
    setTasks(updatedTasks);
  }

  function setPriority(id, event) {
    console.log(event.target.value);
    const updatedTasks = tasks.map((task) => {
      if (id === task.id) {
        return { ...task, completed: task.completed, prio: event.target.value };
      }
      return task;
    });
    setTasks(updatedTasks);
  }

  function deleteTask(id) {
    const remainingTasks = tasks.filter((task) => id !== task.id);
    setTasks(remainingTasks);
  }

  const taskList = tasks
    .filter(FILTER_MAP[filter])
    .map((task) => (
      <Todo
        id={task.id}
        name={task.name}
        completed={task.completed}
        key={task.id}
        prio={task.prio}
        toggleTaskCompleted={toggleTaskCompleted}
        setPriority={setPriority}
        deleteTask={deleteTask}
        editTask={editTask}
      />
    ));

  const filterList = FILTER_NAMES.map((name) => (
    <FilterButton
      key={name}
      name={name}
      isPressed={name === filter}
      setFilter={setFilter}
    />
  ));

  const tasksNoun = taskList.length !== 1 ? "tasks" : "task";
  const headingText = `${taskList.length} ${tasksNoun} remaining`;

  return (
    <div className="todoapp stack-large">
      <h1>TodoMatic</h1>
      <Form addTask={addTask} />
      <div className="filters btn-group stack-exception">{filterList}</div>
      <h2 id="list-heading" tabIndex="-1" ref={listHeadingRef}>
        {headingText}
      </h2>
      <ul
        role="list"
        className="todo-list stack-large stack-exception"
        aria-labelledby="list-heading">
        {taskList}
      </ul>
    </div>
  );
}

export default App;