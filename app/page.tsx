"use client"

import { useState } from "react"
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  DragEndEvent,
  UniqueIdentifier
} from "@dnd-kit/core"
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

interface Task {
  id: UniqueIdentifier
  title: string
  description?: string
  priority: "low" | "medium" | "high"
  status: "todo" | "doing" | "done"
  createdAt: Date
}

interface SortableTaskProps {
  task: Task
  id: UniqueIdentifier
  getPriorityColor: (priority: Task["priority"]) => string
  onMove: (taskId: UniqueIdentifier, newStatus: Task["status"]) => void
  onDelete: () => void
}

function SortableTask({ task, id, getPriorityColor, onMove, onDelete }: SortableTaskProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white rounded-lg p-4 border border-gray-300 hover:border-gray-400 transition-all"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="text-gray-900 font-semibold text-lg flex-1">
          {task.title}
        </h3>
        <button
          onClick={onDelete}
          className="text-gray-400 hover:text-gray-600 transition-colors text-sm"
        >
          ✕
        </button>
      </div>
      {task.description && (
        <p className="text-gray-600 text-sm mb-3">
          {task.description}
        </p>
      )}
      <div className="flex items-center justify-between">
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getPriorityColor(task.priority)}`}>
          {task.priority === "high" ? "H" : task.priority === "medium" ? "M" : "B"}
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => onMove(task.id, "todo")}
            className={`text-sm px-3 py-1.5 rounded transition-colors ${
              task.status === "todo" ? "opacity-50 cursor-not-allowed" : "bg-gray-100 hover:bg-gray-200"
            }`}
            disabled={task.status === "todo"}
          >
            À faire
          </button>
          <button
            onClick={() => onMove(task.id, "doing")}
            className={`text-sm px-3 py-1.5 rounded transition-colors ${
              task.status === "doing" ? "opacity-50 cursor-not-allowed" : "bg-gray-100 hover:bg-gray-200"
            }`}
            disabled={task.status === "doing"}
          >
            En cours
          </button>
          <button
            onClick={() => onMove(task.id, "done")}
            className={`text-sm px-3 py-1.5 rounded transition-colors ${
              task.status === "done" ? "opacity-50 cursor-not-allowed" : "bg-gray-100 hover:bg-gray-200"
            }`}
            disabled={task.status === "done"}
          >
            Terminé
          </button>
        </div>
      </div>
    </div>
  )
}

export default function KanbanBoard() {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: "1" as UniqueIdentifier,
      title: "Bienvenue sur ton Kanban !",
      description: "Glisse les tâches pour les déplacer entre les colonnes",
      priority: "medium",
      status: "todo",
      createdAt: new Date()
    }
  ])

  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null)
  const [newTaskTitle, setNewTaskTitle] = useState("")
  const [newTaskDescription, setNewTaskDescription] = useState("")
  const [newTaskPriority, setNewTaskPriority] = useState<"low" | "medium" | "high">("medium")

  const addTask = () => {
    if (!newTaskTitle.trim()) return

    const newTask: Task = {
      id: Date.now().toString() as UniqueIdentifier,
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

  const moveTask = (taskId: UniqueIdentifier, newStatus: Task["status"]) => {
    setTasks(tasks.map(task =>
      task.id === taskId ? { ...task, status: newStatus } : task
    ))
  }

  const deleteTask = (taskId: UniqueIdentifier) => {
    setTasks(tasks.filter(task => task.id !== taskId))
  }

  const tasksByStatus = (status: Task["status"]) => {
    return tasks.filter(task => task.status === status)
  }

  const getPriorityColor = (priority: Task["priority"]) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-900 border-red-200"
      case "medium": return "bg-yellow-100 text-yellow-900 border-yellow-200"
      case "low": return "bg-green-100 text-green-900 border-green-200"
    }
  }

  const sensors = useSensor(PointerSensor, {
    activationConstraint: {
      distance: 10
    }
  })

  const handleDragStart = (event: any) => {
    const { active } = event
    setActiveId(active.id as UniqueIdentifier)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active?.id && over.id !== active.id) {
      const activeTask = tasks.find(t => t.id === active.id)
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
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="min-h-screen bg-gray-100">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Kanban
            </h1>
            <p className="text-gray-600 text-lg">
              Collaboration Pierre & Arthur
            </p>
          </div>

          {/* Add Task Form */}
          <div className="mb-8 bg-white rounded-xl p-6 border border-gray-300">
            <div className="flex gap-4 flex-wrap">
              <input
                key="title-input"
                type="text"
                placeholder="Titre de la tâche..."
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                className="flex-1 min-w-[200px] px-4 py-2.5 rounded-lg border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
              />
              <input
                key="description-input"
                type="text"
                placeholder="Description (optionnel)..."
                value={newTaskDescription}
                onChange={(e) => setNewTaskDescription(e.target.value)}
                className="flex-1 min-w-[200px] px-4 py-2.5 rounded-lg border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
              />
              <select
                key="priority-select"
                value={newTaskPriority}
                onChange={(e) => setNewTaskPriority(e.target.value as Task["priority"])}
                className="px-4 py-2.5 rounded-lg border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                <option value="low">Bas</option>
                <option value="medium">Moyen</option>
                <option value="high">Haut</option>
              </select>
              <button
                key="add-button"
                onClick={addTask}
                className="px-6 py-2.5 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-700 transition-colors"
              >
                + Ajouter
              </button>
            </div>
          </div>

          {/* Kanban Columns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {columnIds.map((status) => {
              const tasks = tasksByStatus(status)
              const columnConfig = {
                todo: { title: "À faire" },
                doing: { title: "En cours" },
                done: { title: "Terminé" }
              }[status]

              return (
                <SortableContext key={`column-${status}`} items={tasks.map(t => t.id)} id={status}>
                  <Column
                    key={status}
                    id={status}
                    tasks={tasks}
                    title={columnConfig.title}
                    getPriorityColor={getPriorityColor}
                    onMove={moveTask}
                    onDelete={deleteTask}
                  />
                </SortableContext>
              )
            })}
          </div>
        </div>
      </div>
    </DndContext>
  )
}

function Column({
  id,
  tasks,
  title,
  getPriorityColor,
  onMove,
  onDelete
}: {
  id: Task["status"]
  tasks: Task[]
  title: string
  getPriorityColor: (priority: Task["priority"]) => string
  onMove: (taskId: UniqueIdentifier, newStatus: Task["status"]) => void
  onDelete: (taskId: UniqueIdentifier) => void
}) {
  return (
    <div
      id={id}
      className="bg-gray-200 rounded-xl p-4 border border-gray-300 min-h-[500px]"
    >
      <div className="mb-4 flex items-center gap-2">
        <h2 className="text-xl font-bold text-gray-800">
          {title}
        </h2>
        <span className="ml-auto bg-gray-900 text-white px-3 py-1 rounded-full text-sm font-semibold">
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
