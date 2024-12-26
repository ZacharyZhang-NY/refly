import { IconLink } from '@arco-design/web-react/icon';
import {
  IconCanvas,
  IconDocument,
  IconResource,
  IconMemo,
} from '@refly-packages/ai-workspace-common/components/common/icon';
import { MarkType } from '@refly/common-types';
import { CanvasNodeType } from '@refly/openapi-schema';
import { FileText } from 'lucide-react';
import { HiOutlineDocumentText, HiOutlineSquare3Stack3D } from 'react-icons/hi2';

export const getTypeIcon = (markType: MarkType, style?: any) => {
  switch (markType) {
    case 'resource':
      return <HiOutlineSquare3Stack3D style={style} />;
    case 'resourceSelection':
      return <HiOutlineSquare3Stack3D style={style} />;
    case 'document':
      return <HiOutlineDocumentText style={style} />;
    case 'documentSelection':
      return <HiOutlineDocumentText style={style} />;
    case 'extensionWeblink':
      return <IconLink style={style} />;
    case 'extensionWeblinkSelection':
      return <IconLink style={style} />;
  }
};

export const getNodeIcon = (node: CanvasNodeType, style?: any) => {
  switch (node) {
    case 'resource':
      return <HiOutlineSquare3Stack3D style={style} />;
    case 'document':
      return <HiOutlineDocumentText style={style} />;
    case 'memo':
      return <IconMemo style={style} />;
    case 'skillResponse':
      return <IconCanvas />;
    default:
      return null;
  }
};
