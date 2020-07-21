import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ClientUserService } from './clientUser.service';
import { Router } from '@angular/router';
import { ClientUserModel } from './clientUser.model';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { JhiAlertService } from 'ng-jhipster';
import { AgGridNg2 } from 'ag-grid-angular';
import { NgForm } from '@angular/forms';

@Component({
    selector: 'jhi-client-user',
    templateUrl: './clientUser.component.html',
    styles: []
})
export class ClientUserComponent implements OnInit {
    @ViewChild('deleteModal')
    deleteModal: ElementRef;

    @ViewChild('commentsModal')
    commentsModal: ElementRef;

    @ViewChild('createOrEditModal')
    createOrEditModal: ElementRef;

    @ViewChild('listingGrid')
    listingGrid: AgGridNg2;

    user: ClientUserModel = new ClientUserModel();
    clientId: number;
    clientList = [];
    rowHeight: any;

    subUserRoles = [];

    userComments = [];
    currentUser = null;

    userList: Array<ClientUserModel> = new Array<ClientUserModel>();

    overlayNoRowsTemplate: string;
    defaultColDef: any;
    columnDefs = [
        {
            headerName: 'USERNAME',
            field: 'userName',
            filter: 'agSetColumnFilter',
            menuTabs: ['filterMenuTab'],
            filterParams: { newRowsAction: 'keep', selectAllOnMiniFilter: true, clearButton: true },
            cellClass: 'cell-wrap-text',
            autoHeight: true
        },
        {
            headerName: 'FIRST NAME',
            field: 'firstName',
            filter: 'agSetColumnFilter',
            menuTabs: ['filterMenuTab'],
            filterParams: { newRowsAction: 'keep', selectAllOnMiniFilter: true, clearButton: true },
            cellClass: 'cell-wrap-text',
            autoHeight: true
        },
        {
            headerName: 'LAST NAME',
            field: 'lastName',
            filter: 'agSetColumnFilter',
            menuTabs: ['filterMenuTab'],
            filterParams: { newRowsAction: 'keep', selectAllOnMiniFilter: true, clearButton: true },
            cellClass: 'cell-wrap-text',
            autoHeight: true
        },
        {
            headerName: 'EMAIL',
            field: 'emailAddress',
            filter: 'agSetColumnFilter',
            menuTabs: ['filterMenuTab'],
            filterParams: { newRowsAction: 'keep', selectAllOnMiniFilter: true, clearButton: true },
            cellClass: 'cell-wrap-text',
            autoHeight: true
        },
        /*  {
            headerName: 'CLIENT',
            field: 'clientName',
            filter: 'agSetColumnFilter',
            menuTabs: ['filterMenuTab'],
            filterParams: { newRowsAction: 'keep', selectAllOnMiniFilter: true, clearButton: true },
            cellClass: 'cell-wrap-text',
            autoHeight: true
        }, */
        {
            headerName: 'ROLES',
            field: 'subUserRoleNames',
            filter: 'agSetColumnFilter',
            menuTabs: ['filterMenuTab'],
            filterParams: { newRowsAction: 'keep', selectAllOnMiniFilter: true, clearButton: true },
            cellClass: 'cell-wrap-text',
            autoHeight: true
        },
        {
            headerName: 'COMMENTS',
            cellClass: 'cell-wrap-textactions',
            sortable: false,
            suppressMenu: true,
            width: 40,
            cellRenderer: params => {
                return '<div title="Comments" class="text-center img-cell" data-action-type="comments"><img data-action-type="comments" src="./content/images/svg/message.png" alt="Sem-icons" style="cursor: pointer;"></div>';
            }
        },
        {
            headerName: 'EDIT',
            sortable: false,
            cellClass: 'cell-wrap-textactions',
            suppressMenu: true,
            filter: true,
            width: 40,
            cellRenderer: params => {
                if (params && params.data && params.data.typeOfUser == 'INTERNAL') {
                    return '';
                } else if (params && params.data) {
                    return `<div title="Update" class="text-center img-cell" data-action-type="edit"><img data-action-type="edit" src="./content/images/svg/edit.png" alt="Sem-icons" style="cursor: pointer;"></div>&nbsp;&nbsp;`;
                }
            }
        },
        {
            headerName: 'DELETE',
            sortable: false,
            suppressMenu: true,
            cellClass: 'cell-wrap-textactions',
            filter: true,
            width: 40,
            cellRenderer: params => {
                if (params && params.data && params.data.typeOfUser == 'INTERNAL') {
                    return '';
                } else if (params && params.data) {
                    return `<div title="Delete" class="text-center img-cell" data-action-type="delete"><img data-action-type="delete" src="./content/images/svg/delete.png" alt="Sem-icons" style="cursor: pointer;"></div>`;
                }
            }
        }
    ];

