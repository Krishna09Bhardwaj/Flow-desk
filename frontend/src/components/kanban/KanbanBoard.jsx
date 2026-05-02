import { useState } from 'react'
import { DndContext, DragOverlay, closestCorners, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'
import KanbanColumn from './KanbanColumn'
import TaskCard from './TaskCard'
import { useUpdateTask } from '@/api/tasks.api'

const STATUSES = ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE']

export default function KanbanBoard({ tasks = [], projectId, onTaskClick, isLoading }) {
  const [activeTask, setActiveTask] = useState(null)
  const { mutate: updateTask } = useUpdateTask(projectId)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  const tasksByStatus = STATUSES.reduce((acc, s) => {
    acc[s] = tasks.filter(t => t.status === s)
    return acc
  }, {})

  const handleDragStart = ({ active }) => {
    setActiveTask(tasks.find(t => t.id === active.id))
  }

  const handleDragEnd = ({ active, over }) => {
    setActiveTask(null)
    if (!over) return
    const task = tasks.find(t => t.id === active.id)
    if (!task) return
    const newStatus = STATUSES.includes(over.id) ? over.id : tasks.find(t => t.id === over.id)?.status
    if (newStatus && newStatus !== task.status) {
      updateTask({ id: task.id, status: newStatus })
    }
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {STATUSES.map(status => (
          <KanbanColumn
            key={status}
            status={status}
            tasks={tasksByStatus[status]}
            onTaskClick={onTaskClick}
            isLoading={isLoading}
          />
        ))}
      </div>
      <DragOverlay>
        {activeTask && <TaskCard task={activeTask} onClick={() => {}} />}
      </DragOverlay>
    </DndContext>
  )
}
