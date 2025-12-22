import { Component, inject, OnInit } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { PhotoService } from '../../services/photo.service';

@Component({
  selector: 'app-intro',
  imports: [ButtonModule, CardModule],
  templateUrl: './intro.html',
  styleUrl: './intro.scss',
})
export class Intro {
  protected photoService = inject(PhotoService);
}
