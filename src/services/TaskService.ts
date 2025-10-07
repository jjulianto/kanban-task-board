import { Storage } from '@ionic/storage'
import { Task, Board, ColumnType, Assignee } from '../types/Task'

class TaskService {
  private storage: Storage | null = null
  private readonly BOARD_KEY = 'task_board'
  private readonly ASSIGNEES_KEY = 'assignees'

  async init() {
    if (!this.storage) {
      const storage = new Storage()
      this.storage = await storage.create()
    }
  }

  // Default data
  private getDefaultAssignees(): Assignee[] {
    return [
      { id: '1', name: 'John Doe', initials: 'JD' },
      { id: '2', name: 'Jane Smith', initials: 'JS' },
      { id: '3', name: 'Mike Johnson', initials: 'MJ' },
      { id: '4', name: 'Sarah Wilson', initials: 'SW' },
      { id: '5', name: 'David Brown', initials: 'DB' }
    ]
  }

  private getDefaultBoard(): Board {
    return {
      id: 'main-board',
      title: 'Task Management Board',
      columns: [
        {
          id: 'todo',
          title: 'To Do',
          color: '#3880ff',
          tasks: [
            {
              id: '1',
              title: 'Setup project structure',
              description:
                'Initialize the basic project structure and components for the task management application',
              assignee: { id: '1', name: 'John Doe', initials: 'JD' },
              dueDate: '2025-10-15',
              label: 'Feature',
              priority: 'High',
              subtasks: [
                {
                  id: '1-1',
                  title: 'Create components folder',
                  completed: true
                },
                { id: '1-2', title: 'Setup routing', completed: false },
                { id: '1-3', title: 'Configure TypeScript', completed: false }
              ],
              attachments: [
                { id: '1-1', name: 'requirements.pdf', type: 'PDF' },
                { id: '1-2', name: 'mockup.figma', type: 'Figma' }
              ],
              coverImage:
                'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=120&fit=crop',
              column: 'todo',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            },
            {
              id: '4',
              title: 'Write unit tests',
              description:
                'Create comprehensive unit tests for all components and services',
              assignee: { id: '4', name: 'Sarah Wilson', initials: 'SW' },
              dueDate: '2025-10-25',
              label: 'Issue',
              priority: 'Medium',
              subtasks: [
                {
                  id: '4-1',
                  title: 'Test TaskCard component',
                  completed: false
                },
                { id: '4-2', title: 'Test TaskService', completed: false }
              ],
              attachments: [],
              coverImage:
                'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=120&fit=crop',
              column: 'todo',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }
          ]
        },
        {
          id: 'doing',
          title: 'Doing',
          color: '#ffce00',
          tasks: [
            {
              id: '2',
              title: 'Implement drag and drop',
              description: 'Add drag and drop functionality for task cards',
              assignee: { id: '2', name: 'Jane Smith', initials: 'JS' },
              dueDate: '2025-10-20',
              label: 'Feature',
              priority: 'Medium',
              subtasks: [
                { id: '2-1', title: 'Research libraries', completed: true },
                { id: '2-2', title: 'Implement basic drag', completed: false },
                { id: '2-3', title: 'Add drop zones', completed: false }
              ],
              attachments: [],
              coverImage:
                'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=400&h=120&fit=crop',
              column: 'doing',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }
          ]
        },
        {
          id: 'review',
          title: 'Review',
          color: '#ff6600',
          tasks: [
            {
              id: '5',
              title: 'Code review for authentication',
              description:
                'Review the authentication implementation and security measures',
              assignee: { id: '5', name: 'David Brown', initials: 'DB' },
              dueDate: '2025-10-12',
              label: 'Bug',
              priority: 'High',
              subtasks: [
                {
                  id: '5-1',
                  title: 'Check security vulnerabilities',
                  completed: true
                },
                { id: '5-2', title: 'Test edge cases', completed: false },
                { id: '5-3', title: 'Performance review', completed: false }
              ],
              attachments: [
                { id: '5-1', name: 'security-checklist.xlsx', type: 'Excel' }
              ],
              coverImage:
                'https://images.unsplash.com/photo-1563206767-5b18f218e8de?w=400&h=120&fit=crop',
              column: 'review',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }
          ]
        },
        {
          id: 'done',
          title: 'Done',
          color: '#2dd36f',
          tasks: [
            {
              id: '3',
              title: 'Design UI mockups',
              description: 'Create initial UI design and wireframes',
              assignee: { id: '3', name: 'Mike Johnson', initials: 'MJ' },
              dueDate: '2025-10-05',
              label: 'Issue',
              priority: 'Low',
              subtasks: [
                { id: '3-1', title: 'Create wireframes', completed: true },
                { id: '3-2', title: 'Design components', completed: true }
              ],
              attachments: [
                { id: '3-1', name: 'mockup.figma', type: 'Figma' },
                { id: '3-2', name: 'colors.png', type: 'PNG' }
              ],
              coverImage:
                'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=400&h=120&fit=crop',
              column: 'done',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }
          ]
        },
        {
          id: 'rework',
          title: 'Rework',
          color: '#eb445a',
          tasks: [
            {
              id: '6',
              title: 'Fix responsive design issues',
              description: 'Address mobile layout problems reported by QA team',
              assignee: { id: '2', name: 'Jane Smith', initials: 'JS' },
              dueDate: '2025-10-10',
              label: 'Bug',
              priority: 'High',
              subtasks: [
                { id: '6-1', title: 'Fix tablet layout', completed: false },
                {
                  id: '6-2',
                  title: 'Improve mobile navigation',
                  completed: false
                }
              ],
              attachments: [
                { id: '6-1', name: 'bug-report.pdf', type: 'PDF' },
                { id: '6-2', name: 'screenshots.zip', type: 'ZIP' }
              ],
              column: 'rework',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }
          ]
        }
      ]
    }
  }

