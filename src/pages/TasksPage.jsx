import { useAppContext } from '../context/AppContext';
import TaskForm from '../components/TaskForm';
import TaskList from '../components/TaskList';

export default function TasksPage() {
  const { tasks: tasksContext } = useAppContext();
  const { tasks, addTask, updateTaskStatus, deleteTask } = tasksContext;

  return (
    <div>
      <div className="page-header">
        <h2>Tasks</h2>
        <p>Schedule one-time reminders for specific times.</p>
      </div>

      <div className="card">
        <div className="card-title">Add Task</div>
        <TaskForm addTask={addTask} />
      </div>

      <TaskList 
        tasks={tasks} 
        updateTaskStatus={updateTaskStatus} 
        deleteTask={deleteTask} 
      />
    </div>
  );
}
