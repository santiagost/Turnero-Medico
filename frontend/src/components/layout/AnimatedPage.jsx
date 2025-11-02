import { motion } from 'framer-motion';


const animations = {
  slideUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeInOut' } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3, ease: 'easeInOut' } },
  },
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