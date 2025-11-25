import React, { useEffect, useMemo, useState } from 'react'
import { useTodo } from '../contexts/TodoContext'

const priorityColors = {
  high: 'bg-gradient-to-r from-pink-500 to-orange-400 text-white',
  medium: 'bg-gradient-to-r from-emerald-500 to-lime-400 text-white',
  low: 'bg-gradient-to-r from-sky-500 to-blue-400 text-white'
}

const priorityLabels = {
  high: 'High priority',
  medium: 'Medium priority',
  low: 'Low priority'
}

function TodoItem({ todo }) {
  const [isEditing, setIsEditing] = useState(false)
  const [draft, setDraft] = useState({
    todo: todo.todo,
    notes: todo.notes ?? '',
    priority: todo.priority ?? 'medium',
    dueDate: todo.dueDate ?? ''
  })
  const { updateTodo, deleteTodo, toggleComplete } = useTodo()

  useEffect(() => {
    setDraft({
      todo: todo.todo,
      notes: todo.notes ?? '',
      priority: todo.priority ?? 'medium',
      dueDate: todo.dueDate ?? ''
    })
  }, [todo])

  const isOverdue = useMemo(() => {
    if (!todo.dueDate || todo.completed) return false
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return new Date(todo.dueDate) < today
  }, [todo])

  const handleSave = () => {
    updateTodo(todo.id, {
      ...draft,
      todo: draft.todo.trim() || 'Untitled task'
    })
    setIsEditing(false)
  }

  const handleCancel = () => {
    setDraft({
      todo: todo.todo,
      notes: todo.notes ?? '',
      priority: todo.priority ?? 'medium',
      dueDate: todo.dueDate ?? ''
    })
    setIsEditing(false)
  }

  const dueCopy = todo.dueDate
    ? new Date(todo.dueDate).toLocaleDateString(undefined, {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      })
    : 'No due date'

  return (
    <article
      className={`todo-card ${
        todo.completed ? 'todo-card--completed' : 'todo-card--active'
      }`}
    >
      <div className="flex items-start gap-4">
        <input
          type="checkbox"
          className="checkbox-accent mt-1"
          checked={todo.completed}
          onChange={() => toggleComplete(todo.id)}
        />
        <div className="flex-1 space-y-3">
          {isEditing ? (
            <>
              <input
                className="input-control"
                value={draft.todo}
                onChange={(e) =>
                  setDraft((prev) => ({ ...prev, todo: e.target.value }))
                }
              />
              <textarea
                rows={3}
                className="input-control resize-none"
                value={draft.notes}
                onChange={(e) =>
                  setDraft((prev) => ({ ...prev, notes: e.target.value }))
                }
              />
            </>
          ) : (
            <>
              <h3
                className={`text-lg font-semibold ${
                  todo.completed ? 'line-through text-gray-400' : 'text-gray-900'
                }`}
              >
                {todo.todo}
              </h3>
              {todo.notes && (
                <p className="text-sm text-gray-500">{todo.notes}</p>
              )}
            </>
          )}
          <div className="flex flex-wrap gap-3 text-sm">
            {isEditing ? (
              <>
                <label className="flex items-center gap-2 text-gray-500">
                  <span>Due</span>
                  <input
                    type="date"
                    className="input-control"
                    value={draft.dueDate}
                    onChange={(e) =>
                      setDraft((prev) => ({ ...prev, dueDate: e.target.value }))
                    }
                  />
                </label>
                <label className="flex items-center gap-2 text-gray-500">
                  <span>Priority</span>
                  <select
                    className="select-control"
                    value={draft.priority}
                    onChange={(e) =>
                      setDraft((prev) => ({ ...prev, priority: e.target.value }))
                    }
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </label>
              </>
            ) : (
              <>
                <span
                  className={`priority-pill ${
                    priorityColors[todo.priority] ?? 'bg-gray-200 text-gray-700'
                  }`}
                >
                  {priorityLabels[todo.priority] ?? 'No priority'}
                </span>
                <span
                  className={`due-pill ${
                    isOverdue ? 'due-pill--overdue' : ''
                  }`}
                >
                  {dueCopy}
                </span>
              </>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <button
                type="button"
                className="icon-btn icon-btn--primary"
                onClick={handleSave}
              >
                Save
              </button>
              <button
                type="button"
                className="icon-btn"
                onClick={handleCancel}
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                className="icon-btn"
                onClick={() => setIsEditing(true)}
                disabled={todo.completed}
              >
                Edit
              </button>
              <button
                type="button"
                className="icon-btn icon-btn--danger"
                onClick={() => deleteTodo(todo.id)}
              >
                Delete
              </button>
            </>
          )}
        </div>
      </div>
    </article>
  )
}

export default TodoItem
