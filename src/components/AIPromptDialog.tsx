import { useState } from 'react'
import {
  Modal,
  Text,
  Textarea,
  Button,
  Group,
  Select,
  Stack,
  Card,
  Divider,
  LoadingOverlay,
  Alert
} from '@mantine/core'
import { IconBrain, IconInfoCircle, IconWand } from '@tabler/icons-react'
import { notifications } from '@mantine/notifications'
import { promptTemplates, generateWorldElement, isAIConfigured } from '../utils/ai'
import type { WorldElementType } from '../types'

interface AIPromptDialogProps {
  opened: boolean
  onClose: () => void
  onGenerated: (content: string, type: WorldElementType) => void
  initialType?: WorldElementType
  contextElements?: string[]
}

export function AIPromptDialog({ 
  opened, 
  onClose, 
  onGenerated, 
  initialType = 'character',
  contextElements = []
}: AIPromptDialogProps) {
  const [selectedType, setSelectedType] = useState<WorldElementType>(initialType)
  const [userPrompt, setUserPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [provider, setProvider] = useState<'openai' | 'anthropic'>('openai')

  const selectedTemplate = promptTemplates.find(t => t.type === selectedType)

  const handleGenerate = async () => {
    if (!userPrompt.trim()) {
      notifications.show({
        title: 'Prompt Required',
        message: 'Please enter a prompt to generate content.',
        color: 'yellow'
      })
      return
    }

    if (!isAIConfigured()) {
      notifications.show({
        title: 'AI Not Configured',
        message: 'Please add your AI API keys to the .env file to use AI features.',
        color: 'red'
      })
      return
    }

    setIsGenerating(true)
    try {
      const additionalContext = contextElements.length > 0 
        ? contextElements.join('\n\n') 
        : undefined

      const content = await generateWorldElement(
        selectedType,
        userPrompt,
        provider,
        additionalContext
      )

      onGenerated(content, selectedType)
      setUserPrompt('')
      onClose()

      notifications.show({
        title: 'Content Generated!',
        message: 'Your AI-generated content is ready for editing.',
        color: 'green'
      })
    } catch (error) {
      notifications.show({
        title: 'Generation Failed',
        message: error instanceof Error ? error.message : 'Failed to generate content',
        color: 'red'
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const elementOptions = promptTemplates.map(template => ({
    value: template.type,
    label: template.name
  }))

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group>
          <IconBrain size={20} />
          <Text fw={600}>AI World Builder Assistant</Text>
        </Group>
      }
      size="lg"
      centered
    >
      <Stack>
        {!isAIConfigured() && (
          <Alert
            icon={<IconInfoCircle size={16} />}
            title="AI Configuration Required"
            color="yellow"
          >
            To use AI features, add your API keys to a .env file:
            <br />
            <code>VITE_OPENAI_API_KEY=your_key_here</code>
            <br />
            <code>VITE_ANTHROPIC_API_KEY=your_key_here</code>
          </Alert>
        )}

        <Group grow>
          <Select
            label="Content Type"
            data={elementOptions}
            value={selectedType}
            onChange={(value) => setSelectedType(value as WorldElementType)}
          />
          <Select
            label="AI Provider"
            data={[
              { value: 'openai', label: 'OpenAI GPT-4' },
              { value: 'anthropic', label: 'Anthropic Claude' }
            ]}
            value={provider}
            onChange={(value) => setProvider(value as 'openai' | 'anthropic')}
          />
        </Group>

        {selectedTemplate && (
          <Card withBorder>
            <Text size="sm" fw={500} mb="xs">
              {selectedTemplate.name}
            </Text>
            <Text size="xs" c="dimmed">
              {selectedTemplate.description}
            </Text>
          </Card>
        )}

        <Textarea
          label="Your Prompt"
          placeholder="Describe what you want to create... (e.g., 'A mysterious wizard who lives in a tower')"
          value={userPrompt}
          onChange={(event) => setUserPrompt(event.currentTarget.value)}
          minRows={3}
          maxRows={6}
          autosize
        />

        {contextElements.length > 0 && (
          <>
            <Divider label="Using context from existing elements" />
            <Text size="sm" c="dimmed">
              The AI will consider {contextElements.length} existing world element(s) for consistency.
            </Text>
          </>
        )}

        <Group justify="flex-end">
          <Button variant="light" onClick={onClose}>
            Cancel
          </Button>
          <Button
            leftSection={<IconWand size={16} />}
            onClick={handleGenerate}
            loading={isGenerating}
            disabled={!isAIConfigured()}
          >
            Generate Content
          </Button>
        </Group>
      </Stack>

      <LoadingOverlay visible={isGenerating} overlayProps={{ radius: 'sm', blur: 2 }} />
    </Modal>
  )
}
