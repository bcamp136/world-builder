import { SUBSCRIPTION_PLANS } from './stripe';
import type { UsageRecord, UserPlanInfo } from '../types';

// In-memory cache for development purposes
// In production, replace with database calls
const userPlansCache: Record<string, UserPlanInfo> = {};

// Get user's subscription plan and usage information
export async function getUserPlanInfo(userId: string): Promise<UserPlanInfo> {
  // In a real application, this would query your database
  
  // For demo purposes, return a cached plan or create a new one
  if (userPlansCache[userId]) {
    return userPlansCache[userId];
  }
  
  // Create a new plan record with default values
  const newPlanInfo: UserPlanInfo = {
    userId,
    planType: SUBSCRIPTION_PLANS.BASIC, // Default to Basic plan
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
  
  userPlansCache[userId] = newPlanInfo;
  return newPlanInfo;
}

// Update user's usage metrics after an AI operation
export async function incrementUsage(userId: string, record: UsageRecord): Promise<void> {
  // Get current plan info
  const planInfo = await getUserPlanInfo(userId);
  
  // Update usage metrics
  planInfo.usage.monthlyRequests++;
  planInfo.usage.dailyRequests++;
  planInfo.usage.tokensUsed += record.tokenCount;
  
  // Add to recent requests (keep only the last 100 for memory efficiency)
  planInfo.usage.recentRequests.push(record);
  if (planInfo.usage.recentRequests.length > 100) {
    planInfo.usage.recentRequests.shift();
  }
  
  // Update the cache (in production, save to database)
  userPlansCache[userId] = planInfo;
  
  // TODO: In production, update the database record
  console.log(`Usage updated for user ${userId}: ${record.operation} using ${record.modelName}`);
}

// Reset daily usage counters (call this at midnight)
export async function resetDailyUsage(): Promise<void> {
  // In production, this would be a database query
  
  // Reset daily counters for all users in the cache
  Object.keys(userPlansCache).forEach(userId => {
    userPlansCache[userId].usage.dailyRequests = 0;
  });
  
  console.log('Daily usage metrics reset');
}

// Reset monthly usage counters (call this on the 1st of each month)
export async function resetMonthlyUsage(): Promise<void> {
  // In production, this would be a database query
  
  // Reset monthly counters for all users in the cache
  Object.keys(userPlansCache).forEach(userId => {
    userPlansCache[userId].usage.monthlyRequests = 0;
    userPlansCache[userId].usage.tokensUsed = 0;
  });
  
  console.log('Monthly usage metrics reset');
}

// Update user's plan when they subscribe or change plans
export async function updateUserPlan(
  userId: string, 
  planType: string, 
  subscriptionId: string,
  status: 'active' | 'trialing' | 'past_due' | 'canceled' | 'incomplete'
): Promise<void> {
  const planInfo = await getUserPlanInfo(userId);
  
  planInfo.planType = planType;
  planInfo.subscriptionId = subscriptionId;
  planInfo.subscriptionStatus = status;
  
  // Update the cache
  userPlansCache[userId] = planInfo;
  
  console.log(`User ${userId} updated to plan ${planType}`);
  
  // TODO: In production, update the database record
}

// Update element count when user creates or deletes world elements
export async function updateElementCount(userId: string, count: number): Promise<void> {
  const planInfo = await getUserPlanInfo(userId);
  
  planInfo.worldElementCount = count;
  
  // Update the cache
  userPlansCache[userId] = planInfo;
  
  console.log(`User ${userId} now has ${count} world elements`);
  
  // TODO: In production, update the database record
}

// Update storage usage when user uploads or deletes files
export async function updateStorageUsage(userId: string, bytesUsed: number): Promise<void> {
  const planInfo = await getUserPlanInfo(userId);
  
  planInfo.usage.storageUsed = bytesUsed;
  
  // Update the cache
  userPlansCache[userId] = planInfo;
  
  console.log(`User ${userId} now using ${bytesUsed} bytes of storage`);
  
  // TODO: In production, update the database record
}
