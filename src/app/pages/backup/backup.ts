import {
  Component,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  signal,
} from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';

interface BackupRecord {
  id: number;
  fileName: string;
  date: Date;
  size: string;
  type: 'manual' | 'automatic';
  status: 'completed' | 'failed' | 'in-progress';
}

@Component({
  selector: 'app-backup',
  templateUrl: './backup.html',
  styleUrl: './backup.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatProgressBarModule,
    MatListModule,
    MatDividerModule,
    MatChipsModule,
    DatePipe,
  ],
})
export default class Backup {
  isBackingUp = signal<boolean>(false);
  backupProgress = signal<number>(0);

  backupHistory = signal<BackupRecord[]>([
    {
      id: 1,
      fileName: 'otc_backup_2025_01_15.sql',
      date: new Date('2025-01-15'),
      size: '2.4 MB',
      type: 'automatic',
      status: 'completed',
    },
    {
      id: 2,
      fileName: 'otc_backup_2025_01_14.sql',
      date: new Date('2025-01-14'),
      size: '2.3 MB',
      type: 'automatic',
      status: 'completed',
    },
    {
      id: 3,
      fileName: 'otc_manual_backup_2025_01_13.sql',
      date: new Date('2025-01-13'),
      size: '2.5 MB',
      type: 'manual',
      status: 'completed',
    },
  ]);

  lastBackupDate = signal<Date>(new Date('2025-01-15'));
  autoBackupEnabled = signal<boolean>(true);

  startManualBackup() {
    this.isBackingUp.set(true);
    this.backupProgress.set(0);

    // Simulate backup progress
    const interval = setInterval(() => {
      const currentProgress = this.backupProgress();
      if (currentProgress >= 100) {
        clearInterval(interval);
        this.isBackingUp.set(false);
        this.addBackupRecord();
      } else {
        this.backupProgress.set(currentProgress + 10);
      }
    }, 500);
  }

  private addBackupRecord() {
    const newBackup: BackupRecord = {
      id: Date.now(),
      fileName: `otc_manual_backup_${
        new Date().toISOString().split('T')[0]
      }.sql`,
      date: new Date(),
      size: '2.6 MB',
      type: 'manual',
      status: 'completed',
    };

    const history = this.backupHistory();
    this.backupHistory.set([newBackup, ...history]);
    this.lastBackupDate.set(new Date());
  }

  downloadBackup(backup: BackupRecord) {
    console.log('Yedek dosyası indiriliyor:', backup.fileName);
  }

  deleteBackup(backupId: number) {
    const history = this.backupHistory();
    const updatedHistory = history.filter((backup) => backup.id !== backupId);
    this.backupHistory.set(updatedHistory);
  }

  toggleAutoBackup() {
    this.autoBackupEnabled.update((enabled) => !enabled);
    console.log(
      'Otomatik yedekleme:',
      this.autoBackupEnabled() ? 'Açık' : 'Kapalı'
    );
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'completed':
        return 'check_circle';
      case 'failed':
        return 'error';
      case 'in-progress':
        return 'sync';
      default:
        return 'help';
    }
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'completed':
        return 'green';
      case 'failed':
        return 'red';
      case 'in-progress':
        return 'blue';
      default:
        return 'gray';
    }
  }

  getTypeText(type: string): string {
    return type === 'manual' ? 'Manuel' : 'Otomatik';
  }
}
