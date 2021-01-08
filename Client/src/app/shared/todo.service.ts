import {Injectable} from '@angular/core';
import {Day, DayServer} from '../interfaces/day';
import * as moment from 'moment';
import {Observable} from 'rxjs';
import {Todo} from '../interfaces/todo';
import {HttpClient} from '@angular/common/http';
import {map} from 'rxjs/operators';
import { environment } from 'src/environments/environment';


@Injectable({
  providedIn: 'root'
})
export class TodoService {
  private baseUrl = environment.apiUrl;
  private dateFormat = 'MM-DD-YYYY';
  private id = 1;
  dayList: Day[] = [];

  constructor(private http: HttpClient) { }

  loadDays(from: moment.Moment, to: moment.Moment): Observable<Day[]> {
    const fromString = from.format(this.dateFormat);
    const toString = to.format(this.dateFormat);
    return this.http.get<DayServer[]>(`${this.baseUrl}/day/${fromString}/${toString}`)
      .pipe(map<DayServer[], Day[]>(days => {
        const now = moment();
        console.log('Got', days);

        const dayDict: { [date: string]: Day } = {};
        days.forEach(d => {
          const date = moment(d.date, this.dateFormat);
          dayDict[d.date] = { date, todos: d.todos.map(t => new Todo(t.id, t.content, t.completed)), past: date.isBefore(now, 'day') };
        });
        console.log('dict created.');

        const current = from.clone();
        const dayList: Day[] = [];

        while (current.isSameOrBefore(to, 'day')) {
          let day = dayDict[current.format(this.dateFormat)];
          if (!day) {
            day = { date: current.clone(), todos: [], past: current.isBefore(now, 'day') };
          }
          dayList.push(day);
          current.add(1, 'day');
        }
        console.log('End');
        return dayList;
      }));
    // return new Observable(subscriber => {
    //
    //   const current = from.clone();
    //   const dayList: Day[] = [];
    //   const now = moment();
    //   while (current.isSameOrBefore(to, 'day')) {
    //     dayList.push({
    //       date: current.clone(),
    //       todos: [],
    //       past: current.isBefore(now, 'day')
    //     });
    //     current.add(1, 'day');
    //   }
    //
    //   setTimeout(() => {
    //     subscriber.next(dayList);
    //   }, 1000);
    // });
  }

  createDayTodo(day: moment.Moment, todo: Todo): Observable<number> {
    return this.http.post<number>(`${this.baseUrl}/day/${day.format(this.dateFormat)}/todo`, todo);
    // return new Observable(subscriber => {
    //   setTimeout(() => {
    //     console.log(`todo ${this.id} was created.`);
    //     subscriber.next(this.id++);
    //   }, 1000);
    // });
  }

  deleteDayTodo(day: moment.Moment, todoId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/day/${day.format(this.dateFormat)}/todo/${todoId}`);

    // return new Observable<void>(subscriber => {
    //   setTimeout(() => {
    //     console.log(`todo ${todoId} was deleted.`);
    //     subscriber.next();
    //   }, 1000);
    // });
  }

  updateDayTodo(day: moment.Moment, todo: Todo): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/day/${day.format(this.dateFormat)}/todo/${todo.id}`, todo);
    // return new Observable<void>(subscriber => {
    //   setTimeout(() => {
    //     console.log(`todo ${todo.id} was updated.`);
    //     subscriber.next();
    //   }, 1000);
    // });
  }

  moveDayTodo(from: moment.Moment, to: moment.Moment, todoId: number): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/day/${from.format(this.dateFormat)}/${to.format(this.dateFormat)}/${todoId}`, {});
  }
}
