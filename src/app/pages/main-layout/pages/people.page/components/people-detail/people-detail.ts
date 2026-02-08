import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map, Observable, of, switchMap } from 'rxjs';
import { PeopleService } from '../../../../../../services/people.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-people-detail',
  imports: [CommonModule, RouterLink],
  templateUrl: './people-detail.html',
  styleUrl: './people-detail.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PeopleDetail implements OnInit {
  person$!: Observable<Properties | null>;
  error$!: Observable<string | null>;

  constructor(
    private activatedRoute: ActivatedRoute,
    private peopleService: PeopleService,
  ) {}

  ngOnInit(): void {
    this.error$ = this.peopleService.error$;
    this.person$ = this.activatedRoute.paramMap.pipe(
      map((params) => params.get('id')),
      switchMap((id) => (id ? this.peopleService.getDetails(id) : of(null))),
    );
  }
}
