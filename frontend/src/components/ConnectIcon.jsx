import Button from "@/components/Button";
import {useAuth} from "@/context/AuthContext";

const ConnectIcon = ({icon, name, isConnected}) => {
  const {connect} = useAuth();
  const handleClick = async () => {
    await connect(name);
  }

  return (
    <Button
      className="w-[98px] h-[129px] flex flex-col justify-center items-center bg-gray-50 border border-gray-500 text-white p-2 rounded-2xl cursor-pointer gap-1.5"
      onClick={handleClick}>
      <div className="relative">
        {icon("text-6xl text-black")}
        {isConnected && (
          <div className="absolute bottom-1 right-1 w-3 h-3 bg-green-500 rounded-full"></div>
        )}
      </div>
      <span className="text-sm text-center text-black font-bold">{name}</span>
    </Button>
  );
};

export default ConnectIcon;
