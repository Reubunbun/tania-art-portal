import { type FC } from 'react'
import * as ReactRouterDom from 'react-router-dom';
import { parse as parseCookie } from 'cookie';
import { COOKIE_NAME } from '../shared/Constants';
import Authorize from './Components/Authorize';
import Login from './Routes/Login';
import EditWork from './Routes/EditWork';
import EditCommissionOptions from './Routes/EditCommissionOptions';

const { Switch, Route, Redirect, useLocation } = ReactRouterDom;

const AUTHORIZED_PATHS = [
  '/editwork',
  '/editcommissionoptions',
];

const App: FC = () => {
  const location = useLocation();

  const cookie = parseCookie(document.cookie);
  if (
    cookie[COOKIE_NAME] &&
    !AUTHORIZED_PATHS.includes(location.pathname)
  ) {
    return <Redirect to='/editwork' />;
  }

  return (
    <Switch location={location}>
      <Route path='/editwork'>
        <Authorize>
          <EditWork />
        </Authorize>
      </Route>
      <Route path='/editcommissionoptions'>
        <Authorize>
          <EditCommissionOptions />
        </Authorize>
      </Route>
      <Route path='/login'>
        <Login />
      </Route>
      <Route path='/'>
        <Login />
      </Route>
    </Switch>
  );
};

export default App;
