import { AiOutlineGithub } from '@react-icons/all-files/ai/AiOutlineGithub';
import { AiOutlineHome } from '@react-icons/all-files/ai/AiOutlineHome';
import { useMemo } from 'react';

import Modal from '@/components/Modal';
import icon from '@/icons/candi-tab.png';

import StyledAbout from './styled';

export interface AboutProps {
  visible: boolean;
  onClose: () => void;
}

export default function About({ visible, onClose }: AboutProps) {
  const manifest = useMemo(() => {
    try {
      return chrome.runtime.getManifest();
    } catch (err) {
      console.log(err);
      return {};
    }
  }, []);
  return (
    <Modal visible={visible} onClose={onClose} style={{ width: 300 }} showCloseButton={false}>
      <Modal.Body>
        <StyledAbout>
          <div className="logo">
            <img src={icon} />
          </div>
          <div className="content">
            <div className="title">
              Candi-Tab
              {/* @ts-ignore */}
              <p className="version">{manifest.version || 'unknown'}</p>
            </div>
            <div className="refs">
              <a
                href="https://chrome.google.com/webstore/detail/candi-tab/oceflfkedkgjbamdjonjnjchfmimbceb"
                target="_blank"
                rel="noreferrer"
              >
                <AiOutlineHome />
              </a>
              <a href="https://github.com/gary-Shen/candi-tab#candi-tab" target="_blank" rel="noreferrer">
                <AiOutlineGithub />
              </a>
            </div>
          </div>
        </StyledAbout>
      </Modal.Body>
    </Modal>
  );
}
