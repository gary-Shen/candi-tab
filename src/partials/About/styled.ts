import styled from 'styled-components';

const StyledAbout = styled.div`
  padding: 1rem;
  .logo {
    margin-bottom: 1rem;
    text-align: center;
    img {
      width: 48px;
    }
  }
  .content {
  }

  .title {
    font-weight: bold;
    text-align: center;
  }

  .version {
    color: #666;
    font-weight: normal;
  }

  .refs {
    text-align: center;

    & > a {
      margin: 0 0.5rem;
      color: #333;
    }
  }
`;

export default StyledAbout;
