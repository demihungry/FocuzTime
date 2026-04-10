# FocuzTime
This is my final project for my Front End course. FocuzTime is a web-based productivity application designed to help users manage their daily tasks and stay focused.


## Core Features
- Task Management System 
- Task Completion Tracking 
- Pomodoro Focus Timer 
- Progress Overview Dashboard 

## Feature Details  
1. Task Management System
   - Functionality: Users can create, edit, and delete tasks. Each task will display in a list format.
   - User Interactions:
     - Users type a task into an input field
     - Click “Add” button to create a task
     - Click “X” button to remove a task
   - Technical Considerations:
     - React useState for managing tasks 
     - Components: TaskList, TaskItem 
2. Task Completion Tracking 
   - Functionality: Users can mark tasks as completed. 
   - User Interactions: 
      - Click checkbox to mark completed tasks 
      - Completed tasks will be visually different (e.g., strikethrough)
   - Technical Considerations: 
      - Boolean state for task completion
      - Conditional rendering for styling
      - CSS for completed task design 
3. Pomodoro Focus Timer 
   - Functionality: A timer that helps users focus using intervals (e.g., 25 minutes work, 5 minutes break). 
   - User Interactions:
     - Click start/pause/reset buttons
     - Timer countdown displayed on screen 
   - Technical Considerations:
     - React useState and useEffect for timer
     - setInterval for countdown logic
     - Separate Timer component 
4. Progress Overview Dashboard 
    - Functionality: Displays the number of completed and pending tasks
    - User Interactions: 
      - Users can view their daily progress
      - Simple visual indicators (e.g., progress bar)
    - Technical Considerations:
      - Derived state for task list
      - Basic UI components
