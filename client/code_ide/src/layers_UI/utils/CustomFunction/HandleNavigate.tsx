import { useNavigate } from "react-router-dom";

export function useHandleNavigate() {
  const navigate = useNavigate();

  return (path: string) => {
    navigate(`/${path}`);
  };
}
