import { useState, useMemo, useEffect } from 'react'
import { 
  AppShell, 
  Burger, 
  Group, 
  Text, 
  Container, 
  Title, 
  Stack, 
  Button,
  SimpleGrid,
  TextInput,
  Select,
  Tabs,
  Paper,
  Center,
  ThemeIcon
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { modals } from '@mantine/modals'
import { 
  IconPlus, 
  IconBrain, 
  IconSearch,
  IconFilter,
  IconWorldWww,
  IconUser,
  IconNote,
  IconMountain,
  IconCrown,
  IconWand,
  IconSword,
  IconCoins,
  IconSparkles,
  IconShield,
  IconBook
} from '@tabler/icons-react'
import { WorldElementCard } from './components/WorldElementCard'
import { WorldElementEditorContent } from './components/WorldElementEditorContent'
import { AIPromptDialogContent } from './components/AIPromptDialogContent'
import { FileManager } from './components/FileManager'
import { StoryEditor } from './components/StoryEditor'
import { 
  saveToStorage,
  createProject
} from './utils/storage'
import { simpleElementTypeOptions } from './utils/elementTypes'
import type { WorldElement, WorldElementType, WorldProject } from './types'

function App() {
  const [opened, { toggle }] = useDisclosure()
  const [elements, setElements] = useState<WorldElement[]>([])
  const [currentProject, setCurrentProject] = useState<WorldProject | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<string | null>('all')
  const [activeView, setActiveView] = useState<'elements' | 'story'>('elements')

  // Initialize with a default project
  useEffect(() => {
    const defaultProject = createProject('Untitled Project', 'A new world building project')
    setCurrentProject(defaultProject)
  }, [])

  // Auto-save when elements change
  useEffect(() => {
    if (currentProject && elements.length >= 0) {
      // Auto-save will be handled by FileManager when file is opened
      saveToStorage({
        projects: [],
        elements,
        currentProjectId: currentProject.id
      }, currentProject.id)
    }
  }, [elements, currentProject])

  // Filter elements based on search and type
  const filteredElements = useMemo(() => {
    return elements.filter(element => {
      const matchesSearch = element.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           element.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           element.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      
      const matchesType = !typeFilter || typeFilter === 'all' || element.type === typeFilter
      
      // Define category groups
      const categoryGroups: Record<string, WorldElementType[]> = {
        all: [],
        geography: ['landscape', 'climate', 'map', 'nation', 'city', 'landmark'],
        cultures: ['race', 'species', 'social-structure', 'language', 'tradition', 'custom'],
        politics: ['government', 'ruler', 'faction', 'organization', 'law', 'justice-system'],
        history: ['historical-event', 'legend', 'myth', 'hero', 'creation-story', 'prophecy'],
        magic: ['power-system', 'magic-system', 'technology', 'artifact', 'invention', 'magical-rule'],
        creatures: ['intelligent-species', 'creature', 'monster', 'supernatural-entity'],
        religion: ['belief-system', 'deity', 'spiritual-force', 'religious-institution', 'philosophy'],
        conflict: ['war', 'conflict', 'military-force', 'strategy', 'threat', 'antagonist'],
        characters: ['character', 'npc', 'important-figure', 'relationship'],
        economy: ['trade-system', 'currency', 'resource', 'industry', 'economic-class'],
        general: ['note', 'timeline', 'plot', 'lore']
      }
      
      const matchesTab = activeTab === 'all' || 
                        (categoryGroups[activeTab || '']?.includes(element.type))
      
      return matchesSearch && matchesType && matchesTab
    })
  }, [elements, searchQuery, typeFilter, activeTab])

  // Group elements by type for stats
  const elementStats = useMemo(() => {
    const stats: Record<string, number> = {}
    elements.forEach(element => {
      stats[element.type] = (stats[element.type] || 0) + 1
    })
    return stats
  }, [elements])

  const handleSaveElement = (elementData: Partial<WorldElement>, isEditing: boolean, editingId?: string) => {
    if (isEditing && editingId) {
      // Update existing element
      setElements(prev => prev.map(el => 
        el.id === editingId ? { ...el, ...elementData } as WorldElement : el
      ))
    } else {
      // Create new element
      setElements(prev => [...prev, elementData as WorldElement])
    }
  }

  const handleEditElement = (element: WorldElement) => {
    modals.open({
      modalId: 'world-element-editor',
      title: 'Edit Element',
      size: 'xl',
      children: (
        <WorldElementEditorContent
          element={element}
          onSave={(elementData: Partial<WorldElement>) => {
            handleSaveElement(elementData, true, element.id)
            modals.close('world-element-editor')
          }}
          onCancel={() => modals.close('world-element-editor')}
          onAIAssist={() => {
            modals.close('world-element-editor')
            openAIDialog()
          }}
        />
      ),
    })
  }

  const handleDeleteElement = (id: string) => {
    setElements(prev => prev.filter(el => el.id !== id))
  }

  const handleDuplicateElement = (element: WorldElement) => {
    const duplicated: WorldElement = {
      ...element,
      id: crypto.randomUUID(),
      title: `${element.title} (Copy)`,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    setElements(prev => [...prev, duplicated])
  }

  const handleConnectElement = (element: WorldElement) => {
    // TODO: Implement connection functionality
    console.log('Connect element:', element)
  }

  // File management functions
  const handleProjectLoad = (project: WorldProject, projectElements: WorldElement[]) => {
    setCurrentProject(project)
    setElements(projectElements)
  }

  const handleProjectSave = () => {
    if (currentProject) {
      setCurrentProject({
        ...currentProject,
        updatedAt: new Date()
      })
    }
  }
  
  const handleSaveStory = (storyContent: string) => {
    if (currentProject) {
      const updatedProject = {
        ...currentProject,
        storyContent,
        updatedAt: new Date()
      }
      
      setCurrentProject(updatedProject)
      
      // Save to storage
      saveToStorage({
        projects: [],
        elements,
        currentProjectId: updatedProject.id
      }, updatedProject.id)
    }
  }

  const handleAIGenerated = (content: string, type: WorldElementType) => {
    const newElement: WorldElement = {
      id: crypto.randomUUID(),
      title: `New ${type.replace('-', ' ')}`,
      content,
      type,
      tags: [],
      createdAt: new Date(),
      updatedAt: new Date()
    }
    setElements(prev => [...prev, newElement])
  }

  const openAIDialog = () => {
    modals.open({
      modalId: 'ai-prompt-dialog',
      title: 'AI World Builder Assistant',
      size: 'lg',
      children: (
        <AIPromptDialogContent
          onGenerated={(content, type) => {
            handleAIGenerated(content, type)
            modals.close('ai-prompt-dialog')
          }}
          onCancel={() => modals.close('ai-prompt-dialog')}
          contextElements={elements.map(el => `${el.title}: ${el.content.replace(/<[^>]*>/g, '').substring(0, 200)}...`)}
        />
      ),
    })
  }

  const handleNewElement = () => {
    modals.open({
      modalId: 'world-element-editor-new',
      title: 'Create New Element',
      size: 'xl',
      children: (
        <WorldElementEditorContent
          onSave={(elementData: Partial<WorldElement>) => {
            handleSaveElement(elementData, false)
            modals.close('world-element-editor-new')
          }}
          onCancel={() => modals.close('world-element-editor-new')}
          onAIAssist={() => {
            modals.close('world-element-editor-new')
            openAIDialog()
          }}
        />
      ),
    })
  }

  const typeOptions = [
    { value: 'all', label: 'All Types' },
    ...simpleElementTypeOptions
  ]

  const EmptyState = () => {
    if (!currentProject) {
      return (
        <Center py={60}>
          <Stack align="center" gap="md">
            <ThemeIcon size={60} variant="light">
              <IconWorldWww size={30} />
            </ThemeIcon>
            <Stack align="center" gap="xs">
              <Title order={3}>Open or Create a Project</Title>
              <Text c="dimmed" ta="center" maw={400}>
                Use the file menu above to create a new project or open an existing one to start building your world.
              </Text>
            </Stack>
          </Stack>
        </Center>
      )
    }

    return (
      <Center py={60}>
        <Stack align="center" gap="md">
          <ThemeIcon size={60} variant="light">
            <IconWorldWww size={30} />
          </ThemeIcon>
          <Stack align="center" gap="xs">
            <Title order={3}>Start Building Your World</Title>
            <Text c="dimmed" ta="center" maw={400}>
              Create characters, places, events, and more to bring your fictional world to life. 
              Use AI assistance to generate rich, detailed content.
            </Text>
          </Stack>
          <Group>
            <Button leftSection={<IconPlus size={16} />} onClick={handleNewElement}>
              Create Element
            </Button>
            <Button 
              variant="light" 
              leftSection={<IconBrain size={16} />} 
              onClick={openAIDialog}
            >
              AI Generate
            </Button>
          </Group>
        </Stack>
      </Center>
    )
  }

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ width: 300, breakpoint: 'sm', collapsed: { mobile: !opened } }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md">
          <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
          <Group>
            <IconWorldWww size={28} color="#228be6" />
            <Text size="xl" fw={600}>World Builder</Text>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <Stack>
          <Title order={4}>World Elements</Title>
          
          <Paper p="sm" withBorder>
            <Text size="sm" fw={500} mb="xs">Statistics</Text>
            <Stack gap="xs">
              <Group justify="space-between">
                <Text size="xs" c="dimmed">Total Elements</Text>
                <Text size="sm" fw={500}>{elements.length}</Text>
              </Group>
              {Object.entries(elementStats).map(([type, count]) => (
                <Group key={type} justify="space-between">
                  <Text size="xs" c="dimmed" tt="capitalize">
                    {type.replace('-', ' ')}s
                  </Text>
                  <Text size="sm">{count}</Text>
                </Group>
              ))}
            </Stack>
          </Paper>

          <Button.Group orientation="vertical">
            <Button 
              variant="light" 
              leftSection={<IconPlus size={16} />}
              onClick={handleNewElement}
              fullWidth
            >
              New Element
            </Button>
            <Button 
              variant="outline" 
              leftSection={<IconBrain size={16} />}
              onClick={openAIDialog}
              fullWidth
            >
              AI Generate
            </Button>
          </Button.Group>
        </Stack>
      </AppShell.Navbar>

      <AppShell.Main>
        <Container size="xl" px={0}>
          <Stack>
            {/* File Manager */}
            <Paper p="md" withBorder>
              <Stack gap="sm">
                <Group justify="space-between">
                  <Text fw={600}>Project</Text>
                  <Text size="sm" c="dimmed">
                    {currentProject ? `${elements.length} elements` : 'No project loaded'}
                  </Text>
                </Group>
                <FileManager
                  currentProject={currentProject}
                  elements={elements}
                  onProjectLoad={handleProjectLoad}
                  onProjectSave={handleProjectSave}
                />
                {currentProject && (
                  <Text size="sm" c="dimmed">
                    {currentProject.name} {currentProject.description && `- ${currentProject.description}`}
                  </Text>
                )}
              </Stack>
            </Paper>

            {currentProject && (
              <>
                {/* Header Actions */}
                <Group justify="space-between" align="center">
                  <Title order={1}>{activeView === 'elements' ? 'World Elements' : 'Story Editor'}</Title>
                  <Group>
                    <Button.Group>
                      <Button 
                        variant={activeView === 'elements' ? 'filled' : 'light'}
                        leftSection={<IconWorldWww size={16} />}
                        onClick={() => setActiveView('elements')}
                      >
                        Elements
                      </Button>
                      <Button 
                        variant={activeView === 'story' ? 'filled' : 'light'}
                        leftSection={<IconBook size={16} />}
                        onClick={() => setActiveView('story')}
                      >
                        Story
                      </Button>
                    </Button.Group>
                    
                    {activeView === 'elements' && (
                      <>
                        <Button 
                          leftSection={<IconPlus size={16} />}
                          onClick={handleNewElement}
                        >
                          Create New
                        </Button>
                        <Button 
                          variant="light"
                          leftSection={<IconBrain size={16} />}
                          onClick={openAIDialog}
                        >
                          AI Generate
                        </Button>
                      </>
                    )}
                  </Group>
                </Group>

                {activeView === 'elements' && (
                  <>
                    {/* Search and Filters */}
                    <Group>
                      <TextInput
                        placeholder="Search elements..."
                        leftSection={<IconSearch size={16} />}
                        value={searchQuery}
                        onChange={(event) => setSearchQuery(event.currentTarget.value)}
                        style={{ flex: 1 }}
                      />
                      <Select
                        placeholder="Filter by type"
                        leftSection={<IconFilter size={16} />}
                        data={typeOptions}
                        value={typeFilter}
                        onChange={setTypeFilter}
                        clearable
                        w={200}
                      />
                    </Group>

                    {/* Element Type Tabs */}
                    <Tabs value={activeTab} onChange={setActiveTab}>
                      <Tabs.List>
                        <Tabs.Tab value="all" leftSection={<IconWorldWww size={16} />}>
                          All ({elements.length})
                        </Tabs.Tab>
                        <Tabs.Tab value="geography" leftSection={<IconMountain size={16} />}>
                          Geography ({['landscape', 'climate', 'map', 'nation', 'city', 'landmark'].reduce((acc, type) => acc + (elementStats[type] || 0), 0)})
                        </Tabs.Tab>
                        <Tabs.Tab value="cultures" leftSection={<IconUser size={16} />}>
                          Cultures ({['race', 'species', 'social-structure', 'language', 'tradition', 'custom'].reduce((acc, type) => acc + (elementStats[type] || 0), 0)})
                        </Tabs.Tab>
                        <Tabs.Tab value="politics" leftSection={<IconCrown size={16} />}>
                          Politics ({['government', 'ruler', 'faction', 'organization', 'law', 'justice-system'].reduce((acc, type) => acc + (elementStats[type] || 0), 0)})
                        </Tabs.Tab>
                        <Tabs.Tab value="history" leftSection={<IconSword size={16} />}>
                          History ({['historical-event', 'legend', 'myth', 'hero', 'creation-story', 'prophecy'].reduce((acc, type) => acc + (elementStats[type] || 0), 0)})
                        </Tabs.Tab>
                        <Tabs.Tab value="magic" leftSection={<IconWand size={16} />}>
                          Magic/Tech ({['power-system', 'magic-system', 'technology', 'artifact', 'invention', 'magical-rule'].reduce((acc, type) => acc + (elementStats[type] || 0), 0)})
                        </Tabs.Tab>
                        <Tabs.Tab value="creatures" leftSection={<IconShield size={16} />}>
                          Creatures ({['intelligent-species', 'creature', 'monster', 'supernatural-entity'].reduce((acc, type) => acc + (elementStats[type] || 0), 0)})
                        </Tabs.Tab>
                        <Tabs.Tab value="religion" leftSection={<IconSparkles size={16} />}>
                          Religion ({['belief-system', 'deity', 'spiritual-force', 'religious-institution', 'philosophy'].reduce((acc, type) => acc + (elementStats[type] || 0), 0)})
                        </Tabs.Tab>
                        <Tabs.Tab value="conflict" leftSection={<IconSword size={16} />}>
                          Conflict ({['war', 'conflict', 'military-force', 'strategy', 'threat'].reduce((acc, type) => acc + (elementStats[type] || 0), 0)})
                        </Tabs.Tab>
                        <Tabs.Tab value="characters" leftSection={<IconUser size={16} />}>
                          Characters ({['character', 'npc', 'important-figure', 'relationship', 'antagonist', 'protagonist'].reduce((acc, type) => acc + (elementStats[type] || 0), 0)})
                        </Tabs.Tab>
                        <Tabs.Tab value="economy" leftSection={<IconCoins size={16} />}>
                          Economy ({['trade-system', 'currency', 'resource', 'industry', 'economic-class'].reduce((acc, type) => acc + (elementStats[type] || 0), 0)})
                        </Tabs.Tab>
                        <Tabs.Tab value="general" leftSection={<IconNote size={16} />}>
                          General ({['note', 'timeline', 'plot', 'lore'].reduce((acc, type) => acc + (elementStats[type] || 0), 0)})
                        </Tabs.Tab>
                      </Tabs.List>
                    </Tabs>
                    
                    {/* Elements Grid */}
                    {filteredElements.length === 0 ? (
                      <EmptyState />
                    ) : (
                      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
                        {filteredElements.map((element) => (
                          <WorldElementCard
                            key={element.id}
                            element={element}
                            onEdit={handleEditElement}
                            onDelete={handleDeleteElement}
                            onDuplicate={handleDuplicateElement}
                            onConnect={handleConnectElement}
                          />
                        ))}
                      </SimpleGrid>
                    )}
                  </>
                )}
                
                {activeView === 'story' && (
                  <StoryEditor 
                    project={currentProject}
                    elements={elements}
                    onSave={handleSaveStory}
                    onAddElements={(newElements) => {
                      setElements(prev => [...prev, ...newElements])
                    }}
                    onUpdateElements={(updatedElements) => {
                      setElements(prev => 
                        prev.map(el => {
                          const updated = updatedElements.find(u => u.id === el.id)
                          return updated ? { ...el, ...updated } : el
                        })
                      )
                    }}
                  />
                )}
              </>
            )}
            
            {!currentProject && (
              <EmptyState />
            )}
          </Stack>
        </Container>
      </AppShell.Main>
    </AppShell>
  )
}

export default App
