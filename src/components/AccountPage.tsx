import { useState } from 'react';
import {
  Button,
  Card,
  Container,
  Group,
  Stack,
  Text,
  Title,
  Badge,
  List,
  ThemeIcon,
  Progress,
  Paper,
  SimpleGrid
} from '@mantine/core';
import { 
  IconCheck, 
  IconX, 
  IconCrown, 
  IconBrandOpenai, 
  IconRobot
} from '@tabler/icons-react';
import { PLAN_ENTITLEMENTS, SUBSCRIPTION_PLANS } from '../lib/stripe';
import type { UserPlanInfo } from '../types';

interface AccountPageProps {
  userId?: string; // Made optional since it's not used
  userPlan: UserPlanInfo;
  onChangePlan: (planType: string) => void;
}

export function AccountPage({ userPlan, onChangePlan }: AccountPageProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleUpgradePlan = async (planType: string) => {
    setIsLoading(true);
    try {
      // In a real implementation, this would redirect to Stripe Checkout
      await onChangePlan(planType);
    } catch (error) {
      console.error('Error upgrading plan:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getUsagePercentage = (used: number, limit: number) => {
    return Math.min(Math.round((used / limit) * 100), 100);
  };

  // Current user plan entitlements
  const currentPlanType = userPlan.planType || SUBSCRIPTION_PLANS.BASIC;
  const currentPlan = PLAN_ENTITLEMENTS[currentPlanType as keyof typeof PLAN_ENTITLEMENTS];
  
  // Calculate usage percentages
  const storageUsage = getUsagePercentage(
    userPlan.usage.storageUsed,
    currentPlan.storageLimit
  );
  
  const requestsUsage = getUsagePercentage(
    userPlan.usage.monthlyRequests,
    currentPlan.requestsPerMonth
  );
  
  const elementsUsage = getUsagePercentage(
    userPlan.worldElementCount,
    currentPlan.elements
  );

  return (
    <Container size="lg">
      <Stack gap="xl">
        <Title order={1}>Your Account</Title>

        {/* Current Plan */}
        <Card withBorder shadow="sm" padding="lg" radius="md">
          <Stack gap="md">
            <Group justify="space-between">
              <div>
                <Title order={3}>{currentPlan.name} Plan</Title>
                <Text c="dimmed">Subscription ID: {userPlan.subscriptionId || 'Free Tier'}</Text>
              </div>
              <Badge size="lg" variant="filled" color={
                currentPlanType === SUBSCRIPTION_PLANS.ENTERPRISE ? 'violet' :
                currentPlanType === SUBSCRIPTION_PLANS.PRO ? 'blue' : 'teal'
              }>
                {userPlan.subscriptionStatus.toUpperCase()}
              </Badge>
            </Group>
            
            {/* Usage Metrics */}
            <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
              <Paper withBorder p="md" radius="md">
                <Stack gap="xs">
                  <Text size="sm" fw={500}>AI Requests</Text>
                  <Progress value={requestsUsage} color={requestsUsage > 90 ? 'red' : 'blue'} />
                  <Group justify="space-between">
                    <Text size="xs" c="dimmed">
                      {userPlan.usage.monthlyRequests} / {currentPlan.requestsPerMonth === Number.MAX_SAFE_INTEGER ? 'Unlimited' : currentPlan.requestsPerMonth}
                    </Text>
                    <Text size="xs" fw={500}>{requestsUsage}%</Text>
                  </Group>
                </Stack>
              </Paper>
              
              <Paper withBorder p="md" radius="md">
                <Stack gap="xs">
                  <Text size="sm" fw={500}>Storage</Text>
                  <Progress value={storageUsage} color={storageUsage > 90 ? 'red' : 'green'} />
                  <Group justify="space-between">
                    <Text size="xs" c="dimmed">
                      {formatBytes(userPlan.usage.storageUsed)} / {formatBytes(currentPlan.storageLimit)}
                    </Text>
                    <Text size="xs" fw={500}>{storageUsage}%</Text>
                  </Group>
                </Stack>
              </Paper>
              
              <Paper withBorder p="md" radius="md">
                <Stack gap="xs">
                  <Text size="sm" fw={500}>World Elements</Text>
                  <Progress value={elementsUsage} color={elementsUsage > 90 ? 'red' : 'indigo'} />
                  <Group justify="space-between">
                    <Text size="xs" c="dimmed">
                      {userPlan.worldElementCount} / {currentPlan.elements === Number.MAX_SAFE_INTEGER ? 'Unlimited' : currentPlan.elements}
                    </Text>
                    <Text size="xs" fw={500}>{elementsUsage}%</Text>
                  </Group>
                </Stack>
              </Paper>
            </SimpleGrid>
          </Stack>
        </Card>

        {/* Available Plans */}
        <Title order={2}>Pricing Plans</Title>
        
        <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="lg">
          {/* Basic Plan */}
          <PlanCard 
            name="Basic"
            price="$9.99"
            description="Essential tools for small world building projects"
            features={[
              "1,000 AI requests per month",
              "1 GB storage",
              "100 world elements",
              "Basic AI models only",
              "Limited rate: 5 req/min"
            ]}
            limitations={[
              "No advanced AI models",
              "Limited export options"
            ]}
            planType={SUBSCRIPTION_PLANS.BASIC}
            currentPlan={currentPlanType}
            onSelect={handleUpgradePlan}
            isLoading={isLoading}
            icon={<IconRobot size={32} />}
            color="teal"
          />
          
          {/* Pro Plan */}
          <PlanCard
            name="Pro"
            price="$19.99"
            description="Advanced features for serious world builders"
            features={[
              "20,000 AI requests per month",
              "20 GB storage",
              "2,000 world elements",
              "Standard + Advanced AI models",
              "Better rate: 20 req/min"
            ]}
            limitations={[
              "No enterprise AI models"
            ]}
            planType={SUBSCRIPTION_PLANS.PRO}
            currentPlan={currentPlanType}
            onSelect={handleUpgradePlan}
            isLoading={isLoading}
            icon={<IconBrandOpenai size={32} />}
            color="blue"
            isPopular
          />
          
          {/* Enterprise Plan */}
          <PlanCard
            name="Enterprise"
            price="$49.99"
            description="Unlimited world building capabilities"
            features={[
              "Unlimited AI requests",
              "200 GB storage",
              "Unlimited world elements",
              "All AI models including premium",
              "Best rate: 60 req/min"
            ]}
            planType={SUBSCRIPTION_PLANS.ENTERPRISE}
            currentPlan={currentPlanType}
            onSelect={handleUpgradePlan}
            isLoading={isLoading}
            icon={<IconCrown size={32} />}
            color="violet"
          />
        </SimpleGrid>
      </Stack>
    </Container>
  );
}

// Plan card subcomponent
interface PlanCardProps {
  name: string;
  price: string;
  description: string;
  features: string[];
  limitations?: string[];
  planType: string;
  currentPlan: string;
  onSelect: (planType: string) => void;
  isLoading: boolean;
  icon: React.ReactNode;
  color: string;
  isPopular?: boolean;
}

function PlanCard({
  name,
  price,
  description,
  features,
  limitations = [],
  planType,
  currentPlan,
  onSelect,
  isLoading,
  icon,
  color,
  isPopular = false
}: PlanCardProps) {
  const isCurrentPlan = planType === currentPlan;

  return (
    <Card 
      withBorder 
      shadow={isPopular ? 'md' : 'sm'} 
      padding="lg" 
      radius="md"
      style={{
        borderColor: isPopular ? `var(--mantine-color-${color}-6)` : undefined,
        transform: isPopular ? 'scale(1.05)' : undefined,
      }}
    >
      {isPopular && (
        <Badge
          color={color}
          variant="filled"
          style={{
            position: 'absolute',
            top: -10,
            right: 20
          }}
        >
          Most Popular
        </Badge>
      )}
      
      <Stack gap="md">
        <Group>
          <ThemeIcon size="xl" color={color} variant="light" radius="md">
            {icon}
          </ThemeIcon>
          <div>
            <Title order={3}>{name}</Title>
            <Text fw={700} size="xl">{price}<Text span size="sm">/month</Text></Text>
          </div>
        </Group>
        
        <Text c="dimmed" size="sm">{description}</Text>
        
        <List
          spacing="xs"
          size="sm"
          center
          icon={
            <ThemeIcon color={color} size={20} radius="xl">
              <IconCheck size={14} />
            </ThemeIcon>
          }
        >
          {features.map((feature, index) => (
            <List.Item key={index}>{feature}</List.Item>
          ))}
        </List>
        
        {limitations.length > 0 && (
          <List
            spacing="xs"
            size="sm"
            center
            icon={
              <ThemeIcon color="gray" size={20} radius="xl">
                <IconX size={14} />
              </ThemeIcon>
            }
          >
            {limitations.map((limitation, index) => (
              <List.Item key={index} c="dimmed">{limitation}</List.Item>
            ))}
          </List>
        )}
        
        <Button 
          variant={isCurrentPlan ? 'light' : 'filled'} 
          color={color}
          fullWidth
          onClick={() => onSelect(planType)}
          loading={isLoading}
          disabled={isCurrentPlan}
        >
          {isCurrentPlan ? 'Current Plan' : 'Upgrade'}
        </Button>
      </Stack>
    </Card>
  );
}
