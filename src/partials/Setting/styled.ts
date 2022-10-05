import styled from 'styled-components';

import Modal from '@/components/Modal';
import { StyledModalHeader } from '@/components/Modal/styled';

const StyledSettingModal = styled(Modal)`
  ${StyledModalHeader} {
    padding-bottom: 0;
  }
`;

export default StyledSettingModal;
