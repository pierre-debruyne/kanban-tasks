"use client"

import { useState } from "react"
import {
  DndContext,
  useDroppable,
  DragOverlay,
  closestCenter,
  DragEndEvent
} from "@dnd-kit/core"
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

interface Task {
  id: string
  title: string
  description?: string
  priority: "low" | "medium" | "high"
  status: "todo" | "doing" | "done"
  createdAt: Date
}

interface SortableTaskProps {
  task: Task
  id: string
  getPriorityColor: (priority: Task["priority"]) => string
  onMove: (taskId: string, newStatus: Task["status"]) => void
  onDelete: () => void
}

function SortableTask({ task, id, getPriorityColor, onMove, onDelete }: SortableTaskProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition
  } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white/10 backdrop-blur rounded-xl p-4 border border-white/20 hover:border-white/40 transition-all"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="text-white font-semibold text-lg flex-1">
          {task.title}
        </h3>
        <button
          onClick={onDelete}
          className="text-red-400 hover:text-red-300 transition-colors"
        >
          🗑️
        </button>
      </div>
      {task.description && (
        <p className="text-purple-200 text-sm mb-3">
          {task.description}
        </p>
      )}
      <div className="flex items-center justify-between">
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getPriorityColor(task.priority)}`}>
          {task.priority === "high" ? "🔴 Haut" : task.priority === "medium" ? "🟡 Moyen" : "🟢 Bas"}
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => onMove("todo")}
            className={`text-sm px-2 py-1 rounded-lg transition-all ${
              task.status === "todo" ? "opacity-50 cursor-not-allowed" : "hover:bg-purple-500/30 text-purple-200"
            }`}
            disabled={task.status === "todo"}
          >
            📝
          </button>
          <button
            onClick={() => onMove("doing")}
            className={`text-sm px-2 py-1 rounded-lg transition-all ${
              task.status === "doing" ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-500/30 text-blue-200"
            }`}
            disabled={task.status === "doing"}
          >
            🚧
          </button>
          <button
            onClick={() => onMove("done")}
            className={`text-sm px-2 py-1 rounded-lg transition-all ${
              task.status === "done" ? "opacity-50 cursor-not-allowed" : "hover:bg-green-500/30 text-green-200"
            }`}
            disabled={task.status === "done"}
          >
            ✅
          </button>
        </div>
      </div>
    </div>
  )
}

export default function KanbanBoard() {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: "1",
      title: "Bienvenue sur ton Kanban !",
      description: "Glisse les tâches pour les déplacer entre les colonnes",
      priority: "medium",
      status: "todo",
      createdAt: new Date()
    }
  ])

  const [activeId, setActiveId] = useState<string | null>(null)
  const [newTaskTitle, setNewTaskTitle] = useState("")
  const [newTaskDescription, setNewTaskDescription] = useState("")
  const [newTaskPriority, setNewTaskPriority] = useState<"low" | "medium" | "high">("medium")

  const addTask = () => {
    if (!newTaskTitle.trim()) return

    const newTask: Task = {
      id: Date.now().toString(),
      title: newTaskTitle,
      description: newTaskDescription || undefined,
      priority: newTaskPriority,
      status: "todo",
      createdAt: new Date()
    }

    setTasks([...tasks, newTask])
    setNewTaskTitle("")
    setNewTaskDescription("")
    setNewTaskPriority("medium")
  }

  const moveTask = (taskId: string, newStatus: Task["status"]) => {
    setTasks(tasks.map(task =>
      task.id === taskId ? { ...task, status: newStatus } : task
    ))
  }

  const deleteTask = (taskId: string) => {
    setTasks(tasks.filter(task => task.id !== taskId))
  }

  const tasksByStatus = (status: Task["status"]) => {
    return tasks.filter(task => task.status === status)
  }

  const getPriorityColor = (priority: Task["priority"]) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-800 border-red-300"
      case "medium": return "bg-yellow-100 text-yellow-800 border-yellow-300"
      case "low": return "bg-green-100 text-green-800 border-green-300"
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && over.id !== active?.id) {
      const activeTask = tasks.find(t => t.id === active?.id)
      const targetColumnId = over.id as Task["status"]

      if (activeTask && targetColumnId) {
        moveTask(active.id, targetColumnId)
      }
    }

    setActiveId(null)
  }

  const columnIds: Task["status"][] = ["todo", "doing", "done"]

  return (
    <DndContext
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-5xl font-bold text-white mb-2">
              📋 Kanban Tasks
            </h1>
            <p className="text-purple-200 text-lg">
              Collaboration Pierre & Arthur
            </p>
          </div>

          {/* Add Task Form */}
          <div className="mb-8 bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <div className="flex gap-4 flex-wrap">
              <input
                type="text"
                placeholder="Titre de la tâche..."
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                className="flex-1 min-w-[200px] px-4 py-3 rounded-xl bg-white/20 border border-white/30 text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
              <input
                type="text"
                placeholder="Description (optionnel)..."
                value={newTaskDescription}
                onChange={(e) => setNewTaskDescription(e.target.value)}
                className="flex-1 min-w-[200px] px-4 py-3 rounded-xl bg-white/20 border border-white/30 text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
              <select
                value={newTaskPriority}
                onChange={(e) => setNewTaskPriority(e.target.value as Task["priority"])}
                className="px-4 py-3 rounded-xl bg-white/20 border border-white/30 text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
              >
                <option value="low" className="text-gray-900">🟢 Bas</option>
                <option value="medium" className="text-gray-900">🟡 Moyen</option>
                <option value="high" className="text-gray-900">🔴 Haut</option>
              </select>
              <button
                onClick={addTask}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all hover:scale-105"
              >
                ➕ Ajouter
              </button>
            </div>
          </div>

          {/* Kanban Columns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {columnIds.map((status) => {
              const tasks = tasksByStatus(status)
              const columnConfig = {
                todo: { emoji: "📝", title: "À faire", color: "purple" },
                doing: { emoji: "🚧", title: "En cours", color: "blue" },
                done: { emoji: "✅", title: "Terminé", color: "green" }
              }[status]

              return (
                <SortableContext items={tasks.map(t => t.id)} id={status}>
                  <Column
                    id={status}
                    tasks={tasks}
                    emoji={columnConfig.emoji}
                    title={columnConfig.title}
                    color={columnConfig.color}
                    getPriorityColor={getPriorityColor}
                    onMove={moveTask}
                    onDelete={deleteTask}
                  />
                </SortableContext>
              )
            })}
          </div>

          <DragOverlay>
            <div className="bg-white/20 backdrop-blur rounded-xl p-4 border border-white/40">
              Glisser en cours...
            </div>
          </DragOverlay>
        </div>
      </div>
    </DndContext>
  )
}

function Column({
  id,
  tasks,
  emoji,
  title,
  color,
  getPriorityColor,
  onMove,
  onDelete
}: {
  id: Task["status"]
  tasks: Task[]
  emoji: string
  title: string
  color: string
  getPriorityColor: (priority: Task["priority"]) => string
  onMove: (taskId: string, newStatus: Task["status"]) => void
  onDelete: (taskId: string) => void
}) {
  const { setNodeRef } = useDroppable({
    id
  })

  return (
    <div
      ref={setNodeRef}
      className="bg-white/5 backdrop-blur-lg rounded-2xl p-4 border border-white/10 min-h-[500px]"
    >
      <div className="mb-4 flex items-center gap-2">
        <span className="text-3xl">{emoji}</span>
        <h2 className="text-2xl font-bold text-white">
          {title}
        </h2>
        <span className={`ml-auto bg-${color}-500/30 text-${color}-200 px-3 py-1 rounded-full text-sm font-semibold`}>
          {tasks.length}
        </span>
      </div>
      <div className="space-y-3">
        {tasks.map(task => (
          <SortableTask
            key={task.id}
            id={task.id}
            task={task}
            onMove={onMove}
            onDelete={() => onDelete(task.id)}
            getPriorityColor={getPriorityColor}
          />
        ))}
      </div>
    </div>
  )
}
