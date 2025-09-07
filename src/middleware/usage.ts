import { PLAN_ENTITLEMENTS, SUBSCRIPTION_PLANS } from '../lib/stripe';
import type { UsageRecord, UserPlanInfo } from '../types';

// Define fallback functions in case module imports fail
// In a real app, this would be properly imported from ../lib/usage
const getUserPlanInfo = async (userId: string): Promise<UserPlanInfo> => {
  // Default implementation as fallback
  return {
    userId,
    planType: SUBSCRIPTION_PLANS.BASIC,
    subscriptionId: null,
    subscriptionStatus: 'active',
    worldElementCount: 0,
    usage: {
      monthlyRequests: 0,
      dailyRequests: 0,
      tokensUsed: 0,
      storageUsed: 0,
      recentRequests: []
    }
  };
};

const incrementUsage = async (userId: string, record: UsageRecord): Promise<void> => {
  console.log(`[Mock] Usage incremented for user ${userId}:`, record);
};

// Interface for AI request parameters
interface AIRequestParams {
  userId: string;
  modelName: string;
  tokenEstimate?: number;
  operation: 'generate' | 'stream' | 'analyze';
}

// Error messages for different limit types
const ERROR_MESSAGES = {
  MODEL_NOT_ALLOWED: 'Your current plan does not have access to this AI model. Please upgrade to use this feature.',
  MONTHLY_LIMIT: 'You\'ve reached your monthly AI request limit. Please upgrade your plan for additional requests.',
  DAILY_LIMIT: 'You\'ve reached your daily AI request limit. Please try again tomorrow or upgrade your plan.',
  RATE_LIMIT: 'Too many requests. Please wait a moment before trying again.',
  STORAGE_LIMIT: 'You\'ve reached your storage limit. Please upgrade your plan for additional storage.',
  ELEMENTS_LIMIT: 'You\'ve reached the maximum number of world elements for your plan. Please upgrade to add more.',
};

// Pre-check middleware to validate AI usage before making the actual call
export const validateAIUsage = async (params: AIRequestParams): Promise<{
  allowed: boolean;
  message?: string;
  userPlan: UserPlanInfo;
}> => {
  const { userId, modelName, operation } = params;

  try {
    // Get user's subscription plan and usage metrics
    const userPlan = await getUserPlanInfo(userId);
    
    // Default to BASIC if no plan is found (e.g., for new users)
    const planType = userPlan.planType || SUBSCRIPTION_PLANS.BASIC;
    const entitlements = PLAN_ENTITLEMENTS[planType];

    // Check 1: Is the requested model allowed for user's plan?
    if (!entitlements.allowedModels.includes(modelName)) {
      return {
        allowed: false,
        message: ERROR_MESSAGES.MODEL_NOT_ALLOWED,
        userPlan
      };
    }

    // Check 2: Has user exceeded monthly request limit?
    if (userPlan.usage.monthlyRequests >= entitlements.requestsPerMonth) {
      return {
        allowed: false,
        message: ERROR_MESSAGES.MONTHLY_LIMIT,
        userPlan
      };
    }

    // Check 3: Has user exceeded daily request limit?
    if (userPlan.usage.dailyRequests >= entitlements.requestsPerDay) {
      return {
        allowed: false,
        message: ERROR_MESSAGES.DAILY_LIMIT,
        userPlan
      };
    }

    // Check 4: Is user making too many requests per minute? (Rate limiting)
    const currentTime = new Date();
    const oneMinuteAgo = new Date(currentTime.getTime() - 60000);
    
    const recentRequests = userPlan.usage.recentRequests.filter(
      (req: UsageRecord) => new Date(req.timestamp) > oneMinuteAgo
    ).length;
    
    if (recentRequests >= entitlements.requestsPerMinute) {
      return {
        allowed: false,
        message: ERROR_MESSAGES.RATE_LIMIT,
        userPlan
      };
    }

    // For world element operations, check if user has reached element limit
    if (operation === 'generate' && userPlan.worldElementCount >= entitlements.elements) {
      return {
        allowed: false,
        message: ERROR_MESSAGES.ELEMENTS_LIMIT,
        userPlan
      };
    }

    // If all checks pass, allow the request and increment usage metrics
    const usageRecord: UsageRecord = {
      operation,
      modelName,
      timestamp: new Date().toISOString(),
      tokenCount: params.tokenEstimate || 0
    };
    
    await incrementUsage(userId, usageRecord);
    
    return {
      allowed: true,
      userPlan
    };
  } catch (error) {
    console.error('Error validating AI usage:', error);
    // Default to allowing the request in case of error checking limits
    // This is a business decision - you might want to be more restrictive
    return {
      allowed: true,
      message: 'Warning: Could not verify usage limits',
      userPlan: {
        userId,
        planType: SUBSCRIPTION_PLANS.BASIC,
        subscriptionId: null,
        subscriptionStatus: 'active',
        worldElementCount: 0,
        usage: {
          monthlyRequests: 0,
          dailyRequests: 0,
          tokensUsed: 0,
          storageUsed: 0,
          recentRequests: []
        }
      }
    };
  }
};

// Check storage limit before upload
export const validateStorageUsage = async (
  userId: string,
  additionalBytes: number
): Promise<{
  allowed: boolean;
  message?: string;
}> => {
  try {
    const userPlan = await getUserPlanInfo(userId);
    
    // Default to BASIC if no plan is found
    const planType = userPlan.planType || SUBSCRIPTION_PLANS.BASIC;
    const entitlements = PLAN_ENTITLEMENTS[planType];
    
    const projectedStorageUsage = userPlan.usage.storageUsed + additionalBytes;
    
    if (projectedStorageUsage > entitlements.storageLimit) {
      return {
        allowed: false,
        message: ERROR_MESSAGES.STORAGE_LIMIT
      };
    }
    
    return {
      allowed: true
    };
  } catch (error) {
    console.error('Error validating storage usage:', error);
    // Default to allowing in case of error
    return {
      allowed: true,
      message: 'Warning: Could not verify storage limits'
    };
  }
};

// Validate element limits before creating new elements
export const validateElementLimit = async (
  userId: string,
  additionalElements: number = 1
): Promise<{
  allowed: boolean;
  message?: string;
}> => {
  try {
    const userPlan = await getUserPlanInfo(userId);
    
    // Default to BASIC if no plan is found
    const planType = userPlan.planType || SUBSCRIPTION_PLANS.BASIC;
    const entitlements = PLAN_ENTITLEMENTS[planType];
    
    const projectedElementCount = userPlan.worldElementCount + additionalElements;
    
    if (projectedElementCount > entitlements.elements) {
      return {
        allowed: false,
        message: ERROR_MESSAGES.ELEMENTS_LIMIT
      };
    }
    
    return {
      allowed: true
    };
  } catch (error) {
    console.error('Error validating element limit:', error);
    // Default to allowing in case of error
    return {
      allowed: true,
      message: 'Warning: Could not verify element limits'
    };
  }
};
