import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PeopleList } from './components/people-list/people-list';

@Component({
  selector: 'app-people.page',
  imports: [PeopleList],
  templateUrl: './people.page.html',
  styleUrl: './people.page.scss',

  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PeoplePage {}
