import { ModelInfo, TokenUsageItem } from '@refly-packages/openapi-schema';

export enum LLMType {
  GPT4oMini = 'openai/gpt-4o-mini',
  GPT4o = 'openai/gpt-4o',
  Claude35Sonnet = 'anthropic/claude-3.5-sonnet',
  Claude3Haiku = 'anthropic/claude-3-haiku',
  GeminiFlash15 = 'google/gemini-flash-1.5',
  GeminiPro15 = 'google/gemini-pro-1.5',
  GeminiFlash20 = 'google/gemini-2.0-flash-exp:free',
}

export const ModelContextLimitMap = {
  [LLMType.GPT4oMini]: 128 * 1024,
  [LLMType.GPT4o]: 128 * 1024,
  [LLMType.Claude35Sonnet]: 200 * 1024,
  [LLMType.Claude3Haiku]: 200 * 1024,
  [LLMType.GeminiFlash15]: 1024 * 1024,
  [LLMType.GeminiPro15]: 1024 * 1024,
  [LLMType.GeminiFlash20]: 1024 * 1024,
};

export const modelMap: Record<string, ModelInfo> = {
  [LLMType.GPT4o]: {
    name: LLMType.GPT4o,
    label: 'GPT-4o',
    provider: 'openai',
    tier: 't1',
    contextLimit: 128 * 1024,
  },
  [LLMType.GPT4oMini]: {
    name: LLMType.GPT4oMini,
    label: 'GPT-4o Mini',
    provider: 'openai',
    tier: 't2',
    contextLimit: 128 * 1024,
  },
  [LLMType.Claude35Sonnet]: {
    name: LLMType.Claude35Sonnet,
    label: 'Claude 3.5 Sonnet',
    provider: 'anthropic',
    tier: 't1',
    contextLimit: 200 * 1024,
  },
  [LLMType.Claude3Haiku]: {
    name: LLMType.Claude3Haiku,
    label: 'Claude 3 Haiku',
    provider: 'anthropic',
    tier: 't2',
    contextLimit: 200 * 1024,
  },
  [LLMType.GeminiFlash15]: {
    name: LLMType.GeminiFlash15,
    label: 'Gemini 1.5 Flash',
    provider: 'google',
    tier: 't2',
    contextLimit: 1024 * 1024,
  },
  [LLMType.GeminiPro15]: {
    name: LLMType.GeminiPro15,
    label: 'Gemini 1.5 Pro',
    provider: 'google',
    tier: 't1',
    contextLimit: 1024 * 1024,
  },
  [LLMType.GeminiFlash20]: {
    name: LLMType.GeminiFlash20,
    label: 'Gemini Flash 2.0',
    provider: 'google',
    tier: 'free',
    contextLimit: 1024 * 1024,
  },
};

export const defaultModelList: ModelInfo[] = Object.values(modelMap).sort((a, b) => {
  if (a.tier === b.tier) {
    return a.name.localeCompare(b.name);
  }
  return a.tier.localeCompare(b.tier);
});

/**
 * Aggregate token usage items by model tier and name
 */
export const aggregateTokenUsage = (usageItems: TokenUsageItem[]): TokenUsageItem[] => {
  let aggregatedUsage: Record<
    string,
    {
      inputTokens: number;
      outputTokens: number;
      modelProvider: string;
    }
  > = {};

  usageItems.forEach((item) => {
    const key = `${item.tier}:${item.modelName}`;
    if (!aggregatedUsage[key]) {
      aggregatedUsage[key] = { inputTokens: 0, outputTokens: 0, modelProvider: item.modelProvider };
    }
    aggregatedUsage[key].inputTokens += item.inputTokens;
    aggregatedUsage[key].outputTokens += item.outputTokens;
  });

  return Object.entries(aggregatedUsage)
    .map(([key, value]) => {
      const [tier, modelName] = key.split(':');
      return {
        tier,
        modelName,
        modelProvider: value.modelProvider,
        inputTokens: value.inputTokens,
        outputTokens: value.outputTokens,
      };
    })
    .sort((a, b) => {
      if (a.tier === b.tier) {
        return a.modelName.localeCompare(b.modelName);
      }
      return a.tier.localeCompare(b.tier);
    });
};
