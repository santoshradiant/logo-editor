import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CloudSaveStatusComponent } from './cloud-save-status.component';

describe('CloudSaveStatusComponent', () => {
  let component: CloudSaveStatusComponent;
  let fixture: ComponentFixture<CloudSaveStatusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CloudSaveStatusComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CloudSaveStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
