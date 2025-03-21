import { useCanvasStoreShallow } from '@refly-packages/ai-workspace-common/stores/canvas';
import { useMemo } from 'react';
import { useCanvasContext } from '@refly-packages/ai-workspace-common/context/canvas';

export const useEdgeStyles = () => {
  const { readonly } = useCanvasContext();
  const showEdges = useCanvasStoreShallow((state) => state.showEdges);

  return useMemo(
    () => ({
      default: {
        stroke: showEdges || readonly ? '#D0D5DD' : 'transparent',
        strokeWidth: 1,
        transition: 'stroke 0.2s, stroke-width 0.2s',
      },
      hover: {
        stroke: '#00968F',
        strokeWidth: 2,
        transition: 'stroke 0.2s, stroke-width 0.2s',
      },
      selected: {
        stroke: '#00968F',
        strokeWidth: 2,
        transition: 'stroke 0.2s, stroke-width 0.2s',
      },
    }),
    [showEdges],
  );
};

export const getEdgeStyles = (showEdges: boolean) => {
  return {
    default: {
      stroke: showEdges ? '#D0D5DD' : 'transparent',
      strokeWidth: 1,
      transition: 'stroke 0.2s, stroke-width 0.2s',
    },
  };
};
