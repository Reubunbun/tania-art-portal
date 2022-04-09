import { useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import ModalBackdrop from '../ModalBackdrop/ModalBackdrop.jsx';
import './UpdateSpaces.css';

export default function UpdateSpaces({
  callbackClose,
  callbackUpdateSpaces,
  intStartingSpaces,
}) {
  const [intSpaces, setSpaces] = useState(intStartingSpaces);

  const fnUpdate = () => {
    if (isNaN(intSpaces)) {
      return;
    }

    axios({
      url: '/api/spaces',
      method: 'PUT',
      data: {
        Spaces: intSpaces,
      },
    })
      .then(() => callbackUpdateSpaces(intSpaces))
      .catch(console.dir);
  };

  return (
    <ModalBackdrop callbackClose={callbackClose}>
      <motion.div
        onClick={e => e.stopPropagation()}
        className='modal-wrapper'
      >
        <div className='container-commission-content'>
          <div className='container-commission-group'>
            <label>Set Number of Open Commissions</label>
            <input
              type='text'
              value={intSpaces}
              onChange={e => setSpaces(e.target.value)}
            />
          </div>

          <button onClick={fnUpdate}>Update</button>
        </div>
      </motion.div>
    </ModalBackdrop>
  );
};
