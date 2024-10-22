import { Divider, Button } from '@arco-design/web-react';
import { HiOutlinePlus } from 'react-icons/hi2';
import { useAINote } from '@refly-packages/ai-workspace-common/hooks/use-ai-note';
import { CanvasList } from '@refly-packages/ai-workspace-common/components/workspace/canvas-list';
import { useKnowledgeBaseStore } from '@refly-packages/ai-workspace-common/stores/knowledge-base';
import { useTranslation } from 'react-i18next';
import './index.scss';
import { useCanvasStore } from '@refly-packages/ai-workspace-common/stores/canvas';

export const AINoteEmpty = () => {
  const { t } = useTranslation();
  const { handleInitEmptyNote } = useAINote();

  const { newNoteCreating } = useCanvasStore((state) => ({
    newNoteCreating: state.newCanvasCreating,
  }));
  const { resourcePanelVisible } = useKnowledgeBaseStore((state) => ({
    resourcePanelVisible: state.resourcePanelVisible,
  }));

  return (
    <div className="flex overflow-auto justify-center items-center mt-16 w-full ai-note-empty">
      <div className="w-full max-w-screen-lg h-full">
        <Button
          className="ml-20 text-green-400"
          icon={<HiOutlinePlus />}
          loading={newNoteCreating}
          onClick={() => handleInitEmptyNote('')}
        >
          {t('knowledgeBase.note.newNote')}
        </Button>
        <Divider />
        <CanvasList
          listGrid={
            resourcePanelVisible
              ? {
                  sm: 48,
                  md: 24,
                  lg: 16,
                  xl: 12,
                }
              : {
                  sm: 42,
                  md: 16,
                  lg: 10,
                  xl: 8,
                }
          }
        />
      </div>
    </div>
  );
};
