import { Component, OnInit } from '@angular/core';
import { ClientAdminService } from 'app/clientAdmin/client-admin.service';
import { Router } from '@angular/router';
import { JhiAlertService } from 'ng-jhipster';
import { ViewChild } from '@angular/core';
import { ElementRef } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Content } from '@angular/compiler/src/render3/r3_ast';

@Component({
    selector: 'jhi-client-admin-list',
    templateUrl: './client-admin-list.component.html',
    styleUrls: ['./client-admin-list.css']
})
export class ClientAdminListComponent implements OnInit {
    clientAdminList = [];
    isSuccess: boolean;
    displaySuccessMessage: string;
    userId: string;
    isFailure: boolean;
    displayFailureMessage: string;
    overlayNoRowsTemplate: any;
    rowHeight: any;
    @ViewChild('deleteEntityModal')
    deleteModal: ElementRef;
    banks = [];
    template1 = `<a data-action-type="edit" class="btn btn-sm btn-primary"
  title="Update">Update</a><a data-action-type="delete" class="btn btn-danger btn-sm"
  title="Delete">Delete</a>`;

    columnDefs = [
        {
            headerName: 'Username',
            field: 'userName',
            filter: 'agSetColumnFilter',
            menuTabs: ['filterMenuTab'],
            filterParams: {
                //values: this.CLIENT_NAME,
                newRowsAction: 'keep',
                selectAllOnMiniFilter: true,
                clearButton: true
            }
        },
        {
            headerName: 'Firstname',
            field: 'firstName',
            filter: 'agSetColumnFilter',
            menuTabs: ['filterMenuTab'],
            filterParams: {
                //values: this.CLIENT_NAME,
                newRowsAction: 'keep',
                selectAllOnMiniFilter: true,
                clearButton: true
            }
        },
        {
            headerName: 'Middlename',
            field: 'middleName',
            filter: 'agSetColumnFilter',
            menuTabs: ['filterMenuTab'],
            filterParams: {
                //values: this.CLIENT_NAME,
                newRowsAction: 'keep',
                selectAllOnMiniFilter: true,
                clearButton: true
            }
        },
        {
            headerName: 'Lastname',
            field: 'lastName',
            filter: 'agSetColumnFilter',
            menuTabs: ['filterMenuTab'],
            filterParams: {
                //values: this.CLIENT_NAME,
                newRowsAction: 'keep',
                selectAllOnMiniFilter: true,
                clearButton: true
            }
        },
        {
            headerName: 'Email',
            field: 'emailAddress',
            filter: 'agSetColumnFilter',
            menuTabs: ['filterMenuTab'],
            filterParams: {
                //values: this.CLIENT_NAME,
                newRowsAction: 'keep',
                selectAllOnMiniFilter: true,
                clearButton: true
            }
        },
        //     {
        //         headerName: 'Client',
        //         field: 'clientId',
        //         filter: 'agSetColumnFilter',
        //         menuTabs: ['filterMenuTab'],
        //         filterParams: {
        //        //values: this.clineName,
        //         newRowsAction: 'keep',
        //         selectAllOnMiniFilter: true,
        //         clearButton: true
        //         } ,
        //         cellRenderer: params => {
        //             let clineName = this.banks.find(x => x.id === params.value).clientName;
        //             return clineName;
        //         }
        // },
        {
            headerName: 'Designation',
            field: 'designation',
            filter: 'agSetColumnFilter',
            menuTabs: ['filterMenuTab'],
            filterParams: {
                //values: this.CLIENT_NAME,
                newRowsAction: 'keep',
                selectAllOnMiniFilter: true,
                clearButton: true
            }
        },
        {
            headerName: 'Department',
            field: 'department',
            filter: 'agSetColumnFilter',
            menuTabs: ['filterMenuTab'],
            filterParams: {
                //values: this.CLIENT_NAME,
                newRowsAction: 'keep',
                selectAllOnMiniFilter: true,
                clearButton: true
            }
        },
        {
            headerName: 'Location',
            field: 'location',
            filter: 'agSetColumnFilter',
            menuTabs: ['filterMenuTab'],
            filterParams: {
                //values: this.CLIENT_NAME,
                newRowsAction: 'keep',
                selectAllOnMiniFilter: true,
                clearButton: true
            }
        },
        {
            headerName: 'Attachment',
            field: 'filePath',
            filter: 'agSetColumnFilter',
            menuTabs: ['filterMenuTab'],
            cellRenderer: params => {
                if (params.value != null) {
                    return (
                        `<a href="javascript:void()" data-action-type="download" class="fa-cloud-upload ml-5"
title="` +
                        params.data.filePath +
                        `"></a>`
                    );
                } else {
                    return `<a></a>`;
                }
            }
        },
        {
            headerName: 'EDIT',
            suppressSorting: true,
            cellClass: 'cell-wrap-textactions',
            suppressMenu: true,
            suppressFilter: true,
            cellRenderer: params => {
                if (params && params.data && params.data.typeOfUser == 'INTERNAL') {
                    return '';
                } else if (params && params.data) {
                    return `<div title="Update" class="img-cell-adm" data-action-type="edit"><img data-action-type="edit" src="./content/images/svg/edit.png" alt="Sem-icons" style="cursor: pointer;"></div>&nbsp;&nbsp;`;
                }
            }
        },
        {
            headerName: 'DELETE',
            suppressSorting: true,
            cellClass: 'cell-wrap-textactions',
            suppressMenu: true,
            suppressFilter: true,
            cellRenderer: params => {
                if (params && params.data && params.data.typeOfUser == 'INTERNAL') {
                    return '';
                } else if (params && params.data) {
                    return `<div title="Delete" class="img-cell-adm" data-action-type="delete"><img data-action-type="delete" src="./content/images/svg/delete.png" alt="Sem-icons" style="cursor: pointer;"></div>`;
                }
            }
        }
    ];

