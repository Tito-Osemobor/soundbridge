import {useEffect, useState} from "react";
import {FaRegStar} from "react-icons/fa6";

const Footer = () => {
  const [githubInfo, setGitHubInfo] = useState({
    stars: 0,
  });

  useEffect(() => {
    fetch('https://api.github.com/repos/Tito-Osemobor/soundbridge')
      .then(response => response.json())
      .then(json => {
        const { stargazers_count } = json;
        setGitHubInfo({
          stars: stargazers_count,
        });
      })
      .catch(e => console.error(e));
  }, []);

  return (
    <div className={"mx-auto pt-3 px-3 rounded-t-lg items-center text-center z-50 border border-gray-300 bg-white"}>
      <a href="https://github.com/Tito-Osemobor/soundbridge"
         target={"_blank"}
         rel="noreferrer" >
        <div className={"text-black"}>Designed &amp; Built by Tito Osemobor</div>
      </a>
      <div className={"flex justify-center items-center text-black gap-1"}>
        <FaRegStar />
        {
          (githubInfo.stars) ? (
            <p>{githubInfo.stars}</p>
          ) : (<p>Error Occurred</p>)
        }
      </div>
    </div>
  );
};

export default Footer;
