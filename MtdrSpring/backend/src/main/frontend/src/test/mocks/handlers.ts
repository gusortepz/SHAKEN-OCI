import { http, HttpResponse } from 'msw'

export const handlers = [
  http.post('http://localhost:8080/api/auth/login', async () => {
    return HttpResponse.json({ token: 'fake-token' })
  }),
  
  http.get('http://localhost:8080/api/todolist', () => {
    return HttpResponse.json([
      {
        id: '1',
        description: 'Task 1',
        status: 'TODO',
        creation_ts: '2023-05-15T10:00:00Z',
        priority: 'HIGH',
        createdBy: 1,
        assignee: 2,
        projectId: 1,
        sprintId: 1,
        storyPoints: 3,
        estimatedTime: 5,
        realTime: 4
      }
    ])
  }),
  
  http.get('http://localhost:8080/kpi/all', () => {
    return HttpResponse.json({
      completedTasks: 10,
      pendingTasks: 5,
      averageCompletionTime: 3.5,
      tasksByPriority: {
        HIGH: 5,
        MEDIUM: 7,
        LOW: 3
      }
    })
  })
]
