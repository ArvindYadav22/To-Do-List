import { useEffect, useMemo, useState } from 'react'
import { TodoProvider } from './contexts'
import './App.css'
import TodoForm from './components/TodoForm'
import TodoItem from './components/TodoItem'

const STATUS_FILTERS = [
  { key: 'all', label: 'All tasks' },
  { key: 'active', label: 'In progress' },
  { key: 'completed', label: 'Completed' }
]

const PRIORITY_OPTIONS = [
  { key: 'all', label: 'Any priority' },
  { key: 'high', label: 'High' },
  { key: 'medium', label: 'Medium' },
  { key: 'low', label: 'Low' }
]

const SORT_OPTIONS = [
  { key: 'created', label: 'Newest first' },
  { key: 'due', label: 'Closest due date' },
  { key: 'priority', label: 'Priority' }
]

function App() {
  const [todos, setTodos] = useState([])
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [sortKey, setSortKey] = useState('created')

  const addTodo = (todo) => {
    setTodos((prev) => [
      {
        id: Date.now(),
        createdAt: new Date().toISOString(),
        ...todo
      },
      ...prev
    ])
  }

  const updateTodo = (id, nextFields) => {
    setTodos((prev) =>
      prev.map((prevTodo) =>
        prevTodo.id === id ? { ...prevTodo, ...nextFields } : prevTodo
      )
    )
  }

  const deleteTodo = (id) => {
    setTodos((prev) => prev.filter((todo) => todo.id !== id))
  }

  const toggleComplete = (id) => {
    setTodos((prev) =>
      prev.map((prevTodo) =>
        prevTodo.id === id
          ? { ...prevTodo, completed: !prevTodo.completed, completedAt: !prevTodo.completed ? new Date().toISOString() : null }
          : prevTodo
      )
    )
  }

  const clearCompleted = () => {
    setTodos((prev) => prev.filter((todo) => !todo.completed))
  }

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('todos'))
    if (stored && stored.length) {
      setTodos(stored)
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos))
  }, [todos])

  const stats = useMemo(() => {
    const total = todos.length
    const completed = todos.filter((todo) => todo.completed).length
    const remaining = total - completed
    const completionRate = total ? Math.round((completed / total) * 100) : 0
    const overdue = todos.filter((todo) => {
      if (!todo.dueDate || todo.completed) return false
      return new Date(todo.dueDate) < new Date(new Date().setHours(0, 0, 0, 0))
    }).length

    const nextDue = todos
      .filter((todo) => todo.dueDate && !todo.completed)
      .sort(
        (a, b) =>
          new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
      )[0]

    return { total, completed, remaining, completionRate, overdue, nextDue }
  }, [todos])

  const filteredTodos = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()

    const byFilters = todos
      .filter((todo) => {
        if (statusFilter === 'active') return !todo.completed
        if (statusFilter === 'completed') return todo.completed
        return true
      })
      .filter((todo) =>
        priorityFilter === 'all' ? true : todo.priority === priorityFilter
      )
      .filter((todo) => {
        if (!term) return true
        const target = `${todo.todo} ${todo.notes ?? ''}`.toLowerCase()
        return target.includes(term)
      })

    const sorted = [...byFilters]
    sorted.sort((a, b) => {
      if (sortKey === 'due') {
        if (!a.dueDate && !b.dueDate) return 0
        if (!a.dueDate) return 1
        if (!b.dueDate) return -1
        return new Date(a.dueDate) - new Date(b.dueDate)
      }
      if (sortKey === 'priority') {
        const order = { high: 0, medium: 1, low: 2 }
        return (order[a.priority] ?? 3) - (order[b.priority] ?? 3)
      }
      return new Date(b.createdAt) - new Date(a.createdAt)
    })

    return sorted
  }, [todos, statusFilter, priorityFilter, searchTerm, sortKey])

  return (
    <TodoProvider
      value={{
        todos,
        addTodo,
        updateTodo,
        deleteTodo,
        toggleComplete
      }}
    >
      <div className="app-gradient min-h-screen py-10 px-4">
        <div className="max-w-5xl mx-auto space-y-8">
          <section className="glass-panel p-6 md:p-8 text-white">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="uppercase tracking-[0.2em] text-sm text-white/70">
                  Personal Command Center
                </p>
                <h1 className="text-3xl md:text-4xl font-semibold mt-2">
                  Plan more. Stress less.
                </h1>
                <p className="text-white/80 mt-2">
                  Track priorities, deadlines, and wins from one vibrant view.
                </p>
              </div>
              <div className="md:text-right">
                <p className="text-sm text-white/70">Completion rate</p>
                <p className="text-4xl font-bold">{stats.completionRate}%</p>
              </div>
            </div>
            <div className="mt-6 rounded-full bg-white/20 h-3 overflow-hidden">
              <span
                className="block h-full rounded-full bg-lime-300 transition-[width]"
                style={{ width: `${stats.completionRate}%` }}
              />
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="stat-card">
                <p className="stat-label">Total tasks</p>
                <p className="stat-value">{stats.total}</p>
              </div>
              <div className="stat-card">
                <p className="stat-label">In progress</p>
                <p className="stat-value">{stats.remaining}</p>
              </div>
              <div className="stat-card">
                <p className="stat-label">Completed</p>
                <p className="stat-value">{stats.completed}</p>
              </div>
              <div className="stat-card">
                <p className="stat-label">Overdue</p>
                <p className="stat-value text-red-200">{stats.overdue}</p>
              </div>
            </div>
            {stats.nextDue && (
              <div className="mt-6 rounded-2xl border border-white/20 bg-white/10 p-4">
                <p className="text-sm text-white/70 uppercase tracking-widest">
                  Next deadline
                </p>
                <p className="text-xl font-semibold mt-1">{stats.nextDue.todo}</p>
                <p className="text-white/80">
                  Due {new Date(stats.nextDue.dueDate).toLocaleDateString()}
                </p>
              </div>
            )}
          </section>

          <section className="glass-panel glass-panel--light p-6 md:p-8 space-y-6">
            <TodoForm />

            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-wrap gap-2">
                {STATUS_FILTERS.map((filter) => (
                  <button
                    key={filter.key}
                    onClick={() => setStatusFilter(filter.key)}
                    className={`filter-pill ${
                      statusFilter === filter.key ? 'filter-pill--active' : ''
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="form-control">
                  <label className="form-label">Priority</label>
                  <select
                    className="select-control"
                    value={priorityFilter}
                    onChange={(e) => setPriorityFilter(e.target.value)}
                  >
                    {PRIORITY_OPTIONS.map((option) => (
                      <option key={option.key} value={option.key}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-control">
                  <label className="form-label">Sort by</label>
                  <select
                    className="select-control"
                    value={sortKey}
                    onChange={(e) => setSortKey(e.target.value)}
                  >
                    {SORT_OPTIONS.map((option) => (
                      <option key={option.key} value={option.key}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4 md:flex-row md:items-center">
              <div className="flex-1">
                <label className="form-label">Search</label>
                <input
                  type="search"
                  className="input-control"
                  placeholder="Find tasks by name or notes"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button
                type="button"
                className="clear-btn"
                onClick={clearCompleted}
                disabled={!todos.some((todo) => todo.completed)}
              >
                Clear completed
              </button>
            </div>

            <div className="space-y-3">
              {filteredTodos.length ? (
                filteredTodos.map((todo) => (
                  <TodoItem key={todo.id} todo={todo} />
                ))
              ) : (
                <div className="empty-state">
                  <p className="text-lg font-semibold">No tasks yet</p>
                  <p className="text-sm text-gray-400">
                    Add something above or adjust your filters/search.
                  </p>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </TodoProvider>
  )
}

export default App