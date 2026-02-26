import { ChangeDetectionStrategy, Component, Signal, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { concat, forkJoin, map, of, switchMap } from 'rxjs';
import { PeopleService } from '../../../../../../services/people.service';
import { CommonModule } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-people-detail',
  imports: [CommonModule, RouterLink],
  templateUrl: './people-detail.html',
  styleUrl: './people-detail.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PeopleDetail {
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly peopleService = inject(PeopleService);

  readonly error: Signal<string | null> = toSignal(this.peopleService.error$, {
    initialValue: null,
  });

  private readonly person$ = this.activatedRoute.paramMap.pipe(
    map((params) => params.get('id')),
    switchMap((id) => (id ? this.peopleService.getDetails(id) : of(null))),
    switchMap((res) => {
      if (!res) return of(null);

      const base$ = of(res);

      const relatedData$ = forkJoin({
        vehicles: this.peopleService.resolveNames(res.vehicles),
        starships: this.peopleService.resolveNames(res.starships),
        films: this.peopleService.resolveNames(res.films, 'title'),
      }).pipe(
        map((resolved) => ({
          ...res,
          ...resolved,
        })),
      );

      return concat(base$, relatedData$);
    }),
  );

  readonly person: Signal<Properties | null> = toSignal(this.person$, { initialValue: null });
}
