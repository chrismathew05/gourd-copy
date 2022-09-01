//Core imports
import React from 'react';
import { Router, Route, Switch } from 'react-router';
import createBrowserHistory from 'history/createBrowserHistory';

//Route components
import Dashboard from "./DashboardUI/Dashboard";
import CommitmentsContainer from './CommitmentsUI/Commitments';
import Budget from "./BudgetUI/Budget";
import Shopping from "./ShoppingListUI/Shopping";
import EditOrderContainer from "./OrdersUI/EditOrderUI/EditOrder";
import LogListContainer from "./GeneralUI/LogList";
import AccountingContainer from "./AccountingUI/Accounting";

import Orders from "./OrdersUI/Orders";

import Test from "./GeneralUI/Test";
import Test2 from "./GeneralUI/Test2";

import SideNavigation from "./GeneralUI/SideNavigation";
import NavBar from "./GeneralUI/NavBar";

import {ToastContainer} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.min.css';

const browserHistory = createBrowserHistory();

export const renderRoutes = () => (
    <Router history={browserHistory}>
        <span>
            <div id={'appContent'}>
                <Switch>
                    <Route exact path="/" component={Dashboard}/>
                    <Route path="/commitments" component={CommitmentsContainer}/>
                    <Route path={"/budgets"} component={Budget}/>
                    <Route path={'/orders/list/:queryStr'} exact component={Orders}/>
                    <Route path={'/shoppinglists'} component={Shopping}/>
                    <Route path={'/orders/edit/:orderId'} exact component={EditOrderContainer}/>
                    <Route path={'/log'} exact component={LogListContainer}/>
                    <Route path={'/accounting'} exact component={AccountingContainer}/>
                    <Route path={'/testing'} exact component={Test}/>
                    <Route path={'/testing2'} exact component={Test2}/>
                </Switch>
            </div>
            <SideNavigation/>
            <NavBar history={browserHistory}/>
            <ToastContainer/>
        </span>
    </Router>
);