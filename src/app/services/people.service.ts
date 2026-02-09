import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  BehaviorSubject,
  catchError,
  combineLatest,
  from,
  map,
  merge,
  mergeMap,
  Observable,
  of,
  shareReplay,
  startWith,
  Subject,
  switchMap,
  toArray,
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

  peopleResponse$: Observable<PeopleResponse | null | undefined> = combineLatest([
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
        startWith(undefined),
      ),
    ),
    shareReplay(1),
  );

  searchPeopleByName(name: string): Observable<PersonItem[] | null> {
    return this.http.get<FilteredResponse>(`${this.baseUrl}?name=${encodeURIComponent(name)}`).pipe(
      map((response) => {
        return response.result.map((r) => ({
          uid: r.uid,
          name: r.properties.name,
          url: `${this.baseUrl}/${r.uid}`,
        }));
      }),
      catchError(() => {
        this.errorSubject$.next('Error loading filtered characters');
        return of(null);
      }),
    );
  }

  constructor(private http: HttpClient) {}

  //GET PERSON DETAILS
  getDetails(id: string): Observable<Properties | null> {
    return this.http.get<Details>(`${this.baseUrl}/${id}`).pipe(
      map((details) => details.result.properties),
      catchError(() => {
        this.errorSubject$.next('Error loading details');
        return of(null);
      }),
    );
  }

  //GET INFO FROM RELATED EPS
  resolveNames(urls?: string[]): Observable<string[]> {
    if (!urls?.length) {
      return of([]);
    }

    return from(urls).pipe(
      mergeMap((url) => this.http.get<Details>(url).pipe(map((res) => res.result.properties.name))),
      toArray(),
    );
  } //TODO EXTRACT INFO FROM RELATED EPS IN COMPONENT

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

  resetPage() {
    this.pageSubject$.next(1);
  }
}
