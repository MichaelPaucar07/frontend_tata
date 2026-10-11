import { TestBed } from '@angular/core/testing';
import { NOTIFY_DURATION_MS, NotifyService } from './notify.service';

describe('NotifyService', () => {
  let service: NotifyService;

  beforeEach(() => {
    jest.useFakeTimers();
    TestBed.configureTestingModule({});
    service = TestBed.inject(NotifyService);
  });

  afterEach(() => jest.useRealTimers());

  it('should add notifications of each type', () => {
    service.success('ok');
    service.error('fail');
    service.info('fyi');

    expect(service.notifications().map((n) => n.type)).toEqual(['success', 'error', 'info']);
    expect(service.notifications().map((n) => n.message)).toEqual(['ok', 'fail', 'fyi']);
  });

  it('should assign unique ids', () => {
    service.info('a');
    service.info('b');
    const [first, second] = service.notifications();
    expect(first.id).not.toBe(second.id);
  });

  it('should dismiss a notification by id', () => {
    service.info('a');
    service.info('b');
    const [first] = service.notifications();

    service.dismiss(first.id);

    expect(service.notifications().map((n) => n.message)).toEqual(['b']);
  });

  it('should auto-dismiss after the configured duration', () => {
    service.success('ok');
    jest.advanceTimersByTime(NOTIFY_DURATION_MS - 1);
    expect(service.notifications().length).toBe(1);

    jest.advanceTimersByTime(1);
    expect(service.notifications().length).toBe(0);
  });
});
