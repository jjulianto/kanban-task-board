export interface Assignee {
  id: string
  name: string
  avatar?: string
  initials: string
}

export interface Subtask {
  id: string
  title: string
  completed: boolean
}

export interface Attachment {
  id: string
  name: string
  type: string
  size?: string
}

export type TaskLabel = 'Feature' | 'Bug' | 'Issue' | 'Task' | 'Undefined'
export type TaskPriority = 'Low' | 'Medium' | 'High' | ''
export type ColumnType = 'todo' | 'doing' | 'review' | 'done' | 'rework'

export interface Task {
  id: string
  title: string
  description: string
  assignee: Assignee | null
  dueDate: string | null
  label: TaskLabel
  priority?: TaskPriority
  subtasks: Subtask[]
  attachments: Attachment[]
  column: ColumnType
  coverImage?: string
  createdAt: string
  updatedAt: string
}

export interface Column {
  id: ColumnType
  title: string
  color: string
  tasks: Task[]
}

export interface Board {
  id: string
  title: string
  columns: Column[]
}

export interface FilterOptions {
  assignee?: string
  assignees?: string[]
  label?: TaskLabel
  labels?: TaskLabel[]
  priority?: TaskPriority
  dueDate?: string
  dueDateStart?: string
  dueDateEnd?: string
  searchQuery?: string
}
