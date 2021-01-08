import {Component, Input, OnInit} from '@angular/core';
import { Todo } from '../interfaces/todo';
import {Day} from '../interfaces/day';
import {TodoService} from '../shared/todo.service';
import {CdkDragDrop, moveItemInArray, transferArrayItem} from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-todo-list',
  templateUrl: './todo-list.component.html',
  styleUrls: ['./todo-list.component.scss']
})
export class TodoListComponent implements OnInit {

  @Input() day!: Day;
  @Input() listIds!: string[];
  todoTitle = '';
  beforeEditCache = '';
  private isSingleClick = true;

  constructor(private todoService: TodoService) { }

  ngOnInit(): void {
  }

  createTodo(): void {
    if (this.todoTitle.trim().length === 0) {
      return;
    }

    const todo = {
      id: 0,
      content: this.todoTitle.trim(),
      completed: false,
      editing: false
    };

    this.todoService.createDayTodo(this.day.date, todo).subscribe(id => {
      todo.id = id;
      this.day.todos.push(todo);
    });

    this.todoTitle = '';
  }

  completeTodo(todo: Todo): void {
    this.isSingleClick = true;
    setTimeout(() => {
      if (this.isSingleClick) {
        todo.completed = !todo.completed;
        this.todoService.updateDayTodo(this.day.date, todo).subscribe(() => {}, error => {
          todo.completed = !todo.completed;
          console.log(error);
        });
      }
    }, 250);
  }

  editTodo(todo: Todo): void {
    this.isSingleClick = false;
    this.beforeEditCache = todo.content;
    todo.editing = true;
  }

  doneEdit(todo: Todo): void {
    const trimmedContent = todo.content.trim();
    if (trimmedContent.length === 0) {
      this.deleteTodo(todo.id);
    } else if (trimmedContent !== this.beforeEditCache) {
      const beforeEditCache = this.beforeEditCache;
      todo.content = trimmedContent;
      this.todoService.updateDayTodo(this.day.date, todo).subscribe(() => {}, error => {
        todo.content = beforeEditCache;
        console.log(error);
      });
    }

    todo.editing = false;
  }

  deleteTodo(id: number): void {
    this.todoService.deleteDayTodo(this.day.date, id).subscribe(() => {
      this.day.todos = this.day.todos.filter(todo => todo.id !== id);
    }, error => { console.log(error); });
  }

  moveTodo(from: moment.Moment, to: moment.Moment, id: number): void {
    this.todoService.moveDayTodo(from, to, id)
      .subscribe(() => {}, error => { console.log(error); });
  }

  blurInput(event: Event): void {
    const target = (event as KeyboardEvent)?.target as HTMLInputElement;
    target.blur();
  }

  drop(event: CdkDragDrop<Day>): void {
    console.log(event);
    console.log(event.container.data);
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data.todos, event.previousIndex, event.currentIndex);
    } else {
      this.moveTodo(
        event.previousContainer.data.date,
        event.container.data.date,
        event.previousContainer.data.todos[event.previousIndex].id);
      transferArrayItem(event.previousContainer.data.todos,
        event.container.data.todos,
        event.previousIndex,
        event.currentIndex);
    }
  }
}
