import { createContext, useContext, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { axiosReq, axiosRes } from "../api/axiosDefaults";
import { useHistory } from "react-router";
import { removeTokenTimestamp, shouldRefreshToken } from "../utils/utils";

export const CurrentUserContext = createContext();
export const SetCurrentUserContext = createContext();

export const useCurrentUser = () => useContext(CurrentUserContext);
export const useSetCurrentUser = () => useContext(SetCurrentUserContext);

export const CurrentUserProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const history = useHistory();

  const refreshToken = localStorage.getItem("refresh_token");
  const token = localStorage.getItem("token");

  const handleMount = async () => {
    try {
      const { data } = await axiosRes.get("dj-rest-auth/user/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setCurrentUser(data);
    } catch (err) {

    }
  };

  useEffect(() => {
    handleMount();
  }, [refreshToken]);

  useMemo(() => {
    axiosReq.interceptors.request.use(
      async (config) => {
        if (shouldRefreshToken()) {
          const token = localStorage.getItem("token");
          if (token) {
            config.headers["Authorization"] = `Bearer ${token}`;
          }
          try {
            await axios.post("/dj-rest-auth/token/refresh/");
          } catch (err) {
            setCurrentUser((prevCurrentUser) => {
              if (prevCurrentUser) {
                history.push("/signin");
              }
              return null;
            });
            removeTokenTimestamp();
            localStorage.removeItem("token");
            localStorage.removeItem("refresh_token");
            return config;
          }
        }

        return config;
      },
      (err) => {
        return Promise.reject(err);
      }
    );

    axiosRes.interceptors.response.use(
      (response) => response,
      async (err) => {
        if (err.response?.status === 401) {
          const refreshToken = localStorage.getItem("refresh_token");

          try {
            const { data } = await axios.post("/dj-rest-auth/token/refresh/", {
              refresh: refreshToken,
            });

            localStorage.setItem("token", data.access);
            const config = err.config;
            config.headers["Authorization"] = `Bearer ${data.access}`;
            return axios(config);
          } catch (err) {
            setCurrentUser((prevCurrentUser) => {
              if (prevCurrentUser) {
                history.push("/signin");
              }
              return null;
            });
            removeTokenTimestamp();
            localStorage.removeItem("token");
            localStorage.removeItem("refresh_token");
          }
          return axios(err.config);
        }
        return Promise.reject(err);
      }
    );
  }, [history, refreshToken]);

  return (
    <CurrentUserContext.Provider value={currentUser}>
      <SetCurrentUserContext.Provider value={setCurrentUser}>
        {children}
      </SetCurrentUserContext.Provider>
    </CurrentUserContext.Provider>
  );
};
