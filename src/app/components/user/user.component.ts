import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { User } from 'src/app/common/user';
import { UserTo } from 'src/app/common/user-to';
import { NotificationType } from 'src/app/enums/notification-type.enum';
import { ErrorHandlingService } from 'src/app/services/error-handling.service';
import { NotificationService } from 'src/app/services/notification.service';
import { TestDataCheckingService } from 'src/app/services/test-data-checking.service';
import { UserService } from 'src/app/services/user.service';
import { CustomValidators } from 'src/app/validators/custom-validators';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit {

  users: User[];

  userAddFormGroup: FormGroup;
  userEditFormGroup: FormGroup;
  editedUserName: string;
  changePasswordFormGroup: FormGroup;

  refreshing: boolean;

  constructor(private userService: UserService, private notificationService: NotificationService,
    private formBuilder: FormBuilder, private errorHandlingService: ErrorHandlingService, 
    private testDataCheckingService: TestDataCheckingService) { }

  ngOnInit(): void {
    this.listUsers();
    this.makeUserAddFormGroup();
    this.makeUserEditFormGroup();
    this.makeChangePasswordFormGroup();
  }

  listUsers() {
    this.refreshing = true;
    this.userService.getUserList().subscribe(
      (response: User[]) => {
        this.users = response;
        this.refreshing = false;
      },
      (errorResponse: HttpErrorResponse) => {
        this.errorHandlingService.handleErrorResponse(errorResponse);
        this.refreshing = false;
      }
    );
  }

  searchUsers(keyWord: string) {
    this.refreshing = true;
    keyWord = keyWord.trim();
    if (keyWord.length > 0) {
      this.userService.searchUsers(keyWord).subscribe(
        (response: User[]) => {
          this.users = response;
          this.refreshing = false;
        },
        (errorResponse: HttpErrorResponse) => {
          this.errorHandlingService.handleErrorResponse(errorResponse);
          this.refreshing = false;
        }
      );
    } else {
      this.listUsers();
    }
  }

  refresh() {
    (<HTMLInputElement>document.getElementById("inputkeyWordField")).value = '';
    this.listUsers();
  }

  makeUserAddFormGroup() {
    this.userAddFormGroup = this.formBuilder.group({
      user: this.formBuilder.group({
        name: new FormControl('', [Validators.required, Validators.minLength(4), Validators.maxLength(20), CustomValidators.notOnlyWhitespace]),
        email: new FormControl('', [Validators.required, Validators.maxLength(40), Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')]),
        enabled: [true],
        roles: new FormControl('', [Validators.required]),
        password: new FormControl('', [Validators.required, Validators.minLength(5), Validators.maxLength(32), CustomValidators.notOnlyWhitespace]),
        repeatPassword: new FormControl('', [Validators.required])
      }, { validator: this.checkIfMatchingPasswords('password', 'repeatPassword') })
    });
  }

  private checkIfMatchingPasswords(passwordKey: string, repeatPasswordKey: string) {
    return (group: FormGroup) => {
      let passwordInput = group.controls[passwordKey];
      let repeatPasswordInput = group.controls[repeatPasswordKey];
      if (!repeatPasswordInput.value) {
        return repeatPasswordInput.setErrors({ required: true });
      }
      if (passwordInput.value !== repeatPasswordInput.value) {
        return repeatPasswordInput.setErrors({ notEquivalent: true });
      }
      else {
        return repeatPasswordInput.setErrors(null);
      }
    }
  }

  // Submit Add User From
  onAddNewUser() {
    if (this.userAddFormGroup.invalid) {
      this.userAddFormGroup.markAllAsTouched();
    } else {
      let newUser = new User(null, this.name.value, this.email.value, this.password.value, this.enabled.value, this.roles.value);
      this.userService.createUser(newUser).subscribe(
        (response: User) => {
          document.getElementById("user-add-modal-close").click();
          this.notificationService.sendNotification(NotificationType.SUCCESS, `A new user '${response.name}' was created`);
          this.listUsers();
        },
        (errorResponse: HttpErrorResponse) => {
          this.errorHandlingService.handleErrorResponseWithButtonClick(errorResponse, "user-add-modal-close");
        }
      );
    }
  }

  private makeUserEditFormGroup() {
    this.userEditFormGroup = this.formBuilder.group({
      user: this.formBuilder.group({
        id: [''],
        nameEdited: new FormControl('', [Validators.required, Validators.minLength(4), Validators.maxLength(20), CustomValidators.notOnlyWhitespace]),
        emailEdited: new FormControl('', [Validators.required, Validators.maxLength(40), Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')]),
        enabledEdited: [true],
        rolesEdited: new FormControl('', [Validators.required])
      })
    });
  }

  prepareUserEditFormGroup(user: User) {
    this.editedUserName = user.name;
    this.userEditFormGroup = this.formBuilder.group({
      user: this.formBuilder.group({
        id: [user.id],
        nameEdited: new FormControl(user.name, [Validators.required, Validators.minLength(4), Validators.maxLength(20), CustomValidators.notOnlyWhitespace]),
        emailEdited: new FormControl(user.email, [Validators.required, Validators.maxLength(40), Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')]),
        enabledEdited: [user.enabled],
        rolesEdited: new FormControl(user.roles, [Validators.required])
      })
    });
  }

  // Submit User Edit From
  onUpdateUser() {
    if (this.userEditFormGroup.invalid) {
      this.userEditFormGroup.markAllAsTouched();
    } else {
      if (!this.testDataCheckingService.isTestUser(this.id.value, "Test user cannot be edited!")) {
        let updatedUserTo = new UserTo(this.id.value, this.nameEdited.value, this.emailEdited.value, this.enabledEdited.value, this.rolesEdited.value);
        this.userService.updateUser(updatedUserTo).subscribe(
          response => {
            document.getElementById("user-edit-modal-close").click();
            this.notificationService.sendNotification(NotificationType.SUCCESS, `The user '${updatedUserTo.name}' was updated`);
            this.listUsers();
          },
          (errorResponse: HttpErrorResponse) => {
            this.errorHandlingService.handleErrorResponseWithButtonClick(errorResponse, "user-edit-modal-close");
          }
        );
      }
    }
  }

  deleteUser(id: number, name: string) {
    if (confirm(`Are you sure want to delete user '${name}'?`)) {
      if (!this.testDataCheckingService.isTestUser(id, "Test user cannot be deleted!")) {
        this.userService.deleteUser(id).subscribe(
          response => {
            this.notificationService.sendNotification(NotificationType.SUCCESS, `The user '${name}' was deleted`);
            this.listUsers();
          },
          (errorResponse: HttpErrorResponse) => {
            this.errorHandlingService.handleErrorResponse(errorResponse);
          }
        );
      }
    }
  }

  private makeChangePasswordFormGroup() {
    this.changePasswordFormGroup = this.formBuilder.group({
      changedPassword: this.formBuilder.group({
        changePasswordId: [''],
        newPassword: new FormControl('', [Validators.required, Validators.minLength(5), Validators.maxLength(32), CustomValidators.notOnlyWhitespace]),
        repeatNewPassword: new FormControl('', [Validators.required])
      }, { validator: this.checkIfMatchingPasswords('newPassword', 'repeatNewPassword') })
    });
  }

  prepareChangePasswordFormGroup(userId: number) {
    document.getElementById("user-edit-modal-close").click();
    this.changePasswordFormGroup = this.formBuilder.group({
      changedPassword: this.formBuilder.group({
        changePasswordId: [userId],
        newPassword: new FormControl('', [Validators.required, Validators.minLength(5), Validators.maxLength(32), CustomValidators.notOnlyWhitespace]),
        repeatNewPassword: new FormControl('', [Validators.required])
      }, { validator: this.checkIfMatchingPasswords('newPassword', 'repeatNewPassword') })
    });
  }

  onChangePassword() {
    if (this.changePasswordFormGroup.invalid) {
      this.changePasswordFormGroup.markAllAsTouched();
    } else {
      let userId = this.changePasswordFormGroup.get('changedPassword.changePasswordId').value;
      if (!this.testDataCheckingService.isTestUser(userId, "Test user's password cannot be changed!")) {
        let newPassword = this.newPassword.value;
        this.userService.changeUserPassword(userId, newPassword).subscribe(
          response => {
            document.getElementById("change-password-modal-close").click();
            this.notificationService.sendNotification(NotificationType.SUCCESS, `Password for ${this.nameEdited.value} was updated`);
          },
          (errorResponse: HttpErrorResponse) => {
            this.errorHandlingService.handleErrorResponseWithButtonClick(errorResponse, "change-password-modal-close");
          }
        );
      }
    }
  }

  // Getters for userAddFormGroup values
  get name() {
    return this.userAddFormGroup.get('user.name');
  }
  get email() {
    return this.userAddFormGroup.get('user.email');
  }
  get enabled() {
    return this.userAddFormGroup.get('user.enabled');
  }
  get roles() {
    return this.userAddFormGroup.get('user.roles');
  }
  get password() {
    return this.userAddFormGroup.get('user.password');
  }
  get repeatPassword() {
    return this.userAddFormGroup.get('user.repeatPassword');
  }

  // Getters for userEditFormGroup values
  get id() {
    return this.userEditFormGroup.get('user.id');
  }
  get nameEdited() {
    return this.userEditFormGroup.get('user.nameEdited');
  }
  get emailEdited() {
    return this.userEditFormGroup.get('user.emailEdited');
  }
  get enabledEdited() {
    return this.userEditFormGroup.get('user.enabledEdited');
  }
  get rolesEdited() {
    return this.userEditFormGroup.get('user.rolesEdited');
  }

  // Getters for changePasswordFormGroup values
  get newPassword() {
    return this.changePasswordFormGroup.get('changedPassword.newPassword');
  }
  get repeatNewPassword() {
    return this.changePasswordFormGroup.get('changedPassword.repeatNewPassword');
  }
}