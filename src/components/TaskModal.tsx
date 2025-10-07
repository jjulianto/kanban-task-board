import { useState, useEffect } from 'react'
import {
  IonModal,
  IonButton,
  IonIcon,
  IonInput,
  IonTextarea,
  IonSelect,
  IonSelectOption,
  IonDatetime,
  IonCheckbox,
  IonChip,
  IonProgressBar,
  IonPopover
} from '@ionic/react'
import {
  closeOutline,
  trashOutline,
  attachOutline,
  pencilOutline,
  checkmarkOutline,
  addOutline,
  imageOutline
} from 'ionicons/icons'
import {
  Task,
  Assignee,
  TaskLabel,
  TaskPriority,
  ColumnType,
  Subtask,
  Attachment
} from '../types/Task'
import './TaskModal.css'

interface TaskModalProps {
  isOpen: boolean
  task?: Task | null
  assignees: Assignee[]
  onClose: () => void
  onSave: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void
  initialColumn?: ColumnType
}

const TaskModal = ({
  isOpen,
  task,
  assignees,
  onClose,
  onSave,
  initialColumn = 'todo'
}: TaskModalProps) => {
  const [formData, setFormData] = useState<{
    title: string
    description: string
    assignee: Assignee | null
    dueDate: string | null
    label: TaskLabel
    priority: TaskPriority
    column: ColumnType
    subtasks: Subtask[]
    attachments: Attachment[]
    coverImage: string | undefined
  }>({
    title: '',
    description: '',
    assignee: null,
    dueDate: null,
    label: 'Undefined',
    priority: '',
    column: initialColumn,
    subtasks: [],
    attachments: [],
    coverImage: undefined
  })

  const [newSubtaskTitle, setNewSubtaskTitle] = useState('')
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [originalTitle, setOriginalTitle] = useState('')

  useEffect(() => {
    if (!isOpen) {
      setShowDatePicker(false)
      setNewSubtaskTitle('')
      setIsEditingTitle(false)
    }
  }, [isOpen])

  useEffect(() => {
    if (isOpen) {
      if (task) {
        setFormData({
          title: task.title,
          description: task.description,
          assignee: task.assignee,
          dueDate: task.dueDate,
          label: task.label,
          priority: task.priority || '',
          column: task.column,
          subtasks: task.subtasks,
          attachments: task.attachments,
          coverImage: task.coverImage
        })
        setIsEditingTitle(false)
      } else {
        setFormData({
          title: '',
          description: '',
          assignee: null,
          dueDate: null,
          label: 'Undefined',
          priority: '',
          column: initialColumn,
          subtasks: [],
          attachments: [],
          coverImage: undefined
        })
        setNewSubtaskTitle('')
        setShowDatePicker(false)
      }
    }
  }, [isOpen, task, initialColumn])

  const handleSave = () => {
    if (!formData.title) return

    onSave(formData)
    onClose()
  }

  const handleTitleSave = () => {
    if (task && formData.title.trim()) {
      onSave(formData)
    }
    setIsEditingTitle(false)
  }

  const handleTitleCancel = () => {
    setFormData((prev) => ({
      ...prev,
      title: originalTitle
    }))
    setIsEditingTitle(false)
  }

  const startEditingTitle = () => {
    setOriginalTitle(formData.title)
    setIsEditingTitle(true)
  }

  const addSubtask = () => {
    if (!newSubtaskTitle.trim()) return

    const newSubtask: Subtask = {
      id: Date.now().toString(),
      title: newSubtaskTitle,
      completed: false
    }

    setFormData((prev) => ({
      ...prev,
      subtasks: [...prev.subtasks, newSubtask]
    }))

    setNewSubtaskTitle('')
  }

  const toggleSubtask = (subtaskId: string) => {
    setFormData((prev) => ({
      ...prev,
      subtasks: prev.subtasks.map((subtask) =>
        subtask.id === subtaskId
          ? { ...subtask, completed: !subtask.completed }
          : subtask
      )
    }))
  }

  const deleteSubtask = (subtaskId: string) => {
    setFormData((prev) => ({
      ...prev,
      subtasks: prev.subtasks.filter((subtask) => subtask.id !== subtaskId)
    }))
  }

  return (
    <IonModal isOpen={isOpen} onDidDismiss={onClose} className='task-modal'>
      <div className='modal-container'>
        {/* Header */}
        <div className='modal-header'>
          {task ? (
            isEditingTitle ? (
              <div className='header-title-edit-container'>
                <IonInput
                  className='header-title-input'
                  value={formData.title}
                  onIonInput={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      title: e.detail.value!
                    }))
                  }
                  placeholder='Enter task title'
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleTitleSave()
                    }
                    if (e.key === 'Escape') {
                      handleTitleCancel()
                    }
                  }}
                  ref={(input) => {
                    if (input) {
                      const nativeInput = input.getInputElement()
                      nativeInput.then((el) => el?.focus())
                    }
                  }}
                />
                <div className='header-title-actions'>
                  <IonButton
                    fill='clear'
                    size='small'
                    onClick={handleTitleSave}
                    className='title-save-btn'
                  >
                    <IonIcon icon={checkmarkOutline} />
                  </IonButton>
                  <IonButton
                    fill='clear'
                    size='small'
                    onClick={handleTitleCancel}
                    className='title-cancel-btn'
                  >
                    <IonIcon icon={closeOutline} />
                  </IonButton>
                </div>
              </div>
            ) : (
              <div className='header-title-display'>
                <h2 className='modal-title-editable'>{formData.title}</h2>
                <IonButton
                  fill='clear'
                  size='small'
                  onClick={startEditingTitle}
                  className='edit-title-btn header-edit-btn'
                >
                  <IonIcon icon={pencilOutline} />
                </IonButton>
              </div>
            )
          ) : (
            <h2 className='modal-title'>Create New Task</h2>
          )}
          <IonButton fill='clear' onClick={onClose} className='close-btn'>
            <IonIcon icon={closeOutline} />
          </IonButton>
        </div>

        <div className='modal-content'>
          <div className='cover-image-section'>
            {formData.coverImage ? (
              <div className='cover-image-preview'>
                <img src={formData.coverImage} alt='Cover' />
                <div>
                  <IonButton
                    fill='clear'
                    size='small'
                    className='remove-cover-btn'
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        coverImage: undefined
                      }))
                    }
                  >
                    <IonIcon icon={trashOutline} slot='start' />
                    Remove Cover
                  </IonButton>
                </div>
              </div>
            ) : (
              <div
                className='add-cover-image'
                onClick={() => {
                  const dummyImages = [
                    'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=120&fit=crop',
                    'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=400&h=120&fit=crop',
                    'https://images.unsplash.com/photo-1563206767-5b18f218e8de?w=400&h=120&fit=crop',
                    'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&h=120&fit=crop',
                    'https://images.unsplash.com/photo-1557683311-eac922347aa1?w=400&h=120&fit=crop'
                  ]
                  const randomImage =
                    dummyImages[Math.floor(Math.random() * dummyImages.length)]
                  setFormData((prev) => ({ ...prev, coverImage: randomImage }))
                }}
              >
                <IonIcon icon={imageOutline} className='cover-icon' />
                <span className='cover-text'>Add Cover Image</span>
              </div>
            )}
          </div>

          {!task && (
            <div className='form-group'>
              <label className='field-label'>Title *</label>
              <IonInput
                className='field-input'
                value={formData.title}
                onIonInput={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.detail.value! }))
                }
                placeholder='Enter task title'
              />
            </div>
          )}

          {!task && (
            <div className='form-group description-section'>
              <label className='field-label'>Description</label>
              <IonTextarea
                className='field-textarea'
                value={formData.description}
                onIonInput={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.detail.value!
                  }))
                }
                placeholder='Enter task description'
                rows={3}
              />
            </div>
          )}

          <div className='form-row'>
            <div className='form-group half'>
              <label className='field-label'>Assignee</label>
              <div className='assignee-avatars'>
                {assignees.map((assignee) => (
                  <div
                    key={assignee.id}
                    className={`avatar ${
                      formData.assignee?.id === assignee.id ? 'selected' : ''
                    }`}
                    onClick={() => {
                      const newAssignee =
                        formData.assignee?.id === assignee.id ? null : assignee
                      setFormData((prev) => ({
                        ...prev,
                        assignee: newAssignee
                      }))
                    }}
                  >
                    {assignee.initials}
                  </div>
                ))}
              </div>
            </div>

            <div className='form-group half'>
              <label className='field-label'>Due Date</label>
              <div className='date-input-wrapper'>
                <IonInput
                  id='due-date-trigger'
                  className='date-input'
                  value={
                    formData.dueDate
                      ? new Date(formData.dueDate).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })
                      : ''
                  }
                  placeholder='Select date'
                  readonly
                  onClick={() => setShowDatePicker(true)}
                />
                <IonPopover
                  isOpen={showDatePicker}
                  trigger='due-date-trigger'
                  triggerAction='click'
                  dismissOnSelect={false}
                  onDidDismiss={() => setShowDatePicker(false)}
                  side='bottom'
                  alignment='end'
                  size='auto'
                  keepContentsMounted={true}
                >
                  <IonDatetime
                    key={showDatePicker ? 'open' : 'closed'}
                    value={formData.dueDate}
                    onIonChange={(e) => {
                      const dateValue = e.detail.value as string
                      setFormData((prev) => ({
                        ...prev,
                        dueDate: dateValue
                      }))
                      setShowDatePicker(false)
                    }}
                    presentation='date'
                    preferWheel={false}
                    color='primary'
                  />
                </IonPopover>
              </div>
            </div>
          </div>

          <div className='form-row label-priority-row'>
            <div className='form-group half'>
              <label className='field-label'>Label</label>
              <IonSelect
                className='field-select'
                value={formData.label}
                onIonChange={(e) =>
                  setFormData((prev) => ({ ...prev, label: e.detail.value }))
                }
                interface='popover'
              >
                <IonSelectOption value='Feature'>Feature</IonSelectOption>
                <IonSelectOption value='Bug'>Bug</IonSelectOption>
                <IonSelectOption value='Issue'>Issue</IonSelectOption>
                <IonSelectOption value='Undefined'>Undefined</IonSelectOption>
              </IonSelect>
            </div>

            <div className='form-group half'>
              <label className='field-label'>Priority (Optional)</label>
              <IonSelect
                className='field-select'
                value={formData.priority}
                placeholder='Select priority'
                onIonChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    priority: e.detail.value
                  }))
                }
                interface='popover'
              >
                <IonSelectOption value='Low'>Low</IonSelectOption>
                <IonSelectOption value='Medium'>Medium</IonSelectOption>
                <IonSelectOption value='High'>High</IonSelectOption>
              </IonSelect>
            </div>
          </div>

          {task && (
            <div className='form-group description-section'>
              <label className='field-label'>Description</label>
              <IonTextarea
                className='field-textarea'
                value={formData.description}
                onIonInput={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.detail.value!
                  }))
                }
                placeholder='Enter task description'
                rows={3}
              />
            </div>
          )}

          <div className='form-group attachments-section'>
            <label className='field-label'>Attachments</label>

            <div className='attachment-drop-zone'>
              <IonIcon icon={attachOutline} />
              <span>Click to add files (dummy)</span>
            </div>

            <div className='attachment-chips'>
              {formData.attachments.map((attachment) => (
                <IonChip
                  key={attachment.id}
                  outline
                  className='attachment-chip'
                >
                  <IonIcon icon={attachOutline} />
                  {attachment.name}
                  <IonIcon
                    icon={closeOutline}
                    onClick={() => {
                      setFormData((prev) => ({
                        ...prev,
                        attachments: prev.attachments.filter(
                          (att) => att.id !== attachment.id
                        )
                      }))
                    }}
                  />
                </IonChip>
              ))}
            </div>
          </div>

          <div className='form-group'>
            <div className='checklist-header'>
              <label className='field-label'>Check List</label>
              <span className='checklist-counter'>
                {formData.subtasks.filter((st) => st.completed).length}/
                {formData.subtasks.length}
              </span>
            </div>

            {formData.subtasks.length > 0 && (
              <IonProgressBar
                value={
                  formData.subtasks.filter((st) => st.completed).length /
                  formData.subtasks.length
                }
                className={`checklist-progress ${
                  formData.subtasks.length > 0 &&
                  formData.subtasks.filter((st) => st.completed).length ===
                    formData.subtasks.length
                    ? 'complete'
                    : ''
                }`}
              />
            )}

            <div className='checklist-container'>
              {formData.subtasks.map((subtask) => (
                <div key={subtask.id} className='checklist-item'>
                  <IonCheckbox
                    checked={subtask.completed}
                    onIonChange={() => toggleSubtask(subtask.id)}
                  />
                  <span className={subtask.completed ? 'completed-item' : ''}>
                    {subtask.title}
                  </span>
                  <IonButton
                    fill='clear'
                    size='small'
                    color='danger'
                    onClick={() => deleteSubtask(subtask.id)}
                    className='delete-item-btn'
                  >
                    <IonIcon icon={trashOutline} />
                  </IonButton>
                </div>
              ))}
            </div>

            <div className='add-checklist-container'>
              {!newSubtaskTitle ? (
                <button
                  className='add-subtask-button'
                  onClick={() => setNewSubtaskTitle(' ')}
                >
                  <IonIcon icon={addOutline} />
                  <span>Add subtask</span>
                </button>
              ) : (
                <div className='add-subtask-input-container'>
                  <IonInput
                    className='add-checklist-input'
                    value={newSubtaskTitle}
                    onIonInput={(e) => setNewSubtaskTitle(e.detail.value!)}
                    placeholder='Enter subtask title'
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        addSubtask()
                      }
                      if (e.key === 'Escape') {
                        setNewSubtaskTitle('')
                      }
                    }}
                    autofocus
                  />
                  <div className='add-subtask-actions'>
                    <IonButton
                      size='small'
                      onClick={addSubtask}
                      disabled={!newSubtaskTitle.trim()}
                    >
                      Add
                    </IonButton>
                    <IonButton
                      size='small'
                      fill='clear'
                      onClick={() => setNewSubtaskTitle('')}
                    >
                      Cancel
                    </IonButton>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className='modal-footer'>
          <IonButton fill='outline' onClick={onClose} className='cancel-btn'>
            Cancel
          </IonButton>
          <IonButton
            onClick={handleSave}
            disabled={!formData.title.trim()}
            className='done-btn'
          >
            Done
          </IonButton>
        </div>
      </div>
    </IonModal>
  )
}

export default TaskModal
