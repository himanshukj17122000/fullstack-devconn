import React, { Fragment, useEffect } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import './App.css';
import Navbar from './components/layout/Navbar';
import Landing from './components/layout/Landing';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Alert from './components/layout/Alert';
import Dashboard from './components/dashboard/Dashboard';
import setAuthToken from '../src/utils/setAuthToken';
import PrivateRoutes from './components/routing/PrivateRoutes';
import CreateProfile from './components/profile-forms/CreateProfile';
import EditProfile from './components/profile-forms/EditProfile';
import AddExperience from './components/profile-forms/AddExperience';
import AddEducation from './components/profile-forms/AddEducation';
import Profiles from './components/profiles/Profiles';
import Profile from './components/profile/Profile';
import { loadUser } from './actions/auth';
//Redux
import { Provider } from 'react-redux';
import store from './store';

if (localStorage.token) {
  setAuthToken(localStorage.token);
}

const App = () => {
  useEffect(() => {
    store.dispatch(loadUser());
  }, []);

  return (
    <Provider store={store}>
      <Router>
        {' '}
        <Fragment>
          <Navbar />
          <Route exact path='/' component={Landing} />{' '}
          <section className='container'>
            <Alert />
            <Switch>
              <Route exact path='/register' component={Register} />{' '}
              <Route exact path='/login' component={Login} />{' '}
              <Route exact path='/profiles' component={Profiles} />{' '}
              <Route exact path='/profile/:id' component={Profile} />{' '}
              <PrivateRoutes exact path='/dashboard' component={Dashboard} />{' '}
              <PrivateRoutes
                exact
                path='/create-profile'
                component={CreateProfile}
              />{' '}
              <PrivateRoutes
                exact
                path='/edit-profile'
                component={EditProfile}
              />{' '}
              <PrivateRoutes
                exact
                path='/add-experience'
                component={AddExperience}
              />{' '}
              <PrivateRoutes
                exact
                path='/add-education'
                component={AddEducation}
              />{' '}
            </Switch>{' '}
          </section>{' '}
        </Fragment>{' '}
      </Router>{' '}
    </Provider>
  );
};

export default App;
