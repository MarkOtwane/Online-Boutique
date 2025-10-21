import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class AdminSettingsComponent implements OnInit {
  activeTab = 'general';

  // General Settings
  generalSettings = {
    siteName: 'Boutique App',
    siteDescription: 'Premium fashion and lifestyle boutique',
    contactEmail: 'admin@boutiqueapp.com',
    supportPhone: '+1 (555) 123-4567',
    address: '123 Fashion Street, Style City, SC 12345'
  };

  // Notification Settings
  notificationSettings = {
    emailNotifications: true,
    orderNotifications: true,
    userRegistrationNotifications: true,
    lowStockAlerts: true,
    marketingEmails: false,
    weeklyReports: true
  };

  // Security Settings
  securitySettings = {
    twoFactorAuth: false,
    sessionTimeout: 30,
    passwordExpiry: 90,
    maxLoginAttempts: 5,
    requireStrongPasswords: true
  };

  // System Settings
  systemSettings = {
    maintenanceMode: false,
    debugMode: false,
    cacheEnabled: true,
    backupFrequency: 'daily',
    timezone: 'UTC',
    currency: 'USD'
  };

  loading = false;
  saving = false;

  constructor() {}

  ngOnInit(): void {
    this.loadSettings();
  }

  loadSettings(): void {
    this.loading = true;
    // In a real app, this would load from an API
    setTimeout(() => {
      this.loading = false;
    }, 1000);
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  saveGeneralSettings(): void {
    this.saving = true;
    // In a real app, this would save to an API
    setTimeout(() => {
      this.saving = false;
      alert('General settings saved successfully!');
    }, 1000);
  }

  saveNotificationSettings(): void {
    this.saving = true;
    // In a real app, this would save to an API
    setTimeout(() => {
      this.saving = false;
      alert('Notification settings saved successfully!');
    }, 1000);
  }

  saveSecuritySettings(): void {
    this.saving = true;
    // In a real app, this would save to an API
    setTimeout(() => {
      this.saving = false;
      alert('Security settings saved successfully!');
    }, 1000);
  }

  saveSystemSettings(): void {
    this.saving = true;
    // In a real app, this would save to an API
    setTimeout(() => {
      this.saving = false;
      alert('System settings saved successfully!');
    }, 1000);
  }

  resetToDefaults(): void {
    if (confirm('Are you sure you want to reset all settings to default values? This action cannot be undone.')) {
      // Reset logic here
      alert('Settings reset to defaults!');
    }
  }

  exportSettings(): void {
    const settings = {
      general: this.generalSettings,
      notifications: this.notificationSettings,
      security: this.securitySettings,
      system: this.systemSettings
    };

    const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'admin-settings-backup.json';
    document.body.appendChild(a);
    a.click();

    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }

  importSettings(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const settings = JSON.parse(e.target?.result as string);
          // Import logic here
          alert('Settings imported successfully!');
        } catch (error) {
          alert('Error importing settings. Please check the file format.');
        }
      };
      reader.readAsText(file);
    }
  }
}