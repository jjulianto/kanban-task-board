import { useState, useEffect } from 'react'
import {
  IonModal,
  IonButton,
  IonIcon,
  IonInput,
  IonDatetime,
  IonCheckbox,
  IonPopover
} from '@ionic/react'
import { closeOutline } from 'ionicons/icons'
import { Assignee, TaskLabel, FilterOptions } from '../types/Task'
import './FilterModal.css'

interface FilterModalProps {
  isOpen: boolean
  assignees: Assignee[]
  currentFilters: FilterOptions
  onClose: () => void
  onApplyFilters: (filters: FilterOptions) => void
  onClearFilters: () => void
}

const FilterModal = ({
  isOpen,
  assignees,
  currentFilters,
  onClose,
  onApplyFilters,
  onClearFilters
}: FilterModalProps) => {
  const [filters, setFilters] = useState<FilterOptions>(currentFilters)
  const [selectedCategory, setSelectedCategory] = useState<string>('assignee')
  const [showDatePicker, setShowDatePicker] = useState(false)

  useEffect(() => {
    setFilters(currentFilters)
  }, [currentFilters, isOpen])

  const handleApply = () => {
    onApplyFilters(filters)
    onClose()
  }

  const handleClear = () => {
    setFilters({})
    onClearFilters()
    onClose()
  }

  const labels: TaskLabel[] = ['Feature', 'Bug', 'Issue', 'Undefined']

  const filterCategories = [
    {
      id: 'assignee',
      label: 'Assignee',
      active: selectedCategory === 'assignee'
    },
    { id: 'labels', label: 'Labels', active: selectedCategory === 'labels' },
    { id: 'duedate', label: 'Due Date', active: selectedCategory === 'duedate' }
  ]

  return (
    <IonModal isOpen={isOpen} onDidDismiss={onClose} className='filter-modal'>
      <div className='filter-modal-container'>
        <div className='filter-modal-header'>
          <h2 className='filter-modal-title'>Filter</h2>
          <IonButton fill='clear' onClick={onClose} className='close-btn'>
            <IonIcon icon={closeOutline} />
          </IonButton>
        </div>

        <div className='filter-modal-content'>
          <div className='filter-sidebar'>
            {filterCategories.map((category) => (
              <div
                key={category.id}
                className={`filter-category ${category.active ? 'active' : ''}`}
                onClick={() => setSelectedCategory(category.id)}
              >
                {category.label}
              </div>
            ))}
          </div>

          <div className='filter-main-content'>
            {selectedCategory === 'assignee' && (
              <div className='filter-content-section'>
                <div className='filter-options'>
                  <div className='filter-option'>
                    <IonCheckbox
                      checked={
                        filters.assignees?.includes('unassigned') || false
                      }
                      onIonChange={(e) => {
                        const checked = e.detail.checked
                        setFilters((prev) => {
                          const currentAssignees = prev.assignees || []
                          if (checked) {
                            return {
                              ...prev,
                              assignees: [...currentAssignees, 'unassigned']
                            }
                          } else {
                            return {
                              ...prev,
                              assignees: currentAssignees.filter(
                                (a: string) => a !== 'unassigned'
                              )
                            }
                          }
                        })
                      }}
                    />
                    <span className='filter-option-label'>Unassigned</span>
                  </div>
                  {assignees.map((assignee) => (
                    <div key={assignee.id} className='filter-option'>
                      <IonCheckbox
                        checked={
                          filters.assignees?.includes(assignee.id) || false
                        }
                        onIonChange={(e) => {
                          const checked = e.detail.checked
                          setFilters((prev) => {
                            const currentAssignees = prev.assignees || []
                            if (checked) {
                              return {
                                ...prev,
                                assignees: [...currentAssignees, assignee.id]
                              }
                            } else {
                              return {
                                ...prev,
                                assignees: currentAssignees.filter(
                                  (a: string) => a !== assignee.id
                                )
                              }
                            }
                          })
                        }}
                      />
                      <div className='assignee-option'>
                        <div className='assignee-avatar'>
                          {assignee.initials}
                        </div>
                        <span className='filter-option-label'>
                          {assignee.name}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedCategory === 'labels' && (
              <div className='filter-content-section'>
                <div className='filter-options'>
                  {labels.map((label) => (
                    <div key={label} className='filter-option'>
                      <IonCheckbox
                        checked={filters.labels?.includes(label) || false}
                        onIonChange={(e) => {
                          const checked = e.detail.checked
                          setFilters((prev) => {
                            const currentLabels = prev.labels || []
                            if (checked) {
                              return {
                                ...prev,
                                labels: [...currentLabels, label]
                              }
                            } else {
                              return {
                                ...prev,
                                labels: currentLabels.filter(
                                  (l: TaskLabel) => l !== label
                                )
                              }
                            }
                          })
                        }}
                      />
                      <span className='filter-option-label'>{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedCategory === 'duedate' && (
              <div className='filter-content-section'>
                <div className='single-date-section'>
                  <label className='date-label'>
                    Show tasks due on or before
                  </label>
                  <div className='date-input-wrapper'>
                    <IonInput
                      id='filter-date-trigger'
                      className='filter-date-input'
                      value={
                        filters.dueDate
                          ? new Date(filters.dueDate).toLocaleDateString(
                              'en-GB',
                              {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric'
                              }
                            )
                          : ''
                      }
                      placeholder='Select date'
                      readonly
                      onClick={() => setShowDatePicker(true)}
                    />
                    <IonPopover
                      isOpen={showDatePicker}
                      trigger='filter-date-trigger'
                      triggerAction='click'
                      dismissOnSelect={false}
                      onDidDismiss={() => setShowDatePicker(false)}
                      side='bottom'
                      alignment='start'
                      size='auto'
                      keepContentsMounted={true}
                    >
                      <IonDatetime
                        key={showDatePicker ? 'open' : 'closed'}
                        value={filters.dueDate}
                        onIonChange={(e) => {
                          const dateValue = e.detail.value as string
                          setFilters((prev) => ({
                            ...prev,
                            dueDate: dateValue,
                            dueDateStart: undefined,
                            dueDateEnd: undefined
                          }))
                          setShowDatePicker(false)
                        }}
                        presentation='date'
                        showDefaultButtons={false}
                        preferWheel={false}
                        color='primary'
                      />
                    </IonPopover>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className='filter-modal-footer'>
          <div className='footer-buttons'>
            <IonButton
              fill='outline'
              onClick={handleClear}
              className='clear-btn'
            >
              Clear All
            </IonButton>
            <IonButton onClick={handleApply} className='apply-btn'>
              Apply Filters
            </IonButton>
          </div>
        </div>
      </div>
    </IonModal>
  )
}

export default FilterModal
