import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  BehaviorSubject,
  catchError,
  combineLatest,
  forkJoin,
  map,
  Observable,
  of,
  shareReplay,
  startWith,
  Subject,
  switchMap,
} from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PeopleService {
  private readonly baseUrl = 'https://www.swapi.tech/api/people';
  private readonly limit = 10;

  private readonly detailsCache = new Map<string, Properties>();
  private readonly namesCache = new Map<string, string>(); // key: `${url}|${prop}`

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

  constructor(private http: HttpClient) {}

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

  // GET PERSON DETAILS (with cache)
  getDetails(id: string): Observable<Properties | null> {
    const cached = this.detailsCache.get(id);
    if (cached) {
      return of(cached);
    }

    return this.http.get<Details>(`${this.baseUrl}/${id}`).pipe(
      map((details) => {
        const props = details.result.properties;
        this.detailsCache.set(id, props);
        return props;
      }),
      catchError(() => {
        this.errorSubject$.next('Error loading details');
        return of(null);
      }),
    );
  }

  // GET DATA FROM RELATED EPS (with cache)
  resolveNames(urls?: string[], prop: 'name' | 'title' = 'name'): Observable<string[]> {
    if (!urls?.length) {
      return of([]);
    }

    const keys = urls.map((url) => `${url}|${prop}`);
    const cachedValues = keys.map((key) => this.namesCache.get(key));

    const missingIndexes = cachedValues
      .map((value, index) => (value === undefined ? index : -1))
      .filter((index) => index !== -1) as number[];

    if (missingIndexes.length === 0) {
      return of(cachedValues as string[]);
    }

    const missingRequests = missingIndexes.map((index) =>
      this.http.get<Details>(urls[index]).pipe(
        map((res) => res.result.properties[prop] as string),
      ),
    );

    return forkJoin(missingRequests).pipe(
      map((fetchedValues) => {
        fetchedValues.forEach((value, i) => {
          const originalIndex = missingIndexes[i];
          const key = keys[originalIndex];
          this.namesCache.set(key, value);
        });

        const finalValues = keys.map((key) => this.namesCache.get(key) as string);
        return finalValues;
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

  resetPage() {
    this.pageSubject$.next(1);
  }
}
