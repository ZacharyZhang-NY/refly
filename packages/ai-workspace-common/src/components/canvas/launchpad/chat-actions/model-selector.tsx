import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Dropdown, DropdownProps, MenuProps, Progress, Skeleton } from 'antd';
import { useTranslation } from 'react-i18next';
import { IconDown } from '@arco-design/web-react/icon';
import classNames from 'classnames';
import { useChatStoreShallow } from '@refly-packages/ai-workspace-common/stores/chat';
import { getPopupContainer } from '@refly-packages/ai-workspace-common/utils/ui';
import { useUserStoreShallow } from '@refly-packages/ai-workspace-common/stores/user';
import { useSubscriptionStoreShallow } from '@refly-packages/ai-workspace-common/stores/subscription';

import { PiWarningCircleBold } from 'react-icons/pi';
import { ModelInfo, TokenUsageMeter } from '@refly/openapi-schema';
import { IconModel, ModelProviderIcons } from '@refly-packages/ai-workspace-common/components/common/icon';
import { useGetSubscriptionUsage, useListModels } from '@refly-packages/ai-workspace-common/queries';
import { IconSubscription } from '@refly-packages/ai-workspace-common/components/common/icon';
import { LuInfinity } from 'react-icons/lu';
import { useSiderStoreShallow } from '@refly-packages/ai-workspace-common/stores/sider';

interface ModelSelectorProps {
  dropdownMode?: boolean; // Whether to show as dropdown button
  briefMode?: boolean;
  className?: string;
  placement?: DropdownProps['placement'];
  trigger?: DropdownProps['trigger'];
}

