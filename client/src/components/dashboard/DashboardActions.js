import React from 'react';
import { Link } from 'react-router-dom';

const DashboardActions = () => {
  const handleChange = e => {
    e.preventDefault();
    console.log('Hello');
  };
  return (
    <div class='dash-buttons'>
      <Link to='/edit-profile' className='btn btn-light'>
        <i className='fas fa-user-circle text-primary'> </i> Edit Profile{' '}
      </Link>{' '}
      <Link to='/add-experience' className='btn btn-light'>
        <i className='fab fa-black-tie text-primary'> </i> Add Experience{' '}
      </Link>{' '}
      <Link to='/add-education' className='btn btn-light'>
        <i className='fas fa-graduation-cap text-primary'> </i> Add Education{' '}
      </Link>{' '}
      <span className='btn btn-light' onClick={handleChange}>
        <i className='fas fa-user-edit text-primary'> </i> Add a Profile Image{' '}
      </span>
    </div>
  );
};

export default DashboardActions;
