import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ClientAdminService } from 'app/clientAdmin/client-admin.service';
import { NgForm } from '@angular/forms';
import { JhiAlertService } from 'ng-jhipster';
import { ViewChild } from '@angular/core';
import { ElementRef } from '@angular/core';

@Component({
    selector: 'jhi-client-admin',
    templateUrl: './client-admin.component.html',
    styles: []
})
export class ClientAdminComponent implements OnInit {
    user: any = {};
    banks = [];
    userId: number;
    isSuccess: boolean;
    displaySuccessMessage: string;
    isFailure: boolean;
    displayFailureMessage: string;
    isUpdateUser = false;
    fileData: File;
    fileName: string;
    clientIdFromCreateClient: string;
    fromCreateClient = false;
    isDisabled = true;
    @ViewChild('fileUpload') private file: ElementRef;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private clientAdminService: ClientAdminService,
        private alertService: JhiAlertService
    ) {}

    ngOnInit() {
        this.getClientList();
        this.userId = this.route.snapshot.params.id;
        if (this.userId) {
            this.isUpdateUser = true;
            this.getClientAdminById(this.userId);
        }
        if (this.route.snapshot.params.clientId) {
            this.clientIdFromCreateClient = this.route.snapshot.params.clientId;
            this.fromCreateClient = true;
            this.user.clientId = Number(this.clientIdFromCreateClient);
        }
    }

    browsFile(event) {
        if (event.target.files.length === 1) {
            const files: FileList = event.target.files;
            this.fileData = files.item(0);
            this.user.filePath = this.fileData.name;
        } else {
            this.fileName = '';
            this.fileData = null;
            this.user.filePath = '';
            this.file.nativeElement.value = '';
        }
    }

    submitData(admin: NgForm) {
        if (this.isUpdateUser) {
            this.updateClientAdmin(admin);
        } else {
            this.save(admin);
        }
    }

    save(form: NgForm) {
        this.user.isActive = true;
        this.user.status = 'APPROVED';
        if (this.fileData !== null && this.fileData !== undefined) {
            if (this.fileData.size < 10000000 && this.fileData.type === 'application/pdf') {
            } else {
                this.alertService.error('File must be PDF with size less than 10MB!');
                document.getElementById('slide-2').scrollIntoView(true);
                return false;
            }
        }
        const formData = new FormData();
        formData.append('fileData', this.fileData);
        formData.append('data', new Blob([JSON.stringify(this.user)], { type: 'application/json' }));
        this.clientAdminService.saveUser(formData).subscribe(
            response => {
                this.alertService.success(
                    'Client Admin details added successfully, Please add another Client Admin else close the window.'
                );
                form.resetForm();
                this.fileData = null;
                this.file.nativeElement.value = '';
            },
            response => {
                this.alertService.error(response.error.response);
            }
        );
    }

    getClientList(): any {
        this.clientAdminService.getClientList().subscribe(response => {
            this.banks = response;
        });
    }

    getClientAdminById(userId: any) {
        this.clientAdminService.getClientAdminById(+userId).subscribe(
            response => {
                this.user = response;
            },
            response => {
                this.navigateToListingScreen();
                this.alertService.error(response.error.response);
            }
        );
    }

    updateClientAdmin(form: NgForm) {
        if (this.fileData !== null && this.fileData !== undefined) {
            if (this.fileData.size < 10000000 && this.fileData.type === 'application/pdf') {
            } else {
                this.alertService.error('File must be PDF with size less than 10MB!');
                document.getElementById('slide-2').scrollIntoView(true);
                return false;
            }
        }

        const formData = new FormData();
        formData.append('fileData', this.fileData);
        formData.append('data', new Blob([JSON.stringify(this.user)], { type: 'application/json' }));
        this.clientAdminService.updateClientAdmin(formData).subscribe(
            response => {
                this.alertService.success('User updated successfully');
                this.navigateToListingScreen();
            },
            response => {
                this.alertService.error(response.error.response);
            }
        );
    }

    navigateToListingScreen() {
        this.router.navigate(['administrationHome/clientAdminList']);
    }

    clearClientAdminScreen(form: NgForm) {
        form.resetForm();
        this.fileData = null;
        this.file.nativeElement.value = '';
        this.user.filePath = null;
    }

    download(fileName, id) {
        const formdata: FormData = new FormData();
        formdata.append('id', id + '');

        this.clientAdminService.downloadAttachment(formdata).subscribe(
            response => {
                if (response !== undefined) {
                    const blob = new Blob([response], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
                    if (window.navigator.msSaveOrOpenBlob) {
                        // msSaveBlob only available for IE & Edge
                        window.navigator.msSaveBlob(blob, this.user.filePath);
                    } else {
                        const objectUrl = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = objectUrl;
                        a.download = fileName;
                        a.target = '_blank';
                        a.click();
                    }
                }
            },
            response => {
                this.alertService.error('Internal server error while downloading the file.');
            }
        );
    }
}