  async getBoard(): Promise<Board> {
    await this.init()
    const board = await this.storage!.get(this.BOARD_KEY)
    return board || this.getDefaultBoard()
  }

  async saveBoard(board: Board): Promise<void> {
    await this.init()
    await this.storage!.set(this.BOARD_KEY, board)
  }

  async getAssignees(): Promise<Assignee[]> {
    await this.init()
    const assignees = await this.storage!.get(this.ASSIGNEES_KEY)
    return assignees || this.getDefaultAssignees()
  }

  async saveAssignees(assignees: Assignee[]): Promise<void> {
    await this.init()
    await this.storage!.set(this.ASSIGNEES_KEY, assignees)
  }

  async createTask(
    task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Task> {
    const newTask: Task = {
      ...task,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    const board = await this.getBoard()
    const column = board.columns.find((col) => col.id === task.column)
    if (column) {
      column.tasks.push(newTask)
      await this.saveBoard(board)
    }

    return newTask
  }

  async updateTask(
    taskId: string,
    updates: Partial<Task>
  ): Promise<Task | null> {
    const board = await this.getBoard()

    for (const column of board.columns) {
      const taskIndex = column.tasks.findIndex((task) => task.id === taskId)
      if (taskIndex !== -1) {
        const updatedTask = {
          ...column.tasks[taskIndex],
          ...updates,
          updatedAt: new Date().toISOString()
        }

        if (
          updates.column &&
          updates.column !== column.tasks[taskIndex].column
        ) {
          column.tasks.splice(taskIndex, 1)
          const newColumn = board.columns.find(
            (col) => col.id === updates.column
          )
          if (newColumn) {
            newColumn.tasks.push(updatedTask)
          }
        } else {
          column.tasks[taskIndex] = updatedTask
        }

        await this.saveBoard(board)
        return updatedTask
      }
    }

    return null
  }

  async deleteTask(taskId: string): Promise<boolean> {
    const board = await this.getBoard()

    for (const column of board.columns) {
      const taskIndex = column.tasks.findIndex((task) => task.id === taskId)
      if (taskIndex !== -1) {
        column.tasks.splice(taskIndex, 1)
        await this.saveBoard(board)
        return true
      }
    }

    return false
  }

  async moveTask(taskId: string, newColumnId: ColumnType): Promise<boolean> {
    return !!(await this.updateTask(taskId, { column: newColumnId }))
  }

  generateId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9)
  }
}

export default new TaskService()
