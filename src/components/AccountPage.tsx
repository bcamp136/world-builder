// Clean, rebuilt AccountPage implementation (previous file was corrupted by merge conflicts)
import { useEffect, useState } from 'react'
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
  SimpleGrid,
  TextInput,
} from '@mantine/core'
import { IconCheck, IconCrown, IconBrandOpenai, IconRobot } from '@tabler/icons-react'
import { PLAN_ENTITLEMENTS, SUBSCRIPTION_PLANS } from '../lib/stripe'
import { CheckoutButton } from './CheckoutButton'
import { useAuth } from '../context/AuthContext'
import type { UserPlanInfo } from '../types'

interface AccountPageProps {
  userPlan: UserPlanInfo
}

export function AccountPage({ userPlan }: AccountPageProps) {
  const { user, signup, login, logout, loading } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [creatingCustomer, setCreatingCustomer] = useState(false)
  const [stripeCustomerId, setStripeCustomerId] = useState<string | undefined>(undefined)

  // After auth, ensure stripe customer exists (lazy create)
  useEffect(() => {
    const ensureCustomer = async () => {
      if (!user || stripeCustomerId) return
      try {
        setCreatingCustomer(true)
        // Use simple demo auth header with uid. In production: send Firebase ID token.
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || ''}/api/create-stripe-customer`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${user.uid}` },
        })
        const data = await res.json()
        if (data.stripeCustomerId) {
          setStripeCustomerId(data.stripeCustomerId)
        }
      } catch (e: any) {
        console.error('Failed to ensure stripe customer', e)
      } finally {
        setCreatingCustomer(false)
      }
    }
    ensureCustomer()
  }, [user, stripeCustomerId])

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }
  const pct = (used: number, limit: number) => Math.min(Math.round((used / limit) * 100), 100)

  const planType = userPlan.planType || SUBSCRIPTION_PLANS.BASIC
  const plan = PLAN_ENTITLEMENTS[planType as keyof typeof PLAN_ENTITLEMENTS]

  const storageUsage = pct(userPlan.usage.storageUsed, plan.storageLimit)
  const requestsUsage = pct(userPlan.usage.monthlyRequests, plan.requestsPerMonth)
  const elementsUsage = pct(userPlan.worldElementCount, plan.elements)

  return (
    <Container size="lg">
      <Stack gap="xl">
        <Title order={1}>Your Account</Title>

        <Card withBorder padding="lg" radius="md">
          <Stack gap="sm">
            <Title order={4}>Authentication</Title>
            {loading ? (
              <Text size="sm">Loading session...</Text>
            ) : !user ? (
              <Stack gap="xs">
                <TextInput
                  label="Email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.currentTarget.value)}
                />
                <TextInput
                  label="Password"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.currentTarget.value)}
                />
                {error && (
                  <Text size="xs" c="red">
                    {error}
                  </Text>
                )}
                <Group>
                  <Button
                    onClick={async () => {
                      try {
                        setError(null)
                        await signup(email, password)
                      } catch (e: any) {
                        setError(e.message)
                      }
                    }}
                    disabled={!email || !password}
                  >
                    Sign Up
                  </Button>
                  <Button
                    variant="light"
                    onClick={async () => {
                      try {
                        setError(null)
                        await login(email, password)
                      } catch (e: any) {
                        setError(e.message)
                      }
                    }}
                    disabled={!email || !password}
                  >
                    Log In
                  </Button>
                </Group>
                <Text size="xs" c="dimmed">
                  Your account is stored in Firebase; a Stripe customer is created on first need.
                </Text>
              </Stack>
            ) : (
              <Group justify="space-between" align="flex-start">
                <Stack gap={2}>
                  <Text size="sm">Signed in as {user.email}</Text>
                  <Text size="xs" c="dimmed">
                    Stripe Customer: {stripeCustomerId || 'Creating...' }
                  </Text>
                </Stack>
                <Button size="xs" variant="subtle" onClick={logout} disabled={creatingCustomer}>
                  Log Out
                </Button>
              </Group>
            )}
          </Stack>
        </Card>

        <Card withBorder padding="lg" radius="md">
          <Stack gap="md">
            <Group justify="space-between">
              <div>
                <Title order={3}>{plan.name} Plan</Title>
                <Text c="dimmed">Subscription ID: {userPlan.subscriptionId || 'None'}</Text>
              </div>
              <Badge
                size="lg"
                variant="filled"
                color={
                  planType === SUBSCRIPTION_PLANS.ENTERPRISE
                    ? 'violet'
                    : planType === SUBSCRIPTION_PLANS.PRO
                      ? 'blue'
                      : 'teal'
                }
              >
                {userPlan.subscriptionStatus.toUpperCase()}
              </Badge>
            </Group>
            <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
              <UsageCard
                title="AI Requests"
                percent={requestsUsage}
                valueLabel={`${userPlan.usage.monthlyRequests} / ${
                  plan.requestsPerMonth === Number.MAX_SAFE_INTEGER
                    ? 'Unlimited'
                    : plan.requestsPerMonth
                }`}
                color="blue"
              />
              <UsageCard
                title="Storage"
                percent={storageUsage}
                valueLabel={`${formatBytes(userPlan.usage.storageUsed)} / ${formatBytes(
                  plan.storageLimit
                )}`}
                color="green"
              />
              <UsageCard
                title="World Elements"
                percent={elementsUsage}
                valueLabel={`${userPlan.worldElementCount} / ${
                  plan.elements === Number.MAX_SAFE_INTEGER ? 'Unlimited' : plan.elements
                }`}
                color="indigo"
              />
            </SimpleGrid>
          </Stack>
        </Card>

        <Title order={2}>Pricing Plans</Title>
        <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="lg">
          <PlanCard
            name="Basic"
            price="$9.99"
            description="Essential world building capabilities for hobbyists."
            features={['1,000 AI requests', '50 / day', 'GPT-4o Mini', '100 elements', '1GB storage']}
            planType={SUBSCRIPTION_PLANS.BASIC}
            currentPlan={planType}
            icon={<IconRobot size={28} />}
            color="blue"
            stripeCustomerId={stripeCustomerId}
          />
          <PlanCard
            name="Pro"
            price="$19.99"
            description="Advanced features for serious world builders."
            features={[
              '20k AI requests',
              '500 / day',
              'GPT-4o & Claude Sonnet',
              '2,000 elements',
              '20GB storage',
            ]}
            planType={SUBSCRIPTION_PLANS.PRO}
            currentPlan={planType}
            icon={<IconBrandOpenai size={28} />}
            color="violet"
            isPopular
            stripeCustomerId={stripeCustomerId}
          />
          <PlanCard
            name="Enterprise"
            price="$49.99"
            description="Unlimited capabilities for professionals."
            features={['Unlimited AI', 'All premium models', 'Unlimited elements', '200GB storage']}
            planType={SUBSCRIPTION_PLANS.ENTERPRISE}
            currentPlan={planType}
            icon={<IconCrown size={28} />}
            color="gold"
            stripeCustomerId={stripeCustomerId}
          />
        </SimpleGrid>
      </Stack>
    </Container>
  )
}

