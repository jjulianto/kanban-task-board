import { useState, useEffect, useCallback } from 'react'
import {
  IonAlert,
  IonToast,
  IonIcon,
  IonButton,
  IonSearchbar,
  IonBadge
} from '@ionic/react'
import { filterOutline } from 'ionicons/icons'
import { DndProvider } from 'react-dnd'
import {
  MouseTransition,
  TouchTransition,
  MultiBackend
} from 'dnd-multi-backend'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { TouchBackend } from 'react-dnd-touch-backend'

import { Task, Board, Assignee, FilterOptions, ColumnType } from '../types/Task'
import TaskService from '../services/TaskService'
import BoardColumn from '../components/BoardColumn'
import TaskModal from '../components/TaskModal'
import FilterModal from '../components/FilterModal'
import './TaskBoard.css'

const backendOptions = {
  backends: [
    {
      id: 'html5',
      backend: HTML5Backend,
      transition: MouseTransition
    },
    {
      id: 'touch',
      backend: TouchBackend,
      options: { enableMouseEvents: true },
      preview: true,
      transition: TouchTransition
    }
  ]
}

const TaskBoard = () => {
  const [board, setBoard] = useState<Board | null>(null)
  const [assignees, setAssignees] = useState<Assignee[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<FilterOptions>({})

  const [taskModalOpen, setTaskModalOpen] = useState(false)
  const [filterModalOpen, setFilterModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [newTaskColumn, setNewTaskColumn] = useState<ColumnType>('todo')

  const [deleteAlert, setDeleteAlert] = useState<{
    isOpen: boolean
    taskId: string
    taskTitle: string
  }>({
    isOpen: false,
    taskId: '',
    taskTitle: ''
  })

  const [toast, setToast] = useState<{
    isOpen: boolean
    message: string
    color: string
  }>({
    isOpen: false,
    message: '',
    color: 'success'
  })

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      const [boardData, assigneesData] = await Promise.all([
        TaskService.getBoard(),
        TaskService.getAssignees()
      ])

      if (boardData) {
        setBoard(boardData)
      }
      if (assigneesData) {
        setAssignees(assigneesData)
      }
    } catch (error) {
      console.error('Error loading data:', error)
      showToast('Error loading data', 'danger')

      setBoard(null)
      setAssignees([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const showToast = (message: string, color: string = 'success') => {
    setToast({
      isOpen: true,
      message,
      color
    })
  }

  const filterTasks = (tasks: Task[]): Task[] => {
    return tasks.filter((task) => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const dueDateString = task.dueDate
          ? new Date(task.dueDate)
              .toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
              })
              .toLowerCase()
          : ''

        const matchesSearch =
          task.title.toLowerCase().includes(query) ||
          task.description.toLowerCase().includes(query) ||
          task.assignee?.name.toLowerCase().includes(query) ||
          task.label.toLowerCase().includes(query) ||
          dueDateString.includes(query)

        if (!matchesSearch) return false
      }

      if (filters.assignees && filters.assignees.length > 0) {
        const hasUnassigned = filters.assignees.includes('unassigned')
        const hasAssignee =
          task.assignee && filters.assignees.includes(task.assignee.id)
        const isUnassignedTask = !task.assignee && hasUnassigned

        if (!hasAssignee && !isUnassignedTask) {
          return false
        }
      }

      if (filters.assignee && task.assignee?.id !== filters.assignee) {
        return false
      }

      // Label filter (single or multiple)
      if (filters.label && task.label !== filters.label) {
        return false
      }

      if (
        filters.labels &&
        filters.labels.length > 0 &&
        !filters.labels.includes(task.label)
      ) {
        return false
      }

      if (filters.dueDate) {
        if (!task.dueDate) return false

        const taskDate = new Date(task.dueDate)
        const filterDate = new Date(filters.dueDate)

        taskDate.setHours(0, 0, 0, 0)
        filterDate.setHours(0, 0, 0, 0)

        if (taskDate > filterDate) return false
      }
      return true
    })
  }

  // Get filtered board data
  const getFilteredBoard = (): Board | null => {
    if (!board) return null

    return {
      ...board,
      columns: board.columns.map((column) => ({
        ...column,
        tasks: filterTasks(column.tasks)
      }))
    }
  }

  const getTaskCounts = () => {
    if (!board) return { total: 0, filtered: 0 }

    const totalTasks = board.columns.reduce(
      (sum, col) => sum + col.tasks.length,
      0
    )
    const filteredBoard = getFilteredBoard()
    const filteredTasks =
      filteredBoard?.columns.reduce((sum, col) => sum + col.tasks.length, 0) ||
      0

    return { total: totalTasks, filtered: filteredTasks }
  }

  const handleCreateTask = async (
    taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>
  ) => {
    try {
      await TaskService.createTask(taskData)
      await loadData()
      showToast('Task created successfully!')
    } catch (error) {
      console.error('Error creating task:', error)
      showToast('Error creating task', 'danger')
    }
  }

  const handleEditTask = async (
    taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>
  ) => {
    if (!editingTask) return

    try {
      await TaskService.updateTask(editingTask.id, taskData)
      await loadData()
      showToast('Task updated successfully!')
    } catch (error) {
      console.error('Error updating task:', error)
      showToast('Error updating task', 'danger')
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    try {
      const success = await TaskService.deleteTask(taskId)
      if (success) {
        await loadData()
        showToast('Task deleted successfully!')
      } else {
        showToast('Error deleting task', 'danger')
      }
    } catch (error) {
      console.error('Error deleting task:', error)
      showToast('Error deleting task', 'danger')
    }

    setDeleteAlert({ isOpen: false, taskId: '', taskTitle: '' })
  }

  const handleMoveTask = async (taskId: string, newColumnId: string) => {
    try {
      await TaskService.moveTask(taskId, newColumnId as ColumnType)
      await loadData()

      const columnName = newColumnId
        ? newColumnId.charAt(0).toUpperCase() +
          newColumnId.slice(1).toLowerCase()
        : 'Unknown'

      showToast(`Task moved to ${columnName}!`)
    } catch (error) {
      console.error('Error moving task:', error)
      showToast('Error moving task', 'danger')
    }
  }

  const openCreateTaskModal = (columnId: string) => {
    setEditingTask(null)
    setNewTaskColumn(columnId as ColumnType)
    setTaskModalOpen(true)
  }

  const openEditTaskModal = (task: Task) => {
    setEditingTask(task)
    setTaskModalOpen(true)
  }

  const closeTaskModal = () => {
    setTaskModalOpen(false)
    setEditingTask(null)
  }

  const handleTaskSave = async (
    taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>
  ) => {
    if (editingTask) {
      await handleEditTask(taskData)
    } else {
      await handleCreateTask(taskData)
    }
    closeTaskModal()
  }

  const handleApplyFilters = (newFilters: FilterOptions) => {
    setFilters(newFilters)
  }

  const handleClearFilters = () => {
    setFilters({})
  }

  const getActiveFilterCount = () => {
    let count = 0
    if (filters.assignee) count++
    if (filters.assignees && filters.assignees.length > 0) count++
    if (filters.label) count++
    if (filters.labels && filters.labels.length > 0) count++
    if (filters.dueDate) count++
    return count
  }

  const confirmDeleteTask = (taskId: string, taskTitle: string) => {
    setDeleteAlert({
      isOpen: true,
      taskId,
      taskTitle
    })
  }

  const filteredBoard = getFilteredBoard()
  const taskCounts = getTaskCounts()

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          fontSize: '18px',
          color: '#666',
          background: 'white'
        }}
      >
        Loading tasks...
      </div>
    )
  }

  return (
    <div className='task-board-app'>
      <div className='app-header'>
        <div className='header-top'>
          <div className='project-info'>
            <div className='breadcrumb'>
              <span className='project-name'>Julianto</span>
              <span className='separator'> / </span>
              <span className='board-name'>Kanban Board</span>
            </div>
          </div>

          <div className='header-actions'>
            <div className='search-section'>
              <IonButton
                fill='clear'
                size='small'
                className='filter-btn'
                onClick={() => setFilterModalOpen(true)}
              >
                <IonIcon icon={filterOutline} slot='start' />
                Filter
                {getActiveFilterCount() > 0 && (
                  <IonBadge color='primary' className='filter-badge'>
                    {getActiveFilterCount()}
                  </IonBadge>
                )}
              </IonButton>

              <IonSearchbar
                value={searchQuery}
                onIonInput={(e) => setSearchQuery(e.detail.value!)}
                placeholder='Search Tasks'
                showClearButton='focus'
                debounce={300}
                className='header-search'
              />
            </div>
          </div>
        </div>

        {(searchQuery || Object.keys(filters).length > 0) && (
          <div className='task-counter'>
            Showing {taskCounts.filtered} of {taskCounts.total} tasks
          </div>
        )}
      </div>

      <div className='board-content'>
        <DndProvider backend={MultiBackend} options={backendOptions}>
          <div className='board-container'>
            <div className='board-columns'>
              {filteredBoard?.columns.map((column) => (
                <BoardColumn
                  key={column.id}
                  column={column}
                  onTaskEdit={openEditTaskModal}
                  onTaskDelete={(taskId) => {
                    const task = column.tasks.find((t) => t.id === taskId)
                    confirmDeleteTask(taskId, task?.title || 'Unknown Task')
                  }}
                  onTaskMove={handleMoveTask}
                  onAddTask={openCreateTaskModal}
                />
              ))}
            </div>
          </div>
        </DndProvider>
      </div>

      <TaskModal
        isOpen={taskModalOpen}
        task={editingTask}
        assignees={assignees}
        onClose={closeTaskModal}
        onSave={handleTaskSave}
        initialColumn={newTaskColumn}
      />

      <FilterModal
        isOpen={filterModalOpen}
        assignees={assignees}
        currentFilters={filters}
        onClose={() => setFilterModalOpen(false)}
        onApplyFilters={handleApplyFilters}
        onClearFilters={handleClearFilters}
      />

      <IonAlert
        isOpen={deleteAlert.isOpen}
        onDidDismiss={() =>
          setDeleteAlert({ isOpen: false, taskId: '', taskTitle: '' })
        }
        header='Delete Task'
        message={`Are you sure you want to delete "${deleteAlert.taskTitle}"?`}
        buttons={[
          {
            text: 'Cancel',
            role: 'cancel'
          },
          {
            text: 'Delete',
            role: 'destructive',
            handler: () => handleDeleteTask(deleteAlert.taskId)
          }
        ]}
      />

      <IonToast
        isOpen={toast.isOpen}
        onDidDismiss={() => setToast({ ...toast, isOpen: false })}
        message={toast.message}
        duration={3000}
        color={toast.color}
        position='top'
      />
    </div>
  )
}

export default TaskBoard
