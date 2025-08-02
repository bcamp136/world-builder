import { useState, useEffect } from 'react'
import { 
  Modal, 
  TextInput, 
  Stack, 
  Group, 
  Button, 
  Card,
  MultiSelect,
  Select,
  Text,
  ActionIcon,
  Divider
} from '@mantine/core'
import { useEditor } from '@tiptap/react'
import { StarterKit } from '@tiptap/starter-kit'
import { RichTextEditor } from '@mantine/tiptap'
import { notifications } from '@mantine/notifications'
import { IconWand, IconX, IconDeviceFloppy } from '@tabler/icons-react'
import type { WorldElement, WorldElementType } from '../types'
import { simpleElementTypeOptions } from '../utils/elementTypes'

interface WorldElementEditorProps {
  opened: boolean
  onClose: () => void
  onSave: (element: Partial<WorldElement>) => void
  element?: WorldElement | null
  onAIAssist?: (type: WorldElementType, currentContent: string) => void
}

export function WorldElementEditor({ 
  opened, 
  onClose, 
  onSave, 
  element, 
  onAIAssist 
}: WorldElementEditorProps) {
  const [title, setTitle] = useState('')
  const [type, setType] = useState<WorldElementType>('character')
  const [tags, setTags] = useState<string[]>([])
  const [content, setContent] = useState('')

  const editor = useEditor({
    extensions: [StarterKit],
    content: content,
    onUpdate: ({ editor }) => {
      setContent(editor.getHTML())
    },
  })

  useEffect(() => {
    if (element) {
      setTitle(element.title)
      setType(element.type)
      setTags(element.tags)
      setContent(element.content)
      editor?.commands.setContent(element.content)
    } else {
      // Reset for new element
      setTitle('')
      setType('character')
      setTags([])
      setContent('')
      editor?.commands.setContent('')
    }
  }, [element, editor])

  const handleSave = () => {
    if (!title.trim()) {
      notifications.show({
        title: 'Title Required',
        message: 'Please enter a title for this element.',
        color: 'yellow'
      })
      return
    }

    const elementData: Partial<WorldElement> = {
      title: title.trim(),
      type,
      tags,
      content,
      updatedAt: new Date()
    }

    if (!element) {
      elementData.id = crypto.randomUUID()
      elementData.createdAt = new Date()
    } else {
      elementData.id = element.id
      elementData.createdAt = element.createdAt
    }

    onSave(elementData)
    onClose()
    
    notifications.show({
      title: element ? 'Element Updated' : 'Element Created',
      message: `Your ${type} has been saved successfully.`,
      color: 'green'
    })
  }

  const handleAIAssist = () => {
    if (onAIAssist) {
      onAIAssist(type, content)
    }
  }

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={element ? 'Edit Element' : 'Create New Element'}
      size="xl"
    >
      <Stack>
        <Group grow>
          <TextInput
            label="Title"
            placeholder="Enter a title..."
            value={title}
            onChange={(event) => setTitle(event.currentTarget.value)}
            required
          />
          <Select
            label="Type"
            data={simpleElementTypeOptions}
            value={type}
            onChange={(value) => setType(value as WorldElementType)}
          />
        </Group>

        <MultiSelect
          label="Tags"
          placeholder="Add tags to organize your content..."
          data={tags}
          value={tags}
          onChange={setTags}
          searchable
        />

        <Card withBorder>
          <Group justify="space-between" mb="md">
            <Text fw={500}>Content</Text>
            {onAIAssist && (
              <ActionIcon
                variant="light"
                onClick={handleAIAssist}
                title="AI Assist"
              >
                <IconWand size={16} />
              </ActionIcon>
            )}
          </Group>

          <RichTextEditor editor={editor}>
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
                <RichTextEditor.Subscript />
                <RichTextEditor.Superscript />
              </RichTextEditor.ControlsGroup>

              <RichTextEditor.ControlsGroup>
                <RichTextEditor.Link />
                <RichTextEditor.Unlink />
              </RichTextEditor.ControlsGroup>

              <RichTextEditor.ControlsGroup>
                <RichTextEditor.AlignLeft />
                <RichTextEditor.AlignCenter />
                <RichTextEditor.AlignJustify />
                <RichTextEditor.AlignRight />
              </RichTextEditor.ControlsGroup>

              <RichTextEditor.ControlsGroup>
                <RichTextEditor.Undo />
                <RichTextEditor.Redo />
              </RichTextEditor.ControlsGroup>
            </RichTextEditor.Toolbar>

            <RichTextEditor.Content 
              style={{ minHeight: 300 }}
            />
          </RichTextEditor>
        </Card>

        <Divider />

        <Group justify="flex-end">
          <Button
            variant="light"
            leftSection={<IconX size={16} />}
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            leftSection={<IconDeviceFloppy size={16} />}
            onClick={handleSave}
          >
            Save Element
          </Button>
        </Group>
      </Stack>
    </Modal>
  )
}
