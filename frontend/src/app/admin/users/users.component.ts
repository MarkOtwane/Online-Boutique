import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { User } from '../../interfaces/user';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css'],
  providers: [UserService],
})
export class AdminUsersComponent implements OnInit {
  Math = Math;
  users: User[] = [];
  filteredUsers: User[] = [];
  selectedUsers: number[] = [];
  isLoading = true;

  // Search and filter
  searchTerm = '';
  selectedRole = '';
  sortBy = 'email';
  sortOrder: 'asc' | 'desc' = 'asc';

  // Pagination
  currentPage = 1;
  itemsPerPage = 10;

  // Modal states
  showDeleteModal = false;
  showBulkDeleteModal = false;
  showEditModal = false;
  showCreateModal = false;
  userToDelete: User | null = null;
  editingUser: User | null = null;

  // Form data
  userForm = {
    email: '',
    role: 'customer',
  };

  // Success/Error messages
  successMessage = '';
  errorMessage = '';

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading = true;
    this.userService.getUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.applyFilters();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.errorMessage = 'Failed to load users';
        this.isLoading = false;
      },
    });
  }

  applyFilters(): void {
    let filtered = [...this.users];

    // Search filter
    if (this.searchTerm) {
      filtered = filtered.filter(
        (user) =>
          user.email.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
          user.role.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }

    // Role filter
    if (this.selectedRole) {
      filtered = filtered.filter((user) => user.role === this.selectedRole);
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue: any = a[this.sortBy as keyof User];
      let bValue: any = b[this.sortBy as keyof User];

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (this.sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    this.filteredUsers = filtered;
    this.currentPage = 1; // Reset to first page
  }

  onSearch(): void {
    this.applyFilters();
  }

  onRoleFilter(): void {
    this.applyFilters();
  }

  onSort(column: string): void {
    if (this.sortBy === column) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = column;
      this.sortOrder = 'asc';
    }
    this.applyFilters();
  }

  getSortIcon(column: string): string {
    if (this.sortBy !== column) return '↕️';
    return this.sortOrder === 'asc' ? '↑' : '↓';
  }

  // Pagination
  get paginatedUsers(): User[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.filteredUsers.slice(startIndex, endIndex);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredUsers.length / this.itemsPerPage);
  }

  get pageNumbers(): number[] {
    const pages: number[] = [];
    for (let i = 1; i <= this.totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  goToPage(page: number): void {
    this.currentPage = page;
  }

  // Selection
  toggleUserSelection(userId: number): void {
    const index = this.selectedUsers.indexOf(userId);
    if (index > -1) {
      this.selectedUsers.splice(index, 1);
    } else {
      this.selectedUsers.push(userId);
    }
  }

  toggleSelectAll(): void {
    const currentPageUserIds = this.paginatedUsers.map((u) => u.id);
    const allCurrentPageSelected = currentPageUserIds.every((id) =>
      this.selectedUsers.includes(id)
    );

    if (allCurrentPageSelected) {
      // Deselect all current page users
      this.selectedUsers = this.selectedUsers.filter(
        (id) => !currentPageUserIds.includes(id)
      );
    } else {
      // Select all current page users
      currentPageUserIds.forEach((id) => {
        if (!this.selectedUsers.includes(id)) {
          this.selectedUsers.push(id);
        }
      });
    }
  }

  get isAllCurrentPageSelected(): boolean {
    const currentPageUserIds = this.paginatedUsers.map((u) => u.id);
    return currentPageUserIds.every((id) => this.selectedUsers.includes(id));
  }

  // Create User
  openCreateModal(): void {
    this.userForm = { email: '', role: 'customer' };
    this.showCreateModal = true;
  }

  createUser(): void {
    if (!this.userForm.email) {
      this.errorMessage = 'Email is required';
      return;
    }

    this.userService.createUser(this.userForm).subscribe({
      next: () => {
        this.successMessage = 'User created successfully';
        this.loadUsers();
        this.showCreateModal = false;
        setTimeout(() => (this.successMessage = ''), 3000);
      },
      error: (error) => {
        this.errorMessage = `Failed to create user: ${error.message}`;
        setTimeout(() => (this.errorMessage = ''), 3000);
      },
    });
  }

  // Edit User
  openEditModal(user: User): void {
    this.editingUser = { ...user };
    this.userForm = { email: user.email, role: user.role };
    this.showEditModal = true;
  }

  updateUser(): void {
    if (!this.editingUser || !this.userForm.email) {
      this.errorMessage = 'Email is required';
      return;
    }

    this.userService.updateUser(this.editingUser.id, this.userForm).subscribe({
      next: () => {
        this.successMessage = 'User updated successfully';
        this.loadUsers();
        this.showEditModal = false;
        this.editingUser = null;
        setTimeout(() => (this.successMessage = ''), 3000);
      },
      error: (error) => {
        this.errorMessage = `Failed to update user: ${error.message}`;
        setTimeout(() => (this.errorMessage = ''), 3000);
      },
    });
  }

  // Delete operations
  confirmDelete(user: User): void {
    this.userToDelete = user;
    this.showDeleteModal = true;
  }

  deleteUser(): void {
    if (!this.userToDelete) return;

    this.userService.deleteUser(this.userToDelete.id).subscribe({
      next: () => {
        this.successMessage = `User "${
          this.userToDelete!.email
        }" deleted successfully`;
        this.loadUsers();
        this.showDeleteModal = false;
        this.userToDelete = null;
        setTimeout(() => (this.successMessage = ''), 3000);
      },
      error: (error) => {
        console.error('Delete user error:', error);
        const errorMsg = error?.error?.message || error?.message || 'Unknown error occurred';
        this.errorMessage = `Failed to delete user: ${errorMsg}`;
        this.showDeleteModal = false;
        this.userToDelete = null;
        setTimeout(() => (this.errorMessage = ''), 5000);
      },
    });
  }

  confirmBulkDelete(): void {
    if (this.selectedUsers.length === 0) return;
    this.showBulkDeleteModal = true;
  }

  bulkDeleteUsers(): void {
    const deletePromises = this.selectedUsers.map((id) =>
      this.userService.deleteUser(id).toPromise()
    );

    Promise.all(deletePromises)
      .then(() => {
        this.successMessage = `${this.selectedUsers.length} users deleted successfully`;
        this.selectedUsers = [];
        this.loadUsers();
        this.showBulkDeleteModal = false;
        setTimeout(() => (this.successMessage = ''), 3000);
      })
      .catch((error) => {
        console.error('Bulk delete users error:', error);
        const errorMsg = error?.error?.message || error?.message || 'Unknown error occurred';
        this.errorMessage = `Failed to delete some users: ${errorMsg}`;
        this.showBulkDeleteModal = false;
        setTimeout(() => (this.errorMessage = ''), 5000);
      });
  }

  // Modal controls
  closeModals(): void {
    this.showDeleteModal = false;
    this.showBulkDeleteModal = false;
    this.showEditModal = false;
    this.showCreateModal = false;
    this.userToDelete = null;
    this.editingUser = null;
  }

  // Utility methods
  getRoleBadgeClass(role: string): string {
    switch (role.toLowerCase()) {
      case 'admin':
        return 'role-admin';
      case 'customer':
        return 'role-customer';
      default:
        return 'role-default';
    }
  }

  getRoleDisplayName(role: string): string {
    return role.charAt(0).toUpperCase() + role.slice(1);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}
