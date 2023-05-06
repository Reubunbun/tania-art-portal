import { type FC, useState } from 'react';
import { motion } from 'framer-motion';
import ModalBackdrop from '../../../../Components/ModalBackdrop';
import styles from './UpdateSpaces.module.css';

interface Props {
  callbackClose: () => void;
  callbackUpdateSpaces: (spaces: number) => void;
  startingSpaces: number;
}

const UpdateSpaces: FC<Props> = ({ callbackClose, callbackUpdateSpaces, startingSpaces }) => {
  const [spaces, setSpaces] = useState<number>(startingSpaces);

  const update = () => {
    if (Number.isNaN(spaces)) {
      return;
    }

    fetch(
      '/api/spaces',
      {
        method: 'PUT',
        headers: { Accept: 'application/json' },
        body: JSON.stringify({ Spaces: spaces }),
      }
    )
      .then(() => callbackUpdateSpaces(spaces))
      .catch(console.error);
  };

  return (
    <ModalBackdrop callbackClose={callbackClose}>
      <motion.div
        onClick={e => e.stopPropagation()}
        className={styles['modal-wrapper']}
      >
        <div className={styles['container-commission-content']}>
          <div className={styles['container-commission-group']}>
            <label>Set Number of Open Commissions</label>
            <input
              type='text'
              value={spaces}
              onChange={e => setSpaces(+e.target.value)}
            />
          </div>

          <button onClick={update}>Update</button>
        </div>
      </motion.div>
    </ModalBackdrop>
  );
};

export default UpdateSpaces;
