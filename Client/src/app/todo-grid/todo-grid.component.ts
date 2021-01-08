import { Component, OnInit } from '@angular/core';

import { Todo } from '../interfaces/todo';
import {TodoService} from '../shared/todo.service';
import {Day} from '../interfaces/day';
import * as moment from 'moment';

@Component({
  selector: 'app-todo-grid',
  templateUrl: './todo-grid.component.html',
  styleUrls: ['./todo-grid.component.scss']
})
export class TodoGridComponent implements OnInit {
  private displayElements = 5;
  private loadNumber = 7;

  todoGrid: Day[] = [];
  listIds: string[] = [];
  n = this.loadNumber - 1;
  translation = 0;

  constructor(private todoService: TodoService) { }

  ngOnInit(): void {
    const now = moment();
    const startDay = now.clone().subtract(this.loadNumber, 'day');
    const endDay = now.clone().add(this.loadNumber, 'day');

    this.todoService.loadDays(startDay, endDay).subscribe(dayList => {
      this.listIds = this.generateIds(dayList);
      this.todoGrid = dayList;
    }, error => { console.log(error); });
  }

  generateIds(dayList: Day[]): string[] {
    const ids = [];
    for (const day of dayList) {
      ids.push(`drag-drop-list-${day.date.format('MM/DD/yyyy')}`);
    }
    return ids;
  }

  scrollLeft(steps: number): void {
    if (this.n >= steps) {
      this.n -= steps;
    } else {
      this.n = 0;
    }

    if (this.n === 0) {
      const endDay = this.todoGrid[0].date.clone().subtract(1, 'day');
      const startDay = endDay.clone().subtract(this.loadNumber, 'day');

      this.todoService.loadDays(startDay, endDay).subscribe(dayList => {
        this.listIds.unshift(...this.generateIds(dayList));
        this.todoGrid.unshift(...dayList);
        this.n += this.loadNumber + 1;
      }, error => { console.log(error); });
    }
  }

  scrollRight(steps: number): void {
    if (this.n + steps <= this.todoGrid.length - this.displayElements) {
      this.n += steps;
    } else {
      this.n = this.todoGrid.length - this.displayElements;
    }

    if (this.n === this.todoGrid.length - this.displayElements) {
      const startDay = this.todoGrid[this.todoGrid.length - 1].date.clone().add(1, 'day');
      const endDay = startDay.clone().add(this.loadNumber, 'day');

      this.todoService.loadDays(startDay, endDay).subscribe(dayList => {
        this.listIds.push(...this.generateIds(dayList));
        this.todoGrid.push(...dayList);
      }, error => { console.log(error); });
    }
  }

  scrollHome(): void {
    const now = moment();
    this.n = this.todoGrid.findIndex(t => t.date.isSame(now, 'day')) - 1;
  }
}
