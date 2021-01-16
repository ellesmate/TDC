import { Component, OnInit } from '@angular/core';
import SwiperCore, { Virtual, Navigation, Pagination, Mousewheel, Swiper, SwiperOptions } from 'swiper/core';

import {TodoService} from '../shared/todo.service';
import {Day} from '../interfaces/day';
import * as moment from 'moment';

SwiperCore.use([Virtual, Navigation, Pagination, Mousewheel]);

@Component({
  selector: 'app-todo-grid',
  templateUrl: './todo-grid.component.html',
  styleUrls: ['./todo-grid.component.scss']
})
export class TodoGridComponent implements OnInit {
  displayElements = 5;
  private loadNumber = 7;

  todoGrid: Day[] = [];
  listIds: string[] = [];
  n = this.loadNumber - 1;
  translation = 0;
  // slides = Array.from({ length: 2 });
  slidesData = {
    offset: 0,
    from: 0,
    to: 0,
    slides: []
  };

  swiperOptions: SwiperOptions = {
    speed: 400,
    spaceBetween: 0,
    breakpoints: {
      320: {
        slidesPerView: 1
      },
      480: {
        slidesPerView: 3
      },
      720: {
        slidesPerView: 4
      },
      840: {
        slidesPerView: 5
      }
    },
    observer: true,
    allowTouchMove: false,
    on: {
      init: () => {
        const now = moment();
        const startDay = now.clone().subtract(this.loadNumber, 'day');
        const endDay = now.clone().add(this.loadNumber, 'day');

        this.todoService.loadDays(startDay, endDay).subscribe(dayList => {
          this.listIds = this.generateIds(dayList);
          this.todoGrid = dayList;
          this.swiper.update();
          this.swiper.updateSlides();
          this.swiper.updateSize();
          this.swiper.updateSlidesClasses();
          this.swiper.navigation.update();

          // setTimeout(() => {
          console.log(`Init: Goto ${this.loadNumber}`);
          this.swiper.slideTo(this.loadNumber, 0);
          // }, 50);
          console.log('Grid', this.todoGrid);
        }, error => { console.log(error); });
      },
      reachBeginning: () => {
        if (this.todoGrid.length === 0) {
          return;
        }
        const endDay = this.todoGrid[0].date.clone().subtract(1, 'day');
        const startDay = endDay.clone().subtract(this.loadNumber, 'day');

        this.todoService.loadDays(startDay, endDay).subscribe(dayList => {
          this.listIds.unshift(...this.generateIds(dayList));
          this.todoGrid.unshift(...dayList);
          console.log(`ReachBeginning: Goto ${dayList.length}`);
          this.swiper.slideTo(dayList.length, 0);
        }, error => { console.log(error); });
      },
      reachEnd: () => {
        if (this.todoGrid.length === 0) {
          return;
        }
        const startDay = this.todoGrid[this.todoGrid.length - 1].date.clone().add(1, 'day');
        const endDay = startDay.clone().add(this.loadNumber, 'day');

        this.todoService.loadDays(startDay, endDay).subscribe(dayList => {
          const index = this.swiper.realIndex;
          this.listIds.push(...this.generateIds(dayList));
          this.todoGrid.push(...dayList);
          setTimeout(() => {
            console.log(`ReachEnd: Goto ${index}`);
            this.swiper.slideTo(index, 0);
          }, 50);
        }, error => { console.log(error); });
      }
    }
  };
  swiper!: Swiper;

  constructor(private todoService: TodoService) { }

  ngOnInit(): void {
    this.swiper = new Swiper('.swiper-container', this.swiperOptions);
  }

  generateIds(dayList: Day[]): string[] {
    const ids = [];
    for (const day of dayList) {
      ids.push(`drag-drop-list-${day.date.format('MM/DD/yyyy')}`);
    }
    return ids;
  }

  scrollLeft(steps: number): void {
    this.swiper.slideTo(this.swiper.realIndex - steps);
  }

  scrollRight(steps: number): void {
    this.swiper.slideTo(this.swiper.realIndex + steps);
  }

  scrollHome(): void {
    const now = moment();
    const index = this.todoGrid.findIndex(t => t.date.isSame(now, 'day')) - 1;
    this.swiper.slideTo(index + 1);
  }
}
