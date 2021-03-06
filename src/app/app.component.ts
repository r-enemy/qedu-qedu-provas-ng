import {Component, HostListener, OnInit} from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { StoreService } from './core/services/store.service';

declare const ga: Function;

@Component({
  selector: 'qp-app',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.sass']
})
export class AppComponent implements OnInit {
  current_date: Date;

  @HostListener('window:beforeunload', ['$event']) beforeUnload(e) {
    return false;
  }

  constructor (public store: StoreService, private _router: Router) {
  }

  ngOnInit () {
    this.current_date = new Date();

    this._router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        ga('set', 'page', event.urlAfterRedirects);
        ga('send', 'pageview');
      }
    });

  }
}
