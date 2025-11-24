import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-about',
  imports: [CommonModule, RouterModule],
  templateUrl: './about.component.html',
  styleUrl: './about.component.css'
})
export class AboutComponent {
  // Contact information
  protected email = 'glynfinck@gmail.com';
  protected phone = '+44 7765 564378';
  protected githubUrl = 'https://github.com/glynfinck';
  protected githubOrgUrl = 'https://github.com/manning-capital';
  protected linkedinUrl = 'https://linkedin.com/in/glynfinck';
}

