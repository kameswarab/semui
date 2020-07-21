import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ClientService } from 'app/Client/client.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import 'ag-grid-enterprise';
import { JhiAlertService } from 'ng-jhipster';
@Component({
    selector: 'jhi-client-listing',
    templateUrl: './client-listing.component.html',
    styles: []
})
export class ClientListingComponent implements OnInit {
    params: any;
    data: any;
    rowData = [];
    dataList = [];
    columnList = ['ID', 'CLIENT_NAME', 'LOCATION', 'CREATED_BY', 'CREATED_DATE', 'LAST_MODIFIED_BY', 'LAST_MODIFIED_DATE', 'FILE_PATH'];

    defaultColDef;
    cacheBlockSize;
    maxBlocksInCache;
    sideBar;
    clickedIndex = [];
    overlayNoRowsTemplate: any;
    rowHeight: any;
    @ViewChild('deleteEntityModal')
    deleteEntityModal: ElementRef;

    columnDefs = [
        {
            headerName: 'Client Name',
            field: 'CLIENT_NAME',
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
            field: 'LOCATION',
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
            headerName: 'Created By',
            field: 'CREATED_BY',
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
            headerName: 'Created Date',
            field: 'CREATED_DATE',
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
            headerName: 'Last Modified By',
            field: 'LAST_MODIFIED_BY',
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
            headerName: 'Last Modified Date',
            field: 'LAST_MODIFIED_DATE',
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
            headerName: 'Uploaded File',
            sortable: false,
            suppressMenu: true,
            filter: true,
            cellRenderer: params => {
                if (params && params.data && params.data.filePath) {
                    return `<a data-action-type="download" class="fa-cloud-upload ml-5" title="` + params.data.filePath + `"> </a>`;
                } else {
                    return '';
                }
            }
        },
        {
            headerName: 'Actions',
            cellClass: 'cell-wrap-textactions',
            suppressSorting: true,
            suppressMenu: true,
            suppressFilter: true,
            cellRenderer: params => {
                // const template1 = `<a data-action-type="edit" class="btn btn-sm fa fa-pencil-square-o" title="Update"></a>`;
                const template1 = `<div title="Update" class="img-cell-clm" data-action-type="edit"><img data-action-type="edit" src="./content/images/svg/edit.png" alt="Sem-icons" style="cursor: pointer;"></div>
                `;
                return template1;
            }
        }
    ];
    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private clientService: ClientService,
        private modalService: NgbModal,
        private alertService: JhiAlertService
    ) {
        this.rowHeight = 44;
        this.cacheBlockSize = 100;
        this.maxBlocksInCache = 2;
        this.sideBar = 'columns';
        this.overlayNoRowsTemplate =
            '<span style="padding: 10px; border: 2px solid #444; background: lightgoldenrodyellow;">No Records Found</span>';
    }

    ngOnInit() {
        this.listView();
    }

    goToCreateClientInfo() {
        let url = 'administrationHome/clientList/client';
        this.router.navigate([url], { skipLocationChange: true });
    }

    listView() {
        this.clientService.getListingData().subscribe(
            (response: any) => {
                this.dataList = response;
                this.defaultColDef = {
                    sortable: true,
                    resizable: true
                };
                this.rowData = [];

                for (let column = 0; column < this.dataList.length; column++) {
                    const tempData_param = {};
                    for (let j = 0; j < this.columnList.length; j++) {
                        tempData_param[this.columnList[j]] = this.dataList[column][j];
                    }
                    tempData_param['ID'] = this.dataList[column][this.columnList.indexOf('ID')];
                    tempData_param['filePath'] = this.dataList[column][this.columnList.indexOf('FILE_PATH')];
                    this.rowData.push(tempData_param);
                }
            },
            (response: any) => {}
        );
    }

    onRowClicked(e) {
        if (e.event.target !== undefined) {
            const data = e.data;
            const actionType = e.event.target.getAttribute('data-action-type');
            switch (actionType) {
                case 'edit':
                    return this.update(data);
                case 'delete':
                    return this.openModel(data);
                case 'download':
                    return this.downloadFile(data);
            }
        }
    }

    downloadFile(data) {
        this.clientService.downloadFile(data.filePath).subscribe(response => {
            const blob = new Blob([response]);
            const objectUrl = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = objectUrl;
            a.download = data.filePath;
            a.target = '_blank';
            a.click();
        });
    }

    onGridReady(param) {
        this.params = param;
        param.api.setSideBar(false);
        param.api.sizeColumnsToFit();
    }

    update(data) {
        this.router.navigate(['administrationHome/clientList/client', { id: data.ID }], { skipLocationChange: true });
    }

    delete() {
        this.clientService.delete(this.data).subscribe(
            response => {
                this.cancel();
            },
            response => {
                this.alertService.error(response.error);
            }
        );
    }

    openModel(data) {
        this.data = data;
        this.modalService.open(this.deleteEntityModal, data);
    }

    cancel() {
        this.data = {};
        this.modalService.dismissAll();
    }
}
