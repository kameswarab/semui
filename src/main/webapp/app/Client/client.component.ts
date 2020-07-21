import { Component, OnInit } from '@angular/core';
import { ClientService } from './client.service';
import { Router, ActivatedRoute } from '@angular/router';
import { NgForm } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { JhiAlertService } from 'ng-jhipster';
import { ViewChild } from '@angular/core';
import { ElementRef } from '@angular/core';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { NgbDateMomentAdapter } from 'app/shared';
@Component({
    selector: 'jhi-home',
    templateUrl: './client.component.html',
    styleUrls: ['client.css']
})
export class ClientComponent implements OnInit {
    mid = null;
    isDisabled = true;

    IpRange = {
        ipAddr: null
    };

    formData = {
        clientName: null,
        ipAddress: null,
        location: null,
        ipType: null,
        subnet: [],
        moduleList: [],
        ipRanges: []
    };

    fileData = null;
    fileName = null;
    duplicateFileName: boolean;
    rowData: any[];
    public modulesData: any = [];

    @ViewChild('fileUpload') private file: ElementRef;

    moduleData = {
        moduleId: 0,
        fdate: null,
        tdate: null,
        grace: null
    };

    dropdownList = [];
    clientId = null;
    isUpdate = false;
    startDate: any;
    filePathtoDownload = null;
    disableAdd = true;
    ipRangeformat = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\/(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    ipformat = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

    constructor(
        private datePipe: DatePipe,
        private router: Router,
        private route: ActivatedRoute,
        private clientService: ClientService,
        private momentAdapter: NgbDateMomentAdapter,
        private alertService: JhiAlertService
    ) {
        this.startDate = this.datePipe.transform(new Date(), 'yyyy-MM-dd');
    }

    ngOnInit() {
        this.clientId = this.route.snapshot.params.id;
        if (this.clientId) {
            this.isUpdate = true;

            this.clientService.getClientById(this.clientId).subscribe(
                response => {
                    let clientMaster = response['clientMaster'];
                    let ipMappingData = response['ipMappingData'];
                    let moduleData = response['moduleData'];

                    this.filePathtoDownload = clientMaster.filePath;
                    this.formData.clientName = clientMaster.clientName;
                    this.formData.location = clientMaster.location;
                    if (ipMappingData !== null && ipMappingData.length !== 0) {
                        const index = ipMappingData[0].indexOf('/');
                        if (index !== -1) {
                            this.formData.ipType = 'IP Address Range';
                            this.formData.ipRanges = [];
                            for (let i = 0; i < ipMappingData.length; i++) {
                                this.IpRange = {
                                    ipAddr: null
                                };
                                this.IpRange.ipAddr = ipMappingData[i];
                                this.formData.ipRanges.push(this.IpRange);
                            }
                        } else {
                            this.formData.ipType = 'IP Address';
                            this.formData.ipAddress = ipMappingData[0];
                        }
                    } else {
                        this.IpRange = {
                            ipAddr: null
                        };
                        this.formData.ipRanges.push(this.IpRange);
                    }
                    if (moduleData !== null && moduleData.length !== 0) {
                        this.formData.moduleList = [];
                        for (let i = 0; i < moduleData.length; i++) {
                            let moduleDataTemp = {};

                            moduleDataTemp['moduleId'] = moduleData[i][0];
                            let dateStruct: NgbDateStruct;
                            let dateStruct1: NgbDateStruct;

                            let fdt = new Date(moduleData[i][1].split('T')[0]);
                            dateStruct = { year: fdt.getFullYear(), month: fdt.getMonth() + 1, day: fdt.getDate() };
                            moduleDataTemp['fdate'] = this.momentAdapter.toModel(dateStruct);

                            let fdt_ = new Date(moduleData[i][2].split('T')[0]);
                            dateStruct1 = { year: fdt_.getFullYear(), month: fdt_.getMonth() + 1, day: fdt_.getDate() };
                            moduleDataTemp['tdate'] = this.momentAdapter.toModel(dateStruct1);
                            moduleDataTemp['grace'] = moduleData[i][3];

                            this.formData.moduleList.push(moduleDataTemp);
                        }
                    } else {
                        this.moduleData = {
                            moduleId: 0,
                            fdate: null,
                            tdate: null,
                            grace: null
                        };
                        this.formData.moduleList.push(this.moduleData);
                    }

                    this.getModules();
                },
                () => {
                    this.router.navigate(['administrationHome/clientList'], { skipLocationChange: true });
                }
            );
        } else {
            this.formData.ipRanges.push(this.IpRange);
            this.formData.moduleList.push(this.moduleData);

            this.getModules();
        }
    }

    goToCreateClientinfo() {
        let url = 'administrationHome/clientList/client';
        this.router.navigate([url], { skipLocationChange: true });
    }

    getModules() {
        this.clientService.getModules().subscribe(response => {
            this.modulesData = [];
            this.dropdownList = [];
            this.modulesData = response;
        });
    }

    browsFile(event) {
        if (event.target.files.length === 1) {
            const file: File = event.target.files[0];
            this.fileData = file;
            this.filePathtoDownload = file.name;
        } else {
            this.filePathtoDownload = '';
            this.fileData = null;
            this.fileData.name = '';
            this.file.nativeElement.value = '';
        }
    }

    save(form: NgForm) {
        if (form.valid) {
            let formDataTemp = {
                clientName: this.formData.clientName,
                ipAddress: this.formData.ipAddress,
                location: this.formData.location,
                ipType: this.formData.ipType,
                subnet: this.formData.subnet,
                ipRanges: this.formData.ipRanges
            };

            if (this.fileData !== null) {
                if (this.fileData.size < 10000000 && this.fileData.type === 'application/pdf') {
                } else {
                    this.alertService.error('File must be PDF with size less than 10MB!');
                    document.getElementById('slide-2').scrollIntoView(true);
                    return false;
                }
            }

            if (this.formData.ipType === 'IP Address Range') {
                for (let i = 0; i < this.formData.ipRanges.length; i++) {
                    const ips = this.formData.ipRanges[i].ipAddr.split('/');
                    const num = ips[0].substr(ips[0].lastIndexOf('.') + 1);
                    if (Number(ips[1]) < Number(num)) {
                        this.alertService.clear();
                        this.alertService.error('Check the IP Ranges!');
                        document.getElementById('slide-2').scrollIntoView(true);
                        return false;
                    }
                }
            }

            let moduleList = [];

            for (let i = 0; i < this.formData.moduleList.length; i++) {
                if (new Date(this.formData.moduleList[i].tdate) < new Date(this.formData.moduleList[i].fdate)) {
                    this.alertService.clear();
                    this.alertService.error('Check the From & To dates!');
                    document.getElementById('slide-2').scrollIntoView(true);
                    return false;
                }
                if (this.formData.moduleList[i].grace > 180) {
                    this.alertService.error('Maximium Limit of Grace Period is 180 Days!');
                    document.getElementById('slide-2').scrollIntoView(true);
                    return false;
                }

                let mdul = this.formData.moduleList[i];

                let dateFrom = new Date(mdul.fdate);
                let dateTo = new Date(mdul.tdate);

                let module = {
                    moduleId: mdul.moduleId,
                    fdate: dateFrom.getFullYear() + '-' + (dateFrom.getMonth() + 1) + '-' + dateFrom.getDate(),
                    tdate: dateTo.getFullYear() + '-' + (dateTo.getMonth() + 1) + '-' + dateTo.getDate(),
                    grace: mdul.grace
                };

                moduleList.push(module);
            }

            formDataTemp['moduleList'] = moduleList;

            const formD: FormData = new FormData();
            formD.append('file', this.fileData);
            formD.append('clientCreationDTOString', JSON.stringify(formDataTemp));
            if (!this.isUpdate) {
                this.clientService.saveData(formD).subscribe(
                    response => {
                        this.alertService.clear();
                        this.alertService.success(response);
                        document.getElementById('slide-2').scrollIntoView(true);
                        form.resetForm();

                        this.router.navigate(['/administrationHome/clientList'], { skipLocationChange: true });
                        this.fileData = null;
                        this.filePathtoDownload = null;
                    },
                    errorresponse => {
                        this.alertService.clear();
                        this.alertService.error(errorresponse.error);
                        document.getElementById('slide-2').scrollIntoView(true);
                        this.fileData = null;
                    }
                );
            } else {
                formD.append('clientId', this.clientId);
                this.clientService.uploadData(formD).subscribe(
                    response => {
                        this.alertService.clear();
                        this.alertService.success(response);
                        document.getElementById('slide-2').scrollIntoView(true);
                        this.router.navigate(['/administrationHome/clientList'], { skipLocationChange: true });
                        this.fileData = null;
                        this.filePathtoDownload = null;
                    },
                    errorresponse => {
                        this.alertService.clear();
                        this.alertService.error(errorresponse.error);
                        document.getElementById('slide-2').scrollIntoView(true);
                        this.fileData = null;
                    }
                );
            }
        }
    }

    resetOther(ipType) {
        if (ipType === 'IP Address Range') {
            this.formData.ipAddress = null;
        } else {
            this.IpRange = {
                ipAddr: null
            };
            this.formData.ipRanges = [];
            this.formData.ipRanges.push(this.IpRange);
        }
    }

    clearClientScreen(form: NgForm) {
        form.resetForm();
        this.fileData = null;
        this.file.nativeElement.value = '';
        this.fileData.name = null;
    }

    addIpRange() {
        this.IpRange = {
            ipAddr: null
        };
        this.formData.ipRanges.push(Object.assign({}, this.IpRange));
    }

    deleteColumn(index) {
        if (this.formData.ipRanges.length > 1) {
            this.formData.ipRanges.splice(index, 1);
        }
    }

    addModule(i: number) {
        this.moduleData = {
            moduleId: null,
            fdate: null,
            tdate: null,
            grace: null
        };
        if (this.formData.moduleList.length < 3) {
            this.formData.moduleList.push(Object.assign({}, this.moduleData));
        } else {
            this.alertService.clear();
            this.alertService.error('Cannot add more than Four modules');
            document.getElementById('slide-2').scrollIntoView(true);
        }
    }

    deleteModule(index) {
        if (this.formData.moduleList.length > 1) {
            this.formData.moduleList.splice(index, 1);
        }
    }

    downloadFile(filePathtoDownload) {
        this.clientService.downloadFile(filePathtoDownload).subscribe(
            response => {
                const blob = new Blob([response]);
                const objectUrl = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = objectUrl;
                a.download = filePathtoDownload;
                a.target = '_blank';
                a.click();
            },
            errorresponse => {
                this.alertService.error('Cannot download!');
            }
        );
    }
}
