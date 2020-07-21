import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UserRouteAccessService } from 'app/core';
import { ClientUserComponent } from './clientUser.component';

const routes: Routes = [
    {
        path: 'administrationHome/clientUsers',
        component: ClientUserComponent,
        canActivate: [UserRouteAccessService],
        data: {
            authorities: ['ROLE_ADMIN'],
            pageTitle: 'Client Users'
        }
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ClientUserRoutingModule {}
