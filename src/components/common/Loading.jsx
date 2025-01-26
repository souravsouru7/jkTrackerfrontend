import React from 'react';
import styled from 'styled-components';

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: ${props => props.fullScreen ? '100vh' : '200px'};
  width: 100%;
`;

const LoadingImage = styled.img`
  width: ${props => props.size || '80px'};
  height: auto;
  animation: bounce 1s ease infinite;

  @keyframes bounce {
    0%, 100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-10px);
    }
  }
`;

const Loading = ({ fullScreen = false, size }) => {
  return (
    <LoadingContainer fullScreen={fullScreen}>
      <LoadingImage 
        src="/gif.png" 
        alt="Loading..."
        size={size}
      />
    </LoadingContainer>
  );
};

export default Loading;
