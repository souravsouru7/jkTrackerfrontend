import React from "react";
import { useSelector } from "react-redux";
import Loading from "../components/common/Loading";

const PageWrapper = ({ children }) => {
  const { isLoading } = useSelector((state) => state.auth || {});

  if (isLoading) {
    return <Loading fullScreen size="120px" />;
  }

  return <>{children}</>;
};

export default PageWrapper;