import { motion } from 'framer-motion';
import './ModalBackdrop.css';

export default function ModalBackdrop({children, callbackClose}) {
  return (
    <motion.div
      className='backdrop'
      onClick={callbackClose}
      initial={{opacity: 0}}
      animate={{opacity: 1}}
      exit={{opacity: 0}}
      transition={{duration: 0.3}}
    >
      {children}
    </motion.div>
  );
}
