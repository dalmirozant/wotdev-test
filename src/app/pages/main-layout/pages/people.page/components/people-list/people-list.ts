import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { PeopleService } from '../../../../../../services/people.service';
import { debounceTime, distinctUntilChanged, map, startWith, switchMap } from 'rxjs';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-people-list',
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './people-list.html',
  styleUrl: './people-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PeopleList {
  private readonly peopleService = inject(PeopleService);

  nameControl = new FormControl('', { nonNullable: true });

  private readonly filter$ = this.nameControl.valueChanges.pipe(
    startWith(''),
    debounceTime(300),
    distinctUntilChanged(),
  );

  readonly response = toSignal(this.peopleService.peopleResponse$, {
    initialValue: undefined as PeopleResponse | null | undefined,
  });

  readonly page = toSignal(this.peopleService.page$, { initialValue: 1 });

  readonly error = toSignal(this.peopleService.error$, { initialValue: null });

  readonly filter = toSignal(this.filter$, { initialValue: '' });

  private readonly filteredPeople$ = this.filter$.pipe(
    switchMap((filter) => {
      const trimmed = filter.trim();

      if (trimmed.length > 0) {
        return this.peopleService.searchPeopleByName(trimmed).pipe(
          startWith(undefined as unknown as PersonItem[] | null | undefined),
        );
      }

      return this.peopleService.peopleResponse$.pipe(map((response) => response?.results));
    }),
  );

  readonly filteredPeople = toSignal(this.filteredPeople$, {
    initialValue: undefined as PersonItem[] | null | undefined,
  });

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
    this.peopleService.resetPage();
  }
}
