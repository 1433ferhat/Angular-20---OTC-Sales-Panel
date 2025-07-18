import {
  Component,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule } from '@angular/material/dialog';
import { UserModel } from '@shared/models/user.model';
import { OperationClaimsModel } from '@shared/models/operation-claims.model';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-users',
  templateUrl: './users.html',
  styleUrl: './users.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatTableModule,
    MatChipsModule,
    MatDialogModule,
    MatTooltipModule,
  ],
})
export default class Users {
  users = signal<UserModel[]>([
    {
      id: '1',
      name: 'Admin User',
      email: 'admin@example.com',
      operationClaims: [
        { id: '1', name: 'admin' } as OperationClaimsModel // Düzeltme: string yerine OperationClaimsModel
      ],
      status: 'active',
    },
  ]);

  displayedColumns: string[] = [
    'name',
    'email',
    'role',
    'status',
    'lastLogin',
    'actions',
  ];

  addUser() {
    console.log('Yeni kullanıcı ekle');
  }

  editUser(user: UserModel) {
    console.log('Kullanıcı düzenle:', user);
  }

  deleteUser(userId: string) {
    console.log('Kullanıcı sil:', userId);
  }

  toggleUserStatus(userId: string) {
    const userList = this.users();
    const updatedUsers = userList.map((user) =>
      user.id === userId
        ? {
            ...user,
            status:
              user.status === 'active'
                ? 'inactive'
                : ('active' as 'active' | 'inactive'),
          }
        : user
    );
    this.users.set(updatedUsers);
  }

  getRoleText(claim: OperationClaimsModel): string {
    const roles: any = {
      admin: 'Yönetici',
      cashier: 'Kasiyer',
      manager: 'Müdür',
    };
    return roles[claim.name] || claim.name;
  }

  getStatusText(status: string): string {
    return status === 'active' ? 'Aktif' : 'Pasif';
  }
}