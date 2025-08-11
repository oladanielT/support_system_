import { Link } from "react-router-dom";
import { Home } from "lucide-react";
import { motion } from "framer-motion";

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <motion.div
        className="text-center"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <h1 className="text-7xl font-extrabold text-gray-300 mb-4">404</h1>
        <h2 className="text-3xl font-bold text-gray-700 mb-3">
          Oops! Page Not Found
        </h2>
        <p className="text-gray-500 text-lg mb-8 max-w-md mx-auto">
          The page you’re trying to reach doesn’t exist or may have been moved.
        </p>

        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors duration-300 shadow-md"
        >
          <Home size={20} />
          Go Home
        </Link>
      </motion.div>
    </div>
  );
};

export default NotFound;
