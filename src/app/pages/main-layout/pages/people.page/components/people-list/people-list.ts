import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { PeopleService } from '../../../../../../services/people.service';
import { combineLatest, debounceTime, map, Observable, startWith } from 'rxjs';
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
  loading$!: Observable<boolean>;
  page$!: Observable<number>;
  error$!: Observable<string | null>;
  nameControl = new FormControl('', { nonNullable: true });

  filteredPeople$!: Observable<PersonItem[]>;
  filter$!: Observable<string | null>;

  constructor(private peopleService: PeopleService) {}

  ngOnInit(): void {
    this.response$ = this.peopleService.peopleResponse$;
    this.loading$ = this.peopleService.loading$;
    this.page$ = this.peopleService.page$;
    this.filter$ = this.nameControl.valueChanges.pipe(startWith(''), debounceTime(300));

    this.filteredPeople$ = combineLatest([this.response$, this.filter$]).pipe(
      map(([response, filter]) => {
        if (!response) return [];
        if (!filter) return response.results;

        const term = filter.toLowerCase();
        return response.results.filter((p) => p.name.toLowerCase().includes(term));
      }),
    ); // TODO PUT THIS LOGIC IN A SEPARATED COMPONENT
  }

  nextPage() {
    this.peopleService.nextPage();
    this.resetFilter();
  }

  prevPage() {
    this.peopleService.prevPage();
    this.resetFilter();
  }

  tryAgain() {
    this.peopleService.tryAgain();
  }

  resetFilter() {
    this.nameControl.reset();
  }
}
