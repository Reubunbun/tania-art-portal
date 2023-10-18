import { Switch, Route, Redirect, useLocation } from 'react-router-dom';
import cookie from 'cookie';
import Login from './Routes/Login/Login.jsx';
import EditWork from './Routes/EditWork/EditWork.jsx';
import EditCommissionOptions from './Routes/EditCommissionOptions/EditCommissionOptions.jsx';
import EditStock from './Routes/EditStock/EditStock.jsx';
import Authorize from './Components/Authorize/Authorize.jsx';
import './App.css';

const c_arrAuthorizedPaths = [
  '/editwork',
  '/editcommissionoptions',
  '/editstock',
];

function App() {
  const objLocation = useLocation();

  const objCookie = cookie.parse(document.cookie);
  if (
    objCookie &&
    objCookie.TamiArtToken &&
    !c_arrAuthorizedPaths.includes(objLocation.pathname)
  ) {
    return <Redirect to='/editwork' />;
  }

  return (
    <Switch location={objLocation}>
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
      <Route path='/editstock'>
        <Authorize>
          <EditStock />
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
}

export default App;
