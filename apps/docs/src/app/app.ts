import { Component, computed, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { documentGroups, filterDocuments } from './documents';

@Component({
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  protected readonly query = signal('');
  protected readonly menuOpen = signal(false);
  protected readonly groups = computed(() => {
    const filtered = filterDocuments(this.query());
    return documentGroups
      .map((name) => ({ name, entries: filtered.filter((document) => document.group === name) }))
      .filter((group) => group.entries.length > 0);
  });
}
