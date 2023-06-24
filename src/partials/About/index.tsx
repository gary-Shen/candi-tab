import { AiOutlineGithub } from '@react-icons/all-files/ai/AiOutlineGithub';
import { AiOutlineHome } from '@react-icons/all-files/ai/AiOutlineHome';
import { useMemo } from 'react';

import MyModal from '@/components/Dialog';
import icon from '@/assets/logo.png';

export interface AboutProps {
  visible: boolean;
  onClose: () => void;
}

export default function About({ visible, onClose }: AboutProps) {
  const manifest = useMemo(() => {
    try {
      return chrome.runtime.getManifest();
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn(err);
      return {};
    }
  }, []);
  return (
    <MyModal visible={visible} onClose={onClose} width={300} showCloseButton={false}>
      <div className="p-2">
        <div className="flex justify-center my-4">
          <img className="w-10" src={icon} />
        </div>
        <div className="text-font-color">
          <div className="text-center font-bold mb-6">
            Candi-Tab
            <p className="version font-normal text-gray-color">{manifest.version || 'unknown'}</p>
          </div>
          <div className="refs flex items-center justify-center">
            <a
              href="https://chrome.google.com/webstore/detail/candi-tab/oceflfkedkgjbamdjonjnjchfmimbceb"
              className="mx-2"
              target="_blank"
              rel="noreferrer"
            >
              <AiOutlineHome />
            </a>
            <a
              href="https://github.com/gary-Shen/candi-tab#candi-tab"
              className="mx-2"
              target="_blank"
              rel="noreferrer"
            >
              <AiOutlineGithub />
            </a>
          </div>
        </div>
      </div>
    </MyModal>
  );
}
