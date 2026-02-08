import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { PeopleService } from '../../../../../../services/people.service';
import {
  BehaviorSubject,
  combineLatest,
  debounceTime,
  map,
  Observable,
  startWith,
  switchMap,
} from 'rxjs';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-people-list',
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './people-list.html',
  styleUrl: './people-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PeopleList implements OnInit {
  response$!: Observable<PeopleResponse | null>;
  loading$!: BehaviorSubject<boolean>;
  page$!: Observable<number>;
  error$!: Observable<string | null>;
  nameControl = new FormControl('', { nonNullable: true });

  filteredPeople$!: Observable<PersonItem[] | null | undefined>;
  filter$!: Observable<string | null>;

  constructor(private peopleService: PeopleService) {}

  ngOnInit(): void {
    this.response$ = this.peopleService.peopleResponse$;
    this.page$ = this.peopleService.page$;
    this.filter$ = this.nameControl.valueChanges.pipe(startWith(''), debounceTime(300));

    this.filteredPeople$ = combineLatest([this.page$, this.filter$]).pipe(
      switchMap(([page, filter]) => {
        if (filter && filter.length > 0) {
          return this.peopleService.searchPeopleByName(filter);
        }

        return this.peopleService.peopleResponse$.pipe(
          map((response) => response?.results),
          startWith(undefined),
        );
      }),
    ); // TODO PUT THIS LOGIC IN A SEPARATED COMPONENT
  }

  nextPage() {
    this.peopleService.nextPage();
  }

  prevPage() {
    this.peopleService.prevPage();
  }

  tryAgain() {
    this.peopleService.tryAgain();
  }

  resetFilter() {
    this.nameControl.reset();
  }
}
