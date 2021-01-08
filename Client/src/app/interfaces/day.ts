import {Todo, TodoServer} from './todo';
import * as moment from 'moment';

export interface DayServer {
  date: string;
  todos: TodoServer[];
}

export interface Day {
  date: moment.Moment;
  todos: Todo[];
  past: boolean;
}


