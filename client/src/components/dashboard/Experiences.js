import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import Moment from 'react-moment';
import moment from 'moment';
import { deleteExperience } from '../../actions/profile';

import { connect } from 'react-redux';

const Experiences = ({ experience, deleteExperience }) => {
  const experiences = experience.map(exp => (
    <tr key={exp._id}>
      <td> {exp.company} </td> <td className='hide-sm'> {exp.title} </td>{' '}
      <td>
        {' '}
        {moment(exp.from).format('DD/MM/YYYY')} -{' '}
        {exp.to === null ? ' Now' : moment(exp.to).format('DD/MM/YYYY')}{' '}
      </td>{' '}
      <td>
        <button
          onClick={() => deleteExperience(exp._id)}
          className='btn btn-danger'
        >
          Delete{' '}
        </button>{' '}
      </td>{' '}
    </tr>
  ));

  return (
    <Fragment>
      <h2 className='my-2'> Experience Credentials </h2>{' '}
      <table className='table'>
        <thead>
          <tr>
            <th> Company </th> <th className='hide-sm'> Title </th>{' '}
            <th className='hide-sm'> Years </th> <th />
          </tr>{' '}
        </thead>{' '}
        <tbody> {experiences} </tbody>{' '}
      </table>{' '}
    </Fragment>
  );
};

Experiences.propTypes = {
  experience: PropTypes.array.isRequired,
  deleteExperience: PropTypes.func.isRequired,
};

export default connect(null, {
  deleteExperience,
})(Experiences);
