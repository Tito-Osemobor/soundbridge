import PropTypes from "prop-types";

const Input = ({type, id, value, onChange, placeHolder}) => {
  return (
    <div className="relative">
      <input
        type={type}
        id={id}
        className="block px-3 pb-2.5
                    pt-4 w-full h-16 text-sm text-black
                    rounded-md border border-gray-700
                    appearance-none duration-300 peer
                    focus:ring-0 focus:outline-2 focus:outline-gray-700
                    focus:outline-offset-4"
        placeholder=""
        name={id}
        value={value}
        onChange={onChange}
      />
      <label
        htmlFor={id}
        className="absolute text-sm text-gray-600 font-semibold bg-none
                    duration-300 transform -translate-y-4 scale-75 top-5
                    origin-[0] px-3 select-none
                    peer-placeholder-shown:scale-100
                    peer-placeholder-shown:-translate-y-3 peer-placeholder-shown:top-1/2
                    peer-focus:top-5 peer-focus:scale-75 peer-focus:-translate-y-4
                    start-1 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto"
      >
        {placeHolder}
      </label>
    </div>
  );
};

Input.propTypes = {
  type: PropTypes.string.isRequired,
  id: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  placeHolder: PropTypes.string.isRequired,
}

export default Input;
