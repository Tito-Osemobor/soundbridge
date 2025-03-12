import Button from "./Button";
import {useAuth} from "@/context/AuthContext";
import PropTypes from "prop-types";

const AuthButton = ({name, color, hoverColor, icon}) => {
  const {login} = useAuth();
  const handleClick = () => {
    login(name);
  };

  return (
    <Button onClick={handleClick}
            className={`w-full py-3 font-bold flex items-center justify-center gap-3 ${color} ${hoverColor}`}>
      {icon("text-4xl")} {/* Dynamic Icon */}
      <span className="flex-1 text-center">{`Sign in with ${name}`}</span>
    </Button>
  );
};

// 🔹 Define PropTypes for validation
AuthButton.propTypes = {
  name: PropTypes.string.isRequired,
  color: PropTypes.string.isRequired,
  hoverColor: PropTypes.string.isRequired,
};

export default AuthButton;
