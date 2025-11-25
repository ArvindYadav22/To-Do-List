import React, { useMemo, useState } from 'react'
import { useTodo } from '../contexts/TodoContext'

const defaultForm = {
  todo: '',
  notes: '',
  priority: 'medium',
  dueDate: ''
}

const priorityBadges = [
  { key: 'high', label: 'High', color: 'from-pink-500 to-orange-400' },
  { key: 'medium', label: 'Medium', color: 'from-emerald-500 to-lime-400' },
  { key: 'low', label: 'Low', color: 'from-sky-500 to-blue-400' }
]

function TodoForm() {
  const [formData, setFormData] = useState(defaultForm)
  const { addTodo } = useTodo()

  const isSubmitDisabled = useMemo(
    () => !formData.todo.trim(),
    [formData.todo]
  )

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }))
  }

  const add = (e) => {
    e.preventDefault()

    if (isSubmitDisabled) return

    addTodo({
      todo: formData.todo.trim(),
      notes: formData.notes.trim(),
      priority: formData.priority,
      dueDate: formData.dueDate,
      completed: false
    })
    setFormData(defaultForm)
  }

  return (
    <form onSubmit={add} className="space-y-4">
      <div className="form-control">
        <label className="form-label">Task title</label>
        <input
          type="text"
          className="input-control"
          placeholder="e.g. Prepare design review deck"
          value={formData.todo}
          onChange={(e) => handleChange('todo', e.target.value)}
        />
      </div>
      <div className="form-control">
        <label className="form-label">Notes</label>
        <textarea
          rows={3}
          className="input-control resize-none"
          placeholder="Add helpful context, links, or a checklist..."
          value={formData.notes}
          onChange={(e) => handleChange('notes', e.target.value)}
        />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="form-control">
          <label className="form-label">Due date</label>
          <input
            type="date"
            className="input-control"
            value={formData.dueDate}
            onChange={(e) => handleChange('dueDate', e.target.value)}
          />
        </div>
        <div className="form-control">
          <label className="form-label">Priority</label>
          <div className="flex gap-2">
            {priorityBadges.map((priority) => (
              <button
                key={priority.key}
                type="button"
                className={`priority-chip ${
                  formData.priority === priority.key ? 'priority-chip--active' : ''
                }`}
                onClick={() => handleChange('priority', priority.key)}
              >
                <span
                  className={`priority-dot bg-gradient-to-r ${priority.color}`}
                />
                {priority.label}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-gray-500">
          Pro tip: capture small wins too—they boost momentum.
        </p>
        <button
          type="submit"
          className="primary-btn"
          disabled={isSubmitDisabled}
        >
          Add task
        </button>
      </div>
    </form>
  )
}

export default TodoForm