export const ModelSelector = ({
  placement = 'bottomLeft',
  trigger = ['click'],
  briefMode = false,
}: ModelSelectorProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const { userProfile } = useUserStoreShallow((state) => ({
    userProfile: state.userProfile,
  }));
  const { selectedModel, setSelectedModel } = useChatStoreShallow((state) => ({
    selectedModel: state.selectedModel,
    setSelectedModel: state.setSelectedModel,
  }));
  const { setSubscribeModalVisible } = useSubscriptionStoreShallow((state) => ({
    setSubscribeModalVisible: state.setSubscribeModalVisible,
  }));

  const { data: modelListData, isLoading: isModelListLoading } = useListModels();
  const { data: tokenUsageData, isLoading: isTokenUsageLoading } = useGetSubscriptionUsage();

  const modelList = modelListData?.data;
  const tokenUsage = tokenUsageData?.data?.token;
  const t1Disabled = tokenUsage?.t1TokenUsed >= tokenUsage?.t1TokenQuota;
  const t2Disabled = tokenUsage?.t2TokenUsed >= tokenUsage?.t2TokenQuota;

  const planTier = userProfile?.subscription?.planType || 'free';

  const { setShowSettingModal } = useSiderStoreShallow((state) => ({
    setShowSettingModal: state.setShowSettingModal,
  }));

  const handleShowSettingModal = () => {
    setDropdownOpen(false);
    setShowSettingModal(true);
  };

  const droplist: MenuProps['items'] = [
    {
      key: 't1',
      type: 'group',
      label: (
        <div className="flex justify-between items-center">
          <span className="text-sm">{t('copilot.modelSelector.premium')}</span>
          {planTier === 'free' ? (
            <Button
              type="text"
              size="small"
              className="text-xs !text-green-600 gap-1 translate-x-2"
              icon={<IconSubscription />}
              onClick={(e) => {
                e.stopPropagation();
                setDropdownOpen(false);
                setSubscribeModalVisible(true);
              }}
            >
              {t1Disabled ? t(`copilot.modelSelector.quotaExceeded.t1.free`) : ''}
            </Button>
          ) : (
            <Progress
              type="circle"
              percent={(tokenUsage?.t1TokenUsed / tokenUsage?.t1TokenQuota) * 100}
              strokeColor={t1Disabled ? '#EF4444' : '#46C0B2'}
              strokeWidth={20}
              size={14}
              format={() =>
                t1Disabled
                  ? t(`copilot.modelSelector.quotaExceeded.t1.paid`)
                  : t('copilot.modelSelector.tokenUsed', {
                      used: tokenUsage?.t1TokenUsed?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') ?? '0',
                      quota: tokenUsage?.t1TokenQuota?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') ?? '0',
                    })
              }
            />
          )}
        </div>
      ),
      children: modelList
        ?.filter((model) => model.tier === 't1')
        .map((model) => ({
          key: model.name,
          icon: <img className="w-4 h-4 mr-2" src={ModelProviderIcons[model.provider]} alt={model.provider} />,
          label: <span className="text-xs">{model.label}</span>,
          disabled: t1Disabled,
        })),
    },
    {
      key: 't2',
      type: 'group',
      label: (
        <div className="flex justify-between items-center">
          <div className="text-sm">{t('copilot.modelSelector.standard')}</div>
          <div className="flex items-center gap-1 cursor-pointer" onClick={() => handleShowSettingModal()}>
            <Progress
              type="circle"
              percent={(tokenUsage?.t2TokenUsed / tokenUsage?.t2TokenQuota) * 100}
              strokeColor={t2Disabled ? '#EF4444' : '#46C0B2'}
              strokeWidth={20}
              size={14}
              format={() =>
                t2Disabled
                  ? t(`copilot.modelSelector.quotaExceeded.t2.${planTier === 'free' ? 'free' : 'paid'}`)
                  : t('copilot.modelSelector.tokenUsed', {
                      used: tokenUsage?.t2TokenUsed?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') ?? '0',
                      quota: tokenUsage?.t2TokenQuota?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') ?? '0',
                    })
              }
            />
          </div>
        </div>
      ),
      children:
        modelList
          ?.filter((model) => model.tier === 't2')
          .map((model) => {
            return {
              key: model.name,
              icon: <img className="w-4 h-4 mr-2" src={ModelProviderIcons[model.provider]} alt={model.provider} />,
              label: <span className="text-xs">{model.label}</span>,
              disabled: t2Disabled,
            };
          }) ?? [],
    },
    {
      key: 'free',
      type: 'group',
      label: (
        <div className="flex justify-between items-center">
          <span className="text-sm">{t('copilot.modelSelector.free')}</span>
          <LuInfinity className="text-sm" />
        </div>
      ),
      children: modelList
        ?.filter((model) => model.tier === 'free')
        .map((model) => ({
          key: model.name,
          icon: <img className="w-4 h-4 mr-2" src={ModelProviderIcons[model.provider]} alt={model.provider} />,
          label: <span className="text-xs">{model.label}</span>,
        })),
    },
  ];

  const isModelDisabled = (meter: TokenUsageMeter, model: ModelInfo) => {
    if (meter && model) {
      if (model.tier === 't1') {
        return meter.t1TokenUsed >= meter.t1TokenQuota;
      } else if (model.tier === 't2') {
        return meter.t2TokenUsed >= meter.t2TokenQuota;
      }
    }
    return false;
  };

  useEffect(() => {
    if (!selectedModel || isModelDisabled(tokenUsage, selectedModel)) {
      const availableModel = modelList.find((model) => !isModelDisabled(tokenUsage, model));
      if (availableModel) {
        setSelectedModel(availableModel);
      } else {
        setSelectedModel(null);
      }
    }
  }, [selectedModel, tokenUsage]);

  if (isModelListLoading || isTokenUsageLoading) {
    return <Skeleton className="w-28" active paragraph={false} />;
  }

  return (
    <Dropdown
      menu={{
        items: droplist,
        onClick: ({ key }) => {
          const model = modelList.find((model) => model.name === key);
          if (model) {
            setSelectedModel(model);
          }
        },
      }}
      placement={placement}
      trigger={trigger}
      open={dropdownOpen}
      onOpenChange={setDropdownOpen}
      getPopupContainer={getPopupContainer}
    >
      {!briefMode ? (
        <span className={classNames('model-selector', 'chat-action-item')}>
          {selectedModel ? (
            <>
              <img
                className="w-3 h-3 mx-1"
                src={ModelProviderIcons[selectedModel?.provider]}
                alt={selectedModel?.provider}
              />
              {selectedModel?.label}
            </>
          ) : (
            <>
              <PiWarningCircleBold className="text-yellow-600" />
              <span className="text-yellow-600">{t('copilot.modelSelector.noModelAvailable')}</span>
            </>
          )}
          <IconDown />
        </span>
      ) : (
        <IconModel className="w-3.5 h-3.5" />
      )}
    </Dropdown>
  );
};
