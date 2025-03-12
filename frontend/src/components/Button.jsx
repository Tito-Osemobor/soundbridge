import PropTypes from "prop-types";
import {useRouter} from "next/router";

const Button = ({ children, disabled, onClick, href, className = "", style = {} }) => {
  const router = useRouter();

  const handleClick = () => {
    if (href) {
      router.push(href);
    } else if (onClick) {
      onClick();
    }
  }
  return (
    <button
      className={`bg-black px-4 py-2 rounded-lg ${className} cursor-pointer text-white transition transform active:scale-95`}
      onClick={handleClick}
      style={style}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

// Define PropTypes
Button.propTypes = {
  children: PropTypes.node.isRequired, // Button text or icon
  onClick: PropTypes.func.isRequired, // Click event function
  href: PropTypes.string, // Link to navigate to
  className: PropTypes.string, // Additional custom classes
  style: PropTypes.object, // Inline styles
};

// Default props
Button.defaultProps = {
  onClick: () => {},
  className: "",
  style: {},
};

export default Button;
