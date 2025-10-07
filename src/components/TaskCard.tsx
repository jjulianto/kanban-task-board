import { useRef } from 'react'
import {
  IonCard,
  IonCardContent,
  IonChip,
  IonIcon,
  IonProgressBar
} from '@ionic/react'
import {
  stopwatchOutline,
  checkboxOutline,
  trashOutline,
  attachOutline
} from 'ionicons/icons'
import { Task } from '../types/Task'
import { useDrag } from 'react-dnd'
import './TaskCard.css'

interface TaskCardProps {
  task: Task
  onEdit: (task: Task) => void
  onDelete: (taskId: string) => void
}

const TaskCard = ({ task, onEdit, onDelete }: TaskCardProps) => {
  const dragRef = useRef<HTMLIonCardElement>(null)
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'task',
    item: { id: task.id, columnId: task.column },
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  }))

  drag(dragRef)

  const completedSubtasks = task.subtasks.filter(
    (subtask) => subtask.completed
  ).length
  const totalSubtasks = task.subtasks.length
  const progress = totalSubtasks > 0 ? completedSubtasks / totalSubtasks : 0

  const getLabelColor = (label: string) => {
    switch (label.toLowerCase()) {
      case 'feature':
        return 'primary'
      case 'bug':
        return 'danger'
      case 'task':
        return 'warning'
      case 'issue':
        return 'warning'
      default:
        return 'medium'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high':
        return 'danger'
      case 'medium':
        return 'warning'
      case 'low':
        return 'success'
      default:
        return 'medium'
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short'
    })
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    onDelete(task.id)
  }

  return (
    <IonCard
      ref={dragRef}
      className='task-card'
      style={{ opacity: isDragging ? 0.5 : 1 }}
      onClick={() => onEdit(task)}
    >
      {task.coverImage && (
        <div className='task-cover-image'>
          <img src={task.coverImage} alt='Task cover' />
        </div>
      )}

      <div className='task-delete-btn' onClick={handleDelete}>
        <IonIcon icon={trashOutline} size='small' />
      </div>

      <IonCardContent className='task-content'>
        <div className='task-badges-section'>
          <IonChip
            color={getLabelColor(task.label)}
            className='task-label-chip'
          >
            {task.label}
          </IonChip>
          {task.priority && (
            <IonChip
              color={getPriorityColor(task.priority)}
              className='task-priority-chip'
            >
              {task.priority}
            </IonChip>
          )}
        </div>

        {totalSubtasks > 0 && (
          <div className='progress-section'>
            <IonProgressBar
              value={progress}
              color={progress === 1 ? 'success' : 'primary'}
              className='task-progress'
            />
          </div>
        )}

        <div className='task-info'>
          <h3 className='task-title'>{task.title}</h3>
          {task.description && (
            <p className='task-description'>{task.description}</p>
          )}
        </div>

        <div className='task-bottom'>
          <div className='task-meta'>
            {task.dueDate && (
              <div className='due-date'>
                <IonIcon icon={stopwatchOutline} size='small' />
                <span>{formatDate(task.dueDate)}</span>
              </div>
            )}

            {totalSubtasks > 0 && (
              <div className='progress-text'>
                <IonIcon icon={checkboxOutline} size='small' />
                <span>
                  {completedSubtasks}/{totalSubtasks}
                </span>
              </div>
            )}

            {task.attachments && task.attachments.length > 0 && (
              <div className='attachments-count'>
                <IonIcon icon={attachOutline} size='small' />
                <span>{task.attachments.length}</span>
              </div>
            )}
          </div>

          <div className='assignees-section'>
            {task.assignee && (
              <div className='assignee-avatar'>
                <div className='avatar-initials'>{task.assignee.initials}</div>
              </div>
            )}
          </div>
        </div>
      </IonCardContent>
    </IonCard>
  )
}

export default TaskCard
