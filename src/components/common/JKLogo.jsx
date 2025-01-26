import React from 'react';
import styled from 'styled-components';

const LogoContainer = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
  }
`;

const Logo = styled.img`
  height: 100%;
  width: auto;
  transition: transform 0.3s ease;
`;

const JKLogo = ({ size = '120', className = '' }) => {
  const numericSize = parseInt(size);
  
  return (
    <LogoContainer className={className}>
      <Logo
        src="/gif.png"
        alt="JK"
        style={{
          height: `${numericSize}px`,
        }}
      />
    </LogoContainer>
  );
};

export default JKLogo;
