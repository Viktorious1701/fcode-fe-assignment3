import "./App.css";
import ToDoList from "./components/ToDoList";

function App() {
  return (
    <div className="App">
      <div className="row">
        <ToDoList title="To Do List" color ="color1"/>
        <ToDoList title="Must Do List" color ="color2" />
      </div>
    </div>
  );
}

export default App;
