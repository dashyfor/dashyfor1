import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeadderDark } from './headder-dark';

describe('HeadderDark', () => {
  let component: HeadderDark;
  let fixture: ComponentFixture<HeadderDark>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeadderDark],
    }).compileComponents();

    fixture = TestBed.createComponent(HeadderDark);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
