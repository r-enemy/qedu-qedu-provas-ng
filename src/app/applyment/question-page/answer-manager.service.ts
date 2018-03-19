import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { Answer } from '../../shared/model/answer';

@Injectable()
export class AnswerManagerService {
  protected answer: Answer = new Answer();
  protected answer$: BehaviorSubject<Answer>;
  protected interval: any;

  register(answer: Answer): Observable<Answer> {
    this.answer = this.cloneAnswer({
      ...answer,
      visualizedTimes: answer.visualizedTimes + 1,
    });
    this.answer$ = new BehaviorSubject<Answer>(this.answer);
    this.startTrackingTime();
    return this.answer$.asObservable();
  }

  setOption(optionId: number) {
    this.answer = this.cloneAnswer({ optionId });
    this.answer$.next(this.answer);
  }

  unregister() {
    clearInterval(this.interval);
  }

  private startTrackingTime() {
    clearInterval(this.interval);
    this.interval = setInterval(() => {
      this.answer = this.cloneAnswer({
        spentTimeInSeconds: this.answer.spentTimeInSeconds + 1,
      });
      this.answer$.next(this.answer);
    }, 1000);
  }

  private cloneAnswer(answer = {}): Answer {
    return new Answer({ ...this.answer, ...answer });
  }
}