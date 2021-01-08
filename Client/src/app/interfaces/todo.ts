// export interface Todo {
//   id: number;
//   content: string;
//   completed: boolean;
//   editing: boolean;
// }


export interface TodoServer {
  id: number;
  content: string;
  completed: boolean;
}

export class Todo {
  constructor(
    public id: number,
    public content: string,
    public completed: boolean,
    public editing: boolean = false) {}
}