interface UsageCardProps {
  title: string
  percent: number
  valueLabel: string
  color: string
}

function UsageCard({ title, percent, valueLabel, color }: UsageCardProps) {
  return (
    <Paper withBorder p="md" radius="md">
      <Stack gap="xs">
        <Text size="sm" fw={500}>
          {title}
        </Text>
        <Progress value={percent} color={percent > 90 ? 'red' : color} />
        <Group justify="space-between">
          <Text size="xs" c="dimmed">
            {valueLabel}
          </Text>
          <Text size="xs" fw={500}>
            {percent}%
          </Text>
        </Group>
      </Stack>
    </Paper>
  )
}

interface PlanCardProps {
  name: string
  price: string
  description: string
  features: string[]
  planType: string
  currentPlan: string
  icon: React.ReactNode
  color: string
  isPopular?: boolean
  stripeCustomerId?: string | null
}

function PlanCard({
  name,
  price,
  description,
  features,
  planType,
  currentPlan,
  icon,
  color,
  isPopular = false,
  stripeCustomerId,
}: PlanCardProps) {
  const isCurrent = planType === currentPlan
  return (
    <Card
      withBorder
      shadow={isPopular ? 'md' : 'sm'}
      padding="lg"
      radius="md"
      style={{ position: 'relative', borderColor: isPopular ? `var(--mantine-color-${color}-6)` : undefined }}
    >
      {isPopular && (
        <Badge color={color} variant="filled" style={{ position: 'absolute', top: -10, right: 20 }}>
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
            <Text fw={700} size="xl">
              {price}
              <Text span size="sm">
                /month
              </Text>
            </Text>
          </div>
        </Group>
        <Text c="dimmed" size="sm">
          {description}
        </Text>
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
          {features.map(f => (
            <List.Item key={f}>{f}</List.Item>
          ))}
        </List>
        {isCurrent ? (
          <Button variant="light" fullWidth disabled>
            Current Plan
          </Button>
        ) : (
          <CheckoutButton
            priceId={import.meta.env[`VITE_STRIPE_PRICE_ID_${planType.toUpperCase()}`] || ''}
            customerId={stripeCustomerId || undefined}
            planName={name}
          />
        )}
      </Stack>
    </Card>
  )
}