    /** {
            headerName: 'Actions',
            suppressSorting: true,
            suppressMenu: true,
            suppressFilter: true,
            cellRenderer: params => {
                // return `<a><span><i data-action-type="edit" title="Update" class="fa fa-pencil"></i></span></a>&nbsp&nbsp<a><span><i data-action-type="delete" title="Delete" class="fa fa-times"></i></span></a>`;
                return `<svg title="Update" data-action-type="edit" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2.5 14.3732V17.4982H5.625L14.8417 8.28151L11.7167 5.15651L2.5 14.3732ZM17.2583 5.86484C17.5833 5.53984 17.5833 5.01484 17.2583 4.68984L15.3083 2.73984C14.9833 2.41484 14.4583 2.41484 14.1333 2.73984L12.6083 4.26484L15.7333 7.38984L17.2583 5.86484Z" fill="#375889"/>
                </svg>&nbsp;&nbsp;<svg title="Delete" data-action-type="delete" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g clip-path="url(#clip0)">
                <path d="M4.4987 16.4167C4.4987 17.425 5.3237 18.25 6.33203 18.25H13.6654C14.6737 18.25 15.4987 17.425 15.4987 16.4167V6.33333H4.4987V16.4167ZM16.4154 2.66667H13.207L12.2904 1.75H7.70703L6.79036 2.66667H3.58203V4.5H16.4154V2.66667Z" fill="#375889"/>
                </g>
                <defs>
                <clipPath id="clip0">
                <rect width="20" height="20" fill="white"/>
                </clipPath>
                </defs>
                </svg>
                `;
            }
        }
        
        */
    constructor(
        private clientAdminService: ClientAdminService,
        private alertService: JhiAlertService,
        private router: Router,
        private modalService: NgbModal
    ) {
        this.rowHeight = 44;
        this.overlayNoRowsTemplate =
            '<span style="padding: 10px; border: 2px solid #444; background: lightgoldenrodyellow;">No Records Found</span>';
    }

    ngOnInit() {
        this.getClientList();
    }

    getClientList(): any {
        this.clientAdminService.getClientList().subscribe(response => {
            this.banks = response;
            this.getClientAdminList();
        });
    }

    getClientAdminList() {
        this.clientAdminService.getClientAdminList().subscribe(
            response => {
                this.clientAdminList = response;
            },
            response => {
                this.alertService.error(response.error);
            }
        );
    }

    editClientAdminUser(userId: any) {
        this.router.navigate(['administrationHome/clientAdmin', userId]);
    }

    createUser() {
        this.router.navigate(['administrationHome/clientAdmin']);
    }

    deleteClientAdminUser() {
        this.clientAdminService.deleteClientAdminUser(this.userId).subscribe(
            response => {
                this.alertService.success('Respected Client Admin got Deleted successfully!');
                this.cancel();
                this.getClientAdminList();
            },
            response => {
                this.alertService.error(response.error);
            }
        );
    }

    onGridReady(param) {
        param.api.setSideBar(false);
        param.api.sizeColumnsToFit();
    }

    onRowClicked(e) {
        if (e.event.target !== undefined) {
            const data = e.data;
            const actionType = e.event.target.getAttribute('data-action-type');
            switch (actionType) {
                case 'edit':
                    return this.editClientAdminUser(data.id);
                case 'delete':
                    return this.openModal(data);
                case 'download':
                    return this.download(data.filePath, data.id);
            }
        }
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
                        window.navigator.msSaveBlob(blob, fileName);
                    } else {
                        const objectUrl = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = objectUrl;
                        a.download = fileName;
                        a.target = '_blank';
                        a.click();
                        this.getClientAdminList();
                    }
                }
            },
            response => {
                this.alertService.error('Internal server error while downloading the file.');
            }
        );
    }

    cancel() {
        this.userId = null;
        this.modalService.dismissAll();
    }
    openModal(data) {
        this.userId = data.userId;
        this.modalService.open(this.deleteModal);
    }
}
