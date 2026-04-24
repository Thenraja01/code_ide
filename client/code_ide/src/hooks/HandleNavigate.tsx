import { useNavigate } from "react-router-dom";

export function useHandleNavigate() {
  const navigate = useNavigate();

  return (path: string) => {
    // Ensure we don't end up with double slashes or missing slashes
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    // If the path is just /, avoid //
    const finalPath = cleanPath === '//' ? '/' : cleanPath;
    navigate(finalPath);
  };
}
