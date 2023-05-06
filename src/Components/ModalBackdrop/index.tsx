import { type FC, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import styles from './ModalBackdrop.module.css';

interface Props {
  children: ReactNode;
  callbackClose: () => void;
}

const ModalBackdrop: FC<Props> = ({ children, callbackClose }) => {
  return (
    <motion.div
      className={styles.backdrop}
      onClick={callbackClose}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
};

export default ModalBackdrop;
