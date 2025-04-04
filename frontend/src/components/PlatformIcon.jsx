import Button from "@/components/Button";
import PropTypes from "prop-types";

const PlatformIcon = ({service, isConnected, isPending, onClick}) => {
  const handleClick = () => {
    if (onClick) onClick();
  };

  return (
    <Button
      className={`group w-[98px] h-[129px] flex flex-col justify-center
                  items-center bg-gray-200 border border-gray-500 text-white
                  p-2 rounded-2xl cursor-pointer gap-1.5`}
      onClick={handleClick}>
      <div
        className={`relative p-3 transition-all ${service.backGroundColor} rounded-full group-hover:rounded-3xl`}>
        {service.icon(`text-4xl ${service.color}`)}
        <div className="absolute -bottom-1 right-0">
          <div className="bg-gray-200 rounded-full p-1">
            {isConnected && (
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            )}
            {isPending && (
              <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
            )}
            {!isConnected && !isPending && (
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            )}
          </div>
        </div>
      </div>
      <span className="text-sm text-center text-black font-bold">{service.name}</span>
    </Button>
  );
};

PlatformIcon.propTypes = {
  service: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    icon: PropTypes.func.isRequired,
    color: PropTypes.string.isRequired,
    backGroundColor: PropTypes.string.isRequired,
    textColor: PropTypes.string.isRequired,
    hoverColor: PropTypes.string.isRequired,
  }).isRequired,
  isConnected: PropTypes.bool,
  isPending: PropTypes.bool,
  onClick: PropTypes.func,
};

export default PlatformIcon;
