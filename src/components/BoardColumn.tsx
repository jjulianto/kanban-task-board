import { useRef } from 'react'
import {
  IonCard,
  IonCardHeader,
  IonCardContent,
  IonCardTitle,
  IonIcon,
  IonButton
} from '@ionic/react'
import { addOutline } from 'ionicons/icons'
import { Column, Task } from '../types/Task'
import TaskCard from './TaskCard'
import { useDrop } from 'react-dnd'
import './BoardColumn.css'

interface BoardColumnProps {
  column: Column
  onTaskEdit: (task: Task) => void
  onTaskDelete: (taskId: string) => void
  onTaskMove: (taskId: string, newColumnId: string) => void
  onAddTask: (columnId: string) => void
}

const BoardColumn = ({
  column,
  onTaskEdit,
  onTaskDelete,
  onTaskMove,
  onAddTask
}: BoardColumnProps) => {
  const dropRef = useRef<HTMLIonCardElement>(null)
  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: 'task',
    drop: (item: { id: string; columnId: string }) => {
      if (item.columnId !== column.id) {
        onTaskMove(item.id, column.id)
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop()
    })
  }))

  drop(dropRef)
  const isActive = isOver && canDrop

  return (
    <IonCard
      ref={dropRef}
      className={`board-column ${isActive ? 'drop-active' : ''} ${
        isOver ? 'drop-over' : ''
      }`}
    >
      <IonCardHeader className='column-header'>
        <div className='column-title-row'>
          <IonCardTitle className='column-title'>{column.title}</IonCardTitle>
          <IonButton
            fill='clear'
            size='small'
            className='add-task-btn'
            onClick={() => onAddTask(column.id)}
          >
            <IonIcon icon={addOutline} />
          </IonButton>
        </div>
      </IonCardHeader>

      <IonCardContent className='column-content'>
        <div className='tasks-container'>
          {column.tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={onTaskEdit}
              onDelete={onTaskDelete}
            />
          ))}

          {column.tasks.length === 0 && (
            <div className='empty-column'>
              <p>No tasks yet</p>
              <IonButton
                fill='outline'
                size='small'
                onClick={() => onAddTask(column.id)}
              >
                <IonIcon icon={addOutline} slot='start' />
                Add First Task
              </IonButton>
            </div>
          )}
        </div>

        {isActive && <div className='drop-indicator'></div>}
      </IonCardContent>
    </IonCard>
  )
}

export default BoardColumn
