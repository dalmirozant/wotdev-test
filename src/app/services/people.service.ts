import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  BehaviorSubject,
  catchError,
  combineLatest,
  map,
  merge,
  Observable,
  of,
  shareReplay,
  startWith,
  Subject,
  switchMap,
  tap,
} from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PeopleService {
  private readonly baseUrl = 'https://www.swapi.tech/api/people';
  private readonly limit = 10;

  private pageSubject$ = new BehaviorSubject<number>(1);
  page$ = this.pageSubject$.asObservable();

  private errorSubject$ = new BehaviorSubject<string | null>(null);
  error$ = this.errorSubject$.asObservable();

  private retrySubject$ = new Subject<void>();
  retry$ = this.retrySubject$.asObservable().pipe(startWith(undefined));

  peopleResponse$: Observable<PeopleResponse | null> = combineLatest([
    this.page$,
    this.retry$,
  ]).pipe(
    switchMap(([page]) =>
      this.http.get<PeopleResponse>(`${this.baseUrl}?page=${page}&limit=${this.limit}`).pipe(
        map((response) => {
          this.errorSubject$.next(null);
          return response;
        }),
        catchError(() => {
          this.errorSubject$.next('Error loading characters');
          return of(null);
        }),
      ),
    ),
    shareReplay(1),
  );

  loading$ = merge(
    this.page$.pipe(map(() => true)),
    this.peopleResponse$.pipe(map(() => false)),
  ).pipe(startWith(true));

  constructor(private http: HttpClient) {}

  getDetails(id: string): Observable<Properties | null> {
    return this.http.get<Details>(`${this.baseUrl}/${id}`).pipe(
      map((details) => details.result.properties),
      catchError(() => {
        this.errorSubject$.next('Error loading details');
        return of(null);
      }),
    );
  }

  nextPage() {
    this.pageSubject$.next(this.pageSubject$.value + 1);
  }

  prevPage() {
    if (this.pageSubject$.value > 1) {
      this.pageSubject$.next(this.pageSubject$.value - 1);
    }
  }

  tryAgain() {
    this.retrySubject$.next();
  }
}
