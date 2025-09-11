import { useState, useEffect, useCallback } from 'react'
import {
  Stack,
  Group,
  Button,
  Title,
  Paper,
  Text,
  Badge,
  Card,
  Alert,
  Progress,
  Tabs,
} from '@mantine/core'
import { RichTextEditor } from '@mantine/tiptap'
import { useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import { notifications } from '@mantine/notifications'
import { modals } from '@mantine/modals'
import {
  IconBrain,
  IconDeviceFloppy,
  IconBook,
  IconClockHour4,
  IconCheck,
  IconAlertCircle,
  IconInfoCircle,
  IconListDetails,
  IconUser,
  IconCalendarTime,
  IconMapPin,
  IconWand,
} from '@tabler/icons-react'
import type { WorldElement, WorldProject, ConsistencyIssue } from '../types'
import { analyzeStory } from '../utils/story-analysis'

interface StoryEditorProps {
  project: WorldProject
  elements: WorldElement[]
  onSave: (storyContent: string) => void
  onAddElements: (elements: WorldElement[]) => void
  onUpdateElements: (elements: WorldElement[]) => void
}

export function StoryEditor({
  project,
  elements,
  onSave,
  onAddElements,
  onUpdateElements,
}: StoryEditorProps) {
  const [content, setContent] = useState(project.storyContent || '')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisProgress, setAnalysisProgress] = useState(0)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [consistencyIssues, setConsistencyIssues] = useState<ConsistencyIssue[]>([])
  const [discoveredElements, setDiscoveredElements] = useState<WorldElement[]>([])
  // Added tab state for switching between editor, elements, and issues views
  const [activeTab, setActiveTab] = useState<string | null>('editor')

  // Initialize the editor with the project's story content
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: 'Begin writing your story here...' }),
    ],
    content,
    onUpdate: ({ editor }) => {
      setContent(editor.getHTML())
    },
  })

  // Handle manual save
  const handleSave = useCallback(() => {
    onSave(content)
    setLastSaved(new Date())
    notifications.show({
      title: 'Story Saved',
      message: 'Your story has been saved successfully.',
      color: 'green',
    })
  }, [content, onSave])

  // Effect to initialize the editor with the project's content
  useEffect(() => {
    if (editor && project.storyContent) {
      editor.commands.setContent(project.storyContent)
    }
  }, [editor, project.storyContent])

  // Auto-save functionality (every 30 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      if (content && content !== project.storyContent) {
        handleSave()
      }
    }, 30000)

    return () => clearInterval(interval)
  }, [content, project.storyContent, handleSave])

  // Handle story analysis with AI
  const handleAnalyzeStory = useCallback(async () => {
    if (!content.trim()) {
      notifications.show({
        title: 'Cannot Analyze',
        message: 'Please write some content before analyzing.',
        color: 'yellow',
      })
      return
    }

    setIsAnalyzing(true)
    setAnalysisProgress(0)
    setConsistencyIssues([])
    setDiscoveredElements([])

    // Set active tab to editor while analyzing
    setActiveTab('editor')

    try {
      // Update progress periodically to show activity
      const progressInterval = setInterval(() => {
        setAnalysisProgress(prev => {
          // Cap at 90% until real completion
          return prev < 90 ? prev + 10 : prev
        })
      }, 2000)

      // Call the AI analysis utility
      const result = await analyzeStory(content, elements, project)

      clearInterval(progressInterval)
      setAnalysisProgress(100)

      if (result.elements.length > 0) {
        setDiscoveredElements(result.elements)

        // Automatically switch to the elements tab
        setActiveTab('elements')

        // Create a more detailed notification with element names
        const elementNames = result.elements
          .map(el => el.title)
          .slice(0, 3)
          .join(', ')

        const moreText =
          result.elements.length > 3 ? ` and ${result.elements.length - 3} more...` : ''

        notifications.show({
          title: 'New World Elements Discovered',
          message: `Found: ${elementNames}${moreText}. Click "Save All Elements" to add them to your world.`,
          color: 'green',
          autoClose: false,
        })
      } else if (result.consistencyIssues.length > 0) {
        // Only switch to issues tab if there are no elements (elements take priority)
        setActiveTab('issues')
      }

      if (result.consistencyIssues.length > 0) {
        setConsistencyIssues(result.consistencyIssues)

        // Create a more detailed notification about issues
        const issueTypes = [...new Set(result.consistencyIssues.map(issue => issue.type))]
          .map(type => type.charAt(0).toUpperCase() + type.slice(1))
          .join(', ')

        notifications.show({
          title: 'Consistency Issues Found',
          message: `Detected ${result.consistencyIssues.length} issues related to: ${issueTypes}. Check the "Consistency Issues" tab.`,
          color: 'yellow',
          autoClose: false,
        })
      }

      // General completion notification
      if (result.elements.length > 0 || result.consistencyIssues.length > 0) {
        notifications.show({
          title: 'Analysis Complete',
          message: `Found ${result.elements.length} world elements and ${result.consistencyIssues.length} consistency issues.`,
          color: 'blue',
        })
      } else {
        notifications.show({
          title: 'Analysis Complete',
          message: 'No new elements or issues were found in your story.',
          color: 'blue',
        })

        // Stay on the editor tab if nothing was found
        setActiveTab('editor')
      }
    } catch (error) {
      notifications.show({
        title: 'Analysis Failed',
        message: error instanceof Error ? error.message : 'An unknown error occurred',
        color: 'red',
      })

      // Return to editor tab on error
      setActiveTab('editor')
    } finally {
      setIsAnalyzing(false)
    }
  }, [content, elements, project, setActiveTab])

  // Handle saving discovered elements
  const handleSaveElements = useCallback(() => {
    // Filter elements into new ones and updates
    const newElements = discoveredElements.filter(
      el => !elements.find(existing => existing.id === el.id)
    )
    const updatedElements = discoveredElements.filter(el =>
      elements.find(existing => existing.id === el.id)
    )

    if (newElements.length) onAddElements(newElements)
    if (updatedElements.length) onUpdateElements(updatedElements)

    setDiscoveredElements([])

    // Switch back to editor tab after saving
    setActiveTab('editor')

    notifications.show({
      title: 'Elements Saved',
      message: `Added ${newElements.length} new elements and updated ${updatedElements.length} existing ones.`,
      color: 'green',
    })
  }, [discoveredElements, elements, onAddElements, onUpdateElements, setActiveTab])

  // Handle loading Alice in Wonderland demo text
  const [isLoadingDemo, setIsLoadingDemo] = useState(false)

  const loadDemoText = useCallback(async () => {
    setIsLoadingDemo(true)

    try {
      // Import the local Alice in Wonderland text file
      const { aliceInWonderland } = await import('../assets/alice')

      // Use the imported text
      let text = aliceInWonderland

      // Clean up the text a bit - remove Project Gutenberg headers and footers
      // Find the actual start of the book content
      const startMarker = "ALICE'S ADVENTURES IN WONDERLAND"
      const endMarker = '*** END OF THE PROJECT GUTENBERG EBOOK'

      const startIndex = text.indexOf(startMarker)
      const endIndex = text.indexOf(endMarker)

      if (startIndex !== -1 && endIndex !== -1) {
        text = text.slice(startIndex, endIndex).trim()
      }

      // Format chapter titles with h2 tags
      text = text.replace(/CHAPTER [IVX]+\. [^\n]+/g, match => `\n\n<h2>${match}</h2>\n\n`)

      // Convert plain text to HTML paragraphs for the editor
      const htmlContent = text
        .split('\n\n')
        .map(paragraph => paragraph.trim())
        .filter(paragraph => paragraph.length > 0)
        .map(paragraph => {
          // Skip paragraphs already wrapped in HTML tags
          if (paragraph.startsWith('<')) return paragraph
          return `<p>${paragraph.replace(/\n/g, ' ')}</p>`
        })
        .join('')

      // Set the content in the editor
      if (editor) {
        editor.commands.setContent(htmlContent)
        setContent(htmlContent)

        // Save it to the project
        onSave(htmlContent)
        setLastSaved(new Date())

        // Ensure we're in the editor tab
        setActiveTab('editor')

        notifications.show({
          title: 'Demo Text Loaded',
          message: "Alice's Adventures in Wonderland has been loaded. Try analyzing it with AI!",
          color: 'blue',
        })
      }
    } catch (error) {
      notifications.show({
        title: 'Failed to Load Demo',
        message: error instanceof Error ? error.message : 'An unknown error occurred',
        color: 'red',
      })
    } finally {
      setIsLoadingDemo(false)
    }
  }, [editor, onSave, setContent, setActiveTab])

  // Show confirmation dialog before loading demo text
  const handleLoadDemoText = useCallback(() => {
    // Check if there's existing content to avoid accidental overwriting
    if (content && content.trim().length > 100) {
      // Use the modals API to confirm
      modals.openConfirmModal({
        title: 'Load Demo Text',
        children: (
          <Text size="sm">
            Loading "Alice's Adventures in Wonderland" will replace your current content. Are you
            sure you want to continue?
          </Text>
        ),
        labels: { confirm: 'Yes, Load Demo', cancel: 'Cancel' },
        confirmProps: { color: 'blue' },
        onConfirm: loadDemoText,
      })
    } else {
      // If there's no significant content, load directly
      loadDemoText()
    }
  }, [content, loadDemoText])

  // Get issue severity color
  const getIssueSeverityColor = (severity: ConsistencyIssue['severity']) => {
    switch (severity) {
      case 'info':
        return 'blue'
      case 'warning':
        return 'yellow'
      case 'error':
        return 'red'
      default:
        return 'gray'
    }
  }

  // Get issue type icon
  const getIssueTypeIcon = (type: ConsistencyIssue['type']) => {
    switch (type) {
      case 'character':
        return <IconUser size={16} />
      case 'timeline':
        return <IconCalendarTime size={16} />
      case 'setting':
        return <IconMapPin size={16} />
      case 'plot':
        return <IconBook size={16} />
      default:
        return <IconInfoCircle size={16} />
    }
  }

  // Automatically switch to elements tab when elements are discovered
  useEffect(() => {
    if (discoveredElements.length > 0 && !isAnalyzing) {
      setActiveTab('elements')
    }
  }, [discoveredElements.length, isAnalyzing, setActiveTab])

  return (
    <Stack gap="md" style={{ display: 'flex', flexDirection: 'column', background: 'inherit' }}>
      <Group justify="space-between">
        <Title order={2}>Story Editor</Title>
        <Group>
          {lastSaved && (
            <Text size="sm" c="dimmed">
              <IconClockHour4 size={14} style={{ marginRight: 5, display: 'inline' }} />
              Last saved: {lastSaved.toLocaleTimeString()}
            </Text>
          )}
          <Button leftSection={<IconDeviceFloppy size={16} />} onClick={handleSave} variant="light">
            Save
          </Button>
          <Button
            leftSection={<IconWand size={16} />}
            onClick={handleLoadDemoText}
            loading={isLoadingDemo}
            variant="outline"
            color="violet"
            title="Load 'Alice in Wonderland' as demo text"
          >
            Load Demo
          </Button>
          <Button
            leftSection={<IconBrain size={16} />}
            onClick={handleAnalyzeStory}
            loading={isAnalyzing}
            disabled={!content.trim()}
            color="blue"
          >
            Analyze with AI
          </Button>
        </Group>
      </Group>

      {/* Analysis progress */}
      {isAnalyzing && (
        <Paper p="xs" withBorder style={{ background: 'var(--mantine-color-body)' }}>
          <Stack gap="xs">
            <Text size="sm">Analyzing story content...</Text>
            <Progress value={analysisProgress} size="sm" />
          </Stack>
        </Paper>
      )}

      {/* Tabbed Interface */}
      <Tabs
        value={activeTab}
        onChange={setActiveTab}
        style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
      >
        <Tabs.List>
          <Tabs.Tab value="editor" leftSection={<IconBook size={16} />}>
            Editor
          </Tabs.Tab>
          <Tabs.Tab
            value="elements"
            leftSection={<IconListDetails size={16} />}
            disabled={discoveredElements.length === 0}
            rightSection={
              discoveredElements.length > 0 ? (
                <Badge size="sm" color="green">
                  {discoveredElements.length}
                </Badge>
              ) : undefined
            }
          >
            Discovered Elements
          </Tabs.Tab>
          <Tabs.Tab
            value="issues"
            leftSection={<IconAlertCircle size={16} />}
            disabled={consistencyIssues.length === 0}
            rightSection={
              consistencyIssues.length > 0 ? (
                <Badge size="sm" color="yellow">
                  {consistencyIssues.length}
                </Badge>
              ) : undefined
            }
          >
            Consistency Issues
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="editor" pt="xs">
          {/* Rich text editor with fixed height and internal scrolling */}
          <Paper p="md" withBorder style={{ background: 'var(--mantine-color-body)' }}>
            {editor && (
              <RichTextEditor editor={editor} style={{ background: 'var(--mantine-color-body)' }}>
                <RichTextEditor.Toolbar sticky stickyOffset={60}>
                  <RichTextEditor.ControlsGroup>
                    <RichTextEditor.Bold />
                    <RichTextEditor.Italic />
                    <RichTextEditor.Underline />
                    <RichTextEditor.Strikethrough />
                    <RichTextEditor.ClearFormatting />
                    <RichTextEditor.Highlight />
                    <RichTextEditor.Code />
                  </RichTextEditor.ControlsGroup>

                  <RichTextEditor.ControlsGroup>
                    <RichTextEditor.H1 />
                    <RichTextEditor.H2 />
                    <RichTextEditor.H3 />
                    <RichTextEditor.H4 />
                  </RichTextEditor.ControlsGroup>

                  <RichTextEditor.ControlsGroup>
                    <RichTextEditor.Blockquote />
                    <RichTextEditor.Hr />
                    <RichTextEditor.BulletList />
                    <RichTextEditor.OrderedList />
                  </RichTextEditor.ControlsGroup>
                </RichTextEditor.Toolbar>

                <RichTextEditor.Content
                  style={{
                    height: '60vh',
                    overflowY: 'auto',
                    background: 'var(--mantine-color-body)',
                  }}
                />
              </RichTextEditor>
            )}
          </Paper>
        </Tabs.Panel>

        <Tabs.Panel value="elements" pt="xs">
          {/* Discovered elements panel with fixed height */}
          {discoveredElements.length > 0 ? (
            <Paper withBorder p="md" style={{ background: 'var(--mantine-color-body)' }}>
              <Group justify="space-between" mb="md">
                <Group>
                  <IconListDetails size={18} />
                  <Title order={3}>Discovered World Elements</Title>
                  <Badge size="lg">{discoveredElements.length}</Badge>
                </Group>
                <Button
                  onClick={handleSaveElements}
                  leftSection={<IconCheck size={16} />}
                  variant="filled"
                  color="green"
                  size="md"
                >
                  Save All Elements
                </Button>
              </Group>

              <Alert color="green" title="Action Required" icon={<IconCheck size={16} />} mb="md">
                These elements were discovered in your story. Review them and click "Save All
                Elements" to add them to your world.
              </Alert>

              <Stack gap="md" style={{ overflowY: 'auto' }}>
                {discoveredElements.map(element => (
                  <Card
                    key={element.id}
                    withBorder
                    shadow="sm"
                    p="md"
                    style={{ background: 'var(--mantine-color-body)' }}
                  >
                    <Group justify="space-between" mb="xs">
                      <Group>
                        <Badge size="lg">{element.type}</Badge>
                        <Title order={4}>{element.title}</Title>
                      </Group>
                      <Text size="sm" c="dimmed" fw={500}>
                        {elements.find(e => e.id === element.id)
                          ? '🔄 Update Existing'
                          : '🆕 New Element'}
                      </Text>
                    </Group>
                    <Text size="sm" mt="xs">
                      {element.content.replace(/<[^>]*>/g, '').substring(0, 250)}...
                    </Text>
                  </Card>
                ))}
              </Stack>
            </Paper>
          ) : (
            <Paper
              withBorder
              p="xl"
              style={{
                height: '60vh',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                background: 'var(--mantine-color-body)',
              }}
            >
              <Text c="dimmed" ta="center">
                No elements have been discovered yet.
                <br />
                Use "Analyze with AI" to detect world elements in your story.
              </Text>
            </Paper>
          )}
        </Tabs.Panel>

        <Tabs.Panel value="issues" pt="xs">
          {/* Consistency issues panel with fixed height */}
          {consistencyIssues.length > 0 ? (
            <Paper withBorder p="md" style={{ background: 'var(--mantine-color-body)' }}>
              <Group mb="md">
                <IconAlertCircle size={18} />
                <Title order={3}>Consistency Issues</Title>
                <Badge size="lg" color="yellow">
                  {consistencyIssues.length}
                </Badge>
              </Group>

              <Alert
                color="yellow"
                title="Issues Detected"
                icon={<IconAlertCircle size={16} />}
                mb="md"
              >
                The AI has detected potential consistency issues in your story. Review them below.
              </Alert>

              <Stack gap="md" style={{ height: '60vh', overflowY: 'auto' }}>
                {consistencyIssues.map((issue, index) => (
                  <Alert
                    key={index}
                    color={getIssueSeverityColor(issue.severity)}
                    title={
                      <Group gap="xs">
                        {getIssueTypeIcon(issue.type)}
                        <Text fw={500}>
                          {issue.type.charAt(0).toUpperCase() + issue.type.slice(1)} Issue
                        </Text>
                      </Group>
                    }
                    icon={<IconAlertCircle size={16} />}
                  >
                    <Text size="sm" fw={500} mb="xs">
                      {issue.description}
                    </Text>
                    {issue.textLocation && (
                      <Text size="sm" fs="italic" mt="xs" c="dimmed">
                        Context: "{issue.textLocation}"
                      </Text>
                    )}
                    {issue.suggestion && (
                      <Text size="sm" mt="md">
                        <strong>Suggestion:</strong> {issue.suggestion}
                      </Text>
                    )}
                  </Alert>
                ))}
              </Stack>
            </Paper>
          ) : (
            <Paper
              withBorder
              p="xl"
              style={{
                height: '60vh',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                background: 'var(--mantine-color-body)',
              }}
            >
              <Text c="dimmed" ta="center">
                No consistency issues have been detected.
                <br />
                Use "Analyze with AI" to check for potential issues in your story.
              </Text>
            </Paper>
          )}
        </Tabs.Panel>
      </Tabs>
    </Stack>
  )
}
