import { Injectable, Logger } from '@nestjs/common';
import { CronJob } from 'cron';
import { SchedulerRegistry } from '@nestjs/schedule';

@Injectable()
export class SchedulerUtil {
  private readonly logger = new Logger(SchedulerUtil.name);

  /**
   *  Adds a dynamic cron job.
   *
   * @param name - the cron job name.
   * @param cronExpression - a cron expression.
   * @param callback - the function that will handle the actual actions of the cron job.
   * @param scheduleRegistry
   *
   * Cron syntax:
   * * * * * * *
   * | | | | | |
   * | | | | | day of week
   * | | | | months
   * | | | day of month
   * | | hours
   * | minutes
   * seconds (optional)
   */
  public addCronJob(
    name: string,
    cronExpression: string,
    callback: () => Promise<void>,
    scheduleRegistry: SchedulerRegistry,
  ) {
    const job = new CronJob(`${cronExpression}`, () => {
      callback();
    });

    scheduleRegistry.addCronJob(name, job);
    job.start();

    this.logger.log(
      `The cron job ${name} has been added with the following cron expression : ${cronExpression}.`,
    );
  }
}