    /**     {
        headerName: 'DELETE',
        sortable: false,
        suppressMenu: true,
        filter: true,
        cellRenderer: params => {
            if (params && params.data && params.data.typeOfUser == 'INTERNAL') {
                return '';
            } else if (params && params.data) {
                return `<div data-action-type="edit" title="Update"><svg title="Update" data-action-type="edit" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M2.5 14.3732V17.4982H5.625L14.8417 8.28151L11.7167 5.15651L2.5 14.3732ZM17.2583 5.86484C17.5833 5.53984 17.5833 5.01484 17.2583 4.68984L15.3083 2.73984C14.9833 2.41484 14.4583 2.41484 14.1333 2.73984L12.6083 4.26484L15.7333 7.38984L17.2583 5.86484Z" fill="#375889"/>
                    </svg> </div>&nbsp;&nbsp;
                    <div data-action-type="delete" title="Delete"><svg title="Delete" data-action-type="delete" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <g clip-path="url(#clip0)">
                            <path d="M4.4987 16.4167C4.4987 17.425 5.3237 18.25 6.33203 18.25H13.6654C14.6737 18.25 15.4987 17.425 15.4987 16.4167V6.33333H4.4987V16.4167ZM16.4154 2.66667H13.207L12.2904 1.75H7.70703L6.79036 2.66667H3.58203V4.5H16.4154V2.66667Z" fill="#375889"/>
                        </g>
                        <defs>
                            <clipPath id="clip0">
                                <rect width="20" height="20" fill="white"/>
                            </clipPath>
                        </defs>
                    </svg></div>`;
            }
        }
    } */

    constructor(
        private clientUserService: ClientUserService,
        private router: Router,
        private modalService: NgbModal,
        private alertService: JhiAlertService
    ) {
        this.rowHeight = 44;
        this.overlayNoRowsTemplate =
            '<span style="padding: 10px; border: 2px solid #444; background: lightgoldenrodyellow;">No Records Found</span>';
        this.defaultColDef = {
            width: 100,
            resizable: true
        };
    }

    ngOnInit() {
        this.getUsers();
        this.getSubRoles();
    }

    getUsers() {
        this.clientUserService.getUsers({}).subscribe((response: Array<ClientUserModel>) => {
            this.userList = response;
        });
    }

    onGridReady(params) {
        params.api.setSideBar(false);
        params.api.sizeColumnsToFit();
    }

    delete() {
        this.clientUserService.deleteUser(this.user.id).subscribe(
            () => {
                this.alertService.success('User - ' + this.user.firstName + ' is removed successfully');
                this.cancel();
                this.getUsers();
            },
            () => {
                this.alertService.error('Unable to delete User - ' + this.user.firstName);
                this.cancel();
            }
        );
    }

    cancel() {
        this.user = new ClientUserModel();
        this.modalService.dismissAll();
    }

    createNewUser(user, type) {
        this.errorMsg = null;
        if (type == 'DELETE') {
            this.user = user;
            this.modalService.open(this.deleteModal);
        } else if (type == 'EDIT') {
            this.user = user;
            this.modalService.open(this.createOrEditModal, { size: 'lg', windowClass: 'custom-modal-class' });
        } else if (type == 'CREATE') {
            this.user = new ClientUserModel();
            this.modalService.open(this.createOrEditModal, { size: 'lg', windowClass: 'custom-modal-class' });
        }
    }

    onRowClicked(e) {
        if (e.event.target !== undefined) {
            const record = e.data;
            const actionType = e.event.target.getAttribute('data-action-type');
            switch (actionType) {
                case 'edit':
                    return this.createNewUser(record, 'EDIT');
                case 'delete':
                    return this.createNewUser(record, 'DELETE');
                case 'comments':
                    return this.getUserComments(record);
            }
        }
    }

    getUserComments(user: any) {
        this.userComments = [];
        this.currentUser = user;

        this.clientUserService.getUserComments(user.id).subscribe(
            (response: any) => {
                this.userComments = response;
                this.modalService.open(this.commentsModal);
            },
            response => {
                this.alertService.error(response.error.title);
            }
        );
    }
    errorMsg = null;
    saveUser(form: NgForm) {
        this.errorMsg = null;

        if (form.valid) {
            this.clientUserService.saveUser(this.user).subscribe(
                () => {
                    if (this.user.id) {
                        this.alertService.success('User updated successfully');
                    } else {
                        this.alertService.success('User created successfully');
                    }
                    form.resetForm();
                    this.cancel();
                    this.getUsers();
                },
                response => {
                    this.errorMsg = response.error;
                }
            );
        }
    }

    getSubRoles() {
        this.clientUserService.getSubRoles().subscribe(response => {
            this.subUserRoles = response;
        });
    }

    reset(form: NgForm) {
        form.resetForm();
    }
}
