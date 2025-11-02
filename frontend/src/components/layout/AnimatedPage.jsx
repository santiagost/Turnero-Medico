import { motion } from 'framer-motion';


const animations = {
  slideUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeInOut' } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3, ease: 'easeInOut' } },
  },
  
  slideHorizontal: {
    initial: { opacity: 0, x: '100vw' },
    animate: { opacity: 1, x: 0, transition: { duration: 0.4, ease: [0.25, 1, 0.5, 1] } },
    exit: { opacity: 0, x: '-100vw', transition: { duration: 0.3, ease: [0.25, 1, 0.5, 1] } },
  },

  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.5, ease: 'easeInOut' } },
    exit: { opacity: 0, transition: { duration: 0.3, ease: 'easeInOut' } },
  }
};

const AnimatedPage = ({ children, type = "slideUp" }) => {
  
  const selectedAnimation = animations[type] || animations.slideUp;

  return (
    <motion.div
      variants={selectedAnimation}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {children}
    </motion.div>
  );
};

export default AnimatedPage;