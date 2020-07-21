import { Route } from '@angular/router';
import { ArithmaticFormulaComponent } from './arithmaticFormula.component';

export const ARITHMATICFORMULA_ROUTE: Route = {
    path: 'arithmaticFormula',
    component: ArithmaticFormulaComponent,
    data: {
        authorities: [],
        pageTitle: 'Arithmatic Formula'
    }
};
