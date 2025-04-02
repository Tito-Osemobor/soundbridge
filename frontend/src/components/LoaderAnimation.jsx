import { motion } from "motion/react"

const LoaderAnimation = () => {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="h-full w-full flex flex-col gap-2 justify-center items-center bg-grid"
    >
      <h1 className={`text-5xl font-black`}>SoundBridge</h1>
      <div className="bg-black p-5 rounded-full flex space-x-3">
        <div
          className="w-5 h-5 bg-white rounded-full animate-bounce"
          style={{ animationDelay: "0.1s", animationDuration: "0.5s" }}
        ></div>
        <div
          className="w-5 h-5 bg-white rounded-full animate-bounce"
          style={{ animationDelay: "0.3s", animationDuration: "0.5s" }}
        ></div>
        <div
          className="w-5 h-5 bg-white rounded-full animate-bounce"
          style={{ animationDelay: "0.6s", animationDuration: "0.5s" }}
        ></div>
      </div>
    </motion.div>
  );
};

export default LoaderAnimation;
