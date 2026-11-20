import { Service, inject, signal } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterStateSnapshot, TitleStrategy } from '@angular/router';

const FALLBACK_TITLE = 'Admin Console';

@Service()
export class PageTitle {
  private readonly current = signal(FALLBACK_TITLE);

  readonly text = this.current.asReadonly();

  set(value: string): void {
    this.current.set(value);
  }
}

@Service({ autoProvided: false })
export class AppTitleStrategy extends TitleStrategy {
  private readonly title = inject(Title);
  private readonly pageTitle = inject(PageTitle);

  override updateTitle(snapshot: RouterStateSnapshot): void {
    const resolved = this.buildTitle(snapshot) ?? FALLBACK_TITLE;
    this.title.setTitle(resolved);
    this.pageTitle.set(resolved);
  }
}
