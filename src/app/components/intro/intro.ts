import { Component, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-intro',
  imports: [ButtonModule, CardModule],
  templateUrl: './intro.html',
  styleUrl: './intro.scss',
})
export class Intro {
}
